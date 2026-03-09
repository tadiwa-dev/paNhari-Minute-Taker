# VERCEL DEPLOYMENT FROM GITHUB
# paNhari-Minute-Taker Setup

## STEP 1: Verify GitHub Repo is Ready

Your repo: https://github.com/tadiwa-dev/paNhari-Minute-Taker.git

Make sure these files are committed to GitHub:
- [ ] src/ folder (all your bot code)
- [ ] package.json (with @google/genai dependency)
- [ ] .gitignore (should exclude node_modules, .env files)
- [ ] appPackage/ folder (manifest.json, color.png, outline.png)
- [ ] tsconfig.json, tsup.config.js

Commands to commit everything:
```bash
git add .
git commit -m "Ready for Vercel production deployment"
git push origin main
```

## STEP 2: Create Vercel Account & Connect GitHub

1. Go to https://vercel.com
2. Click "Sign Up"
3. Choose "Sign up with GitHub"
4. Authorize Vercel to access your GitHub account
5. Click "New Project"
6. Select repo: "paNhari-Minute-Taker"
7. Click "Import"

## STEP 3: Configure Vercel Project Settings

### Framework Detection
- Vercel should auto-detect: Node.js
- Root Directory: (leave blank or ./
- Build Command: `npm run build`
- Output Directory: `dist`

### Environment Variables (CRITICAL)

In Vercel dashboard → Settings → Environment Variables

Add these 6 variables:

```
Name: AI_PROVIDER
Value: gemini
Environment: Production, Preview, Development

Name: GEMINI_API_KEY
Value: AIzaSyB2253SYC7OzgeSr-K_0Lt0xRSOLt49xlk
Environment: Production, Preview, Development

Name: GEMINI_MODEL
Value: gemini-3-flash-preview
Environment: Production, Preview, Development

Name: SECRET_BOT_PASSWORD
Value: <your-bot-app-password>
Environment: Production, Preview, Development

Name: BOT_ID
Value: <your-bot-app-id>
Environment: Production, Preview, Development

Name: RUNNING_ON_AZURE
Value: 0
Environment: Production, Preview, Development
```

⚠️ Replace `<your-bot-app-password>` and `<your-bot-app-id>` with your actual values from Entra ID

## STEP 4: Deploy!

1. Click "Deploy"
2. Wait 3-5 minutes for build to complete
3. Once "Production" shows checkmark ✅, deployment is live
4. Your URL will be: `https://panhari-minute-taker.vercel.app`
   (or custom domain if you configure one)

## STEP 5: Auto-Deploy on Git Push

Now whenever you push to GitHub:
```bash
git push origin main
```

Vercel automatically:
- Pulls latest code
- Installs dependencies
- Runs `npm run build`
- Deploys to production
- Shows deployment status

## STEP 6: Update Teams Bot Endpoint

Go to https://entra.microsoft.com:
1. Find your app registration
2. Go to: Manage → Authentication
3. Update "Messaging endpoint" to:
   ```
   https://panhari-minute-taker.vercel.app/api/messages
   ```
4. Save

## STEP 7: Create App Package ZIP

```bash
# Build locally (or it auto-builds via Vercel)
npm run build

# Your appPackage folder should have:
# - manifest.json (with your Bot ID)
# - color.png
# - outline.png

# Create zip file - name it: paNhari-minute-taker-1.0.0.zip
# Contents should be ONLY these 3 files at root level
```

## STEP 8: Upload to Teams Admin Center

1. Go to https://admin.teams.microsoft.com
2. Teams apps → Manage apps
3. Upload custom app (+Upload new app)
4. Select your ZIP
5. Find app in list and set status to "Allowed"
6. Grant admin consent in Entra (see below)

## STEP 9: Grant Admin Consent (CRITICAL)

Go to https://entra.microsoft.com:
1. Find your app registration
2. Go to: Manage → API permissions
3. Click "Grant admin consent for [Your Org]"
4. Wait for green checkmarks (includes OnlineMeetingTranscript.Read.All)

## STEP 10: Test in Real Teams

1. Open Microsoft Teams
2. Click "+ Add app"
3. Search for "paNhari"
4. Click "Add" or "Open"
5. Send: `@paNhari hi`
6. Bot should respond with Gemini ✅

---

## MONITORING & UPDATES

### View Vercel Logs
- Go to vercel.com dashboard
- Click project name
- Deployments tab
- Click any deployment
- View build logs and runtime logs

### Make Code Changes
```bash
# Edit code locally
nano src/some-file.ts

# Commit and push
git add .
git commit -m "Fixed feature X"
git push origin main

# Vercel auto-deploys within seconds
# Check https://vercel.com/dashboard to see deployment status
```

### Rollback to Previous Deployment
- In Vercel dashboard → Deployments
- Click "Promote to Production" on any previous deployment
- Instant rollback!

---

## TROUBLESHOOTING

### Build Failed?
- Click deployment
- Check "Build Logs" tab
- Look for error messages
- Common: Missing env variables, dependency conflicts
- Fix and push again: `git push origin main`

### Bot Not Responding?
- Check Vercel deployment status: "Production" should have ✅
- Verify messaging endpoint in Entra is correct
- Wait 5-10 minutes for Teams cache to update
- Check Vercel logs for errors

### 502 Bad Gateway in Teams?
- Likely bot endpoint URL is wrong
- Verify in Entra: Authentication → Messaging endpoint
- Should be exactly: `https://panhari-minute-taker.vercel.app/api/messages`
- Wait a few minutes for Teams to sync

### Transcripts Not Being Read?
- Go to Entra → API permissions
- Verify "OnlineMeetingTranscript.Read.All" is listed
- Click "Grant admin consent"
- Wait for green checkmarks
- Try again after 5 minutes

---

## TIME ESTIMATE

- Vercel account + GitHub connect: 5 min
- Set environment variables: 5 min
- Deploy: 3-5 min
- Update endpoint in Entra: 2 min
- Build app ZIP: 2 min
- Upload to Teams Admin: 5 min
- Grant admin consent: 3 min
- Test in Teams: 5 min

**Total: ~35-40 minutes to go live**

---

## SUCCESS CHECKLIST

- [ ] GitHub repo pushed with all code
- [ ] Vercel account created
- [ ] GitHub repo connected to Vercel
- [ ] All 6 environment variables added to Vercel
- [ ] Deployment shows "Production" ✅
- [ ] Messaging endpoint updated in Entra
- [ ] App package ZIP created (manifest.json, pngs)
- [ ] ZIP uploaded to Teams Admin Center
- [ ] App status set to "Allowed"
- [ ] Admin consent granted in Entra (green checkmarks)
- [ ] Bot appears in Teams and responds to "@mention"
- [ ] Bot successfully summarizes meeting transcripts

✅ = Live and working!
