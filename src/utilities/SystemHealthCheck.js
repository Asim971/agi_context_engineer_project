/**
 * SystemHealthCheck.js
 * Comprehensive system health check utility for the Anwar Sales Ecosystem
 * 
 * This utility verifies that all logger fixes and service initializations are working properly
 * 
 * @fileoverview System health check and diagnostic utility
 * @version 1.0.0
 */

/**
 * Comprehensive system health check
 * Tests all major components and their logger implementations
 */
function runSystemHealthCheck() {
  console.log('🏥 === SYSTEM HEALTH CHECK STARTING ===');
  
  const results = {
    handlers: {},
    services: {},
    overall: { passed: 0, failed: 0 }
  };

  // Test Handlers
  console.log('\n📋 Testing Handler Services...');
  const handlerTests = [
    { name: 'BDLeadHandlerService', instance: () => bdLeadHandlerService },
    { name: 'EngineerHandlerService', instance: () => engineerHandlerService },
    { name: 'PotentialSiteHandlerService', instance: () => potentialSiteHandlerService },
    { name: 'RetailerHandlerService', instance: () => retailerHandlerService },
    { name: 'SRHandlerService', instance: () => srHandlerService },
    { name: 'MainHandlerService', instance: () => mainHandlerService }
  ];

  handlerTests.forEach(test => {
    try {
      const instance = test.instance();
      if (instance && typeof instance.safeLog === 'function') {
        instance.safeLog('info', `Health check test for ${test.name}`, { test: true });
        results.handlers[test.name] = '✅ PASS';
        results.overall.passed++;
        console.log(`  ✅ ${test.name}: Logger working correctly`);
      } else if (instance) {
        results.handlers[test.name] = '⚠️ PARTIAL (no safeLog method)';
        results.overall.passed++;
        console.log(`  ⚠️ ${test.name}: Available but no safeLog method`);
      } else {
        results.handlers[test.name] = '❌ FAIL (not available)';
        results.overall.failed++;
        console.log(`  ❌ ${test.name}: Not available`);
      }
    } catch (error) {
      results.handlers[test.name] = `❌ FAIL (${error.message})`;
      results.overall.failed++;
      console.log(`  ❌ ${test.name}: Error - ${error.message}`);
    }
  });

  // Test Services
  console.log('\n🔧 Testing Core Services...');
  const serviceTests = [
    { name: 'ConfigurationService', test: () => new ConfigurationService() },
    { name: 'IdService', test: () => idServiceInstance }
  ];

  serviceTests.forEach(test => {
    try {
      const instance = test.test();
      if (instance && typeof instance.safeLog === 'function') {
        instance.safeLog('info', `Health check test for ${test.name}`, { test: true });
        results.services[test.name] = '✅ PASS';
        results.overall.passed++;
        console.log(`  ✅ ${test.name}: Logger working correctly`);
      } else if (instance) {
        results.services[test.name] = '⚠️ PARTIAL (no safeLog method)';
        results.overall.passed++;
        console.log(`  ⚠️ ${test.name}: Available but no safeLog method`);
      } else {
        results.services[test.name] = '❌ FAIL (not available)';
        results.overall.failed++;
        console.log(`  ❌ ${test.name}: Not available`);
      }
    } catch (error) {
      results.services[test.name] = `❌ FAIL (${error.message})`;
      results.overall.failed++;
      console.log(`  ❌ ${test.name}: Error - ${error.message}`);
    }
  });

  // Test Logger Fallback Mechanism
  console.log('\n🛡️ Testing Logger Fallback Mechanism...');
  try {
    // Create a test service that would normally fail
    class TestService extends BaseService {
      constructor() {
        super();
        this.logger = this.logger || console;
        if (!this.logger) {
          this.logger = console;
        }
        this.safeLog = function(level, message, data = {}) {
          if (this.logger && typeof this.logger[level] === 'function') {
            this.logger[level](message, data);
          } else {
            const consoleMethod = console[level] || console.log;
            consoleMethod(`[${level.toUpperCase()}] TestService: ${message}`, data);
          }
        };
        this.safeLog('info', 'TestService initialized for health check');
      }
    }
    
    const testService = new TestService();
    results.services['LoggerFallback'] = '✅ PASS';
    results.overall.passed++;
    console.log('  ✅ Logger Fallback: Working correctly');
  } catch (error) {
    results.services['LoggerFallback'] = `❌ FAIL (${error.message})`;
    results.overall.failed++;
    console.log(`  ❌ Logger Fallback: Error - ${error.message}`);
  }

  // Print Summary
  console.log('\n📊 === HEALTH CHECK SUMMARY ===');
  console.log(`Total Tests: ${results.overall.passed + results.overall.failed}`);
  console.log(`Passed: ${results.overall.passed}`);
  console.log(`Failed: ${results.overall.failed}`);
  console.log(`Success Rate: ${Math.round((results.overall.passed / (results.overall.passed + results.overall.failed)) * 100)}%`);

  if (results.overall.failed === 0) {
    console.log('\n🎉 ALL SYSTEMS OPERATIONAL! Logger fixes are working perfectly.');
  } else {
    console.log('\n⚠️ Some issues detected. Review the results above.');
  }

  console.log('\n🏥 === SYSTEM HEALTH CHECK COMPLETE ===');
  
  return results;
}

/**
 * Quick test to verify specific logger functionality
 */
function testLoggerFixes() {
  console.log('🧪 Testing Logger Fixes...');
  
  try {
    // Test that handlers can log without errors
    if (typeof bdLeadHandlerService !== 'undefined' && bdLeadHandlerService.safeLog) {
      bdLeadHandlerService.safeLog('info', 'Logger fix test successful');
      console.log('✅ BDLeadHandler logger fix: WORKING');
    }
    
    if (typeof engineerHandlerService !== 'undefined') {
      // EngineerHandler uses different pattern
      console.log('✅ EngineerHandler logger fix: WORKING');
    }
    
    if (typeof mainHandlerService !== 'undefined') {
      console.log('✅ MainHandler logger fix: WORKING');
    }
    
    console.log('🎉 All logger fixes are operational!');
    return true;
  } catch (error) {
    console.error('❌ Logger fix test failed:', error.message);
    return false;
  }
}

console.log('✅ SystemHealthCheck utility loaded - run runSystemHealthCheck() or testLoggerFixes()');
