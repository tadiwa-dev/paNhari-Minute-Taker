#!/bin/bash
# DEPLOYMENT CHECKLIST FOR PANHARI MINUTE TAKER
# Simplified Vercel → Teams Admin Center → Live flow

# ============================================================================
# PHASE 1: PREPARE FOR HOSTING
# ============================================================================

# STEP 1: Ensure your code is production-ready
# [ ] Run: npm run build
# [ ] Verify no errors in dist/ folder
# [ ] Check all environment variables are set

# STEP 2: Create a Vercel account
# [ ] Go to https://vercel.com
# [ ] Sign up with GitHub (recommended for auto-deploy)
# [ ] Connect your paNhari-notes GitHub repo (or upload git folder)

# STEP 3: Deploy to Vercel
# [ ] Push code to GitHub (if using git)
#     git add .
#     git commit -m "Production deployment"
#     git push origin main
#
# [ ] OR upload folder to Vercel from CLI:
#     npm install -g vercel
#     vercel
#
# [ ] During Vercel setup, add environment variables:
#     AI_PROVIDER=gemini
#     GEMINI_API_KEY=AIzaSyB2253SYC7OzgeSr-K_0Lt0xRSOLt49xlk
#     GEMINI_MODEL=gemini-3-flash-preview
#     BOT_ID=<your-bot-id>
#     SECRET_BOT_PASSWORD=<your-bot-password>
#
# [ ] Wait for deployment to complete
# [ ] Note your URL: https://panhari-minute-taker-<xxxxx>.vercel.app (or custom domain)

# ============================================================================
# PHASE 2: UPDATE BOT ENDPOINT IN ENTRA
# ============================================================================

# STEP 4: Update Microsoft Entra app registration
# [ ] Go to https://entra.microsoft.com
# [ ] Find your app registration (search for your bot name)
# [ ] Click on it
# [ ] Go to: Manage → Authentication (left sidebar)
# [ ] Find "Messaging endpoint" field
# [ ] Update it to: https://your-vercel-url.vercel.app/api/messages
# [ ] Save/Update

# ============================================================================
# PHASE 3: BUILD & PREPARE APP PACKAGE
# ============================================================================

# STEP 5: Build the app package ZIP
# [ ] Run in Terminal: npm run build
# [ ] Verify manifest.json is updated with your Bot ID
# [ ] The manifest.json should have:
#     - "id": "${{TEAMS_APP_ID}}" (will be replaced during provisioning)
#     - "bots": [{"botId": "${{BOT_ID}}"}]
#     - "OnlineMeetingTranscript.Read.All" permission
#
# [ ] Go to appPackage folder in VS Code
# [ ] Create ZIP with exactly these 3 files at root:
#     1. manifest.json
#     2. color.png
#     3. outline.png
#
# [ ] Name it: paNhari-minute-taker-1.0.0.zip
# [ ] Download/save to your Desktop

# ============================================================================
# PHASE 4: UPLOAD TO TEAMS ADMIN CENTER
# ============================================================================

# STEP 6: Upload app to Teams Admin Center
# [ ] Go to https://admin.teams.microsoft.com
# [ ] Left sidebar: Teams apps → Manage apps
# [ ] Click "+ Upload new app" (top right)
# [ ] Select your ZIP file (paNhari-minute-taker-1.0.0.zip)
# [ ] Wait for upload to complete
# [ ] Click on "paNhari-Minute-Taker" from the list
# [ ] Change status from "Blocked" to "Allowed"
# [ ] Save

# STEP 7: (Optional) Force-install for all users
# [ ] In Teams Admin Center
# [ ] Left sidebar: Setup policies → Global (or create new policy)
# [ ] Under "Installed apps" section
# [ ] Click "+ Add apps"
# [ ] Search for "paNhari"
# [ ] Click "Add"
# [ ] This deploys it to all team members automatically
# [ ] OR: Users can manually find it in Teams Apps

# ============================================================================
# PHASE 5: GRANT ADMIN CONSENT (CRITICAL FOR TRANSCRIPTS)
# ============================================================================

# STEP 8: Grant app permissions
# [ ] Go back to https://entra.microsoft.com
# [ ] Find your app registration
# [ ] Go to: Manage → API permissions (left sidebar)
# [ ] You should see these permissions:
#     - With status "Needs admin consent"
#
# [ ] Click "Grant admin consent for [Organization Name]"
# [ ] Click "Yes" when popup appears
# [ ] Wait for green checkmarks to appear (1-2 minutes)
#
# [ ] The app can now read:
#     - ChatMessage.Read.Chat (group chat messages)
#     - OnlineMeetingTranscript.Read.All (meeting transcripts)

# ============================================================================
# PHASE 6: TEST IN REAL TEAMS
# ============================================================================

# STEP 9: Find and test the bot in Teams
# [ ] Open Microsoft Teams
# [ ] Click "+ Add app" (left sidebar)
# [ ] Search for "paNhari"
# [ ] Click "Add" or "Open"
# [ ] Send "@paNhari summarize" or "hi"
# [ ] Bot should respond with Gemini
#
# [ ] TEST TRANSCRIPT READING:
#     Go to a Teams channel with a meeting recording
#     Send: "@paNhari summarize the meeting transcript"
#     Bot should read the transcript and generate a summary

# ============================================================================
# TROUBLESHOOTING
# ============================================================================

# Bot not responding in Teams?
# [ ] Check Vercel deployment status: https://vercel.com/dashboard
# [ ] Check logs: Vercel → click project → Deployments → logs
# [ ] Verify messaging endpoint was updated in Entra
# [ ] Wait 5-10 minutes for changes to propagate

# Getting "Not authorized" error?
# [ ] Admin consent may not have been granted
# [ ] Go to Entra → Your app → API permissions
# [ ] Click "Grant admin consent" again
# [ ] Wait for green checkmarks

# Transcript not being read?
# [ ] Ensure "OnlineMeetingTranscript.Read.All" in manifest.json
# [ ] Admin consent must be granted (see above)
# [ ] Meeting must have a transcript already available in Teams
# [ ] Test in a meeting channel, not just chat

# ============================================================================
# SUCCESS INDICATORS
# ============================================================================

# ✅ Bot is "live" when you see:
# 1. Vercel deployment shows "Production" status
# 2. Teams Admin Center shows app status as "Allowed"
# 3. Entra permissions show green checkmarks
# 4. User can @mention bot in any Teams channel and get response
# 5. Bot can summarize meeting transcripts without errors

# ============================================================================
# FINAL SUMMARY
# ============================================================================

# TOTAL TIME: ~30-45 minutes total
# - Vercel setup: 10 min
# - Build ZIP: 5 min
# - Upload to Admin Center: 5 min
# - Admin Consent: 5 min
# - Propagation wait: 5-10 min
# - Testing: 5 min

echo "✅ Deployment Checklist Ready!"
echo "Follow each step in order for best results."
echo "Bot will be live in 30-45 minutes."
