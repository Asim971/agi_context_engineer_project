/**
 * Code.gs
 * Main entry point for the unified Anwar Sales Ecosystem
 * Consolidates all functionality from appscriptnew and unified-apps-script
 */

// Note: All modules are automatically loaded into global scope by Google Apps Script
// Config, DB, WhatsAppService, and all handlers are available globally

/**
 * Global setup function - run once to initialize the entire system
 * This replaces the legacy setup functions and provides unified initialization
 */
function setup() {
  console.log('=== Anwar Sales Ecosystem Setup Started ===');
  
  try {
    // Initialize database service
    getGlobalDB().initialize();
    console.log('Database service initialized');
    
    // Initialize all required sheets
    initializeAllSheets();
    console.log('All sheets initialized');
    
    // Set up triggers
    setupTriggers();
    console.log('Triggers configured');
    
    // Legacy compatibility setup
    initializeLegacySheets();
    console.log('Legacy initialization completed');
    
    console.log('=== Setup Completed Successfully ===');
    
  } catch (error) {
    console.error('Setup failed:', error.stack);
    throw error;
  }
}

/**
 * Initialize all required sheets with proper headers
 */
function initializeAllSheets() {
  const sheets = [
    Config.SHEETS.ENGINEER,
    Config.SHEETS.POTENTIAL_SITE,
    Config.SHEETS.RETAILER,
    Config.SHEETS.MASTER,
    Config.SITE_UPDATES_SHEET_NAME,
    Config.USERS_SHEET_NAME
  ];
  
  sheets.forEach(sheetName => {
    try {
      getGlobalDB().getSheet(sheetName);
      console.log(`Sheet accessed: ${sheetName}`);
    } catch (error) {
      console.warn(`Error accessing sheet: ${sheetName}`, error.toString());
    }
  });
}

/**
 * Runs when the spreadsheet is opened. Adds a custom menu for setup.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Anwar Sales Eco')
    .addItem('Setup Test Environment', 'setup')
    .addToUi();
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

// Export global functions for Apps Script
if (typeof global !== 'undefined') {
  global.setup = setup;
  global.doGet = doGet;
  global.onOpen = onOpen;
  global.onFormSubmit = onFormSubmit;
  global.onEdit = onEdit;
  global.initializeNewSheets = initializeLegacySheets;
  global.setupTriggers = setupLegacyTriggers;
  global.healthCheck = healthCheck;
  global.getSystemInfo = getSystemInfo;
}

// Initialize on load
console.log('Anwar Sales Ecosystem - Unified Apps Script loaded');