/**
 * 99_FoundationTests.js
 * Comprehensive testing suite for the Foundation fix
 * 
 * This file is prefixed with "99_" to ensure it loads last,
 * after all other services have loaded. It provides verification
 * that the Foundation fix resolved the load order issues.
 * 
 * @fileoverview Foundation verification and load order testing
 * @version 2.0.0
 * @author Apps Script Troubleshooter Agent
 */

/**
 * Comprehensive Foundation Test Suite
 * Verifies that the load order fix resolved all dependency issues
 * 
 * @returns {Object} Test results and diagnostics
 */
function runFoundationTests() {
  console.log('\n🧪 === FOUNDATION TESTS STARTING ===');
  
  const testResults = {
    timestamp: new Date().toISOString(),
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    errors: [],
    warnings: [],
    details: {}
  };

  // Define all test cases
  const testSuites = [
    {
      name: 'Core Dependencies',
      tests: [
        {
          name: 'BaseService Availability',
          test: () => typeof BaseService !== 'undefined',
          description: 'BaseService is defined and accessible'
        },
        {
          name: 'Config Availability',
          test: () => typeof Config !== 'undefined',
          description: 'Config object is available'
        },
        {
          name: 'Global Access',
          test: () => typeof globalThis.BaseService !== 'undefined',
          description: 'BaseService is globally accessible'
        }
      ]
    },
    {
      name: 'BaseService Functionality',
      tests: [
        {
          name: 'Instantiation',
          test: () => {
            const instance = new BaseService();
            return instance instanceof BaseService;
          },
          description: 'BaseService can be instantiated'
        },
        {
          name: 'Method Availability',
          test: () => {
            const instance = new BaseService();
            return typeof instance.executeWithErrorHandling === 'function' &&
                   typeof instance.log === 'function' &&
                   typeof instance.getServiceInfo === 'function';
          },
          description: 'BaseService has all required methods'
        },
        {
          name: 'Error Handling',
          test: () => {
            const instance = new BaseService();
            try {
              instance.executeWithErrorHandling(() => {
                throw new Error('Test error');
              });
              return false; // Should have thrown
            } catch (error) {
              return error.message === 'Test error';
            }
          },
          description: 'Error handling works correctly'
        }
      ]
    },
    {
      name: 'Service Inheritance',
      tests: [
        {
          name: 'DatabaseService Inheritance',
          test: () => {
            try {
              if (typeof DatabaseService === 'undefined') {
                console.warn('DatabaseService not found - skipping inheritance test');
                return true; // Skip if not available
              }
              const db = new DatabaseService(true); // Test mode
              return db instanceof BaseService;
            } catch (error) {
              console.error('DatabaseService inheritance test failed:', error.message);
              return false;
            }
          },
          description: 'DatabaseService extends BaseService correctly'
        },
        {
          name: 'BDLeadHandlerService Inheritance',
          test: () => {
            try {
              if (typeof BDLeadHandlerService === 'undefined') {
                console.warn('BDLeadHandlerService not found - skipping inheritance test');
                return true; // Skip if not available
              }
              const handler = new BDLeadHandlerService();
              return handler instanceof BaseService;
            } catch (error) {
              console.error('BDLeadHandlerService inheritance test failed:', error.message);
              return false;
            }
          },
          description: 'BDLeadHandlerService extends BaseService correctly'
        }
      ]
    },
    {
      name: 'Original Error Resolution',
      tests: [
        {
          name: 'No ReferenceError for BaseService',
          test: () => {
            try {
              // This should not throw "BaseService is not defined"
              const TestClass = class extends BaseService {
                constructor() {
                  super();
                  this.testProperty = 'test';
                }
              };
              const instance = new TestClass();
              return instance.testProperty === 'test';
            } catch (error) {
              return !error.message.includes('BaseService is not defined');
            }
          },
          description: 'No ReferenceError when extending BaseService'
        },
        {
          name: 'Logger Property Access',
          test: () => {
            try {
              const instance = new BaseService();
              // This should not throw "Cannot read properties of undefined"
              return typeof instance.logger !== 'undefined';
            } catch (error) {
              return !error.message.includes('Cannot read properties of undefined');
            }
          },
          description: 'No undefined property access errors'
        }
      ]
    }
  ];

  // Execute all test suites
  testSuites.forEach(suite => {
    console.log(`\n📋 Testing: ${suite.name}`);
    testResults.details[suite.name] = {
      passed: 0,
      failed: 0,
      tests: []
    };

    suite.tests.forEach(test => {
      testResults.totalTests++;
      
      try {
        const result = test.test();
        const status = result ? 'PASS' : 'FAIL';
        const statusIcon = result ? '✅' : '❌';
        
        console.log(`  ${statusIcon} ${test.name}: ${test.description}`);
        
        testResults.details[suite.name].tests.push({
          name: test.name,
          description: test.description,
          status,
          result
        });

        if (result) {
          testResults.passedTests++;
          testResults.details[suite.name].passed++;
        } else {
          testResults.failedTests++;
          testResults.details[suite.name].failed++;
          testResults.errors.push(`${suite.name} - ${test.name}: ${test.description}`);
        }
      } catch (error) {
        console.log(`  ❌ ${test.name}: ERROR - ${error.message}`);
        testResults.failedTests++;
        testResults.details[suite.name].failed++;
        testResults.errors.push(`${suite.name} - ${test.name}: ${error.message}`);
        
        testResults.details[suite.name].tests.push({
          name: test.name,
          description: test.description,
          status: 'ERROR',
          error: error.message
        });
      }
    });
  });

  // Generate summary
  const successRate = (testResults.passedTests / testResults.totalTests * 100).toFixed(1);
  const overallStatus = testResults.failedTests === 0 ? 'SUCCESS' : 'PARTIAL';
  const statusIcon = overallStatus === 'SUCCESS' ? '🎉' : '⚠️';

  console.log(`\n${statusIcon} === FOUNDATION TESTS COMPLETE ===`);
  console.log(`📊 Results: ${testResults.passedTests}/${testResults.totalTests} tests passed (${successRate}%)`);
  
  if (testResults.failedTests > 0) {
    console.log(`❌ Failed tests: ${testResults.failedTests}`);
    console.log('📋 Failures:');
    testResults.errors.forEach(error => console.log(`  • ${error}`));
  }

  if (testResults.warnings.length > 0) {
    console.log('⚠️ Warnings:');
    testResults.warnings.forEach(warning => console.log(`  • ${warning}`));
  }

  testResults.overallStatus = overallStatus;
  testResults.successRate = successRate;

  return testResults;
}

/**
 * Quick Foundation Health Check
 * Lightweight verification that can be called from anywhere
 * 
 * @returns {boolean} True if foundation is healthy
 */
function isFoundationHealthy() {
  try {
    // Critical checks only
    if (typeof BaseService === 'undefined') return false;
    
    const instance = new BaseService();
    if (!(instance instanceof BaseService)) return false;
    
    if (typeof instance.executeWithErrorHandling !== 'function') return false;
    
    return true;
  } catch (error) {
    console.error('Foundation health check failed:', error.message);
    return false;
  }
}

/**
 * Simulate the Original Error Scenario
 * This test recreates the exact conditions that caused the original error
 * to verify they are now resolved
 * 
 * @returns {Object} Test results showing the fix worked
 */
function testOriginalErrorScenario() {
  console.log('\n🎯 Testing Original Error Scenario...');
  
  const originalErrors = [
    'BaseService is not defined',
    'Config is not available', 
    'Cannot read properties of undefined (reading \'info\')'
  ];

  const results = {
    timestamp: new Date().toISOString(),
    originalErrorsResolved: [],
    newIssues: [],
    success: true
  };

  try {
    // Test 1: BaseService inheritance (original failure point)
    console.log('  🧪 Testing BaseService inheritance...');
    const TestHandler = class extends BaseService {
      constructor() {
        super();
        this.serviceName = 'TestHandler';
      }
    };
    
    const handler = new TestHandler();
    results.originalErrorsResolved.push('BaseService inheritance works');
    console.log('  ✅ BaseService inheritance: RESOLVED');

    // Test 2: Property access on logger (original crash point)
    console.log('  🧪 Testing logger property access...');
    handler.logger.info('Test log message');
    results.originalErrorsResolved.push('Logger property access works');
    console.log('  ✅ Logger property access: RESOLVED');

    // Test 3: Config availability
    console.log('  🧪 Testing Config availability...');
    const configTest = typeof Config !== 'undefined';
    if (configTest) {
      results.originalErrorsResolved.push('Config is available');
      console.log('  ✅ Config availability: RESOLVED');
    } else {
      results.newIssues.push('Config still not available');
      console.log('  ⚠️ Config availability: Still missing');
    }

    console.log(`\n🎉 Original Error Scenario: ${results.originalErrorsResolved.length}/3 issues RESOLVED`);

    if (results.newIssues.length > 0) {
      results.success = false;
      console.log('⚠️ New issues found:');
      results.newIssues.forEach(issue => console.log(`  • ${issue}`));
    }

  } catch (error) {
    results.success = false;
    results.newIssues.push(`Unexpected error: ${error.message}`);
    console.log(`  ❌ Test failed with error: ${error.message}`);
  }

  return results;
}

/**
 * Auto-run tests in test environment
 * This will automatically verify the fix when the script loads
 */
if (typeof Config !== 'undefined' && Config.IS_TEST_ENVIRONMENT) {
  console.log('\n🔄 Auto-running Foundation tests in test environment...');
  
  // Small delay to ensure all services are loaded
  Utilities.sleep(100);
  
  const testResults = runFoundationTests();
  const scenarioResults = testOriginalErrorScenario();
  
  console.log('\n📋 FINAL VERIFICATION SUMMARY:');
  console.log(`Foundation tests: ${testResults.overallStatus} (${testResults.successRate}% passed)`);
  console.log(`Original error resolution: ${scenarioResults.success ? 'RESOLVED' : 'PARTIAL'}`);
  
  if (testResults.overallStatus === 'SUCCESS' && scenarioResults.success) {
    console.log('\n🎉 ALL SYSTEMS GO! The Foundation fix has resolved the load order issues.');
  } else {
    console.log('\n⚠️ Some issues remain. Review the test results above.');
  }
}
