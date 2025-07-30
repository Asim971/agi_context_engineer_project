/**
 * @file ConfigurationService.js
 * @description Enhanced centralized service for managing application configuration and environment variables.
 * Provides comprehensive validation, default fallbacks, and environment-aware configuration management.
 * @version 2.0.0
 */

class ConfigurationService extends BaseService {
  constructor() {
    super();
    this.properties = PropertiesService.getScriptProperties();
    this.cache = new Map();
    this.cacheTimeout = 300000; // 5 minutes default
    this.environment = null;
    this.manifestConfig = null;
    this.configSchema = this._getConfigSchema();
    
    // Initialize configuration system
    this._initializeConfiguration();
    
    this.logger.info('Enhanced ConfigurationService initialized', { 
      environment: this.environment,
      cacheTimeout: this.cacheTimeout,
      schemaKeys: Object.keys(this.configSchema).length
    });
  }

  /**
   * Initialize configuration system with validation and environment detection
   * @private
   */
  _initializeConfiguration() {
    try {
      // Detect environment first
      this.environment = this.detectEnvironment();
      
      // Load manifest configuration
      this.manifestConfig = this.loadManifestConfig();
      
      // Load defaults for missing configurations
      this.loadDefaults();
      
      // Validate all configurations
      this.validateConfiguration();
      
      this.logger.info('Configuration system initialized successfully', {
        environment: this.environment,
        manifestLoaded: !!this.manifestConfig
      });
    } catch (error) {
      this.logger.error('Failed to initialize configuration system', { error: error.message });
      throw new AppScriptError('CONFIG_INIT_FAILED', `Configuration initialization failed: ${error.message}`);
    }
  }

  /**
   * Define configuration schema with validation rules and defaults
   * @private
   * @returns {Object} Configuration schema
   */
  _getConfigSchema() {
    return {
      // Core application settings
      SPREADSHEET_ID: { type: 'string', required: true, validator: 'spreadsheetId' },
      IS_TEST_ENVIRONMENT: { type: 'boolean', required: true, default: false },
      
      // API configurations
      MAYTAPI_API_KEY: { type: 'string', required: false, sensitive: true },
      MAYTAPI_URL: { type: 'string', required: false, validator: 'url' },
      
      // Form configurations
      ENGINEER_FORM_ID: { type: 'string', required: true, validator: 'formId' },
      POTENTIAL_SITE_FORM_ID: { type: 'string', required: true, validator: 'formId' },
      RETAILER_FORM_ID: { type: 'string', required: true, validator: 'formId' },
      BD_LEAD_FORM_ID: { type: 'string', required: false, validator: 'formId' },
      SR_FORM_ID: { type: 'string', required: false, validator: 'formId' },
      SITE_UPDATE_FORM_ID: { type: 'string', required: false, validator: 'formId' },
      
      // Performance settings
      CACHE_TIMEOUT: { type: 'number', required: false, default: 300, min: 60, max: 3600 },
      LOG_LEVEL: { type: 'string', required: false, default: 'INFO', enum: ['DEBUG', 'INFO', 'WARN', 'ERROR'] },
      
      // Feature flags
      ENABLE_ANALYTICS: { type: 'boolean', required: false, default: true },
      ENABLE_NOTIFICATIONS: { type: 'boolean', required: false, default: true }
    };
  }

  /**
   * Gets a configuration value with caching and environment awareness.
   * @param {string} key - The configuration key to retrieve.
   * @returns {string|null} The configuration value or null if not found.
   */
  get(key) {
    return this.executeWithErrorHandlingSync(() => {
      // Check cache first
      const cacheKey = `${this.environment}_${key}`;
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          this.logger.debug('Retrieved cached config value', { key, environment: this.environment });
          return cached.value;
        }
      }

      let value;
      
      // Check environment-specific configuration first
      if (this.environment && this.environment !== 'development') {
        value = this.properties.getProperty(`${this.environment.toUpperCase()}_${key}`);
      }
      
      // Fall back to general key
      if (!value) {
        value = this.properties.getProperty(key);
      }
      
      // Check manifest configuration
      if (!value && this.manifestConfig) {
        value = this._getManifestValue(key);
      }
      
      // Cache the result
      this.cache.set(cacheKey, { value, timestamp: Date.now() });
      
      this.logger.debug('Retrieved config value', { 
        key, 
        hasValue: !!value, 
        environment: this.environment,
        source: value ? (this.properties.getProperty(`${this.environment.toUpperCase()}_${key}`) ? 'environment' : 'general') : 'none'
      });
      
      return value;
    }, { key }, 'get');
  }

  /**
   * Gets a configuration value with default fallback and validation.
   * @param {string} key - The configuration key.
   * @param {*} defaultValue - Default value if key is not found.
   * @param {Function|string} validator - Validation function or validator name.
   * @returns {*} The configuration value or default.
   */
  getWithDefault(key, defaultValue, validator = null) {
    return this.executeWithErrorHandlingSync(() => {
      let value = this.get(key);
      
      if (value === null || value === undefined) {
        value = defaultValue;
        this.logger.debug('Using default value for config key', { key, defaultValue });
      }
      
      // Apply validation if provided
      if (validator && value !== null && value !== undefined) {
        const isValid = this._validateValue(key, value, validator);
        if (!isValid) {
          this.logger.warn('Configuration value failed validation, using default', { key, value, validator });
          value = defaultValue;
        }
      }
      
      return value;
    }, { key, defaultValue }, 'getWithDefault');
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
      // Clear cache for this key
      const cacheKey = `${this.environment}_${key}`;
      this.cache.delete(cacheKey);
      this.logger.info('Configuration value set', { key });
    }, { key, value }, 'set');
  }

  /**
   * Validate all configurations against schema
   * @returns {Object} Validation results
   */
  validateConfiguration() {
    return this.executeWithErrorHandlingSync(() => {
      const results = {
        valid: true,
        errors: [],
        warnings: [],
        missing: []
      };

      for (const [key, schema] of Object.entries(this.configSchema)) {
        const value = this.get(key);
        
        // Check required fields
        if (schema.required && (value === null || value === undefined)) {
          results.missing.push(key);
          results.valid = false;
          results.errors.push(`Required configuration '${key}' is missing`);
          continue;
        }
        
        // Skip validation for missing optional fields
        if (!schema.required && (value === null || value === undefined)) {
          continue;
        }
        
        // Validate type
        if (!this._validateType(value, schema.type)) {
          results.errors.push(`Configuration '${key}' has invalid type. Expected: ${schema.type}, Got: ${typeof value}`);
          results.valid = false;
        }
        
        // Validate with custom validator
        if (schema.validator && !this._validateValue(key, value, schema.validator)) {
          results.errors.push(`Configuration '${key}' failed validation: ${schema.validator}`);
          results.valid = false;
        }
        
        // Validate enum values
        if (schema.enum && !schema.enum.includes(value)) {
          results.errors.push(`Configuration '${key}' must be one of: ${schema.enum.join(', ')}`);
          results.valid = false;
        }
        
        // Validate number ranges
        if (schema.type === 'number') {
          const numValue = Number(value);
          if (schema.min !== undefined && numValue < schema.min) {
            results.errors.push(`Configuration '${key}' must be >= ${schema.min}`);
            results.valid = false;
          }
          if (schema.max !== undefined && numValue > schema.max) {
            results.errors.push(`Configuration '${key}' must be <= ${schema.max}`);
            results.valid = false;
          }
        }
      }

      this.logger.info('Configuration validation completed', {
        valid: results.valid,
        errorCount: results.errors.length,
        warningCount: results.warnings.length,
        missingCount: results.missing.length
      });

      return results;
    }, {}, 'validateConfiguration');
  }

  /**
   * Load default values for missing configurations
   */
  loadDefaults() {
    return this.executeWithErrorHandlingSync(() => {
      let defaultsLoaded = 0;
      
      for (const [key, schema] of Object.entries(this.configSchema)) {
        if (schema.default !== undefined) {
          const currentValue = this.get(key);
          if (currentValue === null || currentValue === undefined) {
            this.set(key, String(schema.default));
            defaultsLoaded++;
            this.logger.debug('Loaded default configuration', { key, default: schema.default });
          }
        }
      }
      
      this.logger.info('Default configurations loaded', { count: defaultsLoaded });
      return defaultsLoaded;
    }, {}, 'loadDefaults');
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
   * @param {string} sheetName - The name of the sheet (e.g., 'MAIN').
   * @returns {string} The spreadsheet ID.
   */
  getSpreadsheetId(sheetName) {
    return this.executeWithErrorHandlingSync(() => {
      const key = `${sheetName}_SPREADSHEET_ID`;
      return this.getRequired(key);
    }, { sheetName }, 'getSpreadsheetId');
  }

  /**
   * Get environment-specific configuration
   * @param {string} key - Configuration key
   * @returns {*} Environment-specific value or null
   */
  getEnvironmentConfig(key) {
    return this.executeWithErrorHandlingSync(() => {
      const envKey = `${this.environment.toUpperCase()}_${key}`;
      return this.get(envKey);
    }, { key }, 'getEnvironmentConfig');
  }

  /**
   * Get configuration with environment fallback
   * @param {string} key - Configuration key
   * @param {*} defaultValue - Default value
   * @returns {*} Configuration value
   */
  getWithEnvironmentFallback(key, defaultValue = null) {
    return this.executeWithErrorHandlingSync(() => {
      // Try environment-specific first
      let value = this.getEnvironmentConfig(key);
      if (value !== null && value !== undefined) {
        return value;
      }
      
      // Fall back to general key
      value = this.get(key);
      if (value !== null && value !== undefined) {
        return value;
      }
      
      // Use default
      return defaultValue;
    }, { key, defaultValue }, 'getWithEnvironmentFallback');
  }

  /**
   * Refresh configuration cache
   */
  refreshCache() {
    return this.executeWithErrorHandlingSync(() => {
      this.cache.clear();
      this.logger.info('Configuration cache cleared');
    }, {}, 'refreshCache');
  }

  /**
   * Get configuration summary for debugging
   * @returns {Object} Configuration summary
   */
  getConfigurationSummary() {
    return this.executeWithErrorHandlingSync(() => {
      const summary = {
        environment: this.environment,
        cacheSize: this.cache.size,
        manifestLoaded: !!this.manifestConfig,
        schemaKeys: Object.keys(this.configSchema).length,
        configuredKeys: []
      };
      
      // Get list of configured keys (non-sensitive)
      for (const key of Object.keys(this.configSchema)) {
        const value = this.get(key);
        if (value !== null && value !== undefined) {
          // Don't expose sensitive values
          if (key.includes('API_KEY') || key.includes('SECRET') || key.includes('PASSWORD')) {
            summary.configuredKeys.push(`${key}: [REDACTED]`);
          } else {
            summary.configuredKeys.push(`${key}: ${String(value).substring(0, 50)}${String(value).length > 50 ? '...' : ''}`);
          }
        }
      }
      
      return summary;
    }, {}, 'getConfigurationSummary');
  }

  /**
   * Detect current environment
   * @returns {string} Environment name
   */
  detectEnvironment() {
    return this.executeWithErrorHandlingSync(() => {
      return this._detectEnvironment();
    }, {}, 'detectEnvironment');
  }

  /**
   * Load manifest configuration
   * @returns {Object|null} Manifest configuration
   */
  loadManifestConfig() {
    return this.executeWithErrorHandlingSync(() => {
      return this._loadManifestConfig();
    }, {}, 'loadManifestConfig');
  }

  /**
   * Get value from manifest configuration
   * @param {string} key - Configuration key
   * @returns {*} Manifest value or null
   * @private
   */
  _getManifestValue(key) {
    if (!this.manifestConfig) return null;
    
    // Support nested key access with dot notation
    const keys = key.split('.');
    let value = this.manifestConfig;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return null;
      }
    }
    
    return value;
  }

  /**
   * Detect current environment
   * @returns {string} Environment name
   * @private
   */
  _detectEnvironment() {
    try {
      // Check for explicit environment setting
      const envSetting = this.properties.getProperty('ENVIRONMENT');
      if (envSetting) {
        return envSetting.toLowerCase();
      }
      
      // Check script properties for test indicators
      const testIndicators = ['TEST_MODE', 'TESTING', 'DEBUG_MODE', 'IS_TEST_ENVIRONMENT'];
      for (const indicator of testIndicators) {
        const value = this.properties.getProperty(indicator);
        if (value === 'true' || value === true) {
          return 'test';
        }
      }
      
      // Check for development indicators
      const devIndicators = ['DEV_MODE', 'DEVELOPMENT'];
      for (const indicator of devIndicators) {
        const value = this.properties.getProperty(indicator);
        if (value === 'true' || value === true) {
          return 'development';
        }
      }
      
      // Default to production
      return 'production';
    } catch (error) {
      this.logger.warn('Error detecting environment, defaulting to production', { error: error.message });
      return 'production';
    }
  }

  /**
   * Load manifest configuration
   * @returns {Object|null} Manifest configuration
   * @private
   */
  _loadManifestConfig() {
    try {
      // Try to get manifest from script properties
      const manifestJson = this.properties.getProperty('APP_MANIFEST');
      if (manifestJson) {
        return JSON.parse(manifestJson);
      }
      
      // Could be extended to read from Drive files or other sources
      return null;
    } catch (error) {
      this.logger.warn('Error loading manifest configuration', { error: error.message });
      return null;
    }
  }

  /**
   * Validate a value against a validator
   * @param {string} key - Configuration key
   * @param {*} value - Value to validate
   * @param {Function|string} validator - Validator function or name
   * @returns {boolean} Validation result
   * @private
   */
  _validateValue(key, value, validator) {
    try {
      if (typeof validator === 'function') {
        return validator(value);
      }
      
      if (typeof validator === 'string') {
        return this._applyNamedValidator(value, validator);
      }
      
      return true;
    } catch (error) {
      this.logger.warn('Validation error', { key, validator, error: error.message });
      return false;
    }
  }

  /**
   * Apply named validator
   * @param {*} value - Value to validate
   * @param {string} validatorName - Name of validator
   * @returns {boolean} Validation result
   * @private
   */
  _applyNamedValidator(value, validatorName) {
    const validators = {
      'url': (v) => /^https?:\/\/.+/.test(v),
      'email': (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      'spreadsheetId': (v) => /^[a-zA-Z0-9-_]{44}$/.test(v),
      'formId': (v) => /^[a-zA-Z0-9-_]{56}$/.test(v),
      'apiKey': (v) => v && v.length >= 10,
      'positiveNumber': (v) => !isNaN(v) && Number(v) > 0
    };
    
    const validator = validators[validatorName];
    return validator ? validator(value) : true;
  }

  /**
   * Validate type
   * @param {*} value - Value to validate
   * @param {string} expectedType - Expected type
   * @returns {boolean} Type validation result
   * @private
   */
  _validateType(value, expectedType) {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return !isNaN(Number(value));
      case 'boolean':
        return value === 'true' || value === 'false' || typeof value === 'boolean';
      case 'array':
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed);
        } catch {
          return false;
        }
      case 'object':
        try {
          const parsed = JSON.parse(value);
          return typeof parsed === 'object' && parsed !== null;
        } catch {
          return false;
        }
      default:
        return true;
    }
  }

  /**
   * Get current test environment status
   * @returns {boolean} True if in test environment
   */
  get isTest() {
    return this.environment === 'test' || this.get('IS_TEST_ENVIRONMENT') === 'true';
  }
}

// ConfigurationService is now managed via GlobalServiceLocator for dependency injection
// Removed global instance and ConfigService proxy to prevent load order issues and promote DI
