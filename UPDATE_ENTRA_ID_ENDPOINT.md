# Update Entra ID Bot Endpoint

Your Vercel deployment is live! Now update your Entra ID app registration with the new endpoint.

## Your Bot Endpoint
```
https://pa-nhari-minute-taker.vercel.app/api
```

## Step 1: Go to Entra ID
1. Open https://entra.microsoft.com
2. Sign in with your Microsoft account
3. Go to **"Application" → "App registrations"**
4. Click on your app: **"paNhari Minute Taker Bot"** (or your app name)

## Step 2: Update Messaging Endpoint
1. In your app, go to **"Manage" → "Configuration"** (or **"Settings"**)
2. Look for **"Messaging endpoint"** field
3. Clear the existing value and paste:
   ```
   https://pa-nhari-minute-taker.vercel.app/api
   ```
4. Click **"Save"**

## Step 3: Verify Authentication Settings
1. Go to **"Manage" → "Authentication"**
2. Under **"Redirect URIs"**, make sure you have:
   - `https://token.botframework.com/.auth/web/redirect`
   - `https://pa-nhari-minute-taker.vercel.app/api/callback` (optional, add if not present)

## Step 4: Check API Permissions
1. Go to **"Manage" → "API permissions"**
2. Verify you have these permissions with **"Administration consent granted"** (green checkmarks):
   - `Chat.Read.All` (Application)
   - `OnlineMeetingTranscript.Read.All` (Application)

**If NOT showing green checkmarks:**
1. Click **"Grant admin consent for [your org]"** button
2. Click **"Yes"** to grant consent

## When Complete
Once saved, move to the next step: **Create App Package for Teams**

Your bot is now connected to your live Vercel endpoint!
