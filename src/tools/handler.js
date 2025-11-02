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
};

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
