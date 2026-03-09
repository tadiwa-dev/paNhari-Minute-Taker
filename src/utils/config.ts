import { ILogger } from "@microsoft/teams.common";

// Determine if we're using Gemini or Azure OpenAI
export const AI_PROVIDER = process.env.AI_PROVIDER || "azure-openai";

// Configuration for AI models used by different capabilities
export interface ModelConfig {
  model: string;
  apiKey: string;
  endpoint?: string;
  apiVersion?: string;
}

// Database configuration
export interface DatabaseConfig {
  type: "sqlite" | "mssql";
  connectionString?: string;
  server?: string;
  database?: string;
  username?: string;
  password?: string;
  sqlitePath?: string;
}

// Database configuration
export const DATABASE_CONFIG: DatabaseConfig = {
  type: process.env.RUNNING_ON_AZURE === "1" ? "mssql" : "sqlite",
  connectionString: process.env.SQL_CONNECTION_STRING,
  server: process.env.SQL_SERVER,
  database: process.env.SQL_DATABASE,
  username: process.env.SQL_USERNAME,
  password: process.env.SQL_PASSWORD,
  sqlitePath: process.env.CONVERSATIONS_DB_PATH,
};

// Model configurations for different capabilities
export const AI_MODELS = {
  // Manager Capability - Uses lighter, faster model for routing decisions
  MANAGER: {
    model: AI_PROVIDER === "gemini" ? (process.env.GEMINI_MODEL || "gemini-1.5-flash") : "gpt-4o-mini",
    apiKey: AI_PROVIDER === "gemini" ? process.env.GEMINI_API_KEY! : process.env.AOAI_API_KEY!,
    endpoint: process.env.AOAI_ENDPOINT,
    apiVersion: "2025-04-01-preview",
  } as ModelConfig,

  // Summarizer Capability - Uses more capable model for complex analysis
  SUMMARIZER: {
    model: AI_PROVIDER === "gemini" ? (process.env.GEMINI_MODEL || "gemini-1.5-pro") : (process.env.AOAI_MODEL || "gpt-4o"),
    apiKey: AI_PROVIDER === "gemini" ? process.env.GEMINI_API_KEY! : process.env.AOAI_API_KEY!,
    endpoint: process.env.AOAI_ENDPOINT,
    apiVersion: "2025-04-01-preview",
  } as ModelConfig,

  // Action Items Capability - Uses capable model for analysis and task management
  ACTION_ITEMS: {
    model: AI_PROVIDER === "gemini" ? (process.env.GEMINI_MODEL || "gemini-1.5-pro") : (process.env.AOAI_MODEL || "gpt-4o"),
    apiKey: AI_PROVIDER === "gemini" ? process.env.GEMINI_API_KEY! : process.env.AOAI_API_KEY!,
    endpoint: process.env.AOAI_ENDPOINT,
    apiVersion: "2025-04-01-preview",
  } as ModelConfig,

  // Search Capability - Uses capable model for semantic search and deep linking
  SEARCH: {
    model: AI_PROVIDER === "gemini" ? (process.env.GEMINI_MODEL || "gemini-1.5-pro") : (process.env.AOAI_MODEL || "gpt-4o"),
    apiKey: AI_PROVIDER === "gemini" ? process.env.GEMINI_API_KEY! : process.env.AOAI_API_KEY!,
    endpoint: process.env.AOAI_ENDPOINT,
    apiVersion: "2025-04-01-preview",
  } as ModelConfig,

  // Default model configuration (fallback)
  DEFAULT: {
    model: AI_PROVIDER === "gemini" ? (process.env.GEMINI_MODEL || "gemini-1.5-pro") : (process.env.AOAI_MODEL || "gpt-4o"),
    apiKey: AI_PROVIDER === "gemini" ? process.env.GEMINI_API_KEY! : process.env.AOAI_API_KEY!,
    endpoint: process.env.AOAI_ENDPOINT,
    apiVersion: "2025-04-01-preview",
  } as ModelConfig,
};

// Helper function to get model config for a specific capability
export function getModelConfig(capabilityType: string): ModelConfig {
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

// Environment validation
export function validateEnvironment(logger: ILogger): void {
  const requiredEnvVars = AI_PROVIDER === "gemini" ? ["GEMINI_API_KEY"] : ["AOAI_API_KEY", "AOAI_ENDPOINT"];
  const missing = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  logger.debug(`🔑 Using AI Provider: ${AI_PROVIDER.toUpperCase()}`);

  // Validate database configuration
  if (DATABASE_CONFIG.type === "mssql") {
    const sqlRequiredVars = ["SQL_CONNECTION_STRING"];
    const sqlMissing = sqlRequiredVars.filter((envVar) => !process.env[envVar]);
    if (sqlMissing.length > 0) {
      logger.warn(
        `SQL Server configuration incomplete. Missing: ${sqlMissing.join(
          ", "
        )}. Falling back to SQLite.`
      );
      DATABASE_CONFIG.type = "sqlite";
    } else {
      logger.debug("✅ SQL Server configuration validated");
    }
  }

  logger.debug(`📦 Using database: ${DATABASE_CONFIG.type}`);
  logger.debug("✅ Environment validation passed");
}

// Model configuration logging
export function logModelConfigs(logger: ILogger): void {
  logger.debug("🔧 AI Model Configuration:");
  logger.debug(`  Provider: ${AI_PROVIDER.toUpperCase()}`);
  logger.debug(`  Manager Capability: ${AI_MODELS.MANAGER.model}`);
  logger.debug(`  Summarizer Capability: ${AI_MODELS.SUMMARIZER.model}`);
  logger.debug(`  Action Items Capability: ${AI_MODELS.ACTION_ITEMS.model}`);
  logger.debug(`  Search Capability: ${AI_MODELS.SEARCH.model}`);
  logger.debug(`  Default Model: ${AI_MODELS.DEFAULT.model}`);
}
