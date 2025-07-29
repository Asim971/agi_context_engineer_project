# Implementation Guide: Anwar Sales Ecosystem Enhancement

## Overview

This comprehensive implementation guide provides detailed technical specifications, code examples, and step-by-step instructions for transforming the Anwar Sales Ecosystem into a modern, feature-rich sales management platform.

## Table of Contents

1. [Development Environment Setup](#development-environment-setup)
2. [Architecture Modernization](#architecture-modernization)
3. [Phase-by-Phase Implementation](#phase-by-phase-implementation)
4. [Code Quality Standards](#code-quality-standards)
5. [Testing Strategy](#testing-strategy)
6. [Deployment Guidelines](#deployment-guidelines)
7. [Monitoring & Maintenance](#monitoring--maintenance)

## Development Environment Setup

### Prerequisites

```bash
# Required tools
- Node.js 18+ (for local development and testing)
- Google Apps Script CLI (clasp)
- Git for version control
- VS Code with Apps Script extension
- Chrome DevTools for debugging
```

### Project Structure Enhancement

```
e:\Anwar_sales_eco\src\
├── config/
│   ├── Config.js                 # Enhanced configuration
│   ├── Environment.js            # Environment-specific settings
│   └── Constants.js              # Application constants
├── core/
│   ├── BaseService.js            # Base service class
│   ├── ErrorHandler.js           # Centralized error handling
│   ├── Logger.js                 # Logging service
│   └── Cache.js                  # Caching layer
├── database/
│   ├── DatabaseService.js        # Enhanced database operations
│   ├── QueryBuilder.js           # SQL-like query builder
│   ├── ValidationService.js      # Data validation
│   └── MigrationService.js       # Data migration utilities
├── handlers/
│   ├── BaseHandler.js            # Base handler class
│   ├── MainHandler.js            # Enhanced main handler
│   ├── EngineerHandler.js        # Engineer-specific operations
│   ├── SiteHandler.js            # Site management
│   ├── RetailerHandler.js        # Retailer operations
│   └── APIHandler.js             # External API handling
├── services/
│   ├── AuthService.js            # Authentication & authorization
│   ├── NotificationService.js    # Multi-channel notifications
│   ├── AnalyticsService.js       # Analytics and reporting
│   ├── WorkflowService.js        # Workflow automation
│   └── IntegrationService.js     # External integrations
├── ui/
│   ├── components/               # Reusable UI components
│   ├── pages/                    # Page templates
│   ├── assets/                   # Static assets
│   └── styles/                   # CSS and styling
├── utils/
│   ├── DateUtils.js              # Date manipulation utilities
│   ├── StringUtils.js            # String processing utilities
│   ├── ValidationUtils.js        # Validation helpers
│   └── FormatUtils.js            # Data formatting utilities
├── tests/
│   ├── unit/                     # Unit tests
│   ├── integration/              # Integration tests
│   └── e2e/                      # End-to-end tests
└── docs/
    ├── api/                      # API documentation
    ├── user-guides/              # User documentation
    └── technical/                # Technical documentation
```

## Architecture Modernization

### 1. Enhanced Base Service Class

```javascript
// core/BaseService.js
class BaseService {
  constructor(serviceName) {
    this.serviceName = serviceName;
    this.logger = new Logger(serviceName);
    this.cache = new Cache();
    this.errorHandler = new ErrorHandler();
  }
  
  /**
   * Execute operation with error handling and logging
   * @param {Function} operation - Operation to execute
   * @param {Object} context - Operation context
   * @returns {Promise<any>} Operation result
   */
  async executeWithErrorHandling(operation, context = {}) {
    const startTime = Date.now();
    const operationId = Utilities.getUuid();
    
    try {
      this.logger.info(`Starting operation: ${operation.name}`, {
        operationId,
        context,
        service: this.serviceName
      });
      
      const result = await operation();
      
      this.logger.info(`Operation completed successfully: ${operation.name}`, {
        operationId,
        duration: Date.now() - startTime,
        service: this.serviceName
      });
      
      return result;
    } catch (error) {
      this.logger.error(`Operation failed: ${operation.name}`, {
        operationId,
        error: error.message,
        stack: error.stack,
        context,
        duration: Date.now() - startTime,
        service: this.serviceName
      });
      
      throw this.errorHandler.handleError(error, context);
    }
  }
  
  /**
   * Get cached data or execute operation
   * @param {string} cacheKey - Cache key
   * @param {Function} operation - Operation to execute if cache miss
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<any>} Cached or fresh data
   */
  async getCachedOrExecute(cacheKey, operation, ttl = 300) {
    const cached = this.cache.get(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for key: ${cacheKey}`);
      return cached;
    }
    
    this.logger.debug(`Cache miss for key: ${cacheKey}`);
    const result = await this.executeWithErrorHandling(operation);
    this.cache.set(cacheKey, result, ttl);
    
    return result;
  }
}
```

### 2. Enhanced Error Handling System

```javascript
// core/ErrorHandler.js
class ErrorHandler {
  constructor() {
    this.logger = new Logger('ErrorHandler');
  }
  
  /**
   * Handle different types of errors
   * @param {Error} error - The error to handle
   * @param {Object} context - Error context
   * @returns {AppScriptError} Standardized error
   */
  handleError(error, context = {}) {
    if (error instanceof AppScriptError) {
      return error;
    }
    
    // Categorize error types
    const errorType = this.categorizeError(error);
    const standardizedError = new AppScriptError(
      this.getErrorMessage(error, errorType),
      errorType,
      context
    );
    
    // Log error with appropriate level
    this.logError(standardizedError, context);
    
    // Send notifications for critical errors
    if (this.isCriticalError(errorType)) {
      this.notifyCriticalError(standardizedError, context);
    }
    
    return standardizedError;
  }
  
  categorizeError(error) {
    if (error.message.includes('quota')) return 'QUOTA_EXCEEDED';
    if (error.message.includes('permission')) return 'PERMISSION_DENIED';
    if (error.message.includes('network')) return 'NETWORK_ERROR';
    if (error.message.includes('timeout')) return 'TIMEOUT_ERROR';
    if (error.message.includes('validation')) return 'VALIDATION_ERROR';
    
    return 'UNKNOWN_ERROR';
  }
  
  getErrorMessage(error, errorType) {
    const errorMessages = {
      QUOTA_EXCEEDED: 'Service quota exceeded. Please try again later.',
      PERMISSION_DENIED: 'Insufficient permissions to perform this operation.',
      NETWORK_ERROR: 'Network connection error. Please check your connection.',
      TIMEOUT_ERROR: 'Operation timed out. Please try again.',
      VALIDATION_ERROR: 'Invalid data provided. Please check your input.',
      UNKNOWN_ERROR: 'An unexpected error occurred. Please contact support.'
    };
    
    return errorMessages[errorType] || error.message;
  }
  
  isCriticalError(errorType) {
    const criticalErrors = ['QUOTA_EXCEEDED', 'PERMISSION_DENIED', 'UNKNOWN_ERROR'];
    return criticalErrors.includes(errorType);
  }
  
  async notifyCriticalError(error, context) {
    try {
      const notificationService = new NotificationService();
      await notificationService.sendAdminAlert({
        type: 'CRITICAL_ERROR',
        error: error.message,
        context,
        timestamp: new Date().toISOString()
      });
    } catch (notificationError) {
      this.logger.error('Failed to send critical error notification', {
        originalError: error.message,
        notificationError: notificationError.message
      });
    }
  }
}

/**
 * Custom error class for Apps Script
 */
class AppScriptError extends Error {
  constructor(message, type = 'UNKNOWN_ERROR', context = {}) {
    super(message);
    this.name = 'AppScriptError';
    this.type = type;
    this.context = context;
    this.timestamp = new Date().toISOString();
  }
  
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      context: this.context,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }
}
```

### 3. Advanced Logging System

```javascript
// core/Logger.js
class Logger {
  constructor(context = 'App') {
    this.context = context;
    this.logLevel = this.getLogLevel();
  }
  
  getLogLevel() {
    const level = PropertiesService.getScriptProperties().getProperty('LOG_LEVEL');
    return level || 'INFO';
  }
  
  /**
   * Log debug message
   * @param {string} message - Log message
   * @param {Object} data - Additional data
   */
  debug(message, data = {}) {
    if (this.shouldLog('DEBUG')) {
      this.writeLog('DEBUG', message, data);
    }
  }
  
  /**
   * Log info message
   * @param {string} message - Log message
   * @param {Object} data - Additional data
   */
  info(message, data = {}) {
    if (this.shouldLog('INFO')) {
      this.writeLog('INFO', message, data);
    }
  }
  
  /**
   * Log warning message
   * @param {string} message - Log message
   * @param {Object} data - Additional data
   */
  warn(message, data = {}) {
    if (this.shouldLog('WARN')) {
      this.writeLog('WARN', message, data);
    }
  }
  
  /**
   * Log error message
   * @param {string} message - Log message
   * @param {Object} data - Additional data
   */
  error(message, data = {}) {
    if (this.shouldLog('ERROR')) {
      this.writeLog('ERROR', message, data);
      this.writeToErrorSheet(message, data);
    }
  }
  
  shouldLog(level) {
    const levels = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
    return levels[level] >= levels[this.logLevel];
  }
  
  writeLog(level, message, data) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      context: this.context,
      message,
      data: JSON.stringify(data),
      sessionId: this.getSessionId()
    };
    
    // Write to console for development
    console.log(`[${level}] ${this.context}: ${message}`, data);
    
    // Write to log sheet for production
    if (Config.isProduction()) {
      this.writeToLogSheet(logEntry);
    }
  }
  
  writeToLogSheet(logEntry) {
    try {
      const sheet = SpreadsheetApp.openById(Config.LOG_SHEET_ID)
        .getSheetByName('Application_Logs');
      
      if (!sheet) {
        throw new Error('Log sheet not found');
      }
      
      sheet.appendRow([
        logEntry.timestamp,
        logEntry.level,
        logEntry.context,
        logEntry.message,
        logEntry.data,
        logEntry.sessionId
      ]);
    } catch (error) {
      console.error('Failed to write to log sheet:', error.message);
    }
  }
  
  writeToErrorSheet(message, data) {
    try {
      const sheet = SpreadsheetApp.openById(Config.LOG_SHEET_ID)
        .getSheetByName('Error_Logs');
      
      if (!sheet) {
        throw new Error('Error log sheet not found');
      }
      
      sheet.appendRow([
        new Date().toISOString(),
        this.context,
        message,
        JSON.stringify(data),
        data.stack || '',
        this.getSessionId()
      ]);
    } catch (error) {
      console.error('Failed to write to error sheet:', error.message);
    }
  }
  
  getSessionId() {
    let sessionId = PropertiesService.getScriptProperties().getProperty('SESSION_ID');
    if (!sessionId) {
      sessionId = Utilities.getUuid();
      PropertiesService.getScriptProperties().setProperty('SESSION_ID', sessionId);
    }
    return sessionId;
  }
}
```

### 4. Enhanced Caching System

```javascript
// core/Cache.js
class Cache {
  constructor() {
    this.cache = CacheService.getScriptCache();
    this.logger = new Logger('Cache');
  }
  
  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {any} Cached value or null
   */
  get(key) {
    try {
      const cached = this.cache.get(key);
      if (cached) {
        const parsed = JSON.parse(cached);
        
        // Check if expired
        if (parsed.expiry && Date.now() > parsed.expiry) {
          this.cache.remove(key);
          return null;
        }
        
        this.logger.debug(`Cache hit for key: ${key}`);
        return parsed.data;
      }
      
      this.logger.debug(`Cache miss for key: ${key}`);
      return null;
    } catch (error) {
      this.logger.error(`Cache get error for key: ${key}`, { error: error.message });
      return null;
    }
  }
  
  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds
   */
  set(key, value, ttl = 300) {
    try {
      const cacheData = {
        data: value,
        expiry: ttl > 0 ? Date.now() + (ttl * 1000) : null,
        created: Date.now()
      };
      
      this.cache.put(key, JSON.stringify(cacheData), ttl);
      this.logger.debug(`Cache set for key: ${key}`, { ttl });
    } catch (error) {
      this.logger.error(`Cache set error for key: ${key}`, { error: error.message });
    }
  }
  
  /**
   * Remove value from cache
   * @param {string} key - Cache key
   */
  remove(key) {
    try {
      this.cache.remove(key);
      this.logger.debug(`Cache removed for key: ${key}`);
    } catch (error) {
      this.logger.error(`Cache remove error for key: ${key}`, { error: error.message });
    }
  }
  
  /**
   * Clear all cache
   */
  clear() {
    try {
      this.cache.removeAll();
      this.logger.info('Cache cleared');
    } catch (error) {
      this.logger.error('Cache clear error', { error: error.message });
    }
  }
  
  /**
   * Get or set cached value
   * @param {string} key - Cache key
   * @param {Function} valueFunction - Function to get value if not cached
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<any>} Cached or fresh value
   */
  async getOrSet(key, valueFunction, ttl = 300) {
    let value = this.get(key);
    
    if (value === null) {
      value = await valueFunction();
      this.set(key, value, ttl);
    }
    
    return value;
  }
  
  /**
   * Generate cache key from parameters
   * @param {string} prefix - Key prefix
   * @param {...any} params - Parameters to include in key
   * @returns {string} Generated cache key
   */
  static generateKey(prefix, ...params) {
    const paramString = params
      .map(param => typeof param === 'object' ? JSON.stringify(param) : String(param))
      .join('|');
    
    return `${prefix}:${Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, paramString)}`;
  }
}
```

## Phase-by-Phase Implementation

### Phase 1: Foundation (Weeks 1-4)

#### Week 1: Core Infrastructure

**Day 1-2: Enhanced Configuration System**

```javascript
// config/Environment.js
class Environment {
  static getCurrentEnvironment() {
    const scriptId = ScriptApp.getScriptId();
    const environments = {
      'PRODUCTION_SCRIPT_ID': 'production',
      'STAGING_SCRIPT_ID': 'staging',
      'DEVELOPMENT_SCRIPT_ID': 'development'
    };
    
    return environments[scriptId] || 'development';
  }
  
  static getConfig() {
    const env = this.getCurrentEnvironment();
    const configs = {
      production: {
        logLevel: 'ERROR',
        cacheTimeout: 600,
        enableAnalytics: true,
        enableNotifications: true,
        apiRateLimit: 100
      },
      staging: {
        logLevel: 'WARN',
        cacheTimeout: 300,
        enableAnalytics: true,
        enableNotifications: false,
        apiRateLimit: 50
      },
      development: {
        logLevel: 'DEBUG',
        cacheTimeout: 60,
        enableAnalytics: false,
        enableNotifications: false,
        apiRateLimit: 10
      }
    };
    
    return configs[env];
  }
}

// Enhanced config/Config.js
class Config {
  static init() {
    this.environment = Environment.getCurrentEnvironment();
    this.envConfig = Environment.getConfig();
    this.properties = PropertiesService.getScriptProperties();
  }
  
  // Secure API key management
  static getApiKey(service) {
    const key = this.properties.getProperty(`${service.toUpperCase()}_API_KEY`);
    if (!key) {
      throw new AppScriptError(`API key not found for service: ${service}`, 'CONFIGURATION_ERROR');
    }
    return key;
  }
  
  static setApiKey(service, key) {
    this.properties.setProperty(`${service.toUpperCase()}_API_KEY`, key);
  }
  
  // Environment-specific URLs
  static getBaseUrl() {
    const urls = {
      production: 'https://script.google.com/macros/s/YOUR_PROD_ID/exec',
      staging: 'https://script.google.com/macros/s/YOUR_STAGING_ID/exec',
      development: 'https://script.google.com/macros/s/YOUR_DEV_ID/exec'
    };
    
    return urls[this.environment];
  }
  
  // Sheet configuration with validation
  static getSheetConfig(sheetType) {
    const configs = {
      engineers: {
        name: 'Engineers',
        headers: ['ID', 'Name', 'Phone', 'Email', 'Territory', 'Status', 'Created', 'Updated'],
        requiredColumns: ['Name', 'Phone', 'Territory'],
        validationRules: {
          Phone: /^\+?[1-9]\d{1,14}$/,
          Email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        }
      },
      sites: {
        name: 'Potential_Sites',
        headers: ['ID', 'Name', 'Location', 'Contact', 'Status', 'Engineer_ID', 'Created', 'Updated'],
        requiredColumns: ['Name', 'Location', 'Contact'],
        validationRules: {
          Contact: /^\+?[1-9]\d{1,14}$/
        }
      }
    };
    
    const config = configs[sheetType];
    if (!config) {
      throw new AppScriptError(`Unknown sheet type: ${sheetType}`, 'CONFIGURATION_ERROR');
    }
    
    return config;
  }
  
  static isProduction() {
    return this.environment === 'production';
  }
  
  static isDevelopment() {
    return this.environment === 'development';
  }
}

// Initialize configuration
Config.init();
```

**Day 3-4: Enhanced Database Service**

```javascript
// database/QueryBuilder.js
class QueryBuilder {
  constructor(sheetName) {
    this.sheetName = sheetName;
    this.conditions = [];
    this.sortBy = null;
    this.limitCount = null;
    this.offsetCount = 0;
  }
  
  where(column, operator, value) {
    this.conditions.push({ column, operator, value });
    return this;
  }
  
  orderBy(column, direction = 'ASC') {
    this.sortBy = { column, direction };
    return this;
  }
  
  limit(count) {
    this.limitCount = count;
    return this;
  }
  
  offset(count) {
    this.offsetCount = count;
    return this;
  }
  
  build() {
    return {
      sheetName: this.sheetName,
      conditions: this.conditions,
      sortBy: this.sortBy,
      limit: this.limitCount,
      offset: this.offsetCount
    };
  }
}

// Enhanced database/DatabaseService.js
class DatabaseService extends BaseService {
  constructor() {
    super('DatabaseService');
    this.queryBuilder = QueryBuilder;
  }
  
  /**
   * Execute query with caching
   * @param {Object} query - Query object from QueryBuilder
   * @returns {Promise<Array>} Query results
   */
  async executeQuery(query) {
    const cacheKey = Cache.generateKey('query', query);
    
    return await this.getCachedOrExecute(
      cacheKey,
      () => this._executeQueryInternal(query),
      300 // 5 minutes cache
    );
  }
  
  async _executeQueryInternal(query) {
    const sheet = this.getSheet(query.sheetName);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    // Convert to objects
    let results = rows.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });
    
    // Apply conditions
    results = this.applyConditions(results, query.conditions);
    
    // Apply sorting
    if (query.sortBy) {
      results = this.applySorting(results, query.sortBy);
    }
    
    // Apply pagination
    if (query.limitCount || query.offsetCount) {
      const start = query.offsetCount;
      const end = query.limitCount ? start + query.limitCount : undefined;
      results = results.slice(start, end);
    }
    
    return results;
  }
  
  applyConditions(data, conditions) {
    return data.filter(row => {
      return conditions.every(condition => {
        const { column, operator, value } = condition;
        const cellValue = row[column];
        
        switch (operator) {
          case '=':
          case 'eq':
            return cellValue === value;
          case '!=':
          case 'ne':
            return cellValue !== value;
          case '>':
          case 'gt':
            return cellValue > value;
          case '>=':
          case 'gte':
            return cellValue >= value;
          case '<':
          case 'lt':
            return cellValue < value;
          case '<=':
          case 'lte':
            return cellValue <= value;
          case 'contains':
            return String(cellValue).toLowerCase().includes(String(value).toLowerCase());
          case 'startsWith':
            return String(cellValue).toLowerCase().startsWith(String(value).toLowerCase());
          case 'endsWith':
            return String(cellValue).toLowerCase().endsWith(String(value).toLowerCase());
          case 'in':
            return Array.isArray(value) && value.includes(cellValue);
          default:
            return false;
        }
      });
    });
  }
  
  applySorting(data, sortBy) {
    const { column, direction } = sortBy;
    
    return data.sort((a, b) => {
      const aVal = a[column];
      const bVal = b[column];
      
      let comparison = 0;
      if (aVal > bVal) comparison = 1;
      if (aVal < bVal) comparison = -1;
      
      return direction === 'DESC' ? -comparison : comparison;
    });
  }
  
  /**
   * Batch insert records
   * @param {string} sheetName - Sheet name
   * @param {Array} records - Records to insert
   * @returns {Promise<Array>} Inserted records with IDs
   */
  async batchInsert(sheetName, records) {
    return await this.executeWithErrorHandling(async () => {
      const sheet = this.getSheet(sheetName);
      const config = Config.getSheetConfig(sheetName.toLowerCase());
      
      // Validate records
      const validatedRecords = records.map(record => 
        this.validateRecord(record, config)
      );
      
      // Prepare data for batch insert
      const headers = config.headers;
      const rows = validatedRecords.map(record => {
        const row = headers.map(header => {
          if (header === 'ID') {
            return record.ID || Utilities.getUuid();
          }
          if (header === 'Created' || header === 'Updated') {
            return new Date().toISOString();
          }
          return record[header] || '';
        });
        return row;
      });
      
      // Batch insert
      if (rows.length > 0) {
        const range = sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, headers.length);
        range.setValues(rows);
      }
      
      // Clear cache
      this.cache.remove(Cache.generateKey('query', { sheetName }));
      
      return validatedRecords;
    });
  }
  
  validateRecord(record, config) {
    // Check required fields
    config.requiredColumns.forEach(column => {
      if (!record[column] || record[column].toString().trim() === '') {
        throw new AppScriptError(
          `Required field missing: ${column}`,
          'VALIDATION_ERROR',
          { record, column }
        );
      }
    });
    
    // Apply validation rules
    Object.entries(config.validationRules || {}).forEach(([column, rule]) => {
      if (record[column] && !rule.test(record[column])) {
        throw new AppScriptError(
          `Invalid format for field: ${column}`,
          'VALIDATION_ERROR',
          { record, column, value: record[column] }
        );
      }
    });
    
    return record;
  }
  
  getSheet(sheetName) {
    const spreadsheet = SpreadsheetApp.openById(Config.SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(sheetName);
    
    if (!sheet) {
      throw new AppScriptError(
        `Sheet not found: ${sheetName}`,
        'CONFIGURATION_ERROR',
        { sheetName }
      );
    }
    
    return sheet;
  }
}
```

**Day 5: Enhanced Handler Base Class**

```javascript
// handlers/BaseHandler.js
class BaseHandler extends BaseService {
  constructor(handlerName) {
    super(handlerName);
    this.db = new DatabaseService();
    this.validator = new ValidationService();
    this.notificationService = new NotificationService();
  }
  
  /**
   * Process form submission
   * @param {Object} formData - Form data
   * @param {string} formType - Type of form
   * @returns {Promise<Object>} Processing result
   */
  async processFormSubmission(formData, formType) {
    return await this.executeWithErrorHandling(async () => {
      // Validate form data
      const validatedData = await this.validator.validateFormData(formData, formType);
      
      // Process business logic
      const processedData = await this.processBusinessLogic(validatedData, formType);
      
      // Save to database
      const savedRecord = await this.saveRecord(processedData, formType);
      
      // Send notifications
      await this.sendNotifications(savedRecord, formType);
      
      // Return success response
      return {
        success: true,
        data: savedRecord,
        message: `${formType} submitted successfully`,
        id: savedRecord.ID
      };
    }, { formType, formData });
  }
  
  /**
   * Process business logic (to be overridden by specific handlers)
   * @param {Object} data - Validated data
   * @param {string} formType - Form type
   * @returns {Promise<Object>} Processed data
   */
  async processBusinessLogic(data, formType) {
    // Add common fields
    data.ID = data.ID || Utilities.getUuid();
    data.Status = data.Status || 'Pending';
    data.Created = new Date().toISOString();
    data.Updated = new Date().toISOString();
    
    return data;
  }
  
  /**
   * Save record to appropriate sheet
   * @param {Object} data - Data to save
   * @param {string} formType - Form type
   * @returns {Promise<Object>} Saved record
   */
  async saveRecord(data, formType) {
    const sheetName = this.getSheetNameForFormType(formType);
    const records = await this.db.batchInsert(sheetName, [data]);
    return records[0];
  }
  
  /**
   * Send notifications
   * @param {Object} record - Saved record
   * @param {string} formType - Form type
   */
  async sendNotifications(record, formType) {
    try {
      const notifications = this.getNotificationConfig(formType);
      
      for (const notification of notifications) {
        await this.notificationService.send({
          type: notification.type,
          recipients: notification.recipients,
          template: notification.template,
          data: record
        });
      }
    } catch (error) {
      this.logger.warn('Failed to send notifications', {
        error: error.message,
        formType,
        recordId: record.ID
      });
    }
  }
  
  /**
   * Get sheet name for form type
   * @param {string} formType - Form type
   * @returns {string} Sheet name
   */
  getSheetNameForFormType(formType) {
    const mapping = {
      engineer: 'Engineers',
      site: 'Potential_Sites',
      retailer: 'Retailers',
      lead: 'BD_Leads'
    };
    
    return mapping[formType] || 'Unknown';
  }
  
  /**
   * Get notification configuration for form type
   * @param {string} formType - Form type
   * @returns {Array} Notification configurations
   */
  getNotificationConfig(formType) {
    const configs = {
      engineer: [
        {
          type: 'whatsapp',
          recipients: ['admin'],
          template: 'new_engineer_registration'
        },
        {
          type: 'email',
          recipients: ['hr@company.com'],
          template: 'new_engineer_notification'
        }
      ],
      site: [
        {
          type: 'whatsapp',
          recipients: ['territory_manager'],
          template: 'new_site_registration'
        }
      ]
    };
    
    return configs[formType] || [];
  }
  
  /**
   * Handle GET requests
   * @param {Object} e - Event object
   * @returns {HtmlOutput} HTML response
   */
  doGet(e) {
    try {
      const page = e.parameter.page || 'dashboard';
      return this.renderPage(page, e.parameter);
    } catch (error) {
      this.logger.error('GET request failed', { error: error.message, parameters: e.parameter });
      return this.renderErrorPage(error);
    }
  }
  
  /**
   * Handle POST requests
   * @param {Object} e - Event object
   * @returns {Object} JSON response
   */
  doPost(e) {
    try {
      const data = JSON.parse(e.postData.contents);
      const action = data.action || 'submit';
      
      return this.handleAction(action, data);
    } catch (error) {
      this.logger.error('POST request failed', { error: error.message, postData: e.postData });
      return {
        success: false,
        error: error.message,
        type: error.type || 'UNKNOWN_ERROR'
      };
    }
  }
  
  /**
   * Render page (to be overridden by specific handlers)
   * @param {string} page - Page name
   * @param {Object} params - URL parameters
   * @returns {HtmlOutput} HTML output
   */
  renderPage(page, params) {
    return HtmlService.createHtmlOutput(`
      <html>
        <head>
          <title>Anwar Sales Ecosystem</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
          <h1>Page: ${page}</h1>
          <p>Parameters: ${JSON.stringify(params)}</p>
        </body>
      </html>
    `);
  }
  
  /**
   * Render error page
   * @param {Error} error - Error object
   * @returns {HtmlOutput} Error page
   */
  renderErrorPage(error) {
    return HtmlService.createHtmlOutput(`
      <html>
        <head>
          <title>Error - Anwar Sales Ecosystem</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
          <h1>An Error Occurred</h1>
          <p>We're sorry, but something went wrong.</p>
          <p>Error: ${error.message}</p>
          <p>Please try again later or contact support.</p>
        </body>
      </html>
    `);
  }
  
  /**
   * Handle specific actions (to be overridden by specific handlers)
   * @param {string} action - Action name
   * @param {Object} data - Request data
   * @returns {Object} Action result
   */
  handleAction(action, data) {
    switch (action) {
      case 'submit':
        return this.processFormSubmission(data.formData, data.formType);
      default:
        throw new AppScriptError(`Unknown action: ${action}`, 'INVALID_ACTION');
    }
  }
}
```

### Week 2: Enhanced Handlers Implementation

**Enhanced MainHandler.js**

```javascript
// handlers/MainHandler.js
class MainHandler extends BaseHandler {
  constructor() {
    super('MainHandler');
    this.routes = this.initializeRoutes();
  }
  
  initializeRoutes() {
    return {
      '/': { handler: 'renderDashboard', method: 'GET' },
      '/engineer': { handler: 'renderEngineerForm', method: 'GET' },
      '/site': { handler: 'renderSiteForm', method: 'GET' },
      '/retailer': { handler: 'renderRetailerForm', method: 'GET' },
      '/api/submit': { handler: 'handleSubmission', method: 'POST' },
      '/api/search': { handler: 'handleSearch', method: 'GET' },
      '/api/analytics': { handler: 'handleAnalytics', method: 'GET' }
    };
  }
  
  doGet(e) {
    const path = e.parameter.path || '/';
    const route = this.routes[path];
    
    if (!route || route.method !== 'GET') {
      return this.renderNotFoundPage();
    }
    
    return this[route.handler](e.parameter);
  }
  
  doPost(e) {
    const path = e.parameter.path || '/api/submit';
    const route = this.routes[path];
    
    if (!route || route.method !== 'POST') {
      return { success: false, error: 'Route not found' };
    }
    
    const data = JSON.parse(e.postData.contents);
    return this[route.handler](data);
  }
  
  renderDashboard(params) {
    return HtmlService.createTemplateFromFile('ui/pages/dashboard')
      .evaluate()
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  
  renderEngineerForm(params) {
    const template = HtmlService.createTemplateFromFile('ui/pages/engineer-form');
    template.formId = Config.ENGINEER_FORM_ID;
    template.territories = this.getTerritories();
    
    return template.evaluate()
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  
  async handleSubmission(data) {
    const { formType, formData } = data;
    
    switch (formType) {
      case 'engineer':
        return await new EngineerHandler().processFormSubmission(formData, formType);
      case 'site':
        return await new SiteHandler().processFormSubmission(formData, formType);
      case 'retailer':
        return await new RetailerHandler().processFormSubmission(formData, formType);
      default:
        throw new AppScriptError(`Unknown form type: ${formType}`, 'INVALID_FORM_TYPE');
    }
  }
  
  async handleSearch(params) {
    const { query, type, filters } = params;
    const searchService = new SearchService();
    
    return await searchService.search(query, type, filters);
  }
  
  async handleAnalytics(params) {
    const { metric, timeRange, filters } = params;
    const analyticsService = new AnalyticsService();
    
    return await analyticsService.getMetrics(metric, timeRange, filters);
  }
  
  getTerritories() {
    // This could be cached or fetched from a configuration sheet
    return [
      'North Region',
      'South Region',
      'East Region',
      'West Region',
      'Central Region'
    ];
  }
  
  renderNotFoundPage() {
    return HtmlService.createHtmlOutput(`
      <html>
        <head>
          <title>Page Not Found - Anwar Sales Ecosystem</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
          <h1>404 - Page Not Found</h1>
          <p>The requested page could not be found.</p>
          <a href="?">Return to Dashboard</a>
        </body>
      </html>
    `);
  }
}

// Global functions for Apps Script
function doGet(e) {
  return new MainHandler().doGet(e);
}

function doPost(e) {
  return new MainHandler().doPost(e);
}

function setup() {
  return new MainHandler().setup();
}
```

## Testing Strategy

### Unit Testing Framework

```javascript
// tests/TestFramework.js
class TestFramework {
  constructor() {
    this.tests = [];
    this.results = {
      passed: 0,
      failed: 0,
      errors: []
    };
  }
  
  describe(description, testFunction) {
    console.log(`\n=== ${description} ===`);
    testFunction.call(this);
  }
  
  it(description, testFunction) {
    try {
      testFunction.call(this);
      this.results.passed++;
      console.log(`✓ ${description}`);
    } catch (error) {
      this.results.failed++;
      this.results.errors.push({ description, error: error.message });
      console.log(`✗ ${description}: ${error.message}`);
    }
  }
  
  expect(actual) {
    return {
      toBe: (expected) => {
        if (actual !== expected) {
          throw new Error(`Expected ${expected}, but got ${actual}`);
        }
      },
      toEqual: (expected) => {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
          throw new Error(`Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
        }
      },
      toContain: (expected) => {
        if (!actual.includes(expected)) {
          throw new Error(`Expected ${actual} to contain ${expected}`);
        }
      },
      toThrow: (expectedError) => {
        let threw = false;
        try {
          actual();
        } catch (error) {
          threw = true;
          if (expectedError && !error.message.includes(expectedError)) {
            throw new Error(`Expected error containing '${expectedError}', but got '${error.message}'`);
          }
        }
        if (!threw) {
          throw new Error('Expected function to throw an error');
        }
      }
    };
  }
  
  runTests() {
    console.log(`\n=== Test Results ===`);
    console.log(`Passed: ${this.results.passed}`);
    console.log(`Failed: ${this.results.failed}`);
    
    if (this.results.errors.length > 0) {
      console.log(`\nErrors:`);
      this.results.errors.forEach(error => {
        console.log(`- ${error.description}: ${error.error}`);
      });
    }
    
    return this.results;
  }
}

// Example test file
// tests/unit/DatabaseService.test.js
function testDatabaseService() {
  const test = new TestFramework();
  
  test.describe('DatabaseService', function() {
    test.it('should create query builder', function() {
      const query = new QueryBuilder('Engineers')
        .where('Status', '=', 'Active')
        .orderBy('Name', 'ASC')
        .limit(10)
        .build();
      
      test.expect(query.sheetName).toBe('Engineers');
      test.expect(query.conditions.length).toBe(1);
      test.expect(query.limit).toBe(10);
    });
    
    test.it('should validate required fields', function() {
      const db = new DatabaseService();
      const config = {
        requiredColumns: ['Name', 'Phone'],
        validationRules: {}
      };
      
      test.expect(() => {
        db.validateRecord({}, config);
      }).toThrow('Required field missing');
    });
    
    test.it('should validate phone format', function() {
      const db = new DatabaseService();
      const config = {
        requiredColumns: ['Name'],
        validationRules: {
          Phone: /^\+?[1-9]\d{1,14}$/
        }
      };
      
      test.expect(() => {
        db.validateRecord({ Name: 'Test', Phone: 'invalid' }, config);
      }).toThrow('Invalid format');
    });
  });
  
  return test.runTests();
}
```

## Deployment Guidelines

### Deployment Checklist

```markdown
## Pre-Deployment Checklist

### Code Quality
- [ ] All unit tests passing
- [ ] Code review completed
- [ ] No console.log statements in production code
- [ ] Error handling implemented
- [ ] Logging configured

### Configuration
- [ ] Environment variables set
- [ ] API keys configured in PropertiesService
- [ ] Sheet permissions verified
- [ ] Trigger setup completed

### Security
- [ ] No hardcoded secrets
- [ ] Input validation implemented
- [ ] Authorization checks in place
- [ ] HTTPS enforced

### Performance
- [ ] Caching implemented
- [ ] Batch operations used
- [ ] Query optimization completed
- [ ] Resource usage optimized

### Monitoring
- [ ] Error tracking enabled
- [ ] Performance monitoring setup
- [ ] Alert notifications configured
- [ ] Backup procedures verified
```

### Deployment Script

```javascript
// deployment/deploy.js
class DeploymentManager {
  static async deploy(environment) {
    console.log(`Starting deployment to ${environment}...`);
    
    try {
      // 1. Validate environment
      await this.validateEnvironment(environment);
      
      // 2. Run tests
      await this.runTests();
      
      // 3. Backup current version
      await this.createBackup(environment);
      
      // 4. Deploy code
      await this.deployCode(environment);
      
      // 5. Update configuration
      await this.updateConfiguration(environment);
      
      // 6. Setup triggers
      await this.setupTriggers(environment);
      
      // 7. Verify deployment
      await this.verifyDeployment(environment);
      
      console.log(`Deployment to ${environment} completed successfully!`);
    } catch (error) {
      console.error(`Deployment failed: ${error.message}`);
      await this.rollback(environment);
      throw error;
    }
  }
  
  static async validateEnvironment(environment) {
    const validEnvironments = ['development', 'staging', 'production'];
    if (!validEnvironments.includes(environment)) {
      throw new Error(`Invalid environment: ${environment}`);
    }
  }
  
  static async runTests() {
    console.log('Running tests...');
    // Run all test suites
    const results = [
      testDatabaseService(),
      testValidationService(),
      testNotificationService()
    ];
    
    const totalFailed = results.reduce((sum, result) => sum + result.failed, 0);
    if (totalFailed > 0) {
      throw new Error(`${totalFailed} tests failed`);
    }
  }
  
  static async createBackup(environment) {
    console.log('Creating backup...');
    // Implementation depends on your backup strategy
  }
  
  static async deployCode(environment) {
    console.log('Deploying code...');
    // Use clasp or manual deployment
  }
  
  static async updateConfiguration(environment) {
    console.log('Updating configuration...');
    const config = Environment.getConfig();
    
    // Set environment-specific properties
    const properties = PropertiesService.getScriptProperties();
    properties.setProperties({
      ENVIRONMENT: environment,
      LOG_LEVEL: config.logLevel,
      CACHE_TIMEOUT: config.cacheTimeout.toString(),
      ENABLE_ANALYTICS: config.enableAnalytics.toString()
    });
  }
  
  static async setupTriggers(environment) {
    console.log('Setting up triggers...');
    
    // Delete existing triggers
    const triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
    
    // Create new triggers
    if (environment === 'production') {
      // Daily cleanup trigger
      ScriptApp.newTrigger('dailyCleanup')
        .timeBased()
        .everyDays(1)
        .atHour(2)
        .create();
      
      // Weekly report trigger
      ScriptApp.newTrigger('weeklyReport')
        .timeBased()
        .everyWeeks(1)
        .onWeekDay(ScriptApp.WeekDay.MONDAY)
        .atHour(9)
        .create();
    }
  }
  
  static async verifyDeployment(environment) {
    console.log('Verifying deployment...');
    
    // Test basic functionality
    try {
      const db = new DatabaseService();
      const config = new Config();
      const logger = new Logger('DeploymentTest');
      
      logger.info('Deployment verification successful');
    } catch (error) {
      throw new Error(`Deployment verification failed: ${error.message}`);
    }
  }
  
  static async rollback(environment) {
    console.log('Rolling back deployment...');
    // Implement rollback logic
  }
}

// Usage
// DeploymentManager.deploy('staging');
```

## Monitoring & Maintenance

### Health Check System

```javascript
// monitoring/HealthCheck.js
class HealthCheck {
  static async performHealthCheck() {
    const checks = [
      this.checkDatabaseConnection(),
      this.checkExternalAPIs(),
      this.checkSheetAccess(),
      this.checkTriggers(),
      this.checkPerformance()
    ];
    
    const results = await Promise.allSettled(checks);
    
    const healthReport = {
      timestamp: new Date().toISOString(),
      overall: 'healthy',
      checks: results.map((result, index) => ({
        name: this.getCheckName(index),
        status: result.status === 'fulfilled' ? 'pass' : 'fail',
        message: result.status === 'fulfilled' ? result.value : result.reason.message
      }))
    };
    
    // Determine overall health
    const failedChecks = healthReport.checks.filter(check => check.status === 'fail');
    if (failedChecks.length > 0) {
      healthReport.overall = failedChecks.length > 2 ? 'critical' : 'warning';
    }
    
    // Log health report
    const logger = new Logger('HealthCheck');
    logger.info('Health check completed', healthReport);
    
    // Send alerts if needed
    if (healthReport.overall !== 'healthy') {
      await this.sendHealthAlert(healthReport);
    }
    
    return healthReport;
  }
  
  static async checkDatabaseConnection() {
    const db = new DatabaseService();
    const query = new QueryBuilder('Engineers').limit(1).build();
    await db.executeQuery(query);
    return 'Database connection successful';
  }
  
  static async checkExternalAPIs() {
    // Check WhatsApp API
    const whatsappService = new WhatsAppService();
    await whatsappService.checkConnection();
    return 'External APIs accessible';
  }
  
  static async checkSheetAccess() {
    const sheet = SpreadsheetApp.openById(Config.SPREADSHEET_ID);
    const sheetNames = sheet.getSheets().map(s => s.getName());
    
    const requiredSheets = ['Engineers', 'Potential_Sites', 'Retailers', 'BD_Leads'];
    const missingSheets = requiredSheets.filter(name => !sheetNames.includes(name));
    
    if (missingSheets.length > 0) {
      throw new Error(`Missing sheets: ${missingSheets.join(', ')}`);
    }
    
    return 'All required sheets accessible';
  }
  
  static async checkTriggers() {
    const triggers = ScriptApp.getProjectTriggers();
    if (triggers.length === 0) {
      throw new Error('No triggers found');
    }
    return `${triggers.length} triggers active`;
  }
  
  static async checkPerformance() {
    const startTime = Date.now();
    
    // Perform a simple operation
    const cache = new Cache();
    cache.set('health_check', 'test', 60);
    const value = cache.get('health_check');
    
    const duration = Date.now() - startTime;
    
    if (duration > 5000) {
      throw new Error(`Performance degraded: ${duration}ms`);
    }
    
    return `Performance normal: ${duration}ms`;
  }
  
  static getCheckName(index) {
    const names = ['Database', 'External APIs', 'Sheet Access', 'Triggers', 'Performance'];
    return names[index] || 'Unknown';
  }
  
  static async sendHealthAlert(healthReport) {
    const notificationService = new NotificationService();
    
    await notificationService.send({
      type: 'email',
      recipients: ['admin@company.com'],
      subject: `Health Check Alert - ${healthReport.overall.toUpperCase()}`,
      template: 'health_alert',
      data: healthReport
    });
  }
}

// Schedule health checks
function scheduleHealthChecks() {
  // Delete existing health check triggers
  const triggers = ScriptApp.getProjectTriggers()
    .filter(trigger => trigger.getHandlerFunction() === 'performScheduledHealthCheck');
  
  triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
  
  // Create new health check trigger (every 30 minutes)
  ScriptApp.newTrigger('performScheduledHealthCheck')
    .timeBased()
    .everyMinutes(30)
    .create();
}

function performScheduledHealthCheck() {
  HealthCheck.performHealthCheck();
}
```

This implementation guide provides a solid foundation for modernizing the Anwar Sales Ecosystem. The modular architecture, comprehensive error handling, and robust testing framework ensure scalability and maintainability as the system grows.

---

*Continue with the remaining phases and features as outlined in the roadmap and feature enhancement documents.*