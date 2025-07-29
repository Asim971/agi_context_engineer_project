/**
 * SiteUpdateHandler.js
 * Handles engineer updates to potential sites
 */

var SiteUpdateHandler = (function() {

  function onFormSubmit(e) {
    try {
      const headers = Config.HEADERS.SITE_UPDATE;
      const data = {};
      headers.forEach((header, i) => {
        if (i < e.values.length) {
          data[header] = e.values[i];
        }
      });

      // Log the update in the 'Site Updates' sheet
      getGlobalDB().insertRecord(Config.SITE_UPDATES_SHEET_NAME, data);

      // Find the potential site record
      var siteRecords = getGlobalDB().findRecords(Config.SHEETS.POTENTIAL_SITE, { 'ID': data['Potential Site ID'] });

      if (siteRecords.length > 0) {
        var siteRecord = siteRecords[0];
        var rowToUpdate = siteRecord.rowNumber; // Assuming findRecords returns the row number

        // Update the status in the 'Potential Site CRM' sheet
        getGlobalDB().updateRecord(Config.SHEETS.POTENTIAL_SITE, rowToUpdate, { 'Status': data.Status });

        // Send notification to the BD person for that territory
        var bdUsers = getGlobalDB().findRecords(Config.USERS_SHEET_NAME, { 'Territory/Bazaar': siteRecord['BD Territory'], 'Role': 'BD' });
        if (bdUsers.length > 0) {
          var message = WhatsAppService.formatMessage(
            'Potential Site Updated by Engineer\nID: {{Potential Site ID}}\nEngineer: {{Engineer Name}}\nNew Status: {{Status}}\nNotes: {{Notes}}',
            data
          );
          WhatsAppService.sendMessage(bdUsers[0]['Phone'], message);
        }

        console.log('Site update processed for: ' + data['Potential Site ID']);
      } else {
        console.error('Potential Site not found for update: ' + data['Potential Site ID']);
      }
    } catch (error) {
      console.error('Error processing site update: ' + error.toString());
    }
  }

  return {
    onFormSubmit: onFormSubmit
  };

})();