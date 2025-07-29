/**
 * @file BDLeadHandler_Enhanced.js
 * @description Enhanced BD Lead handler using the SERVICE LOCATOR PATTERN
 * Demonstrates the service initialization troubleshooting improvements
 * @version 2.2.0 - FIXED for Service Locator Pattern
 */

/**
 * Enhanced BD Lead Handler Service using Service Locator Pattern
 * FIXED: No longer directly extends HandlerService to avoid "HandlerService is not defined" error
 */
var BDLeadHandlerServiceEnhanced = (function() {
  'use strict';
  
  // Get HandlerService base class via service locator (CRITICAL FIX)
  let HandlerServiceClass;
  
  try {
    // Method 1: Try GlobalServiceLocator (preferred)
    if (typeof GlobalServiceLocator !== 'undefined') {
      HandlerServiceClass = GlobalServiceLocator.get('HandlerService');
      console.log('✅ BDLeadHandler_Enhanced: HandlerService resolved via ServiceLocator');
    } else {
      throw new Error('GlobalServiceLocator not available');
    }
  } catch (serviceLocatorError) {
    console.warn('⚠️ BDLeadHandler_Enhanced: ServiceLocator failed, trying direct access', {
      error: serviceLocatorError.message
    });
    
    // Method 2: Try direct access (fallback)
    if (typeof HandlerService !== 'undefined') {
      HandlerServiceClass = HandlerService;
      console.log('✅ BDLeadHandler_Enhanced: HandlerService resolved via direct access');
    } else {
      throw new Error('HandlerService not available through any method. Ensure proper service initialization.');
    }
  }
  
  /**
   * Enhanced BD Lead Handler Class (using service locator pattern)
   */
  class BDLeadHandlerServiceEnhanced extends HandlerServiceClass {
    constructor() {
      try {
        // Get Config via service locator (CRITICAL FIX)
        let config;
        
        if (typeof GlobalServiceLocator !== 'undefined') {
          config = GlobalServiceLocator.get('Config');
        } else if (typeof getGlobalConfig === 'function') {
          config = getGlobalConfig();
        } else if (typeof Config !== 'undefined') {
          config = Config;
        } else {
          // Emergency minimal config
          config = {
            SHEETS: { BD_LEAD: 'BD Lead CRM' },
            HEADERS: { BD_LEAD: ['Timestamp', 'User Name', 'Designation', 'Phone Number', 'Email Address'] }
          };
        }
        
        // Call parent constructor with proper configuration
        super(
          config.SHEETS?.BD_LEAD || 'BD_Lead', // Sheet name with fallback
          config.HEADERS?.BD_LEAD || ['Name', 'Phone', 'Territory/Bazaar', 'Status', 'ID'], // Headers with fallback
          'BD Lead' // ID prefix
        );
        
        console.log('✅ BDLeadHandlerServiceEnhanced initialized successfully via service locator');
        
        // Define required fields for validation (AFTER super() call)
        this.requiredFields = ['Name', 'Phone', 'Territory/Bazaar'];
        
        // Ensure logger is available before using it
        if (this.logger && typeof this.logger.info === 'function') {
          this.logger.info('Enhanced BDLeadHandlerService initialized with improved error handling');
        } else {
          console.log('[INFO] Enhanced BDLeadHandlerService initialized with improved error handling (logger not available)');
        }
        
      } catch (error) {
        console.error('❌ BDLeadHandlerServiceEnhanced initialization failed:', error.message);
        throw error;
      }
  }

  /**
   * Safe logger access with console fallback
   * @private
   * @param {string} level - Log level (info, warn, error, debug)
   * @param {string} message - Log message
   * @param {Object} data - Optional data object
   */
  safeLog(level, message, data = {}) {
    if (this.logger && typeof this.logger[level] === 'function') {
      this.logger[level](message, data);
    } else {
      // Fallback to console
      const consoleMethod = console[level] || console.log;
      consoleMethod(`[${level.toUpperCase()}] BDLeadHandlerServiceEnhanced: ${message}`, data);
    }
  }

  /**
   * Handles GET requests for the BD Lead form
   * @param {Object} e - The event parameter
   * @returns {ContentService.TextOutput} Response content
   */
  doGet(e) {
    return this.executeWithErrorHandling(() => {
      return ContentService
        .createTextOutput('Anwar Sales Ecosystem - BD Lead Registration Endpoint (Enhanced)')
        .setMimeType(ContentService.MimeType.TEXT);
    }, { event: e }, 'doGet');
  }

  /**
   * Processes BD Lead registration form submissions
   * Uses the enhanced processFormSubmission method from HandlerService
   * @param {Object} e - The form submission event object
   */
  onFormSubmit(e) {
    // Use the standardized form processing from HandlerService
    this.processFormSubmission(e, (data, event) => {
      // Custom BD Lead processing logic
      this.safeLog('info', 'Processing new BD Lead submission', { 
        leadName: data['Name'],
        territory: data['Territory/Bazaar']
      });

      // Validate required fields using HandlerHelpers
      this.helpers.validateRequiredFields(data, this.requiredFields);

      // Additional BD Lead specific validation
      this.validateBDLeadSpecific(data);

      // Insert record using safe database access
      const db = this.getDatabase();
      const insertResult = db.insertRecord(this.sheetName, data);

      this.safeLog('info', 'BD Lead registration completed successfully', { 
        leadName: data['Name'],
        recordId: insertResult?.id
      });

      return { success: true, recordId: insertResult?.id };
    });
  }

  /**
   * Handles edits on the BD Lead sheet for approvals
   * Enhanced with better error handling and validation
   * @param {Object} e - The onEdit event object
   */
  onEdit(e) {
    this.executeWithErrorHandling(() => {
      const { range } = e;
      const sheet = range.getSheet();

      // Validate this is our sheet
      if (sheet.getName() !== this.sheetName) {
        this.safeLog('debug', 'Ignoring edit - not BD Lead sheet', { 
          sheetName: sheet.getName(),
          expectedSheet: this.sheetName 
        });
        return;
      }

      // Get status column index safely
      const statusColumnIndex = this.getColumnIndex('Status');
      if (statusColumnIndex === -1) {
        this.safeLog('warn', 'Status column not found in headers configuration');
        return;
      }

      // Check if edit was in status column
      if (range.getColumn() !== statusColumnIndex) {
        this.safeLog('debug', 'Ignoring edit - not status column');
        return;
      }

      const status = range.getValue();
      if (status !== 'Approved') {
        this.safeLog('debug', 'Ignoring edit - status not "Approved"', { status });
        return;
      }

      // Process approval
      this.processBDLeadApproval(e, range);

    }, { event: e }, 'onEdit');
  }

  /**
   * Process BD Lead approval with ID generation
   * @private
   * @param {Object} e - Edit event
   * @param {Range} range - The edited range
   */
  processBDLeadApproval(e, range) {
    const row = range.getRow();
    const sheet = range.getSheet();

    this.safeLog('info', 'Processing BD Lead approval', { row });

    try {
      // Generate ID using IdService
      const id = IdService.getNextId(this.idPrefix);
      
      // Get ID column index
      const idColumnIndex = this.getColumnIndex('ID');
      if (idColumnIndex === -1) {
        throw new AppScriptError(
          'CONFIG_ID_COLUMN_NOT_FOUND', 
          'ID column not found in BD Lead sheet headers configuration'
        );
      }

      // Set the ID
      sheet.getRange(row, idColumnIndex).setValue(id);

      // Get lead data for notifications
      const leadData = this.getRowData(sheet, row);
      
      // Send approval notification if configured
      this.sendApprovalNotification(leadData, id);

      this.safeLog('info', 'BD Lead approved successfully', { 
        id, 
        row, 
        leadName: leadData['Name'] 
      });

    } catch (error) {
      this.safeLog('error', 'BD Lead approval failed', {
        error: error.message,
        row,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * BD Lead specific validation logic
   * @private
   * @param {Object} data - Lead data to validate
   */
  validateBDLeadSpecific(data) {
    // Phone number validation
    if (data['Phone'] && !this.isValidPhoneNumber(data['Phone'])) {
      throw new AppScriptError(
        'VALIDATION_INVALID_PHONE',
        'Phone number format is invalid',
        { phone: data['Phone'] }
      );
    }

    // Territory validation
    if (data['Territory/Bazaar'] && !this.isValidTerritory(data['Territory/Bazaar'])) {
      this.safeLog('warn', 'Territory not in standard list', { 
        territory: data['Territory/Bazaar'] 
      });
    }

    this.safeLog('debug', 'BD Lead specific validation passed', { 
      leadName: data['Name'] 
    });
  }

  /**
   * Validate phone number format
   * @private
   * @param {string} phone - Phone number to validate
   * @returns {boolean} Whether phone is valid
   */
  isValidPhoneNumber(phone) {
    // Basic phone validation - adjust regex as needed
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  /**
   * Validate territory against known list
   * @private
   * @param {string} territory - Territory to validate
   * @returns {boolean} Whether territory is valid
   */
  isValidTerritory(territory) {
    // Get valid territories from config or use default list
    const validTerritories = Config.VALID_TERRITORIES || [
      'North', 'South', 'East', 'West', 'Central'
    ];
    
    return validTerritories.includes(territory);
  }

  /**
   * Get column index for a header name
   * @private
   * @param {string} headerName - Name of the header
   * @returns {number} Column index (1-based) or -1 if not found
   */
  getColumnIndex(headerName) {
    const headerArray = Array.isArray(this.headers) ? this.headers : Object.values(this.headers);
    const index = headerArray.indexOf(headerName);
    return index >= 0 ? index + 1 : -1;
  }

  /**
   * Get all data for a specific row
   * @private
   * @param {Sheet} sheet - The sheet object
   * @param {number} row - Row number
   * @returns {Object} Row data mapped to headers
   */
  getRowData(sheet, row) {
    const headerArray = Array.isArray(this.headers) ? this.headers : Object.values(this.headers);
    const values = sheet.getRange(row, 1, 1, headerArray.length).getValues()[0];
    
    const rowData = {};
    headerArray.forEach((header, index) => {
      rowData[header] = values[index] || '';
    });
    
    return rowData;
  }

  /**
   * Send approval notification
   * @private
   * @param {Object} leadData - Lead data
   * @param {string} id - Generated ID
   */
  sendApprovalNotification(leadData, id) {
    try {
      // Use WhatsApp service if available
      if (typeof WhatsAppService !== 'undefined') {
        const message = `BD Lead Approved!\nName: ${leadData['Name']}\nID: ${id}\nTerritory: ${leadData['Territory/Bazaar']}`;
        
        // Send to lead's phone if available
        if (leadData['Phone']) {
          WhatsAppService.sendMessage(leadData['Phone'], message);
        }
      }
      
      this.safeLog('info', 'Approval notification sent', { 
        leadName: leadData['Name'],
        id 
      });
      
    } catch (error) {
      this.safeLog('warn', 'Failed to send approval notification', {
        error: error.message,
        leadName: leadData['Name']
      });
      // Don't throw - notification failure shouldn't break approval process
    }
  }
}

/**
 * Factory function to create BD Lead handler with proper error handling
 * @returns {BDLeadHandlerServiceEnhanced} Handler instance
 */
function createBDLeadHandler() {
  try {
    return new BDLeadHandlerServiceEnhanced();
  } catch (error) {
    console.error('Failed to create BD Lead handler:', error);
    
    // Attempt service recovery if handler creation fails
    if (typeof performServiceRecovery === 'function') {
      console.log('Attempting service recovery for BD Lead handler...');
      const recoveryResult = performServiceRecovery(['Config', 'DatabaseService']);
      
      if (recoveryResult.overallSuccess) {
        console.log('Service recovery successful, retrying handler creation...');
        return new BDLeadHandlerServiceEnhanced();
      }
    }
    
    // If all else fails, throw the original error
    throw new AppScriptError(
      'BD_LEAD_HANDLER_CREATION_FAILED',
      `Failed to create BD Lead handler: ${error.message}`,
      { originalError: error.message }
    );
  }
  
  // End of BDLeadHandlerServiceEnhanced class
  }
  
  // Return the class for use
  return BDLeadHandlerServiceEnhanced;
})();

// Create enhanced handler instance with error handling
let bdLeadHandlerServiceEnhanced = null;

try {
  bdLeadHandlerServiceEnhanced = new BDLeadHandlerServiceEnhanced();
  console.log('✅ BD Lead handler instance created successfully');
} catch (error) {
  console.error('Critical: BD Lead handler initialization failed:', error);
  
  // Create minimal fallback handler
  bdLeadHandlerServiceEnhanced = {
    doGet: () => ContentService.createTextOutput('BD Lead Handler - Service Unavailable'),
    onFormSubmit: (e) => console.error('BD Lead form submission failed - handler unavailable'),
    onEdit: (e) => console.error('BD Lead edit processing failed - handler unavailable')
  };
}

// Legacy compatibility wrapper with enhanced error handling
var BDLeadHandlerEnhanced = {
  doGet: (e) => {
    try {
      return bdLeadHandlerServiceEnhanced.doGet(e);
    } catch (error) {
      console.error('BD Lead doGet failed:', error);
      return ContentService.createTextOutput('BD Lead Service Error');
    }
  },
  
  onFormSubmit: (e) => {
    try {
      return bdLeadHandlerServiceEnhanced.onFormSubmit(e);
    } catch (error) {
      console.error('BD Lead form submission failed:', error);
      // Attempt emergency recovery
      if (typeof emergencyServiceRecovery === 'function') {
        emergencyServiceRecovery();
      }
      throw error;
    }
  },
  
  onEdit: (e) => {
    try {
      return bdLeadHandlerServiceEnhanced.onEdit(e);
    } catch (error) {
      console.error('BD Lead edit processing failed:', error);
      throw error;
    }
  }
};

// Global registration
if (typeof globalThis !== 'undefined') {
  globalThis.BDLeadHandlerEnhanced = BDLeadHandlerEnhanced;
  globalThis.BDLeadHandlerServiceEnhanced = BDLeadHandlerServiceEnhanced;
}

console.log('✅ BDLeadHandler_Enhanced loaded with service locator pattern');
