import { GoogleGenAI } from "@google/genai";

export function initializeGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }
  return new GoogleGenAI({ apiKey });
}

export interface GeminiModelConfig {
  apiKey: string;
  model: string;
}

// Wrapper class that adapts Gemini API to work with ChatPrompt
export class GeminiChatModel {
  private genAI: GoogleGenAI;
  private modelName: string;
  private apiKey: string;

  constructor(config: {
    apiKey: string;
    model?: string;
  }) {
    this.apiKey = config.apiKey;
    this.modelName = config.model || "gemini-2.5-flash";
    this.genAI = new GoogleGenAI({ apiKey: this.apiKey });
  }

  async complete(prompt: string): Promise<string> {
    try {
      const result = await this.genAI.models.generateContent({
        model: this.modelName,
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      });
      return result.text;
    } catch (error) {
      throw new Error(`Gemini API call failed: ${error}`);
    }
  }

  // Method required by ChatPrompt interface
  async send(prompt: string | any): Promise<{ content: string }> {
    try {
      // Handle both string and object inputs
      let promptText = typeof prompt === "string" ? prompt : JSON.stringify(prompt);
      
      const result = await this.genAI.models.generateContent({
        model: this.modelName,
        contents: [
          {
            role: "user",
            parts: [{ text: promptText }],
          },
        ],
      });
      return { content: result.text };
    } catch (error) {
      throw new Error(`Gemini send failed: ${error}`);
    }
  }

  // Method to handle structured prompts for compatibility with ChatPrompt
  async completeStructured(messages: Array<{ role: string; content: string }>): Promise<string> {
    try {
      // Convert message format for Gemini
      const systemMessage = messages.find((msg) => msg.role === "system");
      const contentMessages = messages
        .filter((msg) => msg.role !== "system")
        .map((msg) => ({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        }));

      const result = await this.genAI.models.generateContent({
        model: this.modelName,
        systemInstruction: systemMessage?.content,
        contents: contentMessages,
      });

      return result.text;
    } catch (error) {
      throw new Error(`Gemini API structured call failed: ${error}`);
    }
  }
}
