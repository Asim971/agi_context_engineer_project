# Prompt Library - Anwar Sales Management System

## Overview

This prompt library contains a comprehensive collection of optimized prompts for all agents in the Anwar Sales Management System agentic workflow. Each prompt is designed to maximize agent effectiveness while maintaining consistency with project objectives and technical constraints.

## Prompt Categories

### 1. Development Prompts
### 2. Integration Prompts  
### 3. Quality Assurance Prompts
### 4. Business Process Prompts
### 5. Context Engineering Prompts

## Development Prompts

### Google Apps Script Development Prompt

```markdown
As a Google Apps Script developer for the Anwar Sales Management System, implement the following functionality:

**Context Integration:**
- Platform: Google Apps Script V8 runtime with 6-minute execution limits
- Architecture: Service-oriented design with shared utilities
- Standards: <mcfile name="code-standards.md" path=".agent-os/code-standards.md"></mcfile>
- Guidelines: <mcfile name="ai-guidelines.md" path=".agent-os/ai-guidelines.md"></mcfile>

**Implementation Requirements:**
- Use modern JavaScript (ES6+, async/await, destructuring)
- Implement proper error handling with AppScriptError class
- Include comprehensive logging for debugging and monitoring
- Optimize for batch operations to handle execution time limits
- Use PropertiesService for configuration management

**Security Requirements:**
- Validate all inputs using comprehensive sanitization
- Implement role-based access control
- Encrypt sensitive data and use PropertiesService for API keys
- Include audit logging for all data modifications
- Ensure GDPR compliance with data handling

**Performance Optimization:**
- Implement intelligent caching strategies
- Use batch operations for Google Sheets interactions
- Optimize database queries and API calls
- Handle rate limiting with exponential backoff
- Monitor execution time and implement timeout handling

**Code Structure:**
```javascript
// Example service implementation
class [ServiceName]Service {
  constructor(dependencies = {}) {
    this.config = dependencies.config || ConfigService;
    this.logger = dependencies.logger || LoggerService;
    this.database = dependencies.database || DatabaseService;
  }

  async processRequest(data) {
    try {
      // Implementation with proper error handling
    } catch (error) {
      this.logger.error(`Service operation failed: ${error.message}`, { data, error });
      throw new AppScriptError('OPERATION_FAILED', error.message, { service: '[ServiceName]' });
    }
  }
}
```

**Quality Gates:**
- Unit tests for all business logic functions
- Integration tests for external API calls
- Performance validation for batch operations
- Security review for data handling and access control
- Documentation for all public methods and configuration
```

### Database Service Prompt

```markdown
As the Database Service developer for the Anwar Sales Management System, implement data access and management functionality:

**Database Strategy:**
- Current: Google Sheets as MVP database with validation rules
- Future: Migration path to Google Cloud SQL or Firestore
- Dual Storage: Sheets (temporary, 48-hour cleanup) + permanent backend
- Synchronization: Real-time data sync between systems

**Service Requirements:**
- Implement DatabaseService class with CRUD operations
- Support batch operations for performance optimization
- Include data validation and sanitization
- Implement connection pooling and caching strategies
- Handle Google Sheets API rate limiting

**Data Models:**
- Contractor: name, bkashNumber, contactNumber, nidNo, nidDocument
- Engineer: similar structure with certification tracking
- Retailer: business details and verification workflows
- Potential Site: location data and assessment information

**Implementation Pattern:**
```javascript
class DatabaseService {
  constructor() {
    this.sheetsCache = new Map();
    this.rateLimiter = new RateLimiter();
  }

  async insertRecord(tableName, data) {
    const validatedData = this.validateData(data, this.getSchema(tableName));
    const sheet = await this.getSheet(tableName);
    return await this.rateLimiter.execute(() => sheet.appendRow(validatedData));
  }

  async batchInsert(tableName, records) {
    // Batch operation implementation
  }
}
```

**Quality Requirements:**
- Data integrity validation on all operations
- Audit logging for all data modifications
- Error handling with detailed context information
- Performance monitoring for large datasets
- Backup and recovery procedures
```

## Integration Prompts

### WhatsApp API Integration Prompt

```markdown
As the WhatsApp integration developer for the Anwar Sales Management System, implement MyTAPI integration:

**MyTAPI Configuration:**
- Endpoint: Use MyTAPI-specific endpoints for WhatsApp Business API
- Authentication: API key management via PropertiesService
- Rate Limiting: Respect MyTAPI rate limits and implement queuing
- Message Templates: Use approved business message templates

**Integration Requirements:**
- Implement NotificationService class for WhatsApp messaging
- Support template-based messaging with dynamic parameters
- Handle delivery status callbacks and error responses
- Implement retry logic with exponential backoff
- Log all notification attempts and delivery status

**Message Templates:**
- Registration Confirmation: Welcome message with details
- Approval Notification: Status update with decision details
- Error Notification: System error alerts for administrators
- Reminder Messages: Follow-up notifications for pending actions

**Implementation Pattern:**
```javascript
class NotificationService {
  constructor() {
    this.apiKey = ConfigService.getApiKey('MYTAPI_KEY');
    this.baseUrl = 'https://api.mytapi.com/v1';
    this.messageQueue = [];
  }

  async sendWhatsAppMessage(phoneNumber, templateName, parameters) {
    try {
      const message = this.buildMessage(templateName, parameters);
      const response = await this.makeApiCall('POST', '/messages', {
        to: phoneNumber,
        message: message
      });
      
      this.logNotification(phoneNumber, templateName, response.status);
      return response;
    } catch (error) {
      this.handleNotificationError(error, phoneNumber, templateName);
    }
  }
}
```

**Error Handling:**
- Implement comprehensive error categorization
- Handle network failures with retry logic
- Log failed notifications for manual follow-up
- Provide fallback notification methods (email)
- Monitor delivery rates and API performance
```

### Google Workspace Integration Prompt

```markdown
As the Google Workspace integration developer, implement seamless integration with Google services:

**Integration Services:**
- Google Sheets: Data storage and CRM interface
- Google Forms: User input and data collection
- Google Drive: Document storage and management
- Gmail: Email notifications and communication

**Service Implementation:**
- WorkspaceService class for centralized Google API interactions
- OAuth 2.0 authentication with proper scope management  
- Service account configuration for automated operations
- API quota management and rate limiting
- Error handling for service unavailability

**Google Sheets Integration:**
```javascript
class WorkspaceService {
  constructor() {
    this.sheetsApi = Sheets.Spreadsheets;
    this.driveApi = Drive.Files;
    this.formsApi = Forms.Forms;
  }

  async createRegistrationSheet(registrationType) {
    const sheetId = await this.sheetsApi.create({
      properties: { title: `${registrationType}_Registration_${Date.now()}` }
    });
    
    await this.setupSheetValidation(sheetId, registrationType);
    return sheetId;
  }

  async setupFormTriggers(formId, handlerFunction) {
    ScriptApp.newTrigger(handlerFunction)
      .onFormSubmit()
      .form(FormApp.openById(formId))
      .create();
  }
}
```

**Quality Standards:**
- Implement proper error handling for all Google API calls
- Use batch operations where possible for performance
- Include comprehensive logging and monitoring
- Handle authentication and permission errors gracefully
- Document all API interactions and configuration requirements
```

## Quality Assurance Prompts

### Testing Strategy Prompt

```markdown
As the Testing Agent for the Anwar Sales Management System, implement comprehensive testing strategies:

**Testing Framework:**
- Unit Testing: Google Apps Script testing with mock services
- Integration Testing: End-to-end workflow validation
- Performance Testing: Load testing for expected transaction volumes
- Security Testing: Input validation and authorization testing

**Test Categories:**
- **Unit Tests**: Individual function and service testing
- **Integration Tests**: API and service interaction testing
- **User Acceptance Tests**: Stakeholder workflow validation
- **Performance Tests**: Response time and throughput validation
- **Security Tests**: Authentication, authorization, and data protection

**Implementation Approach:**
```javascript
// Example test structure
class RegistrationServiceTest {
  static runAllTests() {
    TestRunner.run([
      () => this.testValidRegistration(),
      () => this.testInvalidInput(),
      () => this.testDuplicateRegistration(),
      () => this.testNotificationDelivery()
    ]);
  }

  static testValidRegistration() {
    const testData = {
      name: 'Test Contractor',
      bkashNumber: '01700000000',
      contactNumber: '01800000000', 
      nidNo: '1234567890123'
    };
    
    const result = RegistrationService.processRegistration(testData);
    Assert.isTrue(result.success, 'Valid registration should succeed');
  }
}
```

**Test Data Management:**
- Create realistic test data sets for all registration types
- Implement test data cleanup procedures
- Use separate test environments for different test types
- Include edge cases and error scenarios in test data

**Quality Gates:**
- All unit tests must pass before code integration
- Integration tests validate end-to-end workflows
- Performance tests confirm response time requirements
- Security tests validate data protection and access control
```

### Code Review Prompt

```markdown
As a code reviewer for the Anwar Sales Management System, evaluate code quality and compliance:

**Review Criteria:**
- **Code Standards**: Compliance with <mcfile name="code-standards.md" path=".agent-os/code-standards.md"></mcfile>
- **Security**: Input validation, authentication, and data protection
- **Performance**: Optimization for Google Apps Script constraints
- **Maintainability**: Code organization, documentation, and readability

**Review Checklist:**

**Modern JavaScript Standards:**
- ✅ Uses const/let instead of var
- ✅ Implements async/await for asynchronous operations
- ✅ Uses destructuring and template literals appropriately
- ✅ Follows ES6+ best practices and patterns

**Error Handling:**
- ✅ Implements comprehensive try-catch blocks
- ✅ Uses custom AppScriptError class for error categorization
- ✅ Includes proper error logging with context
- ✅ Handles specific error scenarios (rate limiting, timeouts)

**Security Implementation:**
- ✅ Validates and sanitizes all user inputs
- ✅ Uses PropertiesService for sensitive configuration
- ✅ Implements role-based access control
- ✅ Includes audit logging for data modifications

**Performance Optimization:**
- ✅ Uses batch operations for Google Sheets interactions
- ✅ Implements caching for frequently accessed data
- ✅ Handles execution time limits appropriately
- ✅ Optimizes API calls and resource usage

**Documentation and Testing:**
- ✅ Includes comprehensive function documentation
- ✅ Has unit tests for all business logic
- ✅ Includes integration tests for external services
- ✅ Documents configuration and deployment procedures

**Review Outcome:**
- **Approved**: Code meets all quality standards
- **Approved with Comments**: Minor improvements needed
- **Requires Changes**: Significant issues must be addressed
- **Rejected**: Major quality or security concerns
```

## Business Process Prompts

### Registration Workflow Prompt

```markdown
As the Registration Workflow developer, implement the complete registration and approval process:

**Workflow Components:**
- Form submission handling and data validation
- Automated data storage in Google Sheets and backend
- Real-time WhatsApp notification delivery
- CRM approval workflow integration
- 48-hour automated cleanup process

**Stakeholder Workflows:**

**CRO (Customer Relationship Officer) Workflow:**
1. Submit contractor registration via Google Form
2. Receive WhatsApp confirmation of submission
3. Monitor approval status in CRM system
4. Receive notification of approval/rejection decision

**BDO (Business Development Officer) Workflow:**
1. Submit engineer registration and site assessments
2. Manage approval workflows for site evaluations
3. Coordinate with CRM team for verification processes
4. Track registration status and completion metrics

**CRM Team Workflow:**
1. Review registration data in Google Sheets interface
2. Validate submitted information and documents
3. Approve or reject registrations with comments
4. Monitor system performance and data quality

**Implementation Pattern:**
```javascript
class RegistrationWorkflowService {
  async processFormSubmission(formData, registrationType) {
    try {
      // 1. Validate submitted data
      const validatedData = await this.validateRegistration(formData, registrationType);
      
      // 2. Store in dual systems
      await Promise.all([
        this.storeInSheets(validatedData, registrationType),
        this.storeInBackend(validatedData, registrationType)
      ]);
      
      // 3. Send confirmation notification
      await this.sendConfirmationNotification(validatedData);
      
      // 4. Schedule cleanup task
      this.scheduleCleanup(validatedData.id, registrationType);
      
      return { success: true, registrationId: validatedData.id };
    } catch (error) {
      this.handleWorkflowError(error, formData, registrationType);
    }
  }
}
```

**Quality Requirements:**
- Implement proper error handling at each workflow step
- Include comprehensive audit logging for compliance
- Handle concurrent registrations without data conflicts
- Provide real-time status tracking for all stakeholders
- Ensure data consistency across all storage systems
```

## Context Engineering Prompts

### System Context Prompt

```markdown
When working on the Anwar Sales Management System, always consider the following system context:

**Business Context:**
- **Domain**: Sales management and stakeholder registration systems
- **Scale**: Enterprise-level system supporting CRO, BDO, SR, and CRM teams
- **Growth**: Designed to support 5x transaction volume increase
- **Compliance**: GDPR compliance with audit trails and data protection

**Technical Context:**
- **Platform**: Google Apps Script V8 runtime with modern JavaScript support
- **Database**: Google Sheets (MVP) with migration path to Cloud SQL/Firestore
- **Integration**: Google Workspace APIs and WhatsApp Business API via MyTAPI
- **Constraints**: 6-minute execution limits, API rate limits, real-time processing needs

**Performance Requirements:**
- **Response Time**: <5 seconds for form submissions
- **Availability**: 99.9% system uptime
- **Notifications**: <30 seconds for WhatsApp message delivery
- **Data Accuracy**: 100% synchronization between storage systems

**Security Requirements:**
- **Authentication**: Google OAuth 2.0 integration
- **Authorization**: Role-based access control for all stakeholders
- **Data Protection**: Encryption at rest and in transit
- **Compliance**: GDPR, audit logging, data retention policies

**Integration Points:**
- **Google Forms**: Data collection interfaces for all registration types
- **Google Sheets**: CRM interface and temporary data storage
- **Google Drive**: Document storage and management
- **MyTAPI**: WhatsApp Business API for real-time notifications
- **Backend Database**: Permanent data storage with full audit capabilities

Always reference these context points when making technical decisions or implementing functionality.
```

### Agent Communication Context Prompt

```markdown
When communicating between agents in the Anwar Sales Management System workflow:

**Communication Protocol:**
1. **Context Preservation**: Always include relevant business and technical context
2. **Quality Standards**: Reference code standards and implementation guidelines
3. **Integration Requirements**: Specify dependencies and interface requirements
4. **Success Criteria**: Define measurable outcomes and validation requirements

**Required Context Elements:**
- **Business Objective**: Clear statement of business goal being addressed
- **Technical Constraints**: Google Apps Script limitations and platform constraints
- **Integration Dependencies**: Required external services and APIs
- **Quality Standards**: Testing, security, and performance requirements
- **Timeline**: Expected completion timeline and milestones

**Handoff Template:**
```markdown
**Agent Handoff: [SOURCE] → [TARGET]**

**Business Context:**
- Objective: [Business goal and stakeholder benefit]
- Stakeholders: [Affected stakeholders: CRO, BDO, SR, CRM]
- Success Metrics: [Measurable success criteria]

**Technical Context:**
- Platform: Google Apps Script with [specific services]
- Integration: [Required APIs and external services]
- Performance: [Response time and throughput requirements]
- Security: [Authentication, authorization, data protection needs]

**Deliverables:**
- [Specific outputs and artifacts expected]
- [Quality gates and validation requirements]
- [Documentation and testing needs]

**Dependencies:**
- [Required inputs and prerequisites]
- [External service dependencies]
- [Configuration and environment requirements]
```

Use this template for all inter-agent communication to ensure context consistency and quality delivery.
```

## Prompt Optimization Guidelines

### Prompt Effectiveness Criteria

1. **Clarity**: Prompts must be clear, specific, and actionable
2. **Context**: Include all relevant business and technical context
3. **Completeness**: Cover all requirements and success criteria
4. **Consistency**: Align with project standards and guidelines
5. **Quality**: Include validation and testing requirements

### Continuous Improvement Process

1. **Performance Monitoring**: Track prompt effectiveness and agent response quality
2. **Feedback Integration**: Collect and integrate agent feedback for prompt refinement
3. **A/B Testing**: Test prompt variations to optimize performance
4. **Best Practice Evolution**: Continuously update prompts based on learning and results

### Version Control

- All prompts are versioned with change tracking
- Performance metrics are maintained for each prompt version
- Rollback procedures are available for prompt regression
- Documentation includes rationale for all prompt modifications

---

*This prompt library serves as the foundation for effective agent communication and task execution in the Anwar Sales Management System agentic workflow.*
