# 🚀 Manual Deployment Guide - Anwar Sales Ecosystem

Since `clasp` is experiencing extension issues, here's a manual deployment guide to get your unified project running in Google Apps Script.

## 📋 Manual Deployment Steps

### 1. Create New Google Apps Script Project

**Option A: From Google Drive**
1. Go to [Google Drive](https://drive.google.com)
2. Click **New** → **More** → **Google Apps Script**
3. Name it "Anwar Sales Ecosystem"
4. Delete the default `Code.gs` file

**Option B: From Google Sheets**
1. Open your main CRM spreadsheet
2. Go to **Extensions** → **Apps Script**
3. Name it "Anwar Sales Ecosystem"
4. Delete the default `Code.gs` file

### 2. Copy Files to Apps Script

**Step 1: Copy `appsscript.json`**
1. In the Apps Script editor, click the settings gear icon
2. Check "Show 'appsscript.json' manifest file in editor"
3. Replace the entire content of `appsscript.json` with:

```json
{
  "timeZone": "Asia/Karachi",
  "dependencies": {
    "enabledAdvancedServices": [
      {
        "userSymbol": "Sheets",
        "serviceId": "sheets",
        "version": "v4"
      },
      {
        "userSymbol": "Drive",
        "serviceId": "drive",
        "version": "v3"
      }
    ]
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "executionApi": {
    "access": "ANYONE"
  },
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/script.external_request",
    "https://www.googleapis.com/auth/forms"
  ]
}
```

**Step 2: Create Files in Order**

Create each file in the Apps Script editor by clicking the **+** (plus) icon → **Script file**:

1. **Config** (file: `Config`)
   - Copy content from `src/config/Config.js`

2. **DatabaseService** (file: `DatabaseService`)
   - Copy content from `src/database/DatabaseService.js`

3. **WhatsAppService** (file: `WhatsAppService`)
   - Copy content from `src/services/WhatsAppService.js`

4. **MainHandler** (file: `MainHandler`)
   - Copy content from `src/handlers/MainHandler.js`

5. **EngineerHandler** (file: `EngineerHandler`)
   - Copy content from `src/handlers/EngineerHandler.js`

6. **PotentialSiteHandler** (file: `PotentialSiteHandler`)
   - Copy content from `src/handlers/PotentialSiteHandler.js`

7. **RetailerHandler** (file: `RetailerHandler`)
   - Copy content from `src/handlers/RetailerHandler.js`

8. **CRMHandler** (file: `CRMHandler`)
   - Copy content from `src/handlers/CRMHandler.js`

9. **InitializeSheets** (file: `InitializeSheets`)
   - Copy content from `src/legacy/InitializeSheets.js`

10. **SetupTriggers** (file: `SetupTriggers`)
    - Copy content from `src/legacy/SetupTriggers.js`

11. **Code** (file: `Code`)
    - Copy content from `src/Code.gs`

### 3. Configure Project Properties

1. In Apps Script editor, go to **Project Settings** (gear icon)
2. Scroll to **Script Properties**
3. Add these properties:
   - **Key**: `MAYTAPI_API_KEY` | **Value**: [your-maytapi-api-key]
   - **Key**: `CRM_SPREADSHEET_ID` | **Value**: [your-main-spreadsheet-id]

### 4. Initial Setup

1. **Save all files** (Ctrl+S or Cmd+S)
2. **Run the `setup()` function**:
   - Select `setup` from the function dropdown
   - Click the **Run** button (▶️)
   - **Authorize** all requested permissions

3. **Verify setup**:
   - Check your Google Sheets for newly created sheets
   - Look for logs in **Executions** tab

### 5. Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Select **Type**: **Web app**
3. Configure:
   - **Description**: "Anwar Sales Ecosystem v2.0"
   - **Execute as**: Me
   - **Who has access**: Anyone
4. Click **Deploy**
5. Copy the **Web app URL** for your forms

### 6. Connect Google Forms

**For each form (Engineer, Potential Site, Retailer):**
1. Open the Google Form
2. Click **Responses** → **⋮** → **Choose response destination**
3. Select **Apps Script** and paste your Web app URL
4. Or use **Triggers** → **Form submit** in Apps Script

### 7. Test Everything

1. **Test form submissions** from each form
2. **Check WhatsApp notifications** (if configured)
3. **Verify data appears** in correct sheets
4. **Test sheet edit triggers** by manually editing CRM sheets

## 🔧 Alternative: Fix clasp Issue

If you want to use clasp, try these fixes:

1. **Update clasp**:
```bash
npm uninstall -g @google/clasp
npm install -g @google/clasp@latest
```

2. **Use npx with specific version**:
```bash
npx @google/clasp@2.4.2 login
npx @google/clasp@2.4.2 create --title "Anwar Sales Ecosystem" --type sheets
npx @google/clasp@2.4.2 push
```

3. **Check Node.js version** (should be 14+):
```bash
node --version
```

## 🎯 Quick Verification

After deployment, run these in Apps Script:

```javascript
// Test system health
healthCheck();

// Get project info
console.log(getSystemInfo());

// Test database connection
DB.initialize();
console.log('Database initialized successfully');
```

## 📞 Support

If you encounter issues:
1. Check **Executions** tab for error logs
2. Verify all **Script Properties** are set
3. Ensure **Advanced Google services** are enabled
4. Check **OAuth scopes** in project settings

Your unified project is ready to go! 🚀