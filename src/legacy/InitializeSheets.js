/**
 * InitializeSheets.js
 * Legacy functionality from appscriptnew
 * Maintained for backward compatibility
 */

/**
 * Initialize new sheets and import existing form data
 * Legacy functionality preserved for backward compatibility
 */
function initializeNewSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // Create new sheets if they don't exist
  var engineerSheet = ss.getSheetByName(Config.NEW_ENGINEER_SHEET_NAME) || 
                     ss.insertSheet(Config.NEW_ENGINEER_SHEET_NAME);
  
  var potentialSiteSheet = ss.getSheetByName(Config.NEW_POTENTIAL_SITE_SHEET_NAME) || 
                          ss.insertSheet(Config.NEW_POTENTIAL_SITE_SHEET_NAME);
  
  var retailerSheet = ss.getSheetByName(Config.NEW_RETAILER_SHEET_NAME) || 
                     ss.insertSheet(Config.NEW_RETAILER_SHEET_NAME);
  
  var crmSheet = ss.getSheetByName(Config.NEW_CRM_SHEET_NAME) || 
                ss.insertSheet(Config.NEW_CRM_SHEET_NAME);

  // Import existing form data from existing sheets (only if form IDs are defined)
  console.log('Checking existing form IDs:');
  console.log('EXISTING_ENGINEER_FORM_ID:', Config.EXISTING_ENGINEER_FORM_ID);
  console.log('EXISTING_POTENTIAL_SITE_FORM_ID:', Config.EXISTING_POTENTIAL_SITE_FORM_ID);
  console.log('EXISTING_RETAILER_FORM_ID:', Config.EXISTING_RETAILER_FORM_ID);
  
  if (Config.EXISTING_ENGINEER_FORM_ID && Config.EXISTING_ENGINEER_FORM_ID !== '') {
    importExistingFormData(Config.EXISTING_ENGINEER_FORM_ID, engineerSheet);
  }
  
  if (Config.EXISTING_POTENTIAL_SITE_FORM_ID && Config.EXISTING_POTENTIAL_SITE_FORM_ID !== '') {
    importExistingFormData(Config.EXISTING_POTENTIAL_SITE_FORM_ID, potentialSiteSheet);
  }
  
  if (Config.EXISTING_RETAILER_FORM_ID && Config.EXISTING_RETAILER_FORM_ID !== '') {
    importExistingFormData(Config.EXISTING_RETAILER_FORM_ID, retailerSheet);
  }

  console.log('Legacy sheet initialization completed');
}

/**
 * Import existing form data from Google Forms
 * @param {string} formId - The Google Form ID
 * @param {Sheet} targetSheet - The target sheet to import data into
 */
function importExistingFormData(formId, targetSheet) {
  if (!formId || formId === '') {
    console.log('Skipping form import - no form ID provided');
    return;
  }
  
  try {
    var form = FormApp.openById(formId);
    var responses = form.getResponses();

    if (responses.length === 0) {
      console.log('No responses found for form: ' + formId);
      return;
    }

    // Clear target sheet before importing
    targetSheet.clear();

    // Set headers
    var items = form.getItems();
    var headers = items.map(function(item) {
      return item.getTitle();
    });
    targetSheet.appendRow(headers);

    // Append responses
    responses.forEach(function(response) {
      var responseValues = response.getItemResponses().map(function(itemResponse) {
        return itemResponse.getResponse();
      });
      targetSheet.appendRow(responseValues);
    });

    console.log('Imported ' + responses.length + ' responses for form: ' + formId);
    
  } catch (error) {
    console.error('Error importing form data for ' + formId + ': ' + error.toString());
  }
}

/**
 * Legacy initializer wrapper for unified system
 */
var LegacyInitializer = {
  initializeNewSheets: initializeNewSheets,
  importExistingFormData: importExistingFormData
};