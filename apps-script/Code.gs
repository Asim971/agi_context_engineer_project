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