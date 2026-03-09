# Upload to Teams Admin Center

Your app package is ready to deploy!

## Step 1: Download the App Package
Located at: `appPackage/paNhari-Minute-Taker.zip`

## Step 2: Go to Teams Admin Center
1. Open https://admin.teams.microsoft.com
2. Sign in with your Microsoft 365 admin account
3. Go to **Teams apps → Manage apps** (left sidebar)

## Step 3: Upload Your App
1. Click **"Upload new app"** button (top right)
2. Click **"Select a file"**
3. Browse to: `C:\Users\tadiw\paNhari-notes\paNhari-Minute-Taker\appPackage\paNhari-Minute-Taker.zip`
4. Click **"Open"**
5. Click **"Upload"**

Wait for upload to complete (2-3 seconds)

## Step 4: Verify Permissions
1. Once uploaded, you'll see the app listed as "paNhari Minute Taker"
2. Click on the app name to open its details
3. Look for **"Permissions"** section
4. You should see the permissions you configured:
   - Chat.Read.Chat
   - OnlineMeetingTranscript.Read.Chat
   - ChatMessage.Read.Chat

## Step 5: Set App Status
1. In the app details, look for **"Status"** setting
2. Set to **"Allowed"** (this makes the app available to all users)
3. Click **"Save"**

## Step 6: Grant Admin Consent (if prompted)
If you see a notification asking to "Grant admin consent", click **"Grant consent"**

## Step 7: Make Available to Users
1. Go back to **"Manage apps"**
2. Find **"paNhari Minute Taker"**
3. If not already allowed, set **"Allow"** to "On"

## Testing
1. Open Microsoft Teams
2. Go to **"Apps"** (bottom left)
3. Search for **"paNhari Minute Taker"**
4. Click **"Add"** or **"Open"**
5. Send a message like "hi" or "@paNhari Minute Taker help"
6. The bot should respond with a Gemini-generated message!

## Success! 🎉
Your bot is now live in Teams! Users can:
- Add the bot to team chats
- Use it in direct messages
- Enable it to read meeting transcripts
- Get automatic meeting minutes and action items
