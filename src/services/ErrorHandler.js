/**
 * ErrorHandler.js
 * Centralized error handling service for Anwar Sales Management System
 * 
 * @fileoverview Comprehensive error management with categorization and recovery strategies
 * @author Backend Development Agent
 * @version 1.0.0
 */

/**
 * ErrorHandler Service
 * Provides centralized error management with categorization, logging, and recovery strategies
 */
class ErrorHandler extends BaseService {
  constructor() {
    super('ErrorHandler');
    
    this.errorTypes = {
      VALIDATION_ERROR: 'VALIDATION_ERROR',
      SERVICE_ERROR: 'SERVICE_ERROR', 
      INTEGRATION_ERROR: 'INTEGRATION_ERROR',
      SYSTEM_ERROR: 'SYSTEM_ERROR'
    };
    
    this.errors = [];
    this.maxErrorHistory = 100;
  }

  /**
   * Handle application errors with proper logging and recovery
   * @param {Error} error - Error to handle
   * @param {Object} context - Error context
   * @returns {Object} Error handling result
   */
  handleError(error, context = {}) {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      type: this.categorizeError(error),
      context,
      timestamp: new Date().toISOString(),
      handled: true
    };

    // Log error
    this.logError(errorInfo);
    
    // Store error in history
    this.addToErrorHistory(errorInfo);

    // Determine recovery strategy
    const recovery = this.determineRecovery(errorInfo);

    return {
      success: false,
      error: errorInfo,
      recovery
    };
  }

  /**
   * Categorize error type for appropriate handling
   * @param {Error} error - Error to categorize
   * @returns {string} Error category
   */
  categorizeError(error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('validation') || message.includes('invalid')) {
      return this.errorTypes.VALIDATION_ERROR;
    }
    if (message.includes('service') || message.includes('not defined') || message.includes('not registered')) {
      return this.errorTypes.SERVICE_ERROR;
    }
    if (message.includes('integration') || message.includes('test') || message.includes('api')) {
      return this.errorTypes.INTEGRATION_ERROR;
    }
    return this.errorTypes.SYSTEM_ERROR;
  }

  /**
   * Determine recovery strategy based on error type
   * @param {Object} errorInfo - Error information
   * @returns {Object} Recovery strategy
   */
  determineRecovery(errorInfo) {
    switch (errorInfo.type) {
      case this.errorTypes.SERVICE_ERROR:
        return {
          strategy: 'service_restart',
          action: 'Restart affected service',
          retryable: true
        };
      case this.errorTypes.VALIDATION_ERROR:
        return {
          strategy: 'user_correction',
          action: 'Request user input correction',
          retryable: true
        };
      case this.errorTypes.INTEGRATION_ERROR:
        return {
          strategy: 'retry_with_backoff',
          action: 'Retry operation with exponential backoff',
          retryable: true
        };
      default:
        return {
          strategy: 'graceful_degradation',
          action: 'Continue with limited functionality',
          retryable: false
        };
    }
  }

  /**
   * Log error with appropriate severity
   * @param {Object} errorInfo - Error information to log
   */
  logError(errorInfo) {
    const logMessage = `[ErrorHandler] ${errorInfo.type}: ${errorInfo.message}`;
    
    if (this.logger) {
      this.logger.error(logMessage, errorInfo);
    } else {
      console.error(logMessage, errorInfo);
    }
  }

  /**
   * Add error to history with size management
   * @param {Object} errorInfo - Error information
   */
  addToErrorHistory(errorInfo) {
    this.errors.push(errorInfo);
    
    // Maintain maximum history size
    if (this.errors.length > this.maxErrorHistory) {
      this.errors.shift();
    }
  }

  /**
   * Create a standardized error object
   * @param {string} message - Error message
   * @param {string} type - Error type
   * @param {Object} context - Additional context
   * @returns {Error} Standardized error
   */
  createError(message, type = this.errorTypes.SYSTEM_ERROR, context = {}) {
    const error = new Error(message);
    error.type = type;
    error.context = context;
    error.timestamp = new Date().toISOString();
    return error;
  }

  /**
   * Get error summary for monitoring
   * @returns {Object} Error summary statistics
   */
  getErrorSummary() {
    const summary = {
      totalErrors: this.errors.length,
      errorsByType: {},
      recentErrors: this.errors.slice(-10),
      lastError: this.errors.length > 0 ? this.errors[this.errors.length - 1] : null
    };

    // Count errors by type
    for (const error of this.errors) {
      summary.errorsByType[error.type] = (summary.errorsByType[error.type] || 0) + 1;
    }

    return summary;
  }

  /**
   * Clear error history
   */
  clearErrors() {
    this.errors = [];
  }

  /**
   * Get service status
   * @returns {Object} Service status information
   */
  getServiceStatus() {
    return {
      serviceName: this.serviceName,
      isHealthy: true,
      errorCount: this.errors.length,
      lastActivity: new Date().toISOString()
    };
  }
}

// Register globally for Google Apps Script
if (typeof globalThis !== 'undefined') {
  globalThis.ErrorHandler = ErrorHandler;
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ErrorHandler;
}