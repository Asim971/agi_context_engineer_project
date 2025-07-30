/**
 * Code.gs
 * Main entry point for the unified Anwar Sales Ecosystem
 * Consolidates all functionality with Phase 1 modernization enhancements
 * 
 * @fileoverview Modern entry point with comprehensive error handling and logging
 * @version 2.0.0
 */

// FIXED: Emergency BaseService Fix replaced with proper Foundation file
// BaseService is now defined in 00_Foundation.js which loads first
// This ensures proper dependency resolution across all services

// Verify foundation is loaded (safety check)
if (typeof BaseService === 'undefined') {
  throw new Error('CRITICAL: 00_Foundation.js did not load properly. BaseService is not defined.');
}

console.log('✅ Foundation verified - BaseService available for inheritance');

// Note: All modules are automatically loaded into global scope by Google Apps Script
// Foundation, Config, DB, Logger, ErrorHandler, and all services are available globally

/**
 * Enhanced global setup function - comprehensive service initialization with monitoring
 * Integrates health monitoring, recovery systems, and advanced error handling
 */
function setup() {
  const logger = Logger.createChildLogger('Setup', { operation: 'enhanced_system_initialization' });
  logger.info('=== Enhanced Anwar Sales Ecosystem Setup Started ===');
  
  try {
    // Phase 1: Pre-flight Health Assessment
    logger.info('Phase 1: Pre-flight health assessment');
    const preFlightStatus = performPreFlightHealthCheck();
    
    if (preFlightStatus.criticalIssues.length > 0) {
      logger.warn('Critical issues detected during pre-flight', { issues: preFlightStatus.criticalIssues });
      
      // Attempt automatic resolution if recovery system is available
      if (typeof ServiceRecoverySystem !== 'undefined') {
        const recoveryResult = ServiceRecoverySystem.attemptQuickRecovery();
        if (!recoveryResult.success) {
          throw new Error(`Pre-flight failed with unrecoverable issues: ${preFlightStatus.criticalIssues.join(', ')}`);
        }
      }
    }
    
    // Phase 2: Enhanced Service Initialization
    logger.info('Phase 2: Enhanced service initialization');
    
    // Initialize Service Health Monitor if available
    let healthMonitor = null;
    if (typeof ServiceHealthMonitor !== 'undefined') {
      try {
        healthMonitor = new ServiceHealthMonitor();
        healthMonitor.startMonitoring();
        logger.info('Service health monitoring activated');
      } catch (monitorError) {
        logger.warn('Health monitor initialization failed, continuing without monitoring', { error: monitorError.message });
      }
    }
    
    // Initialize Recovery System if available
    let recoverySystem = null;
    if (typeof ServiceRecoverySystem !== 'undefined') {
      try {
        recoverySystem = new ServiceRecoverySystem();
        logger.info('Service recovery system initialized');
      } catch (recoveryError) {
        logger.warn('Recovery system initialization failed', { error: recoveryError.message });
      }
    }
    
    // Phase 3: Core Database and Service Setup
    logger.info('Phase 3: Core database and service setup');
    
    // Initialize database service with enhanced error handling
    try {
      const db = getGlobalDB();
      if (!db) {
        throw new Error('Database initialization returned null');
      }
      
      db.initialize();
      logger.info('Database service initialized successfully');
      
      // Test database connectivity
      const testSheet = db.getSheet(Config.SHEETS.ENGINEER);
      if (!testSheet) {
        throw new Error('Database connectivity test failed - cannot access sheets');
      }
      
    } catch (dbError) {
      logger.error('Database initialization failed', { error: dbError.message });
      
      // Attempt database recovery if recovery system is available
      if (recoverySystem) {
        const dbRecovery = recoverySystem.recoverDatabase();
        if (!dbRecovery.success) {
          throw new Error(`Database recovery failed: ${dbRecovery.error}`);
        }
        logger.info('Database recovered successfully');
      } else {
        throw dbError;
      }
    }
    
    // Phase 4: Sheet Initialization with Recovery
    logger.info('Phase 4: Sheet initialization with recovery');
    const sheetResults = initializeAllSheetsWithRecovery();
    
    // Phase 5: Handler Services Validation
    logger.info('Phase 5: Handler services validation');
    const handlerValidation = validateHandlerServices();
    
    if (handlerValidation.failedHandlers.length > 0) {
      logger.warn('Some handlers failed validation', { failedHandlers: handlerValidation.failedHandlers });
      
      // Attempt handler recovery if recovery system is available
      if (recoverySystem) {
        for (const handler of handlerValidation.failedHandlers) {
          const recoveryResult = recoverySystem.recoverHandler(handler.name);
          if (recoveryResult.success) {
            logger.info(`Successfully recovered handler: ${handler.name}`);
          } else {
            logger.error(`Failed to recover handler: ${handler.name}`, { error: recoveryResult.error });
          }
        }
      }
    }
    
    // Phase 6: Trigger Setup with Enhanced Error Handling
    logger.info('Phase 6: Trigger setup with enhanced error handling');
    try {
      setupTriggers();
      logger.info('Triggers configured successfully');
    } catch (triggerError) {
      logger.error('Trigger setup failed', { error: triggerError.message });
      // Continue setup even if triggers fail - they can be set up manually
    }
    
    // Phase 7: Legacy Compatibility
    logger.info('Phase 7: Legacy compatibility setup');
    try {
      initializeLegacySheets();
      logger.info('Legacy initialization completed successfully');
    } catch (legacyError) {
      logger.warn('Legacy initialization failed', { error: legacyError.message });
      // Continue - legacy initialization is not critical
    }
    
    // Phase 8: WhatsApp Service Validation
    logger.info('Phase 8: WhatsApp service validation');
    try {
      if (typeof WhatsAppService !== 'undefined') {
        const whatsappTest = WhatsAppService.testConnection();
        if (whatsappTest && whatsappTest.success) {
          logger.info('WhatsApp service validated successfully');
        } else {
          logger.warn('WhatsApp service test failed', { error: whatsappTest ? whatsappTest.error : 'Test method unavailable' });
        }
      }
    } catch (whatsappError) {
      logger.error('WhatsApp service validation failed', { error: whatsappError.message });
    }
    
    // Phase 9: Comprehensive Health Check
    logger.info('Phase 9: Comprehensive health check');
    const healthStatus = performSystemHealthCheck();
    
    // Phase 10: Configure Monitoring (if available)
    if (healthMonitor) {
      logger.info('Phase 10: Configuring health monitoring');
      try {
        healthMonitor.configureAlerts({
          healthCheckInterval: 300000, // 5 minutes
          alertThreshold: 3, // Alert after 3 consecutive failures
          recoveryAttempts: 2 // Attempt recovery twice before alerting
        });
      } catch (monitorConfigError) {
        logger.warn('Health monitor configuration failed', { error: monitorConfigError.message });
      }
    }
    
    // Phase 11: Test Suite (if in test environment)
    if (ConfigurationService && ConfigurationService.isTestEnvironment()) {
      logger.info('Phase 11: Test environment - running validation tests');
      if (typeof ServiceInitializationTestSuite !== 'undefined') {
        try {
          const testSuite = new ServiceInitializationTestSuite();
          const testResults = testSuite.runBasicTests();
          
          if (testResults && testResults.overallSuccess) {
            logger.info('System validation tests passed', { 
              testsRun: testResults.totalTests,
              passed: testResults.passedTests
            });
          } else {
            logger.warn('Some validation tests failed', {
              testsRun: testResults ? testResults.totalTests : 0,
              passed: testResults ? testResults.passedTests : 0,
              failures: testResults ? testResults.failures : []
            });
          }
        } catch (testError) {
          logger.warn('Test suite execution failed', { error: testError.message });
        }
      }
    }
    
    // Final Success Summary
    const setupDuration = new Date().getTime() - (logger.startTime || new Date().getTime());
    logger.info('=== Enhanced Setup Completed Successfully ===', {
      duration: `${setupDuration}ms`,
      healthStatus: healthStatus.overallStatus || healthStatus.overall,
      sheetsInitialized: sheetResults.successful,
      handlersValidated: handlerValidation.validHandlers.length,
      monitoringActive: healthMonitor !== null,
      recoverySystemActive: recoverySystem !== null
    });
    
    return { 
      success: true, 
      healthStatus: healthStatus.overallStatus || healthStatus.overall,
      enhanced: true,
      monitoring: healthMonitor !== null,
      recovery: recoverySystem !== null
    };
    
  } catch (error) {
    logger.critical('Enhanced setup failed with critical error', {
      error: error.message,
      stack: error.stack || 'No stack trace available'
    });
    
    // Strict dependency injection - no emergency recovery
    // All services must be properly initialized via GlobalServiceLocator
    
    // Re-throw to ensure caller knows setup failed
    throw new AppScriptError(
      'ENHANCED_SYSTEM_SETUP_FAILED',
      `Enhanced system setup failed: ${error.message}`,
      { originalError: error.message },
      false,
      'CRITICAL'
    );
  }
}

/**
 * Perform comprehensive pre-flight health check
 */
function performPreFlightHealthCheck() {
  const logger = Logger.createChildLogger('PreFlightCheck');
  const issues = [];
  const warnings = [];
  
  try {
    // Check essential globals
    if (typeof Config === 'undefined') issues.push('Config not defined');
    if (typeof Logger === 'undefined') issues.push('Logger not defined');
    if (typeof BaseService === 'undefined') issues.push('BaseService not defined');
    
    // Check enhanced services availability (optional)
    if (typeof ServiceHealthMonitor === 'undefined') warnings.push('ServiceHealthMonitor not available - monitoring disabled');
    if (typeof ServiceRecoverySystem === 'undefined') warnings.push('ServiceRecoverySystem not available - auto-recovery disabled');
    if (typeof HandlerService === 'undefined') warnings.push('HandlerService not available - using basic handlers');
    
    // Check Google Apps Script services
    try {
      SpreadsheetApp.getActiveSpreadsheet();
    } catch (e) {
      issues.push('SpreadsheetApp not accessible');
    }
    
    try {
      PropertiesService.getScriptProperties();
    } catch (e) {
      issues.push('PropertiesService not accessible');
    }
    
    return {
      success: issues.length === 0,
      criticalIssues: issues,
      warnings: warnings,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    logger.error('Pre-flight check failed', { error: error.message });
    return {
      success: false,
      criticalIssues: ['Pre-flight check execution failed'],
      warnings: warnings,
      error: error.message
    };
  }
}

/**
 * Initialize all sheets with recovery capabilities
 */
function initializeAllSheetsWithRecovery() {
  const logger = Logger.createChildLogger('SheetInitializer', { operation: 'enhanced_sheet_initialization' });
  
  const sheets = [
    Config.SHEETS.ENGINEER,
    Config.SHEETS.POTENTIAL_SITE,
    Config.SHEETS.RETAILER,
    Config.SHEETS.MASTER,
    Config.SITE_UPDATES_SHEET_NAME,
    Config.USERS_SHEET_NAME
  ];
  
  const results = [];
  
  sheets.forEach(sheetName => {
    try {
      const sheet = getGlobalDB().getSheet(sheetName);
      logger.info(`Sheet initialized successfully: ${sheetName}`, {
        sheetId: sheet.getSheetId(),
        rowCount: sheet.getLastRow(),
        columnCount: sheet.getLastColumn()
      });
      
      results.push({ sheetName, success: true });
    } catch (error) {
      logger.error(`Failed to initialize sheet: ${sheetName}`, {
        error: error.message,
        sheetName
      });
      
      // Attempt sheet recovery
      try {
        if (typeof ServiceRecoverySystem !== 'undefined') {
          const recoveryResult = ServiceRecoverySystem.recoverSheet(sheetName);
          if (recoveryResult && recoveryResult.success) {
            logger.info(`Sheet ${sheetName} recovered successfully`);
            results.push({ sheetName, success: true, recovered: true });
            return;
          }
        }
      } catch (recoveryError) {
        logger.error(`Sheet recovery failed for ${sheetName}`, { error: recoveryError.message });
      }
      
      results.push({ 
        sheetName, 
        success: false, 
        error: error.message 
      });
    }
  });
  
  const successCount = results.filter(r => r.success).length;
  const failureCount = results.length - successCount;
  const recoveredCount = results.filter(r => r.recovered).length;
  
  logger.info('Enhanced sheet initialization completed', {
    totalSheets: sheets.length,
    successful: successCount,
    failed: failureCount,
    recovered: recoveredCount,
    successRate: (successCount / sheets.length * 100).toFixed(2) + '%'
  });
  
  if (failureCount > 0) {
    const failedSheets = results.filter(r => !r.success).map(r => r.sheetName);
    logger.warn('Some sheets failed to initialize', { failedSheets });
  }
  
  return {
    results,
    successful: successCount,
    failed: failureCount,
    recovered: recoveredCount
  };
}

/**
 * Validate handler services
 */
function validateHandlerServices() {
  const logger = Logger.createChildLogger('HandlerValidation');
  const handlers = [
    'MainHandler',
    'EngineerHandler', 
    'PotentialSiteHandler',
    'RetailerHandler',
    'CRMHandler',
    'VisitHandler'
  ];
  
  const validHandlers = [];
  const failedHandlers = [];
  
  handlers.forEach(handlerName => {
    try {
      const HandlerClass = eval(handlerName);
      if (typeof HandlerClass !== 'undefined') {
        // Test instantiation
        const instance = new HandlerClass();
        if (instance) {
          validHandlers.push({ name: handlerName, instance });
          logger.info(`Handler ${handlerName} validated successfully`);
        } else {
          failedHandlers.push({ name: handlerName, error: 'Failed to instantiate' });
        }
      } else {
        failedHandlers.push({ name: handlerName, error: 'Handler class not defined' });
      }
    } catch (error) {
      failedHandlers.push({ name: handlerName, error: error.message });
      logger.error(`Handler ${handlerName} validation failed`, { error: error.message });
    }
  });
  
  return {
    validHandlers,
    failedHandlers,
    totalHandlers: handlers.length,
    successRate: (validHandlers.length / handlers.length * 100).toFixed(2) + '%'
  };
}

/**
 * Perform comprehensive system health check
 * @returns {Object} System health status
 */
function performSystemHealthCheck() {
  const logger = Logger.createChildLogger('HealthCheck', { operation: 'system_health_check' });
  logger.info('Starting system health check...');
  
  const healthStatus = {
    timestamp: new Date().toISOString(),
    overall: 'HEALTHY',
    components: {}
  };
  
  try {
    // Check database service
    healthStatus.components.database = checkDatabaseHealth();
    
    // Check WhatsApp service
    healthStatus.components.whatsapp = checkWhatsAppHealth();
    
    // Check configuration
    healthStatus.components.configuration = checkConfigurationHealth();
    
    // Check error handling system
    healthStatus.components.errorHandling = checkErrorHandlingHealth();
    
    // Check logging system
    healthStatus.components.logging = checkLoggingHealth();
    
    // Determine overall health
    const componentStatuses = Object.values(healthStatus.components);
    const unhealthyComponents = componentStatuses.filter(status => status !== 'HEALTHY');
    
    if (unhealthyComponents.length === 0) {
      healthStatus.overall = 'HEALTHY';
    } else if (unhealthyComponents.length <= componentStatuses.length / 2) {
      healthStatus.overall = 'DEGRADED';
    } else {
      healthStatus.overall = 'UNHEALTHY';
    }
    
    logger.info('System health check completed', {
      overall: healthStatus.overall,
      components: healthStatus.components
    });
    
  } catch (error) {
    healthStatus.overall = 'UNHEALTHY';
    healthStatus.error = error.message;
    
    logger.error('Health check failed', { error: error.message });
  }
  
  return healthStatus;
}

/**
 * Check database service health
 * @returns {string} Health status
 */
function checkDatabaseHealth() {
  try {
    const db = getGlobalDB();
    if (db && typeof db.initialize === 'function') {
      return 'HEALTHY';
    }
    return 'DEGRADED';
  } catch (error) {
    return 'UNHEALTHY';
  }
}

/**
 * Check WhatsApp service health
 * @returns {string} Health status
 */
function checkWhatsAppHealth() {
  try {
    if (Config.MAYTAPI_API_KEY && Config.MAYTAPI_URL) {
      return 'HEALTHY';
    }
    return 'DEGRADED';
  } catch (error) {
    return 'UNHEALTHY';
  }
}

/**
 * Check configuration health
 * @returns {string} Health status
 */
function checkConfigurationHealth() {
  try {
    const requiredConfigs = [
      'SHEETS', 'HEADERS', 'FORMS', 'MAYTAPI_URL'
    ];
    
    for (const configKey of requiredConfigs) {
      if (!Config[configKey]) {
        return 'DEGRADED';
      }
    }
    
    return 'HEALTHY';
  } catch (error) {
    return 'UNHEALTHY';
  }
}

/**
 * Check error handling system health
 * @returns {string} Health status
 */
function checkErrorHandlingHealth() {
  try {
    if (typeof AppScriptError !== 'undefined' && typeof ErrorHandlerService !== 'undefined') {
      return 'HEALTHY';
    }
    return 'DEGRADED';
  } catch (error) {
    return 'UNHEALTHY';
  }
}

/**
 * Check logging system health
 * @returns {string} Health status
 */
function checkLoggingHealth() {
  try {
    if (typeof Logger !== 'undefined' && typeof Logger.info === 'function') {
      return 'HEALTHY';
    }
    return 'DEGRADED';
  } catch (error) {
    return 'UNHEALTHY';
  }
}

/**
 * Runs when the spreadsheet is opened. Adds a custom menu for setup.
 * Enhanced with modern error handling
 */
function onOpen() {
  const logger = Logger.createChildLogger('OnOpen', { operation: 'menu_setup' });
  
  try {
    const ui = SpreadsheetApp.getUi();
    const menu = ui.createMenu('Anwar Sales Eco')
      .addItem('Setup Test Environment', 'setup')
      .addItem('System Health Check', 'performSystemHealthCheck')
      .addItem('View Error Logs', 'viewErrorLogs')
      .addItem('Clear Log Buffer', 'clearLogBuffer');
    
    menu.addToUi();
    
    logger.info('Custom menu added successfully');
  } catch (error) {
    logger.error('Failed to add custom menu', { error: error.message });
  }
}

/**
 * View error logs - accessible from custom menu
 */
function viewErrorLogs() {
  const logger = Logger.createChildLogger('ViewLogs', { operation: 'log_viewing' });
  
  try {
    const logs = Logger.getLogs({ level: 'ERROR', limit: 50 });
    const ui = SpreadsheetApp.getUi();
    
    if (logs.length === 0) {
      ui.alert('No Error Logs', 'No error logs found in the current session.', ui.ButtonSet.OK);
      return;
    }
    
    const logSummary = logs.map(log => 
      `[${log.timestamp}] ${log.level}: ${log.message}`
    ).join('\n\n');
    
    ui.alert('Recent Error Logs', logSummary, ui.ButtonSet.OK);
    
    logger.info('Error logs displayed to user', { logCount: logs.length });
  } catch (error) {
    logger.error('Failed to display error logs', { error: error.message });
  }
}

/**
 * Clear log buffer - accessible from custom menu
 */
function clearLogBuffer() {
  const logger = Logger.createChildLogger('ClearLogs', { operation: 'log_clearing' });
  
  try {
    const ui = SpreadsheetApp.getUi();
    const response = ui.alert(
      'Clear Log Buffer', 
      'Are you sure you want to clear all logs from the current session?', 
      ui.ButtonSet.YES_NO
    );
    
    if (response === ui.Button.YES) {
      Logger.clearBuffer();
      ui.alert('Success', 'Log buffer cleared successfully.', ui.ButtonSet.OK);
      logger.info('Log buffer cleared by user');
    }
  } catch (error) {
    logger.error('Failed to clear log buffer', { error: error.message });
  }
}

/**
 * Set up automated triggers for the system
 */
function setupTriggers() {
  if (Config.IS_TEST_ENVIRONMENT) {
    createTestFormsAndTriggers();
  } else {
    MainHandler.setupTriggers();
  }
}

/**
 * Creates test forms and sets up triggers for the test environment.
 */
function createTestFormsAndTriggers() {
    var testFolderId = TestEnvironmentService.getTestEnvironmentFolderId();
    if (!testFolderId) {
      testFolderId = TestEnvironmentService.setupTestEnvironment();
    }
    var testSpreadsheetId = PropertiesService.getScriptProperties().getProperty('testSpreadsheetId');
    if (!testSpreadsheetId) {
        throw new Error('Test spreadsheet ID not found. Please run setupTestEnvironment first.');
    }

    // Create forms and store their IDs
    var formIds = {};
    var formConfigs = {
      RETAILER_FORM_ID: 'Retailer',
      POTENTIAL_SITE_FORM_ID: 'Potential Site',
      ENGINEER_FORM_ID: 'Engineer',
      SITE_UPDATE_FORM_ID: 'Site Update'
    };

    for (var key in formConfigs) {
      var formId = PropertiesService.getScriptProperties().getProperty(key);
      if (!formId) {
        var form = FormService.createForm(formConfigs[key], testSpreadsheetId);
        formId = form.getId();
        PropertiesService.getScriptProperties().setProperty(key, formId);
        var file = DriveApp.getFileById(formId);
        DriveApp.getFolderById(testFolderId).addFile(file);
        DriveApp.getRootFolder().removeFile(file);
      }
      formIds[key] = formId;
    }

    // Now set up the triggers with the new form IDs
    ScriptApp.getProjectTriggers().forEach(function(t) { ScriptApp.deleteTrigger(t); });

    ScriptApp.newTrigger('routeOnFormSubmit').forForm(formIds.RETAILER_FORM_ID).onFormSubmit().create();
    ScriptApp.newTrigger('routeOnFormSubmit').forForm(formIds.POTENTIAL_SITE_FORM_ID).onFormSubmit().create();
    ScriptApp.newTrigger('routeOnFormSubmit').forForm(formIds.ENGINEER_FORM_ID).onFormSubmit().create();
    ScriptApp.newTrigger('routeOnFormSubmit').forForm(formIds.SITE_UPDATE_FORM_ID).onFormSubmit().create();
    ScriptApp.newTrigger('routeOnEdit').forSpreadsheet(testSpreadsheetId).onEdit().create();
}

function routeOnFormSubmit(e) {
  MainHandler.onFormSubmit(e);
}

function routeOnEdit(e) {
  MainHandler.onEdit(e);
}

// Specific trigger functions for different form types
function onRetailerFormSubmit(e) {
  MainHandler.onFormSubmit(e);
}

function onPotentialSiteFormSubmit(e) {
  MainHandler.onFormSubmit(e);
}

function onEngineerFormSubmit(e) {
  MainHandler.onFormSubmit(e);
}

function onSiteUpdateFormSubmit(e) {
  MainHandler.onFormSubmit(e);
}

/**
 * Universal form submission handler - routes to appropriate handlers
 * Enhanced with service health monitoring and recovery
 */
function onFormSubmit(e) {
  const logger = Logger.createChildLogger('FormSubmit');
  
  try {
    // Pre-flight health check
    const healthStatus = getServiceHealthStatus();
    if (healthStatus === 'UNHEALTHY') {
      logger.warn('System unhealthy, attempting recovery before processing form');
      ServiceRecoverySystem.attemptRecovery();
    }
    
    // Route to MainHandler with enhanced error handling
    return MainHandler.onFormSubmit(e);
  } catch (error) {
    logger.error('Critical error in form submission', { error: error.message, stack: error.stack });
    
    // Attempt service recovery on critical errors
    try {
      ServiceRecoverySystem.attemptRecovery();
      // Retry once after recovery
      return MainHandler.onFormSubmit(e);
    } catch (recoveryError) {
      logger.error('Failed to recover from form submission error', { 
        originalError: error.message,
        recoveryError: recoveryError.message
      });
      throw error;
    }
  }
}

/**
 * Universal edit handler - routes to appropriate sheet handlers
 * Enhanced with service monitoring
 */
function onEdit(e) {
  const logger = Logger.createChildLogger('Edit');
  
  try {
    // Quick health check for edit operations
    const healthStatus = getServiceHealthStatus();
    if (healthStatus === 'UNHEALTHY') {
      logger.warn('System unhealthy during edit operation');
      ServiceRecoverySystem.attemptRecovery();
    }
    
    return MainHandler.onEdit(e);
  } catch (error) {
    logger.error('Error in edit handler', { error: error.message });
    throw error;
  }
}

function onBDLeadFormSubmit(e) {
  MainHandler.onFormSubmit(e);
}

/**
 * Main web app entry point - handles GET requests
 * Routes to appropriate handlers based on form ID or parameters
 */
function doGet(e) {
  console.log('doGet called with parameters:', JSON.stringify(e));
  
  try {
    return MainHandler.doGet(e);
  } catch (error) {
    console.error('Error in doGet:', error.stack);
    return ContentService
      .createTextOutput('Error processing request: ' + error.toString())
      .setMimeType(ContentService.MimeType.TEXT);
  }
}



/**
 * Legacy function - maintained for backward compatibility
 * Initializes new sheets and imports existing form data
 */
function initializeLegacySheets() {
  console.log('Legacy initializeNewSheets called');
  LegacyInitializer.initializeNewSheets();
}

/**
 * Legacy function - maintained for backward compatibility
 * Sets up legacy triggers
 */
function setupLegacyTriggers() {
  console.log('Legacy setupTriggers called');
  LegacyTriggers.setupTriggers();
}

/**
 * Health check function - verifies system status
 */
function healthCheck() {
  const health = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    services: {
      config: typeof Config !== 'undefined',
      database: typeof DB !== 'undefined',
      whatsapp: typeof WhatsAppService !== 'undefined',
      handlers: {
        main: typeof MainHandler !== 'undefined',
        engineer: typeof EngineerHandler !== 'undefined',
        potentialSite: typeof PotentialSiteHandler !== 'undefined',
        retailer: typeof RetailerHandler !== 'undefined',
        crm: typeof CRMHandler !== 'undefined',
        visit: typeof VisitHandler !== 'undefined'
      }
    }
  };
  
  console.log('Health check:', JSON.stringify(health, null, 2));
  return health;
}

/**
 * Get system information
 */
/**
 * Manually run data migration from legacy forms
 */
function runMigration() {
  MigrationService.importFromAllForms();
}

function getSystemInfo() {
  return {
    projectName: 'Anwar Sales Ecosystem',
    version: '2.0.0',
    description: 'Unified Google Apps Script project combining legacy and modern functionality',
    features: [
      'Engineer registration and management',
      'Potential site registration and tracking',
      'Retailer registration and onboarding',
      'CRM operations and status management',
      'WhatsApp notifications and messaging',
      'Automated data synchronization',
      'Legacy data import and migration'
    ],
    configuration: {
      mainSpreadsheet: Config.CRM_SPREADSHEET_ID,
      engineerForm: Config.ENGINEER_FORM_ID,
      potentialSiteForm: Config.POTENTIAL_SITE_FORM_ID,
      retailerForm: Config.RETAILER_FORM_ID
    }
  };
}

// Global function exports for Google Apps Script - required for GAS runtime
// These are entry points and cannot be removed in GAS environment
if (typeof global !== 'undefined') {
  global.setup = setup;
  global.doGet = doGet;
  global.onOpen = onOpen;
  global.onFormSubmit = onFormSubmit;
  global.onEdit = onEdit;
  global.onBDLeadFormSubmit = onBDLeadFormSubmit;
  global.initializeNewSheets = initializeLegacySheets;
  global.setupTriggers = setupLegacyTriggers;
  global.healthCheck = healthCheck;
  global.getSystemInfo = getSystemInfo;
  global.runMigration = runMigration;
}

// Initialize on load
console.log('Anwar Sales Ecosystem - Unified Apps Script loaded');