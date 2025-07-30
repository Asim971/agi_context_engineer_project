# Fix Integration Test Errors - ServiceBootstrap and OrderHandler Issues

As the **Backend Development Agent** for the Anwar Sales Management System, analyze and implement fixes for critical service registration and integration test failures:

## Context Integration

### Business Context

- **Stakeholder Impact**: Integration test failures prevent validation of OrderHandler workflows critical for CRO, BDO, and SR operations
- **System Reliability**: Service registration issues affect core business processes including order management and approval workflows
- **Quality Assurance**: Foundation tests at 70% pass rate indicate systemic service architecture problems
- **Performance Impact**: Service instantiation failures affect real-time notification and data processing capabilities

### Technical Context

- **Platform**: Google Apps Script with Google Sheets as MVP database
- **Architecture**: Service-oriented architecture with GlobalServiceLocator pattern
- **Integration Requirements**: WhatsApp notifications via MyTAPI, Google Workspace APIs
- **Current State**: Critical services (ErrorHandler, HandlerService, DatabaseService) not properly registered

### Quality Standards

**Reference Guidelines:**

- <mcfile name="ai-guidelines.md" path=".agent-os/ai-guidelines.md"></mcfile>
- <mcfile name="mission.md" path=".agent-os/product/mission.md"></mcfile>
- <mcfile name="sales-eco-spec.md" path=".agent-os/projects/sales-eco-spec.md"></mcfile>
- <mcfile name="code-standards.md" path=".agent-os/code-standards.md"></mcfile>

### Problem Context

- <mcfile name="issue.md" path="e:\Anwar_sales_eco\issue.md"></mcfile>
- <mcfile name="OrderHandler.integration.test.js" path="e:\Anwar_sales_eco\src\tests\OrderHandler.integration.test.js"></mcfile>
- <mcfile name="01_ServiceBootstrap.js" path="e:\Anwar_sales_eco\src\01_ServiceBootstrap.js"></mcfile>

## Task Specifications

### Objective

Resolve critical service registration and instantiation failures preventing OrderHandler integration tests from running successfully, ensuring 100% foundation test pass rate and functional integration test environment.

### Requirements

1. **Service Registration**: Register all missing services (ErrorHandler, HandlerService, ValidationService, IdService, CRMHandler) in GlobalServiceLocator
2. **Service Instantiation**: Fix DatabaseService and HandlerService instantiation failures with proper error handling
3. **Foundation Tests**: Achieve 100% pass rate (currently 70%) for BaseService inheritance validation
4. **Integration Tests**: Enable OrderHandler integration test environment to initialize successfully
5. **Error Handling**: Implement comprehensive ErrorHandler service with categorization and recovery strategies

### Dependencies

- **Required Inputs**: Current ServiceBootstrap configuration, existing service implementations, integration test setup
- **External Dependencies**: Google Apps Script runtime, GlobalServiceLocator pattern, BaseService inheritance
- **Service Dependencies**: Config → Logger → ErrorHandler → DatabaseService → Business Services

### Success Criteria

- ✅ All foundation tests pass 100% (10/10 tests)
- ✅ Integration test environment initializes without service errors
- ✅ All required services registered and instantiated successfully
- ✅ OrderHandler integration tests can access all required services
- ✅ Meaningful error messages for debugging and troubleshooting

## Problem Analysis

### Critical Issues Identified

#### 1. Missing Service Registrations

**Error Pattern:**

```
Service 'ErrorHandler' not registered in GlobalServiceLocator
Service 'HandlerService' not registered in GlobalServiceLocator
DatabaseService class not defined. Ensure DatabaseService.js is loaded.
```

**Root Cause:** Essential services are not properly registered in the GlobalServiceLocator during bootstrap initialization.

#### 2. Service Instantiation Failures

**Error Pattern:**

```
[GSL-ERROR: Failed to instantiate service: DatabaseService
[GSL-ERROR: Failed to instantiate service: HandlerService
```

**Root Cause:** Service classes are not available when the ServiceBootstrap attempts to instantiate them, indicating missing dependencies or incorrect loading order.

#### 3. Foundation Test Failures

**Error Pattern:**

```
Foundation tests: PARTIAL (70.0% passed)
Original error resolution: PARTIAL
```

**Root Cause:** BaseService inheritance and error handling mechanisms are not fully functional due to missing ErrorHandler service.

#### 4. Integration Test Environment Issues

**Error Pattern:**

```
HandlerService not available through any method. Ensure proper service initialization.
```

**Root Cause:** Integration tests cannot access required services, preventing end-to-end testing of OrderHandler functionality.

## Technical Requirements

### Service Architecture Fixes

#### 1. Complete Service Registration

```javascript
/**
 * Missing services that need to be registered in ServiceBootstrap
 */
const MISSING_SERVICES = {
  ErrorHandler: {
    singleton: true,
    dependencies: ["Logger"],
    eager: true,
    factory: () => {
      if (typeof ErrorHandler === "undefined") {
        throw new Error(
          "ErrorHandler class not defined. Ensure ErrorHandler.js is loaded."
        );
      }
      return new ErrorHandler();
    },
  },

  HandlerService: {
    singleton: false,
    dependencies: ["Config", "DatabaseService", "Logger"],
    eager: false,
    factory: () => {
      if (typeof HandlerService === "undefined") {
        throw new Error(
          "HandlerService class not defined. Ensure HandlerService.js is loaded."
        );
      }
      const config = GlobalServiceLocator.get("Config");
      const database = GlobalServiceLocator.get("DatabaseService");
      const logger = GlobalServiceLocator.get("Logger");
      return new HandlerService(config, database, logger);
    },
  },

  ValidationService: {
    singleton: true,
    dependencies: ["Config", "Logger"],
    eager: false,
    factory: () => {
      if (typeof ValidationService === "undefined") {
        throw new Error(
          "ValidationService class not defined. Ensure ValidationService.js is loaded."
        );
      }
      const config = GlobalServiceLocator.get("Config");
      const logger = GlobalServiceLocator.get("Logger");
      return new ValidationService(config, logger);
    },
  },

  IdService: {
    singleton: true,
    dependencies: ["Config"],
    eager: false,
    factory: () => {
      if (typeof IdService === "undefined") {
        throw new Error(
          "IdService class not defined. Ensure IdService.js is loaded."
        );
      }
      const config = GlobalServiceLocator.get("Config");
      return new IdService(config);
    },
  },

  CRMHandler: {
    singleton: true,
    dependencies: ["Config", "DatabaseService", "Logger"],
    eager: false,
    factory: () => {
      if (typeof CRMHandler === "undefined") {
        throw new Error(
          "CRMHandler class not defined. Ensure CRMHandler.js is loaded."
        );
      }
      const config = GlobalServiceLocator.get("Config");
      const database = GlobalServiceLocator.get("DatabaseService");
      const logger = GlobalServiceLocator.get("Logger");
      return new CRMHandler(config, database, logger);
    },
  },
};
```

#### 2. Enhanced DatabaseService Factory

```javascript
/**
 * Fix DatabaseService instantiation with proper error handling
 */
DatabaseService: {
  singleton: true,
  dependencies: ['Config'],
  eager: false,
  factory: () => {
    try {
      if (typeof DatabaseService === 'undefined') {
        throw new Error('DatabaseService class not defined. Ensure DatabaseService.js is loaded.');
      }

      const config = GlobalServiceLocator.get('Config');
      if (!config) {
        throw new Error('Config service not available for DatabaseService initialization');
      }

      const dbService = new DatabaseService(config);

      // Verify service is properly initialized
      if (typeof dbService.insertRecord !== 'function') {
        throw new Error('DatabaseService not properly initialized - missing core methods');
      }

      return dbService;
    } catch (error) {
      console.error('[ServiceBootstrap] DatabaseService factory error:', error.message);
      throw error;
    }
  }
}
```

### ErrorHandler Implementation

#### Create Missing ErrorHandler Service

```javascript
/**
 * ErrorHandler.js - Missing service implementation
 * Location: src/services/ErrorHandler.js
 */
class ErrorHandler extends BaseService {
  constructor() {
    super("ErrorHandler");
    this.errorTypes = {
      VALIDATION_ERROR: "VALIDATION_ERROR",
      SERVICE_ERROR: "SERVICE_ERROR",
      INTEGRATION_ERROR: "INTEGRATION_ERROR",
      SYSTEM_ERROR: "SYSTEM_ERROR",
    };
  }

  /**
   * Handle application errors with proper logging and recovery
   * @param {Error} error - Error to handle
   * @param {Object} context - Error context
   * @returns {Object} Error handling result
   */
  handleError(error, context = {}) {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      type: this.categorizeError(error),
      context,
      timestamp: new Date().toISOString(),
      handled: true,
    };

    // Log error
    this.logger.error("Application error handled", errorInfo);

    // Determine recovery strategy
    const recovery = this.determineRecovery(errorInfo);

    return {
      success: false,
      error: errorInfo,
      recovery,
    };
  }

  /**
   * Categorize error type for appropriate handling
   * @param {Error} error - Error to categorize
   * @returns {string} Error category
   */
  categorizeError(error) {
    if (error.message.includes("validation")) {
      return this.errorTypes.VALIDATION_ERROR;
    }
    if (
      error.message.includes("Service") ||
      error.message.includes("not defined")
    ) {
      return this.errorTypes.SERVICE_ERROR;
    }
    if (
      error.message.includes("integration") ||
      error.message.includes("test")
    ) {
      return this.errorTypes.INTEGRATION_ERROR;
    }
    return this.errorTypes.SYSTEM_ERROR;
  }

  /**
   * Determine recovery strategy based on error type
   * @param {Object} errorInfo - Error information
   * @returns {Object} Recovery strategy
   */
  determineRecovery(errorInfo) {
    switch (errorInfo.type) {
      case this.errorTypes.SERVICE_ERROR:
        return {
          strategy: "service_restart",
          action: "Restart affected service",
          retryable: true,
        };
      case this.errorTypes.VALIDATION_ERROR:
        return {
          strategy: "user_correction",
          action: "Request user input correction",
          retryable: true,
        };
      default:
        return {
          strategy: "graceful_degradation",
          action: "Continue with limited functionality",
          retryable: false,
        };
    }
  }
}

// Register globally
if (typeof globalThis !== "undefined") {
  globalThis.ErrorHandler = ErrorHandler;
}
```

### ServiceBootstrap Enhancement

#### 1. Improved Service Registration Logic

```javascript
/**
 * Enhanced registerCoreServices method in ServiceBootstrap
 */
registerCoreServices() {
  try {
    this.logger.info('[ServiceBootstrap] Registering core services...', {});

    // Register services in dependency order
    const serviceRegistrations = [
      // Foundation services (no dependencies)
      { name: 'Config', config: this.serviceConfigs.Config },
      { name: 'Logger', config: this.serviceConfigs.Logger },
      { name: 'ErrorHandler', config: this.serviceConfigs.ErrorHandler },

      // Core services (basic dependencies)
      { name: 'BaseService', config: this.serviceConfigs.BaseService },
      { name: 'IdService', config: this.serviceConfigs.IdService },
      { name: 'ValidationService', config: this.serviceConfigs.ValidationService },

      // Data services
      { name: 'DatabaseService', config: this.serviceConfigs.DatabaseService },

      // Business services
      { name: 'CRMHandler', config: this.serviceConfigs.CRMHandler },
      { name: 'HandlerService', config: this.serviceConfigs.HandlerService }
    ];

    // Register each service with validation
    for (const { name, config } of serviceRegistrations) {
      try {
        if (!config) {
          throw new Error(`Service configuration not found for: ${name}`);
        }

        GlobalServiceLocator.register(name, config);
        this.logger.info(`[ServiceBootstrap] Service registered: ${name}`, {
          singleton: config.singleton,
          dependencies: config.dependencies,
          eager: config.eager
        });
      } catch (error) {
        this.logger.error(`[ServiceBootstrap] Failed to register service: ${name}`, {
          error: error.message,
          config: config ? 'present' : 'missing'
        });
        throw new Error(`Service registration failed for '${name}': ${error.message}`);
      }
    }

    this.logger.info('[ServiceBootstrap] Core services registered successfully', {});
    return true;
  } catch (error) {
    this.logger.error('[ServiceBootstrap] Core service registration failed', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}
```

#### 2. Enhanced Service Validation

```javascript
/**
 * Enhanced validateCriticalServices method
 */
async validateCriticalServices() {
  const criticalServices = [
    'Config',
    'Logger',
    'ErrorHandler',
    'DatabaseService',
    'ValidationService',
    'IdService',
    'CRMHandler'
  ];

  const validationResults = [];

  for (const serviceName of criticalServices) {
    try {
      // Check if service is registered
      if (!GlobalServiceLocator.isRegistered(serviceName)) {
        throw new Error(`Service '${serviceName}' is not registered`);
      }

      // Attempt to instantiate service
      const serviceInstance = GlobalServiceLocator.get(serviceName);

      if (!serviceInstance) {
        throw new Error(`Service '${serviceName}' instantiation returned null/undefined`);
      }

      // Validate service has required methods (if it extends BaseService)
      if (serviceInstance.executeWithErrorHandling && typeof serviceInstance.executeWithErrorHandling !== 'function') {
        throw new Error(`Service '${serviceName}' missing required BaseService methods`);
      }

      validationResults.push(`${serviceName}: ✅`);
      this.logger.info(`[ServiceBootstrap] Service validation passed: ${serviceName}`, {});

    } catch (error) {
      const errorMsg = `${serviceName}: ❌ ${error.message}`;
      validationResults.push(errorMsg);
      this.logger.error(`[ServiceBootstrap] Service validation failed: ${serviceName}`, {
        error: error.message,
        stack: error.stack
      });

      // For critical services, throw immediately
      if (['Config', 'Logger', 'DatabaseService'].includes(serviceName)) {
        throw new Error(`Critical service validation failed for '${serviceName}': ${error.message}`);
      }
    }
  }

  this.logger.info('[ServiceBootstrap] Service validation completed', {
    completedValidations: validationResults
  });

  return validationResults;
}
```

### Integration Test Fixes

#### 1. Test Environment Setup

```javascript
/**
 * Enhanced setup method for OrderHandler integration tests
 */
async setup() {
  console.log('Setting up integration test environment...');

  try {
    // Ensure ServiceBootstrap is properly initialized
    if (!GlobalServiceLocator || !GlobalServiceLocator.isInitialized()) {
      throw new Error('GlobalServiceLocator not initialized. Run ServiceBootstrap first.');
    }

    // Verify all required services are registered and available
    const requiredServices = [
      'Config',
      'Logger',
      'ErrorHandler',
      'DatabaseService',
      'ValidationService',
      'IdService',
      'CRMHandler',
      'HandlerService'
    ];

    const missingServices = [];
    for (const serviceName of requiredServices) {
      try {
        if (!GlobalServiceLocator.isRegistered(serviceName)) {
          missingServices.push(`${serviceName} (not registered)`);
          continue;
        }

        const service = GlobalServiceLocator.get(serviceName);
        if (!service) {
          missingServices.push(`${serviceName} (instantiation failed)`);
        }
      } catch (error) {
        missingServices.push(`${serviceName} (error: ${error.message})`);
      }
    }

    if (missingServices.length > 0) {
      throw new Error(`Required services not available: ${missingServices.join(', ')}`);
    }

    console.log('✓ All required services are available');

    // Initialize OrderHandler with proper error handling
    try {
      this.orderHandler = new OrderHandler();

      // Verify OrderHandler is properly initialized
      if (!this.orderHandler.submitOrder || typeof this.orderHandler.submitOrder !== 'function') {
        throw new Error('OrderHandler not properly initialized - missing core methods');
      }

    } catch (error) {
      throw new Error(`OrderHandler initialization failed: ${error.message}`);
    }

    // Setup test data
    await this.setupTestData();

    console.log('✓ Integration test environment ready');
  } catch (error) {
    console.error('✗ Failed to setup integration test environment:', error.message);
    console.error('Stack trace:', error.stack);
    throw error;
  }
}
```

#### 2. Service Availability Verification

```javascript
/**
 * Add service availability check before each test
 */
verifyServiceAvailability() {
  const services = {
    'Config': GlobalServiceLocator.get('Config'),
    'Logger': GlobalServiceLocator.get('Logger'),
    'ErrorHandler': GlobalServiceLocator.get('ErrorHandler'),
    'DatabaseService': GlobalServiceLocator.get('DatabaseService'),
    'ValidationService': GlobalServiceLocator.get('ValidationService'),
    'IdService': GlobalServiceLocator.get('IdService'),
    'CRMHandler': GlobalServiceLocator.get('CRMHandler')
  };

  const unavailableServices = [];

  for (const [name, service] of Object.entries(services)) {
    if (!service) {
      unavailableServices.push(name);
    }
  }

  if (unavailableServices.length > 0) {
    throw new Error(`Services not available for testing: ${unavailableServices.join(', ')}`);
  }

  return true;
}
```

## Implementation Specifications

### Architecture Requirements

- **Service Pattern**: Singleton services with dependency injection via GlobalServiceLocator
- **Error Handling**: Centralized ErrorHandler with categorized error types and recovery strategies
- **Testing Strategy**: Foundation tests for service registration, integration tests for business logic
- **Dependency Management**: Explicit service dependency chain with proper initialization order

### Core Components

#### 1. ErrorHandler Service

**Location**: `src/services/ErrorHandler.js`
**Purpose**: Centralized error management with categorization and recovery

```javascript
class ErrorHandler extends BaseService {
  constructor() {
    super('ErrorHandler');
    this.errorCategories = {
      SYSTEM: 'system',
      VALIDATION: 'validation',
      BUSINESS: 'business',
      INTEGRATION: 'integration'
    };
    this.errors = [];
  }

  // Core Methods
  handleError(error, context = {}, category = 'SYSTEM')
  logError(error, severity = 'ERROR', context = {})
  createError(message, category, code = null)
  getErrorSummary()
  clearErrors()
  categorizeError(error)
  getRecoveryStrategy(error)
}
```

#### 2. Enhanced DatabaseService

**Location**: `src/database/DatabaseService.js`
**Purpose**: Robust database service with proper instantiation and error handling

```javascript
class DatabaseService extends BaseService {
  static createInstance(config) {
    // Factory method for service instantiation
  }

  validateConnection()
  handleConnectionErrors(error)
  getServiceStatus()
  executeQuery(query, params = {})
  handleDatabaseError(error, operation)
}
```

#### 3. ServiceBootstrap Enhancement

**Location**: `src/01_ServiceBootstrap.js`
**Purpose**: Proper service registration and dependency management

```javascript
// Service Registration Order (Critical)
const SERVICE_DEPENDENCIES = {
  ConfigService: [],
  Logger: ["ConfigService"],
  ErrorHandler: ["Logger"],
  DatabaseService: ["ErrorHandler", "ConfigService"],
  ValidationService: ["ErrorHandler"],
  IdService: ["DatabaseService"],
  HandlerService: ["DatabaseService", "ValidationService"],
  CRMHandler: ["HandlerService", "DatabaseService"],
};

// Enhanced Methods
registerService(serviceName, serviceClass, (dependencies = []));
validateServiceDependencies(serviceName);
instantiateService(serviceName);
performHealthCheck(serviceName);
getServiceStatus();
```

## Implementation Plan

### Phase 1: Foundation Services (Critical Priority)

**Timeline**: Immediate
**Deliverables**:

- Create `ErrorHandler.js` with comprehensive error management
- Enhance `DatabaseService.js` with factory pattern and error handling
- Update `ServiceBootstrap.js` with proper service registration

**Validation**:

```bash
# Run foundation tests
node src/tests/foundation.test.js
# Expected: 100% pass rate (10/10 tests)
```

### Phase 2: Service Integration (High Priority)

**Timeline**: After Phase 1 completion
**Deliverables**:

- Register all missing services in dependency order
- Implement service health checks and validation
- Add comprehensive error handling for service failures

**Validation**:

```bash
# Test service registration
node src/tests/service-registration.test.js
# Expected: All services registered and instantiated
```

### Phase 3: Integration Test Environment (Medium Priority)

**Timeline**: After Phase 2 completion
**Deliverables**:

- Update integration test setup with service verification
- Add proper test environment initialization
- Implement test cleanup and teardown procedures

**Validation**:

```bash
# Run integration tests
node src/tests/OrderHandler.integration.test.js
# Expected: Test environment initializes successfully
```

### Phase 4: Quality Assurance (Ongoing)

**Timeline**: Continuous
**Deliverables**:

- Comprehensive error logging and monitoring
- Service performance metrics and health monitoring
- Documentation updates for service architecture

**Validation**:

```bash
# Full test suite
npm test
# Expected: All tests pass with proper service integration
```

## Quality Assurance Requirements

### Testing Strategy

- **Unit Tests**: Individual service functionality validation
- **Integration Tests**: End-to-end workflow testing with service dependencies
- **Foundation Tests**: Core service architecture and inheritance validation
- **Performance Tests**: Service instantiation and response time validation

### Security Requirements

- **Error Handling**: No sensitive information in error messages or logs
- **Service Isolation**: Proper service boundaries and access control
- **Input Validation**: Comprehensive validation for all service inputs
- **Audit Trail**: Service operation logging for troubleshooting

### Performance Metrics

- **Service Startup**: < 2 seconds for complete service initialization
- **Error Response**: < 100ms for error categorization and logging
- **Test Execution**: Foundation tests complete in < 5 seconds
- **Memory Usage**: Service registration overhead < 50MB

## Success Criteria

### Service Registration

- ✅ All required services registered in GlobalServiceLocator
- ✅ Service instantiation succeeds for all critical services
- ✅ Service dependencies resolved correctly
- ✅ No "Service not registered" errors

### Foundation Tests

- ✅ Foundation tests pass 100% (10/10 tests)
- ✅ BaseService instantiation works correctly
- ✅ Service inheritance validation passes
- ✅ Error handling mechanisms functional

### Integration Tests

- ✅ OrderHandler integration tests run successfully
- ✅ All required services available for testing
- ✅ Test environment setup completes without errors
- ✅ End-to-end order workflows function correctly

### Error Handling

- ✅ Meaningful error messages for all failure scenarios
- ✅ Proper error categorization and recovery strategies
- ✅ Comprehensive logging for debugging
- ✅ Graceful degradation for non-critical service failures

## Validation Commands

### Service Bootstrap Validation

```javascript
// Run in Google Apps Script console
function validateServiceBootstrap() {
  try {
    // Check if ServiceBootstrap is initialized
    if (!GlobalServiceLocator) {
      throw new Error("GlobalServiceLocator not available");
    }

    // Check critical services
    const services = [
      "Config",
      "Logger",
      "ErrorHandler",
      "DatabaseService",
      "ValidationService",
      "IdService",
      "CRMHandler",
    ];

    for (const serviceName of services) {
      const service = GlobalServiceLocator.get(serviceName);
      if (!service) {
        throw new Error(`Service not available: ${serviceName}`);
      }
      console.log(`✓ ${serviceName}: Available`);
    }

    console.log("✅ All services validated successfully");
    return true;
  } catch (error) {
    console.error("❌ Service validation failed:", error.message);
    return false;
  }
}
```

### Integration Test Validation

```javascript
// Run integration tests
function runIntegrationTests() {
  try {
    const testSuite = new OrderHandlerIntegrationTests();
    testSuite.runAllTests();
  } catch (error) {
    console.error("Integration tests failed:", error.message);
  }
}
```

## Performance Expectations

### Business Impact Metrics

- **Test Coverage**: Achieve 100% foundation test pass rate
- **Development Velocity**: Unblock integration testing for OrderHandler workflows
- **System Reliability**: Eliminate service instantiation failures
- **Quality Assurance**: Enable comprehensive end-to-end testing

### Technical Performance Metrics

- **Service Registration**: All 8 core services registered successfully
- **Error Handling**: Categorized error management with recovery strategies
- **Test Environment**: Stable integration test initialization
- **Debugging**: Meaningful error messages for rapid issue resolution

## Execution Directive

Fix the critical service registration and instantiation issues that are preventing the OrderHandler integration tests from running. The primary focus should be on:

1. **Immediate**: Create missing ErrorHandler service and register all required services
2. **Critical**: Fix DatabaseService and HandlerService instantiation failures
3. **High**: Update integration test setup to properly verify service availability
4. **Medium**: Enhance error handling and reporting throughout the system

The solution must ensure that all services are properly registered, instantiated, and available for both the foundation tests and integration tests. All error messages should be meaningful and provide clear guidance for debugging.

**Priority**: Critical - Integration tests are essential for validating the OrderHandler implementation and ensuring system reliability.

**Timeline**: 1-2 days for service fixes, additional 1 day for test validation and documentation.

**Quality Gate**: All foundation tests must pass 100%, and integration test environment must initialize successfully before considering the fix complete.

---

_This prompt follows the Anwar Sales Management System prompt engineering standards and integrates with the established service architecture patterns._
