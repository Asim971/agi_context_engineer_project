/**
 * @fileoverview Main script for Anwar Sales Management System - Engineer Registration.
 * This file contains the entry point functions for the Engineer Registration flow.
 *
 * Architecture Alignment:
 * - ADR-001: Using Google Apps Script as runtime.
 * - ADR-002: Google Sheets as MVP database.
 */

function doGet(e) {
  // Basic web app test function
  return ContentService.createTextOutput('Hello, Anwar Sales Management System - Engineer Registration!');
}

function testFunction() {
  // Simple test function
  Logger.log('Test successful');
}

var SPREADSHEET_ID = '14tOYI3nTkB4rgn2Rc9kvIgZTo9KuHmUGD4DQui5oGzU'; // Engineer Form Responses Sheet ID

var CRM_SPREADSHEET_ID = '1S06FspVASoTMd2v0khQ6WPJ59JCvdoyz2aDllPpPNh8'; // Existing CRM Spreadsheet ID

function setupTriggers() {
  ScriptApp.newTrigger('onFormSubmit')
    .forSpreadsheet(SPREADSHEET_ID)
    .onFormSubmit()
    .create();
}

function onFormSubmit(e) {
  Logger.log('onFormSubmit triggered');
  Logger.log('Event values: ' + JSON.stringify(e.values));
  var originalSs = SpreadsheetApp.openById(SPREADSHEET_ID);
  var crmSs = SpreadsheetApp.openById(CRM_SPREADSHEET_ID);
  var responseSheet = originalSs.getSheetByName('Form Responses 1');
  var crmSheet = crmSs.getSheetByName('Engineer Approvals');
  var croSheet = originalSs.getSheetByName('cro_reg'); // Assuming same CRO sheet or adjust if different

  if (!responseSheet || !crmSheet || !croSheet) {
    Logger.log('One or more sheets not found.');
    return;
  }

  var response = e.values;
  var timestamp = response[0];
  var submitterEmail = response[1];
  var engineerName = response[2];
  var mobileNo = response[3];
  var addressOrg = response[4];
  var designation = response[5];
  var district = response[6];
  var thana = response[7];
  var bdOfficer = response[8];
  var idNo = response[9];
  var engineerEmail = response[10];
  var education = response[11];
  var classification = response[12];
  var remarks = response[13];

  var submissionId = Utilities.getUuid();
  var status = 'Pending';
  var notes = '';

  var row = [timestamp, submitterEmail, engineerName, mobileNo, addressOrg, designation, district, thana, bdOfficer, idNo, engineerEmail, education, classification, remarks, submissionId, status, notes];
  crmSheet.appendRow(row);

  var croData = croSheet.getDataRange().getValues();
  var croPhone = null;
  for (var i = 1; i < croData.length; i++) {
    if (croData[i][0] === submitterEmail) {
      croPhone = croData[i][2];
      break;
    }
  }

  if (croPhone) {
    var croMessage = 'New Engineer Registration Submission\n' +
                     'Submission ID: ' + submissionId + '\n' +
                     'Engineer Name: ' + engineerName + '\n' +
                     'Mobile: ' + mobileNo + '\n' +
                     'ID No: ' + idNo + '\n' +
                     'Email: ' + engineerEmail + '\n' +
                     'District: ' + district + '\n' +
                     'Thana: ' + thana + '\n' +
                     'Classification: ' + classification + '\n' +
                     'Status: ' + status + '\n' +
                     'Submission Date: ' + timestamp;
    Logger.log('Sending message to CRO phone: ' + croPhone);
    Logger.log('Message: ' + croMessage);
    sendWhatsAppMessage(croPhone, croMessage);
    Logger.log('Message sent to ' + croPhone);
  } else {
    Logger.log('No CRO phone found for email: ' + submitterEmail);
  }
}

function sendWhatsAppMessage(phone, message) {
  Logger.log('sendWhatsAppMessage called with phone: ' + phone + ' and message: ' + message);
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
  try {
    var response = UrlFetchApp.fetch(url, options);
    Logger.log('WhatsApp API response: ' + response.getContentText());
  } catch (error) {
    Logger.log('Error sending WhatsApp message: ' + error.toString());
  }
}

function importMissingResponses() {
  var originalSs = SpreadsheetApp.openById(SPREADSHEET_ID);
  var crmSs = SpreadsheetApp.openById(CRM_SPREADSHEET_ID);
  var responseSheet = originalSs.getSheetByName('Form Responses 1');
  var crmSheet = crmSs.getSheetByName('Engineer Approvals');
  var croSheet = originalSs.getSheetByName('cro_reg');

  if (!responseSheet || !crmSheet || !croSheet) {
    Logger.log('One or more sheets not found.');
    return;
  }

  var responseData = responseSheet.getDataRange().getValues();
  var crmData = crmSheet.getDataRange().getValues();

  // Create a map of existing entries in CRM (using timestamp + engineerName + mobileNo as key)
  var crmKeys = new Set();
  for (var i = 1; i < crmData.length; i++) {
    var key = crmData[i][0] + '|' + crmData[i][2] + '|' + crmData[i][3];
    crmKeys.add(key);
  }

  var missingRows = [];
  var messages = [];
  var croData = croSheet.getDataRange().getValues(); // Load once outside loop

  for (var j = 1; j < responseData.length; j++) {
    var resp = responseData[j];
    var timestamp = resp[0];
    var submitterEmail = resp[1];
    var engineerName = resp[2];
    var mobileNo = resp[3];
    var addressOrg = resp[4];
    var designation = resp[5];
    var district = resp[6];
    var thana = resp[7];
    var bdOfficer = resp[8];
    var idNo = resp[9];
    var engineerEmail = resp[10];
    var education = resp[11];
    var classification = resp[12];
    var remarks = resp[13];

    var key = timestamp + '|' + engineerName + '|' + mobileNo;
    if (!crmKeys.has(key)) {
      var submissionId = Utilities.getUuid();
      var status = 'Pending';
      var notes = '';

      missingRows.push([timestamp, submitterEmail, engineerName, mobileNo, addressOrg, designation, district, thana, bdOfficer, idNo, engineerEmail, education, classification, remarks, submissionId, status, notes]);

      var croPhone = null;
      for (var k = 1; k < croData.length; k++) {
        if (croData[k][0] === submitterEmail) {
          croPhone = croData[k][2];
          break;
        }
      }
      if (croPhone) {
        var croMessage = 'New Engineer Registration Submission\n' +
                         'Submission ID: ' + submissionId + '\n' +
                         'Engineer Name: ' + engineerName + '\n' +
                         'Mobile: ' + mobileNo + '\n' +
                         'ID No: ' + idNo + '\n' +
                         'Email: ' + engineerEmail + '\n' +
                         'District: ' + district + '\n' +
                         'Thana: ' + thana + '\n' +
                         'Classification: ' + classification + '\n' +
                         'Status: ' + status + '\n' +
                         'Submission Date: ' + timestamp;
        messages.push({phone: croPhone, message: croMessage});
      }

      if (missingRows.length % 100 === 0) {
        appendBatchToSheet(crmSheet, missingRows);
        missingRows = [];
        sendBatchMessages(messages);
        messages = [];
        Utilities.sleep(2000); // 2 second delay to avoid quotas/time limits
      }
    }
  }

  // Append remaining
  if (missingRows.length > 0) {
    appendBatchToSheet(crmSheet, missingRows);
    sendBatchMessages(messages);
  }

  Logger.log('Added ' + (missingRows.length + (100 * Math.floor((responseData.length - 1) / 100))) + ' missing responses to Engineer Approvals sheet.'); // Approximate count
}

function appendBatchToSheet(sheet, rows) {
  if (rows.length === 0) return;
  var startRow = sheet.getLastRow() + 1;
  sheet.getRange(startRow, 1, rows.length, rows[0].length).setValues(rows);
}

function sendBatchMessages(messages) {
  for (var m = 0; m < messages.length; m++) {
    sendWhatsAppMessage(messages[m].phone, messages[m].message);
    if (m % 10 === 0 && m > 0) {
      Utilities.sleep(1000); // 1 second delay every 10 messages
    }
  }
}


function createCROregSheet() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('cro_reg');
  if (!sheet) {
    sheet = ss.insertSheet('cro_reg');
    var headers = ['CRO Email', 'CRO Name', 'Phone Number'];
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    // Add any data validation or formatting if needed
  } else {
    Logger.log('cro_reg sheet already exists.');
  }
}