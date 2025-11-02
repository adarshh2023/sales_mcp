export const openApiSchema = {
  openapi: "3.1.0",
  info: {
    title: "ERP Sales API",
    description:
      "REST API for ERP Sales Agent System with 3 agents: Lead Validation, Message Collection, and Summary Generation",
    version: "1.0.0",
  },
  servers: [
    {
      url: "https://sales-mcp-6q6h.onrender.com",
    },
  ],
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        operationId: "healthCheck",
        responses: {
          200: {
            description: "Server is healthy",
          },
        },
      },
    },
    "/tools/check_lead_by_mobile": {
      post: {
        summary: "Check if lead exists by mobile number",
        operationId: "checkLeadByMobile",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["mobile"],
                properties: {
                  mobile: {
                    type: "string",
                    description: "Mobile number (e.g., +919876543210)",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Lead check result",
          },
        },
      },
    },
    "/tools/create_lead": {
      post: {
        summary: "Create new lead",
        operationId: "createLead",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["mobile"],
                properties: {
                  mobile: {
                    type: "string",
                    description: "Mobile number (REQUIRED)",
                  },
                  fullName: { type: "string", description: "Full name" },
                  email: { type: "string", description: "Email address" },
                  companyName: { type: "string", description: "Company name" },
                  designation: {
                    type: "string",
                    description: "Job designation",
                  },
                  department: { type: "string", description: "Department" },
                  industry: { type: "string", description: "Industry" },
                  city: { type: "string", description: "City" },
                  state: { type: "string", description: "State" },
                  country: { type: "string", description: "Country" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Lead created successfully",
          },
        },
      },
    },
    "/tools/get_events": {
      post: {
        summary: "Get list of events",
        operationId: "getEvents",
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  page: {
                    type: "integer",
                    description: "Page number (default: 0)",
                  },
                  size: {
                    type: "integer",
                    description: "Page size (default: 20)",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Events retrieved successfully",
          },
        },
      },
    },
    "/tools/create_event": {
      post: {
        summary: "Create new event",
        operationId: "createEvent",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["eventName", "eventType", "startDate", "endDate"],
                properties: {
                  eventName: { type: "string", description: "Event name" },
                  eventType: { type: "string", description: "Event type" },
                  startDate: {
                    type: "string",
                    description: "Start date (YYYY-MM-DD)",
                  },
                  endDate: {
                    type: "string",
                    description: "End date (YYYY-MM-DD)",
                  },
                  location: { type: "string", description: "Event location" },
                  eventStatus: { type: "string", description: "Event status" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Event created successfully",
          },
        },
      },
    },
    "/tools/add_team_to_event": {
      post: {
        summary: "Add team member to event",
        operationId: "addTeamToEvent",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: [
                  "eventId",
                  "memberType",
                  "eventRole",
                  "assignmentDate",
                ],
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
                    description:
                      "External Person ID (if memberType is ExternalPerson)",
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
            },
          },
        },
        responses: {
          200: {
            description: "Team member added successfully",
          },
        },
      },
    },
    "/tools/create_event_lead": {
      post: {
        summary: "Create EventLead (link lead to event)",
        operationId: "createEventLead",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
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
            },
          },
        },
        responses: {
          200: {
            description: "EventLead created successfully",
          },
        },
      },
    },
    "/tools/save_simple_message": {
      post: {
        summary: "Save message without AI response",
        operationId: "saveSimpleMessage",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["eventLeadId", "message"],
                properties: {
                  eventLeadId: { type: "string", description: "EventLead ID" },
                  message: { type: "string", description: "Message content" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Message saved successfully",
          },
        },
      },
    },
    "/tools/generate_summary": {
      post: {
        summary: "Generate summary data (incremental)",
        operationId: "generateSummary",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["eventLeadId"],
                properties: {
                  eventLeadId: { type: "string", description: "EventLead ID" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Summary data generated successfully",
          },
        },
      },
    },
    "/tools/save_summary": {
      post: {
        summary: "Save AI-generated summary",
        operationId: "saveSummary",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["eventLeadId", "summary"],
                properties: {
                  eventLeadId: { type: "string", description: "EventLead ID" },
                  summary: {
                    type: "string",
                    description: "AI-generated summary text",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Summary saved successfully",
          },
        },
      },
    },
    "/tools/get_conversation_history": {
      post: {
        summary: "Get complete conversation history",
        operationId: "getConversationHistory",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["eventLeadId"],
                properties: {
                  eventLeadId: { type: "string", description: "EventLead ID" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Conversation history retrieved successfully",
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: "apiKey",
        in: "header",
        name: "x-api-key",
      },
    },
  },
  security: [
    {
      ApiKeyAuth: [],
    },
  ],
};
