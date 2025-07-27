const SPREADSHEET_ID = '16FOGBAvAS2ac85EaJuUARaQE60wEMAG5oA9Iz4xtA9g';
const CRM_SPREADSHEET_ID = '1S06FspVASoTMd2v0khQ6WPJ59JCvdoyz2aDllPpPNh8';

function setupCRMSheet() {
  var ss = SpreadsheetApp.openById(CRM_SPREADSHEET_ID);
  var sheet = ss.getSheetByName('Potential Site Approvals') || ss.insertSheet('Potential Site Approvals');
  var headers = ['Timestamp', 'Submitter Email', 'BD Territory', 'Project Owner Name', 'Project Owner Phone', 'Detailed Address', 'Site Visit Image', 'Work Order Quantity', 'Business Units', 'Est Start Building', 'Est End Building', 'Submission ID', 'BD Whatsapp', 'CRO Whatsapp', 'Status', 'Notes'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Set up data validation for Status column (column 15)
  var statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Pending', 'In-Progress', 'Approved', 'Rejected'], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(2, 15, sheet.getMaxRows() - 1, 1).setDataValidation(statusRule);
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
  var bdWhatsapp = rowData[12];
  var croWhatsapp = rowData[13];
  var notes = rowData[15];

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
                'Notes: ' + notes;

  if (bdWhatsapp) {
    sendWhatsAppMessage(bdWhatsapp, message);
  }
  if (croWhatsapp) {
    sendWhatsAppMessage(croWhatsapp, message);
  }
}

function sendWhatsAppMessage(phone, message) {
  var url = 'https://api.maytapi.com/api/55968f1b-01dc-4f02-baca-af83b92ca455/90126/sendMessage';
  var payload = {
    'to_number': phone,
    'type': 'text',
    'message': message
  };
  var options = {
    'method': 'post',
    'contentType': 'application/json',
    'payload': JSON.stringify(payload),
    'headers': {
      'x-maytapi-key': '183bcf62-cf0e-4e1d-9f22-59b0a730cd0b'
    }
  };
  UrlFetchApp.fetch(url, options);
  // Note: Replace with actual mytapi credentials
}

function setupTriggers() {
  ScriptApp.newTrigger('onEdit')
    .forSpreadsheet(CRM_SPREADSHEET_ID)
    .onEdit()
    .create();
}