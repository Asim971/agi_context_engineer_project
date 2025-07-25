# Contractor Registration Form System

A comprehensive Google Apps Script project for contractor registration with modular architecture, Mytapi WhatsApp integration, and enterprise-grade features.

## 🚀 Features

- **Modular Architecture**: Clean separation of concerns with dedicated services
- **Mytapi WhatsApp Integration**: Modern WhatsApp messaging via Mytapi API
- **Advanced Validation**: Comprehensive data validation with sanitization
- **Database Abstraction**: Extensible database service supporting multiple backends
- **Centralized Logging**: Structured logging with multiple levels and contexts
- **Error Handling**: Robust error handling with retry mechanisms and circuit breakers
- **Testing Framework**: Comprehensive testing suite with dependency management
- **Configuration Management**: Centralized configuration with environment support

## 📁 Project Structure

```
contractor-form/
├── Code.js                           # Main application entry point
├── config/
│   └── Config.js                     # Centralized configuration management
├── services/
│   ├── whatsapp/
│   │   ├── MytapiService.js         # Mytapi WhatsApp API integration
│   │   └── NotificationService.js    # WhatsApp notification management
│   └── database/
│       └── DatabaseService.js        # Database abstraction layer
├── utils/
│   ├── Logger.js                     # Centralized logging utility
│   ├── ErrorHandler.js              # Error handling and recovery
│   └── Validator.js                  # Data validation utilities
├── tests/
│   └── TestFramework.js              # Comprehensive testing framework
├── appsscript.json                   # Apps Script configuration
├── .clasp.json                       # CLASP configuration
└── README.md                         # This documentation
```

## 🛠️ Setup Instructions

### 1. Prerequisites

- Google Apps Script account
- Mytapi account with WhatsApp Business API access
- Google Sheets for data storage
- CLASP CLI (optional, for local development)

### 2. Configuration

#### Mytapi WhatsApp Integration

1. **Get Mytapi Credentials**:
   - Sign up at [Mytapi](https://mytapi.com)
   - Obtain your `productId`, `apiKey`, and `phoneId`

2. **Configure in Apps Script**:
   ```javascript
   // Run this function once to set up Mytapi credentials
   function setupMytapiCredentials() {
     setupMytapiConfig({
       productId: 'your-product-id',
       apiKey: 'your-api-key',
       phoneId: 'your-phone-id'
     });
   }
   ```

#### CRO Phone Number Mapping

1. **Option 1: Hardcoded Mapping** (Quick setup):
   ```javascript
   // In Config.js, update the CRO_PHONE_MAPPING
   CRO_PHONE_MAPPING: {
     'cro1@company.com': '+8801712345678',
     'cro2@company.com': '+8801787654321'
   }
   ```

2. **Option 2: Google Sheets Lookup** (Recommended):
   - Create a sheet with columns: Email, Phone
   - Update `CRO_SHEET_ID` in Config.js

### 3. Initial Setup

1. **Deploy the Script**:
   ```bash
   # Using CLASP (optional)
   clasp create --type standalone
   clasp push
   ```

2. **Run Initial Setup**:
   ```javascript
   // Execute these functions in order
   setupMytapiCredentials();  // Set up Mytapi
   createContractorForm();    // Create the form
   testAllSystems();          // Validate setup
   ```

## 📋 Usage

### Creating a Contractor Registration Form

```javascript
// Create a new contractor registration form
const formUrl = createContractorForm();
console.log('Form created:', formUrl);
```

### Manual Notification Testing

```javascript
// Test WhatsApp notification
testMytapiIntegration();

// Test notification service
testNotificationService();
```

### Running Tests

```javascript
// Run all tests
runAllTests();

// Run specific test category
runTestCategory('validation');
runTestCategory('whatsapp');
runTestCategory('database');
```

## 🔧 Configuration Options

### System Configuration

```javascript
// Access configuration
const config = getSystemConfig();
const mytapiConfig = getMytapiConfig();
const formConfig = getFormConfig();
```

### Logging Levels

- `DEBUG`: Detailed debugging information
- `INFO`: General information messages
- `WARN`: Warning messages
- `ERROR`: Error messages

### Error Handling

- **Retry Mechanisms**: Automatic retry for failed operations
- **Circuit Breakers**: Prevent cascading failures
- **Fallback Strategies**: Alternative approaches when primary methods fail

## 📊 Monitoring and Debugging

### Logging

```javascript
// View logs
appLogger.getStats();

// Custom logging
appLogger.info('Custom message', { context: 'additional data' });
appLogger.error('Error occurred', error);
```

### Health Checks

```javascript
// Check system status
getConfigStatus();
mytapiService.getStatus();
databaseService.getStatus();
```

### Performance Monitoring

```javascript
// Measure performance
const timer = appLogger.startTimer('operation-name');
// ... perform operation
timer.end();
```

## 🔌 API Reference

### MytapiService

```javascript
// Initialize service
const mytapi = new MytapiService();

// Send text message
await mytapi.sendTextMessage('+8801712345678', 'Hello World');

// Send media message
await mytapi.sendMediaMessage('+8801712345678', 'https://example.com/image.jpg', 'Image caption');

// Check phone status
const status = await mytapi.getPhoneStatus('+8801712345678');
```

### NotificationService

```javascript
// Send notification to CRO
notificationService.sendNotification('submission', {
  croEmail: 'cro@company.com',
  contractorName: 'John Doe',
  submissionId: 'SUB-001'
});

// Send bulk notifications
notificationService.sendBulkNotifications([
  { type: 'approval', data: {...} },
  { type: 'rejection', data: {...} }
]);
```

### DatabaseService

```javascript
// Insert data
databaseService.insert('submissions', {
  contractorName: 'John Doe',
  phone: '+8801712345678',
  submissionDate: new Date()
});

// Query data
const results = databaseService.query('submissions', {
  contractorName: 'John Doe'
});

// Update data
databaseService.update('submissions', 'SUB-001', {
  status: 'approved'
});
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Mytapi Connection Failed

**Symptoms**: WhatsApp messages not sending

**Solutions**:
- Verify Mytapi credentials in script properties
- Check internet connectivity
- Validate phone number format
- Review Mytapi account status and credits

```javascript
// Debug Mytapi connection
testMytapiIntegration();
getConfigStatus();
```

#### 2. Form Submission Not Processing

**Symptoms**: Form submissions not triggering notifications

**Solutions**:
- Check form trigger setup
- Verify form submission handler
- Review error logs

```javascript
// Debug form processing
testFormCreation();
appLogger.getStats();
```

#### 3. Database Connection Issues

**Symptoms**: Data not saving to sheets

**Solutions**:
- Verify Google Sheets permissions
- Check sheet ID configuration
- Review database service logs

```javascript
// Debug database
testDatabaseService();
databaseService.getStatus();
```

### Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| `MYTAPI_AUTH_FAILED` | Invalid Mytapi credentials | Update credentials in script properties |
| `PHONE_INVALID` | Invalid phone number format | Use +880 format for Bangladesh numbers |
| `SHEET_NOT_FOUND` | Google Sheet not accessible | Check sheet ID and permissions |
| `VALIDATION_FAILED` | Form data validation error | Review form field requirements |
| `RATE_LIMIT_EXCEEDED` | Too many API calls | Implement rate limiting |

## 📈 Best Practices

### Performance Optimization

1. **Batch Operations**: Group multiple operations together
2. **Caching**: Use PropertiesService for frequently accessed data
3. **Async Processing**: Use triggers for time-consuming operations
4. **Rate Limiting**: Respect API rate limits

### Security

1. **Credential Management**: Store sensitive data in script properties
2. **Input Validation**: Always validate and sanitize user input
3. **Error Handling**: Don't expose sensitive information in error messages
4. **Access Control**: Limit script permissions appropriately

### Maintenance

1. **Regular Testing**: Run test suite periodically
2. **Log Monitoring**: Review logs for errors and performance issues
3. **Configuration Backup**: Keep backup of configuration settings
4. **Documentation**: Keep README and code comments updated

## 🔄 Migration Guide

### From WhatsApp Business API to Mytapi

If migrating from the old WhatsApp Business API integration:

1. **Update Configuration**:
   ```javascript
   // Remove old WhatsApp config
   // Add Mytapi config
   setupMytapiCredentials();
   ```

2. **Update Function Calls**:
   ```javascript
   // Old way
   sendWhatsAppMessage(phone, message);
   
   // New way (automatic via NotificationService)
   notificationService.sendNotification(type, data);
   ```

3. **Test Integration**:
   ```javascript
   testMytapiIntegration();
   testNotificationService();
   ```

## 🤝 Contributing

### Development Workflow

1. **Local Development**: Use CLASP for local development
2. **Testing**: Run comprehensive tests before deployment
3. **Code Style**: Follow Google Apps Script best practices
4. **Documentation**: Update README for any changes

### Adding New Features

1. **Create Service**: Add new services in `/services` directory
2. **Add Tests**: Include tests in TestFramework
3. **Update Config**: Add configuration options if needed
4. **Document**: Update README and code comments

## 📄 License

This project is part of the Anwar Sales Management System. All rights reserved.

## 📞 Support

For technical support or questions:
- Review troubleshooting section
- Check error logs using `appLogger.getStats()`
- Run diagnostic tests using `runAllTests()`

---

**Last Updated**: December 2024  
**Version**: 2.0.0 (Mytapi Integration)  
**Compatibility**: Google Apps Script Runtime V8

## Implementation Details

### Core Functions

1. **`createContractorForm()`** - Main function that creates the form
2. **`onFormSubmit(e)`** - Handles form submissions
3. **`createDataSheet()`** - Creates and configures the data storage sheet
4. **`setupFormTrigger(form)`** - Sets up form submission triggers

### Form Fields

| Field Name | Type | Validation | Required |
|------------|------|------------|----------|
| Contractor Name | Text | Min 2 chars, letters/spaces only | Yes |
| Bkash Number | Text | 11 digits, starts with 01[3-9] | Yes |
| Contact Number | Text | 11 digits, starts with 01[3-9] | Yes |
| NID No | Text | 10, 13, or 17 digits | No |
| NID Upload | File | JPG/PNG/PDF, max 5MB | No |

### Data Processing

- **Submission ID**: Auto-generated unique identifier
- **Timestamp**: Automatic submission timestamp
- **Status**: Default "Pending" for new submissions
- **CRO**: Extracted from user's email
- **File Handling**: Secure file upload processing

## Deployment Instructions

### Step 1: Setup Google Apps Script Project

1. Go to [Google Apps Script](https://script.google.com/)
2. Create a new project
3. Replace the default `Code.gs` content with the content from `Code.js`
4. Save the project with a meaningful name (e.g., "Contractor Registration Form")

### Step 2: Deploy the Form

1. In the Apps Script editor, select the `createContractorForm` function
2. Click the "Run" button to execute
3. Grant necessary permissions when prompted:
   - Google Forms access
   - Google Sheets access
   - Google Drive access
4. Check the execution log for form and sheet URLs

### Step 3: Test the Implementation

1. Run the `testFormCreation()` function to validate the setup
2. Check the logs for validation results
3. Test form submission with sample data
4. Verify data appears in the connected Google Sheet

### Step 4: Configure Integration Points (Optional)

For full system integration:

1. **Backend API**: Uncomment and configure the backend API URL in `onFormSubmit`
2. **WhatsApp Notifications**: Implement WhatsApp Business API integration
3. **Folder Management**: Uncomment and set proper folder ID for file organization

## Testing

### Available Test Functions

- **`testFormCreation()`** - Validates form creation and field setup
- **`getFormInfo()`** - Retrieves URLs for existing forms
- **`validateSubmissionData(data)`** - Validates submission data structure

### Manual Testing Checklist

- [ ] Form creates successfully without errors
- [ ] All required fields are present and marked as required
- [ ] Validation rules work correctly
- [ ] File upload accepts valid formats and rejects invalid ones
- [ ] Form submissions trigger the `onFormSubmit` function
- [ ] Data is stored correctly in Google Sheets
- [ ] Submission IDs are unique
- [ ] Error handling works for invalid inputs

## Error Handling

The implementation includes comprehensive error handling:

- **Form Creation Errors**: Logged with detailed error messages
- **Validation Errors**: User-friendly error messages with guidance
- **Submission Errors**: Graceful error handling with logging
- **File Upload Errors**: Size and format validation

## Security Considerations

- **Input Validation**: All inputs are validated using regex patterns
- **File Upload Security**: File type and size restrictions
- **Data Sanitization**: Safe extraction of form response values
- **Access Control**: Form access can be restricted as needed

## Monitoring and Logging

- All operations are logged using `Logger.log()`
- Error messages include context and troubleshooting information
- Submission data includes timestamps and unique identifiers
- Test functions provide detailed validation reports

## Integration with Task Requirements

This implementation fulfills all Task 1 requirements:

✅ **Form Design**: All specified fields implemented with proper validation
✅ **Validation**: Regex patterns and required field validation
✅ **Apps Script Integration**: Complete Google Apps Script setup
✅ **Error Handling**: Comprehensive error handling and logging
✅ **Testing**: Test functions and validation utilities
✅ **Documentation**: Complete implementation documentation

## Next Steps

After successful deployment:

1. Share the form URL with CROs for contractor registration
2. Monitor the Google Sheet for new submissions
3. Implement backend API integration for automated processing
4. Set up WhatsApp notifications for real-time updates
5. Configure folder management for file organization

## Support

For issues or questions:

1. Check the Google Apps Script execution logs
2. Run the test functions to validate setup
3. Review the error handling sections in the code
4. Ensure all required permissions are granted

---

**Note**: This implementation is part of the Anwar Sales Management system and follows the specifications outlined in the Product Requirements Document (PRD).