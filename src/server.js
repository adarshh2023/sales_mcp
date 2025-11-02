import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { executeTool, getToolNames } from "./tools/handler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ========== MIDDLEWARE ==========

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "erptoken",
      "baseurl",
      "userid",
    ],
    credentials: true,
  })
);

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log(`User-Agent: ${req.headers["user-agent"] || "none"}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`Body:`, JSON.stringify(req.body, null, 2));
  }
  next();
});

// ========== MCP PROTOCOL ENDPOINTS ==========

/**
 * GET / - Server capabilities (SSE endpoint discovery)
 */
app.get("/", (req, res) => {
  console.log("📋 MCP: Server info requested");

  const response = {
    protocolVersion: "2024-11-05",
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
    serverInfo: {
      name: "ERP Sales MCP Server",
      version: "1.0.0",
    },
  };

  console.log("Responding with:", JSON.stringify(response, null, 2));
  res.json(response);
});

/**
 * POST / - JSON-RPC style MCP endpoint
 */
app.post("/", async (req, res) => {
  const { jsonrpc, id, method, params } = req.body;

  console.log(`🔧 MCP Request: ${method}`);

  try {
    let result;

    switch (method) {
      case "initialize":
        console.log(
          `✅ Initialize: protocolVersion=${params?.protocolVersion}`
        );
        result = {
          protocolVersion: "2024-11-05",
          capabilities: {
            tools: {},
            resources: {},
            prompts: {},
          },
          serverInfo: {
            name: "ERP Sales MCP Server",
            version: "1.0.0",
          },
        };
        break;

      case "tools/list":
        console.log(`✅ Listing tools`);
        const tools = getToolNames().map((name) => ({
          name,
          description: getToolDescription(name),
          inputSchema: getToolInputSchema(name),
        }));
        result = { tools };
        console.log(`   Returning ${tools.length} tools`);
        break;

      case "tools/call":
        const { name, arguments: args } = params;
        console.log(`🔨 Calling tool: ${name}`);

        const headers = {
          erptoken: req.headers.erptoken || req.headers["erptoken"],
          baseurl: req.headers.baseurl || req.headers["baseurl"],
          userid: req.headers.userid || req.headers["userid"],
        };

        const toolResult = await executeTool(name, args, headers);
        console.log(`✅ Tool executed successfully`);

        result = {
          content: [
            {
              type: "text",
              text: JSON.stringify(toolResult, null, 2),
            },
          ],
        };
        break;

      case "notifications/initialized":
        console.log(`✅ Client initialized notification`);
        // Notifications don't return results
        return res.status(204).send();

      default:
        console.log(`❌ Unknown method: ${method}`);
        return res.status(400).json({
          jsonrpc: "2.0",
          id: id || null,
          error: {
            code: -32601,
            message: `Method not found: ${method}`,
          },
        });
    }

    // JSON-RPC 2.0 response format
    const response =
      jsonrpc === "2.0" ? { jsonrpc: "2.0", id: id || null, result } : result;

    console.log(
      "Response:",
      JSON.stringify(response).substring(0, 200) + "..."
    );
    res.json(response);
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    console.error(error.stack);

    const errorResponse =
      jsonrpc === "2.0"
        ? {
            jsonrpc: "2.0",
            id: id || null,
            error: {
              code: -32603,
              message: error.message,
            },
          }
        : {
            error: {
              code: "internal_error",
              message: error.message,
            },
          };

    res.status(500).json(errorResponse);
  }
});

// ========== HELPER ENDPOINTS ==========

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    protocol: "MCP",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: {
      code: "internal_error",
      message: err.message,
    },
  });
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
    },
    get_events: {
      type: "object",
      properties: {
        page: { type: "integer", description: "Page number (default: 0)" },
        size: { type: "integer", description: "Page size (default: 20)" },
      },
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
    },
    save_simple_message: {
      type: "object",
      required: ["eventLeadId", "message"],
      properties: {
        eventLeadId: { type: "string", description: "EventLead ID" },
        message: { type: "string", description: "Message content" },
      },
    },
    generate_summary: {
      type: "object",
      required: ["eventLeadId"],
      properties: {
        eventLeadId: { type: "string", description: "EventLead ID" },
      },
    },
    save_summary: {
      type: "object",
      required: ["eventLeadId", "summary"],
      properties: {
        eventLeadId: { type: "string", description: "EventLead ID" },
        summary: { type: "string", description: "AI-generated summary text" },
      },
    },
    get_conversation_history: {
      type: "object",
      required: ["eventLeadId"],
      properties: {
        eventLeadId: { type: "string", description: "EventLead ID" },
      },
    },
  };

  return (
    schemas[name] || {
      type: "object",
      properties: {},
    }
  );
}

// ========== SERVER STARTUP ==========

app.listen(PORT, "0.0.0.0", () => {
  console.log("\n✅ ERP Sales MCP Server Started");
  console.log(`🌐 Server URL: http://0.0.0.0:${PORT}`);
  console.log(`📋 Protocol: MCP (Model Context Protocol) with JSON-RPC 2.0`);
  console.log(`🔧 Available Tools: ${getToolNames().length}`);
  console.log("\n📋 Tool List:");

  const tools = getToolNames();
  console.log(`  🔵 Agent 1: ${tools.slice(0, 6).join(", ")}`);
  console.log(`  🟢 Agent 2: ${tools.slice(6, 7).join(", ")}`);
  console.log(`  🟡 Agent 3: ${tools.slice(7, 10).join(", ")}`);

  console.log("\n⏳ Ready for MCP requests...\n");
});

process.on("SIGTERM", () => {
  console.log("\n🛑 SIGTERM received, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("\n🛑 SIGINT received, shutting down gracefully...");
  process.exit(0);
});
