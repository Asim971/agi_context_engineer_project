/**
 * EngineerHandler.js
 * Handles engineer registration flow and CRM events
 * Updated for unified Anwar Sales Ecosystem with Phase 1 modernization
 * 
 * @fileoverview Modern engineer registration handler with comprehensive error handling
 * @version 2.0.0
 */

/**
 * Modern Engineer Handler using service-oriented architecture
 * Extends BaseService for comprehensive error handling and logging
 */
class EngineerHandlerService extends BaseService {
  constructor() {
    super();
    this.serviceName = 'EngineerHandler';
    this.logger = Logger.createChildLogger('EngineerHandler', { module: 'handlers' });
  }

  /**
   * Handle GET requests for engineer registration
   * @param {Object} e - Request event object
   * @returns {ContentService.TextOutput} Response
   */
  doGet(e) {
    return this.executeWithErrorHandling(
      () => {
        return ContentService
          .createTextOutput('Anwar Sales Ecosystem - Engineer Registration')
          .setMimeType(ContentService.MimeType.TEXT);
      },
      { requestType: 'GET', userAgent: e?.parameter?.userAgent },
      'doGet'
    );
  }

  /**
   * Handle form submission for engineer registration
   * @param {Object} e - Form submission event
   * @returns {Promise<void>}
   */
  async onFormSubmit(e) {
    return this.executeWithErrorHandling(
      async () => {
        // Validate form submission event
        if (!e || !e.values) {
          throw new AppScriptError(
            'VALIDATION_MISSING_FORM_DATA',
            'Form submission event is missing or invalid',
            { event: e },
            false,
            'ERROR'
          );
        }

        // Extract and validate form data
        const headers = Config.HEADERS.ENGINEER;
        const data = {};
        
        headers.forEach((header, i) => {
          if (i < e.values.length) {
            data[header] = e.values[i];
          }
        });

        // Validate required fields
        this.validateEngineerData(data);

        // Set initial status
        data['Status'] = 'Pending';
        
        this.logger.info('Processing engineer registration', {
          engineerName: data.Name,
          phone: data.Phone,
          territory: data.Territory
        });

        // Insert into engineer sheet with error handling
        const rowNumber = await this.insertEngineerRecord(data);
        
        // Insert into legacy sheet for backward compatibility
        await this.insertLegacyRecord(data);

        // Send WhatsApp notification
        await this.sendRegistrationNotification(data);
        
        this.logger.info('Engineer registration completed successfully', {
          engineerName: data.Name,
          rowNumber,
          status: data.Status
        });

        return { success: true, rowNumber, data };
      },
      { 
        formId: e?.source?.getId(),
        submissionTime: new Date().toISOString(),
        valuesCount: e?.values?.length 
      },
      'onFormSubmit'
    );
  }

  /**
   * Handle engineer status updates (approval workflow)
   * @param {Object} e - Edit event object
   * @returns {Promise<void>}
   */
  async onEdit(e) {
    return this.executeWithErrorHandling(
      async () => {
        const { range } = e;
        if (!range) {
          throw new AppScriptError(
            'VALIDATION_MISSING_RANGE',
            'Edit event is missing range information',
            { event: e },
            false,
            'ERROR'
          );
        }

        const sheet = range.getSheet();
        const statusColumnIndex = Config.HEADERS.ENGINEER.indexOf('Status') + 1;
        
        // Only process status changes in engineer sheet
        if (sheet.getName() !== Config.SHEETS.ENGINEER || range.getColumn() !== statusColumnIndex) {
          this.logger.debug('Ignoring edit - not engineer status column', {
            sheetName: sheet.getName(),
            column: range.getColumn(),
            expectedColumn: statusColumnIndex
          });
          return;
        }

        const status = range.getValue();
        if (status !== 'Approved') {
          this.logger.debug('Ignoring edit - status not approved', { status });
          return;
        }

        const row = range.getRow();
        
        this.logger.info('Processing engineer approval', {
          row,
          status,
          sheet: sheet.getName()
        });

        // Get engineer record
        const records = getGlobalDB().getAllRecords(Config.SHEETS.ENGINEER);
        const record = records[row - 2]; // Adjust for header and 0-based index
        
        if (!record) {
          throw new AppScriptError(
            'DATABASE_RECORD_NOT_FOUND',
            `Engineer record not found at row ${row}`,
            { row, sheetName: sheet.getName() },
            false,
            'ERROR'
          );
        }

        // Generate and assign ID
        await this.assignEngineerId(sheet, row, record);
        
        // Send approval notifications
        await this.sendApprovalNotifications(record, status);
        
        this.logger.info('Engineer approval processed successfully', {
          engineerId: record.ID,
          engineerName: record.Name,
          status
        });

        return { success: true, record, status };
      },
      {
        sheetName: e.range?.getSheet()?.getName(),
        row: e.range?.getRow(),
        column: e.range?.getColumn(),
        editTime: new Date().toISOString()
      },
      'onEdit'
    );
  }

  /**
   * Validate engineer registration data
   * @private
   * @param {Object} data - Engineer data to validate
   */
  validateEngineerData(data) {
    const requiredFields = ['Name', 'Phone', 'Territory'];
    const missingFields = [];

    requiredFields.forEach(field => {
      if (!data[field] || data[field].toString().trim() === '') {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      throw new AppScriptError(
        'VALIDATION_MISSING_REQUIRED_FIELDS',
        `Missing required fields: ${missingFields.join(', ')}`,
        { missingFields, providedData: this.sanitizeForLogging(data) },
        false,
        'ERROR'
      );
    }

    // Validate phone number format
    if (data.Phone && !/^\+?[\d\s\-\(\)]+$/.test(data.Phone)) {
      throw new AppScriptError(
        'VALIDATION_INVALID_PHONE',
        'Invalid phone number format',
        { phone: '[REDACTED]' },
        false,
        'ERROR'
      );
    }
  }

  /**
   * Insert engineer record into database
   * @private
   * @param {Object} data - Engineer data
   * @returns {Promise<number>} Row number
   */
  async insertEngineerRecord(data) {
    try {
      return getGlobalDB().insertRecord(Config.SHEETS.ENGINEER, data);
    } catch (error) {
      throw new AppScriptError(
        'DATABASE_INSERT_FAILED',
        'Failed to insert engineer record into main sheet',
        { 
          sheetName: Config.SHEETS.ENGINEER,
          data: this.sanitizeForLogging(data),
          originalError: error.message 
        },
        true, // Recoverable - can retry
        'ERROR'
      );
    }
  }

  /**
   * Insert record into legacy sheet for backward compatibility
   * @private
   * @param {Object} data - Engineer data
   * @returns {Promise<number>} Row number
   */
  async insertLegacyRecord(data) {
    try {
      return getGlobalDB().insertRecord(Config.NEW_ENGINEER_SHEET_NAME, data);
    } catch (error) {
      // Log but don't fail the main process for legacy compatibility
      this.logger.warn('Failed to insert into legacy sheet', {
        sheetName: Config.NEW_ENGINEER_SHEET_NAME,
        error: error.message,
        data: this.sanitizeForLogging(data)
      });
      return null;
    }
  }

  /**
   * Send registration notification via WhatsApp
   * @private
   * @param {Object} data - Engineer data
   * @returns {Promise<boolean>} Success status
   */
  async sendRegistrationNotification(data) {
    try {
      const message = WhatsAppService.formatMessage(
        'New Engineer Registration\n' +
        'ID: {{ID}}\n' +
        'Name: {{Name}}\n' +
        'Phone: {{Phone}}\n' +
        'Territory: {{Territory}}\n' +
        'Status: {{Status}}',
        data
      );
      
      return await WhatsAppService.sendMessage(data.Phone, message);
    } catch (error) {
      throw new AppScriptError(
        'API_WHATSAPP_NOTIFICATION_FAILED',
        'Failed to send registration notification',
        { 
          phone: '[REDACTED]',
          originalError: error.message 
        },
        true, // Recoverable - can retry
        'WARN'
      );
    }
  }

  /**
   * Assign engineer ID upon approval
   * @private
   * @param {Sheet} sheet - Google Sheet object
   * @param {number} row - Row number
   * @param {Object} record - Engineer record
   * @returns {Promise<string>} Generated ID
   */
  async assignEngineerId(sheet, row, record) {
    try {
      const id = IdService.getNextId('Engineer');
      const idColumnIndex = Config.HEADERS.ENGINEER.indexOf('ID') + 1;
      
      if (idColumnIndex <= 0) {
        throw new AppScriptError(
          'CONFIG_MISSING_ID_COLUMN',
          'ID column not found in Engineer sheet configuration',
          { headers: Config.HEADERS.ENGINEER },
          false,
          'ERROR'
        );
      }

      sheet.getRange(row, idColumnIndex).setValue(id);
      record['ID'] = id; // Update record for notification
      
      this.logger.info('Engineer ID assigned', {
        engineerId: id,
        engineerName: record.Name,
        row,
        column: idColumnIndex
      });

      return id;
    } catch (error) {
      throw new AppScriptError(
        'DATABASE_ID_ASSIGNMENT_FAILED',
        'Failed to assign engineer ID',
        { 
          row,
          record: this.sanitizeForLogging(record),
          originalError: error.message 
        },
        true, // Recoverable - can retry
        'ERROR'
      );
    }
  }

  /**
   * Send approval notifications to CROs
   * @private
   * @param {Object} record - Engineer record
   * @param {string} status - Approval status
   * @returns {Promise<void>}
   */
  async sendApprovalNotifications(record, status) {
    try {
      const message = WhatsAppService.formatMessage(
        'Engineer Registration Update\n' +
        'ID: {{ID}}\n' +
        'Name: {{Name}}\n' +
        'Status: {{Status}}\n' +
        'Updated: {{Timestamp}}',
        {
          ID: record.ID,
          Name: record.Name,
          Status: status,
          Timestamp: new Date().toLocaleString()
        }
      );
      
      // Get all CRO users
      const croUsers = getGlobalDB().findRecords(Config.USERS_SHEET_NAME, { 'Role': 'CRO' });
      
      if (croUsers.length === 0) {
        this.logger.warn('No CRO users found for notification', {
          sheetName: Config.USERS_SHEET_NAME
        });
        return;
      }

      // Send notifications to all CROs
      const notificationPromises = croUsers.map(async (cro) => {
        try {
          await WhatsAppService.sendMessage(cro['Phone'], message);
          this.logger.debug('Approval notification sent to CRO', {
            croName: cro.Name,
            engineerId: record.ID
          });
        } catch (error) {
          this.logger.warn('Failed to send notification to CRO', {
            croName: cro.Name,
            error: error.message
          });
        }
      });

      await Promise.all(notificationPromises);
      
      this.logger.info('Approval notifications sent', {
        engineerId: record.ID,
        croCount: croUsers.length
      });

    } catch (error) {
      throw new AppScriptError(
        'API_APPROVAL_NOTIFICATIONS_FAILED',
        'Failed to send approval notifications',
        { 
          engineerId: record.ID,
          originalError: error.message 
        },
        true, // Recoverable - can retry
        'WARN'
      );
    }
  }
}

// Create global instance for backward compatibility
const engineerHandlerService = new EngineerHandlerService();

// Export legacy interface for existing code
var EngineerHandler = {
  doGet: (e) => engineerHandlerService.doGet(e),
  onFormSubmit: (e) => engineerHandlerService.onFormSubmit(e),
  onEdit: (e) => engineerHandlerService.onEdit(e)
};