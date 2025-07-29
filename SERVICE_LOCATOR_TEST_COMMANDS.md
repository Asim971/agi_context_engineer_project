# Google Apps Script Service Locator Test Commands

## **🚨 Service Initialization Troubleshooter Agent - Test Commands**

Run these commands in the Google Apps Script console to test and verify the service locator system.

### **Phase 1: Diagnostic Check**

```javascript
// Complete diagnostic and repair workflow
const result = ServiceDiagnosticRepair.fullRepair();
console.log("=== DIAGNOSTIC SUMMARY ===");
console.log("Status:", result.summary.status);
console.log("Critical Issues:", result.summary.criticalIssues);
console.log("Automatic Repairs:", result.summary.automaticRepairs);
console.log("Manual Steps Required:", result.summary.manualStepsRequired);
```

### **Phase 2: Service Locator Verification**

```javascript
// Test GlobalServiceLocator availability
console.log("GlobalServiceLocator available:", typeof GlobalServiceLocator !== 'undefined');

// Check service registry status
if (typeof GlobalServiceLocator !== 'undefined') {
  const status = GlobalServiceLocator.getStatus();
  console.log("Service Registry Status:", status);
}

// Test ServiceBootstrap
console.log("ServiceBootstrap available:", typeof ServiceBootstrap !== 'undefined');
```

### **Phase 3: Core Service Testing**

```javascript
// Test Config service access
try {
  console.log("=== CONFIG SERVICE TEST ===");
  const config = GlobalServiceLocator.get('Config');
  console.log("✅ Config accessible via ServiceLocator");
  console.log("Config.IS_TEST_ENVIRONMENT:", config.IS_TEST_ENVIRONMENT);
} catch (error) {
  console.error("❌ Config access failed:", error.message);
}

// Test DatabaseService access
try {
  console.log("=== DATABASE SERVICE TEST ===");
  const db = GlobalServiceLocator.get('DatabaseService');
  console.log("✅ DatabaseService accessible via ServiceLocator");
  console.log("DatabaseService type:", typeof db);
} catch (error) {
  console.error("❌ DatabaseService access failed:", error.message);
}

// Test HandlerService class access
try {
  console.log("=== HANDLER SERVICE TEST ===");
  const HandlerServiceClass = GlobalServiceLocator.get('HandlerService');
  console.log("✅ HandlerService accessible via ServiceLocator");
  console.log("HandlerService is function:", typeof HandlerServiceClass === 'function');
} catch (error) {
  console.error("❌ HandlerService access failed:", error.message);
}
```

### **Phase 4: Global Accessor Testing**

```javascript
// Test global accessors
console.log("=== GLOBAL ACCESSOR TEST ===");
console.log("getGlobalDB available:", typeof getGlobalDB === 'function');
console.log("getGlobalConfig available:", typeof getGlobalConfig === 'function');
console.log("getHandlerServiceClass available:", typeof getHandlerServiceClass === 'function');

// Test getGlobalDB functionality
if (typeof getGlobalDB === 'function') {
  try {
    const db = getGlobalDB();
    console.log("✅ getGlobalDB() works:", typeof db);
  } catch (error) {
    console.error("❌ getGlobalDB() failed:", error.message);
  }
}

// Test getGlobalConfig functionality
if (typeof getGlobalConfig === 'function') {
  try {
    const config = getGlobalConfig();
    console.log("✅ getGlobalConfig() works:", typeof config);
  } catch (error) {
    console.error("❌ getGlobalConfig() failed:", error.message);
  }
}
```

### **Phase 5: Handler Class Testing**

```javascript
// Test BDLeadHandler_ServiceLocator
console.log("=== BD LEAD HANDLER TEST ===");
console.log("BDLeadHandler_ServiceLocator available:", typeof BDLeadHandler_ServiceLocator === 'function');

// Test handler instantiation
try {
  const bdHandler = new BDLeadHandler_ServiceLocator();
  console.log("✅ BDLeadHandler_ServiceLocator instantiated successfully");
  console.log("Handler type:", typeof bdHandler);
} catch (error) {
  console.error("❌ BDLeadHandler_ServiceLocator instantiation failed:", error.message);
  
  // Show detailed error information
  console.log("Error details:", {
    hasGlobalServiceLocator: typeof GlobalServiceLocator !== 'undefined',
    hasConfig: typeof Config !== 'undefined',
    hasHandlerService: typeof HandlerService !== 'undefined',
    hasDatabaseService: typeof DatabaseService !== 'undefined'
  });
}
```

### **Phase 6: Emergency Bootstrap** (Run if any tests fail)

```javascript
// Emergency service bootstrap
console.log("=== EMERGENCY BOOTSTRAP ===");

// Step 1: Force bootstrap
try {
  const bootstrapResult = ServiceBootstrap.bootstrap();
  console.log("Bootstrap result:", bootstrapResult);
} catch (error) {
  console.error("Bootstrap failed:", error.message);
}

// Step 2: Manual service registration
if (typeof GlobalServiceLocator !== 'undefined') {
  try {
    // Register Config manually
    if (!GlobalServiceLocator.has('Config') && typeof Config !== 'undefined') {
      GlobalServiceLocator.register('Config', null, {
        singleton: true,
        factory: () => Config
      });
      console.log("✅ Config registered manually");
    }
    
    // Register DatabaseService manually
    if (!GlobalServiceLocator.has('DatabaseService') && typeof DatabaseService !== 'undefined') {
      GlobalServiceLocator.register('DatabaseService', DatabaseService, {
        singleton: true
      });
      console.log("✅ DatabaseService registered manually");
    }
    
    // Register HandlerService manually
    if (!GlobalServiceLocator.has('HandlerService') && typeof HandlerService !== 'undefined') {
      GlobalServiceLocator.register('HandlerService', null, {
        singleton: false,
        factory: () => HandlerService
      });
      console.log("✅ HandlerService registered manually");
    }
    
    // Create global accessors manually
    globalThis.getGlobalDB = () => GlobalServiceLocator.get('DatabaseService');
    globalThis.getGlobalConfig = () => GlobalServiceLocator.get('Config');
    console.log("✅ Global accessors created manually");
    
  } catch (error) {
    console.error("Manual registration failed:", error.message);
  }
}
```

### **Phase 7: Final Verification**

```javascript
// Final comprehensive test
console.log("=== FINAL VERIFICATION ===");

const finalTests = {
  GlobalServiceLocator: typeof GlobalServiceLocator !== 'undefined',
  ServiceBootstrap: typeof ServiceBootstrap !== 'undefined',
  Config: false,
  DatabaseService: false,
  HandlerService: false,
  getGlobalDB: typeof getGlobalDB === 'function',
  getGlobalConfig: typeof getGlobalConfig === 'function',
  BDLeadHandler: false
};

// Test Config access
try {
  const config = GlobalServiceLocator.get('Config');
  finalTests.Config = !!config;
} catch (error) { /* ignore */ }

// Test DatabaseService access
try {
  const db = GlobalServiceLocator.get('DatabaseService');
  finalTests.DatabaseService = !!db;
} catch (error) { /* ignore */ }

// Test HandlerService access
try {
  const HandlerServiceClass = GlobalServiceLocator.get('HandlerService');
  finalTests.HandlerService = typeof HandlerServiceClass === 'function';
} catch (error) { /* ignore */ }

// Test BDLeadHandler instantiation
try {
  const bdHandler = new BDLeadHandler_ServiceLocator();
  finalTests.BDLeadHandler = !!bdHandler;
} catch (error) { /* ignore */ }

console.log("Final Test Results:", finalTests);

const passedTests = Object.values(finalTests).filter(Boolean).length;
const totalTests = Object.keys(finalTests).length;

console.log(`Overall Status: ${passedTests}/${totalTests} tests passed`);

if (passedTests === totalTests) {
  console.log("🎉 ALL TESTS PASSED - Service initialization issues resolved!");
} else {
  console.log("⚠️ Some tests failed - manual intervention may be required");
}
```

## **Expected Results**

When all fixes are working correctly, you should see:

```
=== FINAL VERIFICATION ===
Final Test Results: {
  GlobalServiceLocator: true,
  ServiceBootstrap: true,
  Config: true,
  DatabaseService: true,
  HandlerService: true,
  getGlobalDB: true,
  getGlobalConfig: true,
  BDLeadHandler: true
}
Overall Status: 8/8 tests passed
🎉 ALL TESTS PASSED - Service initialization issues resolved!
```

## **Troubleshooting**

If tests fail, run the Emergency Bootstrap section and then re-run the verification tests.

For persistent issues, check:
1. File loading order (00_ prefixed files should load first)
2. Proper service registration in ServiceBootstrap
3. Global scope accessibility
4. BaseService availability for inheritance
