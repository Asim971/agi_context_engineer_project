/**
 * Enhanced Service Integration Test Suite
 * Validates the complete integration of enhanced service initialization system
 */

/**
 * Main integration test function - run this to verify enhanced system
 */
function testEnhancedServiceIntegration() {
  const logger = Logger.createChildLogger('IntegrationTest', { operation: 'enhanced_service_integration_test' });
  logger.info('=== Starting Enhanced Service Integration Test ===');
  
  const testResults = {
    timestamp: new Date().toISOString(),
    overallSuccess: true,
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    testDetails: [],
    errors: []
  };
  
  try {
    // Test 1: Enhanced Service Availability
    const serviceAvailabilityTest = testEnhancedServiceAvailability();
    testResults.testDetails.push(serviceAvailabilityTest);
    testResults.totalTests++;
    if (serviceAvailabilityTest.passed) testResults.passedTests++;
    else testResults.failedTests++;
    
    // Test 2: Setup Function Integration
    const setupIntegrationTest = testSetupFunctionIntegration();
    testResults.testDetails.push(setupIntegrationTest);
    testResults.totalTests++;
    if (setupIntegrationTest.passed) testResults.passedTests++;
    else testResults.failedTests++;
    
    // Test 3: Trigger Function Integration
    const triggerIntegrationTest = testTriggerFunctionIntegration();
    testResults.testDetails.push(triggerIntegrationTest);
    testResults.totalTests++;
    if (triggerIntegrationTest.passed) testResults.passedTests++;
    else testResults.failedTests++;
    
    // Test 4: Health Monitoring Integration
    const healthMonitoringTest = testHealthMonitoringIntegration();
    testResults.testDetails.push(healthMonitoringTest);
    testResults.totalTests++;
    if (healthMonitoringTest.passed) testResults.passedTests++;
    else testResults.failedTests++;
    
    // Test 5: Recovery System Integration
    const recoverySystemTest = testRecoverySystemIntegration();
    testResults.testDetails.push(recoverySystemTest);
    testResults.totalTests++;
    if (recoverySystemTest.passed) testResults.passedTests++;
    else testResults.failedTests++;
    
    // Test 6: Enhanced Handler Integration
    const handlerIntegrationTest = testEnhancedHandlerIntegration();
    testResults.testDetails.push(handlerIntegrationTest);
    testResults.totalTests++;
    if (handlerIntegrationTest.passed) testResults.passedTests++;
    else testResults.failedTests++;
    
    // Test 7: End-to-End Integration Test
    const endToEndTest = testEndToEndIntegration();
    testResults.testDetails.push(endToEndTest);
    testResults.totalTests++;
    if (endToEndTest.passed) testResults.passedTests++;
    else testResults.failedTests++;
    
    // Calculate overall success
    testResults.overallSuccess = testResults.failedTests === 0;
    testResults.successRate = (testResults.passedTests / testResults.totalTests * 100).toFixed(2) + '%';
    
    // Log results
    if (testResults.overallSuccess) {
      logger.info('=== All Enhanced Service Integration Tests Passed ===', {
        successRate: testResults.successRate,
        totalTests: testResults.totalTests
      });
    } else {
      logger.warn('=== Some Enhanced Service Integration Tests Failed ===', {
        successRate: testResults.successRate,
        totalTests: testResults.totalTests,
        failedTests: testResults.failedTests
      });
    }
    
    return testResults;
    
  } catch (error) {
    logger.error('Integration test suite failed', { error: error.message });
    testResults.overallSuccess = false;
    testResults.errors.push(error.message);
    return testResults;
  }
}

/**
 * Test enhanced service availability
 */
function testEnhancedServiceAvailability() {
  const testName = 'Enhanced Service Availability';
  
  try {
    const availableServices = {
      ServiceHealthMonitor: typeof ServiceHealthMonitor !== 'undefined',
      ServiceRecoverySystem: typeof ServiceRecoverySystem !== 'undefined',
      HandlerService: typeof HandlerService !== 'undefined',
      ServiceInitializationTestSuite: typeof ServiceInitializationTestSuite !== 'undefined'
    };
    
    const availableCount = Object.values(availableServices).filter(Boolean).length;
    const totalServices = Object.keys(availableServices).length;
    
    return {
      testName,
      passed: availableCount >= 2, // At least 2 enhanced services should be available
      details: {
        availableServices,
        availableCount,
        totalServices,
        availabilityRate: (availableCount / totalServices * 100).toFixed(2) + '%'
      },
      message: `${availableCount}/${totalServices} enhanced services available`
    };
    
  } catch (error) {
    return {
      testName,
      passed: false,
      error: error.message,
      message: 'Failed to check service availability'
    };
  }
}

/**
 * Test setup function integration
 */
function testSetupFunctionIntegration() {
  const testName = 'Setup Function Integration';
  
  try {
    // Check if setup function exists and has been enhanced
    if (typeof setup !== 'function') {
      return {
        testName,
        passed: false,
        message: 'Setup function not found',
        error: 'Setup function is not defined'
      };
    }
    
    // Check if setup function contains enhanced features
    const setupFunctionSource = setup.toString();
    const enhancedFeatures = {
      preFlightCheck: setupFunctionSource.includes('performPreFlightHealthCheck'),
      phaseBasedSetup: setupFunctionSource.includes('Phase 1:') || setupFunctionSource.includes('Phase 2:'),
      healthMonitorIntegration: setupFunctionSource.includes('ServiceHealthMonitor'),
      recoverySystemIntegration: setupFunctionSource.includes('ServiceRecoverySystem'),
      enhancedErrorHandling: setupFunctionSource.includes('Enhanced setup failed')
    };
    
    const enhancedFeatureCount = Object.values(enhancedFeatures).filter(Boolean).length;
    
    return {
      testName,
      passed: enhancedFeatureCount >= 3, // At least 3 enhanced features should be present
      details: {
        enhancedFeatures,
        enhancedFeatureCount,
        integrationLevel: (enhancedFeatureCount / Object.keys(enhancedFeatures).length * 100).toFixed(2) + '%'
      },
      message: `Setup function has ${enhancedFeatureCount}/5 enhanced features`
    };
    
  } catch (error) {
    return {
      testName,
      passed: false,
      error: error.message,
      message: 'Failed to analyze setup function integration'
    };
  }
}

/**
 * Test trigger function integration
 */
function testTriggerFunctionIntegration() {
  const testName = 'Trigger Function Integration';
  
  try {
    const triggerFunctions = {
      onFormSubmit: typeof onFormSubmit === 'function',
      onEdit: typeof onEdit === 'function',
      onOpen: typeof onOpen === 'function',
      doGet: typeof doGet === 'function'
    };
    
    const availableTriggers = Object.values(triggerFunctions).filter(Boolean).length;
    const totalTriggers = Object.keys(triggerFunctions).length;
    
    // Check if trigger functions have enhanced error handling
    let enhancedTriggerCount = 0;
    
    if (triggerFunctions.onFormSubmit) {
      const onFormSubmitSource = onFormSubmit.toString();
      if (onFormSubmitSource.includes('ServiceRecoverySystem') || onFormSubmitSource.includes('getServiceHealthStatus')) {
        enhancedTriggerCount++;
      }
    }
    
    if (triggerFunctions.onEdit) {
      const onEditSource = onEdit.toString();
      if (onEditSource.includes('ServiceRecoverySystem') || onEditSource.includes('getServiceHealthStatus')) {
        enhancedTriggerCount++;
      }
    }
    
    return {
      testName,
      passed: availableTriggers === totalTriggers && enhancedTriggerCount >= 1,
      details: {
        triggerFunctions,
        availableTriggers,
        totalTriggers,
        enhancedTriggerCount,
        completionRate: (availableTriggers / totalTriggers * 100).toFixed(2) + '%'
      },
      message: `${availableTriggers}/${totalTriggers} trigger functions available, ${enhancedTriggerCount} enhanced`
    };
    
  } catch (error) {
    return {
      testName,
      passed: false,
      error: error.message,
      message: 'Failed to test trigger function integration'
    };
  }
}

/**
 * Test health monitoring integration
 */
function testHealthMonitoringIntegration() {
  const testName = 'Health Monitoring Integration';
  
  try {
    if (typeof ServiceHealthMonitor === 'undefined') {
      return {
        testName,
        passed: false,
        message: 'ServiceHealthMonitor not available - monitoring disabled',
        skipped: true
      };
    }
    
    // Test ServiceHealthMonitor instantiation
    const monitor = new ServiceHealthMonitor();
    
    // Test basic methods
    const hasRequiredMethods = [
      'startMonitoring',
      'stopMonitoring',
      'getSystemHealth',
      'configureAlerts'
    ].every(method => typeof monitor[method] === 'function');
    
    return {
      testName,
      passed: hasRequiredMethods,
      details: {
        instantiated: true,
        hasRequiredMethods,
        availableMethods: Object.getOwnPropertyNames(Object.getPrototypeOf(monitor))
          .filter(name => typeof monitor[name] === 'function')
      },
      message: hasRequiredMethods ? 'Health monitoring integration successful' : 'Health monitoring missing required methods'
    };
    
  } catch (error) {
    return {
      testName,
      passed: false,
      error: error.message,
      message: 'Health monitoring integration test failed'
    };
  }
}

/**
 * Test recovery system integration
 */
function testRecoverySystemIntegration() {
  const testName = 'Recovery System Integration';
  
  try {
    if (typeof ServiceRecoverySystem === 'undefined') {
      return {
        testName,
        passed: false,
        message: 'ServiceRecoverySystem not available - auto-recovery disabled',
        skipped: true
      };
    }
    
    // Test static methods availability
    const hasStaticMethods = [
      'attemptRecovery',
      'attemptQuickRecovery',
      'recoverDatabase',
      'emergencyRecovery'
    ].every(method => typeof ServiceRecoverySystem[method] === 'function');
    
    return {
      testName,
      passed: hasStaticMethods,
      details: {
        hasStaticMethods,
        availableStaticMethods: Object.getOwnPropertyNames(ServiceRecoverySystem)
          .filter(name => typeof ServiceRecoverySystem[name] === 'function')
      },
      message: hasStaticMethods ? 'Recovery system integration successful' : 'Recovery system missing required methods'
    };
    
  } catch (error) {
    return {
      testName,
      passed: false,
      error: error.message,
      message: 'Recovery system integration test failed'
    };
  }
}

/**
 * Test enhanced handler integration
 */
function testEnhancedHandlerIntegration() {
  const testName = 'Enhanced Handler Integration';
  
  try {
    if (typeof HandlerService === 'undefined') {
      return {
        testName,
        passed: false,
        message: 'HandlerService not available - using basic handlers',
        skipped: true
      };
    }
    
    // Test HandlerService instantiation
    const handlerService = new HandlerService();
    
    // Test required methods
    const hasRequiredMethods = [
      'processFormSubmission',
      'validateHandler',
      'getDependencies'
    ].every(method => typeof handlerService[method] === 'function');
    
    return {
      testName,
      passed: hasRequiredMethods,
      details: {
        instantiated: true,
        hasRequiredMethods,
        availableMethods: Object.getOwnPropertyNames(Object.getPrototypeOf(handlerService))
          .filter(name => typeof handlerService[name] === 'function')
      },
      message: hasRequiredMethods ? 'Enhanced handler integration successful' : 'Enhanced handler missing required methods'
    };
    
  } catch (error) {
    return {
      testName,
      passed: false,
      error: error.message,
      message: 'Enhanced handler integration test failed'
    };
  }
}

/**
 * Test end-to-end integration
 */
function testEndToEndIntegration() {
  const testName = 'End-to-End Integration';
  
  try {
    // Test pre-flight health check
    const preFlightResult = performPreFlightHealthCheck();
    
    // Test health status check
    const healthStatus = getServiceHealthStatus();
    
    // Test system health check
    const systemHealthResult = performSystemHealthCheck();
    
    const integrationChecks = {
      preFlightCheckAvailable: typeof performPreFlightHealthCheck === 'function',
      preFlightCheckWorking: preFlightResult && typeof preFlightResult.success === 'boolean',
      healthStatusAvailable: typeof getServiceHealthStatus === 'function',
      healthStatusWorking: typeof healthStatus === 'string',
      systemHealthAvailable: typeof performSystemHealthCheck === 'function',
      systemHealthWorking: systemHealthResult && typeof systemHealthResult === 'object'
    };
    
    const workingChecks = Object.values(integrationChecks).filter(Boolean).length;
    const totalChecks = Object.keys(integrationChecks).length;
    
    return {
      testName,
      passed: workingChecks === totalChecks,
      details: {
        integrationChecks,
        workingChecks,
        totalChecks,
        integrationRate: (workingChecks / totalChecks * 100).toFixed(2) + '%',
        preFlightResult,
        healthStatus,
        systemHealthSummary: systemHealthResult ? {
          overall: systemHealthResult.overall || systemHealthResult.overallStatus,
          components: Object.keys(systemHealthResult.components || {}).length
        } : null
      },
      message: `${workingChecks}/${totalChecks} integration checks passed`
    };
    
  } catch (error) {
    return {
      testName,
      passed: false,
      error: error.message,
      message: 'End-to-end integration test failed'
    };
  }
}

/**
 * Quick integration status check - run this for a fast overview
 */
function quickIntegrationStatus() {
  const logger = Logger.createChildLogger('QuickStatus');
  
  const status = {
    timestamp: new Date().toISOString(),
    enhancedServicesAvailable: {
      ServiceHealthMonitor: typeof ServiceHealthMonitor !== 'undefined',
      ServiceRecoverySystem: typeof ServiceRecoverySystem !== 'undefined', 
      HandlerService: typeof HandlerService !== 'undefined',
      ServiceInitializationTestSuite: typeof ServiceInitializationTestSuite !== 'undefined'
    },
    coreSystemFunctions: {
      setup: typeof setup === 'function',
      onFormSubmit: typeof onFormSubmit === 'function',
      onEdit: typeof onEdit === 'function',
      performPreFlightHealthCheck: typeof performPreFlightHealthCheck === 'function',
      getServiceHealthStatus: typeof getServiceHealthStatus === 'function'
    },
    integrationStatus: 'UNKNOWN'
  };
  
  const enhancedServicesCount = Object.values(status.enhancedServicesAvailable).filter(Boolean).length;
  const coreSystemCount = Object.values(status.coreSystemFunctions).filter(Boolean).length;
  
  if (enhancedServicesCount >= 2 && coreSystemCount === 5) {
    status.integrationStatus = 'FULLY_INTEGRATED';
  } else if (enhancedServicesCount >= 1 && coreSystemCount >= 4) {
    status.integrationStatus = 'PARTIALLY_INTEGRATED';
  } else if (coreSystemCount >= 3) {
    status.integrationStatus = 'BASIC_INTEGRATION';
  } else {
    status.integrationStatus = 'INTEGRATION_INCOMPLETE';
  }
  
  logger.info('Quick integration status check completed', status);
  return status;
}

// Export functions for global access
if (typeof global !== 'undefined') {
  global.testEnhancedServiceIntegration = testEnhancedServiceIntegration;
  global.quickIntegrationStatus = quickIntegrationStatus;
}
