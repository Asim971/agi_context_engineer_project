/**
 * @fileoverview Main script for Anwar Sales Management System.
 * This file contains the entry point functions for the application.
 *
 * Architecture Alignment:
 * - ADR-001: Using Google Apps Script as runtime.
 * - ADR-002: Google Sheets as MVP database.
 */

function doGet(e) {
  // Basic web app test function
  return ContentService.createTextOutput('Hello, Anwar Sales Management System!');
}

function testFunction() {
  // Simple test function
  Logger.log('Test successful');
}

var SPREADSHEET_ID = '1PcSe4FHFs2kojm6cLYlYuS73HGFGJ7iMrpdUt8i8Gbw'; // Replace with actual Google Sheet ID

function createResponseSheet() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var responseSheet = ss.insertSheet('Response Sheet');
  responseSheet.appendRow(['Contractor Name', 'Bkash Number', 'Contact Number', 'NID No', 'NID Upload']);
  // Add data validation and protections as needed
}

function createCRMSheet() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var crmSheet = ss.insertSheet('CRM Sheet');
  crmSheet.appendRow(['Timestamp', 'Email Address', 'Contractor Name', 'Bkash Number', 'Contact Number', 'NID No', 'NID Upload', 'Contractor ID', 'Status', 'Notes']);
  // Link to Response Sheet using formulas, e.g., IMPORTRANGE if separate spreadsheets
}

function createCROSheet() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var croSheet = ss.insertSheet('cro_reg');
  croSheet.appendRow(['CRO Email', 'CRO Name', 'CRO WhatsApp Number', 'CRO Territory', 'CRO LM', 'Business Unit', 'Registration Date', 'Status', 'Last Updated']);
  // Add data validation as needed
}

function setupFormResponses() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var responseSheet = ss.getSheetByName('Form Responses 1');
  if (!responseSheet) {
    throw new Error('Form Responses 1 sheet not found.');
  }
  // Set up headers if needed, but assuming auto-created
}

function setupTriggers() {
  ScriptApp.newTrigger('onFormSubmit')
    .forSpreadsheet(SPREADSHEET_ID)
    .onFormSubmit()
    .create();
}

function onFormSubmit(e) {
  var originalSs = SpreadsheetApp.openById(SPREADSHEET_ID);
  var crmSs = SpreadsheetApp.openById('1S06FspVASoTMd2v0khQ6WPJ59JCvdoyz2aDllPpPNh8');
  var responseSheet = originalSs.getSheetByName('Form Responses 1');
  var crmSheet = crmSs.getSheetByName('CRM Approvals');
  var croSheet = originalSs.getSheetByName('cro_reg');

  if (!responseSheet || !crmSheet || !croSheet) {
    Logger.log('One or more sheets not found.');
    return;
  }

  var response = e.values;
  var timestamp = response[0];
  var submitterEmail = response[1];
  var contractorName = response[2];
  var bkashNumber = response[3];
  var contactNumber = response[4];
  var nidNo = response[5];
  var nidUpload = response[6];

  var submissionId = Utilities.getUuid();
  var status = 'Pending';
  var notes = '';

  var row = [timestamp, submitterEmail, contractorName, bkashNumber, contactNumber, nidNo, nidUpload, submissionId, status, notes];
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
    var croMessage = 'New Contractor Enlistment Submission\n' +
                     'Submission ID: ' + submissionId + '\n' +
                     'Contractor Name: ' + contractorName + '\n' +
                     'Mobile: ' + contactNumber + '\n' +
                     'NID: ' + nidNo + '\n' +
                     'Payment Number: ' + bkashNumber + '\n' +
                     'Remarks: ' + nidUpload + '\n' +
                     'Status: ' + status + '\n' +
                     'Submission Date: ' + timestamp;
    sendWhatsAppMessage(croPhone, croMessage);
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


function importMissingResponses() {
  var originalSs = SpreadsheetApp.openById(SPREADSHEET_ID);
  var crmSs = SpreadsheetApp.openById('1S06FspVASoTMd2v0khQ6WPJ59JCvdoyz2aDllPpPNh8');
  var responseSheet = originalSs.getSheetByName('Form Responses 1');
  var crmSheet = crmSs.getSheetByName('CRM Approvals');
  var croSheet = originalSs.getSheetByName('cro_reg');

  if (!responseSheet || !crmSheet || !croSheet) {
    Logger.log('One or more sheets not found.');
    return;
  }

  var responseData = responseSheet.getDataRange().getValues();
  var crmData = crmSheet.getDataRange().getValues();

  // Create a map of existing entries in CRM (using timestamp + contractorName + contactNumber as key)
  var crmKeys = new Set();
  for (var i = 1; i < crmData.length; i++) {
    var key = crmData[i][0] + '|' + crmData[i][2] + '|' + crmData[i][4];
    crmKeys.add(key);
  }

  var missingRows = [];
  var messages = [];
  var croData = croSheet.getDataRange().getValues(); // Load once outside loop

  for (var j = 1; j < responseData.length; j++) {
    var resp = responseData[j];
    var timestamp = resp[0];
    var submitterEmail = resp[1];
    var contractorName = resp[2];
    var bkashNumber = resp[3];
    var contactNumber = resp[4];
    var nidNo = resp[5];
    var nidUpload = resp[6];

    var key = timestamp + '|' + contractorName + '|' + contactNumber;
    if (!crmKeys.has(key)) {
      var submissionId = Utilities.getUuid();
      var status = 'Pending';
      var notes = '';

      missingRows.push([timestamp, submitterEmail, contractorName, bkashNumber, contactNumber, nidNo, nidUpload, submissionId, status, notes]);

      var croPhone = null;
      for (var k = 1; k < croData.length; k++) {
        if (croData[k][0] === submitterEmail) {
          croPhone = croData[k][2];
          break;
        }
      }
      if (croPhone) {
        var croMessage = 'New Contractor Enlistment Submission\n' +
                         'Submission ID: ' + submissionId + '\n' +
                         'Contractor Name: ' + contractorName + '\n' +
                         'Mobile: ' + contactNumber + '\n' +
                         'NID: ' + nidNo + '\n' +
                         'Payment Number: ' + bkashNumber + '\n' +
                         'Remarks: ' + nidUpload + '\n' +
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

  Logger.log('Added ' + (missingRows.length + (100 * Math.floor((responseData.length - 1) / 100))) + ' missing responses to CRM sheet.'); // Approximate count
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
