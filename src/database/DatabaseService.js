/**
 * Unified Database Service for Google Sheets operations
 * Consolidates all database operations from separate apps-script directories
 * Updated for unified Anwar Sales Ecosystem
 */

class DatabaseService {
  constructor(isTest = false) {
    this.isTest = isTest;
    this.initialize();
    if (isTest) {
      this.seedInitialData();
    }
  }

  /**
   * Initialize the database connection
   */
  initialize() {
    if (this.spreadsheet) return;

    if (Config.IS_TEST_ENVIRONMENT) {
      var testSpreadsheetId = PropertiesService.getScriptProperties().getProperty('testSpreadsheetId');
      if (testSpreadsheetId) {
        try {
          this.spreadsheet = SpreadsheetApp.openById(testSpreadsheetId);
        } catch (e) {
          // If the spreadsheet is not found, it will be created by TestEnvironmentService
          this.spreadsheet = null;
        }
      }
    } else {
      // Production environment
      if (this.spreadsheetId) {
        this.spreadsheet = SpreadsheetApp.openById(this.spreadsheetId);
      } else {
        this.spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      }
    }

    if (!this.spreadsheet && !Config.IS_TEST_ENVIRONMENT) {
      throw new Error('Spreadsheet could not be initialized for Production.');
    }
  }

  /**
   * Get or create a sheet by name
   */
  getSheet(sheetName) {
    if (!this.spreadsheet) this.initialize();

    let sheet = this.spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
      sheet = this.spreadsheet.insertSheet(sheetName);
      this.initializeSheetHeaders(sheetName, sheet);
      this.setDataValidation(sheetName, sheet);
    }
    return sheet;
  }

  /**
   * Initialize sheet headers based on sheet type
   */
  initializeIdTracking() {
    const sheet = this.getSheet(Config.SHEETS.ID_TRACKING);
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) { // Only headers or empty
      const initialData = [
        ['Engineer', 'EN', 0],
        ['Potential Site', 'PS', 0],
        ['Retailer', 'RTL', 0],
        ['BD Lead', 'BDL', 0]
      ];
      sheet.getRange(2, 1, initialData.length, initialData[0].length).setValues(initialData);
    }
  }

  initializeSheetHeaders(sheetName, sheet) {
    const headers = this.getHeadersForSheet(sheetName);
    if (headers && headers.length > 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    }

    if (sheetName === Config.SHEETS.ID_TRACKING) {
      this.initializeIdTracking();
    }
  }

  /**
   * Get appropriate headers for each sheet type
   */
  getHeadersForSheet(sheetName) {
    switch(sheetName) {
      case Config.SHEETS.ENGINEER:
        return Config.HEADERS.ENGINEER;
      case Config.SHEETS.POTENTIAL_SITE:
        return Config.HEADERS.POTENTIAL_SITE;
      case Config.SHEETS.RETAILER:
        return Config.HEADERS.RETAILER;
      case Config.NEW_ENGINEER_SHEET_NAME:
        return Config.HEADERS.ENGINEER;
      case Config.NEW_POTENTIAL_SITE_SHEET_NAME:
        return Config.HEADERS.POTENTIAL_SITE;
      case Config.NEW_RETAILER_SHEET_NAME:
        return Config.HEADERS.RETAILER;
      case Config.NEW_CRM_SHEET_NAME:
        return ['ID', 'Type', 'Name', 'Phone', 'Email', 'Status', 'Created At', 'Updated At'];
      case Config.SITE_UPDATES_SHEET_NAME:
        return Config.HEADERS.SITE_UPDATE;
      case Config.SHEETS.VISIT:
        return Config.HEADERS.VISIT;
      case Config.SHEETS.DEMARCATION:
        return Config.HEADERS.DEMARCATION;
      case Config.SHEETS.ADMINISTRATIVE_SETTINGS:
        return Config.HEADERS.ADMINISTRATIVE_SETTINGS;
      case Config.USERS_SHEET_NAME:
        return ['ID', 'Name', 'Email', 'Role', 'Phone', 'Territory/Bazaar', 'Status', 'Created At', 'Last Login'];
      case Config.SHEETS.ID_TRACKING:
        return Config.HEADERS.ID_TRACKING;
      default:
        return [];
    }
  }

  /**
   * Insert a new record into a sheet
   */
  insertRecord(sheetName, data) {
    const sheet = this.getSheet(sheetName);
    const rowData = this.formatRowData(sheetName, data);

    sheet.appendRow(rowData);
    return sheet.getLastRow();
  }

  /**
   * Update a record by row number
   */
  updateRecord(sheetName, rowNumber, data) {
    const sheet = this.getSheet(sheetName);
    const rowData = this.formatRowData(sheetName, data);

    sheet.getRange(rowNumber, 1, 1, rowData.length).setValues([rowData]);
    return rowNumber;
  }

  /**
   * Find records by criteria
   */
  findRecords(sheetName, criteria) {
    const sheet = this.getSheet(sheetName);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const records = data.slice(1);

    return records.filter(row => {
      return Object.entries(criteria).every(([key, value]) => {
        const colIndex = headers.indexOf(key);
        return colIndex >= 0 && row[colIndex] === value;
      });
    });
  }

  /**
   * Get all records from a sheet
   */
  getAllRecords(sheetName) {
    const sheet = this.getSheet(sheetName);
    const data = sheet.getDataRange().getValues();

    if (data.length < 2) return [];

    const headers = data[0];
    return data.slice(1).map(row => {
      const record = {};
      headers.forEach((header, index) => {
        record[header] = row[index];
      });
      return record;
    });
  }

  /**
   * Format data according to sheet headers
   */
  formatRowData(sheetName, data) {
    const headers = this.getHeadersForSheet(sheetName);
    return headers.map(header => data[header] || '');
  }

  seedInitialData() {
    if (this.isTest) {
      const demarcationSheet = this.getSheet(Config.SHEETS.DEMARCATION);
      if (demarcationSheet.getLastRow() <= 1) {
        const data = InitialData.DEMARCATION.slice(1); // Get data without header
        demarcationSheet.getRange(2, 1, data.length, data[0].length).setValues(data);
      }

      const adminSettingsSheet = this.getSheet(Config.SHEETS.ADMINISTRATIVE_SETTINGS);
      if (adminSettingsSheet.getLastRow() <= 1) {
        const data = InitialData.ADMINISTRATIVE_SETTINGS.slice(1); // Get data without header
        adminSettingsSheet.getRange(2, 1, data.length, data[0].length).setValues(data);
      }
    }
  }

  /**
   * Get next ID for a record type
   */
  getNextId(sheetName, prefix) {
    const sheet = this.getSheet(sheetName);
    const data = sheet.getDataRange().getValues();

    if (data.length < 2) return `${prefix}001`;

    const lastRow = data[data.length - 1];
    const headers = this.getHeadersForSheet(sheetName);
    const idColumn = headers.indexOf('ID');

    if (idColumn >= 0) {
      const lastId = lastRow[idColumn];
      if (lastId && typeof lastId === 'string') {
        const number = parseInt(lastId.replace(prefix, '')) || 0;
        return `${prefix}${String(number + 1).padStart(3, '0')}`;
      }
    }

    return `${prefix}001`;
  }

  /**
   * Set data validation rules for a sheet
   */
  setDataValidation(sheetName, sheet) {
    const validation = this.getValidationRulesForSheet(sheetName);
    if (validation) {
      const range = sheet.getRange(2, validation.column, sheet.getMaxRows(), 1);
      const rule = SpreadsheetApp.newDataValidation()
        .requireValueInList(validation.values, true)
        .setAllowInvalid(false)
        .build();
      range.setDataValidation(rule);
    }
  }

  /**
   * Get data validation rules for a sheet
   */
  getValidationRulesForSheet(sheetName) {
    const statusValues = ['Pending', 'In-Progress', 'Approved', 'Rejected', 'Cancelled'];
    let statusColumn;

    switch(sheetName) {
      case Config.SHEETS.ENGINEER:
        statusColumn = Config.HEADERS.ENGINEER.indexOf('Status') + 1;
        break;
      case Config.SHEETS.POTENTIAL_SITE:
        statusColumn = Config.HEADERS.POTENTIAL_SITE.indexOf('Status') + 1;
        break;
      case Config.SHEETS.RETAILER:
        statusColumn = Config.HEADERS.RETAILER.indexOf('Status') + 1;
        break;
      default:
        return null;
    }

    if (statusColumn > 0) {
      return {
        column: statusColumn,
        values: statusValues
      };
    }
    return null;
  }


}

// Global instance for unified access (lazy initialization)
let DB = null;

const getDB = () => {
  if (!DB) {
    DB = new DatabaseService();
  }
  return DB;
};

// Export the getter function for global access
const getGlobalDB = getDB;
