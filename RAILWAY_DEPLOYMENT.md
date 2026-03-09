# Deploy to Railway - paNhari Minute Taker

## Why Railway?
- ✅ Persistent, always-on server (perfect for bots)
- ✅ Auto-deploys from GitHub
- ✅ $5/month or free tier (~750 hours/month)
- ✅ No cold starts or timeouts
- ✅ Bot event handlers will actually work!

## Step 1: Create Railway Account
1. Go to https://railway.app
2. Click **"Start Free"** or **"Sign Up"**
3. Choose **"GitHub"** to sign in with your GitHub account
4. Authorize Railway to access your GitHub account

## Step 2: Create New Project
1. Once logged in, click **"+ New Project"**
2. Click **"Deploy from GitHub repo"**
3. Find and select: **"paNhari-Minute-Taker"**
4. Click **"Deploy Now"**

Railway will automatically:
- ✅ Detect it's a Node.js project
- ✅ Install dependencies (npm install)
- ✅ Build the bot (npm run build)
- ✅ Start the bot (node dist/index.js)

## Step 3: Add Environment Variables
1. In your Railway project, go to the **"Variables"** tab
2. Click **"New Variable"** and add these 6 variables:

```
BOT_ID = [Your Entra ID Application ID]
MicrosoftAppId = [Same as BOT_ID]
MicrosoftAppPassword = [Your Entra ID Client Secret]
GEMINI_API_KEY = [Your Gemini API Key]
GEMINI_MODEL = gemini-3-flash-preview
AI_PROVIDER = gemini
```

3. Click **"Add"** after each variable
4. These will be automatically deployed

## Step 4: Get Your Railway URL
1. In Railway, go to the **"Settings"** tab
2. Look for **"Domains"** section
3. You should see a generated URL like: `https://panhariminutetaker-production.up.railway.app`
4. Or you can add a custom domain

Your bot endpoint will be:
```
https://[your-railway-url]:3978/api/messages
```

Or if default port:
```
https://[your-railway-url]/api/messages
```

## Step 5: Update Entra ID Endpoint
1. Go to https://entra.microsoft.com
2. Find your app registration: **"paNhari Minute Taker Bot"**
3. Go to **"Settings"** or look for **"Messaging endpoint"**
4. Update the endpoint to your Railway URL:
   ```
   https://[your-railway-url]/api/messages
   ```
5. Click **"Save"**

## Step 6: Test in Teams
1. Open Microsoft Teams
2. Go to **"Apps"**
3. Search for **"paNhari Minute Taker"**
4. Click **"Open"** or add to a chat
5. Send a message: **"hi"** or **"@paNhari hello"**

**The bot should now respond!** 🎉

## Monitoring Logs
To see logs as messages come in:
1. In Railway project, click **"Deployments"** tab
2. Click the active deployment
3. View **"Logs"** in real-time
4. Send a message in Teams to see it appear in the logs

## Cost
- **Free tier**: 750 hours/month (~$5 value)
- **Paid**: $5/month for 24/7 operation
- No credit card required for free tier

## Troubleshooting

If deployment fails:
1. Check the **"Build Logs"** in Railway
2. Common issues:
   - Missing environment variables → Add them and redeploy
   - Port already in use → Railway handles this automatically
   - Build error → Check local `npm run build` works

If bot still doesn't respond:
1. Check Railway **"Logs"** for errors
2. Verify Entra ID endpoint is updated correctly
3. Make sure environment variables are set in Railway
4. Try restarting the service in Railway dashboard
