const ORIGINAL_SPREADSHEET_ID = '1PcSe4FHFs2kojm6cLYlYuS73HGFGJ7iMrpdUt8i8Gbw';
const CRM_SPREADSHEET_ID = '1S06FspVASoTMd2v0khQ6WPJ59JCvdoyz2aDllPpPNh8';

function setupCRMSheet() {
  var ss = SpreadsheetApp.openById(CRM_SPREADSHEET_ID);
  var sheet = ss.getSheetByName('CRM Approvals') || ss.insertSheet('CRM Approvals');
  var headers = ['Timestamp', 'Email Address', 'Contractor Name', 'Bkash Number', 'Contact Number', 'NID No', 'NID Upload', 'Submission ID', 'Status', 'Notes'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Set up data validation for Status column (column 9)
  var statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Pending', 'In-Progress', 'Approved', 'Rejected'], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(2, 9, sheet.getMaxRows() - 1, 1).setDataValidation(statusRule);
}

function onEdit(e) {
  var range = e.range;
  var sheet = range.getSheet();
  if (sheet.getName() !== 'CRM Approvals' || range.getColumn() !== 9) return;

  var status = range.getValue();
  if (status !== 'Approved' && status !== 'Rejected') return;

  var row = range.getRow();
  var rowData = sheet.getRange(row, 1, 1, 10).getValues()[0];
  var timestamp = rowData[0];
  var submitterEmail = rowData[1];
  var contractorName = rowData[2];
  var bkashNumber = rowData[3];
  var contactNumber = rowData[4];
  var nidNo = rowData[5];
  var nidUpload = rowData[6];
  var submissionId = rowData[7];
  var notes = rowData[9];

  // Lookup CRO phone from original spreadsheet
  var originalSs = SpreadsheetApp.openById(ORIGINAL_SPREADSHEET_ID);
  var croSheet = originalSs.getSheetByName('cro_reg');
  var croData = croSheet.getDataRange().getValues();
  var croPhone = null;
  for (var i = 1; i < croData.length; i++) {
    if (croData[i][0] === submitterEmail) {
      croPhone = croData[i][2];
      break;
    }
  }

  if (croPhone) {
    var message = 'Contractor Enlistment Update\n' +
                  'Submission ID: ' + submissionId + '\n' +
                  'Contractor Name: ' + contractorName + '\n' +
                  'Mobile: ' + contactNumber + '\n' +
                  'NID: ' + nidNo + '\n' +
                  'Payment Number: ' + bkashNumber + '\n' +
                  'Remarks: ' + nidUpload + '\n' +
                  'Status: ' + status + '\n' +
                  'Update Date: ' + new Date().toLocaleString() + '\n' +
                  'Notes: ' + notes;
    sendWhatsAppMessage(croPhone, message);
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
