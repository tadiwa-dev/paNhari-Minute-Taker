# MICROSOFT GRAPH vs BOT FRAMEWORK - CLARIFIED

## Quick Answer
**They're completely different things:**

| Feature | Microsoft Graph | Bot Framework |
|---------|-----------------|---------------|
| **Purpose** | Access Microsoft 365 data | Register and manage bots |
| **What it does** | Reads emails, Teams messages, transcripts, calendar | Routes messages between Teams and your bot |
| **For your bot** | ✅ NEED THIS (for transcripts!) | ❌ Don't need (optional) |
| **Example API call** | GET /me/onlineMeetings/{id}/transcripts | POST /api/conversations |

---

## What Each One Does

### Microsoft Graph API
- **Purpose:** Access to all Microsoft 365 data
- **Permissions you need:**
  - `OnlineMeetingTranscript.Read.All` → Read meeting transcripts ⭐
  - `Chat.Read.All` → Read chat messages
  - `Mail.Read` → Read emails (if needed)
- **Used by:** Your bot to fetch data
- **Where to configure:** Entra ID → App Registrations → API Permissions

### Bot Framework
- **Purpose:** Direct bot-to-Teams communication
- **Uses:** Bot ID + Password for authentication
- **When to use:** If you want additional bot registration at dev.botframework.com
- **Optional:** For basic Teams bot functionality, you don't need it
- **Where to configure:** https://dev.botframework.com (optional)

---

## FOR PANHHARI - WHAT YOU NEED

✅ **REQUIRED:**
1. Entra ID App Registration (for credentials)
2. Microsoft Graph API permissions (for transcripts)
3. Grant admin consent (green checkmarks)

❌ **OPTIONAL:**
- Bot Framework registration at dev.botframework.com
- (You can add this later if needed)

---

## NEXT STEP

Follow **ENTRA_APP_REGISTRATION.md** with these changes:

**In STEP 5:** Look for "Microsoft Graph" (not Bot Framework)
- Add: `OnlineMeetingTranscript.Read.All`
- Add: `Chat.Read.All`
- Grant admin consent

**Then you have:**
- BOT_ID ← From app registration
- SECRET_BOT_PASSWORD ← From client secret
- Graph permissions ← For reading transcripts

**Ready for Vercel!** ✅
