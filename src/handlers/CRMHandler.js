/**
 * CRMHandler.js
 * General CRM operations handler for unified Anwar Sales Ecosystem
 * Refactored to extend BaseService for proper service integration
 */

var CRMHandler = class CRMHandler extends BaseService {
  constructor() {
    // Validate BaseService availability
    if (typeof BaseService === 'undefined') {
      throw new Error('BaseService must be loaded before CRMHandler');
    }
    
    super();
    this.logger.info('CRMHandler initialized');
  }
  
  /**
   * Handle edit events for CRM sheets
   * @param {Object} e - Edit event object
   */
  onEdit(e) {
    return this.executeWithErrorHandlingSync(() => {
      const range = e.range;
      const sheet = range.getSheet();
      const sheetName = sheet.getName();
      
      // Handle general CRM updates
      if (sheetName === Config.NEW_CRM_SHEET_NAME) {
        this.handleCRMUpdate(e);
      }
    }, { event: e }, 'onEdit');
  }
  
  /**
   * Handle CRM update logic
   * @param {Object} e - Edit event object
   * @private
   */
  handleCRMUpdate(e) {
    return this.executeWithErrorHandlingSync(() => {
      const range = e.range;
      const sheet = range.getSheet();
      const row = range.getRow();
      const col = range.getColumn();
      
      // Get the updated data
      const rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      
      const record = {};
      headers.forEach((header, index) => {
        record[header] = rowData[index];
      });
      
      // Log the update
      this.logger.info('CRM Update processed', {
        row: row,
        column: col,
        record: record
      });
      
      // You can add specific CRM update logic here
      // For example, trigger notifications, update related records, etc.
    }, { event: e }, 'handleCRMUpdate');
  }
  
  /**
   * Get CRM data by type and status
   * @param {string} type - Type of CRM data (engineer, potential_site, retailer)
   * @param {string} status - Optional status filter
   * @returns {Array} Filtered CRM records
   */
  getCRMData(type, status) {
    return this.executeWithErrorHandlingSync(() => {
      let sheetName;
      switch(type) {
        case 'engineer':
          sheetName = Config.SHEETS.ENGINEER;
          break;
        case 'potential_site':
          sheetName = Config.SHEETS.POTENTIAL_SITE;
          break;
        case 'retailer':
          sheetName = Config.SHEETS.RETAILER;
          break;
        default:
          sheetName = Config.NEW_CRM_SHEET_NAME;
      }
      
      const db = GlobalServiceLocator.get('DatabaseService');
      let records = db.getAllRecords(sheetName);
      
      if (status) {
        records = records.filter(record => record.Status === status);
      }
      
      return records;
    }, { type, status }, 'getCRMData');
  }
  
  /**
   * Get potential site by ID (required by integration tests)
   * @param {string} siteId - The potential site ID
   * @returns {Object|null} Potential site record or null if not found
   */
  getPotentialSiteById(siteId) {
    return this.executeWithErrorHandlingSync(() => {
      const db = GlobalServiceLocator.get('DatabaseService');
      const records = db.getAllRecords(Config.SHEETS.POTENTIAL_SITE);
      
      const site = records.find(record => record.ID === siteId || record.id === siteId);
      
      if (!site) {
        this.logger.warn('Potential site not found', { siteId });
        return null;
      }
      
      return site;
    }, { siteId }, 'getPotentialSiteById');
  }
  
  /**
   * Get assignee by role (required by integration tests)
   * @param {string} role - The role to search for
   * @returns {Object|null} Assignee record or null if not found
   */
  getAssigneeByRole(role) {
    return this.executeWithErrorHandlingSync(() => {
      const db = GlobalServiceLocator.get('DatabaseService');
      
      // Search in engineer sheet first
      let records = db.getAllRecords(Config.SHEETS.ENGINEER);
      let assignee = records.find(record => 
        record.Role === role || record.role === role ||
        record.Position === role || record.position === role
      );
      
      if (assignee) {
        return assignee;
      }
      
      // Search in retailer sheet if not found in engineer sheet
      records = db.getAllRecords(Config.SHEETS.RETAILER);
      assignee = records.find(record => 
        record.Role === role || record.role === role ||
        record.Position === role || record.position === role
      );
      
      if (!assignee) {
        this.logger.warn('Assignee not found for role', { role });
        return null;
      }
      
      return assignee;
    }, { role }, 'getAssigneeByRole');
  }
};

// Make CRMHandler globally available for ServiceBootstrap
if (typeof globalThis !== 'undefined') {
  globalThis.CRMHandler = CRMHandler;
} else if (typeof this !== 'undefined') {
  this.CRMHandler = CRMHandler;
}

console.log('CRMHandler service registered globally');