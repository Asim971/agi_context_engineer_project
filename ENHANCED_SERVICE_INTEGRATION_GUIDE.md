# Google Apps Script Service Initialization Troubleshooter - Integration Guide

## 🎯 Overview

This guide provides step-by-step instructions for integrating the enhanced service initialization troubleshooting system into your Google Apps Script project. The system provides automatic error detection, recovery, and comprehensive monitoring for service dependencies.

## 📋 Prerequisites

- Google Apps Script project with existing BaseService architecture
- `00_Foundation.js` file for proper service loading order
- Basic understanding of Google Apps Script execution model

## 🚀 Quick Start Integration

### Step 1: Add New Service Files

Copy these files to your `src/services/` directory:

1. **HandlerService.js** - Enhanced handler base class
2. **ServiceHealthMonitor.js** - Real-time health monitoring
3. **ServiceRecoverySystem.js** - Automatic error recovery
4. **ServiceInitializationTestSuite.js** - Comprehensive testing

### Step 2: Update Your Code.gs

Add the enhanced initialization pattern to your main setup function:

```javascript
/**
 * Enhanced setup function with service initialization troubleshooting
 */
function setup() {
  const logger = Logger.createChildLogger('Setup', { operation: 'enhanced_system_initialization' });
  logger.info('=== Enhanced Anwar Sales Ecosystem Setup Started ===');
  
  try {
    // Phase 1: Pre-flight health check
    logger.info('Performing pre-flight health check...');
    const preflightHealth = quickHealthCheck();
    
    if (preflightHealth.overallStatus === 'CRITICAL') {
      logger.warn('Critical issues detected during preflight, attempting recovery...');
      const emergencyResult = emergencyServiceRecovery();
      
      if (!emergencyResult.success) {
        throw new AppScriptError(
          'PREFLIGHT_RECOVERY_FAILED',
          'Emergency service recovery failed during setup',
          { emergencyResult }
        );
      }
      
      logger.info('Emergency recovery completed successfully');
    }
    
    // Phase 2: Comprehensive health check
    logger.info('Performing comprehensive health check...');
    const healthStatus = healthCheck();
    
    if (healthStatus.overallStatus === 'CRITICAL') {
      logger.warn('Critical issues persist, attempting targeted recovery...');
      const recoveryResult = performServiceRecovery();
      
      if (!recoveryResult.overallSuccess) {
        logger.error('Service recovery failed', recoveryResult);
        throw new AppScriptError(
          'SERVICE_RECOVERY_FAILED',
          'Service recovery failed during setup',
          { recoveryResult, healthStatus }
        );
      }
      
      logger.info('Targeted recovery completed successfully');
    }
    
    // Phase 3: Initialize core services with monitoring
    logger.info('Initializing core services...');
    
    const db = getGlobalDB();
    if (!db) {
      throw new AppScriptError('DATABASE_INITIALIZATION_FAILED', 'Database service not available after recovery');
    }
    
    db.initialize();
    logger.info('Database service initialized successfully');
    
    // Phase 4: Initialize sheets
    initializeAllSheets();
    logger.info('All sheets initialized successfully');
    
    // Phase 5: Set up triggers
    setupTriggers();
    logger.info('Triggers configured successfully');
    
    // Phase 6: Initialize enhanced handlers
    logger.info('Initializing enhanced handlers...');
    const handlersInitialized = initializeEnhancedHandlers();
    logger.info('Enhanced handlers initialized', { count: handlersInitialized.length });
    
    // Phase 7: Final health check
    const finalHealth = healthCheck();
    logger.info('Final health check completed', { status: finalHealth.overallStatus });
    
    // Phase 8: Legacy compatibility
    initializeLegacySheets();
    logger.info('Legacy initialization completed successfully');
    
    logger.info('=== Enhanced Setup Completed Successfully ===');
    
    return { 
      success: true, 
      healthStatus: finalHealth,
      handlersInitialized: handlersInitialized.length,
      recoveryUsed: healthStatus.overallStatus === 'CRITICAL'
    };
    
  } catch (error) {
    logger.critical('Enhanced setup failed with critical error', {
      error: error.message,
      stack: error.stack || 'No stack trace available'
    });
    
    // Last resort emergency recovery
    logger.warn('Attempting last resort emergency recovery...');
    try {
      const lastResortResult = emergencyServiceRecovery();
      if (lastResortResult.success) {
        logger.warn('Last resort recovery successful - setup may proceed with limited functionality');
      }
    } catch (recoveryError) {
      logger.critical('Last resort recovery also failed', { error: recoveryError.message });
    }
    
    // Re-throw with enhanced error information
    throw new AppScriptError(
      'ENHANCED_SETUP_FAILED',
      `Enhanced system setup failed: ${error.message}`,
      { 
        originalError: error.message,
        setupPhase: 'unknown',
        recoveryAttempted: true
      },
      false,
      'CRITICAL'
    );
  }
}

/**
 * Initialize enhanced handlers with error recovery
 * @returns {Array} List of successfully initialized handlers
 */
function initializeEnhancedHandlers() {
  const logger = Logger.createChildLogger('HandlerInitializer');
  const initializedHandlers = [];
  const failedHandlers = [];
  
  // List of enhanced handlers to initialize
  const handlerConfigs = [
    {
      name: 'BDLeadHandler',
      factory: () => createBDLeadHandler?.() || null,
      required: false
    },
    // Add more handlers as you create them
    {
      name: 'EngineerHandler',
      factory: () => typeof EngineerHandler !== 'undefined' ? new EngineerHandler() : null,
      required: true
    },
    {
      name: 'RetailerHandler', 
      factory: () => typeof RetailerHandler !== 'undefined' ? new RetailerHandler() : null,
      required: true
    }
  ];
  
  handlerConfigs.forEach(config => {
    try {
      const handler = config.factory();
      if (handler) {
        initializedHandlers.push(config.name);
        logger.info(`Handler initialized successfully: ${config.name}`);
      } else if (config.required) {
        failedHandlers.push(config.name);
        logger.warn(`Required handler failed to initialize: ${config.name}`);
      } else {
        logger.debug(`Optional handler not available: ${config.name}`);
      }
    } catch (error) {
      failedHandlers.push(config.name);
      logger.error(`Handler initialization failed: ${config.name}`, { error: error.message });
      
      if (config.required) {
        // Attempt recovery for required handlers
        logger.info(`Attempting recovery for required handler: ${config.name}`);
        try {
          const recoveryResult = performServiceRecovery(['Config', 'DatabaseService', 'Handlers']);
          if (recoveryResult.overallSuccess) {
            const retryHandler = config.factory();
            if (retryHandler) {
              initializedHandlers.push(config.name);
              logger.info(`Handler recovered successfully: ${config.name}`);
            }
          }
        } catch (recoveryError) {
          logger.error(`Handler recovery failed: ${config.name}`, { error: recoveryError.message });
        }
      }
    }
  });
  
  if (failedHandlers.length > 0) {
    logger.warn('Some handlers failed to initialize', { 
      failed: failedHandlers,
      initialized: initializedHandlers
    });
  }
  
  return initializedHandlers;
}
```

### Step 3: Add Health Monitoring to Existing Functions

Update your trigger functions and form handlers:

```javascript
/**
 * Enhanced form submission handler with health monitoring
 */
function onFormSubmit(e) {
  try {
    // Quick health check before processing
    const quickHealth = quickHealthCheck();
    if (quickHealth.overallStatus === 'CRITICAL') {
      console.warn('Critical system issues detected, attempting recovery...');
      emergencyServiceRecovery();
    }
    
    // Proceed with normal form submission handling
    mainHandlerInstance.handleFormSubmit(e);
    
  } catch (error) {
    console.error('Form submission failed', error);
    
    // Attempt recovery if form submission fails
    if (error.message.includes('not available') || error.message.includes('undefined')) {
      console.log('Attempting service recovery due to dependency issues...');
      const recoveryResult = performServiceRecovery();
      
      if (recoveryResult.overallSuccess) {
        console.log('Recovery successful, retrying form submission...');
        mainHandlerInstance.handleFormSubmit(e);
      } else {
        console.error('Recovery failed, form submission cannot proceed');
        throw error;
      }
    } else {
      throw error;
    }
  }
}

/**
 * Enhanced onEdit handler with error recovery
 */
function onEdit(e) {
  try {
    mainHandlerInstance.handleEdit(e);
  } catch (error) {
    console.error('Edit handling failed', error);
    
    // Attempt recovery for edit failures
    if (error.message.includes('service') || error.message.includes('undefined')) {
      console.log('Attempting service recovery for edit handler...');
      const recoveryResult = performServiceRecovery(['DatabaseService', 'Config']);
      
      if (recoveryResult.overallSuccess) {
        console.log('Recovery successful, retrying edit handling...');
        mainHandlerInstance.handleEdit(e);
      }
    } else {
      throw error;
    }
  }
}
```

## 🔧 Handler Migration Guide

### Migrating Existing Handlers

To migrate your existing handlers to use the enhanced HandlerService:

#### Before (Original Handler):
```javascript
class MyHandlerService extends BaseService {
  constructor() {
    super();
    this.sheetName = Config.SHEETS.MY_SHEET;
    this.headers = Config.HEADERS.MY_SHEET;
    // Missing helpers causing "helpers is not defined" errors
  }
  
  onFormSubmit(e) {
    // Manual form processing with potential errors
    const data = this.helpers.mapFormValuesToHeaders(e.values, this.headers); // ERROR!
  }
}
```

#### After (Enhanced Handler):
```javascript
class MyHandlerServiceEnhanced extends HandlerService {
  constructor() {
    // HandlerService constructor handles validation and helper initialization
    super(
      Config.SHEETS?.MY_SHEET || 'MySheet', // Sheet name with fallback
      Config.HEADERS?.MY_SHEET || ['Name', 'Phone', 'Status'], // Headers with fallback
      'MY_PREFIX' // ID prefix
    );
    
    // Define validation rules
    this.requiredFields = ['Name', 'Phone'];
  }
  
  onFormSubmit(e) {
    // Use standardized form processing
    this.processFormSubmission(e, (data, event) => {
      // Custom processing logic
      this.helpers.validateRequiredFields(data, this.requiredFields);
      
      // Safe database access
      const db = this.getDatabase();
      return db.insertRecord(this.sheetName, data);
    });
  }
}
```

## 📊 Testing and Validation

### Running Tests

Execute the comprehensive test suite:

```javascript
// Run all tests and get detailed results
function testServiceInitialization() {
  const results = runServiceInitializationTests();
  console.log('Test Results:', results);
  
  if (results.overallStatus === 'FAILED') {
    console.error('Some tests failed. Check results for details.');
    console.log('Failed tests:', results.testCategories);
  } else {
    console.log('All tests passed! System is working correctly.');
  }
  
  return results;
}

// Generate detailed test report
function generateTestReport() {
  const report = generateServiceTestReport();
  console.log('Detailed Test Report:');
  console.log(report);
  return report;
}
```

### Health Monitoring

Set up regular health monitoring:

```javascript
/**
 * Schedule regular health checks
 */
function setupHealthMonitoring() {
  // Delete existing triggers
  ScriptApp.getProjectTriggers().forEach(trigger => {
    if (trigger.getHandlerFunction() === 'performScheduledHealthCheck') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Create new health check trigger (every 30 minutes)
  ScriptApp.newTrigger('performScheduledHealthCheck')
    .timeBased()
    .everyMinutes(30)
    .create();
    
  console.log('Health monitoring scheduled successfully');
}

/**
 * Scheduled health check function
 */
function performScheduledHealthCheck() {
  try {
    const healthStatus = healthCheck();
    
    if (healthStatus.overallStatus === 'CRITICAL') {
      console.warn('Critical issues detected during scheduled check');
      
      // Attempt automatic recovery
      const recoveryResult = performServiceRecovery();
      
      if (recoveryResult.overallSuccess) {
        console.log('Automatic recovery successful');
      } else {
        console.error('Automatic recovery failed - manual intervention required');
        // Here you could send alerts, notifications, etc.
      }
    }
    
    // Log health status for monitoring
    console.log('Scheduled health check completed', {
      status: healthStatus.overallStatus,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Scheduled health check failed', error);
    
    // Attempt emergency recovery
    try {
      emergencyServiceRecovery();
    } catch (emergencyError) {
      console.error('Emergency recovery also failed', emergencyError);
    }
  }
}
```

## 🚨 Troubleshooting Common Issues

### Issue 1: "Handler dependencies not available"

**Cause**: Services not properly initialized before handler creation

**Solution**:
```javascript
// Add health check before handler creation
const health = quickHealthCheck();
if (health.overallStatus === 'CRITICAL') {
  performServiceRecovery();
}

const handler = new MyHandlerService();
```

### Issue 2: "getGlobalDB is not a function"

**Cause**: DatabaseService not properly loaded

**Solution**:
```javascript
// Use recovery system
const recoveryResult = performServiceRecovery(['DatabaseService', 'GlobalFunctions']);
if (recoveryResult.overallSuccess) {
  const db = getGlobalDB();
}
```

### Issue 3: "BaseService is not defined"

**Cause**: Foundation loading order issue

**Solution**:
```javascript
// Emergency BaseService recovery
emergencyServiceRecovery();
```

## 📈 Performance Monitoring

### Metrics to Track

1. **Service Initialization Time**: Monitor setup() execution time
2. **Handler Success Rate**: Track form submission success rates
3. **Recovery Usage**: Monitor how often recovery systems are used
4. **Health Check Results**: Track system health over time

### Logging Configuration

Add detailed logging to track system performance:

```javascript
function enhancedLogging() {
  // Set up detailed logging for troubleshooting
  Logger.setLogLevel('DEBUG'); // For development
  // Logger.setLogLevel('INFO'); // For production
  
  // Log service initialization metrics
  const startTime = Date.now();
  setup();
  const setupTime = Date.now() - startTime;
  
  Logger.info('System startup metrics', {
    setupTime,
    timestamp: new Date().toISOString()
  });
}
```

## 🎯 Success Criteria

Your integration is successful when:

1. ✅ All tests in `ServiceInitializationTestSuite` pass
2. ✅ Health checks return 'HEALTHY' status
3. ✅ Handlers process forms without "undefined" errors
4. ✅ Recovery systems can handle simulated failures
5. ✅ System maintains 99%+ uptime

## 📞 Support and Maintenance

### Regular Maintenance Tasks

1. Run weekly test suites: `generateServiceTestReport()`
2. Monitor health check logs for patterns
3. Review recovery system usage
4. Update handler configurations as needed

### Emergency Procedures

If the system fails completely:

1. Execute: `emergencyServiceRecovery()`
2. Check: `quickHealthCheck()`
3. Test: `runServiceInitializationTests()`
4. Review logs for root cause analysis

This integration guide ensures your Google Apps Script service initialization is robust, monitored, and self-healing. The troubleshooter agent patterns are now fully operational in your system.
