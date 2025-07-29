# Code Standards for Anwar Sales Management System

## Overview
These standards ensure consistent, secure, and efficient code development for the Anwar Sales Management System, aligning with the architecture using Google Apps Script, Google Sheets (MVP), Google Forms, and MyTAPI integrations. These standards support both current operations and future enhancement roadmap implementation.

## Modern JavaScript Standards

### ES6+ Features
- **Variable Declarations**: Use `const` for immutable values, `let` for mutable variables, avoid `var`
- **Arrow Functions**: Prefer arrow functions for concise syntax and lexical `this` binding
- **Destructuring**: Use object and array destructuring for cleaner code
- **Template Literals**: Use template literals for string interpolation
- **Async/Await**: Prefer async/await over Promises for better readability

```javascript
// Modern JavaScript Example
const processRegistration = async ({ name, email, phone, ...otherData }) => {
  try {
    const validatedData = await validateFormData({ name, email, phone, ...otherData });
    const result = await DatabaseService.insertRecord('registrations', validatedData);
    return { success: true, id: result.id };
  } catch (error) {
    Logger.severe(`Registration processing failed: ${error.message}`);
    throw new AppScriptError('REGISTRATION_FAILED', error.message, { name, email });
  }
};
```

## Coding Best Practices

### Modularity and Reusability
- **Service Classes**: Implement service-oriented architecture with base classes
- **Dependency Injection**: Use constructor injection for service dependencies
- **Single Responsibility**: Each function/class should have one clear purpose
- **Composition over Inheritance**: Favor composition for code reuse

### Error Handling Standards
- **Custom Error Classes**: Implement specific error types for different scenarios
- **Error Context**: Include relevant context information in error objects
- **Retry Mechanisms**: Implement exponential backoff for transient failures
- **Graceful Degradation**: Provide fallback mechanisms for non-critical failures

```javascript
// Enhanced Error Handling
class AppScriptError extends Error {
  constructor(code, message, context = {}) {
    super(message);
    this.name = 'AppScriptError';
    this.code = code;
    this.context = context;
    this.timestamp = new Date().toISOString();
  }
}

const withRetry = async (operation, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
};
```

### Security Standards
- **API Key Management**: Use PropertiesService for sensitive configuration
- **Input Validation**: Implement comprehensive input sanitization
- **Role-Based Access**: Enforce user permissions at service level
- **Audit Logging**: Log all data modifications with user context
- **GDPR Compliance**: Implement data protection and privacy controls

```javascript
// Secure Configuration Management
class ConfigService {
  static getApiKey(keyName) {
    const key = PropertiesService.getScriptProperties().getProperty(keyName);
    if (!key) {
      throw new AppScriptError('CONFIG_MISSING', `API key ${keyName} not configured`);
    }
    return key;
  }
  
  static validateInput(data, schema) {
    // Implement comprehensive validation
    return ValidationService.validate(data, schema);
  }
}
```

### Performance Standards
- **Batch Operations**: Use batch APIs for multiple operations
- **Caching Strategy**: Implement intelligent caching for frequently accessed data
- **Connection Pooling**: Reuse connections where possible
- **Lazy Loading**: Load data only when needed

```javascript
// Performance Optimization Example
class DatabaseService {
  static async batchInsert(sheetName, records) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    const values = records.map(record => Object.values(record));
    
    // Batch operation instead of individual inserts
    const range = sheet.getRange(sheet.getLastRow() + 1, 1, values.length, values[0].length);
    range.setValues(values);
    
    return { inserted: values.length, startRow: sheet.getLastRow() - values.length + 1 };
  }
}
```

## Documentation Standards
- **JSDoc Comments**: Use JSDoc for function and class documentation
- **Inline Comments**: Explain complex business logic and algorithms
- **README Files**: Maintain current documentation for each module
- **API Documentation**: Document all public interfaces and endpoints

```javascript
/**
 * Processes user registration with validation and audit logging
 * @param {Object} registrationData - User registration information
 * @param {string} registrationData.name - Full name of the user
 * @param {string} registrationData.email - Email address
 * @param {string} registrationData.phone - Phone number
 * @param {Object} userContext - Current user context for audit logging
 * @returns {Promise<Object>} Registration result with success status and ID
 * @throws {AppScriptError} When validation fails or database operation fails
 */
const processUserRegistration = async (registrationData, userContext) => {
  // Implementation
};
```

## Integration Standards

### Google Workspace
- **Native APIs**: Use built-in Sheets and Forms APIs for optimal performance
- **Quota Management**: Implement rate limiting and quota monitoring
- **V8 Runtime**: Leverage modern JavaScript capabilities
- **Execution Limits**: Design for 6-minute execution time limits

### WhatsApp API (MyTAPI)
- **Template Management**: Use predefined message templates
- **Error Recovery**: Implement robust error handling for API failures
- **Rate Limiting**: Respect API rate limits with queuing
- **Message Queuing**: Queue messages for reliable delivery

### Future-Ready Architecture
- **PWA Compatibility**: Structure code to support Progressive Web App features
- **Mobile Optimization**: Design with mobile-first principles
- **Analytics Ready**: Prepare for real-time analytics integration
- **Workflow Automation**: Design for future automation capabilities

## Testing Standards

### Unit Testing
- **Test Coverage**: Aim for 80%+ code coverage
- **Edge Cases**: Test boundary conditions and error scenarios
- **Mocking**: Use mocks for external dependencies
- **Assertions**: Use descriptive assertions with clear error messages

### Integration Testing
- **API Testing**: Test all external API integrations
- **Database Testing**: Validate data operations and constraints
- **Workflow Testing**: Test complete business processes
- **Performance Testing**: Validate response times and resource usage

### Quality Assurance
- **Code Reviews**: Mandatory peer reviews for all changes
- **Automated Testing**: CI/CD pipeline with automated test execution
- **Static Analysis**: Use linting tools for code quality
- **Security Scanning**: Regular security assessments

## Example Implementation

```javascript
// Complete example following all standards
class RegistrationService extends BaseService {
  constructor() {
    super('RegistrationService');
    this.validator = new ValidationService();
    this.database = new DatabaseService();
    this.notifier = new NotificationService();
  }
  
  /**
   * Process contractor registration with full validation and audit trail
   */
  async processContractorRegistration(data, userContext) {
    return this.executeWithErrorHandling(async () => {
      // Validate input data
      const validatedData = await this.validator.validate(data, 'contractor-schema');
      
      // Check for duplicates
      const existing = await this.database.findByEmail('contractors', validatedData.email);
      if (existing) {
        throw new AppScriptError('DUPLICATE_REGISTRATION', 'Email already registered');
      }
      
      // Insert with audit trail
      const result = await this.database.insertWithAudit('contractors', {
        ...validatedData,
        status: 'pending',
        createdBy: userContext.email,
        createdAt: new Date().toISOString()
      }, userContext);
      
      // Send notification
      await this.notifier.sendRegistrationConfirmation(validatedData.email, result.id);
      
      this.logger.info('Contractor registration processed', { id: result.id, email: validatedData.email });
      return { success: true, id: result.id };
    });
  }
}
```

## Reference Documents
Always reference these documents for alignment:
- <mcfile name="mission.md" path="e:\Anwar_sales_eco\.agent-os\product\mission.md"></mcfile>
- <mcfile name="sales-eco-spec.md" path="e:\Anwar_sales_eco\.agent-os\projects\sales-eco-spec.md"></mcfile>
- <mcfile name="task-manager-agent.md" path="e:\Anwar_sales_eco\.agent-os\agents\task-manager-agent.md"></mcfile>
- <mcfile name="enhancement-roadmap.md" path="e:\Anwar_sales_eco\.agent-os\roadmap\enhancement-roadmap.md"></mcfile>