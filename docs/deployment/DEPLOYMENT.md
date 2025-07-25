# Deployment Guide - Contractor Registration System

This guide provides step-by-step instructions for deploying the Contractor Registration System with Mytapi WhatsApp integration.

## 📋 Pre-Deployment Checklist

### Required Accounts & Services

- [ ] Google Apps Script account
- [ ] Mytapi account with WhatsApp Business API access
- [ ] Google Drive access for file storage
- [ ] Google Sheets for data storage

### Required Information

- [ ] Mytapi Product ID
- [ ] Mytapi API Key
- [ ] Mytapi Phone ID
- [ ] CRO email addresses and phone numbers
- [ ] Google Sheets ID for CRO mapping (optional)

## 🚀 Deployment Steps

### Step 1: Create Google Apps Script Project

1. **Open Google Apps Script**:
   - Go to [script.google.com](https://script.google.com)
   - Click "New Project"
   - Rename project to "Contractor Registration System"

2. **Set Runtime Version**:
   - Go to Project Settings
   - Set Runtime to "V8"

### Step 2: Upload Project Files

#### Option A: Manual Upload (Recommended for beginners)

1. **Create Main Files**:
   - Replace `Code.gs` content with `Code.js`
   - Create additional `.gs` files for each module

2. **Create Directory Structure**:
   ```
   Files to create in Apps Script:
   - Code.gs (main entry point)
   - Config.gs (from config/Config.js)
   - MytapiService.gs (from services/whatsapp/MytapiService.js)
   - NotificationService.gs (from services/whatsapp/NotificationService.js)
   - DatabaseService.gs (from services/database/DatabaseService.js)
   - Logger.gs (from utils/Logger.js)
   - ErrorHandler.gs (from utils/ErrorHandler.js)
   - Validator.gs (from utils/Validator.js)
   - TestFramework.gs (from tests/TestFramework.js)
   ```

#### Option B: CLASP Deployment (Advanced users)

1. **Install CLASP**:
   ```bash
   npm install -g @google/clasp
   ```

2. **Login and Deploy**:
   ```bash
   clasp login
   clasp create --type standalone --title "Contractor Registration System"
   clasp push
   ```

### Step 3: Configure Mytapi Integration

1. **Get Mytapi Credentials**:
   - Login to [Mytapi Dashboard](https://mytapi.com)
   - Navigate to API Settings
   - Copy your Product ID, API Key, and Phone ID

2. **Set Up Credentials in Apps Script**:
   ```javascript
   function setupMytapiCredentials() {
     setupMytapiConfig({
       productId: 'your-actual-product-id',
       apiKey: 'your-actual-api-key',
       phoneId: 'your-actual-phone-id'
     });
     
     console.log('Mytapi credentials configured successfully');
   }
   ```

3. **Run Setup Function**:
   - In Apps Script editor, select `setupMytapiCredentials`
   - Click "Run"
   - Grant necessary permissions

### Step 4: Configure CRO Phone Numbers

#### Option A: Hardcoded Configuration (Quick Setup)

1. **Update Config.gs**:
   ```javascript
   // In the CRO_PHONE_MAPPING section
   CRO_PHONE_MAPPING: {
     'cro1@yourcompany.com': '+8801712345678',
     'cro2@yourcompany.com': '+8801787654321',
     'cro3@yourcompany.com': '+8801898765432'
   }
   ```

#### Option B: Google Sheets Configuration (Recommended)

1. **Create CRO Mapping Sheet**:
   - Create new Google Sheet
   - Add columns: `Email`, `Phone`, `Name`, `Department`
   - Add CRO data

2. **Update Configuration**:
   ```javascript
   // In Config.gs, update CRO_SHEET_ID
   CRO_SHEET_ID: 'your-google-sheet-id',
   USE_SHEET_FOR_CRO_MAPPING: true
   ```

### Step 5: Test the System

1. **Run System Tests**:
   ```javascript
   function deploymentTest() {
     console.log('Starting deployment tests...');
     
     // Test configuration
     const configStatus = getConfigStatus();
     console.log('Config Status:', configStatus);
     
     // Test Mytapi connection
     testMytapiIntegration();
     
     // Test notification service
     testNotificationService();
     
     // Run comprehensive tests
     runAllTests();
     
     console.log('Deployment tests completed');
   }
   ```

2. **Verify Test Results**:
   - Check execution logs for errors
   - Ensure all tests pass
   - Verify WhatsApp test message is received

### Step 6: Create Contractor Registration Form

1. **Generate Form**:
   ```javascript
   function createForm() {
     const formUrl = createContractorForm();
     console.log('Form created successfully:', formUrl);
     return formUrl;
   }
   ```

2. **Test Form Submission**:
   - Open the generated form URL
   - Submit a test entry
   - Verify data is stored in Google Sheets
   - Confirm WhatsApp notification is sent

### Step 7: Set Up Monitoring

1. **Enable Logging**:
   ```javascript
   function enableMonitoring() {
     // Set logging level
     updateConfig('logging', {
       level: 'INFO',
       enableConsole: true,
       enableSheets: true
     });
     
     console.log('Monitoring enabled');
   }
   ```

2. **Create Monitoring Dashboard** (Optional):
   - Create Google Sheet for logs
   - Set up automated reports
   - Configure error alerts

## 🔧 Post-Deployment Configuration

### Performance Optimization

1. **Set Execution Timeout**:
   ```javascript
   // In Config.gs
   SYSTEM: {
     maxExecutionTime: 300000, // 5 minutes
     retryAttempts: 3,
     retryDelay: 1000
   }
   ```

2. **Configure Rate Limiting**:
   ```javascript
   MYTAPI: {
     rateLimitPerMinute: 30,
     rateLimitPerHour: 1000
   }
   ```

### Security Configuration

1. **Review Permissions**:
   - Ensure minimal required permissions
   - Review script sharing settings
   - Validate data access controls

2. **Set Up Access Controls**:
   ```javascript
   // In Config.gs
   SECURITY: {
     allowedDomains: ['yourcompany.com'],
     requireAuthentication: true,
     logSecurityEvents: true
   }
   ```

## 🧪 Testing Checklist

### Functional Tests

- [ ] Form creation works
- [ ] Form submission processes correctly
- [ ] Data validation functions properly
- [ ] WhatsApp notifications are sent
- [ ] Error handling works as expected
- [ ] Logging captures events

### Integration Tests

- [ ] Mytapi API connection successful
- [ ] Google Sheets integration working
- [ ] Phone number validation accurate
- [ ] CRO mapping functions correctly
- [ ] Bulk notifications work

### Performance Tests

- [ ] Form submission under 30 seconds
- [ ] WhatsApp delivery under 60 seconds
- [ ] System handles multiple concurrent submissions
- [ ] Memory usage within limits

## 🚨 Troubleshooting Common Issues

### Issue: Mytapi Authentication Failed

**Solution**:
```javascript
// Verify credentials
function debugMytapi() {
  const config = getMytapiConfig();
  console.log('Mytapi Config:', {
    hasProductId: !!config.productId,
    hasApiKey: !!config.apiKey,
    hasPhoneId: !!config.phoneId
  });
  
  // Test connection
  testMytapiIntegration();
}
```

### Issue: Form Submissions Not Processing

**Solution**:
```javascript
// Check trigger setup
function debugTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  console.log('Active triggers:', triggers.length);
  
  triggers.forEach(trigger => {
    console.log('Trigger:', {
      handlerFunction: trigger.getHandlerFunction(),
      eventType: trigger.getEventType(),
      triggerSource: trigger.getTriggerSource()
    });
  });
}
```

### Issue: WhatsApp Messages Not Delivered

**Solution**:
```javascript
// Debug notification service
function debugNotifications() {
  // Test phone number format
  const testPhone = '+8801712345678';
  const isValid = mytapiService.validatePhoneNumber(testPhone);
  console.log('Phone validation:', isValid);
  
  // Test message sending
  testNotificationService();
  
  // Check notification logs
  appLogger.getStats();
}
```

## 📊 Monitoring and Maintenance

### Daily Checks

- [ ] Review error logs
- [ ] Check WhatsApp delivery rates
- [ ] Monitor form submission volume
- [ ] Verify system performance

### Weekly Maintenance

- [ ] Run comprehensive test suite
- [ ] Review and archive old logs
- [ ] Update CRO phone numbers if needed
- [ ] Check Mytapi account credits

### Monthly Reviews

- [ ] Analyze system performance trends
- [ ] Review and update configuration
- [ ] Plan capacity scaling if needed
- [ ] Update documentation

## 🔄 Rollback Procedure

If issues occur after deployment:

1. **Immediate Actions**:
   ```javascript
   // Disable form submissions
   function emergencyDisable() {
     const triggers = ScriptApp.getProjectTriggers();
     triggers.forEach(trigger => {
       ScriptApp.deleteTrigger(trigger);
     });
     console.log('All triggers disabled');
   }
   ```

2. **Restore Previous Version**:
   - Use Apps Script version history
   - Restore from backup if available
   - Reconfigure settings as needed

3. **Verify Rollback**:
   - Test basic functionality
   - Confirm notifications work
   - Re-enable form submissions

## 📞 Support and Resources

### Documentation
- [README.md](./README.md) - Complete system documentation
- [Mytapi Documentation](https://mytapi.com/docs)
- [Google Apps Script Guide](https://developers.google.com/apps-script)

### Getting Help
- Review troubleshooting section
- Check system logs: `appLogger.getStats()`
- Run diagnostics: `runAllTests()`
- Contact system administrator

---

**Deployment Version**: 2.0.0  
**Last Updated**: December 2024  
**Compatibility**: Google Apps Script V8 Runtime