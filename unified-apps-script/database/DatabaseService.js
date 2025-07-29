/**
 * Unified Database Service for Google Sheets operations
 * Consolidates all database operations from separate apps-script directories
 */

class DatabaseService {
  constructor() {
    this.spreadsheetId = Config.sheets.mainSpreadsheetId;
    this.spreadsheet = null;
  }

  /**
   * Initialize the database connection
   */
  initialize() {
    if (!this.spreadsheetId) {
      throw new Error('MAIN_SPREADSHEET_ID not configured in script properties');
    }
    this.spreadsheet = SpreadsheetApp.openById(this.spreadsheetId);
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
    }
    return sheet;
  }

  /**
   * Initialize sheet headers based on sheet type
   */
  initializeSheetHeaders(sheetName, sheet) {
    const headers = this.getHeadersForSheet(sheetName);
    if (headers && headers.length > 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    }
  }

  /**
   * Get appropriate headers for each sheet type
   */
  getHeadersForSheet(sheetName) {
    const headers = {
      [Config.sheets.sheetNames.engineer]: [
        'Timestamp', 'Name', 'Email', 'Phone', 'Location', 'Experience', 'Status', 'Assigned SR', 'Notes'
      ],
      [Config.sheets.sheetNames.engineerCRM]: [
        'Timestamp', 'Engineer ID', 'Engineer Name', 'Email', 'Phone', 'Status', 'Assigned SR', 'BD Contact', 'CRO Contact', 'Notes', 'Follow-up Date'
      ],
      [Config.sheets.sheetNames.potentialSite]: [
        'Timestamp', 'Company Name', 'Contact Person', 'Email', 'Phone', 'Location', 'Site Type', 'Status', 'Assigned BD', 'Notes'
      ],
      [Config.sheets.sheetNames.potentialSiteCRM]: [
        'Timestamp', 'Site ID', 'Company Name', 'Contact Person', 'Email', 'Phone', 'Location', 'Status', 'Assigned BD', 'CRO Contact', 'Follow-up Date', 'Notes'
      ],
      [Config.sheets.sheetNames.retailer]: [
        'Timestamp', 'Shop Name', 'Owner Name', 'Email', 'Phone', 'Location', 'Business Type', 'Status', 'Assigned SR', 'Notes'
      ],
      [Config.sheets.sheetNames.retailerCRM]: [
        'Timestamp', 'Retailer ID', 'Shop Name', 'Owner Name', 'Email', 'Phone', 'Location', 'Status', 'Assigned SR', 'Follow-up Date', 'Notes'
      ],
      [Config.sheets.sheetNames.siteUpdates]: [
        'Timestamp', 'Site ID', 'Update Type', 'Description', 'Updated By', 'Status', 'Notes'
      ],
      [Config.sheets.sheetNames.users]: [
        'User ID', 'Name', 'Email', 'Phone', 'Role', 'Territory', 'Status', 'Created Date', 'Last Active'
      ]
    };
    return headers[sheetName] || [];
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

  /**
   * Get next ID for a record type
   */
  getNextId(sheetName, prefix) {
    const sheet = this.getSheet(sheetName);
    const data = sheet.getDataRange().getValues();
    
    if (data.length < 2) return `${prefix}001`;
    
    const lastRow = data[data.length - 1];
    const idColumn = this.getHeadersForSheet(sheetName).indexOf('ID') || 
                    this.getHeadersForSheet(sheetName).indexOf('Retailer ID') || 
                    this.getHeadersForSheet(sheetName).indexOf('Site ID') || 
                    this.getHeadersForSheet(sheetName).indexOf('Engineer ID');
    
    if (idColumn >= 0) {
      const lastId = lastRow[idColumn];
      const number = parseInt(lastId.replace(prefix, '')) || 0;
      return `${prefix}${String(number + 1).padStart(3, '0')}`;
    }
    
    return `${prefix}001`;
  }
}

// Global instance
const DB = new DatabaseService();