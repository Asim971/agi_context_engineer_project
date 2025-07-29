/**
 * BDLeadHandler.js
 * Handles BD Lead registration flow and CRM events
 */

var BDLeadHandler = (function() {
  
  function doGet(e) {
    return ContentService
      .createTextOutput('Anwar Sales Ecosystem - BD Lead Registration')
      .setMimeType(ContentService.MimeType.TEXT);
  }

  function onFormSubmit(e) {
    try {
      const headers = Config.HEADERS.BD_LEAD;
      const data = {};
      headers.forEach((header, i) => {
        if (i < e.values.length) {
          data[header] = e.values[i];
        }
      });

      data['Status'] = 'Pending';
      // ID will be generated upon approval

      // Insert into BD Lead sheet
      var rowNumber = getGlobalDB().insertRecord(Config.SHEETS.BD_LEAD, data);
      
      console.log('BD Lead registration processed: ' + data.ID);
      
    } catch (error) {
      console.error('Error processing BD Lead registration: ' + error.toString());
    }
  }

  function onEdit(e) {
    var range = e.range;
    var sheet = range.getSheet();
    
    var statusColumnIndex = Config.HEADERS.BD_LEAD.indexOf('Status') + 1;
    if (sheet.getName() !== Config.SHEETS.BD_LEAD || range.getColumn() !== statusColumnIndex) return;

    var status = range.getValue();
    if (status !== 'Approved') return;

    var row = range.getRow();
    var records = getGlobalDB().getAllRecords(Config.SHEETS.BD_LEAD);
    var record = records[row - 2]; // Adjust for header and 0-based index
    
    if (record) {
      const id = IdService.getNextId('BD Lead');
      const idColumnIndex = Config.HEADERS.BD_LEAD.indexOf('ID') + 1;
      if (idColumnIndex > 0) {
        sheet.getRange(row, idColumnIndex).setValue(id);
        console.log('BD Lead approved and ID generated: ' + id);
      } else {
        console.error('ID column not found in BD Lead sheet.');
      }
    }
  }

  return {
    doGet: doGet,
    onFormSubmit: onFormSubmit,
    onEdit: onEdit
  };
})();