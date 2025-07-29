/**
 * RetailerHandler.js
 * Handles retailer registration flow and CRM events
 * Updated for unified Anwar Sales Ecosystem
 */

var RetailerHandler = (function() {
  
  function doGet(e) {
    return ContentService
      .createTextOutput('Anwar Sales Ecosystem - Retailer Registration')
      .setMimeType(ContentService.MimeType.TEXT);
  }

  function onFormSubmit(e) {
    try {
      const headers = Config.HEADERS.RETAILER;
      const data = {};
      headers.forEach((header, i) => {
        if (i < e.values.length) {
          data[header] = e.values[i];
        }
      });

      data['Status'] = 'Pending';
      // ID will be generated upon approval

      // Insert into retailer sheet
      var rowNumber = getGlobalDB().insertRecord(Config.SHEETS.RETAILER, data);
      
      // Also insert into legacy new retailer sheet
      getGlobalDB().insertRecord(Config.NEW_RETAILER_SHEET_NAME, data);

      // Find SR user and send notification
      var srUsers = getGlobalDB().findRecords(Config.USERS_SHEET_NAME, { 'Territory/Bazaar': data['Territory'], 'Role': 'SR' });
      if (srUsers.length > 0) {
        var message = WhatsAppService.formatMessage(
          'New Retailer Registration in your territory ({{Territory}})\nID: {{ID}}\nRetailer: {{Retailer Name}}\nPhone: {{Retailer Phone}}\nStatus: {{Status}}',
          data
        );
        WhatsAppService.sendMessage(srUsers[0]['Phone'], message);
      } else {
        console.error('No SR user found for territory: ' + data['Territory']);
      }
      
      console.log('Retailer registration processed: ' + data.ID);
      
    } catch (error) {
      console.error('Error processing retailer registration: ' + error.toString());
    }
  }

  function onEdit(e) {
    var range = e.range;
    var sheet = range.getSheet();
    
    var statusColumnIndex = Config.HEADERS.RETAILER.indexOf('Status') + 1;
    if (sheet.getName() !== Config.SHEETS.RETAILER || range.getColumn() !== statusColumnIndex) return;

    var status = range.getValue();
    if (status !== 'Approved') return;

    var row = range.getRow();
    var records = getGlobalDB().getAllRecords(Config.SHEETS.RETAILER);
    var record = records[row - 2];
    
    if (record) {
      const id = IdService.getNextId('Retailer');
      const idColumnIndex = Config.HEADERS.RETAILER.indexOf('ID') + 1;
      if (idColumnIndex > 0) {
        sheet.getRange(row, idColumnIndex).setValue(id);
        record['ID'] = id; // Update record for notification
      } else {
        console.error('ID column not found in Retailer sheet.');
      }
      var message = WhatsAppService.formatMessage(
        'Retailer Update\nID: {{ID}}\nRetailer: {{Retailer Name}}\nStatus: {{Status}}\nUpdated: {{Timestamp}}',
        {
          ID: record.ID,
          'Retailer Name': record['Retailer Name'],
          Status: status,
          Timestamp: new Date().toLocaleString()
        }
      );
      
      // Notify SR
      var srUsers = getGlobalDB().findRecords(Config.USERS_SHEET_NAME, { 'Territory/Bazaar': record['Territory'], 'Role': 'SR' });
      if (srUsers.length > 0) {
        WhatsAppService.sendMessage(srUsers[0]['Phone'], message);
      } else {
        console.error('No SR user found for territory: ' + record['Territory']);
      }

      console.log('Retailer status updated and notification sent: ' + record.ID + ' - ' + status);
    }
  }

  return {
    doGet: doGet,
    onFormSubmit: onFormSubmit,
    onEdit: onEdit
  };
})();