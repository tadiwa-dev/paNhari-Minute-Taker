# Quick Start: Swap to Gemini AI Provider

## TL;DR - Get Started in 2 Minutes

1. **Set environment variable in `.env.local.user`:**
   ```bash
   AI_PROVIDER=gemini
   GEMINI_API_KEY=your_key_from_https://ai.google.dev
   GEMINI_MODEL=gemini-1.5-pro
   ```

2. **Run your app:**
   ```bash
   npm run dev:teamsfx
   ```

That's it! The app will now use Gemini instead of Azure OpenAI.

## What Changed

✅ **Created:** `src/ai/geminiModel.ts`
- Custom Gemini wrapper that integrates with the existing ChatPrompt framework
- Handles both simple and structured prompts

✅ **Updated 4 Capability Files:**
- `src/agent/manager.ts` - Routes requests using Gemini
- `src/capabilities/actionItems/actionItems.ts` - Extracts action items with Gemini
- `src/capabilities/search/search.ts` - Searches messages using Gemini
- `src/capabilities/summarizer/summarize.ts` - Summarizes conversations with Gemini

✅ **Updated Config:**
- `src/utils/config.ts` - Now supports both Azure OpenAI and Gemini providers
- Automatic model selection based on `AI_PROVIDER` environment variable

✅ **Documentation:**
- `GEMINI_SETUP.md` - Comprehensive setup guide with troubleshooting

## Environment Variables

### Required for Gemini:
```bash
AI_PROVIDER=gemini
GEMINI_API_KEY=your_api_key
GEMINI_MODEL=gemini-1.5-pro          # or gemini-1.5-flash for speed
```

### Optional (kept for compatibility):
```bash
AZURE_OPENAI_ENDPOINT=https://placeholder.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o-mini
SECRET_AZURE_OPENAI_API_KEY=
```

## Model Recommendations

| Use Case | Model | Why |
|----------|-------|-----|
| Manager routing | `gemini-1.5-flash` | Fast decisions, low cost |
| Summarization | `gemini-1.5-pro` | Complex analysis needed |
| Action items | `gemini-1.5-pro` | Detailed extraction required |
| Search | `gemini-1.5-pro` | Semantic understanding |

## Testing

After setting up:
1. Look for log: `🔑 Using AI Provider: GEMINI`
2. See model config: `🔧 AI Model Configuration:`
3. Test each capability to verify it works with Gemini

## Switching Back to Azure OpenAI

Remove the `AI_PROVIDER=gemini` line from your environment and ensure Azure OpenAI variables are set.

## Need Help?

See [GEMINI_SETUP.md](./GEMINI_SETUP.md) for detailed documentation and troubleshooting.
