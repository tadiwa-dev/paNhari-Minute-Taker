import { ManagedIdentityCredential } from "@azure/identity";
import { TokenCredentials } from "@microsoft/teams.api";
import { App, IActivityContext } from "@microsoft/teams.apps";
import { ConsoleLogger } from "@microsoft/teams.common";
import { DevtoolsPlugin } from "@microsoft/teams.dev";
import { ManagerPrompt } from "./agent/manager";
import { IDatabase } from "./storage/database";
import { StorageFactory } from "./storage/storageFactory";
import { logModelConfigs, validateEnvironment } from "./utils/config";
import { createMessageContext } from "./utils/messageContext";
import { createMessageRecords, finalizePromptResponse } from "./utils/utils";

const logger = new ConsoleLogger("collaborator", { level: "debug" });

const createTokenFactory = () => {
  return async (scope: string | string[], tenantId?: string): Promise<string> => {
    const managedIdentityCredential = new ManagedIdentityCredential({
      clientId: process.env.CLIENT_ID,
    });
    const scopes = Array.isArray(scope) ? scope : [scope];
    const tokenResponse = await managedIdentityCredential.getToken(scopes, {
      tenantId: tenantId,
    });

    return tokenResponse.token;
  };
};

// Determine the correct app options based on environment
const isProduction = process.env.RUNNING_ON_AZURE === "1" || process.env.RAILWAY_ENVIRONMENT !== undefined || (process.env.MicrosoftAppId && process.env.MicrosoftAppPassword);

let appOptions: object;
if (process.env.BOT_TYPE === "UserAssignedMsi") {
  // Azure managed identity
  const tokenCredentials: TokenCredentials = {
    clientId: process.env.CLIENT_ID || "",
    token: createTokenFactory(),
  };
  appOptions = { ...tokenCredentials };
} else if (isProduction && process.env.MicrosoftAppId && process.env.MicrosoftAppPassword) {
  // Production (Railway/cloud) - implement proper OAuth token factory
  const appId = process.env.MicrosoftAppId!;
  const appPassword = process.env.MicrosoftAppPassword!;
  const tokenFactory = async (scope: string | string[]): Promise<string> => {
    const resolvedScope = Array.isArray(scope) ? scope.join(' ') : scope;
    // Use tenant-specific endpoint for single-tenant, botframework.com for multi-tenant
    const tenantId = process.env.TENANT_ID || 'botframework.com';
    const tokenEndpoint = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: appId,
      client_secret: appPassword,
      scope: resolvedScope || 'https://api.botframework.com/.default',
    });
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    const data = await response.json() as { access_token?: string; error?: string; error_description?: string };
    if (!data.access_token) {
      throw new Error(`Failed to get OAuth token: ${data.error} - ${data.error_description}`);
    }
    return data.access_token;
  };
  appOptions = {
    clientId: appId,
    token: tokenFactory,
  };
} else {
  // Local development only
  appOptions = { plugins: [new DevtoolsPlugin()] };
}

const app = new App({
  ...appOptions,
  logger,
});

// Global logging for ALL activities to debug connectivity
app.use(async (context: IActivityContext) => {
  const activity = context.activity;
  logger.debug(`🔍 ACTIVITY RECEIVED: { type: ${activity.type}, conversationType: ${activity.conversation?.conversationType}, isGroup: ${activity.conversation?.isGroup} }`);
  return await context.next();
});

// Initialize storage
let storage: IDatabase;
let feedbackStorage: IDatabase;

// Initialize storage at module load (for Vercel support)
async function initializeStorage() {
  if (!storage) {
    try {
      validateEnvironment(logger);
      logModelConfigs(logger);
      storage = await StorageFactory.createStorage(logger.child("storage"));
      feedbackStorage = storage;
      logger.debug("✅ Storage initialized successfully");
    } catch (error) {
      console.error("❌ FATAL ERROR IN INITIALIZE STORAGE:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`❌ Configuration error: Failed to initialize storage: ${errorMessage}`);
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
      logger.debug(`✅ Successfully recorded feedback for message ${activity.replyToId}`);
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

  logger.debug(`📩 Message received. Group: ${isGroup}, Mentioned: ${botMentioned}, Activity Type: ${activity.type}`);

  const context = botMentioned
    ? await createMessageContext(storage, activity, api)
    : await createMessageContext(storage, activity);

  let trackedMessages;

  if (!activity.conversation.isGroup || botMentioned) {
    // process request if One-on-One chat or if @mentioned in Groupchat
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
    "👋 Hi! I'm the Collab Agent 🚀. I'll listen to the conversation and can provide summaries, action items, or search for a message when asked!"
  );
});

// Automatically handle meeting end events
// Automatically handle meeting end events
app.on("meetingEnd", async ({ activity, send }) => {
  try {
    const value = activity.value as any;
    const meetingId = value?.id;
    const meetingTitle = value?.title || "Meeting";

    logger.debug(`🏁 Meeting end event received: ${meetingId} (${meetingTitle})`);

    if (!meetingId) {
      logger.warn("⚠️ Meeting end event received but no meeting ID found in activity.value.");
      logger.debug(JSON.stringify(activity, null, 3));
      return;
    }

    logger.debug(`🕒 Waiting 30s for transcript to finalize...`);

    // We need to wait a bit for the transcript to be generated by Teams
    await new Promise(resolve => setTimeout(resolve, 30000)); // 30 seconds delay

    const { MeetingMinutesCapability } = await import("./capabilities/summarizer/meetingMinutes.js");
    const minutesCapability = new MeetingMinutesCapability(logger.child("meetingMinutes_auto"));

    // Send typing indicator
    await send({ type: "typing" });

    const minutes = await minutesCapability.generateFromTranscript(meetingId);

    await send(`## 📋 Minutes for ${meetingTitle}\n\n${minutes}`);

    logger.debug(`✅ Successfully posted minutes for meeting ${meetingId}`);
  } catch (error) {
    logger.error(`❌ Error processing meetingEnd: ${error instanceof Error ? error.message : "Unknown error"}`);
    logger.debug(error instanceof Error ? error.stack : "");
  }
});

// Only start the server if NOT in a serverless environment (Vercel, Lambda, etc.)
if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME && !process.env.FUNCTION_NAME) {
  (async () => {
    const port = process.env.PORT || process.env.port || 3978;

    try {
      await initializeStorage();
    } catch (error) {
      console.error("❌ Failed to initialize storage during startup:", error);
      process.exit(1);
    }

    await app.start(port);

    logger.debug(`🚀 Collab Agent started on port ${port}`);
  })();
}

// Export for serverless environments (e.g., Vercel)
export { app, initializeStorage };
export default app;
