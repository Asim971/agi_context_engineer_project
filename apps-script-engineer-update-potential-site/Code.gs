/**
 * @fileoverview Main script for Anwar Sales Management System - Engineer Update in Potential Site.
 * This file contains the entry point functions for the Engineer Update flow.
 *
 * Architecture Alignment:
 * - ADR-001: Using Google Apps Script as runtime.
 * - ADR-002: Google Sheets as MVP database.
 */

function doGet(e) {
  // Basic web app test function
  return ContentService.createTextOutput('Hello, Anwar Sales Management System - Engineer Update in Potential Site!');
}

function testFunction() {
  // Simple test function
  Logger.log('Test successful');
}

var FORM_SPREADSHEET_ID = '1S7M6OXi_adCdorUHSDAgMM9RNp7qVRsuKg8eAqnAK9c'; // Engineer Update Form Responses Sheet ID
var PROJECT_UPDATE_SPREADSHEET_ID = '1Qm1i_mEBPJr7MJzkADVDjX0iyqBvmKmXxYEKVoSB6zs'; // Project Update Sheet ID
var POTENTIAL_SITE_SPREADSHEET_ID = '16FOGBAvAS2ac85EaJuUARaQE60wEMAG5oA9Iz4xtA9g'; // For BD_reg lookup

function setupTriggers() {
  ScriptApp.newTrigger('onFormSubmit')
    .forSpreadsheet(FORM_SPREADSHEET_ID)
    .onFormSubmit()
    .create();
}

function onFormSubmit(e) {
  var formSs = SpreadsheetApp.openById(FORM_SPREADSHEET_ID);
  var projectSs = SpreadsheetApp.openById(PROJECT_UPDATE_SPREADSHEET_ID);
  var potentialSs = SpreadsheetApp.openById(POTENTIAL_SITE_SPREADSHEET_ID);
  var responseSheet = formSs.getSheetByName('Form Responses 1');
  var projectSheet = projectSs.getSheetByName('Project Update'); // Assuming sheet name
  var bdRegSheet = potentialSs.getSheetByName('BD_reg');

  if (!responseSheet || !projectSheet || !bdRegSheet) {
    Logger.log('One or more sheets not found.');
    return;
  }

  var response = e.values;
  var timestamp = response[0];
  var submitterEmail = response[1];
  var submissionId = response[2]; // Select Potential Site (Submission ID)
  var engineerName = response[3];
  var engineerMobile = response[4];
  var engineerEmail = response[5];
  var engineerIdNo = response[6];
  var engineerClassification = response[7];
  var remarks = response[8];

  // Find the row in Project Update sheet with matching Submission ID
  var projectData = projectSheet.getDataRange().getValues();
  var rowIndex = -1;
  var bdTerritory = '';
  for (var i = 1; i < projectData.length; i++) {
    if (projectData[i][11] === submissionId) { // Assuming Submission ID is in column 12 (index 11)
      rowIndex = i + 1;
      bdTerritory = projectData[i][2]; // Assuming BD Territory in column 3 (index 2)
      break;
    }
  }

  if (rowIndex === -1) {
    // Project not found, perhaps append new or log error
    Logger.log('Project with Submission ID ' + submissionId + ' not found.');
    // Optionally send notification
    return;
  }

  // Update the row with engineer details
  // Assuming columns for engineer details, adjust indices as needed
  projectSheet.getRange(rowIndex, 17).setValue(engineerName); // Example column 17 for Engineer Name
  projectSheet.getRange(rowIndex, 18).setValue(engineerMobile);
  projectSheet.getRange(rowIndex, 19).setValue(engineerEmail);
  projectSheet.getRange(rowIndex, 20).setValue(engineerIdNo);
  projectSheet.getRange(rowIndex, 21).setValue(engineerClassification);
  projectSheet.getRange(rowIndex, 22).setValue(remarks);

  // Lookup BD Whatsapp based on BD Territory
  var bdData = bdRegSheet.getDataRange().getValues();
  var bdWhatsapp = '';
  for (var j = 1; j < bdData.length; j++) {
    if (bdData[j][3] === bdTerritory) {
      bdWhatsapp = bdData[j][2];
      break;
    }
  }

  var message = 'Engineer Update for Potential Site\n' +
                'Submission ID: ' + submissionId + '\n' +
                'Engineer Name: ' + engineerName + '\n' +
                'Mobile: ' + engineerMobile + '\n' +
                'Email: ' + engineerEmail + '\n' +
                'ID No: ' + engineerIdNo + '\n' +
                'Classification: ' + engineerClassification + '\n' +
                'Remarks: ' + remarks + '\n' +
                'Update Date: ' + timestamp;

  if (bdWhatsapp) {
    sendWhatsAppMessage(bdWhatsapp, message);
  } else {
    Logger.log('BD Whatsapp not found for territory: ' + bdTerritory);
  }

  // If project already had engineer details, notify?
  // Add logic if needed to check if engineer fields were already populated
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
  // Similar to previous, but adapted for updates
  // Since it's an update, perhaps not needed or modify accordingly
  Logger.log('importMissingResponses not implemented for updates.');
}