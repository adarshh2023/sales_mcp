export const openApiSchema = {
  openapi: "3.1.0",
  info: {
    title: "ERP Sales API",
    description:
      "REST API for ERP Sales Agent System with 5 agents: Lead Validation, Message Collection, Summary Generation, Indent Management, and Media Management",
    version: "1.0.0",
  },
  servers: [
    {
      url: "https://sales-mcp-6q6h.onrender.com", // This will be replaced dynamically
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
    "/tools/generateIndentNumber": {
      post: {
        summary: "Generate indent number",
        operationId: "generateIndentNumber",
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {},
              },
            },
          },
        },
        responses: {
          200: {
            description: "Indent number generated successfully",
          },
        },
      },
    },
    "/tools/fetchProjects": {
      post: {
        summary: "Fetch projects list",
        operationId: "fetchProjects",
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {},
              },
            },
          },
        },
        responses: {
          200: {
            description: "Projects retrieved successfully",
          },
        },
      },
    },
    "/tools/listLocations": {
      post: {
        summary: "List all locations",
        operationId: "listLocations",
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {},
              },
            },
          },
        },
        responses: {
          200: {
            description: "Locations retrieved successfully",
          },
        },
      },
    },
    "/tools/listItems": {
      post: {
        summary: "List all items",
        operationId: "listItems",
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {},
              },
            },
          },
        },
        responses: {
          200: {
            description: "Items retrieved successfully",
          },
        },
      },
    },
    "/tools/listUnits": {
      post: {
        summary: "List all units",
        operationId: "listUnits",
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {},
              },
            },
          },
        },
        responses: {
          200: {
            description: "Units retrieved successfully",
          },
        },
      },
    },
    "/tools/createIndent": {
      post: {
        summary: "Create new indent",
        operationId: "createIndent",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
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
                  indentNumber: {
                    type: "string",
                    description: "Indent number",
                  },
                  indentTitle: { type: "string", description: "Indent title" },
                  indentDescription: {
                    type: "string",
                    description: "Indent description",
                  },
                  indentType: { type: "string", description: "Type of indent" },
                  priority: { type: "string", description: "Priority level" },
                  projectNodeId: {
                    type: "string",
                    description: "Project node ID",
                  },
                  locationId: { type: "string", description: "Location ID" },
                  requestedById: {
                    type: "string",
                    description: "Requester user ID",
                  },
                  requestorDepartment: {
                    type: "string",
                    description: "Department",
                  },
                  requestedDate: {
                    type: "string",
                    description: "Requested date (YYYY-MM-DD)",
                  },
                  requiredByDate: {
                    type: "string",
                    description: "Required by date (YYYY-MM-DD)",
                  },
                  purposeOfIndent: { type: "string", description: "Purpose" },
                  workDescription: {
                    type: "string",
                    description: "Work description",
                  },
                  justification: {
                    type: "string",
                    description: "Justification",
                  },
                  estimatedBudget: {
                    type: "number",
                    description: "Estimated budget",
                  },
                  budgetCode: { type: "string", description: "Budget code" },
                  requiresApproval: {
                    type: "boolean",
                    description: "Requires approval",
                  },
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
                        itemMasterId: {
                          type: "string",
                          description: "Item master ID",
                        },
                        requiredQuantity: {
                          type: "number",
                          description: "Required quantity",
                        },
                        unit: {
                          type: "string",
                          description: "Unit of measurement",
                        },
                        estimatedRate: {
                          type: "number",
                          description: "Estimated rate",
                        },
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
                        purposeOfItem: {
                          type: "string",
                          description: "Purpose of item",
                        },
                        itemNotes: {
                          type: "string",
                          description: "Item notes",
                        },
                      },
                    },
                  },
                  deviceId: { type: "string", description: "Device ID" },
                  ipAddress: { type: "string", description: "IP address" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Indent created successfully",
          },
        },
      },
    },
    "/tools/searchNodesArray": {
      post: {
        summary: "Search nodes by keyword",
        operationId: "searchNodesArray",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["keywords"],
                properties: {
                  keywords: {
                    type: "string",
                    description: "Search keywords for node search",
                  },
                  page: {
                    type: "integer",
                    description: "Page number (default: 0)",
                  },
                  size: {
                    type: "integer",
                    description: "Page size (default: 50)",
                  },
                  sort: {
                    type: "string",
                    description: "Sort order (default: insertDate,ASC)",
                  },
                  includePaths: {
                    type: "boolean",
                    description: "Include tree paths (default: true)",
                  },
                  includeStakeholders: {
                    type: "boolean",
                    description: "Include stakeholders (default: true)",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Nodes searched successfully",
          },
        },
      },
    },
    "/tools/updateNodeStatus": {
      post: {
        summary: "Update node status only",
        operationId: "updateNodeStatus",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["nodeId", "status"],
                properties: {
                  nodeId: {
                    type: "string",
                    description: "Node ID to update",
                  },
                  status: {
                    type: "string",
                    enum: [
                      "Not Started",
                      "In Progress",
                      "Blocked",
                      "Completed",
                      "On Hold",
                    ],
                    description: "New status for the node",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Node status updated successfully",
          },
        },
      },
    },
    "/tools/updateNode": {
      post: {
        summary: "Update node (status, description, parentNodeId)",
        operationId: "updateNode",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["nodeId"],
                properties: {
                  nodeId: {
                    type: "string",
                    description: "Node ID to update",
                  },
                  status: {
                    type: "string",
                    enum: [
                      "Not Started",
                      "In Progress",
                      "Blocked",
                      "Completed",
                      "On Hold",
                    ],
                    description: "New status for the node",
                  },
                  nodeDescription: {
                    type: "string",
                    description: "New description for the node",
                  },
                  parentNodeId: {
                    type: "string",
                    description: "New parent node ID",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Node updated successfully",
          },
        },
      },
    },
    "/tools/finalizeAfterUpload": {
      post: {
        summary: "Finalize node updates after file upload",
        operationId: "finalizeAfterUpload",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["nodeId"],
                properties: {
                  nodeId: {
                    type: "string",
                    description: "Node ID to finalize after upload",
                  },
                  update: {
                    type: "object",
                    description: "Update fields",
                    properties: {
                      status: {
                        type: "string",
                        enum: [
                          "Not Started",
                          "In Progress",
                          "Blocked",
                          "Completed",
                          "On Hold",
                        ],
                        description: "New status",
                      },
                      nodeDescription: {
                        type: "string",
                        description: "New description",
                      },
                      parentNodeId: {
                        type: "string",
                        description: "New parent node ID",
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Node finalized successfully",
          },
        },
      },
    },

    "/tools/followUpActivity": {
      post: {
        summary: "Create follow-up activity",
        operationId: "followUpActivity",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: [
                  "recCode",
                  "eventLeadId",
                  "activityType",
                  "nextFollowUpDate",
                  "followUpDate",
                  "activityDescription",
                  "insertUser",
                  "insertDate",
                  "deviceId",
                  "ipAddress",
                  "activeFlag",
                  "updateUser",
                  "updateDate",
                ],
                properties: {
                  recCode: { type: "string" },
                  eventLeadId: { type: "string" },
                  activityType: { type: "string" },
                  nextFollowUpDate: { type: "string" },
                  followUpDate: { type: "string" },
                  activityDescription: { type: "string" },
                  insertUser: { type: "string" },
                  insertDate: { type: "string" },
                  deviceId: { type: "string" },
                  ipAddress: { type: "string" },
                  activeFlag: { type: "boolean" },
                  updateUser: { type: "string" },
                  updateDate: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Follow-up activity created successfully",
          },
        },
      },
    },
    "/tools/createNode": {
      post: {
        summary: "Create a new project node",
        operationId: "createNode",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["recCode", "nodeName", "nodeTypeId", "parentNodeId"],
                properties: {
                  recCode: {
                    type: "string",
                    description: "UUID for the node (required)",
                  },
                  nodeName: {
                    type: "string",
                    description: "Node name (required)",
                  },
                  nodeDescription: {
                    type: "string",
                    description: "Optional description for the node",
                  },
                  parentNodeId: {
                    type: "string",
                    description:
                      "Parent node ID (required; can be null/ROOT in ERP if needed)",
                  },
                  nodeTypeId: {
                    type: "string",
                    description: "Node type ID (required)",
                  },
                  treeCategoryId: {
                    type: "string",
                    description: "Tree category ID",
                  },
                  isRootNode: {
                    type: "boolean",
                    description: "True if this is a root node",
                  },
                  treeLevel: {
                    type: "number",
                    description: "Hierarchy level (0 for root)",
                  },
                  nodeOrder: {
                    type: "number",
                    description: "Order within parent's children",
                  },
                  startDate: {
                    type: "string",
                    description: "Start date (YYYY-MM-DD)",
                  },
                  endDate: {
                    type: "string",
                    description: "End date (YYYY-MM-DD)",
                  },
                  status: {
                    type: "string",
                    enum: [
                      "Not Started",
                      "In Progress",
                      "On Hold",
                      "Completed",
                      "Cancelled",
                    ],
                    description: "Current status of the node",
                  },
                  priority: {
                    type: "string",
                    enum: ["Low", "Medium", "High", "Urgent"],
                    description: "Priority of the node",
                  },
                  budgetAmount: {
                    type: "number",
                    description: "Budget amount (optional)",
                  },
                  currency: {
                    type: "string",
                    description: 'Currency code, e.g. "INR", "USD"',
                  },
                  projectType: {
                    type: "string",
                    description: "Project type (optional)",
                  },
                  projectLocation: {
                    type: "string",
                    description: "Project location (optional)",
                  },
                  completionPercentage: {
                    type: "number",
                    description: "Completion percentage (0-100, optional)",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Node created successfully",
          },
        },
      },
    },

    "/tools/createNote": {
      post: {
        summary: "Create a note linked to a node",
        operationId: "createNote",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: [
                  "noteContent",
                  "noteType",
                  "nodeId",
                  "subject",
                  "isImportant",
                  "isPrivate",
                ],
                properties: {
                  noteContent: {
                    type: "string",
                    description:
                      "Full note content text. Typically the message text from AI or user.",
                  },
                  noteType: {
                    type: "string",
                    enum: ["General"],
                    description: 'Type of note. Currently always "General".',
                  },
                  nodeId: {
                    type: "string",
                    description:
                      "Node ID (recCode) that this note is attached to. Use recCode returned from createNode.",
                  },
                  subject: {
                    type: "string",
                    description:
                      "Short summary/subject. You can use the first 50 characters of the message.",
                  },
                  isImportant: {
                    type: "boolean",
                    description: "Whether this note is marked as important.",
                  },
                  isPrivate: {
                    type: "boolean",
                    description: "Whether this note is private.",
                  },
                  userId: {
                    type: "string",
                    description:
                      "Optional user ID for the note author. Used for AI-authored notes.",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Note created successfully",
          },
        },
      },
    },
    "/tools/get_node_notes": {
      post: {
        summary: "Get notes for a node",
        operationId: "getNodeNotes",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["nodeId"],
                properties: {
                  nodeId: {
                    type: "string",
                    description: "Node ID whose notes will be retrieved",
                  },
                  page: {
                    type: "number",
                    description: "Page number (default 0)",
                  },
                  size: {
                    type: "number",
                    description: "Page size (default 100)",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Node notes retrieved successfully",
          },
        },
      },
    },

    "/tools/lead_properties": {
      post: {
        summary: "Create or update lead properties",
        operationId: "leadProperties",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["parentNodeId", "mobileNumber"],
                properties: {
                  parentNodeId: { type: "string" },
                  fullName: { type: "string" },
                  mobileNumber: { type: "string" },
                  emailId: { type: "string" },
                  organisationName: { type: "string" },
                  currentAddress: { type: "string" },
                  pincode: { type: "string" },
                  city: { type: "string" },
                  state: { type: "string" },
                  brokerCode: { type: "string" },
                  campaign: { type: "string" },
                  medium: { type: "string" },
                  source: { type: "string" },
                  referredBy: { type: "string" },
                  maritalStatus: { type: "string" },
                  gender: { type: "string" },
                  estimatedAge: { type: "number" },
                  familyBackground: { type: "string" },
                  occupation: { type: "string" },
                  occupationDetails: { type: "string" },
                  specialInstructions: { type: "string" },
                  vehicleOwned: { type: "string" },
                  celebrity: { type: "boolean" },
                  loanRequired: { type: "boolean" },
                  loanAmount: { type: "number" },
                  configOrProductInterestedIn: {
                    type: "array",
                    items: { type: "string" },
                  },
                  vastu: { type: "string" },
                  importantConsiderations: { type: "string" },
                  parkingCount: { type: "number" },
                  leadAssignedTo: { type: "string" },
                  parentNodeName: { type: "string" },
                  leadAssignedToName: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Lead properties saved successfully",
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
