/**
 * BDLeadHandler_ServiceLocator.js
 * Fixed BD Lead Handler using GlobalServiceLocator pattern
 * 
 * Resolves "HandlerService not defined" error by using proper dependency injection
 * 
 * @fileoverview Fixed BD Lead handler with service locator pattern
 * @version 1.0.1
 * @author Google Apps Script Service Initialization Troubleshooter Agent
 */

/**
 * BD Lead Handler with proper dependency injection
 * Uses GlobalServiceLocator to resolve HandlerService base class
 */
var BDLeadHandler_ServiceLocator = (function() {
  'use strict';
  
  // Verify GlobalServiceLocator is available
  if (typeof GlobalServiceLocator === 'undefined') {
    throw new Error('CRITICAL: GlobalServiceLocator not available. Run ServiceBootstrap.bootstrap() first.');
  }
  
  // Get HandlerService base class via service locator
  let HandlerServiceClass;
  try {
    HandlerServiceClass = GlobalServiceLocator.get('HandlerService');
    if (typeof HandlerServiceClass !== 'function') {
      throw new Error('HandlerService is not a constructor function');
    }
  } catch (error) {
    console.error('Failed to resolve HandlerService via GlobalServiceLocator:', error.message);
    
    // Strict dependency injection - no fallbacks
    if (!handlerService) {
      throw new Error('HandlerService not available via GlobalServiceLocator');
    } else {
      throw new Error('HandlerService not available through any method. Ensure proper service initialization.');
    }
  }
  
  /**
   * BD Lead Handler Class
   * Extends HandlerService with BD Lead specific functionality
   */
  class BDLeadHandler extends HandlerServiceClass {
    constructor() {
      try {
        // Get Config via service locator
        const config = GlobalServiceLocator.get('Config');
        
        super(
          config.SHEETS.BD_LEAD,
          config.HEADERS.BD_LEAD,
          'BD'
        );
        
        this.logger.info('BDLeadHandler_ServiceLocator initialized successfully');
        
      } catch (error) {
        console.error('BDLeadHandler_ServiceLocator initialization failed:', error.message);
        throw error;
      }
    }
    
    /**
     * Handle BD Lead form submission
     * @param {Object} e - Form submission event
     */
    onFormSubmit(e) {
      this.processFormSubmission(e, (data) => {
        this.logger.info('Processing BD Lead form submission', {
          timestamp: data.timestamp,
          userName: data.userName
        });
        
        // Validate required fields
        this.validateBDLeadData(data);
        
        // Store in database
        const db = this.getDatabase();
        const record = db.insertRecord(this.sheetName, data);
        
        // Send notification
        if (data.phoneNumber) {
          this.sendWelcomeNotification(data);
        }
        
        this.logger.info('BD Lead registration completed', {
          recordId: record.id,
          userName: data.userName
        });
        
        return record;
      });
    }
    
    /**
     * Handle sheet edit events (approval workflow)
     * @param {Object} e - Edit event
     */
    onEdit(e) {
      this.executeWithErrorHandling(() => {
        const range = e.range;
        const sheet = range.getSheet();
        const row = range.getRow();
        
        // Skip header row
        if (row <= 1) return;
        
        const column = range.getColumn();
        const value = range.getValue();
        
        // Check if status column was edited
        const statusColumnIndex = this.headers.indexOf('Status') + 1;
        if (column === statusColumnIndex && value === 'Approved') {
          this.handleApproval(sheet, row);
        }
      });
    }
    
    /**
     * Validate BD Lead data
     * @param {Object} data - Form data
     */
    validateBDLeadData(data) {
      const requiredFields = ['userName', 'designation', 'phoneNumber', 'emailAddress'];
      const missingFields = [];
      
      for (const field of requiredFields) {
        if (!data[field] || data[field].toString().trim() === '') {
          missingFields.push(field);
        }
      }
      
      if (missingFields.length > 0) {
        throw new AppScriptError(
          'BD_LEAD_VALIDATION_FAILED',
          `Missing required BD Lead fields: ${missingFields.join(', ')}`,
          { missingFields, data }
        );
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.emailAddress)) {
        throw new AppScriptError(
          'BD_LEAD_VALIDATION_FAILED',
          'Invalid email address format',
          { emailAddress: data.emailAddress }
        );
      }
      
      // Validate phone number format
      const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
      if (!phoneRegex.test(data.phoneNumber)) {
        throw new AppScriptError(
          'BD_LEAD_VALIDATION_FAILED',
          'Invalid phone number format',
          { phoneNumber: data.phoneNumber }
        );
      }
    }
    
    /**
     * Handle BD Lead approval
     * @param {Sheet} sheet - Target sheet
     * @param {number} row - Row number
     */
    handleApproval(sheet, row) {
      try {
        // Generate BD Lead ID
        const idService = GlobalServiceLocator.get('IdService');
        const bdLeadId = idService.getNextId('BD_LEAD');
        
        // Update sheet with ID
        const idColumnIndex = this.headers.indexOf('BD Lead ID') + 1;
        if (idColumnIndex > 0) {
          sheet.getRange(row, idColumnIndex).setValue(bdLeadId);
        }
        
        // Send approval notification
        const phoneColumnIndex = this.headers.indexOf('Phone Number') + 1;
        const nameColumnIndex = this.headers.indexOf('User Name') + 1;
        
        if (phoneColumnIndex > 0 && nameColumnIndex > 0) {
          const phoneNumber = sheet.getRange(row, phoneColumnIndex).getValue();
          const userName = sheet.getRange(row, nameColumnIndex).getValue();
          
          if (phoneNumber) {
            this.sendApprovalNotification(userName, phoneNumber, bdLeadId);
          }
        }
        
        this.logger.info('BD Lead approval processed', {
          bdLeadId,
          row
        });
        
      } catch (error) {
        this.logger.error('BD Lead approval failed', {
          error: error.message,
          row
        });
        
        // Update status to error
        const statusColumnIndex = this.headers.indexOf('Status') + 1;
        if (statusColumnIndex > 0) {
          sheet.getRange(row, statusColumnIndex).setValue('Error: ' + error.message);
        }
      }
    }
    
    /**
     * Send welcome notification to new BD Lead
     * @param {Object} data - BD Lead data
     */
    sendWelcomeNotification(data) {
      try {
        const whatsappService = GlobalServiceLocator.get('WhatsAppService');
        const message = `Welcome ${data.userName}! Your BD Lead registration has been received and is under review. You will be notified once approved.`;
        
        whatsappService.sendMessage(data.phoneNumber, message);
        
        this.logger.info('Welcome notification sent', {
          userName: data.userName,
          phoneNumber: data.phoneNumber
        });
        
      } catch (error) {
        this.logger.warn('Failed to send welcome notification', {
          error: error.message,
          userName: data.userName
        });
      }
    }
    
    /**
     * Send approval notification
     * @param {string} userName - User name
     * @param {string} phoneNumber - Phone number
     * @param {string} bdLeadId - BD Lead ID
     */
    sendApprovalNotification(userName, phoneNumber, bdLeadId) {
      try {
        const whatsappService = GlobalServiceLocator.get('WhatsAppService');
        const message = `Congratulations ${userName}! Your BD Lead registration has been approved. Your BD Lead ID is: ${bdLeadId}`;
        
        whatsappService.sendMessage(phoneNumber, message);
        
        this.logger.info('Approval notification sent', {
          userName,
          bdLeadId,
          phoneNumber
        });
        
      } catch (error) {
        this.logger.warn('Failed to send approval notification', {
          error: error.message,
          userName,
          bdLeadId
        });
      }
    }
  }
  
  // Return the class for registration with service locator
  return BDLeadHandler;
})();

/**
 * Register BDLeadHandler with GlobalServiceLocator
 */
if (typeof GlobalServiceLocator !== 'undefined') {
  GlobalServiceLocator.register('BDLeadHandler', BDLeadHandler_ServiceLocator, {
    singleton: true,
    dependencies: ['Config', 'DatabaseService', 'HandlerService']
  });
  
  console.log('✅ BDLeadHandler_ServiceLocator registered with GlobalServiceLocator');
} else {
  console.warn('⚠️ GlobalServiceLocator not available - BDLeadHandler not registered');
}

/**
 * Export for global access
 */
if (typeof globalThis !== 'undefined') {
  // Export for module usage - no global assignments
// Use GlobalServiceLocator for service access
}

console.log('✅ BDLeadHandler_ServiceLocator loaded successfully');
