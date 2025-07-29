/**
 * CRMHandler.js
 * Handles CRM related events and updates.
 */

var CRMHandler = (function() {
  var CRM_SPREADSHEET_ID = Config.CRM_SPREADSHEET_ID;

  function onEdit(e) {
    var range = e.range;
    var sheet = range.getSheet();
    var sheetName = sheet.getName();

    // Only handle edits in CRM sheets
    if (!sheetName.endsWith('Approvals')) return;

    var statusColumn = sheetName === 'Engineer Approvals' ? 7 :
                       sheetName === 'Potential Site Approvals' ? 15 :
                       sheetName === 'Retailer Approvals' ? 9 : null;

    if (statusColumn === null || range.getColumn() !== statusColumn) return;

    var status = range.getValue();
    if (status !== 'Approved' && status !== 'Rejected') return;

    var row = range.getRow();
    var rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];

    var message = '';
    var phone = '';

    if (sheetName === 'Engineer Approvals') {
      phone = rowData[3];
      message = 'Engineer Registration Update\n' +
                'Submission ID: ' + rowData[5] + '\n' +
                'Name: ' + rowData[2] + '\n' +
                'Phone: ' + phone + '\n' +
                'Territory: ' + rowData[4] + '\n' +
                'Status: ' + status + '\n' +
                'Update Date: ' + new Date().toLocaleString() + '\n' +
                'Notes: ' + rowData[7];
    } else if (sheetName === 'Potential Site Approvals') {
      phone = rowData[4];
      message = 'Potential Site Registration Update\n' +
                'Submission ID: ' + rowData[11] + '\n' +
                'BD Territory: ' + rowData[2] + '\n' +
                'Project Owner Name: ' + rowData[3] + '\n' +
                'Project Owner Phone: ' + phone + '\n' +
                'Detailed Address: ' + rowData[5] + '\n' +
                'Work Order Quantity: ' + rowData[7] + '\n' +
                'Business Units: ' + rowData[8] + '\n' +
                'Estimated Start: ' + rowData[9] + '\n' +
                'Estimated End: ' + rowData[10] + '\n' +
                'Status: ' + status + '\n' +
                'Update Date: ' + new Date().toLocaleString() + '\n' +
                'Notes: ' + rowData[15];
    } else if (sheetName === 'Retailer Approvals') {
      phone = rowData[5];
      message = 'Retailer Registration Update\n' +
                'Submission ID: ' + rowData[7] + '\n' +
                'SR Name: ' + rowData[2] + '\n' +
                'SR Phone: ' + rowData[3] + '\n' +
                'Retailer Name: ' + rowData[4] + '\n' +
                'Retailer Phone: ' + phone + '\n' +
                'Territory: ' + rowData[6] + '\n' +
                'Status: ' + status + '\n' +
                'Update Date: ' + new Date().toLocaleString() + '\n' +
                'Notes: ' + rowData[9];
    }

    WhatsAppService.sendMessage(phone, message);
  }

  return {
    onEdit: onEdit
  };
})();