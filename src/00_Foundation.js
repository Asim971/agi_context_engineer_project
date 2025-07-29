/**
 * 00_Foundation.js
 * CRITICAL FOUNDATION FILE - MUST LOAD FIRST
 * 
 * This file ensures all base classes and core dependencies are available
 * before any other file attempts to use them. The "00_" prefix guarantees
 * it loads first in Google Apps Script's alphabetical loading order.
 * 
 * @fileoverview Foundation classes and global initialization
 * @version 2.0.0
 * @author Apps Script Troubleshooter Agent
 */

console.log('🏗️ Loading Foundation...');

/**
 * BaseService - Foundation class for all services
 * Using var to ensure global accessibility across all files
 */
var BaseService = class BaseService {
  /**
   * Creates a new BaseService instance with dependency injection
   * @param {Object} dependencies - Injected dependencies
   */
  constructor(dependencies = {}) {
    // Dependency injection with fallbacks to global services
    this.config = dependencies.config || (typeof Config !== 'undefined' ? Config : {});
    
    // Enhanced logger initialization with proper console fallback
    this.logger = dependencies.logger || this.createDefaultLogger();
    
    this.errorHandler = dependencies.errorHandler || null;
    this.validator = dependencies.validator || null;
    this.cache = dependencies.cache || null;
    this.monitor = dependencies.monitor || null;
    
    // Service metadata
    this.serviceName = this.constructor.name;
    this.serviceVersion = '2.0.0';
    this.startTime = Date.now();
    
    // Performance metrics
    this.operationMetrics = new Map();
    this.healthStatus = 'HEALTHY';
    this.lastHealthCheck = null;
    
    // Initialize service
    this.initialize();
  }
  
  /**
   * Create a default logger with proper interface
   * @returns {Object} Logger with standard interface
   */
  createDefaultLogger() {
    return {
      debug: (message, data) => console.log(`[DEBUG] ${this.constructor.name}: ${message}`, data || {}),
      info: (message, data) => console.log(`[INFO] ${this.constructor.name}: ${message}`, data || {}),
      warn: (message, data) => console.warn(`[WARN] ${this.constructor.name}: ${message}`, data || {}),
      error: (message, data) => console.error(`[ERROR] ${this.constructor.name}: ${message}`, data || {}),
      log: (message, data) => console.log(`[LOG] ${this.constructor.name}: ${message}`, data || {})
    };
  }

  /**
   * Initialize service - override in derived classes
   * @protected
   */
  initialize() {
    this.log('info', `${this.serviceName} initialized`, {
      version: this.serviceVersion,
      startTime: new Date(this.startTime).toISOString()
    });
  }

  /**
   * Execute operation with comprehensive error handling and monitoring
   * @param {Function} operation - Operation to execute
   * @param {Object} context - Operation context
   * @param {string} operationName - Name of the operation for logging/monitoring
   * @returns {Promise<any>|any} Operation result
   */
  executeWithErrorHandling(operation, context = {}, operationName = 'unknown') {
    const startTime = Date.now();
    const operationId = this.generateOperationId();
    
    // Enhanced context with service information
    const enhancedContext = {
      ...context,
      serviceName: this.serviceName,
      operationName,
      operationId,
      startTime: new Date(startTime).toISOString()
    };

    try {
      this.log('debug', `Starting operation: ${operationName}`, enhancedContext);
      
      // Execute the operation (handle both sync and async)
      const result = operation();
      
      // Record success metrics
      const duration = Date.now() - startTime;
      this.recordOperationSuccess(operationName, duration);
      
      this.log('debug', `Operation completed: ${operationName}`, {
        ...enhancedContext,
        duration,
        success: true
      });
      
      return result;
      
    } catch (error) {
      // Record failure metrics
      const duration = Date.now() - startTime;
      this.recordOperationFailure(operationName, duration, error);
      
      // Enhanced error context
      const errorContext = {
        ...enhancedContext,
        duration,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      };
      
      this.log('error', `Operation failed: ${operationName}`, errorContext);
      
      // Use error handler if available
      if (this.errorHandler && typeof this.errorHandler.handle === 'function') {
        return this.errorHandler.handle(error, errorContext);
      }
      
      // Re-throw the error for upstream handling
      throw error;
    }
  }

  /**
   * Synchronous version of executeWithErrorHandling for backward compatibility
   * @param {Function} operation - Operation to execute
   * @param {Object} context - Operation context
   * @param {string} operationName - Name of the operation
   * @returns {any} Operation result
   */
  executeWithErrorHandlingSync(operation, context = {}, operationName = 'unknown') {
    return this.executeWithErrorHandling(operation, context, operationName);
  }

  /**
   * Logging method with service context
   * @param {string} level - Log level (debug, info, warn, error)
   * @param {string} message - Log message
   * @param {Object} data - Additional data to log
   */
  log(level, message, data = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      service: this.serviceName,
      level: level.toUpperCase(),
      message,
      ...data
    };
    
    if (this.logger && typeof this.logger[level] === 'function') {
      this.logger[level](message, logEntry);
    } else {
      console.log(`[${logEntry.level}] ${logEntry.service}: ${message}`, logEntry);
    }
  }

  /**
   * Generate unique operation ID
   * @returns {string} Unique operation identifier
   */
  generateOperationId() {
    return `${this.serviceName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Record successful operation metrics
   * @param {string} operationName - Name of the operation
   * @param {number} duration - Operation duration in milliseconds
   */
  recordOperationSuccess(operationName, duration) {
    if (!this.operationMetrics.has(operationName)) {
      this.operationMetrics.set(operationName, {
        successCount: 0,
        failureCount: 0,
        totalDuration: 0,
        averageDuration: 0
      });
    }
    
    const metrics = this.operationMetrics.get(operationName);
    metrics.successCount++;
    metrics.totalDuration += duration;
    metrics.averageDuration = metrics.totalDuration / (metrics.successCount + metrics.failureCount);
  }

  /**
   * Record failed operation metrics
   * @param {string} operationName - Name of the operation
   * @param {number} duration - Operation duration in milliseconds
   * @param {Error} error - The error that occurred
   */
  recordOperationFailure(operationName, duration, error) {
    if (!this.operationMetrics.has(operationName)) {
      this.operationMetrics.set(operationName, {
        successCount: 0,
        failureCount: 0,
        totalDuration: 0,
        averageDuration: 0,
        lastError: null
      });
    }
    
    const metrics = this.operationMetrics.get(operationName);
    metrics.failureCount++;
    metrics.totalDuration += duration;
    metrics.averageDuration = metrics.totalDuration / (metrics.successCount + metrics.failureCount);
    metrics.lastError = {
      message: error.message,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get service information and metrics
   * @returns {Object} Service information
   */
  getServiceInfo() {
    return {
      name: this.serviceName,
      version: this.serviceVersion,
      uptime: Date.now() - this.startTime,
      healthStatus: this.healthStatus,
      lastHealthCheck: this.lastHealthCheck,
      operationMetrics: Object.fromEntries(this.operationMetrics)
    };
  }

  /**
   * Perform health check
   * @returns {Object} Health status
   */
  performHealthCheck() {
    this.lastHealthCheck = new Date().toISOString();
    
    try {
      // Basic health checks
      const checks = {
        configAvailable: typeof this.config === 'object',
        loggerAvailable: typeof this.logger === 'object',
        serviceMetadata: !!(this.serviceName && this.serviceVersion),
        uptime: Date.now() - this.startTime
      };
      
      const allHealthy = Object.values(checks).every(check => 
        typeof check === 'boolean' ? check : check > 0
      );
      
      this.healthStatus = allHealthy ? 'HEALTHY' : 'DEGRADED';
      
      return {
        status: this.healthStatus,
        timestamp: this.lastHealthCheck,
        checks
      };
      
    } catch (error) {
      this.healthStatus = 'UNHEALTHY';
      this.log('error', 'Health check failed', { error: error.message });
      
      return {
        status: this.healthStatus,
        timestamp: this.lastHealthCheck,
        error: error.message
      };
    }
  }
};

/**
 * Ensure BaseService is globally accessible
 * This is critical for inheritance in other files
 */
if (typeof globalThis !== 'undefined') {
  globalThis.BaseService = BaseService;
}

console.log('✅ Foundation loaded successfully - BaseService is now globally available');

/**
 * Foundation Verification Function
 * Call this to verify the foundation is properly loaded
 */
function verifyFoundation() {
  console.log('🔍 Verifying Foundation...');
  
  const tests = [
    {
      name: 'BaseService Definition',
      test: () => typeof BaseService !== 'undefined',
      description: 'BaseService class is defined'
    },
    {
      name: 'BaseService Instantiation',
      test: () => {
        const instance = new BaseService();
        return instance instanceof BaseService;
      },
      description: 'BaseService can be instantiated'
    },
    {
      name: 'Service Methods',
      test: () => {
        const instance = new BaseService();
        return typeof instance.executeWithErrorHandling === 'function' &&
               typeof instance.log === 'function' &&
               typeof instance.getServiceInfo === 'function';
      },
      description: 'BaseService has required methods'
    },
    {
      name: 'Global Accessibility',
      test: () => typeof globalThis.BaseService !== 'undefined',
      description: 'BaseService is globally accessible'
    }
  ];
  
  let allPassed = true;
  
  tests.forEach(test => {
    try {
      const result = test.test();
      const status = result ? '✅ PASS' : '❌ FAIL';
      console.log(`${status}: ${test.name} - ${test.description}`);
      if (!result) allPassed = false;
    } catch (error) {
      console.log(`❌ ERROR: ${test.name} - ${error.message}`);
      allPassed = false;
    }
  });
  
  console.log(`\n🏁 Foundation Verification: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  return allPassed;
}

// Auto-verify foundation on load (for debugging)
if (typeof Config !== 'undefined' && Config.IS_TEST_ENVIRONMENT) {
  verifyFoundation();
}
