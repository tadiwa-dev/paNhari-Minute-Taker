import { ChatPrompt } from "@microsoft/teams.ai";
import { ILogger } from "@microsoft/teams.common";
import { OpenAIChatModel } from "@microsoft/teams.openai";
import { GeminiChatModel } from "../../ai/geminiModel";
import { AI_PROVIDER } from "../../utils/config";
import { MessageContext } from "../../utils/messageContext";
import { GraphClient } from "../../utils/graph";
import { BaseCapability, CapabilityDefinition } from "../capability";

export const MEETING_MINUTES_PROMPT = `
You are an expert meeting assistant. Your task is to generate concise and professional meeting minutes from a provided transcript.
The minutes should include:
1. **Meeting Overview**: Purpose and key participants (if identifiable).
2. **Main Discussion Points**: Summary of the key topics discussed.
3. **Decisions Made**: Clear list of any formal or informal decisions.
4. **Action Items**: Specific tasks assigned, to whom, and deadlines (if mentioned).

Formatting: Use professional Markdown with bold headers and bullet points.
`;

export class MeetingMinutesCapability extends BaseCapability {
    readonly name = "meetingMinutes";
    private graphClient: GraphClient;

    constructor(logger: ILogger) {
        super(logger);
        this.graphClient = new GraphClient(logger);
    }

    createPrompt(_context: MessageContext): ChatPrompt {
        const config = this.getModelConfig("summarizer");

        const model = AI_PROVIDER === "gemini"
            ? new GeminiChatModel({
                apiKey: config.apiKey,
                model: config.model,
            })
            : new OpenAIChatModel({
                model: config.model,
                apiKey: config.apiKey,
                endpoint: config.endpoint,
                apiVersion: config.apiVersion,
            });

        return new ChatPrompt({
            instructions: MEETING_MINUTES_PROMPT,
            model: model as any,
        });
    }

    async generateFromTranscript(meetingId: string): Promise<string> {
        try {
            this.logger.debug(`📄 MeetingMinutes: Fetching transcript for meeting ${meetingId}`);
            const transcript = await this.graphClient.getLatestTranscriptContent(meetingId);

            if (!transcript) {
                return "I couldn't find a transcript for this meeting. Please make sure transcription was enabled.";
            }

            this.logger.debug(`📄 MeetingMinutes: Generating minutes from transcript (${transcript.length} chars)`);

            // Use the model directly for the summary as we have the raw transcript text
            const config = this.getModelConfig("summarizer");
            const model = AI_PROVIDER === "gemini"
                ? new GeminiChatModel({
                    apiKey: config.apiKey,
                    model: config.model,
                })
                : new OpenAIChatModel({
                    model: config.model,
                    apiKey: config.apiKey,
                    endpoint: config.endpoint,
                    apiVersion: config.apiVersion,
                });

            const prompt = `${MEETING_MINUTES_PROMPT}\n\nTranscript:\n${transcript}`;

            // Using complete as it's a single one-off generation
            const result = await (model as any).complete(prompt);
            return result || "Failed to generate meeting minutes.";
        } catch (error) {
            this.logger.error(`❌ MeetingMinutes: Error generating minutes: ${error}`);
            return `An error occurred while generating meeting minutes: ${error instanceof Error ? error.message : String(error)}`;
        }
    }
}

export const MEETING_MINUTES_CAPABILITY_DEFINITION: CapabilityDefinition = {
    name: "meetingMinutes",
    manager_desc: `**Meeting Minutes**: Use when the user asks for "meeting minutes", "transcript summary", or to "summarize the last meeting". Use this when they reference a specific meeting or the most recent one.`,
    handler: async (_context: MessageContext, _logger: ILogger) => {
        // Note: This handler is for manual requests via @mentions
        // We'll need a way for the user to specify WHICH meeting, 
        // but for now we'll try to find the meeting ID from the context if possible
        // or tell them to wait for the automatic ones.
        return "I am configured to automatically generate minutes at the end of meetings. If you need minutes for a specific meeting, please provide the meeting ID.";
    },
};
