# Gemini AI Provider Setup Guide

This guide explains how to configure your paNhari Minute Taker application to use Google Gemini as the AI provider instead of Azure OpenAI.

## Prerequisites

- Google Gemini API Key from [Google AI Studio](https://ai.google.dev)
- Node.js environment with all dependencies installed

## Installation

The `@google/genai` package is already included in your `package.json`. If not, run:

```bash
npm install @google/genai
```

## Configuration

### Step 1: Set Environment Variables

Update your `.env.local.user` file (or whichever environment file you're using) with:

```bash
# Set the AI provider to Gemini
AI_PROVIDER=gemini

# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-pro  # or gemini-1.5-flash for faster/cheaper responses

# Optional: Keep Azure OpenAI vars for potential fallback (can be empty/placeholder)
AZURE_OPENAI_ENDPOINT=https://placeholder.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o-mini
SECRET_AZURE_OPENAI_API_KEY=
```

### Step 2: Available Gemini Models

The following Gemini models are available:

- **`gemini-1.5-pro`** (Recommended for complex tasks)
  - More capable for analysis, reasoning, and complex tasks
  - Good for Summarizer and Action Items capabilities
  
- **`gemini-1.5-flash`** (Recommended for Manager routing)
  - Faster and more cost-effective
  - Ideal for quick routing decisions in the Manager capability

### Step 3: Environment Files to Update

Update these files with your Gemini credentials:

- `.env.local.user` - Local development environment
- `env/.env.playground` - Playground environment
- Add to your deployment environment files as needed

### Step 4: Model Configuration per Capability

The application automatically assigns models to capabilities:

- **Manager Capability**: `gemini-1.5-flash` (fast routing)
- **Summarizer Capability**: `gemini-1.5-pro` (complex analysis)
- **Action Items Capability**: `gemini-1.5-pro` (detailed extraction)
- **Search Capability**: `gemini-1.5-pro` (semantic understanding)
- **Template Capability**: Uses default `GEMINI_MODEL`

You can customize these by adjusting the `AI_PROVIDER === "gemini"` logic in `src/utils/config.ts`.

## Getting Your Gemini API Key

1. Go to [Google AI Studio](https://ai.google.dev/tutorials/setup)
2. Click "Get API Key" 
3. Create a new API key in your Google Cloud Project
4. Copy the API key and paste it into your environment file as `GEMINI_API_KEY`

## Implementation Details

The swap has been implemented with the following changes:

### New Files Created:
- **`src/ai/geminiModel.ts`**: Custom Gemini wrapper that adapts the Gemini API to work with the existing ChatPrompt interface

### Updated Files:
- **`src/utils/config.ts`**: Added Gemini configuration support
- **`src/agent/manager.ts`**: Manager capability now supports Gemini
- **`src/capabilities/actionItems/actionItems.ts`**: Action Items capability supports Gemini
- **`src/capabilities/search/search.ts`**: Search capability supports Gemini  
- **`src/capabilities/summarizer/summarize.ts`**: Summarizer capability supports Gemini
- **`src/capabilities/template/template.ts`**: Template capability supports Gemini

### How It Works:

1. **Provider Detection**: The `AI_PROVIDER` environment variable determines which AI service to use
   - If `AI_PROVIDER=gemini`, Gemini is used
   - Otherwise, Azure OpenAI is used (default)

2. **Dynamic Model Selection**: Each capability checks the provider and instantiates the appropriate model:
   ```typescript
   const model = AI_PROVIDER === "gemini" 
     ? new GeminiChatModel({ apiKey, model })
     : new OpenAIChatModel({ model, apiKey, endpoint, apiVersion });
   ```

3. **Gemini Wrapper**: The `GeminiChatModel` class provides:
   - `complete()` - For simple text prompts
   - `completeStructured()` - For multi-turn conversations with message history

## Testing

To verify your Gemini setup:

1. Set `AI_PROVIDER=gemini` in your environment
2. Add your Gemini API key
3. Run your application: `npm run dev:teamsfx`
4. The debug logs will show: `🔑 Using AI Provider: GEMINI`
5. The model configs will display the Gemini models being used

## Troubleshooting

### "GEMINI_API_KEY environment variable is not set"
- Ensure `GEMINI_API_KEY` is set in your `.env.local.user` file
- Verify the API key is valid in Google AI Studio

### "Gemini API call failed"
- Check that your API key is valid
- Ensure you have quota available in your Google Cloud Project
- Verify the model name is correct (e.g., `gemini-1.5-pro`)

### Slow responses
- Try using `gemini-1.5-flash` instead of `gemini-1.5-pro` for faster responses
- The `gemini-1.5-flash` model is optimized for speed

### High costs
- Use `gemini-1.5-flash` for non-critical tasks
- Monitor your API usage in the Google Cloud Console

## Switching Back to Azure OpenAI

To switch back to Azure OpenAI:

1. Remove or comment out: `AI_PROVIDER=gemini`
2. Ensure Azure OpenAI environment variables are set:
   ```bash
   AOAI_ENDPOINT=your_endpoint
   AOAI_API_KEY=your_api_key
   AOAI_MODEL=gpt-4o
   ```
3. Restart your application

## Future Enhancements

- Add support for Gemini Vision models for image analysis
- Implement streaming responses for better UX
- Add cost tracking and billing alerts
- Support for multiple model instances per capability

## References

- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Google AI Studio](https://ai.google.dev)
- [Project Repository](https://github.com/your-repo-url)
