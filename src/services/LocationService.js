/**
 * @file LocationService.js
 * @description Service for handling location-based data, including demarcation and administrative settings.
 * It provides a structured interface to query geographical and organizational hierarchies.
 * @version 2.0.0
 */

class LocationService extends BaseService {
  constructor() {
    super();
    this.db = getGlobalDB();
    this.demarcationSheet = Config.SHEETS.DEMARCATION;
    this.adminSettingsSheet = Config.SHEETS.ADMINISTRATIVE_SETTINGS;
    this.logger.info('LocationService initialized');
  }

  // --- Public API for Hierarchy Retrieval ---

  getDistricts() { 
    return this._getUniqueColumnValues(this.demarcationSheet, 'District');
  }
  
  getUpazilas() { 
    return this._getUniqueColumnValues(this.demarcationSheet, 'Uujila');
  }
  
  getBazaars() { 
    return this._getUniqueColumnValues(this.demarcationSheet, 'Bazaar');
  }

  getTerritories() { 
    return this._getUniqueColumnValues(this.adminSettingsSheet, 'Territory');
  }
  
  getAreas() { 
    return this._getUniqueColumnValues(this.adminSettingsSheet, 'Area');
  }
  
  getZones() { 
    return this._getUniqueColumnValues(this.adminSettingsSheet, 'Zone');
  }
  
  getDivisions() { 
    return this._getUniqueColumnValues(this.adminSettingsSheet, 'Division');
  }
  
  getCountries() { 
    return this._getUniqueColumnValues(this.adminSettingsSheet, 'Country');
  }

  // --- Generic CRUD Methods (can be exposed if needed) ---

  /**
   * Finds records in the demarcation sheet.
   * @param {Object} criteria - Key-value pairs to search for.
   * @returns {Object[]} An array of matching demarcation records.
   */
  findDemarcation(criteria) {
    return this.executeWithErrorHandlingSync(
      () => this.db.findRecords(this.demarcationSheet, criteria),
      { criteria },
      'findDemarcation'
    );
  }

  /**
   * Finds records in the administrative settings sheet.
   * @param {Object} criteria - Key-value pairs to search for.
   * @returns {Object[]} An array of matching admin setting records.
   */
  findAdminSetting(criteria) {
    return this.executeWithErrorHandlingSync(
      () => this.db.findRecords(this.adminSettingsSheet, criteria),
      { criteria },
      'findAdminSetting'
    );
  }

  // --- Private Helper Methods ---

  /**
   * Retrieves unique, non-empty values from a specific column in a sheet.
   * @private
   * @param {string} sheetName - The name of the sheet to query.
   * @param {string} columnName - The name of the column to get unique values from.
   * @returns {string[]} An array of unique string values.
   */
  _getUniqueColumnValues(sheetName, columnName) {
    return this.executeWithErrorHandlingSync(() => {
      const records = this.db.getAllRecords(sheetName);
      if (!records || records.length === 0) {
        this.logger.warn('No records found in sheet', { sheetName });
        return ['No data available'];
      }
      
      const values = records.map(record => record[columnName]);
      const uniqueValues = [...new Set(values)].filter(Boolean); // Filter out null/undefined/empty strings

      if (uniqueValues.length === 0) {
        this.logger.debug('No unique values found for column', { sheetName, columnName });
        return ['No data available'];
      }

      return uniqueValues;
    }, { sheetName, columnName }, '_getUniqueColumnValues');
  }
}

// LocationService is now managed via GlobalServiceLocator for dependency injection
// Removed global instance and LocationServiceGlobal to prevent load order issues and promote DI
