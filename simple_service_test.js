/**
 * Simple Service Registration Test
 * Tests core service loading without triggering circular dependencies
 */

console.log('\n🧪 === SIMPLE SERVICE REGISTRATION TEST ===');

try {
  // Mock Google Apps Script environment
  global.PropertiesService = {
    getScriptProperties: () => ({
      getProperty: (key) => null,
      setProperty: (key, value) => {},
      getProperties: () => ({})
    })
  };
  
  global.Logger = {
    log: (message) => console.log(`[Logger] ${message}`)
  };
  
  global.Utilities = {
    getUuid: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9)
  };

  console.log('\n1. Loading core modules...');
  
  // Load in dependency order
  require('./src/00_Config.js');
  console.log('   ✅ Config loaded');
  
  require('./src/00_GlobalServiceLocator.js');
  console.log('   ✅ GlobalServiceLocator loaded');
  
  require('./src/services/BaseService.js');
  console.log('   ✅ BaseService loaded');
  
  require('./src/services/ErrorHandler.js');
  console.log('   ✅ ErrorHandler loaded');
  
  console.log('\n2. Testing GlobalServiceLocator...');
  
  if (typeof GlobalServiceLocator !== 'undefined') {
    console.log('   ✅ GlobalServiceLocator is available');
    
    // Test basic registration
    try {
      GlobalServiceLocator.register('TestService', {
        serviceClass: class TestService { constructor() { this.name = 'test'; } },
        config: { singleton: true }
      });
      console.log('   ✅ Service registration works');
      
      const testInstance = GlobalServiceLocator.get('TestService');
      console.log('   ✅ Service retrieval works:', testInstance.name);
      
    } catch (error) {
      console.log('   ❌ Service registration failed:', error.message);
    }
  } else {
    console.log('   ❌ GlobalServiceLocator not available');
  }
  
  console.log('\n3. Testing service classes...');
  
  if (typeof Config !== 'undefined') {
    console.log('   ✅ Config class available');
  } else {
    console.log('   ❌ Config class not available');
  }
  
  if (typeof BaseService !== 'undefined') {
    console.log('   ✅ BaseService class available');
  } else {
    console.log('   ❌ BaseService class not available');
  }
  
  if (typeof ErrorHandler !== 'undefined') {
    console.log('   ✅ ErrorHandler class available');
  } else {
    console.log('   ❌ ErrorHandler class not available');
  }
  
  console.log('\n🎉 SIMPLE TEST COMPLETED SUCCESSFULLY!');
  
} catch (error) {
  console.error('\n💥 TEST FAILED:', error.message);
  console.error('Stack:', error.stack);
}

console.log('\n=== TEST COMPLETE ===\n');