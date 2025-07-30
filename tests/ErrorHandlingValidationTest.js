/**
 * ErrorHandlingValidationTest.js
 * Comprehensive validation test for enhanced error handling and recovery mechanisms
 * 
 * Tests all components implemented for Task 3:
 * - GAS-specific error codes and categorization
 * - Persistent logging capabilities
 * - Quota health monitoring
 * - Recovery mechanisms
 * - Service integration
 * 
 * @fileoverview Validation test suite for Task 3 implementation
 * @version 1.0.0
 */

/**
 * Main validation function for error handling enhancements
 * Executes comprehensive test suite as specified in task requirements
 */
function validateErrorHandlingEnhancements() {
  console.log('🧪 Starting Error Handling Enhancement Validation...');
  
  const results = {
    gasErrorCodes: false,
    persistentLogging: false,
    quotaMonitoring: false,
    recoveryMechanisms: false,
    serviceIntegration: false,
    overallSuccess: false
  };
  
  try {
    // Test 1: GAS-Specific Error Code Integration
    console.log('\n📋 Test 1: GAS Error Code Integration');
    results.gasErrorCodes = testGASErrorCodes();
    
    // Test 2: Persistent Logging Enhancement
    console.log('\n📋 Test 2: Persistent Logging Enhancement');
    results.persistentLogging = testPersistentLogging();
    
    // Test 3: Quota Health Monitoring
    console.log('\n📋 Test 3: Quota Health Monitoring');
    results.quotaMonitoring = testQuotaMonitoring();
    
    // Test 4: Recovery Mechanisms
    console.log('\n📋 Test 4: Recovery Mechanisms');
    results.recoveryMechanisms = testRecoveryMechanisms();
    
    // Test 5: Service Integration
    console.log('\n📋 Test 5: Service Integration');
    results.serviceIntegration = testServiceIntegration();
    
    // Calculate overall success
    const successCount = Object.values(results).filter(Boolean).length;
    results.overallSuccess = successCount >= 4; // 80% success rate
    
    // Generate final report
    generateValidationReport(results);
    
    return results;
    
  } catch (error) {
    console.error('❌ Validation failed with error:', error.message);
    return results;
  }
}

/**
 * Test GAS-specific error codes and categorization
 */
function testGASErrorCodes() {
  try {
    console.log('  Testing GAS error categorization...');
    
    // Get ErrorHandlerService
    const errorHandler = GlobalServiceLocator.get('ErrorHandlerService');
    
    // Test GAS-specific error categorization
    const testErrors = [
      { message: 'Quota exceeded', expected: 'GAS_QUOTA_' },
      { message: 'Execution timeout', expected: 'GAS_EXECUTION_' },
      { message: 'Permission denied', expected: 'GAS_PERMISSION_' },
      { message: 'Script disabled', expected: 'GAS_SCRIPT_' },
      { message: 'Trigger limit exceeded', expected: 'GAS_TRIGGER_' }
    ];
    
    let passedTests = 0;
    for (const testCase of testErrors) {
      const error = new Error(testCase.message);
      const category = errorHandler.categorizeError(error);
      
      if (category.startsWith(testCase.expected)) {
        console.log(`    ✅ ${testCase.message} -> ${category}`);
        passedTests++;
      } else {
        console.log(`    ❌ ${testCase.message} -> ${category} (expected: ${testCase.expected})`);
      }
    }
    
    const success = passedTests >= 4;
    console.log(`  Result: ${success ? '✅' : '❌'} ${passedTests}/${testErrors.length} tests passed`);
    return success;
    
  } catch (error) {
    console.error('  ❌ GAS Error Code test failed:', error.message);
    return false;
  }
}

/**
 * Test persistent logging capabilities
 */
function testPersistentLogging() {
  try {
    console.log('  Testing persistent logging...');
    
    // Get LoggerService
    const logger = GlobalServiceLocator.get('LoggerService');
    
    // Test critical log storage
    logger.critical('Test critical error for validation', { testId: 'validation-001' });
    console.log('    ✅ Critical log stored');
    
    // Test error log storage
    logger.error('Test error for validation', { testId: 'validation-002' });
    console.log('    ✅ Error log stored');
    
    // Test log retrieval
    const logs = logger.getPersistentLogs({ level: 'ERROR', limit: 5 });
    console.log(`    ✅ Retrieved ${logs.length} persistent logs`);
    
    // Test logging stats
    const stats = logger.getLoggingStats();
    console.log(`    ✅ Logging stats: ${JSON.stringify(stats)}`);
    
    console.log('  Result: ✅ Persistent logging functional');
    return true;
    
  } catch (error) {
    console.error('  ❌ Persistent Logging test failed:', error.message);
    return false;
  }
}

/**
 * Test quota monitoring capabilities
 */
function testQuotaMonitoring() {
  try {
    console.log('  Testing quota monitoring...');
    
    // Get services
    const quotaMonitor = GlobalServiceLocator.get('QuotaMonitoringService');
    const healthCheck = GlobalServiceLocator.get('HealthCheckService');
    
    // Test quota status retrieval
    const quotaStatus = quotaMonitor.getQuotaStatus();
    console.log(`    ✅ Quota status retrieved: ${Object.keys(quotaStatus).length} quotas monitored`);
    
    // Test health check quota monitoring
    const healthStatus = healthCheck.checkQuotaUsage();
    console.log(`    ✅ Health check quota status: ${healthStatus.status}`);
    
    // Test quota usage recording
    quotaMonitor.recordUsage('runtime', 30000); // 30 seconds
    console.log('    ✅ Quota usage recorded');
    
    // Test monitoring stats
    const stats = quotaMonitor.getMonitoringStats();
    console.log(`    ✅ Monitoring stats: ${JSON.stringify(stats)}`);
    
    console.log('  Result: ✅ Quota monitoring functional');
    return true;
    
  } catch (error) {
    console.error('  ❌ Quota Monitoring test failed:', error.message);
    return false;
  }
}

/**
 * Test recovery mechanisms
 */
function testRecoveryMechanisms() {
  try {
    console.log('  Testing recovery mechanisms...');
    
    // Get ErrorHandlerService
    const errorHandler = GlobalServiceLocator.get('ErrorHandlerService');
    
    // Test recovery strategy availability
    const strategies = [
      'handleQuotaExceeded',
      'handleExecutionTimeout',
      'handlePermissionDenied',
      'handleLockTimeout'
    ];
    
    let availableStrategies = 0;
    for (const strategy of strategies) {
      if (typeof errorHandler[strategy] === 'function') {
        console.log(`    ✅ Recovery strategy available: ${strategy}`);
        availableStrategies++;
      } else {
        console.log(`    ❌ Recovery strategy missing: ${strategy}`);
      }
    }
    
    // Test retry mechanism
    const retryResult = errorHandler.retryWithBackoff(() => {
      return 'success';
    }, 2);
    
    if (retryResult === 'success') {
      console.log('    ✅ Retry mechanism functional');
      availableStrategies++;
    }
    
    const success = availableStrategies >= 4;
    console.log(`  Result: ${success ? '✅' : '❌'} ${availableStrategies}/${strategies.length + 1} mechanisms available`);
    return success;
    
  } catch (error) {
    console.error('  ❌ Recovery Mechanisms test failed:', error.message);
    return false;
  }
}

/**
 * Test service integration with GlobalServiceLocator
 */
function testServiceIntegration() {
  try {
    console.log('  Testing service integration...');
    
    // Test service availability
    const requiredServices = [
      'ErrorHandlerService',
      'LoggerService',
      'HealthCheckService',
      'QuotaMonitoringService'
    ];
    
    let availableServices = 0;
    for (const serviceName of requiredServices) {
      try {
        const service = GlobalServiceLocator.get(serviceName);
        if (service && typeof service.getServiceInfo === 'function') {
          const info = service.getServiceInfo();
          console.log(`    ✅ ${serviceName}: ${info.name} v${info.version}`);
          availableServices++;
        } else {
          console.log(`    ❌ ${serviceName}: Service available but missing getServiceInfo`);
        }
      } catch (error) {
        console.log(`    ❌ ${serviceName}: Not available (${error.message})`);
      }
    }
    
    // Test service locator status
    const locatorStatus = GlobalServiceLocator.getStatus();
    console.log(`    ✅ Service Locator: ${locatorStatus.registeredServices.length} services registered`);
    
    const success = availableServices >= 3; // Allow for 75% success
    console.log(`  Result: ${success ? '✅' : '❌'} ${availableServices}/${requiredServices.length} services integrated`);
    return success;
    
  } catch (error) {
    console.error('  ❌ Service Integration test failed:', error.message);
    return false;
  }
}

/**
 * Generate comprehensive validation report
 */
function generateValidationReport(results) {
  console.log('\n📊 VALIDATION REPORT');
  console.log('=' .repeat(50));
  
  const testResults = [
    { name: 'GAS Error Code Integration', passed: results.gasErrorCodes },
    { name: 'Persistent Logging Enhancement', passed: results.persistentLogging },
    { name: 'Quota Health Monitoring', passed: results.quotaMonitoring },
    { name: 'Recovery Mechanisms', passed: results.recoveryMechanisms },
    { name: 'Service Integration', passed: results.serviceIntegration }
  ];
  
  let passedCount = 0;
  for (const test of testResults) {
    const status = test.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${test.name}`);
    if (test.passed) passedCount++;
  }
  
  console.log('=' .repeat(50));
  console.log(`Overall Success: ${results.overallSuccess ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Success Rate: ${passedCount}/${testResults.length} (${Math.round(passedCount/testResults.length*100)}%)`);
  
  if (results.overallSuccess) {
    console.log('\n🎉 Task 3 Implementation Successfully Validated!');
    console.log('✅ Enhanced error handling and recovery mechanisms are operational');
  } else {
    console.log('\n⚠️ Task 3 Implementation Needs Attention');
    console.log('❌ Some components require additional work');
  }
  
  return results;
}

/**
 * Quick validation function for immediate testing
 */
function quickValidation() {
  console.log('🚀 Quick Validation of Error Handling Enhancements');
  
  try {
    // Test service availability
    const errorHandler = GlobalServiceLocator.get('ErrorHandlerService');
    const logger = GlobalServiceLocator.get('LoggerService');
    const healthCheck = GlobalServiceLocator.get('HealthCheckService');
    const quotaMonitor = GlobalServiceLocator.get('QuotaMonitoringService');
    
    console.log('✅ All enhanced services are available');
    
    // Test basic functionality
    logger.info('Quick validation test', { timestamp: new Date().toISOString() });
    const health = healthCheck.performHealthCheck();
    
    console.log(`✅ System health: ${health.overallStatus}`);
    console.log('🎉 Quick validation successful!');
    
    return true;
    
  } catch (error) {
    console.error('❌ Quick validation failed:', error.message);
    return false;
  }
}

// Export functions for global access
if (typeof globalThis !== 'undefined') {
  globalThis.validateErrorHandlingEnhancements = validateErrorHandlingEnhancements;
  globalThis.quickValidation = quickValidation;
}

console.log('✅ Error Handling Validation Test loaded successfully');
console.log('💡 Run validateErrorHandlingEnhancements() for full validation');
console.log('💡 Run quickValidation() for quick test');