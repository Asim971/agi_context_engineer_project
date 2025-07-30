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
   * Categorizes error based on error code with GAS-specific categorization
   * @param {string} code - Error code
   * @returns {string} Error category
   */
  categorizeError(code) {
    const categories = {
      // Existing categories
      'VALIDATION_': 'VALIDATION',
      'API_': 'INTEGRATION',
      'DATABASE_': 'SYSTEM',
      'BUSINESS_': 'BUSINESS',
      'AUTH_': 'SECURITY',
      'CONFIG_': 'CONFIGURATION',
      
      // GAS-specific categories
      'GAS_QUOTA_': 'GAS_QUOTA',
      'GAS_EXECUTION_': 'GAS_EXECUTION',
      'GAS_PERMISSION_': 'GAS_PERMISSION',
      'GAS_SCRIPT_': 'GAS_SCRIPT',
      'GAS_TRIGGER_': 'GAS_TRIGGER',
      'GAS_SERVICE_': 'GAS_SERVICE',
      'GAS_LOCK_': 'GAS_LOCK',
      'GAS_PROPERTIES_': 'GAS_PROPERTIES'
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
   * Initialize recovery strategies for different error types including GAS-specific errors
   */
  initializeRecoveryStrategies() {
    // API-related recovery strategies
    this.recoveryStrategies.set('API_TIMEOUT', this.retryWithBackoff.bind(this));
    this.recoveryStrategies.set('API_RATE_LIMIT', this.exponentialBackoff.bind(this));
    this.recoveryStrategies.set('API_CONNECTION_ERROR', this.retryWithBackoff.bind(this));

    // GAS-specific recovery strategies
    this.recoveryStrategies.set('GAS_QUOTA_EXCEEDED', this.handleQuotaExceeded.bind(this));
    this.recoveryStrategies.set('GAS_EXECUTION_TIMEOUT', this.handleExecutionTimeout.bind(this));
    this.recoveryStrategies.set('GAS_PERMISSION_DENIED', this.handlePermissionDenied.bind(this));
    this.recoveryStrategies.set('GAS_SCRIPT_DISABLED', this.handleScriptDisabled.bind(this));
    this.recoveryStrategies.set('GAS_TRIGGER_LIMIT_EXCEEDED', this.handleTriggerLimitExceeded.bind(this));
    this.recoveryStrategies.set('GAS_LOCK_TIMEOUT', this.handleLockTimeout.bind(this));
    this.recoveryStrategies.set('GAS_SERVICE_UNAVAILABLE', this.retryWithBackoff.bind(this));
    this.recoveryStrategies.set('GAS_PROPERTIES_QUOTA_EXCEEDED', this.handlePropertiesQuotaExceeded.bind(this));

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
   * Handle GAS quota exceeded errors
   * @param {AppScriptError} error - Quota error
   * @param {Object} context - Error context
   * @returns {Promise<any>} Recovery result
   */
  async handleQuotaExceeded(error, context) {
    // Log quota exceeded event
    await this.logError(new AppScriptError(
      'GAS_QUOTA_MONITORING',
      `Quota exceeded: ${error.message}`,
      { quotaType: context.quotaType, currentUsage: context.currentUsage },
      false,
      'CRITICAL'
    ), context);

    // Implement graceful degradation
    if (context.fallbackOperation) {
      return await context.fallbackOperation();
    }

    // Schedule retry for next quota reset period
    throw new AppScriptError(
      'GAS_QUOTA_EXCEEDED_NO_FALLBACK',
      'Quota exceeded and no fallback operation available',
      { originalError: error.code, retryAfter: '24 hours' },
      false,
      'CRITICAL'
    );
  }

  /**
   * Handle GAS execution timeout errors
   * @param {AppScriptError} error - Timeout error
   * @param {Object} context - Error context
   * @returns {Promise<any>} Recovery result
   */
  async handleExecutionTimeout(error, context) {
    // Break operation into smaller chunks if possible
    if (context.chunkOperation) {
      return await context.chunkOperation();
    }

    // Retry with reduced scope
    if (context.reducedScopeOperation) {
      return await context.reducedScopeOperation();
    }

    throw new AppScriptError(
      'GAS_EXECUTION_TIMEOUT_NO_RECOVERY',
      'Execution timeout with no chunking strategy available',
      { originalError: error.code, executionTime: context.executionTime },
      false,
      'ERROR'
    );
  }

  /**
   * Handle GAS permission denied errors
   * @param {AppScriptError} error - Permission error
   * @param {Object} context - Error context
   * @returns {Promise<any>} Recovery result
   */
  async handlePermissionDenied(error, context) {
    // Log permission issue for admin review
    await this.logError(new AppScriptError(
      'GAS_PERMISSION_AUDIT',
      `Permission denied: ${error.message}`,
      { resource: context.resource, requiredScope: context.requiredScope },
      false,
      'CRITICAL'
    ), context);

    // Try alternative approach if available
    if (context.alternativeOperation) {
      return await context.alternativeOperation();
    }

    throw new AppScriptError(
      'GAS_PERMISSION_DENIED_NO_ALTERNATIVE',
      'Permission denied and no alternative operation available',
      { originalError: error.code, resource: context.resource },
      false,
      'CRITICAL'
    );
  }

  /**
   * Handle GAS script disabled errors
   * @param {AppScriptError} error - Script disabled error
   * @param {Object} context - Error context
   * @returns {Promise<any>} Recovery result
   */
  async handleScriptDisabled(error, context) {
    // Log critical system issue
    await this.logError(new AppScriptError(
      'GAS_SCRIPT_DISABLED_CRITICAL',
      'Script has been disabled - requires immediate admin intervention',
      { scriptId: context.scriptId, disabledReason: context.reason },
      false,
      'CRITICAL'
    ), context);

    // Notify administrators immediately
    await this.notifyStakeholders(error, {
      ...context,
      urgency: 'IMMEDIATE',
      actionRequired: 'Re-enable script in Google Apps Script console'
    });

    throw new AppScriptError(
      'GAS_SCRIPT_DISABLED_NO_RECOVERY',
      'Script disabled - manual intervention required',
      { originalError: error.code },
      false,
      'CRITICAL'
    );
  }

  /**
   * Handle GAS trigger limit exceeded errors
   * @param {AppScriptError} error - Trigger limit error
   * @param {Object} context - Error context
   * @returns {Promise<any>} Recovery result
   */
  async handleTriggerLimitExceeded(error, context) {
    // Clean up old triggers if possible
    if (context.cleanupTriggers) {
      await context.cleanupTriggers();
      // Retry original operation
      if (context.operation) {
        return await context.operation();
      }
    }

    // Use alternative scheduling mechanism
    if (context.alternativeScheduling) {
      return await context.alternativeScheduling();
    }

    throw new AppScriptError(
      'GAS_TRIGGER_LIMIT_NO_CLEANUP',
      'Trigger limit exceeded and no cleanup strategy available',
      { originalError: error.code, currentTriggers: context.currentTriggers },
      false,
      'ERROR'
    );
  }

  /**
   * Handle GAS lock timeout errors
   * @param {AppScriptError} error - Lock timeout error
   * @param {Object} context - Error context
   * @returns {Promise<any>} Recovery result
   */
  async handleLockTimeout(error, context) {
    // Implement exponential backoff for lock acquisition
    const attempt = context.attempt || 1;
    const maxAttempts = 5;
    
    if (attempt <= maxAttempts) {
      const delay = Math.min(1000 * Math.pow(2, attempt), 30000); // Max 30 seconds
      await this.sleep(delay);
      
      if (context.operation) {
        return await context.operation();
      }
    }

    throw new AppScriptError(
      'GAS_LOCK_TIMEOUT_MAX_RETRIES',
      'Lock timeout after maximum retry attempts',
      { originalError: error.code, attempts: attempt },
      false,
      'ERROR'
    );
  }

  /**
   * Handle GAS properties quota exceeded errors
   * @param {AppScriptError} error - Properties quota error
   * @param {Object} context - Error context
   * @returns {Promise<any>} Recovery result
   */
  async handlePropertiesQuotaExceeded(error, context) {
    // Clean up old properties if cleanup strategy available
    if (context.cleanupProperties) {
      await context.cleanupProperties();
      
      // Retry original operation
      if (context.operation) {
        return await context.operation();
      }
    }

    // Use alternative storage mechanism
    if (context.alternativeStorage) {
      return await context.alternativeStorage();
    }

    throw new AppScriptError(
      'GAS_PROPERTIES_QUOTA_NO_CLEANUP',
      'Properties quota exceeded and no cleanup strategy available',
      { originalError: error.code },
      false,
      'ERROR'
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
