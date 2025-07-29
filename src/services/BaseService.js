/**
 * BaseService.js
 * Base service class for Anwar Sales Ecosystem service architecture
 * Part of Phase 1: Foundation Modernization
 * 
 * @fileoverview Service-oriented architecture foundation with dependency injection
 * @author Engineering Manager Agent
 * @version 1.0.0
 */

/**
 * Base service class providing common functionality for all services
 * Implements dependency injection, error handling, logging, and performance monitoring
 * 
 * IMPORTANT: Using var assignment pattern to ensure global accessibility
 * This fixes: ReferenceError: BaseService is not defined
 */
var BaseService = class BaseService {
  /**
   * Creates a new BaseService instance
   * @param {Object} dependencies - Injected dependencies
   * @param {Object} dependencies.config - Configuration service
   * @param {Object} dependencies.logger - Logger service
   * @param {Object} dependencies.errorHandler - Error handler service
   * @param {Object} dependencies.validator - Validation service
   * @param {Object} dependencies.cache - Cache service
   * @param {Object} dependencies.monitor - Performance monitoring service
   */
  constructor(dependencies = {}) {
    // Dependency injection with fallbacks to global services
    this.config = dependencies.config || (typeof Config !== 'undefined' ? Config : {});
    this.logger = dependencies.logger || (typeof Logger !== 'undefined' ? Logger : console);
    this.errorHandler = dependencies.errorHandler || null;
    this.validator = dependencies.validator || null;
    this.cache = dependencies.cache || null;
    this.monitor = dependencies.monitor || null;
    
    // Service metadata
    this.serviceName = this.constructor.name;
    this.serviceVersion = '1.0.0';
    this.startTime = Date.now();
    
    // Performance metrics
    this.operationMetrics = new Map();
    this.healthStatus = 'HEALTHY';
    this.lastHealthCheck = null;
    
    // Initialize service
    this.initialize();
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
   * @returns {Promise<any>} Operation result
   */
  async executeWithErrorHandling(operation, context = {}, operationName = 'unknown') {
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
      
      // Execute the operation
      const result = await operation();
      
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
      
      this.log('error', `Operation failed: ${operationName}`, {
        ...enhancedContext,
        duration,
        error: error.message,
        success: false
      });
      
      // Use error handler if available
      if (this.errorHandler) {
        return await this.errorHandler.handleError(error, enhancedContext);
      }
      
      // Re-throw if no error handler
      throw error;
    }
  }

  /**
   * Validate input data using validation service
   * @param {any} data - Data to validate
   * @param {Object} schema - Validation schema
   * @param {string} context - Validation context
   * @returns {any} Validated and sanitized data
   */
  validateInput(data, schema, context = 'unknown') {
    if (!this.validator) {
      this.log('warn', 'No validator available, skipping validation', { context });
      return data;
    }

    try {
      return this.validator.validate(data, schema, context);
    } catch (validationError) {
      this.log('error', 'Input validation failed', {
        context,
        error: validationError.message,
        data: this.sanitizeForLogging(data)
      });
      throw validationError;
    }
  }

  /**
   * Get cached data or execute operation and cache result
   * @param {string} key - Cache key
   * @param {Function} operation - Operation to execute if cache miss
   * @param {number} ttl - Time to live in milliseconds
   * @returns {Promise<any>} Cached or computed result
   */
  async cacheOrExecute(key, operation, ttl = 300000) { // 5 minutes default
    if (!this.cache) {
      this.log('debug', 'No cache available, executing operation directly', { key });
      return await operation();
    }

    try {
      // Try to get from cache
      const cached = await this.cache.get(key);
      if (cached !== null) {
        this.log('debug', 'Cache hit', { key });
        return cached;
      }

      // Cache miss - execute operation
      this.log('debug', 'Cache miss, executing operation', { key });
      const result = await operation();
      
      // Store in cache
      await this.cache.set(key, result, ttl);
      
      return result;
      
    } catch (error) {
      this.log('warn', 'Cache operation failed, executing without cache', {
        key,
        error: error.message
      });
      return await operation();
    }
  }

  /**
   * Perform health check for the service
   * @returns {Promise<Object>} Health check result
   */
  async healthCheck() {
    const healthCheckStart = Date.now();
    
    try {
      const health = {
        service: this.serviceName,
        status: 'HEALTHY',
        timestamp: new Date().toISOString(),
        uptime: Date.now() - this.startTime,
        metrics: this.getMetricsSummary(),
        dependencies: await this.checkDependencies()
      };
      
      // Perform service-specific health checks
      const serviceHealth = await this.performServiceHealthCheck();
      Object.assign(health, serviceHealth);
      
      this.healthStatus = health.status;
      this.lastHealthCheck = Date.now();
      
      this.log('debug', 'Health check completed', {
        status: health.status,
        duration: Date.now() - healthCheckStart
      });
      
      return health;
      
    } catch (error) {
      this.healthStatus = 'UNHEALTHY';
      this.lastHealthCheck = Date.now();
      
      this.log('error', 'Health check failed', {
        error: error.message,
        duration: Date.now() - healthCheckStart
      });
      
      return {
        service: this.serviceName,
        status: 'UNHEALTHY',
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }

  /**
   * Service-specific health check - override in derived classes
   * @protected
   * @returns {Promise<Object>} Service-specific health information
   */
  async performServiceHealthCheck() {
    return {
      checks: {
        basic: 'PASSED'
      }
    };
  }

  /**
   * Check dependency health
   * @protected
   * @returns {Promise<Object>} Dependency health status
   */
  async checkDependencies() {
    const dependencies = {};
    
    // Check logger
    dependencies.logger = this.logger ? 'AVAILABLE' : 'UNAVAILABLE';
    
    // Check error handler
    dependencies.errorHandler = this.errorHandler ? 'AVAILABLE' : 'UNAVAILABLE';
    
    // Check validator
    dependencies.validator = this.validator ? 'AVAILABLE' : 'UNAVAILABLE';
    
    // Check cache
    dependencies.cache = this.cache ? 'AVAILABLE' : 'UNAVAILABLE';
    
    // Check monitor
    dependencies.monitor = this.monitor ? 'AVAILABLE' : 'UNAVAILABLE';
    
    return dependencies;
  }

  /**
   * Record successful operation metrics
   * @protected
   * @param {string} operationName - Name of the operation
   * @param {number} duration - Operation duration in milliseconds
   */
  recordOperationSuccess(operationName, duration) {
    const key = `${operationName}_success`;
    const metrics = this.operationMetrics.get(key) || {
      count: 0,
      totalDuration: 0,
      averageDuration: 0,
      lastExecution: null
    };
    
    metrics.count++;
    metrics.totalDuration += duration;
    metrics.averageDuration = metrics.totalDuration / metrics.count;
    metrics.lastExecution = new Date().toISOString();
    
    this.operationMetrics.set(key, metrics);
    
    // Report to monitor if available
    if (this.monitor) {
      this.monitor.recordSuccess(this.serviceName, operationName, duration);
    }
  }

  /**
   * Record failed operation metrics
   * @protected
   * @param {string} operationName - Name of the operation
   * @param {number} duration - Operation duration in milliseconds
   * @param {Error} error - Operation error
   */
  recordOperationFailure(operationName, duration, error) {
    const key = `${operationName}_failure`;
    const metrics = this.operationMetrics.get(key) || {
      count: 0,
      totalDuration: 0,
      averageDuration: 0,
      lastExecution: null,
      lastError: null
    };
    
    metrics.count++;
    metrics.totalDuration += duration;
    metrics.averageDuration = metrics.totalDuration / metrics.count;
    metrics.lastExecution = new Date().toISOString();
    metrics.lastError = error.message;
    
    this.operationMetrics.set(key, metrics);
    
    // Report to monitor if available
    if (this.monitor) {
      this.monitor.recordFailure(this.serviceName, operationName, duration, error);
    }
  }

  /**
   * Get metrics summary
   * @returns {Object} Metrics summary
   */
  getMetricsSummary() {
    const summary = {
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      averageSuccessDuration: 0,
      averageFailureDuration: 0
    };
    
    for (const [key, metrics] of this.operationMetrics.entries()) {
      if (key.endsWith('_success')) {
        summary.successfulOperations += metrics.count;
        summary.averageSuccessDuration += metrics.averageDuration;
      } else if (key.endsWith('_failure')) {
        summary.failedOperations += metrics.count;
        summary.averageFailureDuration += metrics.averageDuration;
      }
    }
    
    summary.totalOperations = summary.successfulOperations + summary.failedOperations;
    
    // Calculate weighted averages
    if (summary.successfulOperations > 0) {
      summary.averageSuccessDuration = summary.averageSuccessDuration / summary.successfulOperations;
    }
    
    if (summary.failedOperations > 0) {
      summary.averageFailureDuration = summary.averageFailureDuration / summary.failedOperations;
    }
    
    return summary;
  }

  /**
   * Generate unique operation ID
   * @protected
   * @returns {string} Operation ID
   */
  generateOperationId() {
    return `${this.serviceName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log message using configured logger
   * @protected
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Object} context - Log context
   */
  log(level, message, context = {}) {
    const enhancedContext = {
      ...context,
      service: this.serviceName,
      version: this.serviceVersion
    };
    
    if (this.logger && typeof this.logger[level] === 'function') {
      this.logger[level](message, enhancedContext, this.serviceName);
    } else {
      // Fallback to console
      console[level] || console.log(`[${level.toUpperCase()}] [${this.serviceName}] ${message}`, enhancedContext);
    }
  }

  /**
   * Sanitize data for logging (remove sensitive information)
   * @protected
   * @param {any} data - Data to sanitize
   * @returns {any} Sanitized data
   */
  sanitizeForLogging(data) {
    if (typeof data !== 'object' || data === null) {
      return data;
    }
    
    const sensitiveKeys = [
      'password', 'token', 'key', 'secret', 'credential',
      'api_key', 'apikey', 'auth', 'authorization'
    ];
    
    const sanitized = Array.isArray(data) ? [] : {};
    
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = sensitiveKeys.some(sensitive => 
        lowerKey.includes(sensitive)
      );
      
      if (isSensitive) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeForLogging(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }

  /**
   * Get service information
   * @returns {Object} Service information
   */
  getServiceInfo() {
    return {
      name: this.serviceName,
      version: this.serviceVersion,
      status: this.healthStatus,
      uptime: Date.now() - this.startTime,
      lastHealthCheck: this.lastHealthCheck,
      metrics: this.getMetricsSummary(),
      dependencies: {
        config: !!this.config,
        logger: !!this.logger,
        errorHandler: !!this.errorHandler,
        validator: !!this.validator,
        cache: !!this.cache,
        monitor: !!this.monitor
      }
    };
  }

  /**
   * Cleanup resources - override in derived classes if needed
   * @protected
   */
  cleanup() {
    this.log('info', `${this.serviceName} cleanup initiated`);
    // Base cleanup logic here
  }
};

// Ensure BaseService is globally accessible for all other services
// Critical: Google Apps Script requires global assignment for cross-file access
if (typeof globalThis !== 'undefined') {
  globalThis.BaseService = BaseService;
}
// Also assign to global object for maximum compatibility
if (typeof global !== 'undefined') {
  global.BaseService = BaseService;
}
// Direct assignment to ensure availability
try {
  // Make BaseService available in current execution context
  if (typeof this !== 'undefined') {
    this.BaseService = BaseService;
  }
} catch (e) {
  // Fallback assignment
  console.warn('BaseService global assignment warning:', e.message);
}
