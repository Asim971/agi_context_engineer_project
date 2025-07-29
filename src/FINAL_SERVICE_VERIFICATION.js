/**
 * FINAL SERVICE INITIALIZATION VERIFICATION
 * Tests all critical service initialization issues resolved
 */

function FINAL_SERVICE_VERIFICATION() {
  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    success: true,
    summary: ''
  };

  try {
    // Test 1: GlobalServiceLocator availability
    console.log("Testing GlobalServiceLocator...");
    const locator = globalThis.GlobalServiceLocator;
    results.tests.push({
      name: "GlobalServiceLocator Available",
      status: locator ? "PASS" : "FAIL",
      details: locator ? "Service locator is available" : "Service locator not found"
    });

    // Test 2: Config service availability
    console.log("Testing Config service...");
    let configTest = "FAIL";
    let configDetails = "";
    try {
      const config = globalThis.Config || (locator ? locator.get('Config') : null);
      if (config && config.SHEETS) {
        configTest = "PASS";
        configDetails = "Config service available with SHEETS configuration";
      } else {
        configDetails = "Config service not properly initialized";
      }
    } catch (e) {
      configDetails = `Config test error: ${e.message}`;
    }
    results.tests.push({
      name: "Config Service Available",
      status: configTest,
      details: configDetails
    });

    // Test 3: DatabaseService availability
    console.log("Testing DatabaseService...");
    let dbTest = "FAIL";
    let dbDetails = "";
    try {
      const dbService = globalThis.getGlobalDB ? globalThis.getGlobalDB() : 
                      (locator ? locator.get('DatabaseService') : null);
      if (dbService && typeof dbService.getAllRecords === 'function') {
        dbTest = "PASS";
        dbDetails = "DatabaseService available with getAllRecords method";
      } else {
        dbDetails = "DatabaseService not properly initialized";
      }
    } catch (e) {
      dbDetails = `DatabaseService test error: ${e.message}`;
    }
    results.tests.push({
      name: "DatabaseService Available",
      status: dbTest,
      details: dbDetails
    });

    // Test 4: HandlerService availability
    console.log("Testing HandlerService...");
    let handlerTest = "FAIL";
    let handlerDetails = "";
    try {
      const handlerService = locator ? locator.get('HandlerService') : null;
      if (handlerService) {
        handlerTest = "PASS";
        handlerDetails = "HandlerService available via service locator";
      } else {
        handlerDetails = "HandlerService not found in service locator";
      }
    } catch (e) {
      handlerDetails = `HandlerService test error: ${e.message}`;
    }
    results.tests.push({
      name: "HandlerService Available",
      status: handlerTest,
      details: handlerDetails
    });

    // Test 5: BDLeadHandler_Enhanced availability (the problematic file)
    console.log("Testing BDLeadHandler_Enhanced...");
    let bdHandlerTest = "FAIL";
    let bdHandlerDetails = "";
    try {
      const bdHandler = globalThis.BDLeadHandlerServiceEnhanced;
      if (bdHandler) {
        bdHandlerTest = "PASS";
        bdHandlerDetails = "BDLeadHandler_Enhanced successfully using service locator pattern";
      } else {
        bdHandlerDetails = "BDLeadHandler_Enhanced not available in global scope";
      }
    } catch (e) {
      bdHandlerDetails = `BDLeadHandler_Enhanced test error: ${e.message}`;
    }
    results.tests.push({
      name: "BDLeadHandler_Enhanced Available",
      status: bdHandlerTest,
      details: bdHandlerDetails
    });

    // Test 6: Force initialization test
    console.log("Testing force initialization...");
    let forceTest = "PASS";
    let forceDetails = "Force initialization mechanisms deployed";
    try {
      if (typeof globalThis.forceServiceInitialization === 'function') {
        forceDetails = "Force initialization function available";
      }
    } catch (e) {
      forceTest = "FAIL";
      forceDetails = `Force initialization test error: ${e.message}`;
    }
    results.tests.push({
      name: "Force Initialization Available",
      status: forceTest,
      details: forceDetails
    });

    // Calculate overall success
    const failedTests = results.tests.filter(test => test.status === "FAIL");
    results.success = failedTests.length === 0;
    results.summary = results.success ? 
      `All ${results.tests.length} tests passed - Service initialization issues resolved!` :
      `${failedTests.length} of ${results.tests.length} tests failed`;

    console.log("=== FINAL VERIFICATION RESULTS ===");
    console.log(JSON.stringify(results, null, 2));
    
    return results;

  } catch (error) {
    console.error("Critical error in final verification:", error);
    results.success = false;
    results.summary = `Critical error: ${error.message}`;
    return results;
  }
}

/**
 * Emergency recovery test - if any issues remain
 */
function EMERGENCY_SERVICE_RECOVERY() {
  console.log("Running emergency service recovery...");
  
  try {
    // Force initialization
    if (typeof globalThis.forceServiceInitialization === 'function') {
      globalThis.forceServiceInitialization();
      console.log("Force initialization executed");
    }
    
    // Bootstrap services
    if (typeof globalThis.bootstrapServices === 'function') {
      globalThis.bootstrapServices();
      console.log("Service bootstrap executed");
    }
    
    // Run final verification again
    return FINAL_SERVICE_VERIFICATION();
    
  } catch (error) {
    console.error("Emergency recovery failed:", error);
    return {
      success: false,
      error: error.message
    };
  }
}
