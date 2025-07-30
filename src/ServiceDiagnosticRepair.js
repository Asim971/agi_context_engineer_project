/**
 * ServiceDiagnosticRepair.js
 * Google Apps Script Service Diagnostic and Repair Utility
 *
 * Comprehensive troubleshooting and automatic repair system
 * for Google Apps Script service initialization issues
 *
 * @fileoverview Service diagnostic and repair utility
 * @version 1.0.0
 * @author Google Apps Script Service Initialization Troubleshooter Agent
 */

var ServiceDiagnosticRepair = (function() {
  'use strict';

  /**
   * Comprehensive service diagnostic system
   */
  function diagnoseServiceIssues() {
    console.log('🔍 Starting comprehensive service diagnostic...');

    const diagnosticReport = {
      timestamp: new Date().toISOString(),
      overallStatus: 'UNKNOWN',
      criticalIssues: [],
      warnings: [],
      recommendations: [],
      serviceStatus: {},
      repairActions: []
    };

    try {
      // 1. Check GlobalServiceLocator availability
      diagnosticReport.serviceStatus.GlobalServiceLocator = checkGlobalServiceLocator();

      // 2. Check ServiceBootstrap availability
      diagnosticReport.serviceStatus.ServiceBootstrap = checkServiceBootstrap();

      // 3. Check core services
      diagnosticReport.serviceStatus.Config = checkConfigService();
      diagnosticReport.serviceStatus.DatabaseService = checkDatabaseService();
      diagnosticReport.serviceStatus.HandlerService = checkHandlerService();

      // 4. Check global accessors
      diagnosticReport.serviceStatus.globalAccessors = checkGlobalAccessors();

      // 5. Check BaseService
      diagnosticReport.serviceStatus.BaseService = checkBaseService();

      // 6. Analyze issues and determine status
      const analysis = analyzeServiceStatus(diagnosticReport.serviceStatus);
      diagnosticReport.criticalIssues = analysis.criticalIssues;
      diagnosticReport.warnings = analysis.warnings;
      diagnosticReport.recommendations = analysis.recommendations;
      diagnosticReport.overallStatus = analysis.overallStatus;

      console.log('📊 Service diagnostic completed:', diagnosticReport);
      return diagnosticReport;

    } catch (error) {
      console.error('❌ Service diagnostic failed:', error);
      diagnosticReport.overallStatus = 'DIAGNOSTIC_FAILED';
      diagnosticReport.criticalIssues.push(`Diagnostic system error: ${error.message}`);
      return diagnosticReport;
    }
  }

  /**
   * Check GlobalServiceLocator status
   */
  function checkGlobalServiceLocator() {
    const status = {
      available: false,
      initialized: false,
      registeredServices: [],
      error: null
    };

    try {
      if (typeof GlobalServiceLocator !== 'undefined') {
        status.available = true;

        if (typeof GlobalServiceLocator.getStatus === 'function') {
          const locatorStatus = GlobalServiceLocator.getStatus();
          status.initialized = true;
          status.registeredServices = locatorStatus.registeredServices || [];
        }
      } else {
        status.error = 'GlobalServiceLocator not defined in global scope';
      }
    } catch (error) {
      status.error = error.message;
    }

    return status;
  }

  /**
   * Check ServiceBootstrap status
   */
  function checkServiceBootstrap() {
    const status = {
      available: false,
      bootstrapped: false,
      error: null
    };

    try {
      if (typeof ServiceBootstrap !== 'undefined') {
        status.available = true;

        // Try to get status to see if it's been bootstrapped
        if (typeof ServiceBootstrap.getStatus === 'function') {
          ServiceBootstrap.getStatus();
          status.bootstrapped = true;
        }
      } else {
        status.error = 'ServiceBootstrap not defined in global scope';
      }
    } catch (error) {
      status.error = error.message;
    }

    return status;
  }

  /**
   * Check Config service status
   */
  function checkConfigService() {
    const status = {
      directAccess: false,
      serviceLocatorAccess: false,
      globalAccessorAccess: false,
      error: null
    };

      try {


      // Check service locator access
      if (typeof GlobalServiceLocator !== 'undefined') {
        try {
          const config = GlobalServiceLocator.get('Config');
          if (config) {
            status.serviceLocatorAccess = true;
          }
        } catch (locatorError) {
          // Not critical, just note it
        }
      }

      if (!status.serviceLocatorAccess) {
        status.error = 'Config not accessible via GlobalServiceLocator';
        throw new Error(status.error);
      }

    } catch (error) {
      status.error = error.message;
    }

    return status;
  }

  /**
   * Check DatabaseService status
   */
  function checkDatabaseService() {
    const status = {
      classAvailable: false,
      serviceLocatorAccess: false,
      globalAccessorAccess: false,
      instanceCreation: false,
      error: null
    };

    try {


      // Check service locator access
      if (typeof GlobalServiceLocator !== 'undefined') {
        try {
          const db = GlobalServiceLocator.get('DatabaseService');
          if (db) {
            status.serviceLocatorAccess = true;
          }
        } catch (locatorError) {
          // Not critical
        }
      }

      // Test instance creation via locator
      if (status.serviceLocatorAccess) {
        try {
          const testInstance = GlobalServiceLocator.get('DatabaseService');
          if (testInstance) {
            status.instanceCreation = true;
          }
        } catch (instanceError) {
          status.error = `Instance creation failed: ${instanceError.message}`;
          throw instanceError;
        }
      }

    } catch (error) {
      status.error = error.message;
    }

    return status;
  }

  /**
   * Check HandlerService status
   */
  function checkHandlerService() {
    const status = {
      classAvailable: false,
      serviceLocatorAccess: false,
      inheritance: false,
      error: null
    };

    try {


      // Check service locator access
      if (typeof GlobalServiceLocator !== 'undefined') {
        try {
          const HandlerServiceClass = GlobalServiceLocator.get('HandlerService');
          if (typeof HandlerServiceClass === 'function') {
            status.serviceLocatorAccess = true;

            // Test inheritance capability
            class TestHandler extends HandlerServiceClass {
              constructor() {
                super('TestSheet', ['Header1', 'Header2'], 'TEST');
              }
            }

            status.inheritance = true;
          }
        } catch (locatorError) {
          status.error = `Service locator access failed: ${locatorError.message}`;
        }
      }

    } catch (error) {
      status.error = error.message;
    }

    return status;
  }

  /**
   * Check global accessors
   */
  function checkGlobalAccessors() {
    const status = {
      getGlobalDB: typeof getGlobalDB === 'function',
      getGlobalConfig: typeof getGlobalConfig === 'function',
      getHandlerServiceClass: typeof getHandlerServiceClass === 'function',
      getService: typeof getService === 'function',
      getServiceStatus: typeof getServiceStatus === 'function'
    };

    return status;
  }

  /**
   * Check BaseService status
   */
  function checkBaseService() {
    const status = {
      available: false,
      instantiable: false,
      error: null
    };

    try {
      if (GlobalServiceLocator.has('BaseService')) {
        status.available = true;

        // Test instantiation
        const testInstance = GlobalServiceLocator.get('BaseService');
        if (testInstance) {
          status.instantiable = true;
        }
      } else {
        status.error = 'BaseService not registered in GlobalServiceLocator';
        throw new Error(status.error);
      }
    } catch (error) {
      status.error = error.message;
    }

    return status;
  }

  /**
   * Analyze service status and provide recommendations
   */
  function analyzeServiceStatus(serviceStatus) {
    const analysis = {
      overallStatus: 'HEALTHY',
      criticalIssues: [],
      warnings: [],
      recommendations: []
    };

    // Check GlobalServiceLocator
    if (!serviceStatus.GlobalServiceLocator.available) {
      analysis.criticalIssues.push('GlobalServiceLocator not available');
      analysis.recommendations.push('Ensure 00_GlobalServiceLocator.js is loaded');
    }

    // Check ServiceBootstrap
    if (!serviceStatus.ServiceBootstrap.available) {
      analysis.criticalIssues.push('ServiceBootstrap not available');
      analysis.recommendations.push('Ensure 01_ServiceBootstrap.js is loaded');
    } else if (!serviceStatus.ServiceBootstrap.bootstrapped) {
      analysis.warnings.push('ServiceBootstrap not executed');
      analysis.recommendations.push('Run ServiceBootstrap.bootstrap() to initialize services');
    }

    // Check Config
    if (!serviceStatus.Config.serviceLocatorAccess) {
      analysis.criticalIssues.push('Config service not accessible via GlobalServiceLocator');
      analysis.recommendations.push('Register Config in GlobalServiceLocator');
    }

    // Check DatabaseService
    if (!serviceStatus.DatabaseService.serviceLocatorAccess) {
      analysis.criticalIssues.push('DatabaseService not accessible via GlobalServiceLocator');
      analysis.recommendations.push('Register DatabaseService in GlobalServiceLocator');
    }

    // Check HandlerService
    if (!serviceStatus.HandlerService.serviceLocatorAccess) {
      analysis.criticalIssues.push('HandlerService not accessible via GlobalServiceLocator');
      analysis.recommendations.push('Register HandlerService in GlobalServiceLocator');
    }

    // Check BaseService
    if (!serviceStatus.BaseService.available) {
      analysis.criticalIssues.push('BaseService not registered in GlobalServiceLocator');
      analysis.recommendations.push('Register BaseService in GlobalServiceLocator');
    }

    // Determine overall status
    if (analysis.criticalIssues.length > 0) {
      analysis.overallStatus = 'CRITICAL';
    } else if (analysis.warnings.length > 0) {
      analysis.overallStatus = 'WARNING';
    }

    return analysis;
  }

  /**
   * Attempt automatic repair of detected issues
   */
  function attemptAutomaticRepair(diagnosticReport) {
    console.log('🔧 Attempting automatic service repair...');

    const repairReport = {
      timestamp: new Date().toISOString(),
      repairsAttempted: [],
      repairsSuccessful: [],
      repairsFailed: [],
      finalStatus: 'UNKNOWN'
    };

    try {
      // Repair 1: Initialize ServiceBootstrap if available but not bootstrapped
      if (typeof ServiceBootstrap !== 'undefined' &&
          !diagnosticReport.serviceStatus.ServiceBootstrap.bootstrapped) {

        repairReport.repairsAttempted.push('ServiceBootstrap initialization');

        try {
          const bootstrapResult = ServiceBootstrap.bootstrap();
          if (bootstrapResult.success) {
            repairReport.repairsSuccessful.push('ServiceBootstrap initialization');
          } else {
            repairReport.repairsFailed.push(`ServiceBootstrap initialization: ${bootstrapResult.error}`);
          }
        } catch (bootstrapError) {
          repairReport.repairsFailed.push(`ServiceBootstrap initialization: ${bootstrapError.message}`);
        }
      }

      // Repair 2: Create emergency global accessors if missing


      // Repair 3: Register critical services if GlobalServiceLocator is available
      if (typeof GlobalServiceLocator !== 'undefined') {
        repairReport.repairsAttempted.push('Critical service registration');

        try {
          // Register Config if not registered
          if (!GlobalServiceLocator.has('Config') && typeof Config !== 'undefined') {
            GlobalServiceLocator.register('Config', null, {
              singleton: true,
              factory: () => Config
            });
          }

          // Register DatabaseService if not registered
          if (!GlobalServiceLocator.has('DatabaseService') && typeof DatabaseService !== 'undefined') {
            GlobalServiceLocator.register('DatabaseService', DatabaseService, {
              singleton: true
            });
          }

          // Register HandlerService if not registered
          if (!GlobalServiceLocator.has('HandlerService') && typeof HandlerService !== 'undefined') {
            GlobalServiceLocator.register('HandlerService', null, {
              singleton: false,
              factory: () => HandlerService
            });
          }

          repairReport.repairsSuccessful.push('Critical service registration');

        } catch (registrationError) {
          repairReport.repairsFailed.push(`Critical service registration: ${registrationError.message}`);
        }
      }

      // Determine final status
      if (repairReport.repairsFailed.length === 0) {
        repairReport.finalStatus = 'REPAIR_SUCCESSFUL';
      } else if (repairReport.repairsSuccessful.length > 0) {
        repairReport.finalStatus = 'PARTIAL_REPAIR';
      } else {
        repairReport.finalStatus = 'REPAIR_FAILED';
      }

      console.log('🔧 Automatic repair completed:', repairReport);
      return repairReport;

    } catch (error) {
      console.error('❌ Automatic repair failed:', error);
      repairReport.finalStatus = 'REPAIR_ERROR';
      repairReport.repairsFailed.push(`System error: ${error.message}`);
      return repairReport;
    }
  }

  /**
   * Generate comprehensive repair instructions
   */
  function generateRepairInstructions(diagnosticReport) {
    const instructions = {
      title: 'Google Apps Script Service Repair Instructions',
      timestamp: new Date().toISOString(),
      severity: diagnosticReport.overallStatus,
      steps: []
    };

    // Step 1: File loading order
    if (diagnosticReport.criticalIssues.some(issue => issue.includes('GlobalServiceLocator'))) {
      instructions.steps.push({
        step: 1,
        title: 'Ensure Proper File Loading Order',
        description: 'Verify that service files load in the correct order',
        actions: [
          'Check that 00_GlobalServiceLocator.js loads first',
          'Check that 01_ServiceBootstrap.js loads second',
          'Verify other service files load after foundation files'
        ],
        code: `// In Google Apps Script IDE, files should be named:
// 00_GlobalServiceLocator.js
// 01_ServiceBootstrap.js
// Config.js
// DatabaseService.js
// HandlerService.js`
      });
    }

    // Step 2: Service initialization
    if (diagnosticReport.warnings.some(warning => warning.includes('ServiceBootstrap'))) {
      instructions.steps.push({
        step: 2,
        title: 'Initialize Service System',
        description: 'Run the service bootstrap to initialize all services',
        actions: [
          'Execute ServiceBootstrap.bootstrap() in Google Apps Script console',
          'Verify all services are registered',
          'Check service status'
        ],
        code: `// Run in Google Apps Script console:
const result = ServiceBootstrap.bootstrap();
console.log(result);

// Check service status:
console.log(GlobalServiceLocator.getStatus());`
      });
    }

    // Step 3: Manual service registration
    if (diagnosticReport.criticalIssues.some(issue => issue.includes('Config') || issue.includes('DatabaseService'))) {
      instructions.steps.push({
        step: 3,
        title: 'Manual Service Registration',
        description: 'Manually register missing services',
        actions: [
          'Register Config service',
          'Register DatabaseService',
          'Register HandlerService',
          'Create global accessors'
        ],
        code: `// Manual service registration:
if (typeof GlobalServiceLocator !== 'undefined') {
  // Register Config
  GlobalServiceLocator.register('Config', null, {
    singleton: true,
    factory: () => Config
  });

  // Register DatabaseService
  GlobalServiceLocator.register('DatabaseService', DatabaseService, {
    singleton: true
  });

  // Register HandlerService
  GlobalServiceLocator.register('HandlerService', null, {
    singleton: false,
    factory: () => HandlerService
  });

  // Use service locator directly instead of global accessors
}`
      });
    }

    // Step 4: Handler class fixes
    if (diagnosticReport.criticalIssues.some(issue => issue.includes('HandlerService'))) {
      instructions.steps.push({
        step: 4,
        title: 'Fix Handler Classes',
        description: 'Update handler classes to use service locator pattern',
        actions: [
          'Use GlobalServiceLocator.get("HandlerService") for base class',
          'Implement proper dependency injection',
          'Add fallback mechanisms'
        ],
        code: `// Handler class pattern:
var MyHandler = (function() {
  // Get HandlerService class via service locator
  const HandlerServiceClass = GlobalServiceLocator.get('HandlerService');

  class MyHandler extends HandlerServiceClass {
    constructor() {
      const config = GlobalServiceLocator.get('Config');
      super(config.SHEETS.MY_SHEET, config.HEADERS.MY_SHEET, 'MY');
    }
  }

  return MyHandler;
})();`
      });
    }

    return instructions;
  }

  // Public API
  return {
    diagnose: diagnoseServiceIssues,
    repair: attemptAutomaticRepair,
    generateInstructions: generateRepairInstructions,

    /**
     * Complete diagnostic and repair workflow
     */
    fullRepair() {
      console.log('🚨 Starting complete service diagnostic and repair workflow...');

      // Step 1: Diagnose
      const diagnostic = this.diagnose();

      // Step 2: Attempt automatic repair
      const repair = this.repair(diagnostic);

      // Step 3: Generate instructions for manual fixes
      const instructions = this.generateInstructions(diagnostic);

      const result = {
        diagnostic,
        repair,
        instructions,
        summary: {
          status: repair.finalStatus,
          criticalIssues: diagnostic.criticalIssues.length,
          automaticRepairs: repair.repairsSuccessful.length,
          manualStepsRequired: instructions.steps.length
        }
      };

      console.log('📋 Complete repair workflow finished:', result.summary);
      return result;
    }
  };
})();

/**
 * Global registration
 */
if (typeof globalThis !== 'undefined') {
  // Removed global assignment for ServiceDiagnosticRepair
// Access via import or service locator as needed
}

console.log('✅ ServiceDiagnosticRepair utility loaded and ready');
