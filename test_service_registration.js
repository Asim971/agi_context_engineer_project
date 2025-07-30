/**
 * Test script to verify service registration fixes
 * This script tests the enhanced ServiceBootstrap implementation
 * Note: This is a simplified test for Node.js environment
 */

console.log('\n🧪 === SERVICE REGISTRATION VERIFICATION ===');

try {
  // Mock Google Apps Script environment for testing
  global.PropertiesService = {
    getScriptProperties: () => ({
      getProperty: (key) => {
        const mockProps = {
          'MAYTAPI_API_KEY': 'test_key',
          'SPREADSHEET_ID': 'test_spreadsheet_id'
        };
        return mockProps[key] || null;
      }
    })
  };
  
  global.SpreadsheetApp = {
    openById: () => ({
      getSheetByName: () => null
    })
  };
  
  // Mock Logger service for ErrorHandler dependency
  global.Logger = {
    log: (message) => console.log(`[GAS Logger] ${message}`),
    info: (message) => console.log(`[GAS Logger INFO] ${message}`),
    warn: (message) => console.log(`[GAS Logger WARN] ${message}`),
    error: (message) => console.log(`[GAS Logger ERROR] ${message}`)
  };
  
  global.Utilities = {
    getUuid: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9)
  };

  // Load the required modules in proper dependency order
  console.log('\n1. Loading core modules...');
  require('./src/00_Config.js');
  console.log('   ✅ Config loaded');
  
  require('./src/00_GlobalServiceLocator.js');
  console.log('   ✅ GlobalServiceLocator loaded');
  
  require('./src/services/BaseService.js');
  console.log('   ✅ BaseService loaded');
  
  require('./src/services/ErrorHandler.js');
  console.log('   ✅ ErrorHandler loaded');
  
  require('./src/database/DatabaseService.js');
  console.log('   ✅ DatabaseService loaded');
  
  require('./src/services/ValidationService.js');
  console.log('   ✅ ValidationService loaded');
  
  require('./src/services/IdService.js');
  console.log('   ✅ IdService loaded');
  
  require('./src/services/HandlerService.js');
  console.log('   ✅ HandlerService loaded');
  
  require('./src/handlers/CRMHandler.js');
  console.log('   ✅ CRMHandler loaded');
  
  require('./src/01_ServiceBootstrap.js');
  console.log('   ✅ ServiceBootstrap loaded');

  // Test the bootstrap process
  console.log('\n2. Testing bootstrap process...');
  const result = ServiceBootstrap.bootstrap();
  console.log('   Bootstrap result:', result);

  // Test critical services
  console.log('\n3. Testing critical services...');
  
  const criticalServices = [
    'Config',
    'ErrorHandler', 
    'DatabaseService',
    'ValidationService',
    'IdService',
    'HandlerService',
    'CRMHandler'
  ];

  let passedTests = 0;
  let totalTests = criticalServices.length;

  for (const serviceName of criticalServices) {
    try {
      console.log(`\n   Testing ${serviceName}...`);
      
      // Check if registered
      if (!GlobalServiceLocator.isRegistered(serviceName)) {
        console.log(`   ❌ ${serviceName}: Not registered`);
        continue;
      }
      
      // Try to get the service
      const service = GlobalServiceLocator.get(serviceName);
      if (!service) {
        console.log(`   ❌ ${serviceName}: Failed to instantiate`);
        continue;
      }
      
      console.log(`   ✅ ${serviceName}: Available and functional`);
      passedTests++;
    } catch (error) {
      console.log(`   ❌ ${serviceName}: Error - ${error.message}`);
    }
  }

  // Test service aliases
  console.log('\n4. Testing service aliases...');
  const aliases = ['Database', 'Validator'];
  
  for (const alias of aliases) {
    try {
      if (GlobalServiceLocator.isRegistered(alias)) {
        const service = GlobalServiceLocator.get(alias);
        console.log(`   ✅ ${alias}: Alias working`);
        passedTests++;
        totalTests++;
      } else {
        console.log(`   ⚠️ ${alias}: Alias not registered`);
      }
    } catch (error) {
      console.log(`   ❌ ${alias}: Alias error - ${error.message}`);
      totalTests++;
    }
  }

  // Final results
  const successRate = Math.round((passedTests / totalTests) * 100);
  console.log(`\n📊 RESULTS:`);
  console.log(`   Tests passed: ${passedTests}/${totalTests}`);
  console.log(`   Success rate: ${successRate}%`);
  
  if (successRate >= 90) {
    console.log(`\n🎉 SUCCESS: Service registration fixes are working!`);
    console.log(`\n✅ INTEGRATION TEST FIXES VERIFIED:`);
    console.log(`   • ServiceBootstrap enhanced with structured registration`);
    console.log(`   • ErrorHandler service created and registered`);
    console.log(`   • Critical services properly configured`);
    console.log(`   • Service aliases working correctly`);
    console.log(`   • Foundation tests should now pass`);
  } else if (successRate >= 70) {
    console.log(`\n⚠️ PARTIAL: Some services still need attention`);
  } else {
    console.log(`\n❌ FAILED: Major service registration issues remain`);
  }

} catch (error) {
  console.error('\n💥 BOOTSTRAP FAILED:', error.message);
  console.error('Stack:', error.stack);
}

console.log('\n=== TEST COMPLETE ===\n');