# Vercel Deployment Guide - paNhari Minute Taker

## Your Credentials
⚠️ **IMPORTANT**: Do NOT commit these to GitHub. Use Vercel's Environment Variables page instead.

```
BOT_ID: [Your Application ID from Entra ID]
SECRET_BOT_PASSWORD: [Your Client Secret from Entra ID]
GEMINI_API_KEY: [Your Gemini API Key]
GEMINI_MODEL: gemini-3-flash-preview
AI_PROVIDER: gemini
```

## Step-by-Step Deployment

### Step 1: Create/Login to Vercel Account
1. Go to https://vercel.com
2. Sign up or login (recommended: use GitHub account for single sign-on)
3. Once logged in, click "Add New..." → "Project"

### Step 2: Import GitHub Repository
1. Click "Import Git Repository"
2. Paste: `https://github.com/tadiwa-dev/paNhari-Minute-Taker.git`
3. Select "Create" (Vercel will detect the project type as Node.js)
4. Click "Continue"

### Step 3: Configure Environment Variables
In the "Environment Variables" section, add these 6 variables:

| Variable Name | Value |
|---|---|
| `BOT_ID` | `[Your Application ID from Entra ID]` |
| `MicrosoftAppId` | `[Same as BOT_ID]` |
| `MicrosoftAppPassword` | `[Your Client Secret from Entra ID]` |
| `GEMINI_API_KEY` | `[Your Gemini API Key]` |
| `GEMINI_MODEL` | `gemini-3-flash-preview` |
| `AI_PROVIDER` | `gemini` |

**Steps to add each:**
1. Click in each field and type the variable name
2. Click in the value field and paste the value
3. Click "Add" after each one
4. After all 6 are added, they'll show in a list

### Step 4: Deploy
1. Click the "Deploy" button (bottom right)
2. Wait 2-3 minutes for deployment to complete
3. You'll see a success message and your deployment URL like:
   ```
   https://panhari-minute-taker.vercel.app
   ```

### Step 5: Note Your Vercel URL
Your bot endpoint will be:
```
https://panhari-minute-taker.vercel.app/api/messages
```

You'll need this URL to update in Entra ID in the next step.

## Next Steps After Deployment

1. **Update Entra ID Bot Endpoint:**
   - Go to https://entra.microsoft.com
   - Find your app registration
   - Go to "Manage" → "Authentication"
   - Update "Redirect URIs" to include both:
     - `https://token.botframework.com/.auth/web/redirect` (existing)
     - `https://panhari-minute-taker.vercel.app/api/messages`

2. **Create and Upload App Package** (see next section)

3. **Deploy to Teams** (see Teams Admin Center section)

## Troubleshooting

If deployment fails:
- Check npm logs in Vercel dashboard
- Ensure all env vars are set correctly
- Verify GitHub token has access to the repo

If bot doesn't respond:
- Check Vercel function logs for errors
- Verify env variables are accessible: Check in Vercel Settings → Environment Variables
- Test the endpoint: `curl https://panhari-minute-taker.vercel.app/health` (if endpoint exists)
