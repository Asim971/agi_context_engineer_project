/**
 * MigrationService.js
 * Handles data migration and backfilling from legacy forms
 */

var MigrationService = (function() {

  function importFromAllForms() {
    console.log('Starting legacy form data import...');
    importFormData(Config.EXISTING_ENGINEER_FORM_ID, Config.SHEETS.ENGINEER, 'ENG');
    importFormData(Config.EXISTING_POTENTIAL_SITE_FORM_ID, Config.SHEETS.POTENTIAL_SITE, 'PS');
    importFormData(Config.EXISTING_RETAILER_FORM_ID, Config.SHEETS.RETAILER, 'RTL');
    console.log('Legacy form data import finished.');
  }

  function importFormData(formId, sheetName, idPrefix) {
    if (!formId) {
      console.log('No legacy form ID for ' + sheetName + ', skipping import.');
      return;
    }

    try {
      var form = FormApp.openById(formId);
      var responses = form.getResponses();
      var sheet = getGlobalDB().getSheet(sheetName);
      var existingIds = getGlobalDB().getAllRecords(sheetName).map(function(r) { return r.ID; });

      responses.forEach(function(response) {
        var responseId = response.getId();
        if (existingIds.indexOf(responseId) === -1) {
          var itemResponses = response.getItemResponses();
          var data = {};
          // This mapping is highly dependent on form structure and needs careful implementation
          // For now, we'll just log it
          console.log('New response found, needs mapping logic: ' + responseId);
          // Example of how it might work:
          // data['Timestamp'] = response.getTimestamp();
          // data['ID'] = DB.getNextId(sheetName, idPrefix);
          // ... map other fields ...
          // DB.insertRecord(sheetName, data);
        }
      });
    } catch (error) {
      console.error('Error importing from form ' + formId + ': ' + error.toString());
    }
  }

  return {
    importFromAllForms: importFromAllForms
  };

})();