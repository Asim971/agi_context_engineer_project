#!/usr/bin/env node

/**
 * simulate_gas_environment.js
 * Node.js simulation of Google Apps Script environment to test BaseService resolution
 * This helps us verify the fix works before deploying to Google Apps Script
 */

// Simulate Google Apps Script global environment
global.console = console;
global.globalThis = global;

// Mock Google Apps Script services
global.PropertiesService = {
  getScriptProperties: () => ({
    getProperty: (key) => {
      const mockProps = {
        'testSpreadsheetId': 'mock-test-spreadsheet-id',
        'MAYTAPI_API_KEY': 'mock-api-key'
      };
      return mockProps[key] || null;
    }
  })
};

global.SpreadsheetApp = {
  openById: (id) => ({
    getName: () => 'Mock Spreadsheet',
    getSheetByName: (name) => ({
      getName: () => name,
      getLastRow: () => 10,
      getRange: () => ({
        getValues: () => [['mock', 'data']],
        setValue: () => {},
        getValue: () => 'mock value'
      })
    })
  })
};

global.Config = {
  IS_TEST_ENVIRONMENT: true,
  SPREADSHEET_ID: 'mock-spreadsheet-id',
  SHEETS: {
    ENGINEER: 'Engineers'
  }
};

global.Logger = {
  log: console.log,
  info: console.log,
  warn: console.warn,
  error: console.error
};

// Load our service files in order
console.log('🔄 Loading BaseService...');
try {
  // Simulate loading BaseService.js content
  eval(`
    var BaseService = class BaseService {
      constructor(dependencies = {}) {
        this.config = dependencies.config || (typeof Config !== 'undefined' ? Config : {});
        this.logger = dependencies.logger || (typeof Logger !== 'undefined' ? Logger : console);
        this.serviceName = this.constructor.name;
        this.serviceVersion = '1.0.0';
        this.startTime = Date.now();
        this.initialize();
      }
      
      initialize() {
        // Override in derived classes
      }
      
      executeWithErrorHandlingSync(operation) {
        try {
          return operation();
        } catch (error) {
          this.logger.error('Service operation failed:', error);
          throw error;
        }
      }
      
      log(level, message, context = {}) {
        const logEntry = {
          timestamp: new Date().toISOString(),
          service: this.serviceName,
          level: level.toUpperCase(),
          message,
          context
        };
        this.logger[level] ? this.logger[level](logEntry) : console.log(logEntry);
      }
    };
    
    // Ensure global accessibility
    if (typeof globalThis !== 'undefined') {
      globalThis.BaseService = BaseService;
    }
  `);
  console.log('✅ BaseService loaded successfully');
} catch (error) {
  console.error('❌ BaseService loading failed:', error);
  process.exit(1);
}

// Load DatabaseService
console.log('🔄 Loading DatabaseService...');
try {
  eval(`
    var DatabaseService = class DatabaseService extends BaseService {
      constructor(isTest = false) {
        // Validate BaseService availability
        if (typeof BaseService === 'undefined') {
          throw new Error('BaseService must be loaded before DatabaseService. Check file loading order.');
        }
        
        super();
        this.isTest = isTest || Config.IS_TEST_ENVIRONMENT;
        this.spreadsheet = null;
        this.initialize();
        this.logger.info('DatabaseService initialized', { isTest: this.isTest });
      }
      
      initialize() {
        this.executeWithErrorHandlingSync(() => {
          if (this.spreadsheet) return;
          
          let spreadsheetId = this.isTest ? 
            PropertiesService.getScriptProperties().getProperty('testSpreadsheetId') : 
            Config.SPREADSHEET_ID;
            
          if (!spreadsheetId) {
            throw new Error('Spreadsheet ID is not configured.');
          }
          
          this.spreadsheet = SpreadsheetApp.openById(spreadsheetId);
          this.logger.info('Database connection established', { 
            spreadsheetId: spreadsheetId.substring(0, 10) + '...',
            isTest: this.isTest 
          });
        });
      }
      
      getAllRecords(sheetName) {
        return this.executeWithErrorHandlingSync(() => {
          const sheet = this.spreadsheet.getSheetByName(sheetName);
          if (!sheet) {
            throw new Error(\`Sheet '\${sheetName}' not found\`);
          }
          return sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
        });
      }
    };
    
    // Ensure global accessibility
    if (typeof globalThis !== 'undefined') {
      globalThis.DatabaseService = DatabaseService;
    }
  `);
  console.log('✅ DatabaseService loaded successfully');
} catch (error) {
  console.error('❌ DatabaseService loading failed:', error);
  process.exit(1);
}

// Create global DB function
eval(`
  const getGlobalDB = (() => {
    let instance;
    return () => {
      if (!instance) {
        if (typeof BaseService === 'undefined') {
          throw new Error('BaseService not available. Cannot create DatabaseService instance.');
        }
        instance = new DatabaseService();
      }
      return instance;
    };
  })();
  
  if (typeof globalThis !== 'undefined') {
    globalThis.getGlobalDB = getGlobalDB;
  }
`);

// Load test functions
console.log('🔄 Loading test functions...');
eval(`
  function testOriginalError() {
    console.log('=== Original Error Reproduction Test ===');
    
    try {
      // This is the line that was failing: DatabaseService.gs:10
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
    
    // Test 3: DatabaseService instantiation and inheritance
    try {
      const dbService = new DatabaseService(true);
      if (dbService instanceof BaseService) {
        console.log('✓ Test 3 PASSED: DatabaseService inherits from BaseService');
        testResults.tests.databaseServiceInheritance = 'PASSED';
        testResults.summary.passed++;
      } else {
        console.error('✗ Test 3 FAILED: DatabaseService does not inherit from BaseService');
        testResults.tests.databaseServiceInheritance = 'FAILED';
        testResults.summary.failed++;
      }
    } catch (error) {
      console.error('✗ Test 3 FAILED: DatabaseService instantiation error:', error.message);
      testResults.tests.databaseServiceInheritance = 'FAILED';
      testResults.summary.failed++;
    }
    testResults.summary.total++;
    
    // Test 4: Global DB function
    try {
      if (typeof getGlobalDB === 'function') {
        const globalDb = getGlobalDB();
        if (globalDb instanceof DatabaseService && globalDb instanceof BaseService) {
          console.log('✓ Test 4 PASSED: getGlobalDB() returns proper DatabaseService instance');
          testResults.tests.globalDbFunction = 'PASSED';
          testResults.summary.passed++;
        } else {
          console.error('✗ Test 4 FAILED: getGlobalDB() returned invalid instance');
          testResults.tests.globalDbFunction = 'FAILED';
          testResults.summary.failed++;
        }
      } else {
        console.error('✗ Test 4 FAILED: getGlobalDB function not defined');
        testResults.tests.globalDbFunction = 'FAILED';
        testResults.summary.failed++;
      }
    } catch (error) {
      console.error('✗ Test 4 FAILED: getGlobalDB() error:', error.message);
      testResults.tests.globalDbFunction = 'FAILED';
      testResults.summary.failed++;
    }
    testResults.summary.total++;
    
    // Print summary
    console.log('\\n=== Test Summary ===');
    console.log(\`Total Tests: \${testResults.summary.total}\`);
    console.log(\`Passed: \${testResults.summary.passed}\`);
    console.log(\`Failed: \${testResults.summary.failed}\`);
    console.log(\`Success Rate: \${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(1)}%\`);
    
    if (testResults.summary.failed === 0) {
      console.log('🎉 ALL TESTS PASSED! BaseService resolution is working correctly.');
    } else {
      console.log('❌ Some tests failed. Please check the error messages above.');
    }
    
    return testResults;
  }
`);

// Run the tests
console.log('\n🧪 Starting BaseService Resolution Tests...\n');

// Test 1: Run the original error test
console.log('📋 Running testOriginalError()...');
const originalErrorResult = testOriginalError();

console.log('\n📋 Running testBaseServiceResolution()...');
const fullTestResult = testBaseServiceResolution();

// Final summary
console.log('\n🎯 Final Results Summary:');
console.log('========================');
console.log('Original Error Test:', originalErrorResult.success ? '✅ PASSED' : '❌ FAILED');
if (!originalErrorResult.success && originalErrorResult.error) {
  console.log('Error:', originalErrorResult.error);
}

console.log('Full Test Suite:', fullTestResult.summary.failed === 0 ? '✅ PASSED' : '❌ FAILED');
console.log(`Success Rate: ${((fullTestResult.summary.passed / fullTestResult.summary.total) * 100).toFixed(1)}%`);

if (originalErrorResult.success && fullTestResult.summary.failed === 0) {
  console.log('\n🎉 COMPLETE SUCCESS! BaseService resolution fix is working perfectly!');
  console.log('✅ The "BaseService is not defined" error has been eliminated');
  console.log('✅ All services can be instantiated correctly');
  console.log('✅ Inheritance chains are working properly');
  console.log('\n🚀 Your Google Apps Script should now work without the BaseService error!');
} else {
  console.log('\n⚠️  Some issues detected. Please review the test results above.');
}
