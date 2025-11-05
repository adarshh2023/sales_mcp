import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { executeTool, getToolNames } from "./tools/handler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ========== MIDDLEWARE ==========

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// CORS - critical for OpenAI
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type,Authorization,erptoken,baseurl,userid"
  );
  res.setHeader("Access-Control-Max-Age", "600");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(express.json({ limit: "1mb" }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log("Body:", JSON.stringify(req.body, null, 2));
  }
  next();
});

// ========== MCP PROTOCOL ENDPOINTS ==========

/**
 * GET / - Health check / info
 */
app.get("/", (req, res) => {
  console.log("ðŸ“‹ GET / - Health check");
  res.json({
    ok: true,
    service: "erp-sales-mcp-server",
    mcp: {
      version: "1.0.0",
      name: "ERP Sales MCP Server",
      description:
        "MCP server for ERP Sales Agent System with lead management, events, and messaging",
    },
  });
});

/**
 * POST / - Main MCP JSON-RPC endpoint
 */
app.post("/", async (req, res) => {
  const { id, method, params, jsonrpc } = req.body || {};

  console.log(`ðŸ”§ MCP Request: ${method}`);

  try {
    // Handle initialize - ECHO BACK CLIENT'S PROTOCOL VERSION
    if (method === "initialize") {
      const clientInfo = params?.clientInfo || {};
      const protocolVersion = params?.protocolVersion || "2024-11-05";

      console.log(
        `âœ… Initialize from: ${clientInfo.name}, protocol: ${protocolVersion}`
      );

      return res.json({
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: protocolVersion, // Echo back client's version!
          capabilities: {
            tools: {}, // Empty object, not null
            resources: {},
            prompts: {},
          },
          serverInfo: {
            name: "erp-sales-mcp-server",
            version: "1.0.0",
          },
        },
      });
    }

    // Handle tools/list
    if (method === "tools/list") {
      console.log(`âœ… Listing tools`);

      const tools = getToolNames().map((name) => ({
        name,
        description: getToolDescription(name),
        inputSchema: getToolInputSchema(name),
      }));

      console.log(`   Returning ${tools.length} tools`);

      return res.json({
        jsonrpc: "2.0",
        id,
        result: {
          tools: tools,
        },
      });
    }

    // Handle tools/call
    if (method === "tools/call") {
      const { name, arguments: args = {} } = params || {};
      console.log(`ðŸ”¨ Calling tool: ${name}`);
      console.log(`   Args:`, JSON.stringify(args, null, 2));

      // Extract custom headers
      const headers = {
        erptoken: req.headers.erptoken || req.headers["erptoken"],
        baseurl: req.headers.baseurl || req.headers["baseurl"],
        userid: req.headers.userid || req.headers["userid"],
      };

      // Execute the tool
      const result = await executeTool(name, args, headers);
      console.log(`âœ… Tool executed successfully`);

      // Return in OpenAI's expected format
      return res.json({
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "text",
              text:
                typeof result === "string"
                  ? result
                  : JSON.stringify(result, null, 2),
            },
          ],
        },
      });
    }

    // Unknown method
    console.log(`âŒ Unknown method: ${method}`);
    return res.json({
      jsonrpc: "2.0",
      id,
      error: {
        code: -32601,
        message: `Method not found: ${method}`,
      },
    });
  } catch (err) {
    console.error("âŒ Error handling request:", err);
    return res.json({
      jsonrpc: "2.0",
      id,
      error: {
        code: -32603,
        message: "Internal error",
        data: err?.message || err,
      },
    });
  }
});

// ========== EXPLICIT ENDPOINTS (backup) ==========

app.post("/initialize", (req, res) => {
  const { id, params } = req.body || {};
  const protocolVersion = params?.protocolVersion || "2024-11-05";

  res.json({
    jsonrpc: "2.0",
    id,
    result: {
      protocolVersion: protocolVersion,
      capabilities: {
        tools: {},
        resources: {},
        prompts: {},
      },
      serverInfo: {
        name: "erp-sales-mcp-server",
        version: "1.0.0",
      },
    },
  });
});

app.post("/tools/list", (req, res) => {
  const id = req.body?.id ?? null;
  const tools = getToolNames().map((name) => ({
    name,
    description: getToolDescription(name),
    inputSchema: getToolInputSchema(name),
  }));

  res.json({
    jsonrpc: "2.0",
    id,
    result: {
      tools: tools,
    },
  });
});

app.post("/tools/call", async (req, res) => {
  const id = req.body?.id ?? null;
  const { name, arguments: args = {} } = req.body?.params || {};

  try {
    const headers = {
      erptoken: req.headers.erptoken,
      baseurl: req.headers.baseurl,
      userid: req.headers.userid,
    };

    const result = await executeTool(name, args, headers);

    res.json({
      jsonrpc: "2.0",
      id,
      result: {
        content: [
          {
            type: "text",
            text:
              typeof result === "string"
                ? result
                : JSON.stringify(result, null, 2),
          },
        ],
      },
    });
  } catch (err) {
    console.error("Tool call error:", err);
    res.json({
      jsonrpc: "2.0",
      id,
      error: {
        code: -32603,
        message: "Tool execution failed",
        data: err?.message || err,
      },
    });
  }
});

// OPTIONS handlers
app.options("/initialize", (_req, res) => res.sendStatus(204));
app.options("/tools/list", (_req, res) => res.sendStatus(204));
app.options("/tools/call", (_req, res) => res.sendStatus(204));

// ========== HELPER ENDPOINTS ==========

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    protocol: "MCP",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get("/tools", (req, res) => {
  const tools = getToolNames().map((name) => ({
    name,
    description: getToolDescription(name),
    inputSchema: getToolInputSchema(name),
  }));
  res.json({ tools });
});

// ========== TOOL METADATA ==========

function getToolDescription(name) {
  const descriptions = {
    check_lead_by_mobile: "Check if a lead exists by mobile number",
    create_lead: "Create a new lead with contact information",
    get_events: "Get a paginated list of events",
    create_event: "Create a new event",
    add_team_to_event: "Add a team member to an event",
    create_event_lead: "Create an EventLead (link a lead to an event)",
    save_simple_message:
      "Save a message from a lead without generating AI response",
    generate_summary: "Generate summary data for a conversation (incremental)",
    save_summary: "Save an AI-generated summary for a conversation",
    get_conversation_history:
      "Get complete conversation history for an EventLead",
    generateIndentNumber: "Generate a unique indent number",
    fetchProjects: "Fetch list of all projects",
    listLocations: "List all available locations",
    listItems: "List all items from item master",
    listUnits: "List all units of measurement",
    createIndent: "Create a new indent with items",
  };
  return descriptions[name] || `Execute ${name}`;
}

function getToolInputSchema(name) {
  const schemas = {
    check_lead_by_mobile: {
      type: "object",
      required: ["mobile"],
      properties: {
        mobile: {
          type: "string",
          description: "Mobile number (e.g., +919876543210)",
        },
      },
      additionalProperties: false,
    },
    create_lead: {
      type: "object",
      required: ["mobile"],
      properties: {
        mobile: { type: "string", description: "Mobile number (REQUIRED)" },
        fullName: { type: "string", description: "Full name" },
        email: { type: "string", description: "Email address" },
        companyName: { type: "string", description: "Company name" },
        designation: { type: "string", description: "Job designation" },
        department: { type: "string", description: "Department" },
        industry: { type: "string", description: "Industry" },
        city: { type: "string", description: "City" },
        state: { type: "string", description: "State" },
        country: { type: "string", description: "Country" },
      },
      additionalProperties: true,
    },
    get_events: {
      type: "object",
      properties: {
        page: { type: "integer", description: "Page number (default: 0)" },
        size: { type: "integer", description: "Page size (default: 20)" },
      },
      additionalProperties: false,
    },
    create_event: {
      type: "object",
      required: ["eventName", "eventType", "startDate", "endDate"],
      properties: {
        eventName: { type: "string", description: "Event name" },
        eventType: { type: "string", description: "Event type" },
        startDate: { type: "string", description: "Start date (YYYY-MM-DD)" },
        endDate: { type: "string", description: "End date (YYYY-MM-DD)" },
        location: { type: "string", description: "Event location" },
        eventStatus: { type: "string", description: "Event status" },
      },
      additionalProperties: true,
    },
    add_team_to_event: {
      type: "object",
      required: ["eventId", "memberType", "eventRole", "assignmentDate"],
      properties: {
        eventId: { type: "string", description: "Event ID" },
        memberType: {
          type: "string",
          enum: ["User", "ExternalPerson"],
          description: "Member type",
        },
        userId: {
          type: "string",
          description: "User ID (if memberType is User)",
        },
        externalPersonId: {
          type: "string",
          description: "External Person ID (if memberType is ExternalPerson)",
        },
        eventRole: {
          type: "string",
          description: "Role: SalesRep, Supervisor, Head",
        },
        assignmentDate: {
          type: "string",
          description: "Assignment date (YYYY-MM-DD)",
        },
        isActive: { type: "boolean", description: "Is active" },
      },
      additionalProperties: true,
    },
    create_event_lead: {
      type: "object",
      required: ["eventId", "leadId"],
      properties: {
        eventId: { type: "string", description: "Event ID" },
        leadId: { type: "string", description: "Lead ID" },
        temperatureCategory: {
          type: "string",
          enum: ["Hot", "Warm", "Cold"],
          description: "Temperature category",
        },
        leadStatus: { type: "string", description: "Lead status" },
        leadPriority: {
          type: "string",
          enum: ["High", "Medium", "Low"],
          description: "Priority",
        },
      },
      additionalProperties: true,
    },
    save_simple_message: {
      type: "object",
      required: ["eventLeadId", "message"],
      properties: {
        eventLeadId: { type: "string", description: "EventLead ID" },
        message: { type: "string", description: "Message content" },
      },
      additionalProperties: false,
    },
    generate_summary: {
      type: "object",
      required: ["eventLeadId"],
      properties: {
        eventLeadId: { type: "string", description: "EventLead ID" },
      },
      additionalProperties: false,
    },
    save_summary: {
      type: "object",
      required: ["eventLeadId", "summary"],
      properties: {
        eventLeadId: { type: "string", description: "EventLead ID" },
        summary: { type: "string", description: "AI-generated summary text" },
      },
      additionalProperties: false,
    },
    get_conversation_history: {
      type: "object",
      required: ["eventLeadId"],
      properties: {
        eventLeadId: { type: "string", description: "EventLead ID" },
      },
      additionalProperties: false,
    },
    generateIndentNumber: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    fetchProjects: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    listLocations: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    listItems: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    listUnits: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    createIndent: {
      type: "object",
      required: [
        "indentNumber",
        "projectNodeId",
        "locationId",
        "requestedById",
        "requestedDate",
        "requiredByDate",
        "indentItems",
      ],
      properties: {
        indentNumber: { type: "string", description: "Indent number" },
        indentTitle: { type: "string", description: "Indent title" },
        indentDescription: {
          type: "string",
          description: "Indent description",
        },
        indentType: { type: "string", description: "Type of indent" },
        priority: { type: "string", description: "Priority level" },
        projectNodeId: { type: "string", description: "Project node ID" },
        locationId: { type: "string", description: "Location ID" },
        requestedById: { type: "string", description: "Requester user ID" },
        requestorDepartment: { type: "string", description: "Department" },
        requestedDate: {
          type: "string",
          description: "Requested date (YYYY-MM-DD)",
        },
        requiredByDate: {
          type: "string",
          description: "Required by date (YYYY-MM-DD)",
        },
        purposeOfIndent: { type: "string", description: "Purpose" },
        workDescription: { type: "string", description: "Work description" },
        justification: { type: "string", description: "Justification" },
        estimatedBudget: { type: "number", description: "Estimated budget" },
        budgetCode: { type: "string", description: "Budget code" },
        requiresApproval: { type: "boolean", description: "Requires approval" },
        isUrgent: { type: "boolean", description: "Is urgent" },
        deliveryInstructions: {
          type: "string",
          description: "Delivery instructions",
        },
        qualityRequirements: {
          type: "string",
          description: "Quality requirements",
        },
        indentNotes: { type: "string", description: "Notes" },
        indentItems: {
          type: "array",
          description: "Array of indent items",
          items: {
            type: "object",
            required: [
              "itemMasterId",
              "requiredQuantity",
              "unit",
              "requiredByDate",
            ],
            properties: {
              itemMasterId: { type: "string", description: "Item master ID" },
              requiredQuantity: {
                type: "number",
                description: "Required quantity",
              },
              unit: { type: "string", description: "Unit of measurement" },
              estimatedRate: { type: "number", description: "Estimated rate" },
              estimatedAmount: {
                type: "number",
                description: "Estimated amount",
              },
              requiredByDate: {
                type: "string",
                description: "Required by date (YYYY-MM-DD)",
              },
              isTestingRequired: {
                type: "boolean",
                description: "Testing required",
              },
              purposeOfItem: { type: "string", description: "Purpose of item" },
              itemNotes: { type: "string", description: "Item notes" },
            },
          },
        },
        deviceId: { type: "string", description: "Device ID" },
        ipAddress: { type: "string", description: "IP address" },
      },
      additionalProperties: true,
    },
  };

  return (
    schemas[name] || {
      type: "object",
      properties: {},
      additionalProperties: false,
    }
  );
}

// ========== SERVER STARTUP ==========

app.listen(PORT, "0.0.0.0", () => {
  console.log(`\nâœ… ERP Sales MCP Server Started`);
  console.log(`ðŸŒ Server URL: http://0.0.0.0:${PORT}`);
  console.log(`ðŸ“‹ Protocol: MCP (OpenAI Agent Builder Compatible)`);
  console.log(`ðŸ”§ Available Tools: ${getToolNames().length}`);
  console.log(`\nReady for OpenAI MCP connections\n`);
});

process.on("SIGTERM", () => {
  console.log("\nðŸ›‘ SIGTERM received, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("\nðŸ›‘ SIGINT received, shutting down gracefully...");
  process.exit(0);
});
