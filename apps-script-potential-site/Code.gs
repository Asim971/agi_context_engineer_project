/**
 * @fileoverview Main script for Anwar Sales Management System - Potential Site Registration.
 * This file contains the entry point functions for the Potential Site Registration flow.
 *
 * Architecture Alignment:
 * - ADR-001: Using Google Apps Script as runtime.
 * - ADR-002: Google Sheets as MVP database.
 */

function doGet(e) {
  // Basic web app test function
  return ContentService.createTextOutput('Hello, Anwar Sales Management System - Potential Site Registration!');
}

function testFunction() {
  // Simple test function
  Logger.log('Test successful');
}

var SPREADSHEET_ID = '16FOGBAvAS2ac85EaJuUARaQE60wEMAG5oA9Iz4xtA9g'; // Potential Site Form Responses Sheet ID
var CONTRACTOR_SPREADSHEET_ID = '1PcSe4FHFs2kojm6cLYlYuS73HGFGJ7iMrpdUt8i8Gbw'; // Contractor Spreadsheet ID for cro_reg
var CRM_SPREADSHEET_ID = '1S06FspVASoTMd2v0khQ6WPJ59JCvdoyz2aDllPpPNh8'; // Existing CRM Spreadsheet ID

function createBDRegSheet() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('BD_reg') || ss.insertSheet('BD_reg');
  var headers = ['BD team name', 'Email', 'Whatsapp_Number', 'BD Territory'];
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
  var contractorSs = SpreadsheetApp.openById(CONTRACTOR_SPREADSHEET_ID);
  var crmSs = SpreadsheetApp.openById(CRM_SPREADSHEET_ID);
  var responseSheet = originalSs.getSheetByName('Form Responses 1');
  var crmSheet = crmSs.getSheetByName('Potential Site Approvals');
  var bdRegSheet = originalSs.getSheetByName('BD_reg');
  var croRegSheet = contractorSs.getSheetByName('cro_reg');

  if (!responseSheet || !crmSheet || !bdRegSheet || !croRegSheet) {
    Logger.log('One or more sheets not found.');
    return;
  }

  var response = e.values;
  var timestamp = response[0];
  var submitterEmail = response[1]; // Assuming email is collected
  var bdTerritory = response[2];
  var projectOwnerName = response[3];
  var projectOwnerPhone = response[4];
  var detailedAddress = response[5];
  var siteVisitImage = response[6];
  var workOrderQuantity = response[7];
  var businessUnits = response[8];
  var estStartBuilding = response[9];
  var estEndBuilding = response[10];

  // Lookup BD Whatsapp based on BD Territory
  var bdData = bdRegSheet.getDataRange().getValues();
  var bdWhatsapp = '';
  for (var i = 1; i < bdData.length; i++) {
    if (bdData[i][3] === bdTerritory) {
      bdWhatsapp = bdData[i][2];
      break;
    }
  }

  // Lookup CRO Whatsapp based on submitterEmail
  var croData = croRegSheet.getDataRange().getValues();
  var croWhatsapp = '';
  for (var j = 1; j < croData.length; j++) {
    if (croData[j][0] === submitterEmail) {
      croWhatsapp = croData[j][2];
      break;
    }
  }

  var submissionId = Utilities.getUuid();
  var status = 'Pending';
  var notes = '';

  var row = [timestamp, submitterEmail, bdTerritory, projectOwnerName, projectOwnerPhone, detailedAddress, siteVisitImage, workOrderQuantity, businessUnits, estStartBuilding, estEndBuilding, submissionId, bdWhatsapp, croWhatsapp, status, notes];
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

function importMissingResponses() {
  var originalSs = SpreadsheetApp.openById(SPREADSHEET_ID);
  var contractorSs = SpreadsheetApp.openById(CONTRACTOR_SPREADSHEET_ID);
  var crmSs = SpreadsheetApp.openById(CRM_SPREADSHEET_ID);
  var responseSheet = originalSs.getSheetByName('Form Responses 1');
  var crmSheet = crmSs.getSheetByName('Potential Site Approvals');
  var bdRegSheet = originalSs.getSheetByName('BD_reg');
  var croRegSheet = contractorSs.getSheetByName('cro_reg');

  if (!responseSheet || !crmSheet || !bdRegSheet || !croRegSheet) {
    Logger.log('One or more sheets not found.');
    return;
  }

  var responseData = responseSheet.getDataRange().getValues();
  var crmData = crmSheet.getDataRange().getValues();

  // Create a map of existing entries in CRM (using timestamp + bdTerritory + projectOwnerName as key)
  var crmKeys = new Set();
  for (var i = 1; i < crmData.length; i++) {
    var key = crmData[i][0] + '|' + crmData[i][2] + '|' + crmData[i][3];
    crmKeys.add(key);
  }

  var missingRows = [];
  var messages = [];
  var bdData = bdRegSheet.getDataRange().getValues();
  var croData = croRegSheet.getDataRange().getValues();

  for (var j = 1; j < responseData.length; j++) {
    var resp = responseData[j];
    var timestamp = resp[0];
    var submitterEmail = resp[1];
    var bdTerritory = resp[2];
    var projectOwnerName = resp[3];
    var projectOwnerPhone = resp[4];
    var detailedAddress = resp[5];
    var siteVisitImage = resp[6];
    var workOrderQuantity = resp[7];
    var businessUnits = resp[8];
    var estStartBuilding = resp[9];
    var estEndBuilding = resp[10];

    var key = timestamp + '|' + bdTerritory + '|' + projectOwnerName;
    if (!crmKeys.has(key)) {
      var bdWhatsapp = '';
      for (var k = 1; k < bdData.length; k++) {
        if (bdData[k][3] === bdTerritory) {
          bdWhatsapp = bdData[k][2];
          break;
        }
      }

      var croWhatsapp = '';
      for (var l = 1; l < croData.length; l++) {
        if (croData[l][0] === submitterEmail) {
          croWhatsapp = croData[l][2];
          break;
        }
      }

      var submissionId = Utilities.getUuid();
      var status = 'Pending';
      var notes = '';

      missingRows.push([timestamp, submitterEmail, bdTerritory, projectOwnerName, projectOwnerPhone, detailedAddress, siteVisitImage, workOrderQuantity, businessUnits, estStartBuilding, estEndBuilding, submissionId, bdWhatsapp, croWhatsapp, status, notes]);

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

      if (bdWhatsapp) {
        messages.push({phone: bdWhatsapp, message: message});
      }
      if (croWhatsapp) {
        messages.push({phone: croWhatsapp, message: message});
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

  Logger.log('Added ' + (missingRows.length + (100 * Math.floor((responseData.length - 1) / 100))) + ' missing responses to Potential Site Approvals sheet.'); // Approximate count
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