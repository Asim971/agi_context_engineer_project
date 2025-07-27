const ORIGINAL_SPREADSHEET_ID = '14tOYI3nTkB4rgn2Rc9kvIgZTo9KuHmUGD4DQui5oGzU';
const CRM_SPREADSHEET_ID = '1S06FspVASoTMd2v0khQ6WPJ59JCvdoyz2aDllPpPNh8';

function setupCRMSheet() {
  var ss = SpreadsheetApp.openById(CRM_SPREADSHEET_ID);
  var sheet = ss.getSheetByName('Engineer Approvals') || ss.insertSheet('Engineer Approvals');
  var headers = ['Timestamp', 'Email Address', 'Engineer\'s Name', 'Mobile No.', 'Address with Organization Name', 'Designation of Organization', 'District Name Of Working Area', 'Thana Of Working Area', 'Concerned BD Officer', 'ID No.', 'Engineer\'s Email Address', 'Educational Background', 'Engineer Classification', 'Remarks', 'Submission ID', 'Status', 'Notes'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Set up data validation for Status column (column 16)
  var statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Pending', 'In-Progress', 'Approved', 'Rejected'], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(2, 16, sheet.getMaxRows() - 1, 1).setDataValidation(statusRule);
}

function onEdit(e) {
  var range = e.range;
  var sheet = range.getSheet();
  if (sheet.getName() !== 'Engineer Approvals' || range.getColumn() !== 16) return;

  var status = range.getValue();
  if (status !== 'Approved' && status !== 'Rejected') return;

  var row = range.getRow();
  var rowData = sheet.getRange(row, 1, 1, 17).getValues()[0];
  var timestamp = rowData[0];
  var submitterEmail = rowData[1];
  var engineerName = rowData[2];
  var mobileNo = rowData[3];
  var addressOrg = rowData[4];
  var designation = rowData[5];
  var district = rowData[6];
  var thana = rowData[7];
  var bdOfficer = rowData[8];
  var idNo = rowData[9];
  var engineerEmail = rowData[10];
  var education = rowData[11];
  var classification = rowData[12];
  var remarks = rowData[13];
  var submissionId = rowData[14];
  var notes = rowData[16];

  // Lookup CRO phone from original spreadsheet (assuming same cro_reg sheet)
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
    var message = 'Engineer Registration Update\n' +
                  'Submission ID: ' + submissionId + '\n' +
                  'Engineer Name: ' + engineerName + '\n' +
                  'Mobile: ' + mobileNo + '\n' +
                  'ID No: ' + idNo + '\n' +
                  'Email: ' + engineerEmail + '\n' +
                  'District: ' + district + '\n' +
                  'Thana: ' + thana + '\n' +
                  'Classification: ' + classification + '\n' +
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