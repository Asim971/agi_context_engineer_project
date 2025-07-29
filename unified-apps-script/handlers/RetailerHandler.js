/**
 * RetailerHandler.js
 * Handles retailer registration flow and CRM events.
 */

var RetailerHandler = (function() {
  var SPREADSHEET_ID = Config.RETAILER_FORM_ID;
  var CRM_SPREADSHEET_ID = Config.CRM_SPREADSHEET_ID;

  function doGet(e) {
    return ContentService.createTextOutput('Hello, Anwar Sales Management System - Retailer Registration!');
  }

  function onFormSubmit(e) {
    var originalSs = SpreadsheetApp.openById(SPREADSHEET_ID);
    var crmSs = SpreadsheetApp.openById(CRM_SPREADSHEET_ID);
    var responseSheet = originalSs.getSheetByName('Form Responses 1');
    var crmSheet = crmSs.getSheetByName('Retailer Approvals');

    if (!responseSheet || !crmSheet) {
      Logger.log('One or more sheets not found.');
      return;
    }

    var response = e.values;
    var timestamp = response[0];
    var submitterEmail = response[1];
    var srName = response[2];
    var srPhone = response[3];
    var retailerName = response[4];
    var retailerPhone = response[5];
    var territory = response[6];

    var submissionId = Utilities.getUuid();
    var status = 'Pending';
    var notes = '';

    var row = [timestamp, submitterEmail, srName, srPhone, retailerName, retailerPhone, territory, submissionId, status, notes];
    crmSheet.appendRow(row);

    var message = 'New Retailer Registration Submission\n' +
                  'Submission ID: ' + submissionId + '\n' +
                  'SR Name: ' + srName + '\n' +
                  'SR Phone: ' + srPhone + '\n' +
                  'Retailer Name: ' + retailerName + '\n' +
                  'Retailer Phone: ' + retailerPhone + '\n' +
                  'Territory: ' + territory + '\n' +
                  'Status: ' + status + '\n' +
                  'Submission Date: ' + timestamp;

    WhatsAppService.sendMessage(retailerPhone, message);
  }

  function onEdit(e) {
    var range = e.range;
    var sheet = range.getSheet();
    if (sheet.getName() !== 'Retailer Approvals' || range.getColumn() !== 9) return;

    var status = range.getValue();
    if (status !== 'Approved' && status !== 'Rejected') return;

    var row = range.getRow();
    var rowData = sheet.getRange(row, 1, 1, 10).getValues()[0];
    var timestamp = rowData[0];
    var submitterEmail = rowData[1];
    var srName = rowData[2];
    var srPhone = rowData[3];
    var retailerName = rowData[4];
    var retailerPhone = rowData[5];
    var territory = rowData[6];
    var submissionId = rowData[7];
    var notes = rowData[9];

    var message = 'Retailer Registration Update\n' +
                  'Submission ID: ' + submissionId + '\n' +
                  'SR Name: ' + srName + '\n' +
                  'SR Phone: ' + srPhone + '\n' +
                  'Retailer Name: ' + retailerName + '\n' +
                  'Retailer Phone: ' + retailerPhone + '\n' +
                  'Territory: ' + territory + '\n' +
                  'Status: ' + status + '\n' +
                  'Update Date: ' + new Date().toLocaleString() + '\n' +
                  'Notes: ' + notes;

    WhatsAppService.sendMessage(retailerPhone, message);
  }

  return {
    doGet: doGet,
    onFormSubmit: onFormSubmit,
    onEdit: onEdit
  };
})();