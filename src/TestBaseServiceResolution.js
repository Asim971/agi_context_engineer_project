/**
 * TestBaseServiceResolution.js
 * Test functions to verify BaseService resolution fixes
 * 
 * This file contains test functions to validate that the BaseService
 * loading order issue has been resolved.
 */

/**
 * Test BaseService availability and instantiation
 */
function testBaseServiceResolution() {
  console.log('=== BaseService Resolution Test ===');
  
  const testResults = {
    timestamp: new Date().toISOString(),
    tests: {},
    summary: { passed: 0, failed: 0, total: 0 }
  };
  
  // Test 1: BaseService availability
  try {
    if (typeof BaseService !== 'undefined') {
      console.log('✓ Test 1 PASSED: BaseService is defined');
      testResults.tests.baseServiceDefined = 'PASSED';
      testResults.summary.passed++;
    } else {
      console.error('✗ Test 1 FAILED: BaseService is not defined');
      testResults.tests.baseServiceDefined = 'FAILED';
      testResults.summary.failed++;
    }
  } catch (error) {
    console.error('✗ Test 1 ERROR:', error.message);
    testResults.tests.baseServiceDefined = 'ERROR';
    testResults.summary.failed++;
  }
  testResults.summary.total++;
  
  // Test 2: BaseService instantiation
  try {
    const baseService = new BaseService();
    if (baseService && typeof baseService === 'object') {
      console.log('✓ Test 2 PASSED: BaseService instantiation successful');
      testResults.tests.baseServiceInstantiation = 'PASSED';
      testResults.summary.passed++;
    } else {
      console.error('✗ Test 2 FAILED: BaseService instantiation returned invalid object');
      testResults.tests.baseServiceInstantiation = 'FAILED';
      testResults.summary.failed++;
    }
  } catch (error) {
    console.error('✗ Test 2 FAILED: BaseService instantiation error:', error.message);
    testResults.tests.baseServiceInstantiation = 'FAILED';
    testResults.summary.failed++;
  }
  testResults.summary.total++;
  
  // Test 3: DatabaseService availability and inheritance
  try {
    if (typeof DatabaseService !== 'undefined') {
      console.log('✓ Test 3 PASSED: DatabaseService is defined');
      testResults.tests.databaseServiceDefined = 'PASSED';
      testResults.summary.passed++;
    } else {
      console.error('✗ Test 3 FAILED: DatabaseService is not defined');
      testResults.tests.databaseServiceDefined = 'FAILED';
      testResults.summary.failed++;
    }
  } catch (error) {
    console.error('✗ Test 3 ERROR:', error.message);
    testResults.tests.databaseServiceDefined = 'ERROR';
    testResults.summary.failed++;
  }
  testResults.summary.total++;
  
  // Test 4: DatabaseService instantiation
  try {
    const dbService = new DatabaseService(true); // Use test mode
    if (dbService instanceof BaseService) {
      console.log('✓ Test 4 PASSED: DatabaseService inherits from BaseService');
      testResults.tests.databaseServiceInheritance = 'PASSED';
      testResults.summary.passed++;
    } else {
      console.error('✗ Test 4 FAILED: DatabaseService does not inherit from BaseService');
      testResults.tests.databaseServiceInheritance = 'FAILED';
      testResults.summary.failed++;
    }
  } catch (error) {
    console.error('✗ Test 4 FAILED: DatabaseService instantiation error:', error.message);
    testResults.tests.databaseServiceInheritance = 'FAILED';
    testResults.summary.failed++;
  }
  testResults.summary.total++;
  
  // Test 5: Global DB function
  try {
    if (typeof getGlobalDB === 'function') {
      const globalDb = getGlobalDB();
      if (globalDb instanceof DatabaseService && globalDb instanceof BaseService) {
        console.log('✓ Test 5 PASSED: getGlobalDB() returns proper DatabaseService instance');
        testResults.tests.globalDbFunction = 'PASSED';
        testResults.summary.passed++;
      } else {
        console.error('✗ Test 5 FAILED: getGlobalDB() returned invalid instance');
        testResults.tests.globalDbFunction = 'FAILED';
        testResults.summary.failed++;
      }
    } else {
      console.error('✗ Test 5 FAILED: getGlobalDB function not defined');
      testResults.tests.globalDbFunction = 'FAILED';
      testResults.summary.failed++;
    }
  } catch (error) {
    console.error('✗ Test 5 FAILED: getGlobalDB() error:', error.message);
    testResults.tests.globalDbFunction = 'FAILED';
    testResults.summary.failed++;
  }
  testResults.summary.total++;
  
  // Test 6: ValidationService (if available)
  try {
    if (typeof ValidationService !== 'undefined') {
      const validationService = new ValidationService();
      if (validationService instanceof BaseService) {
        console.log('✓ Test 6 PASSED: ValidationService inherits from BaseService');
        testResults.tests.validationServiceInheritance = 'PASSED';
        testResults.summary.passed++;
      } else {
        console.error('✗ Test 6 FAILED: ValidationService does not inherit from BaseService');
        testResults.tests.validationServiceInheritance = 'FAILED';
        testResults.summary.failed++;
      }
    } else {
      console.warn('⚠ Test 6 SKIPPED: ValidationService not available');
      testResults.tests.validationServiceInheritance = 'SKIPPED';
    }
  } catch (error) {
    console.error('✗ Test 6 FAILED: ValidationService error:', error.message);
    testResults.tests.validationServiceInheritance = 'FAILED';
    testResults.summary.failed++;
  }
  testResults.summary.total++;
  
  // Print summary
  console.log('\n=== Test Summary ===');
  console.log(`Total Tests: ${testResults.summary.total}`);
  console.log(`Passed: ${testResults.summary.passed}`);
  console.log(`Failed: ${testResults.summary.failed}`);
  console.log(`Success Rate: ${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(1)}%`);
  
  if (testResults.summary.failed === 0) {
    console.log('🎉 ALL TESTS PASSED! BaseService resolution is working correctly.');
  } else {
    console.log('❌ Some tests failed. Please check the error messages above.');
  }
  
  return testResults;
}

/**
 * Quick diagnostic function to check service loading order
 */
function diagnosticServiceLoadingOrder() {
  console.log('=== Service Loading Order Diagnostic ===');
  
  const services = [
    'BaseService',
    'DatabaseService', 
    'ValidationService',
    'ErrorHandlerService',
    'LoggerService',
    'AppScriptError'
  ];
  
  const loadOrder = [];
  const missing = [];
  
  services.forEach(serviceName => {
    if (typeof globalThis[serviceName] !== 'undefined' || typeof window[serviceName] !== 'undefined') {
      loadOrder.push(serviceName);
      console.log(`✓ ${serviceName} - Available`);
    } else {
      missing.push(serviceName);
      console.log(`✗ ${serviceName} - Missing`);
    }
  });
  
  console.log('\nLoad Order Summary:');
  console.log('Loaded:', loadOrder.join(', '));
  if (missing.length > 0) {
    console.log('Missing:', missing.join(', '));
  }
  
  // Check global functions
  const globalFunctions = ['getGlobalDB', 'setup', 'initializeServices'];
  console.log('\nGlobal Functions:');  
  globalFunctions.forEach(funcName => {
    if (typeof globalThis[funcName] === 'function') {
      console.log(`✓ ${funcName}() - Available`);
    } else {
      console.log(`✗ ${funcName}() - Missing`);
    }
  });
  
  return { loadOrder, missing };
}

/**
 * Test the specific error that was reported
 */
function testOriginalError() {
  console.log('=== Original Error Reproduction Test ===');
  
  try {
    // This is the line that was failing: DatabaseService.gs:10
    // It should now work with our fixes
    const db = new DatabaseService(true);
    
    if (db && db instanceof BaseService) {
      console.log('✅ SUCCESS: Original error resolved!');
      console.log('   - DatabaseService instantiated successfully');
      console.log('   - BaseService inheritance confirmed');
      console.log('   - No "BaseService is not defined" error');
      return { success: true, error: null };
    } else {
      console.error('❌ FAILURE: Instance created but inheritance check failed');
      return { success: false, error: 'Inheritance check failed' };
    }
    
  } catch (error) {
    if (error.message.includes('BaseService is not defined')) {
      console.error('❌ FAILURE: Original error still present!');
      console.error('   Error:', error.message);
      return { success: false, error: error.message };
    } else {
      console.error('❌ FAILURE: Different error occurred');
      console.error('   Error:', error.message);
      return { success: false, error: error.message };
    }
  }
}

// Make functions globally accessible
if (typeof globalThis !== 'undefined') {
  globalThis.testBaseServiceResolution = testBaseServiceResolution;
  globalThis.diagnosticServiceLoadingOrder = diagnosticServiceLoadingOrder;
  globalThis.testOriginalError = testOriginalError;
}

// Auto-run basic diagnostic when this file loads
try {
  console.log('🔍 Running automatic BaseService diagnostic...');
  diagnosticServiceLoadingOrder();
} catch (error) {
  console.error('Diagnostic failed:', error);
}
