/**
 * PotentialSiteHandler.js
 * Handles potential site registration flow and CRM events
 * Updated for unified Anwar Sales Ecosystem with Phase 1 modernization
 * 
 * @fileoverview Modern potential site handler with comprehensive error handling
 * @version 2.0.0
 */

/**
 * Modern Potential Site Handler using service-oriented architecture
 * Extends BaseService for comprehensive error handling and logging
 */
class PotentialSiteHandlerService extends BaseService {
  constructor() {
    super();
    this.serviceName = 'PotentialSiteHandler';
    this.logger = Logger.createChildLogger('PotentialSiteHandler', { module: 'handlers' });
  }

  /**
   * Handle GET requests for potential site registration
   * @param {Object} e - Request event object
   * @returns {ContentService.TextOutput} Response
   */
  doGet(e) {
    return this.executeWithErrorHandling(
      () => {
        return ContentService
          .createTextOutput('Anwar Sales Ecosystem - Potential Site Registration')
          .setMimeType(ContentService.MimeType.TEXT);
      },
      { requestType: 'GET', userAgent: e?.parameter?.userAgent },
      'doGet'
    );
  }

  /**
   * Handle form submission for potential site registration
   * @param {Object} e - Form submission event
   * @returns {Promise<void>}
   */
  async onFormSubmit(e) {
    return this.executeWithErrorHandling(
      async () => {
        if (!e || !e.values) {
          throw new AppScriptError('VALIDATION_MISSING_FORM_DATA', 'Form submission event is missing or invalid');
        }

        const headers = Config.HEADERS.POTENTIAL_SITE;
        const data = {};
        headers.forEach((header, i) => {
          if (i < e.values.length) {
            data[header] = e.values[i];
          }
        });

        this.validatePotentialSiteData(data);

        data['Status'] = 'Pending';

        this.logger.info('Processing potential site registration', {
          ownerName: data['Project Owner Name'],
          territory: data['BD Territory']
        });

        await getGlobalDB().insertRecord(Config.SHEETS.POTENTIAL_SITE, data);
        await getGlobalDB().insertRecord(Config.NEW_POTENTIAL_SITE_SHEET_NAME, data);

        await this.sendNewSiteNotification(data);

        this.logger.info('Potential site registration completed successfully', {
          ownerName: data['Project Owner Name']
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
   * Handle potential site status updates (approval workflow)
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
        const statusColumnIndex = Config.HEADERS.POTENTIAL_SITE.indexOf('Status') + 1;

        if (sheet.getName() !== Config.SHEETS.POTENTIAL_SITE || range.getColumn() !== statusColumnIndex) {
          this.logger.debug('Ignoring edit - not potential site status column');
          return;
        }

        const status = range.getValue();
        if (status !== 'Approved') {
          this.logger.debug('Ignoring edit - status not approved', { status });
          return;
        }

        const row = range.getRow();
        this.logger.info('Processing potential site approval', { row, status });

        const records = getGlobalDB().getAllRecords(Config.SHEETS.POTENTIAL_SITE);
        const record = records[row - 2];

        if (!record) {
          throw new AppScriptError('DATABASE_RECORD_NOT_FOUND', `Potential site record not found at row ${row}`);
        }

        await this.assignSiteId(sheet, row, record);
        await this.sendApprovalNotifications(record, status);

        this.logger.info('Potential site approval processed successfully', {
          siteId: record.ID,
          ownerName: record['Project Owner Name']
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
   * Validate potential site registration data
   * @private
   * @param {Object} data - Potential site data
   */
  validatePotentialSiteData(data) {
    const requiredFields = ['Project Owner Name', 'Project Owner Phone', 'Detailed Address', 'BD Territory'];
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
   * Send new potential site notification to BD user
   * @private
   * @param {Object} data - Potential site data
   */
  async sendNewSiteNotification(data) {
    const bdUsers = getGlobalDB().findRecords(Config.USERS_SHEET_NAME, { 'Territory/Bazaar': data['BD Territory'], 'Role': 'BD' });
    
    if (bdUsers.length > 0) {
      const message = WhatsAppService.formatMessage(
        'New Potential Site Registration in your territory ({{BD Territory}})\nID: {{ID}}\nOwner: {{Project Owner Name}}\nPhone: {{Project Owner Phone}}\nAddress: {{Detailed Address}}\nStatus: {{Status}}',
        data
      );
      await WhatsAppService.sendMessage(bdUsers[0]['Phone'], message);
      this.logger.info('New site notification sent to BD user', { bdUser: bdUsers[0]['Name'] });
    } else {
      this.logger.warn('No BD user found for territory', { territory: data['BD Territory'] });
    }
  }

  /**
   * Assign potential site ID upon approval
   * @private
   * @param {Sheet} sheet - Google Sheet object
   * @param {number} row - Row number
   * @param {Object} record - Potential site record
   */
  async assignSiteId(sheet, row, record) {
    const id = IdService.getNextId('Potential Site');
    const idColumnIndex = Config.HEADERS.POTENTIAL_SITE.indexOf('ID') + 1;
    
    if (idColumnIndex > 0) {
      sheet.getRange(row, idColumnIndex).setValue(id);
      record['ID'] = id;
      this.logger.info('Potential site ID assigned', { siteId: id, row });
    } else {
      this.logger.error('ID column not found in Potential Site sheet configuration');
    }
  }

  /**
   * Send approval notifications to BD and CRO users
   * @private
   * @param {Object} record - Potential site record
   * @param {string} status - Approval status
   */
  async sendApprovalNotifications(record, status) {
    const message = WhatsAppService.formatMessage(
      'Potential Site Update\nID: {{ID}}\nOwner: {{Project Owner Name}}\nStatus: {{Status}}\nUpdated: {{Timestamp}}',
      {
        ID: record.ID,
        'Project Owner Name': record['Project Owner Name'],
        Status: status,
        Timestamp: new Date().toLocaleString()
      }
    );

    // Notify BD user
    const bdUsers = getGlobalDB().findRecords(Config.USERS_SHEET_NAME, { 'Territory/Bazaar': record['BD Territory'], 'Role': 'BD' });
    if (bdUsers.length > 0) {
      await WhatsAppService.sendMessage(bdUsers[0]['Phone'], message);
      this.logger.info('Approval notification sent to BD user', { bdUser: bdUsers[0]['Name'] });
    } else {
      this.logger.warn('No BD user found for territory on approval', { territory: record['BD Territory'] });
    }

    // Notify all CROs
    const croUsers = getGlobalDB().findRecords(Config.USERS_SHEET_NAME, { 'Role': 'CRO' });
    const croNotifications = croUsers.map(cro => {
      return WhatsAppService.sendMessage(cro['Phone'], message)
        .then(() => this.logger.debug('Approval notification sent to CRO', { croUser: cro['Name'] }))
        .catch(err => this.logger.warn('Failed to send notification to CRO', { croUser: cro['Name'], error: err.message }));
    });
    
    await Promise.all(croNotifications);
    this.logger.info('CRO approval notifications dispatched', { croCount: croUsers.length });
  }
}

// Create global instance for backward compatibility
const potentialSiteHandlerService = new PotentialSiteHandlerService();

// Export legacy interface
var PotentialSiteHandler = {
  doGet: (e) => potentialSiteHandlerService.doGet(e),
  onFormSubmit: (e) => potentialSiteHandlerService.onFormSubmit(e),
  onEdit: (e) => potentialSiteHandlerService.onEdit(e)
};