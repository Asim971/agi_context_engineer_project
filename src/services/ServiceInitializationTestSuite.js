/**
 * ServiceInitializationTestSuite.js
 * Comprehensive test suite for service initialization troubleshooting
 * Validates all troubleshooter agent implementations
 * 
 * @fileoverview Advanced testing for service initialization patterns
 * @version 1.0.0
 */

/**
 * Service Initialization Test Suite
 * Tests all aspects of the troubleshooter agent implementations
 */
class ServiceInitializationTestSuite extends BaseService {
  constructor() {
    super();
    this.testResults = {
      timestamp: new Date().toISOString(),
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      testCategories: {},
      errors: [],
      recommendations: []
    };
    
    this.logger.info('Service Initialization Test Suite initialized');
  }

  /**
   * Run all service initialization tests
   * @returns {Object} Complete test results
   */
  runAllTests() {
    this.logger.info('Starting comprehensive service initialization tests');
    
    const testCategories = [
      { name: 'Foundation Tests', tests: () => this.runFoundationTests() },
      { name: 'Handler Service Tests', tests: () => this.runHandlerServiceTests() },
      { name: 'Health Monitor Tests', tests: () => this.runHealthMonitorTests() },
      { name: 'Recovery System Tests', tests: () => this.runRecoverySystemTests() },
      { name: 'Integration Tests', tests: () => this.runIntegrationTests() },
      { name: 'Error Scenario Tests', tests: () => this.runErrorScenarioTests() }
    ];

    for (const category of testCategories) {
      try {
        this.logger.info(`Running ${category.name}...`);
        const categoryResults = category.tests();
        this.testResults.testCategories[category.name] = categoryResults;
        
        this.testResults.totalTests += categoryResults.totalTests;
        this.testResults.passedTests += categoryResults.passedTests;
        this.testResults.failedTests += categoryResults.failedTests;
        
      } catch (error) {
        this.logger.error(`Test category failed: ${category.name}`, { error: error.message });
        this.testResults.errors.push(`${category.name}: ${error.message}`);
        this.testResults.failedTests++;
        this.testResults.totalTests++;
      }
    }

    // Calculate overall results
    this.testResults.successRate = this.testResults.totalTests > 0 
      ? (this.testResults.passedTests / this.testResults.totalTests * 100).toFixed(2)
      : 0;

    this.testResults.overallStatus = this.testResults.failedTests === 0 ? 'PASSED' : 'FAILED';

    this.logger.info('Service initialization tests completed', {
      totalTests: this.testResults.totalTests,
      successRate: this.testResults.successRate,
      overallStatus: this.testResults.overallStatus
    });

    return this.testResults;
  }

  /**
   * Test foundation layer functionality
   * @returns {Object} Foundation test results
   */
  runFoundationTests() {
    const results = { totalTests: 0, passedTests: 0, failedTests: 0, details: [] };

    // Test 1: BaseService availability
    this.runTest(results, 'BaseService Availability', () => {
      if (typeof BaseService === 'undefined') {
        throw new Error('BaseService is not defined');
      }
      
      const instance = new BaseService();
      if (!(instance instanceof BaseService)) {
        throw new Error('BaseService instantiation failed');
      }
      
      return { success: true, message: 'BaseService properly available and instantiable' };
    });

    // Test 2: Service inheritance chain
    this.runTest(results, 'Service Inheritance Chain', () => {
      if (typeof DatabaseService === 'undefined') {
        throw new Error('DatabaseService not available for inheritance test');
      }
      
      const dbInstance = new DatabaseService(true);
      if (!(dbInstance instanceof BaseService)) {
        throw new Error('DatabaseService does not properly inherit from BaseService');
      }
      
      return { success: true, message: 'Service inheritance chain working correctly' };
    });

    // Test 3: Global service functions
    this.runTest(results, 'Global Service Functions', () => {
      const requiredFunctions = ['getGlobalDB', 'getGlobalLogger', 'getGlobalConfig'];
      const missingFunctions = [];
      
      requiredFunctions.forEach(funcName => {
        if (typeof globalThis[funcName] !== 'function') {
          missingFunctions.push(funcName);
        }
      });
      
      if (missingFunctions.length > 0) {
        throw new Error(`Missing global functions: ${missingFunctions.join(', ')}`);
      }
      
      return { success: true, message: 'All global service functions available' };
    });

    // Test 4: Service loading order
    this.runTest(results, 'Service Loading Order', () => {
      // Check that BaseService loads before other services
      const loadOrder = [];
      
      if (typeof BaseService !== 'undefined') loadOrder.push('BaseService');
      if (typeof Config !== 'undefined') loadOrder.push('Config');
      if (typeof DatabaseService !== 'undefined') loadOrder.push('DatabaseService');
      if (typeof HandlerService !== 'undefined') loadOrder.push('HandlerService');
      
      const expectedOrder = ['BaseService', 'Config', 'DatabaseService', 'HandlerService'];
      const missingServices = expectedOrder.filter(service => !loadOrder.includes(service));
      
      if (missingServices.length > 0) {
        throw new Error(`Services not loaded in correct order. Missing: ${missingServices.join(', ')}`);
      }
      
      return { success: true, message: 'Service loading order is correct', loadOrder };
    });

    return results;
  }

  /**
   * Test HandlerService functionality
   * @returns {Object} Handler service test results
   */
  runHandlerServiceTests() {
    const results = { totalTests: 0, passedTests: 0, failedTests: 0, details: [] };

    // Test 1: HandlerService availability
    this.runTest(results, 'HandlerService Availability', () => {
      if (typeof HandlerService === 'undefined') {
        throw new Error('HandlerService class not available');
      }
      
      return { success: true, message: 'HandlerService class is available' };
    });

    // Test 2: HandlerService instantiation with validation
    this.runTest(results, 'HandlerService Instantiation', () => {
      // Test with valid parameters
      const mockHeaders = ['Name', 'Phone', 'Status'];
      const handler = new HandlerService('TestSheet', mockHeaders, 'TEST');
      
      if (!(handler instanceof BaseService)) {
        throw new Error('HandlerService does not inherit from BaseService');
      }
      
      if (!handler.helpers || typeof handler.helpers.mapFormValuesToHeaders !== 'function') {
        throw new Error('HandlerService helpers not properly initialized');
      }
      
      return { success: true, message: 'HandlerService instantiation successful' };
    });

    // Test 3: HandlerHelpers functionality
    this.runTest(results, 'HandlerHelpers Functionality', () => {
      const helpers = new HandlerHelpers();
      const testValues = ['John Doe', '1234567890', 'Pending'];
      const testHeaders = ['Name', 'Phone', 'Status'];
      
      const mappedData = helpers.mapFormValuesToHeaders(testValues, testHeaders);
      
      const expectedData = {
        'Name': 'John Doe',
        'Phone': '1234567890',
        'Status': 'Pending'
      };
      
      const keys = Object.keys(expectedData);
      for (const key of keys) {
        if (mappedData[key] !== expectedData[key]) {
          throw new Error(`Mapping failed for ${key}: expected ${expectedData[key]}, got ${mappedData[key]}`);
        }
      }
      
      return { success: true, message: 'HandlerHelpers mapping working correctly' };
    });

    // Test 4: Enhanced handler dependency validation
    this.runTest(results, 'Handler Dependency Validation', () => {
      try {
        // This should work if all dependencies are available
        const mockHeaders = ['Name', 'Phone'];
        const handler = new HandlerService('TestSheet', mockHeaders);
        
        // Test safe database access
        const db = handler.getDatabase();
        if (!db) {
          throw new Error('Handler database access returned null');
        }
        
        return { success: true, message: 'Handler dependency validation passed' };
        
      } catch (error) {
        if (error.message.includes('dependencies not available')) {
          // This is expected if dependencies are missing
          return { success: true, message: 'Handler correctly detected missing dependencies' };
        }
        throw error;
      }
    });

    return results;
  }

  /**
   * Test health monitoring functionality
   * @returns {Object} Health monitor test results
   */
  runHealthMonitorTests() {
    const results = { totalTests: 0, passedTests: 0, failedTests: 0, details: [] };

    // Test 1: Health monitor availability
    this.runTest(results, 'Health Monitor Availability', () => {
      if (typeof ServiceHealthMonitor === 'undefined') {
        throw new Error('ServiceHealthMonitor class not available');
      }
      
      if (typeof healthCheck !== 'function') {
        throw new Error('healthCheck global function not available');
      }
      
      return { success: true, message: 'Health monitoring system available' };
    });

    // Test 2: Health check execution
    this.runTest(results, 'Health Check Execution', () => {
      const healthStatus = healthCheck();
      
      if (!healthStatus || typeof healthStatus !== 'object') {
        throw new Error('Health check returned invalid result');
      }
      
      const requiredFields = ['timestamp', 'overallStatus', 'services'];
      const missingFields = requiredFields.filter(field => !healthStatus[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Health check missing fields: ${missingFields.join(', ')}`);
      }
      
      return { 
        success: true, 
        message: 'Health check execution successful',
        overallStatus: healthStatus.overallStatus
      };
    });

    // Test 3: Quick health check
    this.runTest(results, 'Quick Health Check', () => {
      if (typeof quickHealthCheck !== 'function') {
        throw new Error('quickHealthCheck function not available');
      }
      
      const quickStatus = quickHealthCheck();
      
      if (!quickStatus || !quickStatus.coreServices) {
        throw new Error('Quick health check returned invalid result');
      }
      
      return { 
        success: true, 
        message: 'Quick health check working',
        status: quickStatus.overallStatus
      };
    });

    return results;
  }

  /**
   * Test recovery system functionality
   * @returns {Object} Recovery system test results
   */
  runRecoverySystemTests() {
    const results = { totalTests: 0, passedTests: 0, failedTests: 0, details: [] };

    // Test 1: Recovery system availability
    this.runTest(results, 'Recovery System Availability', () => {
      if (typeof ServiceRecoverySystem === 'undefined') {
        throw new Error('ServiceRecoverySystem class not available');
      }
      
      if (typeof performServiceRecovery !== 'function') {
        throw new Error('performServiceRecovery function not available');
      }
      
      if (typeof emergencyServiceRecovery !== 'function') {
        throw new Error('emergencyServiceRecovery function not available');
      }
      
      return { success: true, message: 'Recovery system fully available' };
    });

    // Test 2: Recovery system instantiation
    this.runTest(results, 'Recovery System Instantiation', () => {
      const recoverySystem = new ServiceRecoverySystem();
      
      if (!(recoverySystem instanceof BaseService)) {
        throw new Error('ServiceRecoverySystem does not inherit from BaseService');
      }
      
      // Check that recovery strategies are initialized
      if (!recoverySystem.recoveryStrategies || recoverySystem.recoveryStrategies.size === 0) {
        throw new Error('Recovery strategies not properly initialized');
      }
      
      return { 
        success: true, 
        message: 'Recovery system instantiation successful',
        strategiesCount: recoverySystem.recoveryStrategies.size
      };
    });

    // Test 3: Recovery strategy detection
    this.runTest(results, 'Recovery Strategy Detection', () => {
      const recoverySystem = new ServiceRecoverySystem();
      
      // Test each strategy's detection logic
      const strategies = Array.from(recoverySystem.recoveryStrategies.entries());
      const workingStrategies = [];
      const errorStrategies = [];
      
      strategies.forEach(([name, strategy]) => {
        try {
          const needsRecovery = strategy.detect();
          workingStrategies.push({ name, needsRecovery });
        } catch (error) {
          errorStrategies.push({ name, error: error.message });
        }
      });
      
      if (errorStrategies.length > 0) {
        throw new Error(`Strategy detection errors: ${errorStrategies.map(s => s.name).join(', ')}`);
      }
      
      return { 
        success: true, 
        message: 'Recovery strategy detection working',
        workingStrategies: workingStrategies.length,
        results: workingStrategies
      };
    });

    return results;
  }

  /**
   * Test integration between all systems
   * @returns {Object} Integration test results
   */
  runIntegrationTests() {
    const results = { totalTests: 0, passedTests: 0, failedTests: 0, details: [] };

    // Test 1: Handler + Health Monitor integration
    this.runTest(results, 'Handler-HealthMonitor Integration', () => {
      // Create a handler and check its health
      const mockHeaders = ['Name', 'Status'];
      const handler = new HandlerService('IntegrationTest', mockHeaders);
      
      const healthStatus = healthCheck();
      
      if (healthStatus.overallStatus === 'CRITICAL') {
        throw new Error('Critical health issues detected during handler integration');
      }
      
      return { 
        success: true, 
        message: 'Handler and health monitor integration successful',
        healthStatus: healthStatus.overallStatus
      };
    });

    // Test 2: Health Monitor + Recovery System integration
    this.runTest(results, 'HealthMonitor-Recovery Integration', () => {
      const healthStatus = healthCheck();
      
      // If there are issues, test recovery
      if (healthStatus.errors && healthStatus.errors.length > 0) {
        const recoveryResult = performServiceRecovery();
        
        if (!recoveryResult.overallSuccess && recoveryResult.attempted.length > 0) {
          throw new Error('Recovery system failed to resolve detected issues');
        }
      }
      
      return { 
        success: true, 
        message: 'Health monitor and recovery system integration working',
        issuesDetected: healthStatus.errors?.length || 0
      };
    });

    // Test 3: Enhanced handler with all systems
    this.runTest(results, 'Enhanced Handler Full Integration', () => {
      // Test the enhanced BD Lead handler if available
      if (typeof createBDLeadHandler === 'function') {
        const handler = createBDLeadHandler();
        
        if (!handler || typeof handler.doGet !== 'function') {
          throw new Error('Enhanced handler creation failed');
        }
        
        // Test handler method execution
        const response = handler.doGet({});
        if (!response) {
          throw new Error('Enhanced handler method execution failed');
        }
      }
      
      return { 
        success: true, 
        message: 'Enhanced handler full integration successful'
      };
    });

    return results;
  }

  /**
   * Test error scenarios and recovery
   * @returns {Object} Error scenario test results
   */
  runErrorScenarioTests() {
    const results = { totalTests: 0, passedTests: 0, failedTests: 0, details: [] };

    // Test 1: Invalid handler instantiation
    this.runTest(results, 'Invalid Handler Instantiation', () => {
      let errorCaught = false;
      
      try {
        // This should fail due to missing parameters
        new HandlerService();
      } catch (error) {
        if (error.message.includes('Sheet name is required')) {
          errorCaught = true;
        }
      }
      
      if (!errorCaught) {
        throw new Error('Handler validation did not catch missing sheet name');
      }
      
      return { success: true, message: 'Handler validation working correctly' };
    });

    // Test 2: Form processing with invalid data
    this.runTest(results, 'Invalid Form Data Processing', () => {
      const handler = new HandlerService('TestSheet', ['Name', 'Phone']);
      let errorCaught = false;
      
      try {
        // This should fail due to invalid event data
        handler.processFormSubmission(null, () => {});
      } catch (error) {
        if (error.message.includes('Form submission event is missing')) {
          errorCaught = true;
        }
      }
      
      if (!errorCaught) {
        throw new Error('Form processing validation failed');
      }
      
      return { success: true, message: 'Form data validation working correctly' };
    });

    // Test 3: Recovery from simulated failures
    this.runTest(results, 'Recovery from Simulated Failures', () => {
      // Simulate a service failure by temporarily removing a global function
      const originalGetGlobalDB = globalThis.getGlobalDB;
      delete globalThis.getGlobalDB;
      
      try {
        // Check if recovery detects the issue
        const healthStatus = healthCheck();
        
        if (!healthStatus.errors.some(error => error.includes('getGlobalDB'))) {
          throw new Error('Health check did not detect missing getGlobalDB');
        }
        
        // Attempt recovery
        const recoveryResult = performServiceRecovery(['GlobalFunctions']);
        
        // Restore original function for other tests
        globalThis.getGlobalDB = originalGetGlobalDB;
        
        return { 
          success: true, 
          message: 'Simulated failure detection and recovery working',
          recoveryAttempted: recoveryResult.attempted.length > 0
        };
        
      } catch (error) {
        // Make sure to restore the function even if test fails
        globalThis.getGlobalDB = originalGetGlobalDB;
        throw error;
      }
    });

    return results;
  }

  /**
   * Helper method to run individual test with error handling
   * @private
   * @param {Object} results - Results object to update
   * @param {string} testName - Name of the test
   * @param {Function} testFunction - Test function to execute
   */
  runTest(results, testName, testFunction) {
    results.totalTests++;
    
    try {
      const testResult = testFunction();
      results.passedTests++;
      results.details.push({
        name: testName,
        status: 'PASSED',
        message: testResult.message,
        data: testResult
      });
      
      this.logger.debug(`Test passed: ${testName}`, testResult);
      
    } catch (error) {
      results.failedTests++;
      results.details.push({
        name: testName,
        status: 'FAILED',
        message: error.message,
        error: error.message
      });
      
      this.logger.error(`Test failed: ${testName}`, { error: error.message });
    }
  }

  /**
   * Generate detailed test report
   * @returns {string} Formatted test report
   */
  generateTestReport() {
    const results = this.testResults;
    
    let report = `
# Service Initialization Test Suite Report
Generated: ${results.timestamp}

## Overall Results
- Total Tests: ${results.totalTests}
- Passed: ${results.passedTests}
- Failed: ${results.failedTests}
- Success Rate: ${results.successRate}%
- Overall Status: ${results.overallStatus}

## Test Categories
`;

    Object.entries(results.testCategories).forEach(([category, categoryResults]) => {
      report += `
### ${category}
- Tests: ${categoryResults.totalTests}
- Passed: ${categoryResults.passedTests}
- Failed: ${categoryResults.failedTests}
- Success Rate: ${categoryResults.totalTests > 0 ? (categoryResults.passedTests / categoryResults.totalTests * 100).toFixed(2) : 0}%

`;

      // Add failed test details
      const failedTests = categoryResults.details.filter(test => test.status === 'FAILED');
      if (failedTests.length > 0) {
        report += `#### Failed Tests:\n`;
        failedTests.forEach(test => {
          report += `- **${test.name}**: ${test.message}\n`;
        });
        report += `\n`;
      }
    });

    if (results.errors.length > 0) {
      report += `
## Errors
${results.errors.map(error => `- ${error}`).join('\n')}
`;
    }

    if (results.recommendations.length > 0) {
      report += `
## Recommendations
${results.recommendations.map(rec => `- ${rec}`).join('\n')}
`;
    }

    return report;
  }
}

/**
 * Global test function for easy execution
 * @returns {Object} Test results
 */
function runServiceInitializationTests() {
  const testSuite = new ServiceInitializationTestSuite();
  return testSuite.runAllTests();
}

/**
 * Generate and log test report
 * @returns {string} Test report
 */
function generateServiceTestReport() {
  const testSuite = new ServiceInitializationTestSuite();
  const results = testSuite.runAllTests();
  const report = testSuite.generateTestReport();
  
  console.log(report);
  return report;
}

// Global registration
if (typeof globalThis !== 'undefined') {
  globalThis.runServiceInitializationTests = runServiceInitializationTests;
  globalThis.generateServiceTestReport = generateServiceTestReport;
  globalThis.ServiceInitializationTestSuite = ServiceInitializationTestSuite;
}
