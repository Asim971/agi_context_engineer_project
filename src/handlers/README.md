# Handlers Directory

This directory contains the event handlers for the Anwar Sales Management System. Each handler is responsible for processing specific events, such as Google Form submissions (`onFormSubmit`) or Google Sheet edits (`onEdit`).

## Architectural Pattern

All handlers follow a modern, class-based architecture and extend the `BaseService` class. This provides them with built-in structured logging, robust error handling, and access to core application services.

### Key Responsibilities:
- **Event-Specific Logic**: Each handler contains the business logic for a specific form or sheet. For example, `EngineerHandler.js` processes new engineer registrations.
- **Data Validation**: Handlers are responsible for the initial validation of incoming data, often using the `ValidationService`.
- **Data Processing**: They transform and prepare data from the event object before passing it to the `DatabaseService`.
- **Service Orchestration**: A handler orchestrates calls to various services, such as `DatabaseService` to store data and `WhatsAppService` to send notifications.

## Main Handler (`MainHandler.js`)

`MainHandler.js` acts as the central router for all incoming events from Google Apps Script triggers (`onFormSubmit`, `onEdit`).

- **Routing**: It inspects the event object (e.g., the form ID or sheet name) and uses a `serviceMap` to delegate the event to the appropriate handler instance.
- **Single Entry Point**: This pattern ensures that all event processing starts from a single, manageable entry point, simplifying debugging and maintenance.

## Example Handler (`EngineerHandler.js`)

```javascript
class EngineerHandler extends BaseService {
  constructor() {
    super();
    this.db = getGlobalDB();
    // Specific validation rules for the engineer form
    this.validationService = new ValidationService(Config.VALIDATION_RULES.ENGINEER);
  }

  /**
   * Handles the form submission event for engineer registration.
   * @param {GoogleAppsScript.Events.FormsOnFormSubmit} e The event object.
   */
  onFormSubmit(e) {
    this.executeWithErrorHandling(() => {
      const { data, validationResult } = this._extractAndValidateData(e);

      if (!validationResult.isValid) {
        // Handle validation errors
        return;
      }
      
      // Store the validated data in the database
      this.db.insertRecord(Config.SHEETS.ENGINEER, data);

      // Send a confirmation notification
      const message = `Welcome, ${data.Name}! Your registration is pending approval.`;
      this.whatsAppService.sendMessage(data.Phone, message);
    });
  }

  /**
   * Handles the onEdit event for the Engineer sheet, typically for approvals.
   * @param {GoogleAppsScript.Events.SheetsOnEdit} e The event object.
   */
  onEdit(e) {
    // Logic to handle status changes, like 'Approved'
  }
}
```

#### TASK-HND-002: Enhanced Error Handling and Validation
- **Category**: Enhancement
- **Priority**: High
- **Complexity**: Moderate
- **Phase 1 Alignment**: Error Handling | Modern JS
- **Description**: Implement robust error handling, input validation, and graceful degradation
- **Requirements**:
  - Add comprehensive input validation for all handlers
  - Implement try-catch blocks for all operations
  - Create graceful error recovery mechanisms
  - Add structured logging for handler operations
  - Implement request/response validation
- **Acceptance Criteria**:
  - [ ] Input validation for all handler methods
  - [ ] Try-catch blocks for all operations
  - [ ] Graceful error recovery strategies
  - [ ] Comprehensive logging implementation
  - [ ] Request/response validation schemas

#### TASK-HND-003: Handler Performance Optimization
- **Category**: Enhancement
- **Priority**: High
- **Complexity**: Complex
- **Phase 1 Alignment**: Modern JS | Service Architecture
- **Description**: Optimize handler performance and implement caching mechanisms
- **Requirements**:
  - Implement handler result caching
  - Optimize data processing workflows
  - Add performance monitoring and metrics
  - Create efficient batch processing capabilities
  - Implement request throttling and rate limiting
- **Dependencies**: TASK-HND-001
- **Acceptance Criteria**:
  - [ ] Handler result caching system
  - [ ] Optimized data processing workflows
  - [ ] Performance monitoring metrics
  - [ ] Batch processing capabilities
  - [ ] Rate limiting implementation

### Medium Priority Tasks

#### TASK-HND-004: Handler Testing Framework
- **Category**: Testing
- **Priority**: Medium
- **Complexity**: Moderate
- **Phase 1 Alignment**: Documentation | Modern JS
- **Description**: Create comprehensive testing framework for all handlers
- **Requirements**:
  - Implement unit tests for all handler methods
  - Create integration tests for handler workflows
  - Add mock data and service stubs
  - Implement performance testing for handlers
  - Create test data cleanup utilities
- **Dependencies**: TASK-HND-001
- **Acceptance Criteria**:
  - [ ] Complete unit test coverage
  - [ ] Integration test suite
  - [ ] Mock data and service stubs
  - [ ] Performance test benchmarks
  - [ ] Test cleanup automation

#### TASK-HND-005: Handler Documentation and API Reference
- **Category**: Documentation
- **Priority**: Medium
- **Complexity**: Simple
- **Phase 1 Alignment**: Documentation
- **Description**: Create comprehensive documentation for all handlers
- **Requirements**:
  - Document all handler methods with JSDoc
  - Create API reference documentation
  - Add usage examples and best practices
  - Create troubleshooting guides
  - Document handler workflows and interactions
- **Dependencies**: TASK-HND-001, TASK-HND-002
- **Acceptance Criteria**:
  - [ ] Complete JSDoc documentation
  - [ ] API reference guide
  - [ ] Usage examples and tutorials
  - [ ] Troubleshooting documentation
  - [ ] Workflow documentation

#### TASK-HND-006: Handler Security Enhancement
- **Category**: Security
- **Priority**: Medium
- **Complexity**: Moderate
- **Phase 1 Alignment**: Error Handling | Service Architecture
- **Description**: Implement security measures and access controls for handlers
- **Requirements**:
  - Add authentication and authorization checks
  - Implement input sanitization and validation
  - Add audit logging for sensitive operations
  - Create rate limiting and abuse prevention
  - Implement secure data handling practices
- **Dependencies**: TASK-HND-002
- **Acceptance Criteria**:
  - [ ] Authentication and authorization system
  - [ ] Input sanitization and validation
  - [ ] Audit logging implementation
  - [ ] Rate limiting and abuse prevention
  - [ ] Secure data handling practices

### Low Priority Tasks

#### TASK-HND-007: Advanced Handler Features
- **Category**: Enhancement
- **Priority**: Low
- **Complexity**: Complex
- **Phase 1 Alignment**: Service Architecture | Modern JS
- **Description**: Implement advanced handler features like workflow automation and AI integration
- **Requirements**:
  - Create workflow automation capabilities
  - Implement AI-powered data processing
  - Add advanced analytics and reporting
  - Create handler orchestration system
  - Implement event-driven architecture
- **Dependencies**: TASK-HND-003, TASK-HND-004
- **Acceptance Criteria**:
  - [ ] Workflow automation system
  - [ ] AI-powered processing capabilities
  - [ ] Advanced analytics and reporting
  - [ ] Handler orchestration framework
  - [ ] Event-driven architecture

#### TASK-HND-008: Handler Monitoring and Analytics
- **Category**: Enhancement
- **Priority**: Low
- **Complexity**: Moderate
- **Phase 1 Alignment**: Service Architecture | Documentation
- **Description**: Implement handler monitoring, analytics, and health checks
- **Requirements**:
  - Create handler health monitoring
  - Implement usage analytics and reporting
  - Add performance metrics collection
  - Create alerting for handler issues
  - Implement capacity planning tools
- **Dependencies**: TASK-HND-001, TASK-HND-002
- **Acceptance Criteria**:
  - [ ] Health monitoring dashboard
  - [ ] Usage analytics reports
  - [ ] Performance metrics collection
  - [ ] Automated alerting system
  - [ ] Capacity planning tools

## Implementation Guidelines

### Phase 1 Modernization Checklist
- [ ] Modern JavaScript features (ES6+ classes, async/await, destructuring)
- [ ] Comprehensive error handling with try-catch blocks
- [ ] Service-oriented architecture with clear interfaces
- [ ] Complete JSDoc documentation for all methods
- [ ] Modular, reusable code design
- [ ] Performance optimizations and caching
- [ ] User-friendly error messages and logging

### Quality Assurance
- All handler operations must include comprehensive error handling
- Input validation must be implemented for all user inputs
- Performance impact must be measured and optimized
- All changes must include unit and integration tests
- Documentation must be updated with all modifications

### Security Considerations
- Implement proper input validation and sanitization
- Ensure secure handling of sensitive data
- Add audit logging for all handler operations
- Implement access control and authorization
- Follow secure coding practices

### Reference Documents
- **Task Analysis Template**: `/.agent-os/templates/task-analysis-prompt.md`
- **Code Standards**: `/.agent-os/code-standards.md`
- **Project Configuration**: `/.agent-os/project-config.md`