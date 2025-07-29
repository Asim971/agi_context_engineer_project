/**
 * @file TestEnvironmentService.js
 * @description Manages the creation, setup, and teardown of a dedicated test environment.
 * This service ensures that testing can be done in an isolated and reproducible manner.
 * @version 2.0.0
 */

class TestEnvironmentService extends BaseService {
  constructor() {
    super();
    this.configService = ConfigService;
    this.dbService = getGlobalDB();
    this.testFolderIdKey = 'TEST_ENVIRONMENT_FOLDER_ID';
    this.logger.info('TestEnvironmentService initialized');
  }

  /**
   * Sets up the entire test environment.
   * Creates a dedicated folder, a test spreadsheet, and sets necessary properties.
   */
  setup() {
    this.executeWithErrorHandlingSync(() => {
      this.logger.info('Starting test environment setup...');
      
      const folderId = this._getOrCreateTestFolder();
      const spreadsheetId = this._getOrCreateTestSpreadsheet(folderId);
      
      // Set the master test environment flag
      this.configService.set('IS_TEST_ENVIRONMENT', 'true');
      this.configService.set('TEST_SPREADSHEET_ID', spreadsheetId);

      // Initialize the test database with the new spreadsheet
      const testDb = new DatabaseService(true);
      
      // Initialize all required sheets with headers and validation
      Object.values(Config.SHEETS).forEach(sheetName => {
        this.logger.debug(`Initializing test sheet: ${sheetName}`);
        testDb.getSheet(sheetName);
      });

      this.logger.info('Test environment setup completed successfully.', { folderId, spreadsheetId });
      return { folderId, spreadsheetId };
    }, null, 'setup');
  }

  /**
   * Tears down the test environment by deleting the test folder and properties.
   */
  teardown() {
    this.executeWithErrorHandlingSync(() => {
      this.logger.warn('Starting test environment teardown...');
      const folderId = this.configService.get(this.testFolderIdKey);

      if (folderId) {
        try {
          const folder = DriveApp.getFolderById(folderId);
          folder.setTrashed(true);
          this.logger.info('Test environment folder moved to trash.', { folderId });
        } catch (e) {
          this.logger.error('Failed to trash test folder. It might have been deleted already.', { folderId, error: e.message });
        }
      }

      // Clean up script properties
      const properties = PropertiesService.getScriptProperties();
      properties.deleteProperty('IS_TEST_ENVIRONMENT');
      properties.deleteProperty('TEST_SPREADSHEET_ID');
      properties.deleteProperty(this.testFolderIdKey);
      
      this.logger.info('Test environment properties have been cleared.');
    }, null, 'teardown');
  }

  /**
   * Gets or creates the main test folder in Google Drive.
   * @private
   * @returns {string} The ID of the test folder.
   */
  _getOrCreateTestFolder() {
    let folderId = this.configService.get(this.testFolderIdKey);
    if (folderId) {
      try {
        DriveApp.getFolderById(folderId); // Check if folder exists
        this.logger.debug('Found existing test folder.', { folderId });
        return folderId;
      } catch (e) {
        this.logger.warn('Test folder ID found in properties, but folder is missing. Creating a new one.', { folderId });
      }
    }

    const folder = DriveApp.createFolder(`Anwar Sales Eco - Test Environment - ${new Date().getTime()}`);
    folderId = folder.getId();
    this.configService.set(this.testFolderIdKey, folderId);
    this.logger.info('Created new test environment folder.', { folderId });
    return folderId;
  }

  /**
   * Gets or creates the test spreadsheet within the test folder.
   * @private
   * @param {string} folderId - The ID of the parent test folder.
   * @returns {string} The ID of the test spreadsheet.
   */
  _getOrCreateTestSpreadsheet(folderId) {
    let spreadsheetId = this.configService.get('TEST_SPREADSHEET_ID');
    if (spreadsheetId) {
      try {
        SpreadsheetApp.openById(spreadsheetId); // Check if it exists
        this.logger.debug('Found existing test spreadsheet.', { spreadsheetId });
        return spreadsheetId;
      } catch (e) {
        this.logger.warn('Test spreadsheet ID found, but file is missing. Creating a new one.', { spreadsheetId });
      }
    }

    const spreadsheet = SpreadsheetApp.create(`Anwar Sales Eco - Test Spreadsheet - ${new Date().getTime()}`);
    spreadsheetId = spreadsheet.getId();
    
    // Move the new spreadsheet to the test folder
    const file = DriveApp.getFileById(spreadsheetId);
    const folder = DriveApp.getFolderById(folderId);
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file); // Remove from root to keep Drive clean

    this.logger.info('Created new test spreadsheet.', { spreadsheetId });
    return spreadsheetId;
  }
}

// --- Global Instance & Legacy Wrapper ---
const testEnvironmentServiceInstance = new TestEnvironmentService();

const TestEnvironmentServiceGlobal = {
  setup: () => testEnvironmentServiceInstance.setup(),
  teardown: () => testEnvironmentServiceInstance.teardown()
};
