/**
 * QuickServiceTest.js
 * Quick verification script for service locator implementation
 * 
 * Run this in Google Apps Script console to verify the solution
 */

function quickServiceTest() {
  console.log('🚨 Starting Service Initialization Troubleshooter Agent verification...');
  
  const results = {
    timestamp: new Date().toISOString(),
    tests: {},
    summary: { passed: 0, failed: 0, total: 0 }
  };
  
  // Test 1: GlobalServiceLocator availability
  results.tests.GlobalServiceLocator = {
    name: 'GlobalServiceLocator Availability',
    passed: typeof GlobalServiceLocator !== 'undefined',
    error: typeof GlobalServiceLocator === 'undefined' ? 'GlobalServiceLocator not defined' : null
  };
  
  // Test 2: ServiceBootstrap availability
  results.tests.ServiceBootstrap = {
    name: 'ServiceBootstrap Availability', 
    passed: typeof ServiceBootstrap !== 'undefined',
    error: typeof ServiceBootstrap === 'undefined' ? 'ServiceBootstrap not defined' : null
  };
  
  // Test 3: ServiceDiagnosticRepair availability
  results.tests.ServiceDiagnosticRepair = {
    name: 'ServiceDiagnosticRepair Availability',
    passed: typeof ServiceDiagnosticRepair !== 'undefined',
    error: typeof ServiceDiagnosticRepair === 'undefined' ? 'ServiceDiagnosticRepair not defined' : null
  };
  
  // Test 4: Config service access
  try {
    const config = GlobalServiceLocator.get('Config');
    results.tests.ConfigAccess = {
      name: 'Config Service Access',
      passed: !!config,
      error: null
    };
  } catch (error) {
    results.tests.ConfigAccess = {
      name: 'Config Service Access',
      passed: false,
      error: error.message
    };
  }
  
  // Test 5: DatabaseService access
  try {
    const db = GlobalServiceLocator.get('DatabaseService'); 
    results.tests.DatabaseAccess = {
      name: 'DatabaseService Access',
      passed: !!db,
      error: null
    };
  } catch (error) {
    results.tests.DatabaseAccess = {
      name: 'DatabaseService Access',
      passed: false,
      error: error.message
    };
  }
  
  // Test 6: HandlerService access
  try {
    const HandlerServiceClass = GlobalServiceLocator.get('HandlerService');
    results.tests.HandlerServiceAccess = {
      name: 'HandlerService Class Access',
      passed: typeof HandlerServiceClass === 'function',
      error: typeof HandlerServiceClass !== 'function' ? 'HandlerService not a function' : null
    };
  } catch (error) {
    results.tests.HandlerServiceAccess = {
      name: 'HandlerService Class Access',
      passed: false,
      error: error.message
    };
  }
  
  // Test 7: Global accessors
  results.tests.getGlobalDB = {
    name: 'getGlobalDB Function',
    passed: typeof getGlobalDB === 'function',
    error: typeof getGlobalDB !== 'function' ? 'getGlobalDB not a function' : null
  };
  
  results.tests.getGlobalConfig = {
    name: 'getGlobalConfig Function',
    passed: typeof getGlobalConfig === 'function',
    error: typeof getGlobalConfig !== 'function' ? 'getGlobalConfig not a function' : null
  };
  
  // Test 8: BDLeadHandler_ServiceLocator instantiation
  try {
    const bdHandler = new BDLeadHandler_ServiceLocator();
    results.tests.BDLeadHandlerInstantiation = {
      name: 'BDLeadHandler_ServiceLocator Instantiation',
      passed: !!bdHandler,
      error: null
    };
  } catch (error) {
    results.tests.BDLeadHandlerInstantiation = {
      name: 'BDLeadHandler_ServiceLocator Instantiation', 
      passed: false,
      error: error.message
    };
  }
  
  // Calculate summary
  Object.values(results.tests).forEach(test => {
    results.summary.total++;
    if (test.passed) {
      results.summary.passed++;
    } else {
      results.summary.failed++;
    }
  });
  
  // Display results
  console.log('=== SERVICE LOCATOR TEST RESULTS ===');
  Object.entries(results.tests).forEach(([key, test]) => {
    const status = test.passed ? '✅' : '❌';
    console.log(`${status} ${test.name}: ${test.passed ? 'PASSED' : 'FAILED'}`);
    if (!test.passed && test.error) {
      console.log(`   Error: ${test.error}`);
    }
  });
  
  console.log(`\n📊 SUMMARY: ${results.summary.passed}/${results.summary.total} tests passed`);
  
  if (results.summary.failed === 0) {
    console.log('🎉 ALL TESTS PASSED - Service initialization issues resolved!');
  } else {
    console.log('⚠️ Some tests failed - running automatic repair...');
    
    // Run automatic repair
    try {
      const repairResult = ServiceDiagnosticRepair.fullRepair();
      console.log('🔧 Repair completed:', repairResult.summary);
    } catch (repairError) {
      console.error('❌ Automatic repair failed:', repairError.message);
    }
  }
  
  return results;
}

// Export for global access
if (typeof globalThis !== 'undefined') {
  globalThis.quickServiceTest = quickServiceTest;
}

console.log('✅ QuickServiceTest loaded - run quickServiceTest() to verify solution');
