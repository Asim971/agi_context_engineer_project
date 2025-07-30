/**
 * Configuration Schema Definition
 * Defines validation rules, types, and defaults for all configuration keys
 * 
 * @fileoverview Comprehensive configuration schema for the Anwar Sales Ecosystem
 * @version 2.0.0
 * @author System
 * @since 2024
 */

/**
 * Configuration schema with validation rules and defaults
 * @type {Object}
 */
const CONFIGURATION_SCHEMA = {
  // Core Application Settings
  SPREADSHEET_ID: {
    type: 'string',
    required: true,
    validator: 'spreadsheetId',
    description: 'Main spreadsheet ID for data storage',
    category: 'core'
  },
  
  MAYTAPI_API_KEY: {
    type: 'string',
    required: true,
    validator: 'apiKey',
    description: 'MayTapi WhatsApp API key',
    category: 'api',
    sensitive: true
  },
  
  MAYTAPI_PHONE_ID: {
    type: 'string',
    required: true,
    description: 'MayTapi phone instance ID',
    category: 'api'
  },
  
  // Form Configuration
  ENGINEER_FORM_ID: {
    type: 'string',
    required: true,
    validator: 'formId',
    description: 'Google Form ID for engineer submissions',
    category: 'forms'
  },
  
  CUSTOMER_FORM_ID: {
    type: 'string',
    required: true,
    validator: 'formId',
    description: 'Google Form ID for customer submissions',
    category: 'forms'
  },
  
  SUPPLIER_FORM_ID: {
    type: 'string',
    required: true,
    validator: 'formId',
    description: 'Google Form ID for supplier submissions',
    category: 'forms'
  },
  
  // Performance and Caching
  CACHE_TIMEOUT: {
    type: 'number',
    default: 300000, // 5 minutes
    min: 60000, // 1 minute
    max: 3600000, // 1 hour
    validator: 'positiveNumber',
    description: 'Cache timeout in milliseconds',
    category: 'performance'
  },
  
  MAX_RETRY_ATTEMPTS: {
    type: 'number',
    default: 3,
    min: 1,
    max: 10,
    validator: 'positiveNumber',
    description: 'Maximum retry attempts for failed operations',
    category: 'performance'
  },
  
  REQUEST_TIMEOUT: {
    type: 'number',
    default: 30000, // 30 seconds
    min: 5000, // 5 seconds
    max: 120000, // 2 minutes
    validator: 'positiveNumber',
    description: 'Request timeout in milliseconds',
    category: 'performance'
  },
  
  // Logging Configuration
  LOG_LEVEL: {
    type: 'string',
    default: 'INFO',
    enum: ['DEBUG', 'INFO', 'WARN', 'ERROR'],
    description: 'Application logging level',
    category: 'logging'
  },
  
  ENABLE_PERFORMANCE_LOGGING: {
    type: 'boolean',
    default: 'false',
    description: 'Enable detailed performance logging',
    category: 'logging'
  },
  
  // Feature Flags
  ENABLE_WHATSAPP_INTEGRATION: {
    type: 'boolean',
    default: 'true',
    description: 'Enable WhatsApp messaging integration',
    category: 'features'
  },
  
  ENABLE_EMAIL_NOTIFICATIONS: {
    type: 'boolean',
    default: 'true',
    description: 'Enable email notification system',
    category: 'features'
  },
  
  ENABLE_ADVANCED_VALIDATION: {
    type: 'boolean',
    default: 'true',
    description: 'Enable advanced data validation',
    category: 'features'
  },
  
  ENABLE_CACHING: {
    type: 'boolean',
    default: 'true',
    description: 'Enable application-wide caching',
    category: 'features'
  },
  
  // Environment Detection
  ENVIRONMENT: {
    type: 'string',
    default: 'production',
    enum: ['development', 'test', 'staging', 'production'],
    description: 'Current application environment',
    category: 'environment'
  },
  
  IS_TEST_ENVIRONMENT: {
    type: 'boolean',
    default: 'false',
    description: 'Explicit test environment flag',
    category: 'environment'
  },
  
  DEBUG_MODE: {
    type: 'boolean',
    default: 'false',
    description: 'Enable debug mode for development',
    category: 'environment'
  },
  
  // Security Settings
  ENABLE_RATE_LIMITING: {
    type: 'boolean',
    default: 'true',
    description: 'Enable API rate limiting',
    category: 'security'
  },
  
  MAX_REQUESTS_PER_MINUTE: {
    type: 'number',
    default: 60,
    min: 1,
    max: 1000,
    validator: 'positiveNumber',
    description: 'Maximum API requests per minute',
    category: 'security'
  },
  
  // Data Validation
  STRICT_VALIDATION: {
    type: 'boolean',
    default: 'true',
    description: 'Enable strict data validation',
    category: 'validation'
  },
  
  VALIDATION_TIMEOUT: {
    type: 'number',
    default: 5000, // 5 seconds
    min: 1000, // 1 second
    max: 30000, // 30 seconds
    validator: 'positiveNumber',
    description: 'Validation timeout in milliseconds',
    category: 'validation'
  },
  
  // Notification Settings
  NOTIFICATION_EMAIL: {
    type: 'string',
    validator: 'email',
    description: 'Email address for system notifications',
    category: 'notifications'
  },
  
  ENABLE_SLACK_NOTIFICATIONS: {
    type: 'boolean',
    default: 'false',
    description: 'Enable Slack notification integration',
    category: 'notifications'
  },
  
  SLACK_WEBHOOK_URL: {
    type: 'string',
    validator: 'url',
    description: 'Slack webhook URL for notifications',
    category: 'notifications',
    sensitive: true
  },
  
  // Backup and Recovery
  ENABLE_AUTO_BACKUP: {
    type: 'boolean',
    default: 'true',
    description: 'Enable automatic data backup',
    category: 'backup'
  },
  
  BACKUP_FREQUENCY_HOURS: {
    type: 'number',
    default: 24,
    min: 1,
    max: 168, // 1 week
    validator: 'positiveNumber',
    description: 'Backup frequency in hours',
    category: 'backup'
  },
  
  // Integration Settings
  GOOGLE_DRIVE_FOLDER_ID: {
    type: 'string',
    description: 'Google Drive folder ID for file storage',
    category: 'integration'
  },
  
  ENABLE_GOOGLE_ANALYTICS: {
    type: 'boolean',
    default: 'false',
    description: 'Enable Google Analytics tracking',
    category: 'integration'
  },
  
  // Manifest Configuration
  APP_MANIFEST: {
    type: 'object',
    description: 'Application manifest configuration',
    category: 'manifest'
  }
};

/**
 * Get configuration schema
 * @returns {Object} Configuration schema
 */
function getConfigurationSchema() {
  return CONFIGURATION_SCHEMA;
}

/**
 * Get schema for a specific category
 * @param {string} category - Configuration category
 * @returns {Object} Filtered schema
 */
function getSchemaByCategory(category) {
  const filtered = {};
  for (const [key, config] of Object.entries(CONFIGURATION_SCHEMA)) {
    if (config.category === category) {
      filtered[key] = config;
    }
  }
  return filtered;
}

/**
 * Get all configuration categories
 * @returns {Array<string>} List of categories
 */
function getConfigurationCategories() {
  const categories = new Set();
  for (const config of Object.values(CONFIGURATION_SCHEMA)) {
    if (config.category) {
      categories.add(config.category);
    }
  }
  return Array.from(categories).sort();
}

/**
 * Get required configuration keys
 * @returns {Array<string>} List of required keys
 */
function getRequiredConfigurationKeys() {
  return Object.entries(CONFIGURATION_SCHEMA)
    .filter(([key, config]) => config.required)
    .map(([key]) => key);
}

/**
 * Get sensitive configuration keys
 * @returns {Array<string>} List of sensitive keys
 */
function getSensitiveConfigurationKeys() {
  return Object.entries(CONFIGURATION_SCHEMA)
    .filter(([key, config]) => config.sensitive)
    .map(([key]) => key);
}

// Export for Google Apps Script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CONFIGURATION_SCHEMA,
    getConfigurationSchema,
    getSchemaByCategory,
    getConfigurationCategories,
    getRequiredConfigurationKeys,
    getSensitiveConfigurationKeys
  };
}