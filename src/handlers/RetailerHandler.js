/**
 * RetailerHandler.js
 * Handles retailer registration flow and CRM events
 * Updated for unified Anwar Sales Ecosystem with Phase 1 modernization
 * 
 * @fileoverview Modern retailer registration handler with comprehensive error handling
 * @version 2.0.0
 */

/**
 * Modern Retailer Handler using service-oriented architecture
 * Extends BaseService for comprehensive error handling and logging
 */
class RetailerHandlerService extends BaseService {
  constructor() {
    super();
    this.serviceName = 'RetailerHandler';
    this.logger = Logger.createChildLogger('RetailerHandler', { module: 'handlers' });
  }

  /**
   * Handle GET requests for retailer registration
   * @param {Object} e - Request event object
   * @returns {ContentService.TextOutput} Response
   */
  doGet(e) {
    return this.executeWithErrorHandling(
      () => {
        return ContentService
          .createTextOutput('Anwar Sales Ecosystem - Retailer Registration')
          .setMimeType(ContentService.MimeType.TEXT);
      },
      { requestType: 'GET', userAgent: e?.parameter?.userAgent },
      'doGet'
    );
  }

  /**
   * Handle form submission for retailer registration
   * @param {Object} e - Form submission event
   * @returns {Promise<void>}
   */
  async onFormSubmit(e) {
    return this.executeWithErrorHandling(
      async () => {
        if (!e || !e.values) {
          throw new AppScriptError(
            'VALIDATION_MISSING_FORM_DATA',
            'Form submission event is missing or invalid',
            { event: e },
            false,
            'ERROR'
          );
        }

        const headers = Config.HEADERS.RETAILER;
        const data = {};
        headers.forEach((header, i) => {
          if (i < e.values.length) {
            data[header] = e.values[i];
          }
        });

        this.validateRetailerData(data);

        data['Status'] = 'Pending';

        this.logger.info('Processing retailer registration', {
          retailerName: data['Retailer Name'],
          phone: data['Retailer Phone'],
          territory: data['Territory']
        });

        await getGlobalDB().insertRecord(Config.SHEETS.RETAILER, data);
        await getGlobalDB().insertRecord(Config.NEW_RETAILER_SHEET_NAME, data);

        await this.sendNewRetailerNotification(data);

        this.logger.info('Retailer registration completed successfully', {
          retailerName: data['Retailer Name']
        });
      },
      { 
        formId: e?.source?.getId(),
        submissionTime: new Date().toISOString()
      },
      'onFormSubmit'
    );
  }

  /**
   * Handle retailer status updates (approval workflow)
   * @param {Object} e - Edit event object
   * @returns {Promise<void>}
   */
  async onEdit(e) {
    return this.executeWithErrorHandling(
      async () => {
        const { range } = e;
        if (!range) {
          throw new AppScriptError('VALIDATION_MISSING_RANGE', 'Edit event is missing range information');
        }

        const sheet = range.getSheet();
        const statusColumnIndex = Config.HEADERS.RETAILER.indexOf('Status') + 1;

        if (sheet.getName() !== Config.SHEETS.RETAILER || range.getColumn() !== statusColumnIndex) {
          this.logger.debug('Ignoring edit - not retailer status column');
          return;
        }

        const status = range.getValue();
        if (status !== 'Approved') {
          this.logger.debug('Ignoring edit - status not approved', { status });
          return;
        }

        const row = range.getRow();
        this.logger.info('Processing retailer approval', { row, status });

        const records = getGlobalDB().getAllRecords(Config.SHEETS.RETAILER);
        const record = records[row - 2];

        if (!record) {
          throw new AppScriptError('DATABASE_RECORD_NOT_FOUND', `Retailer record not found at row ${row}`);
        }

        await this.assignRetailerId(sheet, row, record);
        await this.sendApprovalNotification(record, status);

        this.logger.info('Retailer approval processed successfully', {
          retailerId: record.ID,
          retailerName: record['Retailer Name']
        });
      },
      {
        sheetName: e.range?.getSheet()?.getName(),
        row: e.range?.getRow(),
        column: e.range?.getColumn()
      },
      'onEdit'
    );
  }

  /**
   * Validate retailer registration data
   * @private
   * @param {Object} data - Retailer data
   */
  validateRetailerData(data) {
    const requiredFields = ['Retailer Name', 'Retailer Phone', 'Territory'];
    const missingFields = requiredFields.filter(field => !data[field]);

    if (missingFields.length > 0) {
      throw new AppScriptError(
        'VALIDATION_MISSING_REQUIRED_FIELDS',
        `Missing required fields: ${missingFields.join(', ')}`,
        { missingFields }
      );
    }
  }

  /**
   * Send new retailer notification to SR
   * @private
   * @param {Object} data - Retailer data
   */
  async sendNewRetailerNotification(data) {
    const srUsers = getGlobalDB().findRecords(Config.USERS_SHEET_NAME, { 'Territory/Bazaar': data['Territory'], 'Role': 'SR' });
    
    if (srUsers.length > 0) {
      const message = WhatsAppService.formatMessage(
        'New Retailer Registration in your territory ({{Territory}})\nID: {{ID}}\nRetailer: {{Retailer Name}}\nPhone: {{Retailer Phone}}\nStatus: {{Status}}',
        data
      );
      await WhatsAppService.sendMessage(srUsers[0]['Phone'], message);
      this.logger.info('New retailer notification sent to SR', { srUser: srUsers[0]['Name'] });
    } else {
      this.logger.warn('No SR user found for territory', { territory: data['Territory'] });
    }
  }

  /**
   * Assign retailer ID upon approval
   * @private
   * @param {Sheet} sheet - Google Sheet object
   * @param {number} row - Row number
   * @param {Object} record - Retailer record
   */
  async assignRetailerId(sheet, row, record) {
    const id = IdService.getNextId('Retailer');
    const idColumnIndex = Config.HEADERS.RETAILER.indexOf('ID') + 1;
    
    if (idColumnIndex > 0) {
      sheet.getRange(row, idColumnIndex).setValue(id);
      record['ID'] = id;
      this.logger.info('Retailer ID assigned', { retailerId: id, row });
    } else {
      this.logger.error('ID column not found in Retailer sheet configuration');
    }
  }

  /**
   * Send approval notification to SR
   * @private
   * @param {Object} record - Retailer record
   * @param {string} status - Approval status
   */
  async sendApprovalNotification(record, status) {
    const message = WhatsAppService.formatMessage(
      'Retailer Update\nID: {{ID}}\nRetailer: {{Retailer Name}}\nStatus: {{Status}}\nUpdated: {{Timestamp}}',
      {
        ID: record.ID,
        'Retailer Name': record['Retailer Name'],
        Status: status,
        Timestamp: new Date().toLocaleString()
      }
    );

    const srUsers = getGlobalDB().findRecords(Config.USERS_SHEET_NAME, { 'Territory/Bazaar': record['Territory'], 'Role': 'SR' });
    
    if (srUsers.length > 0) {
      await WhatsAppService.sendMessage(srUsers[0]['Phone'], message);
      this.logger.info('Approval notification sent to SR', { srUser: srUsers[0]['Name'] });
    } else {
      this.logger.warn('No SR user found for territory on approval', { territory: record['Territory'] });
    }
  }
}

// Create global instance for backward compatibility
const retailerHandlerService = new RetailerHandlerService();

// Export legacy interface
var RetailerHandler = {
  doGet: (e) => retailerHandlerService.doGet(e),
  onFormSubmit: (e) => retailerHandlerService.onFormSubmit(e),
  onEdit: (e) => retailerHandlerService.onEdit(e)
};