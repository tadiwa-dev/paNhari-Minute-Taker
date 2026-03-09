# ENTRA ID APP REGISTRATION FOR PANHHARI BOT
# Step-by-step guide to create your bot app registration

## STEP 1: Go to Entra ID Admin Center

1. Open https://entra.microsoft.com
2. Sign in with your Microsoft 365 admin account
3. Left sidebar: Click "Applications" → "App registrations"

## STEP 2: Create New App Registration

1. Click "+ New registration" (top)
2. Fill in the form:

   **Name:** 
   ```
   paNhari-Minute-Taker
   ```

   **Supported account types:**
   Select: "Accounts in this organizational directory only"

   **Redirect URI (optional):**
   Platform: Web
   URI: https://token.botframework.com/.auth/web/redirect

3. Click "Register"

## STEP 3: Copy Your Bot IDs

After registration, you're on the app Overview page. 

**Copy these 2 values:**

1. **Application (client) ID** - This is your `BOT_ID`
   - Copy it now and save somewhere safe

2. **Tenant ID** - For reference (usually same as your organization)

Example values might look like:
```
BOT_ID: a1b2c3d4-e5f6-7g8h-9i0j-1k2l3m4n5o6p
TENANT_ID: x1y2z3a4-b5c6-7d8e-9f0g-1h2i3j4k5l6m
```

## STEP 4: Create Client Secret

1. Left sidebar: "Manage" → "Certificates & secrets"
2. Click "+ New client secret"
3. Fill in:
   - Description: `Vercel Deployment`
   - Expires: `1 year` (or longer)
4. Click "Add"

**⚠️ IMPORTANT: Copy the VALUE (not the ID) immediately!**

This is your `SECRET_BOT_PASSWORD`

Example:
```
SECRET_BOT_PASSWORD: Xy~Abc.123DEF456GHI789JKL_MNOpqr
```

❌ Don't copy the "Secret ID" - copy the "Value" column
✅ Once you leave this page, you can't see it again!

## STEP 5: Add Microsoft Graph Permissions (for Transcripts!)

1. Left sidebar: "Manage" → "API permissions"
2. Click "+ Add a permission"
3. Search for: **Microsoft Graph**
4. Click on it
5. Select "Application permissions" (NOT delegated)
6. Search for and checkmark these permissions:
   - [x] **OnlineMeetingTranscript.Read.All** ← This is what you need for transcripts!
   - [x] **Chat.Read.All** ← For reading chat messages
7. Click "Add permissions"

## STEP 6: Grant Admin Consent

1. Still in "API permissions" section
2. Click "Grant admin consent for [Your Organization]"
3. Click "Yes" when popup appears
4. Wait 1-2 minutes for green checkmarks ✅

## STEP 7: Update Authentication Settings

1. Left sidebar: "Manage" → "Authentication"
2. Under "Platform configurations" click "Add a platform"
3. Choose "Web"
4. Add these Redirect URIs:
   ```
   https://token.botframework.com/.auth/web/redirect
   https://panhari-minute-taker.vercel.app/api/messages
   ```
5. Under "Implicit grant and hybrid flows" checkmark:
   - [ ] Access tokens
   - [ ] ID tokens
6. Click "Save"

## STEP 8: Add Reply URLs (for Teams)

1. Still in "Authentication"
2. Under "Supported account types" check:
   - [x] Accounts in this organizational directory only
3. Click "Save"

## YOUR VALUES ARE READY! 

You now have:
```
BOT_ID = Application (client) ID from Step 3
SECRET_BOT_PASSWORD = Value from Step 4
TENANT_ID = Tenant ID from Step 3
```

## STEP 9: Save These Values for Vercel

Create a temporary text file with your credentials:

```
BOT_ID: [paste Application (client) ID]
SECRET_BOT_PASSWORD: [paste the Value from client secret]
TENANT_ID: [paste Tenant ID]
BOT_ENDPOINT: https://panhari-minute-taker.vercel.app/api/messages
```

You'll use BOT_ID and SECRET_BOT_PASSWORD when setting up Vercel.

---

## ✅ YOU'RE DONE!

You now have everything needed for Vercel deployment.

No additional Bot Framework registration is required.
The Microsoft Graph permissions are all you need for transcripts!

## TROUBLESHOOTING

### "Can't see App registrations in Entra"
- Make sure you're signed in as an admin
- Go to https://entra.microsoft.com
- Look for "Applications" in left sidebar

### "Button not appearing?"
- Entra ID interface changes - look for "New registration" button at top
- Or visit: https://portal.azure.com → Azure AD → App registrations

### "Where do I find my Tenant ID?"
- It's on the Overview page of your app
- Or: Entra ID → Overview (top of page) → Tenant ID

### "I lost my client secret"
- You can't recover it
- Go back and create a new one
- Delete the old one to stay clean

---

## QUICK CHECKLIST

- [ ] Entra app created (paNhari-Minute-Taker)
- [ ] Application (client) ID copied → BOT_ID
- [ ] Client secret created → SECRET_BOT_PASSWORD copied
- [ ] API permissions added (Microsoft Bot Framework)
- [ ] Admin consent granted (green checkmarks visible)
- [ ] Authentication updated with redirect URIs
- [ ] Bot Framework registration created (optional but recommended)
- [ ] All values saved in secure location

**Once complete, you have the credentials needed for Vercel deployment! 🎉**
