/**
 * @fileoverview Main script for Anwar Sales Management System - Retailer Registration.
 * This file contains the entry point functions for the Retailer Registration flow.
 *
 * Architecture Alignment:
 * - ADR-001: Using Google Apps Script as runtime.
 * - ADR-002: Google Sheets as MVP database.
 */

function doGet(e) {
  // Basic web app test function
  return ContentService.createTextOutput('Hello, Anwar Sales Management System - Retailer Registration!');
}

function testFunction() {
  // Simple test function
  Logger.log('Test successful');
}

var SPREADSHEET_ID = '1LBy0y-emr08r1ccJoOzuDe7oIw2VS4hUJGFi3s_0NHE'; // Retailer Form Responses Sheet ID

var CRM_SPREADSHEET_ID = '1S06FspVASoTMd2v0khQ6WPJ59JCvdoyz2aDllPpPNh8'; // Existing CRM Spreadsheet ID

function createSRRegSheet() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('SR_Reg') || ss.insertSheet('SR_Reg');
  var headers = ['Name', 'Email', 'Whatsapp No.', 'Territory', 'Bazaar'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
}

function setupTriggers() {
  ScriptApp.newTrigger('onFormSubmit')
    .forSpreadsheet(SPREADSHEET_ID)
    .onFormSubmit()
    .create();
}

function onFormSubmit(e) {
  var originalSs = SpreadsheetApp.openById(SPREADSHEET_ID);
  var crmSs = SpreadsheetApp.openById(CRM_SPREADSHEET_ID);
  var responseSheet = originalSs.getSheetByName('Form Responses 1');
  var crmSheet = crmSs.getSheetByName('Retailer Approvals');
  var srRegSheet = originalSs.getSheetByName('SR_Reg');

  if (!responseSheet || !crmSheet || !srRegSheet) {
    Logger.log('One or more sheets not found.');
    return;
  }

  var response = e.values;
  var timestamp = response[0];
  var emailAddress = response[1];
  var shopName = response[2];
  var proprietorName = response[3];
  var shopAddress = response[4];
  var bazaarName = response[5];
  var phoneNumber = response[6];
  var bkashNumber = response[7];
  var nid = response[8];
  var uploadNidImage = response[9];

  // Lookup SR Whatsapp based on Bazaar Name
  var srData = srRegSheet.getDataRange().getValues();
  var srWhatsapp = '';
  for (var i = 1; i < srData.length; i++) {
    if (srData[i][4] === bazaarName) {
      srWhatsapp = srData[i][2];
      break;
    }
  }

  var submissionId = Utilities.getUuid();
  var status = 'Pending';
  var notes = '';

  var row = [timestamp, emailAddress, shopName, proprietorName, shopAddress, bazaarName, phoneNumber, bkashNumber, nid, uploadNidImage, submissionId, srWhatsapp, status, notes];
  crmSheet.appendRow(row);

  if (srWhatsapp) {
    var message = 'New Retailer Registration Submission\n' +
                  'Submission ID: ' + submissionId + '\n' +
                  'Shop Name: ' + shopName + '\n' +
                  'Proprietor Name: ' + proprietorName + '\n' +
                  'Phone Number: ' + phoneNumber + '\n' +
                  'Bazaar Name: ' + bazaarName + '\n' +
                  'Status: ' + status + '\n' +
                  'Submission Date: ' + timestamp;
    sendWhatsAppMessage(srWhatsapp, message);
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
  var crmSs = SpreadsheetApp.openById(CRM_SPREADSHEET_ID);
  var responseSheet = originalSs.getSheetByName('Form Responses 1');
  var crmSheet = crmSs.getSheetByName('Retailer Approvals');
  var srRegSheet = originalSs.getSheetByName('SR_Reg');

  if (!responseSheet || !crmSheet || !srRegSheet) {
    Logger.log('One or more sheets not found.');
    return;
  }

  var responseData = responseSheet.getDataRange().getValues();
  var crmData = crmSheet.getDataRange().getValues();

  // Create a map of existing entries in CRM (using timestamp + shopName + phoneNumber as key)
  var crmKeys = new Set();
  for (var i = 1; i < crmData.length; i++) {
    var key = crmData[i][0] + '|' + crmData[i][2] + '|' + crmData[i][6];
    crmKeys.add(key);
  }

  var missingRows = [];
  var messages = [];
  var srData = srRegSheet.getDataRange().getValues(); // Load once outside loop

  for (var j = 1; j < responseData.length; j++) {
    var resp = responseData[j];
    var timestamp = resp[0];
    var emailAddress = resp[1];
    var shopName = resp[2];
    var proprietorName = resp[3];
    var shopAddress = resp[4];
    var bazaarName = resp[5];
    var phoneNumber = resp[6];
    var bkashNumber = resp[7];
    var nid = resp[8];
    var uploadNidImage = resp[9];

    var key = timestamp + '|' + shopName + '|' + phoneNumber;
    if (!crmKeys.has(key)) {
      var srWhatsapp = '';
      for (var k = 1; k < srData.length; k++) {
        if (srData[k][4] === bazaarName) {
          srWhatsapp = srData[k][2];
          break;
        }
      }

      var submissionId = Utilities.getUuid();
      var status = 'Pending';
      var notes = '';

      missingRows.push([timestamp, emailAddress, shopName, proprietorName, shopAddress, bazaarName, phoneNumber, bkashNumber, nid, uploadNidImage, submissionId, srWhatsapp, status, notes]);

      if (srWhatsapp) {
        var message = 'New Retailer Registration Submission\n' +
                      'Submission ID: ' + submissionId + '\n' +
                      'Shop Name: ' + shopName + '\n' +
                      'Proprietor Name: ' + proprietorName + '\n' +
                      'Phone Number: ' + phoneNumber + '\n' +
                      'Bazaar Name: ' + bazaarName + '\n' +
                      'Status: ' + status + '\n' +
                      'Submission Date: ' + timestamp;
        messages.push({phone: srWhatsapp, message: message});
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

  Logger.log('Added ' + (missingRows.length + (100 * Math.floor((responseData.length - 1) / 100))) + ' missing responses to Retailer Approvals sheet.'); // Approximate count
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