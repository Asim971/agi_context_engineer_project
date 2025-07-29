/**
 * @file SRHandler.js
 * @description Handles Sales Representative (SR) registration, approvals, and related workflows.
 * @version 2.0.0
 */

class SRHandlerService extends BaseService {
  constructor() {
    super();
    this.sheetName = Config.SHEETS.SR;
    this.headers = Config.HEADERS.SR;
    this.idPrefix = 'SR';
    this.logger.info('SRHandlerService initialized');
  }

  /**
   * Handles GET requests for the SR form (placeholder).
   * @param {Object} e - The event parameter.
   * @returns {ContentService.TextOutput} A standard text response.
   */
  doGet(e) {
    return this.executeWithErrorHandling(() => {
      // In a full implementation, this would return an HtmlService template
      // For now, it's a simple endpoint confirmation
      return ContentService
        .createTextOutput('Anwar Sales Ecosystem - SR Registration Endpoint')
        .setMimeType(ContentService.MimeType.TEXT);
    }, { event: e }, 'doGet');
  }

  /**
   * Processes SR registration form submissions.
   * @param {Object} e - The form submission event object.
   */
  onFormSubmit(e) {
    this.executeWithErrorHandling(
      () => {
        const data = this.helpers.mapFormValuesToHeaders(e.values, this.headers);
        data['Status'] = 'Pending'; // Set initial status
        this.logger.info('Processing new SR submission', { srName: data['Name'] });

        this.validateSRData(data);

        const db = getGlobalDB();
        db.insertRecord(this.sheetName, data);

        this.logger.info('SR registration processed successfully', { srName: data['Name'] });
        
        // Optional: Send a notification to an admin or manager
        this.sendNewSRNotification(data);
      },
      { event: e },
      'onFormSubmit'
    );
  }

  /**
   * Handles edits on the SR sheet, specifically for approvals.
   * @param {Object} e - The onEdit event object.
   */
  onEdit(e) {
    this.executeWithErrorHandling(
      () => {
        const { range } = e;
        const sheet = range.getSheet();
        const statusColumnIndex = this.headers.indexOf('Status') + 1;

        if (sheet.getName() !== this.sheetName || range.getColumn() !== statusColumnIndex) {
          this.logger.debug('Ignoring edit - not SR status column');
          return;
        }

        const status = range.getValue();
        if (status !== 'Approved') {
          this.logger.debug('Ignoring edit - status not "Approved"', { status });
          return;
        }

        const row = range.getRow();
        this.logger.info('Processing SR approval', { row });

        const id = IdService.getNextId(this.idPrefix);
        const idColumnIndex = this.headers.indexOf('ID') + 1;

        if (idColumnIndex > 0) {
          sheet.getRange(row, idColumnIndex).setValue(id);
          this.logger.info('SR approved and ID generated', { id, row });
          
          // Send approval notification to the SR
          const records = getGlobalDB().getAllRecords(this.sheetName);
          const record = records[row - 2];
          if (record) {
            this.sendApprovalNotification(record);
          }
        } else {
          throw new AppScriptError('CONFIG_ID_COLUMN_NOT_FOUND', 'ID column not found in SR sheet headers configuration.');
        }
      },
      { event: e },
      'onEdit'
    );
  }

  /**
   * Validates the essential data for a new SR.
   * @private
   * @param {Object} data - The SR data object.
   */
  validateSRData(data) {
    const requiredFields = ['Name', 'Phone', 'Territory'];
    const missingFields = requiredFields.filter(field => !data[field]);

    if (missingFields.length > 0) {
      throw new AppScriptError(
        'VALIDATION_MISSING_REQUIRED_FIELDS',
        `Missing required fields for SR: ${missingFields.join(', ')}`,
        { missingFields }
      );
    }
    this.logger.debug('SR data validated successfully');
  }

  /**
   * Sends a notification about a new SR registration.
   * @private
   * @param {Object} data - The SR data.
   */
  sendNewSRNotification(data) {
    // This is a placeholder. In a real scenario, you might notify a regional manager.
    this.logger.info('New SR notification triggered (simulation)', { srName: data['Name'], territory: data['Territory'] });
  }

  /**
   * Sends an approval notification to the SR.
   * @private
   * @param {Object} record - The approved SR record.
   */
  sendApprovalNotification(record) {
    if (!record || !record['Phone']) {
      this.logger.warn('Cannot send approval notification: missing record or phone number.', { recordId: record ? record['ID'] : 'N/A' });
      return;
    }
    
    const message = `Congratulations ${record['Name']}! Your registration as a Sales Representative has been approved. Your ID is ${record['ID']}.`;
    WhatsAppService.sendMessage(record['Phone'], message);
    this.logger.info('SR approval notification sent', { srId: record['ID'], phone: record['Phone'] });
  }
}

// Create a global instance for the main handler to use
const srHandlerService = new SRHandlerService();

// --- Legacy Wrapper ---
var SRHandler = {
  doGet: (e) => srHandlerService.doGet(e),
  onFormSubmit: (e) => srHandlerService.onFormSubmit(e),
  onEdit: (e) => srHandlerService.onEdit(e)
};
