/**
 * PotentialSiteHandler.js
 * Handles potential site registration flow and CRM events
 * Updated for unified Anwar Sales Ecosystem
 */

var PotentialSiteHandler = (function() {
  
  function doGet(e) {
    return ContentService
      .createTextOutput('Anwar Sales Ecosystem - Potential Site Registration')
      .setMimeType(ContentService.MimeType.TEXT);
  }

  function onFormSubmit(e) {
    try {
      const headers = Config.HEADERS.POTENTIAL_SITE;
      const data = {};
      headers.forEach((header, i) => {
        if (i < e.values.length) {
          data[header] = e.values[i];
        }
      });

      data['Status'] = 'Pending';
      // ID will be generated upon approval

      // Insert into potential site sheet
      var rowNumber = getGlobalDB().insertRecord(Config.SHEETS.POTENTIAL_SITE, data);
      
      // Also insert into legacy new potential site sheet
      getGlobalDB().insertRecord(Config.NEW_POTENTIAL_SITE_SHEET_NAME, data);

      // Find BD user and send notification
      var bdUsers = getGlobalDB().findRecords(Config.USERS_SHEET_NAME, { 'Territory/Bazaar': data['BD Territory'], 'Role': 'BD' });
      if (bdUsers.length > 0) {
        var message = WhatsAppService.formatMessage(
          'New Potential Site Registration in your territory ({{BD Territory}})\nID: {{ID}}\nOwner: {{Project Owner Name}}\nPhone: {{Project Owner Phone}}\nAddress: {{Detailed Address}}\nStatus: {{Status}}',
          data
        );
        WhatsAppService.sendMessage(bdUsers[0]['Phone'], message);
      } else {
        console.error('No BD user found for territory: ' + data['BD Territory']);
      }
      
      console.log('Potential site registration processed: ' + data.ID);
      
    } catch (error) {
      console.error('Error processing potential site registration: ' + error.toString());
    }
  }

  function onEdit(e) {
    var range = e.range;
    var sheet = range.getSheet();
    
    if (sheet.getName() !== Config.SHEETS.POTENTIAL_SITE || range.getColumn() !== 10) return;

    var status = range.getValue();
    var statusColumnIndex = Config.HEADERS.POTENTIAL_SITE.indexOf('Status') + 1;
    if (sheet.getName() !== Config.SHEETS.POTENTIAL_SITE || range.getColumn() !== statusColumnIndex) return;

    if (status !== 'Approved') return;

    var row = range.getRow();
    var records = getGlobalDB().getAllRecords(Config.SHEETS.POTENTIAL_SITE);
    var record = records[row - 2];
    
    if (record) {
      const id = IdService.getNextId('Potential Site');
      const idColumnIndex = Config.HEADERS.POTENTIAL_SITE.indexOf('ID') + 1;
      if (idColumnIndex > 0) {
        sheet.getRange(row, idColumnIndex).setValue(id);
        record['ID'] = id; // Update record for notification
      } else {
        console.error('ID column not found in Potential Site sheet.');
      }
      var message = WhatsAppService.formatMessage(
        'Potential Site Update\nID: {{ID}}\nOwner: {{Project Owner Name}}\nStatus: {{Status}}\nUpdated: {{Timestamp}}',
        {
          ID: record.ID,
          'Project Owner Name': record['Project Owner Name'],
          Status: status,
          Timestamp: new Date().toLocaleString()
        }
      );
      
      // Notify BD
      var bdUsers = getGlobalDB().findRecords(Config.USERS_SHEET_NAME, { 'Territory/Bazaar': record['BD Territory'], 'Role': 'BD' });
      if (bdUsers.length > 0) {
        WhatsAppService.sendMessage(bdUsers[0]['Phone'], message);
      } else {
        console.error('No BD user found for territory: ' + record['BD Territory']);
      }

      // Notify all CROs
      var croUsers = getGlobalDB().findRecords(Config.USERS_SHEET_NAME, { 'Role': 'CRO' });
      croUsers.forEach(function(cro) {
        WhatsAppService.sendMessage(cro['Phone'], message);
      });

      console.log('Potential site status updated and notifications sent: ' + record.ID + ' - ' + status);
    }
  }

  return {
    doGet: doGet,
    onFormSubmit: onFormSubmit,
    onEdit: onEdit
  };
})();