/**
 * @file ValidationService.js
 * @description Centralized service for data validation logic.
 * This service provides reusable validation functions to be used across different handlers and services.
 * @version 1.0.1
 * 
 * IMPORTANT: Using var assignment pattern for proper BaseService inheritance
 */

var ValidationService = class ValidationService extends BaseService {
  constructor() {
    // Validate BaseService availability
    if (typeof BaseService === 'undefined') {
      throw new Error('BaseService must be loaded before ValidationService');
    }
    
    super();
    this.logger.info('ValidationService initialized');
  }

  /**
   * Checks for the presence of required fields in a data object.
   * @param {Object} data - The data object to validate.
   * @param {string[]} requiredFields - An array of field names that are required.
   * @param {string} entityName - The name of the entity being validated (for logging).
   * @throws {AppScriptError} If any required fields are missing.
   */
  assertRequiredFields(data, requiredFields, entityName = 'Record') {
    this.executeWithErrorHandlingSync(() => {
      const missingFields = requiredFields.filter(field => !data[field] || data[field].toString().trim() === '');

      if (missingFields.length > 0) {
        throw new AppScriptError(
          'VALIDATION_MISSING_REQUIRED_FIELDS',
          `Missing required fields for ${entityName}: ${missingFields.join(', ')}`,
          { missingFields, entityName }
        );
      }
      this.logger.debug(`${entityName} data validated successfully for required fields.`, { entityName });
    }, { data, requiredFields, entityName }, 'assertRequiredFields');
  }

  /**
   * Validates an email address format.
   * @param {string} email - The email address to validate.
   * @returns {boolean} True if the email format is valid.
   * @throws {AppScriptError} If the email format is invalid.
   */
  validateEmail(email) {
    return this.executeWithErrorHandlingSync(() => {
      // Basic regex for email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        throw new AppScriptError('VALIDATION_INVALID_EMAIL', 'Invalid email address format.', { email });
      }
      return true;
    }, { email }, 'validateEmail');
  }

  /**
   * Validates a phone number format (basic).
   * @param {string} phone - The phone number to validate.
   * @returns {boolean} True if the phone number format is valid.
   * @throws {AppScriptError} If the phone number format is invalid.
   */
  validatePhone(phone) {
    return this.executeWithErrorHandlingSync(() => {
      // Allows digits, spaces, hyphens, parentheses, and an optional leading +
      const phoneRegex = /^[+]?[0-9\s\-()]+$/;
      if (!phone || !phoneRegex.test(phone)) {
        throw new AppScriptError('VALIDATION_INVALID_PHONE', 'Invalid phone number format.', { phone });
      }
      return true;
    }, { phone }, 'validatePhone');
  }
}

// --- Global Instance ---
const validationServiceInstance = new ValidationService();

const ValidationServiceGlobal = {
  assertRequiredFields: (data, requiredFields, entityName) => validationServiceInstance.assertRequiredFields(data, requiredFields, entityName),
  validateEmail: (email) => validationServiceInstance.validateEmail(email),
  validatePhone: (phone) => validationServiceInstance.validatePhone(phone)
};
