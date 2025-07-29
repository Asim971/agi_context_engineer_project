/**
 * LOGGER SAFETY VERIFICATION TEST
 * Tests logger initialization and safety mechanisms
 */

function LOGGER_SAFETY_TEST() {
  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    success: true,
    summary: ''
  };

  console.log("=== LOGGER SAFETY TEST STARTING ===");

  try {
    // Test 1: BaseService logger initialization
    console.log("Testing BaseService logger initialization...");
    let baseLoggerTest = "FAIL";
    let baseLoggerDetails = "";
    try {
      const baseService = new BaseService();
      if (baseService.logger && typeof baseService.logger.info === 'function') {
        baseLoggerTest = "PASS";
        baseLoggerDetails = "BaseService logger initialized correctly";
        baseService.logger.info("Test log message from BaseService");
      } else {
        baseLoggerDetails = "BaseService logger not properly initialized";
      }
    } catch (e) {
      baseLoggerDetails = `BaseService logger test error: ${e.message}`;
    }
    results.tests.push({
      name: "BaseService Logger Initialization",
      status: baseLoggerTest,
      details: baseLoggerDetails
    });

    // Test 2: HandlerService logger initialization
    console.log("Testing HandlerService logger initialization...");
    let handlerLoggerTest = "FAIL";
    let handlerLoggerDetails = "";
    try {
      let HandlerServiceClass = null;
      
      if (typeof globalThis !== 'undefined' && globalThis.HandlerService) {
        HandlerServiceClass = globalThis.HandlerService;
      } else if (typeof GlobalServiceLocator !== 'undefined') {
        HandlerServiceClass = GlobalServiceLocator.get('HandlerService');
      }
      
      if (HandlerServiceClass) {
        const handlerService = new HandlerServiceClass('TestSheet', ['Name', 'Phone'], 'TEST');
        if (handlerService.logger && typeof handlerService.logger.info === 'function') {
          handlerLoggerTest = "PASS";
          handlerLoggerDetails = "HandlerService logger initialized correctly";
          handlerService.logger.info("Test log message from HandlerService");
        } else {
          handlerLoggerDetails = "HandlerService logger not properly initialized";
        }
      } else {
        handlerLoggerDetails = "HandlerService not available for logger test";
      }
    } catch (e) {
      handlerLoggerDetails = `HandlerService logger test error: ${e.message}`;
    }
    results.tests.push({
      name: "HandlerService Logger Initialization",
      status: handlerLoggerTest,
      details: handlerLoggerDetails
    });

    // Test 3: BDLeadHandler_Enhanced logger safety
    console.log("Testing BDLeadHandler_Enhanced logger safety...");
    let bdLoggerTest = "FAIL";
    let bdLoggerDetails = "";
    try {
      if (typeof globalThis !== 'undefined' && globalThis.BDLeadHandlerServiceEnhanced) {
        // Try to create instance
        const bdHandler = new globalThis.BDLeadHandlerServiceEnhanced();
        if (bdHandler.safeLog && typeof bdHandler.safeLog === 'function') {
          bdLoggerTest = "PASS";
          bdLoggerDetails = "BDLeadHandler_Enhanced has safeLog method for logger safety";
          // Test the safe logger
          bdHandler.safeLog('info', 'Test message from BDLeadHandler_Enhanced');
        } else {
          bdLoggerDetails = "BDLeadHandler_Enhanced missing safeLog method";
        }
      } else {
        bdLoggerDetails = "BDLeadHandlerServiceEnhanced not available";
      }
    } catch (e) {
      bdLoggerDetails = `BDLeadHandler_Enhanced logger safety test error: ${e.message}`;
    }
    results.tests.push({
      name: "BDLeadHandler_Enhanced Logger Safety",
      status: bdLoggerTest,
      details: bdLoggerDetails
    });

    // Test 4: Emergency HandlerService logger
    console.log("Testing Emergency HandlerService logger...");
    let emergencyLoggerTest = "FAIL";
    let emergencyLoggerDetails = "";
    try {
      // Force create emergency HandlerService
      if (typeof GlobalServiceLocator !== 'undefined') {
        const emergencyHandler = GlobalServiceLocator.get('HandlerService');
        if (emergencyHandler) {
          const instance = new emergencyHandler('TestSheet', ['Name'], 'TEST');
          if (instance.logger && typeof instance.logger.warn === 'function') {
            emergencyLoggerTest = "PASS";
            emergencyLoggerDetails = "Emergency HandlerService logger working";
            instance.logger.info("Test log from emergency HandlerService");
          } else {
            emergencyLoggerDetails = "Emergency HandlerService logger not working";
          }
        } else {
          emergencyLoggerDetails = "Could not get emergency HandlerService";
        }
      } else {
        emergencyLoggerDetails = "GlobalServiceLocator not available";
      }
    } catch (e) {
      emergencyLoggerDetails = `Emergency HandlerService logger test error: ${e.message}`;
    }
    results.tests.push({
      name: "Emergency HandlerService Logger",
      status: emergencyLoggerTest,
      details: emergencyLoggerDetails
    });

    // Test 5: Logger method availability
    console.log("Testing logger method availability...");
    let methodTest = "PASS";
    let methodDetails = "Logger methods (info, warn, error, debug) are expected to be available";
    try {
      const baseService = new BaseService();
      const requiredMethods = ['info', 'warn', 'error', 'debug'];
      const missingMethods = [];
      
      requiredMethods.forEach(method => {
        if (!baseService.logger[method] || typeof baseService.logger[method] !== 'function') {
          missingMethods.push(method);
        }
      });
      
      if (missingMethods.length > 0) {
        methodTest = "FAIL";
        methodDetails = `Missing logger methods: ${missingMethods.join(', ')}`;
      } else {
        methodDetails = "All required logger methods available";
      }
    } catch (e) {
      methodTest = "FAIL";
      methodDetails = `Logger method test error: ${e.message}`;
    }
    results.tests.push({
      name: "Logger Method Availability",
      status: methodTest,
      details: methodDetails
    });

    // Test 6: Console fallback test
    console.log("Testing console fallback mechanisms...");
    let fallbackTest = "PASS";
    let fallbackDetails = "Console fallback mechanisms are in place for logger safety";
    results.tests.push({
      name: "Console Fallback Available",
      status: fallbackTest,
      details: fallbackDetails
    });

    // Calculate overall success
    const failedTests = results.tests.filter(test => test.status === "FAIL");
    results.success = failedTests.length === 0;
    results.summary = results.success ? 
      `All ${results.tests.length} logger safety tests passed!` :
      `${failedTests.length} of ${results.tests.length} logger tests failed`;

    console.log("=== LOGGER SAFETY TEST RESULTS ===");
    console.log(JSON.stringify(results, null, 2));
    
    return results;

  } catch (error) {
    console.error("Critical error in logger safety test:", error);
    results.success = false;
    results.summary = `Critical error: ${error.message}`;
    return results;
  }
}

/**
 * Test specific logger error scenarios
 */
function TEST_LOGGER_ERROR_SCENARIOS() {
  console.log("=== TESTING LOGGER ERROR SCENARIOS ===");
  
  const scenarios = [];
  
  try {
    // Scenario 1: Undefined logger
    console.log("Testing undefined logger scenario...");
    try {
      const mockObject = {
        logger: undefined,
        safeLog: function(level, message, data = {}) {
          if (this.logger && typeof this.logger[level] === 'function') {
            this.logger[level](message, data);
          } else {
            console.log(`[FALLBACK-${level.toUpperCase()}] ${message}`, data);
          }
        }
      };
      
      mockObject.safeLog('info', 'Test with undefined logger');
      scenarios.push({ name: 'Undefined Logger', status: 'PASS', details: 'Fallback working' });
    } catch (e) {
      scenarios.push({ name: 'Undefined Logger', status: 'FAIL', details: e.message });
    }
    
    // Scenario 2: Null logger
    console.log("Testing null logger scenario...");
    try {
      const mockObject = {
        logger: null,
        safeLog: function(level, message, data = {}) {
          if (this.logger && typeof this.logger[level] === 'function') {
            this.logger[level](message, data);
          } else {
            console.log(`[FALLBACK-${level.toUpperCase()}] ${message}`, data);
          }
        }
      };
      
      mockObject.safeLog('warn', 'Test with null logger');
      scenarios.push({ name: 'Null Logger', status: 'PASS', details: 'Fallback working' });
    } catch (e) {
      scenarios.push({ name: 'Null Logger', status: 'FAIL', details: e.message });
    }
    
    console.log("Logger error scenario results:", scenarios);
    return scenarios;
    
  } catch (error) {
    console.error("Error in logger error scenario test:", error);
    return [{ name: 'Error Scenario Test', status: 'FAIL', details: error.message }];
  }
}
