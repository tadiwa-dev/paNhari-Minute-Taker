'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var genai = require('@google/genai');
var teams_ai = require('@microsoft/teams.ai');
var teams_openai = require('@microsoft/teams.openai');
var identity = require('@azure/identity');
var teams_apps = require('@microsoft/teams.apps');
var teams_common = require('@microsoft/teams.common');
var teams_dev = require('@microsoft/teams.dev');
var teams_api = require('@microsoft/teams.api');
var chrono = require('chrono-node');
var mssql = require('mssql');
var Database = require('better-sqlite3');
var path = require('path');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var chrono__namespace = /*#__PURE__*/_interopNamespace(chrono);
var mssql__namespace = /*#__PURE__*/_interopNamespace(mssql);
var Database__default = /*#__PURE__*/_interopDefault(Database);
var path__default = /*#__PURE__*/_interopDefault(path);

var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var GeminiChatModel;
var init_geminiModel = __esm({
  "src/ai/geminiModel.ts"() {
    GeminiChatModel = class {
      genAI;
      modelName;
      apiKey;
      constructor(config) {
        this.apiKey = config.apiKey;
        this.modelName = config.model || "gemini-2.5-flash";
        this.genAI = new genai.GoogleGenAI({ apiKey: this.apiKey });
      }
      async complete(prompt) {
        try {
          const result = await this.genAI.models.generateContent({
            model: this.modelName,
            contents: [
              {
                role: "user",
                parts: [{ text: prompt }]
              }
            ]
          });
          return result.text;
        } catch (error) {
          throw new Error(`Gemini API call failed: ${error}`);
        }
      }
      // Method required by ChatPrompt interface
      async send(prompt) {
        try {
          let promptText = typeof prompt === "string" ? prompt : JSON.stringify(prompt);
          const result = await this.genAI.models.generateContent({
            model: this.modelName,
            contents: [
              {
                role: "user",
                parts: [{ text: promptText }]
              }
            ]
          });
          return { content: result.text };
        } catch (error) {
          throw new Error(`Gemini send failed: ${error}`);
        }
      }
      // Method to handle structured prompts for compatibility with ChatPrompt
      async completeStructured(messages) {
        try {
          const systemMessage = messages.find((msg) => msg.role === "system");
          const contentMessages = messages.filter((msg) => msg.role !== "system").map((msg) => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }]
          }));
          const result = await this.genAI.models.generateContent({
            model: this.modelName,
            systemInstruction: systemMessage?.content,
            contents: contentMessages
          });
          return result.text;
        } catch (error) {
          throw new Error(`Gemini API structured call failed: ${error}`);
        }
      }
    };
  }
});

// src/utils/config.ts
function getModelConfig(capabilityType) {
  switch (capabilityType.toLowerCase()) {
    case "manager":
      return AI_MODELS.MANAGER;
    case "summarizer":
      return AI_MODELS.SUMMARIZER;
    case "actionitems":
      return AI_MODELS.ACTION_ITEMS;
    case "search":
      return AI_MODELS.SEARCH;
    default:
      return AI_MODELS.DEFAULT;
  }
}
function validateEnvironment(logger2) {
  const requiredEnvVars = AI_PROVIDER === "gemini" ? ["GEMINI_API_KEY"] : ["AOAI_API_KEY", "AOAI_ENDPOINT"];
  const missing = requiredEnvVars.filter((envVar) => !process.env[envVar]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
  logger2.debug(`\u{1F511} Using AI Provider: ${AI_PROVIDER.toUpperCase()}`);
  if (DATABASE_CONFIG.type === "mssql") {
    const sqlRequiredVars = ["SQL_CONNECTION_STRING"];
    const sqlMissing = sqlRequiredVars.filter((envVar) => !process.env[envVar]);
    if (sqlMissing.length > 0) {
      logger2.warn(
        `SQL Server configuration incomplete. Missing: ${sqlMissing.join(
          ", "
        )}. Falling back to SQLite.`
      );
      DATABASE_CONFIG.type = "sqlite";
    } else {
      logger2.debug("\u2705 SQL Server configuration validated");
    }
  }
  logger2.debug(`\u{1F4E6} Using database: ${DATABASE_CONFIG.type}`);
  logger2.debug("\u2705 Environment validation passed");
}
function logModelConfigs(logger2) {
  logger2.debug("\u{1F527} AI Model Configuration:");
  logger2.debug(`  Provider: ${AI_PROVIDER.toUpperCase()}`);
  logger2.debug(`  Manager Capability: ${AI_MODELS.MANAGER.model}`);
  logger2.debug(`  Summarizer Capability: ${AI_MODELS.SUMMARIZER.model}`);
  logger2.debug(`  Action Items Capability: ${AI_MODELS.ACTION_ITEMS.model}`);
  logger2.debug(`  Search Capability: ${AI_MODELS.SEARCH.model}`);
  logger2.debug(`  Default Model: ${AI_MODELS.DEFAULT.model}`);
}
var AI_PROVIDER, DATABASE_CONFIG, AI_MODELS;
var init_config = __esm({
  "src/utils/config.ts"() {
    AI_PROVIDER = process.env.AI_PROVIDER || "azure-openai";
    DATABASE_CONFIG = {
      type: process.env.RUNNING_ON_AZURE === "1" ? "mssql" : "sqlite",
      connectionString: process.env.SQL_CONNECTION_STRING,
      server: process.env.SQL_SERVER,
      database: process.env.SQL_DATABASE,
      username: process.env.SQL_USERNAME,
      password: process.env.SQL_PASSWORD,
      sqlitePath: process.env.CONVERSATIONS_DB_PATH
    };
    AI_MODELS = {
      // Manager Capability - Uses lighter, faster model for routing decisions
      MANAGER: {
        model: AI_PROVIDER === "gemini" ? process.env.GEMINI_MODEL || "gemini-1.5-flash" : "gpt-4o-mini",
        apiKey: AI_PROVIDER === "gemini" ? process.env.GEMINI_API_KEY : process.env.AOAI_API_KEY,
        endpoint: process.env.AOAI_ENDPOINT,
        apiVersion: "2025-04-01-preview"
      },
      // Summarizer Capability - Uses more capable model for complex analysis
      SUMMARIZER: {
        model: AI_PROVIDER === "gemini" ? process.env.GEMINI_MODEL || "gemini-1.5-pro" : process.env.AOAI_MODEL || "gpt-4o",
        apiKey: AI_PROVIDER === "gemini" ? process.env.GEMINI_API_KEY : process.env.AOAI_API_KEY,
        endpoint: process.env.AOAI_ENDPOINT,
        apiVersion: "2025-04-01-preview"
      },
      // Action Items Capability - Uses capable model for analysis and task management
      ACTION_ITEMS: {
        model: AI_PROVIDER === "gemini" ? process.env.GEMINI_MODEL || "gemini-1.5-pro" : process.env.AOAI_MODEL || "gpt-4o",
        apiKey: AI_PROVIDER === "gemini" ? process.env.GEMINI_API_KEY : process.env.AOAI_API_KEY,
        endpoint: process.env.AOAI_ENDPOINT,
        apiVersion: "2025-04-01-preview"
      },
      // Search Capability - Uses capable model for semantic search and deep linking
      SEARCH: {
        model: AI_PROVIDER === "gemini" ? process.env.GEMINI_MODEL || "gemini-1.5-pro" : process.env.AOAI_MODEL || "gpt-4o",
        apiKey: AI_PROVIDER === "gemini" ? process.env.GEMINI_API_KEY : process.env.AOAI_API_KEY,
        endpoint: process.env.AOAI_ENDPOINT,
        apiVersion: "2025-04-01-preview"
      },
      // Default model configuration (fallback)
      DEFAULT: {
        model: AI_PROVIDER === "gemini" ? process.env.GEMINI_MODEL || "gemini-1.5-pro" : process.env.AOAI_MODEL || "gpt-4o",
        apiKey: AI_PROVIDER === "gemini" ? process.env.GEMINI_API_KEY : process.env.AOAI_API_KEY,
        endpoint: process.env.AOAI_ENDPOINT,
        apiVersion: "2025-04-01-preview"
      }
    };
  }
});

// src/capabilities/capability.ts
var BaseCapability;
var init_capability = __esm({
  "src/capabilities/capability.ts"() {
    init_config();
    BaseCapability = class {
      constructor(logger2) {
        this.logger = logger2;
      }
      /**
       * Default implementation of processRequest that creates a prompt and sends the request
       */
      async processRequest(context) {
        try {
          const prompt = this.createPrompt(context);
          const response = await prompt.send(context.text);
          return {
            response: response.content || "No response generated"
          };
        } catch (error) {
          return {
            response: "",
            error: error instanceof Error ? error.message : "Unknown error"
          };
        }
      }
      /**
       * Helper method to get model configuration
       */
      getModelConfig(configKey) {
        return getModelConfig(configKey);
      }
    };
  }
});

// src/utils/graph.ts
var GraphClient;
var init_graph = __esm({
  "src/utils/graph.ts"() {
    GraphClient = class {
      constructor(logger2) {
        this.logger = logger2;
        this.appId = process.env.MicrosoftAppId || process.env.BOT_ID || "";
        this.appPassword = process.env.MicrosoftAppPassword || "";
        this.tenantId = process.env.TENANT_ID || "";
        if (!this.appId || !this.appPassword || !this.tenantId) {
          this.logger.error("\u274C GraphClient: Missing required environment variables (AppId, AppPassword, or TenantId)");
        }
      }
      appId;
      appPassword;
      tenantId;
      accessToken = null;
      tokenExpiry = 0;
      async getAccessToken() {
        const now = Date.now();
        if (this.accessToken && now < this.tokenExpiry) {
          return this.accessToken;
        }
        this.logger.debug("\u{1F310} GraphClient: Fetching new access token...");
        const tokenEndpoint = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;
        const body = new URLSearchParams({
          grant_type: "client_credentials",
          client_id: this.appId,
          client_secret: this.appPassword,
          scope: "https://graph.microsoft.com/.default"
        });
        const response = await fetch(tokenEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: body.toString()
        });
        const data = await response.json();
        if (!data.access_token) {
          throw new Error(`GraphClient: Failed to get OAuth token: ${data.error} - ${data.error_description}`);
        }
        this.accessToken = data.access_token;
        this.tokenExpiry = now + data.expires_in * 1e3 - 5 * 60 * 1e3;
        return this.accessToken;
      }
      async getMeetingTranscripts(meetingId) {
        const token = await this.getAccessToken();
        const url = `https://graph.microsoft.com/v1.0/onlineMeetings/${meetingId}/transcripts`;
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!response.ok) {
          const error = await response.text();
          this.logger.error(`\u274C GraphClient: Failed to fetch transcripts for meeting ${meetingId}: ${error}`);
          return [];
        }
        const data = await response.json();
        return data.value || [];
      }
      async getTranscriptContent(meetingId, transcriptId) {
        const token = await this.getAccessToken();
        const url = `https://graph.microsoft.com/v1.0/onlineMeetings/${meetingId}/transcripts/${transcriptId}/content?$format=text/vtt`;
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!response.ok) {
          const error = await response.text();
          this.logger.error(`\u274C GraphClient: Failed to fetch transcript content for ${transcriptId}: ${error}`);
          return null;
        }
        return await response.text();
      }
      /**
       * Helper to get the most recent transcript for a meeting
       */
      async getLatestTranscriptContent(meetingId) {
        try {
          this.logger.debug(`\u{1F310} GraphClient: Looking for transcripts for meeting ${meetingId}`);
          const transcripts = await this.getMeetingTranscripts(meetingId);
          if (transcripts.length === 0) {
            this.logger.warn(`\u26A0\uFE0F GraphClient: No transcripts found for meeting ${meetingId}`);
            return null;
          }
          const latestTranscript = transcripts.sort(
            (a, b) => new Date(b.createdDateTime).getTime() - new Date(a.createdDateTime).getTime()
          )[0];
          this.logger.debug(`\u{1F310} GraphClient: Fetching content for transcript ${latestTranscript.id}`);
          return await this.getTranscriptContent(meetingId, latestTranscript.id);
        } catch (error) {
          this.logger.error(`\u274C GraphClient: Error in getLatestTranscriptContent: ${error}`);
          return null;
        }
      }
    };
  }
});

// src/capabilities/summarizer/meetingMinutes.ts
var meetingMinutes_exports = {};
__export(meetingMinutes_exports, {
  MEETING_MINUTES_CAPABILITY_DEFINITION: () => MEETING_MINUTES_CAPABILITY_DEFINITION,
  MEETING_MINUTES_PROMPT: () => MEETING_MINUTES_PROMPT,
  MeetingMinutesCapability: () => MeetingMinutesCapability
});
var MEETING_MINUTES_PROMPT, MeetingMinutesCapability, MEETING_MINUTES_CAPABILITY_DEFINITION;
var init_meetingMinutes = __esm({
  "src/capabilities/summarizer/meetingMinutes.ts"() {
    init_geminiModel();
    init_config();
    init_graph();
    init_capability();
    MEETING_MINUTES_PROMPT = `
You are an expert meeting assistant. Your task is to generate concise and professional meeting minutes from a provided transcript.
The minutes should include:
1. **Meeting Overview**: Purpose and key participants (if identifiable).
2. **Main Discussion Points**: Summary of the key topics discussed.
3. **Decisions Made**: Clear list of any formal or informal decisions.
4. **Action Items**: Specific tasks assigned, to whom, and deadlines (if mentioned).

Formatting: Use professional Markdown with bold headers and bullet points.
`;
    MeetingMinutesCapability = class extends BaseCapability {
      name = "meetingMinutes";
      graphClient;
      constructor(logger2) {
        super(logger2);
        this.graphClient = new GraphClient(logger2);
      }
      createPrompt(_context) {
        const config = this.getModelConfig("summarizer");
        const model = AI_PROVIDER === "gemini" ? new GeminiChatModel({
          apiKey: config.apiKey,
          model: config.model
        }) : new teams_openai.OpenAIChatModel({
          model: config.model,
          apiKey: config.apiKey,
          endpoint: config.endpoint,
          apiVersion: config.apiVersion
        });
        return new teams_ai.ChatPrompt({
          instructions: MEETING_MINUTES_PROMPT,
          model
        });
      }
      async generateFromTranscript(meetingId) {
        try {
          this.logger.debug(`\u{1F4C4} MeetingMinutes: Fetching transcript for meeting ${meetingId}`);
          const transcript = await this.graphClient.getLatestTranscriptContent(meetingId);
          if (!transcript) {
            return "I couldn't find a transcript for this meeting. Please make sure transcription was enabled.";
          }
          this.logger.debug(`\u{1F4C4} MeetingMinutes: Generating minutes from transcript (${transcript.length} chars)`);
          const config = this.getModelConfig("summarizer");
          const model = AI_PROVIDER === "gemini" ? new GeminiChatModel({
            apiKey: config.apiKey,
            model: config.model
          }) : new teams_openai.OpenAIChatModel({
            model: config.model,
            apiKey: config.apiKey,
            endpoint: config.endpoint,
            apiVersion: config.apiVersion
          });
          const prompt = `${MEETING_MINUTES_PROMPT}

Transcript:
${transcript}`;
          const result = await model.complete(prompt);
          return result || "Failed to generate meeting minutes.";
        } catch (error) {
          this.logger.error(`\u274C MeetingMinutes: Error generating minutes: ${error}`);
          return `An error occurred while generating meeting minutes: ${error instanceof Error ? error.message : String(error)}`;
        }
      }
    };
    MEETING_MINUTES_CAPABILITY_DEFINITION = {
      name: "meetingMinutes",
      manager_desc: `**Meeting Minutes**: Use when the user asks for "meeting minutes", "transcript summary", or to "summarize the last meeting". Use this when they reference a specific meeting or the most recent one.`,
      handler: async (_context, _logger) => {
        return "I am configured to automatically generate minutes at the end of meetings. If you need minutes for a specific meeting, please provide the meeting ID.";
      }
    };
  }
});

// src/agent/manager.ts
init_geminiModel();

// src/capabilities/actionItems/actionItems.ts
init_geminiModel();
init_config();
init_capability();

// src/capabilities/actionItems/prompt.ts
var ACTION_ITEMS_PROMPT = `
You are the Action Items capability of the Collaborator bot. Your role is to analyze team conversations and extract a list of clear action items based on what people said.

<GOAL>
Your job is to generate a concise, readable list of action items mentioned in the conversation. Focus on identifying:
- What needs to be done
- Who will do it (if mentioned)

<EXAMPLES OF ACTION ITEM CLUES>
- "I'll take care of this"
- "Can you follow up on..."
- "Let's finish this by tomorrow"
- "We still need to decide..."
- "Assign this to Alex"
- "We should check with finance"

<OUTPUT FORMAT>
- Return a plain text list of bullet points
- Each item should include a clear task and a person (if known)

<EXAMPLE OUTPUT>
- \u2705 Sarah will create the draft proposal by Friday
- \u2705 Alex will check budget numbers before the meeting
- \u2705 Follow up with IT on access issues
- \u2705 Decide final presenters by end of week

<NOTES>
- If no one is assigned, just describe the task
- Skip greetings or summary text \u2014 just the action items
- Do not assign tasks unless the conversation suggests it

Be clear, helpful, and concise.
`;

// src/capabilities/actionItems/actionItems.ts
var ActionItemsCapability = class extends BaseCapability {
  name = "action_items";
  createPrompt(context) {
    const actionItemsModelConfig = this.getModelConfig("actionItems");
    const model = AI_PROVIDER === "gemini" ? new GeminiChatModel({
      apiKey: actionItemsModelConfig.apiKey,
      model: actionItemsModelConfig.model
    }) : new teams_openai.OpenAIChatModel({
      model: actionItemsModelConfig.model,
      apiKey: actionItemsModelConfig.apiKey,
      endpoint: actionItemsModelConfig.endpoint,
      apiVersion: actionItemsModelConfig.apiVersion
    });
    const prompt = new teams_ai.ChatPrompt({
      instructions: ACTION_ITEMS_PROMPT,
      model
    }).function(
      "generate_action_items",
      "Generate a list of action items based on the conversation",
      async () => {
        const allMessages = await context.memory.getMessagesByTimeRange(
          context.startTime,
          context.endTime
        );
        return JSON.stringify({
          messages: allMessages.map((msg) => ({
            timestamp: msg.timestamp,
            name: msg.name,
            content: msg.content
          }))
        });
      }
    );
    this.logger.debug(
      `Initialized Action Items Capability using ${context.members.length} members from context`
    );
    return prompt;
  }
};
var ACTION_ITEMS_CAPABILITY_DEFINITION = {
  name: "action_items",
  manager_desc: `**Action Items**: Use for requests like:
- "next steps", "to-do", "assign task", "my tasks", "what needs to be done"`,
  handler: async (context, logger2) => {
    const actionItemsCapability = new ActionItemsCapability(logger2);
    const result = await actionItemsCapability.processRequest(context);
    if (result.error) {
      logger2.error(`Error in Action Items Capability: ${result.error}`);
      return `Error in Action Items Capability: ${result.error}`;
    }
    return result.response || "No response from Action Items Capability";
  }
};

// src/capabilities/search/search.ts
init_geminiModel();
init_config();
init_capability();

// src/capabilities/search/prompt.ts
var SEARCH_PROMPT = `
You are the Search capability of the Collaborator. Your role is to help users find specific conversations or messages from their chat history.

You can search through message history to find:
- Conversations between specific people
- Messages about specific topics
- Messages from specific time periods (time ranges will be pre-calculated by the Manager)
- Messages containing specific keywords

When a user asks you to find something, use the search_messages function to search the database.

RESPONSE FORMAT:
- Your search_messages function returns just the text associated with the search results
- Focus on creating a helpful, conversational summary that complements the citations
- Be specific about what was found and provide context about timing and participants
- If no results are found, suggest alternative search terms or broader criteria

Be helpful and conversational in your responses. The user will see both your text response and interactive cards that let them jump to the original messages.
`;

// src/capabilities/search/schema.ts
var SEARCH_MESSAGES_SCHEMA = {
  type: "object",
  properties: {
    keywords: {
      type: "array",
      items: { type: "string" },
      description: "Keywords to search for in the message content"
    },
    participants: {
      type: "array",
      items: { type: "string" },
      description: "Optional: list of participant names to filter messages by who said them"
    },
    max_results: {
      type: "number",
      description: "Optional: maximum number of results to return (default is 5)"
    }
  },
  required: ["keywords"]
};

// src/capabilities/search/search.ts
var dateFormat = new Intl.DateTimeFormat("en-US");
var SearchCapability = class extends BaseCapability {
  name = "search";
  createPrompt(context) {
    const searchModelConfig = this.getModelConfig("search");
    const model = AI_PROVIDER === "gemini" ? new GeminiChatModel({
      apiKey: searchModelConfig.apiKey,
      model: searchModelConfig.model
    }) : new teams_openai.OpenAIChatModel({
      model: searchModelConfig.model,
      apiKey: searchModelConfig.apiKey,
      endpoint: searchModelConfig.endpoint,
      apiVersion: searchModelConfig.apiVersion
    });
    const prompt = new teams_ai.ChatPrompt({
      instructions: SEARCH_PROMPT,
      model
    }).function(
      "search_messages",
      "Search the conversation for relevant messages",
      SEARCH_MESSAGES_SCHEMA,
      async ({ keywords, participants, max_results }) => {
        const selected = await context.memory.getFilteredMessages(
          context.conversationId,
          keywords,
          context.startTime,
          context.endTime,
          participants,
          max_results
        );
        this.logger.debug(selected);
        if (selected.length === 0) {
          return "No matching messages found.";
        }
        const citations = selected.map(
          (msg) => createCitationFromRecord(msg, context.conversationId)
        );
        context.citations.push(...citations);
        return selected.map((msg) => {
          const date = new Date(msg.timestamp).toLocaleString();
          const preview = msg.content.slice(0, 100);
          const citation = citations.find((c) => c.keywords?.includes(msg.name));
          const link = citation?.url || "#";
          return `\u2022 [${msg.name}](${link}) at ${date}: "${preview}"`;
        }).join("\n");
      }
    );
    this.logger.debug("Initialized Search Capability!");
    return prompt;
  }
};
function createDeepLink(activityId, conversationId) {
  const contextParam = encodeURIComponent(JSON.stringify({ contextType: "chat" }));
  return `https://teams.microsoft.com/l/message/${encodeURIComponent(
    conversationId
  )}/${activityId}?context=${contextParam}`;
}
function createCitationFromRecord(message, conversationId) {
  const date = new Date(message.timestamp);
  const formatted = dateFormat.format(date);
  const preview = message.content.length > 120 ? message.content.slice(0, 120) + "..." : message.content;
  const deepLink = createDeepLink(message.activity_id, conversationId);
  return {
    name: `Message from ${message.name}`,
    url: deepLink,
    abstract: `${formatted}: "${preview}"`,
    keywords: [message.name]
  };
}
var SEARCH_CAPABILITY_DEFINITION = {
  name: "search",
  manager_desc: `**Search**: Use for:
- "find", "search", "show me", "conversation with", "where did [person] say", "messages from last week"`,
  handler: async (context, logger2) => {
    const searchCapability = new SearchCapability(logger2);
    const result = await searchCapability.processRequest(context);
    if (result.error) {
      logger2.error(`\u274C Error in Search Capability: ${result.error}`);
      return `Error in Search Capability: ${result.error}`;
    }
    return result.response || "No response from Search Capability";
  }
};

// src/capabilities/summarizer/summarize.ts
init_geminiModel();
init_config();
init_capability();

// src/capabilities/summarizer/prompt.ts
var SUMMARY_PROMPT = `
You are the Summarizer capability of the Collaborator that specializes in analyzing conversations between groups of people.
Your job is to retrieve and analyze conversation messages, then provide structured summaries with proper attribution.

<TIMEZONE AWARENESS>
The system uses the user's actual timezone from Microsoft Teams for all time calculations.
Time ranges will be pre-calculated by the Manager and passed to you as ISO timestamps when needed.

<INSTRUCTIONS>
1. Use the appropriate function to retrieve the messages you need based on the user's request
2. If time ranges are specified in the request, they will be pre-calculated and provided as ISO timestamps
3. If no specific timespan is mentioned, default to the last 24 hours using get_messages_by_time_range
4. Analyze the retrieved messages and identify participants and topics
5. Return a BRIEF summary with proper participant attribution
6. Include participant names in your analysis and summary points
7. Be concise and focus on the key topics discussed

<OUTPUT FORMAT>
- Use bullet points for main topics
- Include participant names when attributing ideas or statements
- Provide a brief overview if requested
`;

// src/capabilities/summarizer/summarize.ts
var SummarizerCapability = class extends BaseCapability {
  name = "summarizer";
  createPrompt(context) {
    const summarizerModelConfig = this.getModelConfig("summarizer");
    const model = AI_PROVIDER === "gemini" ? new GeminiChatModel({
      apiKey: summarizerModelConfig.apiKey,
      model: summarizerModelConfig.model
    }) : new teams_openai.OpenAIChatModel({
      model: summarizerModelConfig.model,
      apiKey: summarizerModelConfig.apiKey,
      endpoint: summarizerModelConfig.endpoint,
      apiVersion: summarizerModelConfig.apiVersion
    });
    const prompt = new teams_ai.ChatPrompt({
      instructions: SUMMARY_PROMPT,
      model
    }).function("summarize_conversation", "Summarize the conversation history", async () => {
      const allMessages = await context.memory.getMessagesByTimeRange(
        context.startTime,
        context.endTime
      );
      return JSON.stringify({
        messages: allMessages.map((msg) => ({
          timestamp: msg.timestamp,
          name: msg.name,
          content: msg.content
        }))
      });
    });
    this.logger.debug("Initialized Summarizer Capability!");
    return prompt;
  }
};
var SUMMARIZER_CAPABILITY_DEFINITION = {
  name: "summarizer",
  manager_desc: `**Summarizer**: Use for keywords like:
- "summarize", "overview", "recap", "conversation history"
- "what did we discuss", "catch me up", "who said what", "recent messages"`,
  handler: async (context, logger2) => {
    const summarizerCapability = new SummarizerCapability(logger2);
    const result = await summarizerCapability.processRequest(context);
    if (result.error) {
      logger2.error(`Error in Summarizer Capability: ${result.error}`);
      return `Error in Summarizer Capability: ${result.error}`;
    }
    return result.response || "No response from Summarizer Capability";
  }
};

// src/capabilities/registry.ts
init_meetingMinutes();
var CAPABILITY_DEFINITIONS = [
  SUMMARIZER_CAPABILITY_DEFINITION,
  ACTION_ITEMS_CAPABILITY_DEFINITION,
  SEARCH_CAPABILITY_DEFINITION,
  MEETING_MINUTES_CAPABILITY_DEFINITION
];

// src/agent/manager.ts
init_config();
function finalizePromptResponse(text, context, logger2) {
  const messageActivity = new teams_api.MessageActivity(text).addAiGenerated().addFeedback();
  if (context.citations && context.citations.length > 0) {
    logger2.debug(`Adding ${context.citations.length} context.citations to message activity`);
    context.citations.forEach((citation, index) => {
      const citationNumber = index + 1;
      messageActivity.addCitation(citationNumber, citation);
      logger2.debug(`Citation number ${citationNumber}`);
      logger2.debug(citation);
      messageActivity.text += ` [${citationNumber}]`;
    });
  }
  return messageActivity;
}
function extractTimeRange(phrase, now = /* @__PURE__ */ new Date()) {
  const results = chrono__namespace.parse(phrase, now);
  if (!results.length || !results[0].start) {
    return null;
  }
  const { start, end } = results[0];
  const from = start.date();
  const to = end?.date() ?? new Date(from.getTime() + 24 * 60 * 60 * 1e3);
  return { from, to };
}
function createMessageRecords(activities) {
  const conversation_id = activities[0].conversation.id;
  return activities.map((activity) => ({
    conversation_id,
    role: activity.entities?.some((e) => e.additionalType?.includes("AIGeneratedContent")) ? "model" : "user",
    content: activity.text?.replace(/<\/?at>/g, "") || "",
    timestamp: activity.timestamp?.toString() || (/* @__PURE__ */ new Date()).toISOString(),
    activity_id: activity.id,
    name: activity.from?.name || "Collaborator"
  }));
}

// src/agent/prompt.ts
function generateManagerPrompt(capabilities) {
  const namesList = capabilities.map((cap, i) => `${i + 1}. **${cap.name}**`).join("\n");
  const capabilityDescriptions = capabilities.map((cap) => `${cap.manager_desc}`).join("\n");
  return `
You are the Manager for the Collaborator \u2014 a Microsoft Teams bot. You coordinate requests by deciding which specialized capability should handle each @mention.

<AVAILABLE CAPABILITIES>
${namesList}

<INSTRUCTIONS>
1. Analyze the request\u2019s intent and route it to the best-matching capability.
2. **If the request includes a time expression**, call calculate_time_range first using the exact phrase (e.g., "last week", "past 2 days").
3. If no capability applies, respond conversationally and describe what Collaborator *can* help with.

<WHEN TO USE EACH CAPABILITY>
Use the following descriptions to determine routing logic. Match based on intent, not just keywords.

${capabilityDescriptions}

<RESPONSE RULE>
When using a function call to delegate, return the capability\u2019s response **as-is**, with no added commentary or explanation. MAKE SURE TO NOT WRAP THE RESPONSE IN QUOTES.

\u2705 GOOD: [capability response]  
\u274C BAD: Here\u2019s what the Summarizer found: [capability response]

<GENERAL RESPONSES>
Be warm and helpful when the request is casual or unclear. Mention your abilities naturally.

\u2705 Hi there! I can help with summaries, task tracking, or finding specific messages.
\u2705 Interesting! I specialize in conversation analysis and action items. Want help with that?
`;
}

// src/agent/manager.ts
var ManagerPrompt = class {
  constructor(context, logger2) {
    this.context = context;
    this.logger = logger2;
  }
  prompt;
  isInitialized = false;
  async createManagerPrompt() {
    const managerModelConfig = getModelConfig("manager");
    const model = AI_PROVIDER === "gemini" ? new GeminiChatModel({
      apiKey: managerModelConfig.apiKey,
      model: managerModelConfig.model
    }) : new teams_openai.OpenAIChatModel({
      model: managerModelConfig.model,
      apiKey: managerModelConfig.apiKey,
      endpoint: managerModelConfig.endpoint,
      apiVersion: managerModelConfig.apiVersion
    });
    const prompt = new teams_ai.ChatPrompt({
      instructions: generateManagerPrompt(CAPABILITY_DEFINITIONS),
      model,
      messages: await this.context.memory.values()
    }).function(
      "calculate_time_range",
      "Parse natural language time expressions and calculate exact start/end times for time-based queries",
      {
        type: "object",
        properties: {
          time_phrase: {
            type: "string",
            description: 'Natural language time expression extracted from the user request (e.g., "yesterday", "last week", "2 days ago", "past 3 hours")'
          }
        },
        required: ["time_phrase"]
      },
      async (time_phrase) => {
        this.logger.debug(`\u{1F552} FUNCTION CALL: calculate_time_range - parsing "${time_phrase}"`);
        const timeRange = extractTimeRange(time_phrase);
        this.context.startTime = timeRange ? timeRange?.from.toISOString() : this.context.endTime;
        this.context.endTime = timeRange ? timeRange?.to.toISOString() : this.context.endTime;
        this.logger.debug(this.context.startTime);
        this.logger.debug(this.context.endTime);
      }
    ).function(
      "clear_conversation_history",
      "Clear conversation history in the database for the current conversation",
      async () => {
        await this.context.memory.clear();
        this.logger.debug("The conversation history has been cleared!");
      }
    );
    return prompt;
  }
  addCapabilities() {
    for (const capability of CAPABILITY_DEFINITIONS) {
      this.prompt.function(
        `delegate_to_${capability.name}`,
        `Delegate to ${capability.name} capability`,
        async () => {
          return capability.handler(this.context, this.logger.child(capability.name));
        }
      );
    }
  }
  async initialize() {
    if (!this.isInitialized) {
      this.prompt = await this.createManagerPrompt();
      this.addCapabilities();
      this.isInitialized = true;
    }
  }
  async processRequest() {
    try {
      await this.initialize();
      const response = await this.prompt.send(this.context.text);
      return {
        response: response.content || "No response generated"
      };
    } catch (error) {
      this.logger.error("\u274C Error in Manager:", error);
      return {
        response: `Sorry, I encountered an error processing your request: ${error instanceof Error ? error.message : "Unknown error"}`
      };
    }
  }
};

// src/storage/storageFactory.ts
init_config();
var MssqlKVStore = class {
  constructor(logger2, config) {
    this.logger = logger2;
    this.config = config;
  }
  pool = null;
  isInitialized = false;
  async initialize() {
    if (this.isInitialized) return;
    try {
      let sqlConfig;
      if (this.config.connectionString) {
        this.pool = new mssql__namespace.ConnectionPool(this.config.connectionString);
      } else {
        sqlConfig = {
          server: this.config.server,
          database: this.config.database,
          user: this.config.username,
          password: this.config.password,
          options: {
            encrypt: true,
            trustServerCertificate: false
          }
        };
        this.pool = new mssql__namespace.ConnectionPool(sqlConfig);
      }
      await this.pool.connect();
      await this.initializeDatabase();
      this.isInitialized = true;
      this.logger.debug("\u2705 Connected to MSSQL database");
    } catch (error) {
      this.logger.error("\u274C Error connecting to MSSQL database:", error);
      throw error;
    }
  }
  async initializeDatabase() {
    if (!this.pool) throw new Error("Database not connected");
    try {
      await this.pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='conversations' AND xtype='U')
        BEGIN
          CREATE TABLE conversations (
            id INT IDENTITY(1,1) PRIMARY KEY,
            conversation_id NVARCHAR(255) NOT NULL,
            role NVARCHAR(50) NOT NULL,
            name NVARCHAR(255) NOT NULL,
            content NVARCHAR(MAX) NOT NULL,
            activity_id NVARCHAR(255) NOT NULL,
            timestamp NVARCHAR(50) NOT NULL,
            blob NVARCHAR(MAX) NOT NULL
          )
        END
      `);
      await this.pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_conversation_id' AND object_id = OBJECT_ID('conversations'))
        BEGIN
          CREATE INDEX idx_conversation_id ON conversations(conversation_id)
        END
      `);
      await this.pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='feedback' AND xtype='U')
        BEGIN
          CREATE TABLE feedback (
            id INT IDENTITY(1,1) PRIMARY KEY,
            reply_to_id NVARCHAR(255) NOT NULL,
            reaction NVARCHAR(50) NOT NULL CHECK (reaction IN ('like','dislike')),
            feedback NVARCHAR(MAX),
            created_at DATETIME NOT NULL DEFAULT GETDATE()
          )
        END
      `);
      this.logger.debug("\u2705 Database tables initialized");
    } catch (error) {
      this.logger.error("\u274C Error initializing database tables:", error);
      throw error;
    }
  }
  async clearAll() {
    if (!this.pool) throw new Error("Database not connected");
    try {
      await this.pool.request().query("DELETE FROM conversations");
      this.logger.debug("\u{1F9F9} Cleared all conversations from MSSQL store.");
    } catch (error) {
      this.logger.error("\u274C Error clearing all conversations:", error);
      throw error;
    }
  }
  async get(conversationId) {
    if (!this.pool) throw new Error("Database not connected");
    try {
      const result = await this.pool.request().input("conversationId", mssql__namespace.NVarChar, conversationId).query(
        "SELECT blob FROM conversations WHERE conversation_id = @conversationId ORDER BY timestamp ASC"
      );
      return result.recordset.map((row) => JSON.parse(row.blob));
    } catch (error) {
      this.logger.error("\u274C Error getting messages:", error);
      return [];
    }
  }
  async getMessagesByTimeRange(conversationId, startTime, endTime) {
    if (!this.pool) throw new Error("Database not connected");
    try {
      const result = await this.pool.request().input("conversationId", mssql__namespace.NVarChar, conversationId).input("startTime", mssql__namespace.NVarChar, startTime).input("endTime", mssql__namespace.NVarChar, endTime).query(`
          SELECT blob FROM conversations 
          WHERE conversation_id = @conversationId 
            AND timestamp >= @startTime 
            AND timestamp <= @endTime 
          ORDER BY timestamp ASC
        `);
      return result.recordset.map((row) => JSON.parse(row.blob));
    } catch (error) {
      this.logger.error("\u274C Error getting messages by time range:", error);
      return [];
    }
  }
  async getRecentMessages(conversationId, limit = 10) {
    const messages = await this.get(conversationId);
    return messages.slice(-limit);
  }
  async clearConversation(conversationId) {
    if (!this.pool) throw new Error("Database not connected");
    try {
      await this.pool.request().input("conversationId", mssql__namespace.NVarChar, conversationId).query("DELETE FROM conversations WHERE conversation_id = @conversationId");
    } catch (error) {
      this.logger.error("\u274C Error clearing conversation:", error);
      throw error;
    }
  }
  async addMessages(messages) {
    if (!this.pool) throw new Error("Database not connected");
    try {
      const transaction = new mssql__namespace.Transaction(this.pool);
      await transaction.begin();
      try {
        for (const message of messages) {
          await transaction.request().input("conversationId", mssql__namespace.NVarChar, message.conversation_id).input("role", mssql__namespace.NVarChar, message.role).input("name", mssql__namespace.NVarChar, message.name).input("content", mssql__namespace.NVarChar, message.content).input("activityId", mssql__namespace.NVarChar, message.activity_id).input("timestamp", mssql__namespace.NVarChar, message.timestamp).input("blob", mssql__namespace.NVarChar, JSON.stringify(message)).query(`
              INSERT INTO conversations (conversation_id, role, name, content, activity_id, timestamp, blob)
              VALUES (@conversationId, @role, @name, @content, @activityId, @timestamp, @blob)
            `);
        }
        await transaction.commit();
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      this.logger.error("\u274C Error adding messages:", error);
      throw error;
    }
  }
  async countMessages(conversationId) {
    if (!this.pool) throw new Error("Database not connected");
    try {
      const result = await this.pool.request().input("conversationId", mssql__namespace.NVarChar, conversationId).query(
        "SELECT COUNT(*) as count FROM conversations WHERE conversation_id = @conversationId"
      );
      return result.recordset[0].count;
    } catch (error) {
      this.logger.error("\u274C Error counting messages:", error);
      return 0;
    }
  }
  async clearAllMessages() {
    await this.clearAll();
  }
  async getFilteredMessages(conversationId, keywords, startTime, endTime, participants, maxResults = 5) {
    if (!this.pool) throw new Error("Database not connected");
    try {
      const request = this.pool.request();
      let whereClause = "conversation_id = @conversationId AND timestamp >= @startTime AND timestamp <= @endTime";
      request.input("conversationId", mssql__namespace.NVarChar, conversationId);
      request.input("startTime", mssql__namespace.NVarChar, startTime);
      request.input("endTime", mssql__namespace.NVarChar, endTime);
      request.input("maxResults", mssql__namespace.Int, maxResults);
      if (keywords.length > 0) {
        const keywordConditions = keywords.map((_, index) => {
          request.input(`keyword${index}`, mssql__namespace.NVarChar, `%${keywords[index].toLowerCase()}%`);
          return `content LIKE @keyword${index}`;
        }).join(" OR ");
        whereClause += ` AND (${keywordConditions})`;
      }
      if (participants && participants.length > 0) {
        const participantConditions = participants.map((_, index) => {
          request.input(
            `participant${index}`,
            mssql__namespace.NVarChar,
            `%${participants[index].toLowerCase()}%`
          );
          return `name LIKE @participant${index}`;
        }).join(" OR ");
        whereClause += ` AND (${participantConditions})`;
      }
      const query = `
        SELECT TOP (@maxResults) blob FROM conversations
        WHERE ${whereClause}
        ORDER BY timestamp DESC
      `;
      const result = await request.query(query);
      return result.recordset.map((row) => JSON.parse(row.blob));
    } catch (error) {
      this.logger.error("\u274C Error getting filtered messages:", error);
      return [];
    }
  }
  async recordFeedback(replyToId, reaction, feedbackJson) {
    if (!this.pool) throw new Error("Database not connected");
    try {
      await this.pool.request().input("replyToId", mssql__namespace.NVarChar, replyToId).input("reaction", mssql__namespace.NVarChar, reaction).input("feedback", mssql__namespace.NVarChar, feedbackJson ? JSON.stringify(feedbackJson) : null).query(`
          INSERT INTO feedback (reply_to_id, reaction, feedback)
          VALUES (@replyToId, @reaction, @feedback)
        `);
      return true;
    } catch (error) {
      this.logger.error("\u274C Error recording feedback:", error);
      return false;
    }
  }
  async close() {
    if (this.pool) {
      await this.pool.close();
      this.pool = null;
      this.isInitialized = false;
      this.logger.debug("\u{1F50C} Closed MSSQL database connection");
    }
  }
};
var SqliteKVStore = class {
  constructor(logger2, dbPath) {
    this.logger = logger2;
    const resolvedDbPath = process.env.CONVERSATIONS_DB_PATH ? path__default.default.resolve(process.env.CONVERSATIONS_DB_PATH) : dbPath ? dbPath : path__default.default.resolve("/tmp/conversations.db");
    try {
      this.db = new Database__default.default(resolvedDbPath);
      this.logger.debug(`\u2705 Opened SQLite database at: ${resolvedDbPath}`);
      this.initializeDatabase();
    } catch (error) {
      this.logger.error(`\u274C Failed to open SQLite database at ${resolvedDbPath}:`, error);
      throw error;
    }
  }
  db;
  async initialize() {
    return Promise.resolve();
  }
  initializeDatabase() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS conversations (
        conversation_id TEXT NOT NULL,
        role TEXT NOT NULL,
        name TEXT NOT NULL,
        content TEXT NOT NULL,
        activity_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        blob TEXT NOT NULL
      )
    `);
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_conversation_id ON conversations(conversation_id);
    `);
    this.db.exec(`
    CREATE TABLE IF NOT EXISTS feedback (
    reply_to_id  TEXT    NOT NULL,                -- the Teams message ID you replied to
    reaction     TEXT    NOT NULL CHECK (reaction IN ('like','dislike')),
    feedback     TEXT,                           -- JSON or plain text
    created_at   TEXT    NOT NULL DEFAULT (CURRENT_TIMESTAMP)
  );
    `);
  }
  clearAll() {
    this.db.exec("DELETE FROM conversations; VACUUM;");
    this.logger.debug("\u{1F9F9} Cleared all conversations from SQLite store.");
  }
  get(conversationId) {
    const stmt = this.db.prepare(
      "SELECT blob FROM conversations WHERE conversation_id = ? ORDER BY timestamp ASC"
    );
    return stmt.all(conversationId).map((row) => JSON.parse(row.blob));
  }
  getMessagesByTimeRange(conversationId, startTime, endTime) {
    const stmt = this.db.prepare(
      "SELECT blob FROM conversations WHERE conversation_id = ? AND timestamp >= ? AND timestamp <= ? ORDER BY timestamp ASC"
    );
    return stmt.all([conversationId, startTime, endTime]).map((row) => JSON.parse(row.blob));
  }
  getRecentMessages(conversationId, limit = 10) {
    const messages = this.get(conversationId);
    return messages.slice(-limit);
  }
  clearConversation(conversationId) {
    const stmt = this.db.prepare("DELETE FROM conversations WHERE conversation_id = ?");
    stmt.run(conversationId);
  }
  addMessages(messages) {
    const stmt = this.db.prepare(
      "INSERT INTO conversations (conversation_id, role, name, content, activity_id, timestamp, blob) VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    for (const message of messages) {
      stmt.run(
        message.conversation_id,
        message.role,
        message.name,
        message.content,
        message.activity_id,
        message.timestamp,
        JSON.stringify(message)
      );
    }
  }
  countMessages(conversationId) {
    const stmt = this.db.prepare(
      "SELECT COUNT(*) as count FROM conversations WHERE conversation_id = ?"
    );
    const result = stmt.get(conversationId);
    return result.count;
  }
  // Clear all messages for debugging (optional utility method)
  clearAllMessages() {
    try {
      const stmt = this.db.prepare("DELETE FROM conversations");
      const result = stmt.run();
      this.logger.debug(
        `\u{1F9F9} Cleared all conversations from database. Deleted ${result.changes} records.`
      );
    } catch (error) {
      this.logger.error("\u274C Error clearing all conversations:", error);
    }
  }
  getFilteredMessages(conversationId, keywords, startTime, endTime, participants, maxResults) {
    const keywordClauses = keywords.map(() => `content LIKE ?`).join(" OR ");
    const participantClauses = participants?.map(() => `name LIKE ?`).join(" OR ");
    const whereClauses = [
      `conversation_id = ?`,
      `timestamp >= ?`,
      `timestamp <= ?`,
      `(${keywordClauses})`
    ];
    const values = [
      conversationId,
      startTime,
      endTime,
      ...keywords.map((k) => `%${k.toLowerCase()}%`)
    ];
    if (participants && participants.length > 0) {
      whereClauses.push(`(${participantClauses})`);
      values.push(...participants.map((p) => `%${p.toLowerCase()}%`));
    }
    const limit = maxResults && typeof maxResults === "number" ? maxResults : 5;
    values.push(limit);
    const query = `
  SELECT blob FROM conversations
  WHERE ${whereClauses.join(" AND ")}
  ORDER BY timestamp DESC
  LIMIT ?
`;
    const stmt = this.db.prepare(query);
    const rows = stmt.all(...values);
    return rows.map((row) => JSON.parse(row.blob));
  }
  // ===== FEEDBACK MANAGEMENT =====
  // Initialize feedback record for a message with optional delegated capability
  // Insert one row per submission
  recordFeedback(replyToId, reaction, feedbackJson) {
    try {
      const stmt = this.db.prepare(`
      INSERT INTO feedback (reply_to_id, reaction, feedback)
      VALUES (?, ?, ?)
    `);
      const result = stmt.run(
        replyToId,
        reaction,
        feedbackJson ? JSON.stringify(feedbackJson) : null
      );
      return result.changes > 0;
    } catch (err) {
      this.logger.error(`\u274C recordFeedback error:`, err);
      return false;
    }
  }
  close() {
    if (this.db) {
      this.db.close();
      this.logger.debug("\u{1F50C} Closed SQLite database connection");
    }
  }
};

// src/storage/storageFactory.ts
var StorageFactory = class {
  static async createStorage(logger2, config) {
    const dbConfig = config || DATABASE_CONFIG;
    let storage2;
    if (dbConfig.type === "mssql") {
      try {
        logger2.debug("\u{1F527} Initializing MSSQL storage...");
        storage2 = new MssqlKVStore(logger2.child("mssql"), dbConfig);
        await storage2.initialize();
        logger2.debug("\u2705 MSSQL storage initialized successfully");
        return storage2;
      } catch (error) {
        logger2.warn("\u26A0\uFE0F Failed to initialize MSSQL storage, falling back to SQLite:", error);
      }
    }
    logger2.debug("\u{1F527} Initializing SQLite storage...");
    try {
      storage2 = new SqliteKVStore(logger2.child("sqlite"), dbConfig.sqlitePath);
      await storage2.initialize();
      logger2.debug("\u2705 SQLite storage initialized successfully");
      return storage2;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      logger2.error("\u274C Failed to initialize SQLite storage:", errorMessage);
      throw new Error(`Storage initialization failed: ${errorMessage}`);
    }
  }
};

// src/index.ts
init_config();

// src/storage/conversationMemory.ts
var ConversationMemory = class {
  constructor(store, conversationId) {
    this.store = store;
    this.conversationId = conversationId;
  }
  async addMessages(messages) {
    await this.store.addMessages(messages);
  }
  async values() {
    const result = this.store.get(this.conversationId);
    return Promise.resolve(result).then((messages) => messages || []);
  }
  async length() {
    const result = this.store.countMessages(this.conversationId);
    return Promise.resolve(result);
  }
  async clear() {
    await this.store.clearConversation(this.conversationId);
  }
  async getMessagesByTimeRange(startTime, endTime) {
    const result = this.store.getMessagesByTimeRange(this.conversationId, startTime, endTime);
    return Promise.resolve(result);
  }
  async getRecentMessages(limit) {
    const result = this.store.getRecentMessages(this.conversationId, limit);
    return Promise.resolve(result);
  }
  async getFilteredMessages(conversationId, keywords, startTime, endTime, participants, maxResults) {
    const result = this.store.getFilteredMessages(
      conversationId,
      keywords,
      startTime,
      endTime,
      participants,
      maxResults
    );
    return Promise.resolve(result);
  }
};

// src/utils/messageContext.ts
async function getConversationParticipantsFromAPI(api, conversationId) {
  try {
    const members = await api.conversations.members(conversationId).get();
    if (Array.isArray(members)) {
      const participants = members.map((member) => ({
        name: member.name || "Unknown",
        id: member.aadObjectId || member.id
      }));
      return participants;
    } else {
      return [];
    }
  } catch (error) {
    return [];
  }
}
async function createMessageContext(storage2, activity, api) {
  const text = activity.text || "";
  const conversationId = `${activity.conversation.id}`;
  const userId = activity.from.id;
  const userName = activity.from.name || "User";
  const timestamp = activity.timestamp?.toString() || "Unknown";
  const isPersonalChat = activity.conversation.conversationType === "personal";
  const activityId = activity.id;
  let members = [];
  if (api) {
    members = await getConversationParticipantsFromAPI(api, conversationId);
  }
  const memory = new ConversationMemory(storage2, conversationId);
  const now = /* @__PURE__ */ new Date();
  const startTime = new Date(now.getTime() - 24 * 60 * 60 * 1e3).toISOString();
  const endTime = now.toISOString();
  const citations = [];
  const context = {
    text,
    conversationId,
    userId,
    userName,
    timestamp,
    isPersonalChat,
    activityId,
    members,
    memory,
    startTime,
    endTime,
    citations
  };
  return context;
}

// src/index.ts
var logger = new teams_common.ConsoleLogger("collaborator", { level: "debug" });
var createTokenFactory = () => {
  return async (scope, tenantId) => {
    const managedIdentityCredential = new identity.ManagedIdentityCredential({
      clientId: process.env.CLIENT_ID
    });
    const scopes = Array.isArray(scope) ? scope : [scope];
    const tokenResponse = await managedIdentityCredential.getToken(scopes, {
      tenantId
    });
    return tokenResponse.token;
  };
};
var isProduction = process.env.RUNNING_ON_AZURE === "1" || process.env.RAILWAY_ENVIRONMENT !== void 0 || process.env.MicrosoftAppId && process.env.MicrosoftAppPassword;
var appOptions;
if (process.env.BOT_TYPE === "UserAssignedMsi") {
  const tokenCredentials = {
    clientId: process.env.CLIENT_ID || "",
    token: createTokenFactory()
  };
  appOptions = { ...tokenCredentials };
} else if (isProduction && process.env.MicrosoftAppId && process.env.MicrosoftAppPassword) {
  const appId = process.env.MicrosoftAppId;
  const appPassword = process.env.MicrosoftAppPassword;
  const tokenFactory = async (scope) => {
    const resolvedScope = Array.isArray(scope) ? scope.join(" ") : scope;
    const tenantId = process.env.TENANT_ID || "botframework.com";
    const tokenEndpoint = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: appId,
      client_secret: appPassword,
      scope: resolvedScope || "https://api.botframework.com/.default"
    });
    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString()
    });
    const data = await response.json();
    if (!data.access_token) {
      throw new Error(`Failed to get OAuth token: ${data.error} - ${data.error_description}`);
    }
    return data.access_token;
  };
  appOptions = {
    clientId: appId,
    token: tokenFactory
  };
} else {
  appOptions = { plugins: [new teams_dev.DevtoolsPlugin()] };
}
var app = new teams_apps.App({
  ...appOptions,
  logger
});
var storage;
var feedbackStorage;
async function initializeStorage() {
  if (!storage) {
    try {
      validateEnvironment(logger);
      logModelConfigs(logger);
      storage = await StorageFactory.createStorage(logger.child("storage"));
      feedbackStorage = storage;
      logger.debug("\u2705 Storage initialized successfully");
    } catch (error) {
      console.error("\u274C FATAL ERROR IN INITIALIZE STORAGE:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`\u274C Configuration error: Failed to initialize storage: ${errorMessage}`);
      throw error;
    }
  }
  return storage;
}
app.on("message.submit.feedback", async ({ activity }) => {
  try {
    const { reaction, feedback: feedbackJson } = activity.value.actionValue;
    if (!activity.replyToId) {
      logger.warn(`No replyToId found for messageId ${activity.id}`);
      return;
    }
    const success = await feedbackStorage.recordFeedback(
      activity.replyToId,
      reaction,
      feedbackJson
    );
    if (success) {
      logger.debug(`\u2705 Successfully recorded feedback for message ${activity.replyToId}`);
    } else {
      logger.warn(`Failed to record feedback for message ${activity.replyToId}`);
    }
  } catch (error) {
    logger.error(
      `Error processing feedback: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
});
app.on("message", async ({ send, activity, api }) => {
  const isGroup = activity.conversation.isGroup;
  const botMentioned = activity.entities?.some((e) => e.type === "mention");
  logger.debug(`\u{1F4E9} Message received. Group: ${isGroup}, Mentioned: ${botMentioned}, Activity Type: ${activity.type}`);
  const context = botMentioned ? await createMessageContext(storage, activity, api) : await createMessageContext(storage, activity);
  let trackedMessages;
  if (!activity.conversation.isGroup || botMentioned) {
    await send({ type: "typing" });
    const manager = new ManagerPrompt(context, logger.child("manager"));
    const result = await manager.processRequest();
    const formattedResult = finalizePromptResponse(result.response, context, logger);
    const sent = await send(formattedResult);
    formattedResult.id = sent.id;
    trackedMessages = createMessageRecords([activity, formattedResult]);
  } else {
    trackedMessages = createMessageRecords([activity]);
  }
  logger.debug(trackedMessages);
  await context.memory.addMessages(trackedMessages);
});
app.on("install.add", async ({ send }) => {
  await send(
    "\u{1F44B} Hi! I'm the Collab Agent \u{1F680}. I'll listen to the conversation and can provide summaries, action items, or search for a message when asked!"
  );
});
app.on("meetingEnd", async ({ activity, send }) => {
  try {
    const value = activity.value;
    const meetingId = value?.id;
    const meetingTitle = value?.title || "Meeting";
    logger.debug(`\u{1F3C1} Meeting end event received: ${meetingId} (${meetingTitle})`);
    if (!meetingId) {
      logger.warn("\u26A0\uFE0F Meeting end event received but no meeting ID found in activity.value.");
      logger.debug(JSON.stringify(activity, null, 3));
      return;
    }
    logger.debug(`\u{1F552} Waiting 30s for transcript to finalize...`);
    await new Promise((resolve) => setTimeout(resolve, 3e4));
    const { MeetingMinutesCapability: MeetingMinutesCapability2 } = await Promise.resolve().then(() => (init_meetingMinutes(), meetingMinutes_exports));
    const minutesCapability = new MeetingMinutesCapability2(logger.child("meetingMinutes_auto"));
    await send({ type: "typing" });
    const minutes = await minutesCapability.generateFromTranscript(meetingId);
    await send(`## \u{1F4CB} Minutes for ${meetingTitle}

${minutes}`);
    logger.debug(`\u2705 Successfully posted minutes for meeting ${meetingId}`);
  } catch (error) {
    logger.error(`\u274C Error processing meetingEnd: ${error instanceof Error ? error.message : "Unknown error"}`);
    logger.debug(error instanceof Error ? error.stack : "");
  }
});
if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME && !process.env.FUNCTION_NAME) {
  (async () => {
    const port = process.env.PORT || process.env.port || 3978;
    try {
      await initializeStorage();
    } catch (error) {
      console.error("\u274C Failed to initialize storage during startup:", error);
      process.exit(1);
    }
    await app.start(port);
    logger.debug(`\u{1F680} Collab Agent started on port ${port}`);
  })();
}
var index_default = app;

exports.app = app;
exports.default = index_default;
exports.initializeStorage = initializeStorage;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map