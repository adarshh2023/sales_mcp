import apiClient from "../utils/apiClient.js";

/**
 * ALL TOOLS HANDLER
 * Handles requests from OpenAI Agent Builder
 */

export const toolsHandler = {
  // ========== AGENT 1: LEAD VALIDATION & CREATION ==========

  /**
   * Tool 1: Check if lead exists by mobile
   */
  check_lead_by_mobile: async (params, headers) => {
    const { mobile } = params;
    const result = await apiClient.get(
      `/api/v1/sales/leads/mobile/${mobile}`,
      headers
    );

    if (!result.success) {
      if (result.status === 404) {
        return {
          success: true,
          exists: false,
          message: "Lead not found with this mobile number",
          mobile: mobile,
        };
      }
      throw new Error(result.message);
    }

    return {
      success: true,
      exists: true,
      lead: result.data.data,
      message: "Lead found successfully",
    };
  },

  /**
   * Tool 2: Create new lead
   */
  create_lead: async (params, headers) => {
    const result = await apiClient.post("/api/v1/sales/leads", params, headers);

    if (!result.success) {
      throw new Error(result.message);
    }

    return {
      success: true,
      lead: result.data.data,
      message: "Lead created successfully",
    };
  },

  /**
   * Tool 3: Get events list
   */
  get_events: async (params, headers) => {
    const page = params.page || 0;
    const size = params.size || 20;

    const result = await apiClient.get(
      `/api/v1/sales/events?page=${page}&size=${size}`,
      headers
    );

    if (!result.success) {
      throw new Error(result.message);
    }

    return {
      success: true,
      events: result.data.data.content,
      totalEvents: result.data.data.totalElements,
      currentPage: result.data.data.number,
      totalPages: result.data.data.totalPages,
      message: "Events retrieved successfully",
    };
  },

  /**
   * Tool 4: Create event
   */
  create_event: async (params, headers) => {
    const result = await apiClient.post(
      "/api/v1/sales/events",
      params,
      headers
    );

    if (!result.success) {
      throw new Error(result.message);
    }

    return {
      success: true,
      event: result.data.data,
      message: "Event created successfully",
    };
  },

  /**
   * Tool 5: Add team member to event
   */
  add_team_to_event: async (params, headers) => {
    const result = await apiClient.post(
      "/api/v1/sales/event-teams",
      params,
      headers
    );

    if (!result.success) {
      throw new Error(result.message);
    }

    return {
      success: true,
      teamMember: result.data.data,
      message: "Team member added to event successfully",
    };
  },

  /**
   * Tool 6: Create EventLead
   */
  create_event_lead: async (params, headers) => {
    const result = await apiClient.post(
      "/api/v1/sales/event-leads",
      params,
      headers
    );

    if (!result.success) {
      throw new Error(result.message);
    }

    return {
      success: true,
      eventLead: result.data.data,
      eventLeadId: result.data.data.recCode,
      message: "EventLead created successfully. Use eventLeadId for messaging.",
    };
  },

  // ========== AGENT 2: MESSAGE COLLECTION ==========

  /**
   * Tool 7: Save simple message
   */
  save_simple_message: async (params, headers) => {
    const result = await apiClient.post(
      "/api/v1/sales/lead-messages/simple",
      params,
      headers
    );

    if (!result.success) {
      throw new Error(result.message);
    }

    return {
      success: true,
      messageId: result.data.data.messageId,
      timestamp: result.data.data.timestamp,
      acknowledgment: result.data.data.acknowledgment,
      message: "Message saved successfully",
    };
  },

  // ========== AGENT 3: SUMMARY GENERATION ==========

  /**
   * Tool 8: Generate summary data
   */
  generate_summary: async (params, headers) => {
    const { eventLeadId } = params;

    const result = await apiClient.post(
      `/api/v1/sales/lead-conversations/${eventLeadId}/generate-summary`,
      {},
      headers
    );

    if (!result.success) {
      throw new Error(result.message);
    }

    const data = result.data.data;

    return {
      success: true,
      eventLeadId: data.eventLeadId,
      interactionId: data.interactionId,
      previousSummaries: data.previousSummaries || [],
      newMessages: data.newMessages || [],
      totalMessages: data.totalMessages,
      newMessageCount: data.newMessageCount,
      lastSummaryTimestamp: data.lastSummaryTimestamp,
      structuredChatData: data.structuredChatData,
      message:
        data.newMessageCount > 0
          ? `Found ${data.newMessageCount} new messages to summarize`
          : "No new messages since last summary",
    };
  },

  /**
   * Tool 9: Save AI-generated summary
   */
  save_summary: async (params, headers) => {
    const { eventLeadId, summary } = params;

    const result = await apiClient.post(
      `/api/v1/sales/lead-conversations/${eventLeadId}/save-summary`,
      { summary },
      headers
    );

    if (!result.success) {
      throw new Error(result.message);
    }

    return {
      success: true,
      interaction: result.data.data,
      message: "Summary saved successfully",
    };
  },

  /**
   * Tool 10: Get conversation history
   */
  get_conversation_history: async (params, headers) => {
    const { eventLeadId } = params;

    const result = await apiClient.get(
      `/api/v1/sales/lead-conversations/${eventLeadId}/history`,
      headers
    );

    if (!result.success) {
      throw new Error(result.message);
    }

    const data = result.data.data;

    return {
      success: true,
      eventLead: data.eventLead,
      interaction: data.interaction,
      messages: data.messages,
      overallSummary: data.overallSummary,
      totalMessages: data.totalMessages,
      message: "Conversation history retrieved successfully",
    };
  },

  // ========== AGENT 4: INDENT MANAGEMENT ==========

  /**
   * Tool 11: Generate indent number
   */
  generateIndentNumber: async (params, headers) => {
    const result = await apiClient.get(
      "/api/v1/indents/generate-number",
      headers
    );

    if (!result.success) {
      throw new Error(result.message);
    }

    return {
      success: true,
      indentNumber: result.data.data,
      message: "Indent number generated successfully",
    };
  },

  /**
   * Tool 12: Fetch projects
   */
  fetchProjects: async (params, headers) => {
    const result = await apiClient.get("/api/v1/projects", headers);

    if (!result.success) {
      throw new Error(result.message);
    }

    return {
      success: true,
      projects: result.data.data.content,
      totalProjects: result.data.data.totalElements,
      message: "Projects retrieved successfully",
    };
  },

  /**
   * Tool 13: List locations
   */
  listLocations: async (params, headers) => {
    const result = await apiClient.get("/api/v1/locations", headers);

    if (!result.success) {
      throw new Error(result.message);
    }

    return {
      success: true,
      locations: result.data.data.content,
      totalLocations: result.data.data.totalElements,
      message: "Locations retrieved successfully",
    };
  },

  /**
   * Tool 14: List items
   */
  listItems: async (params, headers) => {
    const result = await apiClient.get("/api/v1/items", headers);

    if (!result.success) {
      throw new Error(result.message);
    }

    return {
      success: true,
      items: result.data.data.content,
      totalItems: result.data.data.totalElements,
      message: "Items retrieved successfully",
    };
  },

  /**
   * Tool 15: List units
   */
  listUnits: async (params, headers) => {
    const result = await apiClient.get("/api/v1/units", headers);

    if (!result.success) {
      throw new Error(result.message);
    }

    return {
      success: true,
      units: result.data.data.content,
      totalUnits: result.data.data.totalElements,
      message: "Units retrieved successfully",
    };
  },

  /**
   * Tool 16: Create indent
   */
  createIndent: async (params, headers) => {
    const result = await apiClient.post("/api/v1/indents", params, headers);

    if (!result.success) {
      throw new Error(result.message);
    }

    return {
      success: true,
      indent: result.data.data,
      message: "Indent created successfully",
    };
  },

  // ========== AGENT 5: MEDIA MANAGEMENT ==========

  /**
   * Tool 17: Search nodes by keyword
   */
  searchNodesArray: async (params, headers) => {
    const {
      keywords,
      page = 0,
      size = 50,
      sort = "insertDate,ASC",
      includePaths = true,
      includeStakeholders = true,
    } = params;

    if (!keywords || String(keywords).trim().length === 0) {
      throw new Error("'keywords' is required");
    }

    const queryParams = `keywords=${encodeURIComponent(
      keywords
    )}&page=${page}&size=${size}&sort=${encodeURIComponent(
      sort
    )}&includePaths=${includePaths}&includeStakeholders=${includeStakeholders}`;

    const result = await apiClient.get(
      `/api/v1/projects/nodes/search/searchNodesArray?${queryParams}`,
      headers
    );

    if (!result.success) {
      throw new Error(result.message);
    }

    const content = result.data.data?.content || [];
    const options = content.map((n) => ({
      nodeId: n.recCode,
      nodeName: n.nodeName,
      nodeTypeName: n.nodeTypeName,
      treeLevel: n.treeLevel,
      treePath: safeParseJSON(n.treePath),
      status: n.status,
      parentNodeId: n.parentNodeId || null,
      rootNodeId: n.rootNodeId || null,
    }));

    return {
      success: true,
      total: result.data.data?.totalElements || options.length,
      page: result.data.data?.pageable?.pageNumber || 0,
      size: result.data.data?.pageable?.pageSize || options.length,
      options,
      message: "Nodes searched successfully",
    };
  },

  /**
   * Tool 18: Update node status only
   */
  updateNodeStatus: async (params, headers) => {
    const { nodeId, status } = params;

    if (!nodeId) {
      throw new Error("'nodeId' is required");
    }
    if (!status) {
      throw new Error("'status' is required");
    }

    const validStatuses = [
      "Not Started",
      "In Progress",
      "Blocked",
      "Completed",
      "On Hold",
    ];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Allowed: ${validStatuses.join(", ")}`);
    }

    const result = await apiClient.put(
      `/api/v1/projects/nodes/${nodeId}/status`,
      { status },
      headers
    );

    if (!result.success) {
      throw new Error(result.message);
    }

    return {
      success: true,
      updated: true,
      node: result.data.data,
      message: "Node status updated successfully",
    };
  },

  /**
   * Tool 19: Update node (status, description, parentNodeId)
   */
  updateNode: async (params, headers) => {
    const { nodeId, status, nodeDescription, parentNodeId } = params;

    if (!nodeId) {
      throw new Error("'nodeId' is required");
    }

    const validStatuses = [
      "Not Started",
      "In Progress",
      "Blocked",
      "Completed",
      "On Hold",
    ];
    if (status && !validStatuses.includes(status)) {
      throw new Error(`Invalid status. Allowed: ${validStatuses.join(", ")}`);
    }

    const body = {};
    if (typeof nodeDescription === "string")
      body.nodeDescription = nodeDescription;
    if (typeof status === "string") body.status = status;
    if (typeof parentNodeId === "string") body.parentNodeId = parentNodeId;

    const result = await apiClient.put(
      `/api/v1/projects/nodes/${nodeId}`,
      body,
      headers
    );

    if (!result.success) {
      throw new Error(result.message);
    }

    return {
      success: true,
      updated: true,
      node: result.data.data,
      message: "Node updated successfully",
    };
  },

  /**
   * Tool 20: Finalize after upload (helper)
   */
  finalizeAfterUpload: async (params, headers) => {
    const { nodeId, update = {} } = params;

    if (!nodeId) {
      throw new Error("'nodeId' is required");
    }

    const { status, nodeDescription, parentNodeId } = update;

    // If only status is provided → use status endpoint
    if (status && !nodeDescription && parentNodeId === undefined) {
      return await toolsHandler.updateNodeStatus({ nodeId, status }, headers);
    }

    // If any of (status, nodeDescription, parentNodeId) → combined PUT
    if (
      status ||
      typeof nodeDescription === "string" ||
      typeof parentNodeId === "string"
    ) {
      return await toolsHandler.updateNode(
        { nodeId, status, nodeDescription, parentNodeId },
        headers
      );
    }

    return {
      success: true,
      message: "Nothing to update after upload.",
    };
  },

  /**
   * Tool 21: Follow-up activity creation
   */
  followUpActivity: async (params, headers) => {
    const result = await apiClient.post(
      "/api/v1/sales/followup/followUpActivity",
      params,
      headers
    );

    if (!result.success) {
      throw new Error(result.message);
    }

    return {
      success: true,
      followUp: result.data.data,
      message: "Follow-up activity created successfully",
      timestamp: result.data.timestamp,
      path: result.data.path,
    };
  },

  /**
   * Tool XX: Create project node
   */
  createNode: async (params, headers) => {
    // Directly forward the payload to ERP, it already matches the contract
    const result = await apiClient.post(
      "/api/v1/projects/nodes",
      params,
      headers
    );

    if (!result.success) {
      throw new Error(result.message);
    }

    // ERP is expected to return the node in result.data.data
    return {
      success: true,
      node: result.data.data,
      message: "Node created successfully",
    };
  },
};

/**
 * Helper: Safe JSON parse
 */
function safeParseJSON(str, fallback = []) {
  try {
    if (typeof str !== "string") return fallback;
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

/**
 * Get tool names
 */
export const getToolNames = () => Object.keys(toolsHandler);

/**
 * Check if tool exists
 */
export const toolExists = (toolName) => toolName in toolsHandler;

/**
 * Execute tool
 */
export const executeTool = async (toolName, params, headers) => {
  if (!toolExists(toolName)) {
    throw new Error(`Tool not found: ${toolName}`);
  }

  return await toolsHandler[toolName](params, headers);
};
