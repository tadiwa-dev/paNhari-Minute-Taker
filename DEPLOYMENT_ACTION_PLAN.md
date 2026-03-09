# 🚀 PANHHARI TO PRODUCTION - FINAL ACTION PLAN

## BEFORE YOU START
- [ ] You have your GitHub repo URL: https://github.com/tadiwa-dev/paNhari-Minute-Taker.git
- [ ] Your code is on GitHub main branch
- [ ] You have your Entra app registered with Bot ID and Password ready
- [ ] Gemini API key: AIzaSyB2253SYC7OzgeSr-K_0Lt0xRSOLt49xlk

---

## STEP 1: PUSH CODE TO GITHUB (5 min)

```bash
# In your local repo
cd c:\Users\tadiw\paNhari-notes\paNhari-Minute-Taker

# Stage all files
git add .

# Commit
git commit -m "Production: Gemini AI integration ready for Vercel deployment"

# Push to GitHub
git push origin main
```

Verify at: https://github.com/tadiwa-dev/paNhari-Minute-Taker/tree/main

---

## STEP 2: CREATE VERCEL ACCOUNT & DEPLOY (10 min)

1. Go to https://vercel.com
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access GitHub
5. Click "New Project"
6. Find "paNhari-Minute-Taker" in the list
7. Click "Select"
8. Leave settings as default:
   - Framework: Auto (Node.js)
   - Build Command: `npm run build`
   - Output Directory: `dist`
9. Click "Deploy"
10. **Wait 3-5 minutes** for deployment to complete
11. Once done, you'll see "Production" with ✅

🎉 Your bot is now at: **https://panhari-minute-taker.vercel.app/api/messages**

---

## STEP 3: ADD VERCEL ENVIRONMENT VARIABLES (5 min)

1. In Vercel dashboard
2. Click your project: "paNhari-Minute-Taker"
3. Go to: Settings → Environment Variables
4. Add 6 variables (from VERCEL_ENV_VARIABLES.md):

```
AI_PROVIDER: gemini
GEMINI_API_KEY: AIzaSyB2253SYC7OzgeSr-K_0Lt0xRSOLt49xlk
GEMINI_MODEL: gemini-3-flash-preview
BOT_ID: <from Entra ID>
SECRET_BOT_PASSWORD: <from Entra ID>
RUNNING_ON_AZURE: 0
```

5. For each variable, select:
   - Environment: Production, Preview, Development (checkmark all 3)
6. Click "Save"
7. Go to "Deployments" tab
8. Click the top deployment (latest)
9. Click "Redeploy"
10. Wait 2-3 minutes for new build

---

## STEP 4: UPDATE TEAMS BOT ENDPOINT (2 min)

1. Go to https://entra.microsoft.com
2. Search for your bot app
3. Click on it
4. Left sidebar: Manage → Authentication
5. Find "Messaging endpoint" field
6. Replace with: `https://panhari-minute-taker.vercel.app/api/messages`
7. Click "Save"

---

## STEP 5: CREATE APP PACKAGE ZIP (3 min)

1. In VS Code Terminal:
   ```bash
   # Build to ensure manifest is correct
   npm run build
   ```

2. Go to `appPackage` folder
3. Right-click → Compress (or use 7-Zip)
4. Only include these 3 files:
   - manifest.json
   - color.png
   - outline.png
5. Name the ZIP: `paNhari-minute-taker-1.0.0.zip`
6. Save to Desktop

---

## STEP 6: UPLOAD TO TEAMS ADMIN CENTER (5 min)

1. Go to https://admin.teams.microsoft.com
2. Left sidebar: Teams apps → Manage apps
3. Click "+ Upload new app" (top right)
4. Select your ZIP file: `paNhari-minute-taker-1.0.0.zip`
5. Upload complete! 🎉
6. Search for "paNhari" in the list
7. Click on it
8. Change status from "Blocked" to "Allowed"
9. Click "Save"

---

## STEP 7: GRANT ADMIN CONSENT (3 min) ⚠️ CRITICAL

This allows the bot to read transcripts!

1. Go to https://entra.microsoft.com
2. Search for your app
3. Click it
4. Left sidebar: Manage → API permissions
5. You should see permissions listed
6. Click "Grant admin consent for [Organization Name]"
7. A popup appears: Click "Yes"
8. **Wait 1-2 minutes** for green checkmarks ✅ to appear

---

## STEP 8: TEST IN TEAMS (5 min)

1. Open Microsoft Teams
2. Click "+ Add app" (left sidebar, bottom)
3. Search for "paNhari"
4. Click "Add" or "Open"
5. Send message: `@paNhari hi`
6. Bot should respond with Gemini-generated response ✅

### Test Transcripts:
1. Copy your meeting transcript
2. Send: `@paNhari summarize this meeting: [paste transcript]`
3. Bot should extract summary with Gemini ✅

---

## TOTAL TIME: ~40-45 MINUTES

- Push to GitHub: 5 min
- Vercel deploy: 5 min
- Add env vars: 5 min
- Update endpoint: 2 min
- Create ZIP: 3 min
- Upload to Teams: 5 min
- Grant consent: 3 min
- Test: 5 min
- Wait for propagation: 5-10 min

---

## SUCCESS INDICATORS ✅

You'll know it's working when:
1. Vercel shows "Production ✅"
2. Entra messaging endpoint is updated
3. Teams Admin Center shows app as "Allowed"
4. Entra API permissions show ✅ green checkmarks
5. Bot responds in Teams when @mentioned
6. Bot can summarize meeting transcripts

---

## EMERGENCY ROLLBACK

If something breaks after deployment:
1. Go to vercel.com dashboard
2. Deployments tab
3. Find a previous "Production" version
4. Click "Promote to Production"
5. Instant rollback! ⚡

---

## NEXT TIME YOU UPDATE CODE:

```bash
# Make changes to your code
nano src/some-file.ts

# Commit and push
git add .
git commit -m "Fixed feature X"
git push origin main

# Vercel auto-deploys in 30 seconds!
# Check vercel.com/dashboard to watch it deploy
```

---

## YOU'RE READY! 🎉

Start with Step 1 and follow in order.
Each step takes the estimated time.
By Step 8, your bot is live in real Teams!

Questions? Check VERCEL_GITHUB_DEPLOYMENT.md for detailed help on each step.
