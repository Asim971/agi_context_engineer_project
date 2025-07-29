/**
 * PotentialSiteHandler.js
 * Handles potential site registration flow and CRM events.
 */

var PotentialSiteHandler = (function() {
  var SPREADSHEET_ID = Config.POTENTIAL_SITE_FORM_ID;
  var CRM_SPREADSHEET_ID = Config.CRM_SPREADSHEET_ID;

  function doGet(e) {
    return ContentService.createTextOutput('Hello, Anwar Sales Management System - Potential Site Registration!');
  }

  function onFormSubmit(e) {
    var originalSs = SpreadsheetApp.openById(SPREADSHEET_ID);
    var crmSs = SpreadsheetApp.openById(CRM_SPREADSHEET_ID);
    var responseSheet = originalSs.getSheetByName('Form Responses 1');
    var crmSheet = crmSs.getSheetByName('Potential Site Approvals');

    if (!responseSheet || !crmSheet) {
      Logger.log('One or more sheets not found.');
      return;
    }

    var response = e.values;
    var timestamp = response[0];
    var submitterEmail = response[1];
    var bdTerritory = response[2];
    var projectOwnerName = response[3];
    var projectOwnerPhone = response[4];
    var detailedAddress = response[5];
    var siteVisitImage = response[6];
    var workOrderQuantity = response[7];
    var businessUnits = response[8];
    var estStartBuilding = response[9];
    var estEndBuilding = response[10];

    var submissionId = Utilities.getUuid();
    var status = 'Pending';
    var notes = '';

    var row = [timestamp, submitterEmail, bdTerritory, projectOwnerName, projectOwnerPhone, detailedAddress, siteVisitImage, workOrderQuantity, businessUnits, estStartBuilding, estEndBuilding, submissionId, '', '', status, notes];
    crmSheet.appendRow(row);

    var message = 'New Potential Site Registration Submission\n' +
                  'Submission ID: ' + submissionId + '\n' +
                  'BD Territory: ' + bdTerritory + '\n' +
                  'Project Owner Name: ' + projectOwnerName + '\n' +
                  'Project Owner Phone: ' + projectOwnerPhone + '\n' +
                  'Detailed Address: ' + detailedAddress + '\n' +
                  'Work Order Quantity: ' + workOrderQuantity + '\n' +
                  'Business Units: ' + businessUnits + '\n' +
                  'Estimated Start: ' + estStartBuilding + '\n' +
                  'Estimated End: ' + estEndBuilding + '\n' +
                  'Status: ' + status + '\n' +
                  'Submission Date: ' + timestamp;

    WhatsAppService.sendMessage(projectOwnerPhone, message);
  }

  function onEdit(e) {
    var range = e.range;
    var sheet = range.getSheet();
    if (sheet.getName() !== 'Potential Site Approvals' || range.getColumn() !== 15) return;

    var status = range.getValue();
    if (status !== 'Approved' && status !== 'Rejected') return;

    var row = range.getRow();
    var rowData = sheet.getRange(row, 1, 1, 16).getValues()[0];
    var timestamp = rowData[0];
    var submitterEmail = rowData[1];
    var bdTerritory = rowData[2];
    var projectOwnerName = rowData[3];
    var projectOwnerPhone = rowData[4];
    var detailedAddress = rowData[5];
    var siteVisitImage = rowData[6];
    var workOrderQuantity = rowData[7];
    var businessUnits = rowData[8];
    var estStartBuilding = rowData[9];
    var estEndBuilding = rowData[10];
    var submissionId = rowData[11];
    var statusNotes = rowData[15];

    var message = 'Potential Site Registration Update\n' +
                  'Submission ID: ' + submissionId + '\n' +
                  'BD Territory: ' + bdTerritory + '\n' +
                  'Project Owner Name: ' + projectOwnerName + '\n' +
                  'Project Owner Phone: ' + projectOwnerPhone + '\n' +
                  'Detailed Address: ' + detailedAddress + '\n' +
                  'Work Order Quantity: ' + workOrderQuantity + '\n' +
                  'Business Units: ' + businessUnits + '\n' +
                  'Estimated Start: ' + estStartBuilding + '\n' +
                  'Estimated End: ' + estEndBuilding + '\n' +
                  'Status: ' + status + '\n' +
                  'Update Date: ' + new Date().toLocaleString() + '\n' +
                  'Notes: ' + statusNotes;

    WhatsAppService.sendMessage(projectOwnerPhone, message);
  }

  return {
    doGet: doGet,
    onFormSubmit: onFormSubmit,
    onEdit: onEdit
  };
})();