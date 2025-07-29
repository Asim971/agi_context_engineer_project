const ORIGINAL_SPREADSHEET_ID = '1LBy0y-emr08r1ccJoOzuDe7oIw2VS4hUJGFi3s_0NHE';
const CRM_SPREADSHEET_ID = '1S06FspVASoTMd2v0khQ6WPJ59JCvdoyz2aDllPpPNh8';

function setupCRMSheet() {
  var ss = SpreadsheetApp.openById(CRM_SPREADSHEET_ID);
  var sheet = ss.getSheetByName('Retailer Approvals') || ss.insertSheet('Retailer Approvals');
  var headers = ['Timestamp', 'Email Address', 'Shop Name', 'Proprietor Name', 'Shop Address', 'Bazaar Name', 'Phone Number', 'Bkash Number', 'NID', 'Upload NID Image', 'Submission ID', 'SR Whatsapp', 'Status', 'Notes'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Set up data validation for Status column (column 13)
  var statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Pending', 'In-Progress', 'Approved', 'Rejected'], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(2, 13, sheet.getMaxRows() - 1, 1).setDataValidation(statusRule);
}

function onEdit(e) {
  Logger.log('onEdit triggered');
  var range = e.range;
  var sheet = range.getSheet();
  if (sheet.getName() !== 'Retailer Approvals' || range.getColumn() !== 13) {
    Logger.log('Edit not in Retailer Approvals or not in column 13');
    return;
  }

  var status = range.getValue();
  Logger.log('Status changed to: ' + status);
  if (status !== 'Approved' && status !== 'Rejected') {
    Logger.log('Status not Approved or Rejected');
    return;
  }

  var row = range.getRow();
  var rowData = sheet.getRange(row, 1, 1, 14).getValues()[0];
  Logger.log('Row data: ' + JSON.stringify(rowData));
  var timestamp = rowData[0];
  var emailAddress = rowData[1];
  var shopName = rowData[2];
  var proprietorName = rowData[3];
  var shopAddress = rowData[4];
  var bazaarName = rowData[5];
  var phoneNumber = rowData[6];
  var bkashNumber = rowData[7];
  var nid = rowData[8];
  var uploadNidImage = rowData[9];
  var submissionId = rowData[10];
  var srWhatsapp = rowData[11];
  var notes = rowData[13];

  if (srWhatsapp) {
    var message = 'Retailer Registration Update\n' +
                  'Submission ID: ' + submissionId + '\n' +
                  'Shop Name: ' + shopName + '\n' +
                  'Proprietor Name: ' + proprietorName + '\n' +
                  'Phone Number: ' + phoneNumber + '\n' +
                  'Bazaar Name: ' + bazaarName + '\n' +
                  'Bkash Number: ' + bkashNumber + '\n' +
                  'NID: ' + nid + '\n' +
                  'Status: ' + status + '\n' +
                  'Update Date: ' + new Date().toLocaleString() + '\n' +
                  'Notes: ' + notes;
    Logger.log('Sending message to ' + srWhatsapp + ': ' + message);
    try {
      sendWhatsAppMessage(srWhatsapp, message);
      Logger.log('Message sent successfully');
    } catch (error) {
      Logger.log('Error sending message: ' + error);
    }
  } else {
    Logger.log('No srWhatsapp found for this row');
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