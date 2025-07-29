/**
 * EngineerHandler.js
 * Handles engineer registration flow and CRM events
 * Updated for unified Anwar Sales Ecosystem
 */

var EngineerHandler = (function() {
  
  function doGet(e) {
    return ContentService
      .createTextOutput('Anwar Sales Ecosystem - Engineer Registration')
      .setMimeType(ContentService.MimeType.TEXT);
  }

  function onFormSubmit(e) {
    try {
      const headers = Config.HEADERS.ENGINEER;
      const data = {};
      headers.forEach((header, i) => {
        if (i < e.values.length) {
          data[header] = e.values[i];
        }
      });

      data['Status'] = 'Pending';
      // ID will be generated upon approval

      // Insert into engineer sheet
      var rowNumber = getGlobalDB().insertRecord(Config.SHEETS.ENGINEER, data);
      
      // Also insert into legacy new engineer sheet for backward compatibility
      getGlobalDB().insertRecord(Config.NEW_ENGINEER_SHEET_NAME, data);

      // Send WhatsApp notification
      var message = WhatsAppService.formatMessage(
        'New Engineer Registration\nID: {{ID}}\nName: {{Name}}\nPhone: {{Phone}}\nTerritory: {{Territory}}\nStatus: {{Status}}',
        data
      );
      
      WhatsAppService.sendMessage(data.Phone, message);
      
      console.log('Engineer registration processed: ' + data.ID);
      
    } catch (error) {
      console.error('Error processing engineer registration: ' + error.toString());
    }
  }

  function onEdit(e) {
    var range = e.range;
    var sheet = range.getSheet();
    
    var statusColumnIndex = Config.HEADERS.ENGINEER.indexOf('Status') + 1;
    if (sheet.getName() !== Config.SHEETS.ENGINEER || range.getColumn() !== statusColumnIndex) return;

    var status = range.getValue();
    if (status !== 'Approved') return;

    var row = range.getRow();
    var records = getGlobalDB().getAllRecords(Config.SHEETS.ENGINEER);
    var record = records[row - 2]; // Adjust for header and 0-based index
    
    if (record) {
      const id = IdService.getNextId('Engineer');
      const idColumnIndex = Config.HEADERS.ENGINEER.indexOf('ID') + 1;
      if (idColumnIndex > 0) {
        sheet.getRange(row, idColumnIndex).setValue(id);
        record['ID'] = id; // Update record for notification
      } else {
        console.error('ID column not found in Engineer sheet.');
      }
      var message = WhatsAppService.formatMessage(
        'Engineer Registration Update\nID: {{ID}}\nName: {{Name}}\nStatus: {{Status}}\nUpdated: {{Timestamp}}',
        {
          ID: record.ID,
          Name: record.Name,
          Status: status,
          Timestamp: new Date().toLocaleString()
        }
      );
      
      // Notify all CROs
      var croUsers = getGlobalDB().findRecords(Config.USERS_SHEET_NAME, { 'Role': 'CRO' });
      croUsers.forEach(function(cro) {
        WhatsAppService.sendMessage(cro['Phone'], message);
      });

      console.log('Engineer status updated and notifications sent: ' + record.ID + ' - ' + status);
    }
  }

  return {
    doGet: doGet,
    onFormSubmit: onFormSubmit,
    onEdit: onEdit
  };
})();