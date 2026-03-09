# Fix Teams Messaging Policy for Bot

Your bot is uploaded but blocked by an organization messaging policy.

## Solution: Allow the App in Messaging Policy

### Step 1: Go to Teams Admin Center
1. Open https://admin.teams.microsoft.com
2. Sign in with your admin account

### Step 2: Find Messaging Policies
1. Go to **"Messaging policies"** in the left sidebar
   - Path: **Teams → Messaging policies** (or search for "messaging policies")
2. Look for your default policy (usually called **"Global" or "Default"**)
3. Click on it to edit

### Step 3: Allow Third-Party Apps
In the messaging policy editor, look for these settings:

**Search for:"** 
- "Third-party apps" 
- "External app access"
- "Allow third-party apps"

**Toggle/Set to:**
- ✅ **"On"** or **"Allow"**

### Step 4: Allow Custom Apps/LOB Apps
Also look for:
- "Custom/Line-of-Business (LOB) apps"
- "Org-wide custom app settings"

**Set to:**
- ✅ **"On"** or **"Allow"**

### Step 5: Save
1. Click **"Save"** at the bottom
2. Wait 15-30 minutes for the policy to propagate (Teams cache update)

### Step 6: Go Back to Teams and Retry
1. Open Teams
2. Go to **"Apps"**
3. Search for **"paNhari Minute Taker"**
4. Click **"Add"** or **"Open"**
5. Send **"hi"**

## If Still Blocked

Your organization might have restricted app installations. Contact your Teams admin and ask them to:
1. **Allow "paNhari Minute Taker" app** in the Teams admin center
2. **Add it to the org-wide public app list** (if available)
3. **Check if apps need explicit approval** before installation

## Alternative: Admin Install

Your Teams admin can:
1. Go to **"Manage apps"** in Teams Admin Center
2. Find **"paNhari Minute Taker"**
3. Click **"...More options"** → **"Setup policies"**
4. Add to a setup policy and assign to users
