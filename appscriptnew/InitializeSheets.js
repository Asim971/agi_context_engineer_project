function initializeNewSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // Create new sheets if they don't exist
  var engineerSheet = ss.getSheetByName(Config.NEW_ENGINEER_SHEET_NAME) || ss.insertSheet(Config.NEW_ENGINEER_SHEET_NAME);
  var potentialSiteSheet = ss.getSheetByName(Config.NEW_POTENTIAL_SITE_SHEET_NAME) || ss.insertSheet(Config.NEW_POTENTIAL_SITE_SHEET_NAME);
  var retailerSheet = ss.getSheetByName(Config.NEW_RETAILER_SHEET_NAME) || ss.insertSheet(Config.NEW_RETAILER_SHEET_NAME);
  var crmSheet = ss.getSheetByName(Config.NEW_CRM_SHEET_NAME) || ss.insertSheet(Config.NEW_CRM_SHEET_NAME);

  // Import existing form data from existing sheets
  importExistingFormData(Config.EXISTING_ENGINEER_FORM_ID, engineerSheet);
  importExistingFormData(Config.EXISTING_POTENTIAL_SITE_FORM_ID, potentialSiteSheet);
  importExistingFormData(Config.EXISTING_RETAILER_FORM_ID, retailerSheet);
}

function importExistingFormData(formId, targetSheet) {
  var form = FormApp.openById(formId);
  var responses = form.getResponses();

  if (responses.length === 0) {
    Logger.log('No responses found for form: ' + formId);
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
}