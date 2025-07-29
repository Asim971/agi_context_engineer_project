# Services Directory

This directory contains the core services for the Anwar Sales Management System. Each service is a single-responsibility ES6 class that extends `BaseService`, providing a modular, reusable, and testable architecture.

## Foundational Services

These services form the bedrock of the application's architecture.

### `BaseService.js`
The abstract base class for all services and handlers. It is not used directly but provides essential, shared functionality to any class that extends it:
- **`this.logger`**: A pre-configured instance of `LoggerService` for structured JSON logging.
- **`this.errorHandler`**: A pre-configured instance of `ErrorHandlerService` for centralized error handling.
- **`this.configService`**: A static accessor to the `ConfigurationService` for managing environment variables.
- **`executeWithErrorHandling(Sync)`**: Wrapper methods that ensure any operation is automatically wrapped in a try-catch block, logging any errors that occur.

### `LoggerService.js`
Provides structured, leveled, and queryable JSON logging. It is accessed via `this.logger` in any service.

### `ErrorHandlerService.js`
A centralized service for catching, logging, and formatting errors throughout the application. It ensures that errors are handled consistently and provides detailed context for debugging.

### `ConfigurationService.js`
Manages all application settings and environment variables by providing a clean interface over Google's `PropertiesService`. It handles the distinction between `test` and `production` environments.

## Business Logic & Integration Services

These services handle specific business requirements and integrations with external APIs.

### `DatabaseService.js`
The sole interface for all Google Sheets operations. It abstracts away the complexities of `SpreadsheetApp` and provides methods for inserting, retrieving, and updating records. It is accessed via the global `getGlobalDB()` function.

### `IdService.js`
Manages the generation of unique, sequential IDs for all entities (e.g., Engineer, Retailer). It uses `LockService` to prevent race conditions and ensure ID uniqueness during concurrent executions.

### `ValidationService.js`
A powerful, rule-based validation engine. It is used by handlers to validate incoming data from form submissions against a predefined set of rules in `Config.js`.

### `WhatsAppService.js`
Handles all interactions with the WhatsApp Business API (via Maytapi). It is responsible for sending notifications and formatted messages.

### `LocationService.js`
Provides utilities for handling location data, such as calculating distances between coordinates.

### `TestEnvironmentService.js`
A utility service dedicated to setting up and tearing down a complete, isolated test environment in Google Drive for automated testing.

### High Priority Tasks

#### TASK-SVC-001: Modernize Service Architecture
- **Category**: Modernization
- **Priority**: High
- **Complexity**: Complex
- **Phase 1 Alignment**: Modern JS | Service Architecture | Error Handling
- **Description**: Refactor all services to use modern JavaScript patterns and service-oriented design
- **Requirements**:
  - Convert services to ES6+ class-based architecture
  - Implement async/await for all asynchronous operations
  - Add comprehensive error handling with try-catch blocks
  - Create modular service methods with clear interfaces
  - Implement service dependency injection and IoC
- **Acceptance Criteria**:
  - [ ] ES6+ class implementation for all services
  - [ ] Async/await pattern throughout services
  - [ ] Comprehensive error handling and recovery
  - [ ] Modular service architecture
  - [ ] Dependency injection implementation

#### TASK-SVC-002: Enhanced Error Handling and Resilience
- **Category**: Enhancement
- **Priority**: High
- **Complexity**: Moderate
- **Phase 1 Alignment**: Error Handling | Modern JS
- **Description**: Implement robust error handling, retry mechanisms, and service resilience
- **Requirements**:
  - Add comprehensive error handling for all services
  - Implement retry logic for transient failures
  - Create circuit breaker patterns for external services
  - Add structured logging for service operations
  - Implement graceful degradation strategies
- **Acceptance Criteria**:
  - [ ] Error handling for all service methods
  - [ ] Retry mechanisms for failed operations
  - [ ] Circuit breaker implementation
  - [ ] Comprehensive logging implementation
  - [ ] Graceful degradation strategies

#### TASK-SVC-003: Service Performance Optimization
- **Category**: Enhancement
- **Priority**: High
- **Complexity**: Complex
- **Phase 1 Alignment**: Modern JS | Service Architecture
- **Description**: Optimize service performance and implement caching mechanisms
- **Requirements**:
  - Implement service result caching
  - Optimize service call patterns and batching
  - Add performance monitoring and metrics
  - Create efficient data processing workflows
  - Implement service load balancing and scaling
- **Dependencies**: TASK-SVC-001
- **Acceptance Criteria**:
  - [ ] Service result caching system
  - [ ] Optimized service call patterns
  - [ ] Performance monitoring metrics
  - [ ] Efficient data processing workflows
  - [ ] Load balancing implementation

### Medium Priority Tasks

#### TASK-SVC-004: Service Testing Framework
- **Category**: Testing
- **Priority**: Medium
- **Complexity**: Moderate
- **Phase 1 Alignment**: Documentation | Modern JS
- **Description**: Create comprehensive testing framework for all services
- **Requirements**:
  - Implement unit tests for all service methods
  - Create integration tests for service interactions
  - Add mock services and test doubles
  - Implement contract testing for service APIs
  - Create performance testing for services
- **Dependencies**: TASK-SVC-001
- **Acceptance Criteria**:
  - [ ] Complete unit test coverage
  - [ ] Integration test suite
  - [ ] Mock services and test doubles
  - [ ] Contract testing implementation
  - [ ] Performance test benchmarks

#### TASK-SVC-005: Service Documentation and API Reference
- **Category**: Documentation
- **Priority**: Medium
- **Complexity**: Simple
- **Phase 1 Alignment**: Documentation
- **Description**: Create comprehensive documentation for all services
- **Requirements**:
  - Document all service methods with JSDoc
  - Create API reference documentation
  - Add usage examples and best practices
  - Create service interaction diagrams
  - Document service configuration and setup
- **Dependencies**: TASK-SVC-001, TASK-SVC-002
- **Acceptance Criteria**:
  - [ ] Complete JSDoc documentation
  - [ ] API reference guide
  - [ ] Usage examples and tutorials
  - [ ] Service interaction diagrams
  - [ ] Configuration documentation

#### TASK-SVC-006: Service Security Enhancement
- **Category**: Security
- **Priority**: Medium
- **Complexity**: Moderate
- **Phase 1 Alignment**: Error Handling | Service Architecture
- **Description**: Implement security measures and access controls for services
- **Requirements**:
  - Add authentication and authorization for services
  - Implement input validation and sanitization
  - Add audit logging for service operations
  - Create rate limiting and abuse prevention
  - Implement secure communication protocols
- **Dependencies**: TASK-SVC-002
- **Acceptance Criteria**:
  - [ ] Authentication and authorization system
  - [ ] Input validation and sanitization
  - [ ] Audit logging implementation
  - [ ] Rate limiting and abuse prevention
  - [ ] Secure communication protocols

### Low Priority Tasks

#### TASK-SVC-007: Advanced Service Features
- **Category**: Enhancement
- **Priority**: Low
- **Complexity**: Complex
- **Phase 1 Alignment**: Service Architecture | Modern JS
- **Description**: Implement advanced service features like orchestration and AI integration
- **Requirements**:
  - Create service orchestration capabilities
  - Implement AI-powered service enhancements
  - Add advanced analytics and monitoring
  - Create service mesh architecture
  - Implement event-driven service communication
- **Dependencies**: TASK-SVC-003, TASK-SVC-004
- **Acceptance Criteria**:
  - [ ] Service orchestration system
  - [ ] AI-powered enhancements
  - [ ] Advanced analytics and monitoring
  - [ ] Service mesh implementation
  - [ ] Event-driven communication

#### TASK-SVC-008: Service Monitoring and Analytics
- **Category**: Enhancement
- **Priority**: Low
- **Complexity**: Moderate
- **Phase 1 Alignment**: Service Architecture | Documentation
- **Description**: Implement service monitoring, analytics, and health checks
- **Requirements**:
  - Create service health monitoring
  - Implement usage analytics and reporting
  - Add performance metrics collection
  - Create alerting for service issues
  - Implement capacity planning tools
- **Dependencies**: TASK-SVC-001, TASK-SVC-002
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
- All service operations must include comprehensive error handling
- Service interfaces must be well-defined and documented
- Performance impact must be measured and optimized
- All changes must include unit and integration tests
- Documentation must be updated with all modifications

### Security Considerations
- Implement proper input validation and sanitization
- Ensure secure handling of sensitive data
- Add audit logging for all service operations
- Implement access control and authorization
- Follow secure coding practices

### Reference Documents
- **Task Analysis Template**: `/.agent-os/templates/task-analysis-prompt.md`
- **Code Standards**: `/.agent-os/code-standards.md`
- **Project Configuration**: `/.agent-os/project-config.md`