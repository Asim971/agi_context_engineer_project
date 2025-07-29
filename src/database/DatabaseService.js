/**
 * @file DatabaseService.js
 * @description Unified service for all Google Sheets database operations.
 * This service provides a robust, error-handled interface for interacting with
 * the project's spreadsheets, acting as the primary data access layer.
 * It extends BaseService to leverage centralized logging and error handling.
 * @version 2.0.1
 * 
 * IMPORTANT: Using var assignment pattern to ensure global accessibility
 * This ensures proper inheritance from BaseService
 */

var DatabaseService = class DatabaseService extends BaseService {
  /**
   * @param {boolean} isTest - Flag to indicate if running in a test environment.
   */
  constructor(isTest = false) {
    // Validate BaseService availability before proceeding
    if (typeof BaseService === 'undefined') {
      throw new Error('BaseService must be loaded before DatabaseService. Check file loading order.');
    }
    
    super();
    this.isTest = isTest || Config.IS_TEST_ENVIRONMENT;
    this.spreadsheet = null;
    this.initialize();
    if (this.isTest) {
      // Seeding initial data can be part of a dedicated test setup service
      // this.seedInitialData();
    }
    this.logger.info('DatabaseService initialized', { isTest: this.isTest });
  }

  /**
   * Initializes the spreadsheet connection.
   * Retries connection on failure, which is crucial for reliability.
   */
  initialize() {
    this.executeWithErrorHandlingSync(() => {
      if (this.spreadsheet) return;

      let spreadsheetId;
      if (this.isTest) {
        spreadsheetId = PropertiesService.getScriptProperties().getProperty('testSpreadsheetId');
        if (!spreadsheetId) {
          this.logger.warn('Test spreadsheet ID not found in properties. A new one may be created by TestEnvironmentService.');
          return; // Exit if no test sheet is set up yet
        }
      } else {
        spreadsheetId = Config.SPREADSHEET_ID; // Assuming production ID is in Config
      }

      if (!spreadsheetId) {
        throw new AppScriptError('CONFIG_SPREADSHEET_ID_MISSING', 'Spreadsheet ID is not configured.');
      }
      
      try {
        this.spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      } catch (e) {
        throw new AppScriptError('SPREADSHEET_OPEN_FAILED', `Failed to open spreadsheet with ID: ${spreadsheetId}`, { error: e.message });
      }
    }, null, 'initialize');
  }

  /**
   * Gets or creates a sheet by name, ensuring headers and validation are set.
   * @param {string} sheetName - The name of the sheet to get or create.
   * @returns {GoogleAppsScript.Spreadsheet.Sheet} The sheet object.
   */
  getSheet(sheetName) {
    return this.executeWithErrorHandlingSync(() => {
      if (!this.spreadsheet) {
        this.logger.warn('Spreadsheet not initialized, attempting re-initialization.');
        this.initialize();
        if (!this.spreadsheet) {
          throw new AppScriptError('SPREADSHEET_UNAVAILABLE', 'Spreadsheet is not available.');
        }
      }

      let sheet = this.spreadsheet.getSheetByName(sheetName);
      if (!sheet) {
        this.logger.info('Sheet not found, creating new sheet.', { sheetName });
        sheet = this.spreadsheet.insertSheet(sheetName);
        this.initializeSheetHeaders(sheetName, sheet);
        this.setDataValidation(sheetName, sheet);
      }
      return sheet;
    }, { sheetName }, 'getSheet');
  }

  /**
   * Initializes the headers for a given sheet based on configuration.
   * @private
   * @param {string} sheetName - The name of the sheet.
   * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The sheet object.
   */
  initializeSheetHeaders(sheetName, sheet) {
    const headers = this.getHeadersForSheet(sheetName);
    if (headers && headers.length > 0) {
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setValues([headers]);
      headerRange.setFontWeight('bold');
      sheet.setFrozenRows(1);
      this.logger.debug('Sheet headers initialized.', { sheetName });
    }
  }

  /**
   * Retrieves the correct header configuration for a given sheet name.
   * @private
   * @param {string} sheetName - The name of the sheet.
   * @returns {string[]} An array of header strings.
   */
  getHeadersForSheet(sheetName) {
    // This can be simplified if Config.HEADERS keys match Config.SHEETS keys
    return Config.HEADERS[Object.keys(Config.SHEETS).find(key => Config.SHEETS[key] === sheetName)] || [];
  }

  /**
   * Inserts a new record into a sheet.
   * @param {string} sheetName - The name of the sheet.
   * @param {Object} data - A key-value object representing the record.
   * @returns {number} The row number of the inserted record.
   */
  insertRecord(sheetName, data) {
    return this.executeWithErrorHandlingSync(() => {
      const sheet = this.getSheet(sheetName);
      const headers = this.getHeadersForSheet(sheetName);
      const rowData = headers.map(header => data[header] || '');

      sheet.appendRow(rowData);
      const lastRow = sheet.getLastRow();
      this.logger.info('Record inserted successfully.', { sheetName, row: lastRow });
      return lastRow;
    }, { sheetName, data }, 'insertRecord');
  }

  /**
   * Updates an existing record identified by a specific key-value pair.
   * @param {string} sheetName - The name of the sheet.
   * @param {string} keyField - The header of the column to search for the key.
   * @param {*} keyValue - The value to find in the keyField column.
   * @param {Object} data - A key-value object of the data to update.
   * @returns {boolean} True if the record was updated, false otherwise.
   */
  updateRecord(sheetName, keyField, keyValue, data) {
    return this.executeWithErrorHandlingSync(() => {
      const sheet = this.getSheet(sheetName);
      const allRecords = sheet.getDataRange().getValues();
      const headers = allRecords[0];
      const keyIndex = headers.indexOf(keyField);

      if (keyIndex === -1) {
        throw new AppScriptError('CONFIG_KEY_FIELD_NOT_FOUND', `Key field "${keyField}" not found in sheet "${sheetName}".`);
      }

      for (let i = 1; i < allRecords.length; i++) {
        if (allRecords[i][keyIndex] == keyValue) {
          const rowNum = i + 1;
          const rowData = headers.map(header => (data[header] !== undefined ? data[header] : allRecords[i][headers.indexOf(header)]));
          sheet.getRange(rowNum, 1, 1, rowData.length).setValues([rowData]);
          this.logger.info('Record updated successfully.', { sheetName, keyField, keyValue, row: rowNum });
          return true;
        }
      }
      
      this.logger.warn('Record not found for update.', { sheetName, keyField, keyValue });
      return false;
    }, { sheetName, keyField, keyValue, data }, 'updateRecord');
  }

  /**
   * Finds records that match a given set of criteria.
   * @param {string} sheetName - The name of the sheet.
   * @param {Object} criteria - A key-value object of search criteria.
   * @returns {Object[]} An array of matching record objects.
   */
  findRecords(sheetName, criteria) {
    return this.executeWithErrorHandlingSync(() => {
      const allRecords = this.getAllRecords(sheetName);
      
      const filtered = allRecords.filter(record => {
        return Object.entries(criteria).every(([key, value]) => record[key] == value);
      });

      this.logger.debug(`Found ${filtered.length} records matching criteria.`, { sheetName, criteria });
      return filtered;
    }, { sheetName, criteria }, 'findRecords');
  }

  /**
   * Retrieves all records from a sheet and maps them to objects.
   * @param {string} sheetName - The name of the sheet.
   * @returns {Object[]} An array of all record objects.
   */
  getAllRecords(sheetName) {
    return this.executeWithErrorHandlingSync(() => {
      const sheet = this.getSheet(sheetName);
      const data = sheet.getDataRange().getValues();

      if (data.length < 2) return [];

      const headers = data.shift(); // Remove headers and store them
      return data.map(row => {
        const record = {};
        headers.forEach((header, index) => {
          record[header] = row[index];
        });
        return record;
      });
    }, { sheetName }, 'getAllRecords');
  }

  /**
   * Sets data validation rules for a sheet based on configuration.
   * @private
   * @param {string} sheetName - The name of the sheet.
   * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The sheet object.
   */
  setDataValidation(sheetName, sheet) {
    const validationRule = this.getValidationRulesForSheet(sheetName);
    if (validationRule) {
      const range = sheet.getRange(2, validationRule.column, sheet.getMaxRows(), 1);
      const rule = SpreadsheetApp.newDataValidation()
        .requireValueInList(validationRule.values, true)
        .setAllowInvalid(false)
        .build();
      range.setDataValidation(rule);
      this.logger.debug('Data validation rules set.', { sheetName });
    }
  }

  /**
   * Gets the data validation rules for a specific sheet.
   * @private
   * @param {string} sheetName - The name of the sheet.
   * @returns {Object|null} A validation rule object or null.
   */
  getValidationRulesForSheet(sheetName) {
    const statusValues = ['Pending', 'In-Progress', 'Approved', 'Rejected', 'Cancelled'];
    const headers = this.getHeadersForSheet(sheetName);
    const statusColumn = headers.indexOf('Status') + 1;

    if (statusColumn > 0) {
      return { column: statusColumn, values: statusValues };
    }
    return null;
  }
};

// Ensure DatabaseService is globally accessible
if (typeof globalThis !== 'undefined') {
  globalThis.DatabaseService = DatabaseService;
}

// --- Global Instance ---
// Use a self-invoking function to create a single, lazy-loaded instance.
const getGlobalDB = (() => {
  let instance;
  return () => {
    if (!instance) {
      // Validate BaseService is available before creating instance
      if (typeof BaseService === 'undefined') {
        throw new Error('BaseService not available. Cannot create DatabaseService instance.');
      }
      instance = new DatabaseService();
    }
    return instance;
  };
})();

// Ensure getGlobalDB is globally accessible in Google Apps Script
if (typeof globalThis !== 'undefined') {
  globalThis.getGlobalDB = getGlobalDB;
}

// Additional compatibility for Google Apps Script V8 runtime
if (typeof global !== 'undefined') {
  global.getGlobalDB = getGlobalDB;
}

console.log('✅ DatabaseService and getGlobalDB loaded and registered in global scope');
