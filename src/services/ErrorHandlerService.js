/**
 * ErrorHandlerService.js
 * Centralized error handling and recovery system for Anwar Sales Ecosystem
 * Part of Phase 1: Foundation Modernization
 * 
 * @fileoverview Comprehensive error management with categorization, logging, and recovery
 * @author Engineering Manager Agent
 * @version 1.0.0
 */

/**
 * Custom error class for Anwar Sales Ecosystem
 * Provides structured error information with categorization and context
 */
var AppScriptError = class AppScriptError extends Error {
  /**
   * Creates a new AppScriptError instance
   * @param {string} code - Error code for categorization
   * @param {string} message - Human-readable error message
   * @param {Object} context - Additional error context and data
   * @param {boolean} recoverable - Whether the error can be recovered from
   * @param {string} severity - Error severity level (DEBUG, INFO, WARN, ERROR, CRITICAL)
   */
  constructor(code, message, context = {}, recoverable = false, severity = 'ERROR') {
    super(message);
    this.name = 'AppScriptError';
    this.code = code;
    this.context = context;
    this.recoverable = recoverable;
    this.severity = severity;
    this.timestamp = new Date().toISOString();
    this.stackTrace = this.stack;
    this.category = this.categorizeError(code);
  }

  /**
   * Categorizes error based on error code
   * @param {string} code - Error code
   * @returns {string} Error category
   */
  categorizeError(code) {
    const categories = {
      'VALIDATION_': 'VALIDATION',
      'API_': 'INTEGRATION',
      'DATABASE_': 'SYSTEM',
      'BUSINESS_': 'BUSINESS',
      'AUTH_': 'SECURITY',
      'CONFIG_': 'CONFIGURATION'
    };

    for (const [prefix, category] of Object.entries(categories)) {
      if (code.startsWith(prefix)) {
        return category;
      }
    }
    return 'UNKNOWN';
  }

  /**
   * Converts error to structured JSON for logging
   * @returns {Object} Structured error object
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      category: this.category,
      severity: this.severity,
      recoverable: this.recoverable,
      timestamp: this.timestamp,
      context: this.context,
      stackTrace: this.stackTrace
    };
  }
}

/**
 * Centralized error handling service
 * Manages error processing, logging, recovery, and monitoring
 */
var ErrorHandlerService = class ErrorHandlerService {
  constructor() {
    this.maxRetryAttempts = 3;
    this.baseRetryDelay = 1000; // 1 second
    this.recoveryStrategies = new Map();
    this.errorMetrics = new Map();
    this.initializeRecoveryStrategies();
  }

  /**
   * Initialize recovery strategies for different error types
   */
  initializeRecoveryStrategies() {
    // API-related recovery strategies
    this.recoveryStrategies.set('API_TIMEOUT', this.retryWithBackoff.bind(this));
    this.recoveryStrategies.set('API_RATE_LIMIT', this.exponentialBackoff.bind(this));
    this.recoveryStrategies.set('API_CONNECTION_ERROR', this.retryWithBackoff.bind(this));

    // Database-related recovery strategies
    this.recoveryStrategies.set('DATABASE_LOCK', this.retryWithBackoff.bind(this));
    this.recoveryStrategies.set('DATABASE_QUOTA_EXCEEDED', this.waitAndRetry.bind(this));

    // Configuration-related recovery strategies
    this.recoveryStrategies.set('CONFIG_MISSING', this.loadDefaultConfig.bind(this));
  }

  /**
   * Main error handling method
   * @param {Error|AppScriptError} error - Error to handle
   * @param {Object} context - Additional context information
   * @returns {Promise<any>} Recovery result or re-thrown error
   */
  async handleError(error, context = {}) {
    // Convert to AppScriptError if necessary
    const appError = this.normalizeError(error, context);
    
    // Log the error
    await this.logError(appError, context);
    
    // Update error metrics
    this.updateErrorMetrics(appError);
    
    // Attempt recovery if error is recoverable
    if (appError.recoverable && this.recoveryStrategies.has(appError.code)) {
      try {
        const recoveryResult = await this.attemptRecovery(appError, context);
        await this.logRecoverySuccess(appError, context);
        return recoveryResult;
      } catch (recoveryError) {
        await this.logRecoveryFailure(appError, recoveryError, context);
      }
    }

    // Notify stakeholders for critical errors
    if (appError.severity === 'CRITICAL') {
      await this.notifyStakeholders(appError, context);
    }

    // Re-throw error if not recovered
    throw appError;
  }

  /**
   * Normalize any error to AppScriptError
   * @param {Error|AppScriptError} error - Original error
   * @param {Object} context - Error context
   * @returns {AppScriptError} Normalized error
   */
  normalizeError(error, context) {
    if (error instanceof AppScriptError) {
      return error;
    }

    // Determine error code based on error message or type
    let code = 'UNKNOWN_ERROR';
    let recoverable = false;
    let severity = 'ERROR';

    if (error.message.includes('timeout')) {
      code = 'API_TIMEOUT';
      recoverable = true;
      severity = 'WARN';
    } else if (error.message.includes('quota')) {
      code = 'DATABASE_QUOTA_EXCEEDED';
      recoverable = true;
      severity = 'WARN';
    } else if (error.message.includes('permission')) {
      code = 'AUTH_PERMISSION_DENIED';
      recoverable = false;
      severity = 'ERROR';
    } else if (error.message.includes('network')) {
      code = 'API_CONNECTION_ERROR';
      recoverable = true;
      severity = 'WARN';
    }

    return new AppScriptError(code, error.message, context, recoverable, severity);
  }

  /**
   * Attempt error recovery using appropriate strategy
   * @param {AppScriptError} error - Error to recover from
   * @param {Object} context - Error context
   * @returns {Promise<any>} Recovery result
   */
  async attemptRecovery(error, context) {
    const strategy = this.recoveryStrategies.get(error.code);
    if (!strategy) {
      throw new AppScriptError(
        'RECOVERY_STRATEGY_NOT_FOUND',
        `No recovery strategy found for error code: ${error.code}`,
        { originalError: error, context }
      );
    }

    return await strategy(error, context);
  }

  /**
   * Retry operation with exponential backoff
   * @param {AppScriptError} error - Original error
   * @param {Object} context - Context including original operation
   * @returns {Promise<any>} Operation result
   */
  async retryWithBackoff(error, context) {
    const { operation, attempt = 0 } = context;
    
    if (!operation) {
      throw new AppScriptError(
        'RECOVERY_NO_OPERATION',
        'No operation provided for retry recovery',
        { originalError: error }
      );
    }

    if (attempt >= this.maxRetryAttempts) {
      throw new AppScriptError(
        'RECOVERY_MAX_ATTEMPTS',
        `Max retry attempts (${this.maxRetryAttempts}) exceeded`,
        { originalError: error, attempts: attempt }
      );
    }

    // Calculate delay with exponential backoff
    const delay = this.baseRetryDelay * Math.pow(2, attempt);
    await this.sleep(delay);

    try {
      return await operation();
    } catch (retryError) {
      return await this.retryWithBackoff(error, { 
        ...context, 
        attempt: attempt + 1 
      });
    }
  }

  /**
   * Exponential backoff for rate limiting
   * @param {AppScriptError} error - Rate limit error
   * @param {Object} context - Error context
   * @returns {Promise<any>} Operation result after backoff
   */
  async exponentialBackoff(error, context) {
    const { operation, attempt = 0 } = context;
    
    // For rate limits, use longer delays
    const delay = this.baseRetryDelay * Math.pow(3, attempt) + Math.random() * 1000;
    await this.sleep(delay);

    try {
      return await operation();
    } catch (retryError) {
      if (attempt < this.maxRetryAttempts) {
        return await this.exponentialBackoff(error, { 
          ...context, 
          attempt: attempt + 1 
        });
      }
      throw retryError;
    }
  }

  /**
   * Wait and retry for quota-related errors
   * @param {AppScriptError} error - Quota error
   * @param {Object} context - Error context
   * @returns {Promise<any>} Operation result
   */
  async waitAndRetry(error, context) {
    // Wait longer for quota issues (5 minutes)
    await this.sleep(300000);
    
    if (context.operation) {
      return await context.operation();
    }
    
    throw new AppScriptError(
      'RECOVERY_NO_OPERATION',
      'No operation provided for quota retry',
      { originalError: error }
    );
  }

  /**
   * Load default configuration for missing config errors
   * @param {AppScriptError} error - Configuration error
   * @param {Object} context - Error context
   * @returns {Promise<Object>} Default configuration
   */
  async loadDefaultConfig(error, context) {
    // Return default configuration based on error context
    const defaultConfigs = {
      'MAYTAPI_API_KEY': 'DEFAULT_TEST_KEY',
      'MAYTAPI_URL': 'https://api.maytapi.com/default',
      'MAX_RETRY_ATTEMPTS': 3,
      'BASE_RETRY_DELAY': 1000
    };

    const configKey = context.configKey;
    if (configKey && defaultConfigs[configKey]) {
      return defaultConfigs[configKey];
    }

    throw new AppScriptError(
      'CONFIG_NO_DEFAULT',
      `No default configuration available for: ${configKey}`,
      { originalError: error }
    );
  }

  /**
   * Log error with structured format
   * @param {AppScriptError} error - Error to log
   * @param {Object} context - Error context
   */
  async logError(error, context) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: error.severity,
      category: error.category,
      code: error.code,
      message: error.message,
      context: context,
      stackTrace: error.stackTrace,
      recoverable: error.recoverable
    };

    // Use console for now, will be replaced with LoggerService
    console.error(`[${error.severity}] ${error.category}: ${error.message}`, 
                  JSON.stringify(logEntry, null, 2));
  }

  /**
   * Log successful recovery
   * @param {AppScriptError} error - Original error
   * @param {Object} context - Recovery context
   */
  async logRecoverySuccess(error, context) {
    console.info(`Recovery successful for error: ${error.code}`, {
      originalError: error.code,
      recoveryTime: new Date().toISOString(),
      context: context
    });
  }

  /**
   * Log failed recovery attempt
   * @param {AppScriptError} originalError - Original error
   * @param {Error} recoveryError - Recovery failure error
   * @param {Object} context - Error context
   */
  async logRecoveryFailure(originalError, recoveryError, context) {
    console.error(`Recovery failed for error: ${originalError.code}`, {
      originalError: originalError.code,
      recoveryError: recoveryError.message,
      failureTime: new Date().toISOString(),
      context: context
    });
  }

  /**
   * Update error metrics for monitoring
   * @param {AppScriptError} error - Error to track
   */
  updateErrorMetrics(error) {
    const key = `${error.category}_${error.code}`;
    const current = this.errorMetrics.get(key) || { count: 0, lastOccurrence: null };
    
    this.errorMetrics.set(key, {
      count: current.count + 1,
      lastOccurrence: new Date().toISOString(),
      severity: error.severity,
      category: error.category
    });
  }

  /**
   * Notify stakeholders of critical errors
   * @param {AppScriptError} error - Critical error
   * @param {Object} context - Error context
   */
  async notifyStakeholders(error, context) {
    try {
      // Placeholder for stakeholder notification
      // Will integrate with WhatsAppService for alerts
      console.error(`CRITICAL ERROR ALERT: ${error.code} - ${error.message}`);
      
      // In production, this would send WhatsApp alerts to administrators
      // await WhatsAppService.sendMessage(Config.ADMIN_PHONE, alertMessage);
    } catch (notificationError) {
      console.error('Failed to notify stakeholders:', notificationError);
    }
  }

  /**
   * Get error metrics for monitoring
   * @returns {Map} Error metrics
   */
  getErrorMetrics() {
    return new Map(this.errorMetrics);
  }

  /**
   * Sleep utility for delays
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
