/**
 * @file MainHandler.js
 * @description Main entry point and routing logic for the Anwar Sales Ecosystem.
 * This service routes incoming web requests, form submissions, and sheet edits
 * to the appropriate handler services. It uses a service-oriented architecture
 * and extends BaseService for centralized logging and error handling.
 * @version 2.0.0
 */

class MainHandlerService extends BaseService {
  constructor() {
    super();
    // Service mapping for form submissions and edits
    this.serviceMap = {
      [Config.FORMS.ENGINEER]: engineerHandlerService,
      [Config.FORMS.POTENTIAL_SITE]: potentialSiteHandlerService,
      [Config.FORMS.RETAILER]: retailerHandlerService,
      [Config.FORMS.SITE_UPDATE]: siteUpdateHandlerService, // Assuming this will be created
      [Config.FORMS.BD_LEAD]: bdLeadHandlerService,       // Assuming this will be created
      [Config.FORMS.SR]: srHandlerService,               // Assuming this will be created
      
      // Mapping for sheet names to services
      [Config.SHEETS.ENGINEER]: engineerHandlerService,
      [Config.SHEETS.POTENTIAL_SITE]: potentialSiteHandlerService,
      [Config.SHEETS.RETAILER]: retailerHandlerService,
      [Config.SHEETS.BD_LEAD]: bdLeadHandlerService,
      [Config.SHEETS.SR]: srHandlerService
    };
    this.logger.info('MainHandlerService initialized');
  }

  /**
   * Main entry point for all web requests (doGet).
   * @param {Object} e - The event parameter from the Apps Script trigger.
   * @returns {ContentService.TextOutput} A text or JSON response.
   */
  doGet(e) {
    return this.executeWithErrorHandling(() => {
      const formId = e.parameter?.formId || '';
      const service = this.serviceMap[formId];

      if (service && typeof service.doGet === 'function') {
        this.logger.info('Routing GET request', { formId });
        return service.doGet(e);
      }
      
      this.logger.info('No specific GET handler found, returning default response', { formId });
      return ContentService
        .createTextOutput('Anwar Sales Ecosystem - Unified API Endpoint')
        .setMimeType(ContentService.MimeType.JSON);
    }, { event: e }, 'doGet');
  }

  /**
   * Handles all incoming form submissions.
   * @param {Object} e - The event parameter from the Apps Script trigger.
   */
  onFormSubmit(e) {
    this.executeWithErrorHandling(() => {
      const formId = e.source.getId();
      const service = this.serviceMap[formId];

      if (service && typeof service.onFormSubmit === 'function') {
        this.logger.info('Routing form submission', { formId });
        service.onFormSubmit(e);
      } else {
        throw new AppScriptError('ROUTING_FORM_NOT_FOUND', `No handler configured for form ID: ${formId}`, { formId });
      }
    }, { event: e }, 'onFormSubmit');
  }

  /**
   * Handles all incoming sheet edits.
   * @param {Object} e - The event parameter from the Apps Script trigger.
   */
  onEdit(e) {
    this.executeWithErrorHandling(() => {
      const sheetName = e.range.getSheet().getName();
      const service = this.serviceMap[sheetName];

      if (service && typeof service.onEdit === 'function') {
        this.logger.info('Routing sheet edit', { sheetName });
        service.onEdit(e);
      } else {
        this.logger.debug('No specific edit handler for sheet', { sheetName });
      }
    }, { event: e }, 'onEdit');
  }
}

// Create a single global instance of the MainHandlerService
const mainHandlerService = new MainHandlerService();

// --- Legacy Wrapper Functions ---
// These functions provide backward compatibility for triggers and other scripts
// that might still call the old function names.

/**
 * @deprecated since v2.0.0. Use mainHandlerService.doGet(e)
 */
function doGet(e) {
  return mainHandlerService.doGet(e);
}

/**
 * @deprecated since v2.0.0. Use mainHandlerService.onFormSubmit(e)
 */
function onFormSubmit(e) {
  mainHandlerService.onFormSubmit(e);
}

/**
 * @deprecated since v2.0.0. Use mainHandlerService.onEdit(e)
 */
function onEdit(e) {
  mainHandlerService.onEdit(e);
}

/**
 * Time-based trigger for legacy functionality.
 * This can be refactored into a dedicated service if needed.
 * @deprecated
 */
function initializeNewSheets() {
  // This function call should be updated if LegacyInitializer is refactored.
  // For now, it's wrapped to ensure it benefits from any future top-level error handling.
  try {
    LegacyInitializer.initializeNewSheets();
  } catch (error) {
    // If a global error handler is available, use it.
    // For now, logging to the console.
    console.error('Error during legacy sheet initialization:', error);
  }
}

/**
 * Setup function for the production environment.
 * This should be migrated to a dedicated SetupService or DeploymentService.
 * @deprecated
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