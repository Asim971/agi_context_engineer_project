/**
 * @file ConfigurationService.js
 * @description Centralized service for managing application configuration and environment variables.
 * It abstracts away the underlying PropertiesService and provides a clean, testable interface.
 * @version 1.0.0
 */

class ConfigurationService extends BaseService {
  constructor() {
    super();
    this.isTest = this._isTestEnvironment();
    this.properties = PropertiesService.getScriptProperties();
    this.logger.info('ConfigurationService initialized', { isTest: this.isTest });
  }

  /**
   * Determines if the script is running in a test environment.
   * @private
   * @returns {boolean} True if in a test environment.
   */
  _isTestEnvironment() {
    // The source of truth for the environment can be a single script property.
    return this.properties.getProperty('IS_TEST_ENVIRONMENT') === 'true';
  }

  /**
   * Gets a configuration value.
   * It first checks for an environment-specific version of the key (e.g., 'TEST_API_KEY')
   * before falling back to the general key.
   * @param {string} key - The configuration key to retrieve (e.g., 'API_KEY').
   * @returns {string|null} The configuration value or null if not found.
   */
  get(key) {
    return this.executeWithErrorHandlingSync(() => {
      let value;
      if (this.isTest) {
        value = this.properties.getProperty(`TEST_${key}`);
      }
      if (!value) {
        value = this.properties.getProperty(key);
      }
      this.logger.debug('Retrieved config value', { key, hasValue: !!value });
      return value;
    }, { key }, 'get');
  }

  /**
   * Gets a required configuration value.
   * @param {string} key - The configuration key.
   * @returns {string} The configuration value.
   * @throws {AppScriptError} If the key is not found.
   */
  getRequired(key) {
    const value = this.get(key);
    if (!value) {
      throw new AppScriptError('CONFIG_KEY_NOT_FOUND', `Required configuration key "${key}" is not set.`);
    }
    return value;
  }

  /**
   * Sets a configuration value in the script properties.
   * @param {string} key - The configuration key to set.
   * @param {string} value - The value to set.
   */
  set(key, value) {
    this.executeWithErrorHandlingSync(() => {
      this.properties.setProperty(key, value);
      this.logger.info('Configuration value set', { key });
    }, { key, value }, 'set');
  }

  /**
   * Retrieves the ID for a form, respecting the current environment.
   * @param {string} formName - The name of the form (e.g., 'ENGINEER').
   * @returns {string} The form ID.
   */
  getFormId(formName) {
    const key = `${formName}_FORM_ID`;
    return this.getRequired(this.isTest ? `TEST_${key}` : key);
  }

  /**
   * Retrieves the ID for a spreadsheet, respecting the current environment.
   * @returns {string} The spreadsheet ID.
   */
  getSpreadsheetId() {
    return this.getRequired('SPREADSHEET_ID');
  }
}

// --- Global Instance ---
const configurationServiceInstance = new ConfigurationService();

const ConfigService = {
  get: (key) => configurationServiceInstance.get(key),
  getRequired: (key) => configurationServiceInstance.getRequired(key),
  set: (key, value) => configurationServiceInstance.set(key, value),
  getFormId: (formName) => configurationServiceInstance.getFormId(formName),
  getSpreadsheetId: () => configurationServiceInstance.getSpreadsheetId(),
  isTestEnvironment: () => configurationServiceInstance.isTest
};
