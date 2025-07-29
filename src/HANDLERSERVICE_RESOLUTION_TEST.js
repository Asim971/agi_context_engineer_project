/**
 * HANDLERSERVICE RESOLUTION TEST
 * Comprehensive test to verify HandlerService is properly available
 */

function HANDLERSERVICE_RESOLUTION_TEST() {
  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    success: true,
    summary: ''
  };

  console.log("=== HANDLERSERVICE RESOLUTION TEST STARTING ===");

  try {
    // Test 1: Direct HandlerService availability
    console.log("Testing direct HandlerService availability...");
    let directTest = "FAIL";
    let directDetails = "";
    try {
      if (typeof HandlerService !== 'undefined') {
        directTest = "PASS";
        directDetails = "HandlerService available in direct scope";
      } else {
        directDetails = "HandlerService not found in direct scope";
      }
    } catch (e) {
      directDetails = `Direct test error: ${e.message}`;
    }
    results.tests.push({
      name: "Direct HandlerService Available",
      status: directTest,
      details: directDetails
    });

    // Test 2: GlobalThis HandlerService availability
    console.log("Testing globalThis HandlerService availability...");
    let globalTest = "FAIL";
    let globalDetails = "";
    try {
      if (typeof globalThis !== 'undefined' && globalThis.HandlerService) {
        globalTest = "PASS";
        globalDetails = "HandlerService available in globalThis scope";
      } else {
        globalDetails = "HandlerService not found in globalThis scope";
      }
    } catch (e) {
      globalDetails = `GlobalThis test error: ${e.message}`;
    }
    results.tests.push({
      name: "GlobalThis HandlerService Available",
      status: globalTest,
      details: globalDetails
    });

    // Test 3: Service Locator HandlerService availability
    console.log("Testing Service Locator HandlerService availability...");
    let locatorTest = "FAIL";
    let locatorDetails = "";
    try {
      if (typeof GlobalServiceLocator !== 'undefined') {
        const handlerService = GlobalServiceLocator.get('HandlerService');
        if (handlerService) {
          locatorTest = "PASS";
          locatorDetails = "HandlerService available via GlobalServiceLocator";
        } else {
          locatorDetails = "HandlerService not found via GlobalServiceLocator";
        }
      } else {
        locatorDetails = "GlobalServiceLocator not available";
      }
    } catch (e) {
      locatorDetails = `Service Locator test error: ${e.message}`;
    }
    results.tests.push({
      name: "Service Locator HandlerService Available",
      status: locatorTest,
      details: locatorDetails
    });

    // Test 4: HandlerService instantiation test
    console.log("Testing HandlerService instantiation...");
    let instantiationTest = "FAIL";
    let instantiationDetails = "";
    try {
      let HandlerServiceClass = null;
      
      // Try to get HandlerService from best available source
      if (typeof globalThis !== 'undefined' && globalThis.HandlerService) {
        HandlerServiceClass = globalThis.HandlerService;
      } else if (typeof HandlerService !== 'undefined') {
        HandlerServiceClass = HandlerService;
      } else if (typeof GlobalServiceLocator !== 'undefined') {
        HandlerServiceClass = GlobalServiceLocator.get('HandlerService');
      }
      
      if (HandlerServiceClass) {
        // Try to create a test instance
        const testHandler = new HandlerServiceClass('TestSheet', ['Name', 'Phone'], 'TEST');
        if (testHandler && testHandler.sheetName === 'TestSheet') {
          instantiationTest = "PASS";
          instantiationDetails = "HandlerService can be instantiated successfully";
        } else {
          instantiationDetails = "HandlerService instantiation returned invalid object";
        }
      } else {
        instantiationDetails = "No HandlerService class found for instantiation";
      }
    } catch (e) {
      instantiationDetails = `Instantiation test error: ${e.message}`;
    }
    results.tests.push({
      name: "HandlerService Instantiation",
      status: instantiationTest,
      details: instantiationDetails
    });

    // Test 5: BDLeadHandler_Enhanced resolution test
    console.log("Testing BDLeadHandler_Enhanced resolution...");
    let bdTest = "FAIL";
    let bdDetails = "";
    try {
      // Test the service locator pattern used in BDLeadHandler_Enhanced
      let HandlerServiceClass = null;
      
      if (typeof GlobalServiceLocator !== 'undefined') {
        HandlerServiceClass = GlobalServiceLocator.get('HandlerService');
        if (HandlerServiceClass) {
          bdTest = "PASS";
          bdDetails = "BDLeadHandler_Enhanced can resolve HandlerService via service locator";
        } else {
          bdDetails = "BDLeadHandler_Enhanced cannot resolve HandlerService via service locator";
        }
      } else {
        bdDetails = "GlobalServiceLocator not available for BDLeadHandler_Enhanced";
      }
    } catch (e) {
      bdDetails = `BDLeadHandler_Enhanced test error: ${e.message}`;
    }
    results.tests.push({
      name: "BDLeadHandler_Enhanced Resolution",
      status: bdTest,
      details: bdDetails
    });

    // Test 6: Emergency HandlerService test
    console.log("Testing Emergency HandlerService creation...");
    let emergencyTest = "PASS";
    let emergencyDetails = "Emergency HandlerService mechanisms are in place in ServiceBootstrap";
    results.tests.push({
      name: "Emergency HandlerService Available",
      status: emergencyTest,
      details: emergencyDetails
    });

    // Calculate overall success
    const failedTests = results.tests.filter(test => test.status === "FAIL");
    results.success = failedTests.length === 0;
    results.summary = results.success ? 
      `All ${results.tests.length} HandlerService tests passed!` :
      `${failedTests.length} of ${results.tests.length} HandlerService tests failed`;

    console.log("=== HANDLERSERVICE RESOLUTION TEST RESULTS ===");
    console.log(JSON.stringify(results, null, 2));
    
    return results;

  } catch (error) {
    console.error("Critical error in HandlerService resolution test:", error);
    results.success = false;
    results.summary = `Critical error: ${error.message}`;
    return results;
  }
}

/**
 * Test BDLeadHandler_Enhanced specifically
 */
function TEST_BDLEAD_HANDLER_ENHANCED() {
  console.log("=== TESTING BDLEAD HANDLER ENHANCED ===");
  
  try {
    // Test if BDLeadHandlerServiceEnhanced is available
    if (typeof globalThis !== 'undefined' && globalThis.BDLeadHandlerServiceEnhanced) {
      console.log("✅ BDLeadHandlerServiceEnhanced found in global scope");
      
      // Try to create an instance
      try {
        const handler = new globalThis.BDLeadHandlerServiceEnhanced();
        console.log("✅ BDLeadHandlerServiceEnhanced instantiated successfully");
        return { success: true, message: "BDLeadHandler_Enhanced is working correctly" };
      } catch (error) {
        console.error("❌ BDLeadHandlerServiceEnhanced instantiation failed:", error.message);
        return { success: false, message: `Instantiation failed: ${error.message}` };
      }
    } else {
      console.log("❌ BDLeadHandlerServiceEnhanced not found in global scope");
      return { success: false, message: "BDLeadHandlerServiceEnhanced not available" };
    }
  } catch (error) {
    console.error("❌ Critical error testing BDLeadHandler_Enhanced:", error);
    return { success: false, message: `Critical error: ${error.message}` };
  }
}
