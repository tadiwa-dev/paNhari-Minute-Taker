# VERCEL ENVIRONMENT VARIABLES - COPY/PASTE READY

Copy these 6 variables into Vercel dashboard → Settings → Environment Variables

---

## Variable 1: AI Provider
```
Name: AI_PROVIDER
Value: gemini
Environment: Production, Preview, Development
```

## Variable 2: Gemini API Key
```
Name: GEMINI_API_KEY
Value: AIzaSyB2253SYC7OzgeSr-K_0Lt0xRSOLt49xlk
Environment: Production, Preview, Development
```

## Variable 3: Gemini Model
```
Name: GEMINI_MODEL
Value: gemini-3-flash-preview
Environment: Production, Preview, Development
```

## Variable 4: Bot ID
```
Name: BOT_ID
Value: [GET FROM ENTRA ID - see below]
Environment: Production, Preview, Development
```

## Variable 5: Bot Password
```
Name: SECRET_BOT_PASSWORD
Value: [GET FROM ENTRA ID - see below]
Environment: Production, Preview, Development
```

## Variable 6: Azure Flag
```
Name: RUNNING_ON_AZURE
Value: 0
Environment: Production, Preview, Development
```

---

## TO GET BOT_ID AND SECRET_BOT_PASSWORD:

1. Go to https://entra.microsoft.com
2. Search for your app (created during Teams registration)
3. Click on it
4. Left sidebar → "Manage" → "Overview"
5. Copy "Application (client) ID" → This is BOT_ID

6. Left sidebar → "Manage" → "Certificates & secrets"
7. Click "New client secret"
8. Give it a name: "Vercel Deployment"
9. Set expires: "1 year" (or longer)
10. Click "Add"
11. Copy the "Value" (NOT the ID) → This is SECRET_BOT_PASSWORD
    ⚠️ SAVE THIS NOW - you can't see it again!

---

## QUICK STEPS:

1. Have these 6 values ready
2. Go to https://vercel.com/dashboard
3. Click your project name
4. Settings → Environment Variables
5. Add each variable one by one
6. Click "Save"
7. Re-deploy: Go to Deployments → Click top deployment → Redeploy
8. Wait 2-3 minutes for new build
9. Once "Production" shows ✅, restart your bot tests

---

## FORMAT CHECK:

Your values should look like:
```
AI_PROVIDER: "gemini"                           ✅
GEMINI_API_KEY: "AIzaSyB2253SYC7O..."           ✅
GEMINI_MODEL: "gemini-3-flash-preview"          ✅
BOT_ID: "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6"  ✅
SECRET_BOT_PASSWORD: "Xy_~Abc.123DEF456GHI..."  ✅
RUNNING_ON_AZURE: "0"                           ✅
```

All variables must be strings (in quotes), not booleans.
