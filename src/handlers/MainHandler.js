/**
 * MainHandler.js
 * Entry points and routing for unified Anwar Sales Ecosystem
 * Consolidates all entry points from legacy and unified projects
 */

/**
 * Main entry point for web requests
 */
function doGet(e) {
  var params = e.parameter || {};
  var formId = params.formId || '';

  // Route based on form ID
  if (formId === Config.FORMS.ENGINEER) {
    return EngineerHandler.doGet(e);
  } else if (formId === Config.FORMS.POTENTIAL_SITE) {
    return PotentialSiteHandler.doGet(e);
  } else if (formId === Config.FORMS.RETAILER) {
    return RetailerHandler.doGet(e);
  } else {
    // Default response
    return ContentService
      .createTextOutput('Anwar Sales Ecosystem - Unified Google Apps Script')
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

/**
 * Form submission handler
 */
function onFormSubmit(e) {
  var formId = e.source.getId();

  // Get form IDs, respecting test environment
  var ENGINEER_FORM_ID = Config.IS_TEST_ENVIRONMENT ? PropertiesService.getScriptProperties().getProperty('ENGINEER_FORM_ID') : Config.FORMS.ENGINEER;
  var POTENTIAL_SITE_FORM_ID = Config.IS_TEST_ENVIRONMENT ? PropertiesService.getScriptProperties().getProperty('POTENTIAL_SITE_FORM_ID') : Config.FORMS.POTENTIAL_SITE;
  var RETAILER_FORM_ID = Config.IS_TEST_ENVIRONMENT ? PropertiesService.getScriptProperties().getProperty('RETAILER_FORM_ID') : Config.FORMS.RETAILER;
  var SITE_UPDATE_FORM_ID = Config.IS_TEST_ENVIRONMENT ? PropertiesService.getScriptProperties().getProperty('SITE_UPDATE_FORM_ID') : Config.SITE_UPDATE_FORM_ID;
  var BD_LEAD_FORM_ID = Config.IS_TEST_ENVIRONMENT ? PropertiesService.getScriptProperties().getProperty('BD_LEAD_FORM_ID') : Config.FORMS.BD_LEAD;

  if (formId === ENGINEER_FORM_ID) {
    EngineerHandler.onFormSubmit(e);
  } else if (formId === POTENTIAL_SITE_FORM_ID) {
    PotentialSiteHandler.onFormSubmit(e);
  } else if (formId === RETAILER_FORM_ID) {
    RetailerHandler.onFormSubmit(e);
  } else if (formId === SITE_UPDATE_FORM_ID) {
    SiteUpdateHandler.onFormSubmit(e);
  } else if (formId === BD_LEAD_FORM_ID) {
    BDLeadHandler.onFormSubmit(e);
  } else {
    console.log('Unknown form ID: ' + formId);
  }
}

/**
 * Edit trigger handler
 */
function onEdit(e) {
  var sheetName = e.range.getSheet().getName();

  // Route based on sheet name
  switch (sheetName) {
    case Config.SHEETS.ENGINEER:
      EngineerHandler.onEdit(e);
      break;
    case Config.SHEETS.POTENTIAL_SITE:
      PotentialSiteHandler.onEdit(e);
      break;
    case Config.SHEETS.RETAILER:
      RetailerHandler.onEdit(e);
      break;
    case Config.SHEETS.BD_LEAD:
      BDLeadHandler.onEdit(e);
      break;
    default:
      // Optional: handle other edits or log them
      break;
  }
}

/**
 * Time-based trigger for legacy functionality
 */
function initializeNewSheets() {
  LegacyInitializer.initializeNewSheets();
}

/**
 * Setup function for the production environment
 */
function setupProductionEnvironment() {
  Config.IS_TEST_ENVIRONMENT = false;
  getGlobalDB().initialize();
  setupTriggers();
  console.log('Production environment setup completed.');
}

/**
 * Setup function for the test environment
 */
function setupTestEnvironment() {
  Config.IS_TEST_ENVIRONMENT = true;
  TestEnvironmentService.setupTestEnvironment();
  console.log('Test environment setup completed.');
}

/**
 * Setup time-based triggers
 */
function setupIdTracking() {
  getGlobalDB().getSheet(Config.SHEETS.ID_TRACKING);
  console.log('ID Tracking sheet setup completed.');
}

function setupTriggers() {
  // Delete existing triggers
  var triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function(trigger) {
    ScriptApp.deleteTrigger(trigger);
  });
  
  // Create daily trigger for legacy functionality
  ScriptApp.newTrigger('initializeNewSheets')
    .timeBased()
    .everyDays(1)
    .atHour(1)
    .create();
    
  console.log('Triggers setup completed');
}