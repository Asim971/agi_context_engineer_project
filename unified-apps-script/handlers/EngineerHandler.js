/**
 * EngineerHandler.js
 * Handles engineer registration flow and CRM events.
 */

var EngineerHandler = (function() {
  var SPREADSHEET_ID = Config.ENGINEER_FORM_ID;
  var CRM_SPREADSHEET_ID = Config.CRM_SPREADSHEET_ID;

  function doGet(e) {
    return ContentService.createTextOutput('Hello, Anwar Sales Management System - Engineer Registration!');
  }

  function onFormSubmit(e) {
    var originalSs = SpreadsheetApp.openById(SPREADSHEET_ID);
    var crmSs = SpreadsheetApp.openById(CRM_SPREADSHEET_ID);
    var responseSheet = originalSs.getSheetByName('Form Responses 1');
    var crmSheet = crmSs.getSheetByName('Engineer Approvals');

    if (!responseSheet || !crmSheet) {
      Logger.log('One or more sheets not found.');
      return;
    }

    var response = e.values;
    var timestamp = response[0];
    var emailAddress = response[1];
    var name = response[2];
    var phone = response[3];
    var territory = response[4];
    var submissionId = Utilities.getUuid();
    var status = 'Pending';
    var notes = '';

    var row = [timestamp, emailAddress, name, phone, territory, submissionId, status, notes];
    crmSheet.appendRow(row);

    // Send WhatsApp notification
    var message = 'New Engineer Registration Submission\n' +
                  'Submission ID: ' + submissionId + '\n' +
                  'Name: ' + name + '\n' +
                  'Phone: ' + phone + '\n' +
                  'Territory: ' + territory + '\n' +
                  'Status: ' + status + '\n' +
                  'Submission Date: ' + timestamp;

    WhatsAppService.sendMessage(phone, message);
  }

  function onEdit(e) {
    var range = e.range;
    var sheet = range.getSheet();
    if (sheet.getName() !== 'Engineer Approvals' || range.getColumn() !== 7) return;

    var status = range.getValue();
    if (status !== 'Approved' && status !== 'Rejected') return;

    var row = range.getRow();
    var rowData = sheet.getRange(row, 1, 1, 8).getValues()[0];
    var timestamp = rowData[0];
    var emailAddress = rowData[1];
    var name = rowData[2];
    var phone = rowData[3];
    var territory = rowData[4];
    var submissionId = rowData[5];
    var notes = rowData[7];

    var message = 'Engineer Registration Update\n' +
                  'Submission ID: ' + submissionId + '\n' +
                  'Name: ' + name + '\n' +
                  'Phone: ' + phone + '\n' +
                  'Territory: ' + territory + '\n' +
                  'Status: ' + status + '\n' +
                  'Update Date: ' + new Date().toLocaleString() + '\n' +
                  'Notes: ' + notes;

    WhatsAppService.sendMessage(phone, message);
  }

  return {
    doGet: doGet,
    onFormSubmit: onFormSubmit,
    onEdit: onEdit
  };
})();