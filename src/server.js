import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import redisClient from "./utils/redis.js";
import { executeTool, getToolNames, toolExists } from "./tools/handler.js";
import { openApiSchema } from "./config/openapi.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ========== MIDDLEWARE ==========

// Security headers - MODIFIED for OpenAI compatibility
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable CSP for API
    crossOriginEmbedderPolicy: false, // Allow embedding
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin
  })
);

// CORS - UPDATED to explicitly allow OpenAI
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like curl, Postman)
      if (!origin) return callback(null, true);

      // Allow all origins (you can restrict this later)
      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "erptoken",
      "baseurl",
      "userid",
      "x-api-key",
    ],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

// Handle preflight requests explicitly
app.options("*", cors());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW) || 15) * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/tools/", limiter);

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log(`Origin: ${req.headers.origin || "none"}`);
  console.log(`User-Agent: ${req.headers["user-agent"] || "none"}`);
  next();
});

// ========== ROUTES ==========

/**
 * Health check endpoint
 */
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    redis: redisClient.isConnected ? "connected" : "disconnected",
  });
});

/**
 * Root endpoint
 */
app.get("/", (req, res) => {
  res.json({
    name: "ERP Sales API Server",
    version: "1.0.0",
    description: "REST API for OpenAI Agent Builder",
    endpoints: {
      health: "/health",
      openapi: "/openapi.json",
      tools: "/tools",
      toolsList: "/tools/list",
    },
    availableTools: getToolNames().length,
    documentation: "https://github.com/adarshh2023/sales_mcp",
  });
});

/**
 * OpenAPI schema endpoint (for OpenAI)
 * CRITICAL: This must return proper CORS headers
 */
app.get("/openapi.json", (req, res) => {
  // Update server URL dynamically based on request
  const protocol = req.headers["x-forwarded-proto"] || req.protocol;
  const host = req.headers["x-forwarded-host"] || req.get("host");
  const serverUrl = `${protocol}://${host}`;

  const schema = {
    ...openApiSchema,
    servers: [{ url: serverUrl }],
  };

  // Set explicit headers for OpenAI
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  res.json(schema);
});

/**
 * List all available tools
 */
app.get("/tools/list", (req, res) => {
  const tools = getToolNames();
  res.json({
    success: true,
    totalTools: tools.length,
    tools: tools.map((name) => ({
      name,
      endpoint: `/tools/${name}`,
      method: "POST",
    })),
  });
});

/**
 * Generic tool execution endpoint
 */
app.post("/tools/:toolName", async (req, res) => {
  const { toolName } = req.params;
  const params = req.body;

  // Extract custom headers
  const headers = {
    erptoken: req.headers.erptoken || req.headers["erptoken"],
    baseurl: req.headers.baseurl || req.headers["baseurl"],
    userid: req.headers.userid || req.headers["userid"],
  };

  console.log(`\n🔧 Tool Request: ${toolName}`);
  console.log(`📥 Params:`, JSON.stringify(params, null, 2));
  console.log(`🔑 Headers:`, {
    baseurl: headers.baseurl || "default",
    userid: headers.userid || "default",
    hasToken: !!headers.erptoken,
  });

  try {
    // Check if tool exists
    if (!toolExists(toolName)) {
      return res.status(404).json({
        success: false,
        error: `Tool not found: ${toolName}`,
        availableTools: getToolNames(),
      });
    }

    // Execute tool
    const result = await executeTool(toolName, params, headers);

    console.log(`✅ Tool Success: ${toolName}\n`);

    res.json(result);
  } catch (error) {
    console.error(`❌ Tool Error: ${toolName}`);
    console.error(`Error:`, error.message);

    res.status(500).json({
      success: false,
      error: error.message,
      tool: toolName,
    });
  }
});

/**
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    path: req.path,
    availableEndpoints: {
      health: "/health",
      openapi: "/openapi.json",
      tools: "/tools/:toolName (POST)",
    },
  });
});

/**
 * Error handler
 */
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: err.message,
  });
});

// ========== SERVER STARTUP ==========

async function startServer() {
  try {
    // Connect to Redis (optional - server will work without it)
    console.log("🔌 Connecting to Redis...");
    await redisClient.connect();

    // Start Express server
    app.listen(PORT, "0.0.0.0", () => {
      console.log("\n✅ ERP Sales API Server Started");
      console.log(`🌐 Server URL: http://0.0.0.0:${PORT}`);
      console.log(`📋 Health Check: http://0.0.0.0:${PORT}/health`);
      console.log(`📄 OpenAPI Schema: http://0.0.0.0:${PORT}/openapi.json`);
      console.log(`🔧 Available Tools: ${getToolNames().length}`);
      console.log("\n📋 Tool List:");

      const tools = getToolNames();
      console.log(`  🔵 Agent 1: ${tools.slice(0, 6).join(", ")}`);
      console.log(`  🟢 Agent 2: ${tools.slice(6, 7).join(", ")}`);
      console.log(`  🟡 Agent 3: ${tools.slice(7, 10).join(", ")}`);

      console.log("\n⏳ Ready for requests...\n");
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGTERM", async () => {
  console.log("\n🛑 SIGTERM received, shutting down gracefully...");
  await redisClient.disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("\n🛑 SIGINT received, shutting down gracefully...");
  await redisClient.disconnect();
  process.exit(0);
});

// Start the server
startServer();
