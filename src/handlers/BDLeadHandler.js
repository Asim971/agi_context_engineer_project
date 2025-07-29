/**
 * @file BDLeadHandler.js
 * @description Handles Business Development (BD) Lead registration and approval workflows.
 * @version 2.0.0
 */

class BDLeadHandlerService extends BaseService {
  constructor() {
    super();
    this.sheetName = Config.SHEETS.BD_LEAD;
    this.headers = Config.HEADERS.BD_LEAD;
    this.idPrefix = 'BD Lead';
    this.logger.info('BDLeadHandlerService initialized');
  }

  /**
   * Handles GET requests for the BD Lead form (placeholder).
   * @param {Object} e - The event parameter.
   * @returns {ContentService.TextOutput} A standard text response.
   */
  doGet(e) {
    return this.executeWithErrorHandling(() => {
      return ContentService
        .createTextOutput('Anwar Sales Ecosystem - BD Lead Registration Endpoint')
        .setMimeType(ContentService.MimeType.TEXT);
    }, { event: e }, 'doGet');
  }

  /**
   * Processes BD Lead registration form submissions.
   * @param {Object} e - The form submission event object.
   */
  onFormSubmit(e) {
    this.executeWithErrorHandling(
      () => {
        const data = this.helpers.mapFormValuesToHeaders(e.values, this.headers);
        data['Status'] = 'Pending'; // Set initial status
        this.logger.info('Processing new BD Lead submission', { leadName: data['Name'] });

        this.validateLeadData(data);

        const db = getGlobalDB();
        db.insertRecord(this.sheetName, data);

        this.logger.info('BD Lead registration processed successfully', { leadName: data['Name'] });
      },
      { event: e },
      'onFormSubmit'
    );
  }

  /**
   * Handles edits on the BD Lead sheet, specifically for approvals.
   * @param {Object} e - The onEdit event object.
   */
  onEdit(e) {
    this.executeWithErrorHandling(
      () => {
        const { range } = e;
        const sheet = range.getSheet();
        const statusColumnIndex = this.headers.indexOf('Status') + 1;

        if (sheet.getName() !== this.sheetName || range.getColumn() !== statusColumnIndex) {
          this.logger.debug('Ignoring edit - not BD Lead status column');
          return;
        }

        const status = range.getValue();
        if (status !== 'Approved') {
          this.logger.debug('Ignoring edit - status not "Approved"', { status });
          return;
        }

        const row = range.getRow();
        this.logger.info('Processing BD Lead approval', { row });

        const id = IdService.getNextId(this.idPrefix);
        const idColumnIndex = this.headers.indexOf('ID') + 1;

        if (idColumnIndex > 0) {
          sheet.getRange(row, idColumnIndex).setValue(id);
          this.logger.info('BD Lead approved and ID generated', { id, row });
        } else {
          throw new AppScriptError('CONFIG_ID_COLUMN_NOT_FOUND', 'ID column not found in BD Lead sheet headers configuration.');
        }
      },
      { event: e },
      'onEdit'
    );
  }

  /**
   * Validates the essential data for a new BD Lead.
   * @private
   * @param {Object} data - The lead data object.
   */
  validateLeadData(data) {
    const requiredFields = ['Name', 'Phone', 'Territory/Bazaar'];
    const missingFields = requiredFields.filter(field => !data[field]);

    if (missingFields.length > 0) {
      throw new AppScriptError(
        'VALIDATION_MISSING_REQUIRED_FIELDS',
        `Missing required fields for BD Lead: ${missingFields.join(', ')}`,
        { missingFields }
      );
    }
    this.logger.debug('BD Lead data validated successfully');
  }
}

// Create a global instance for the main handler to use
const bdLeadHandlerService = new BDLeadHandlerService();

// --- Legacy Wrapper ---
// Provides backward compatibility for any old scripts calling BDLeadHandler directly.
var BDLeadHandler = {
  doGet: (e) => bdLeadHandlerService.doGet(e),
  onFormSubmit: (e) => bdLeadHandlerService.onFormSubmit(e),
  onEdit: (e) => bdLeadHandlerService.onEdit(e)
};
