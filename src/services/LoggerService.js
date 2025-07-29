/**
 * LoggerService.js
 * Structured logging service for Anwar Sales Ecosystem
 * Part of Phase 1: Foundation Modernization
 * 
 * @fileoverview Comprehensive logging with severity levels and structured output
 * @author Engineering Manager Agent
 * @version 1.0.0
 */

/**
 * Structured logging service with severity levels and context management
 * Provides comprehensive logging capabilities for debugging and monitoring
 */
class LoggerService {
  constructor() {
    this.logLevels = {
      DEBUG: 0,
      INFO: 1,
      WARN: 2,
      ERROR: 3,
      CRITICAL: 4
    };
    
    this.currentLogLevel = this.logLevels.INFO; // Default log level
    this.logBuffer = [];
    this.maxBufferSize = 1000;
    this.enableConsoleOutput = true;
    this.enableStructuredLogging = true;
  }

  /**
   * Set the minimum log level for output
   * @param {string} level - Log level (DEBUG, INFO, WARN, ERROR, CRITICAL)
   */
  setLogLevel(level) {
    if (this.logLevels.hasOwnProperty(level)) {
      this.currentLogLevel = this.logLevels[level];
    } else {
      console.warn(`Invalid log level: ${level}. Using INFO as default.`);
      this.currentLogLevel = this.logLevels.INFO;
    }
  }

  /**
   * Log debug message
   * @param {string} message - Log message
   * @param {Object} context - Additional context data
   * @param {string} source - Source of the log entry
   */
  debug(message, context = {}, source = 'UNKNOWN') {
    this.log('DEBUG', message, context, source);
  }

  /**
   * Log info message
   * @param {string} message - Log message
   * @param {Object} context - Additional context data
   * @param {string} source - Source of the log entry
   */
  info(message, context = {}, source = 'UNKNOWN') {
    this.log('INFO', message, context, source);
  }

  /**
   * Log warning message
   * @param {string} message - Log message
   * @param {Object} context - Additional context data
   * @param {string} source - Source of the log entry
   */
  warn(message, context = {}, source = 'UNKNOWN') {
    this.log('WARN', message, context, source);
  }

  /**
   * Log error message
   * @param {string} message - Log message
   * @param {Object} context - Additional context data
   * @param {string} source - Source of the log entry
   */
  error(message, context = {}, source = 'UNKNOWN') {
    this.log('ERROR', message, context, source);
  }

  /**
   * Log critical message
   * @param {string} message - Log message
   * @param {Object} context - Additional context data
   * @param {string} source - Source of the log entry
   */
  critical(message, context = {}, source = 'UNKNOWN') {
    this.log('CRITICAL', message, context, source);
  }

  /**
   * Core logging method
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Object} context - Additional context data
   * @param {string} source - Source of the log entry
   */
  log(level, message, context = {}, source = 'UNKNOWN') {
    const levelValue = this.logLevels[level];
    
    // Skip if below current log level
    if (levelValue < this.currentLogLevel) {
      return;
    }

    const logEntry = this.createLogEntry(level, message, context, source);
    
    // Add to buffer
    this.addToBuffer(logEntry);
    
    // Output to console if enabled
    if (this.enableConsoleOutput) {
      this.outputToConsole(logEntry);
    }
    
    // Handle critical logs immediately
    if (level === 'CRITICAL') {
      this.handleCriticalLog(logEntry);
    }
  }

  /**
   * Create structured log entry
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Object} context - Additional context data
   * @param {string} source - Source of the log entry
   * @returns {Object} Structured log entry
   */
  createLogEntry(level, message, context, source) {
    const timestamp = new Date().toISOString();
    const sessionId = this.getSessionId();
    const executionId = this.getExecutionId();

    const logEntry = {
      timestamp,
      level,
      message,
      source,
      sessionId,
      executionId,
      context: this.sanitizeContext(context),
      metadata: {
        scriptName: 'Anwar Sales Ecosystem',
        version: '1.0.0',
        environment: Config.IS_TEST_ENVIRONMENT ? 'TEST' : 'PRODUCTION'
      }
    };

    // Add stack trace for ERROR and CRITICAL levels
    if (level === 'ERROR' || level === 'CRITICAL') {
      logEntry.stackTrace = this.captureStackTrace();
    }

    return logEntry;
  }

  /**
   * Sanitize context data to prevent logging sensitive information
   * @param {Object} context - Raw context data
   * @returns {Object} Sanitized context data
   */
  sanitizeContext(context) {
    const sensitiveKeys = [
      'password', 'token', 'key', 'secret', 'credential',
      'api_key', 'apikey', 'auth', 'authorization'
    ];

    const sanitized = {};
    
    for (const [key, value] of Object.entries(context)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = sensitiveKeys.some(sensitive => 
        lowerKey.includes(sensitive)
      );

      if (isSensitive) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeContext(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Add log entry to buffer
   * @param {Object} logEntry - Log entry to buffer
   */
  addToBuffer(logEntry) {
    this.logBuffer.push(logEntry);
    
    // Maintain buffer size
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift(); // Remove oldest entry
    }
  }

  /**
   * Output log entry to console
   * @param {Object} logEntry - Log entry to output
   */
  outputToConsole(logEntry) {
    const { level, timestamp, message, source, context } = logEntry;
    
    if (this.enableStructuredLogging) {
      // Structured JSON output
      const output = JSON.stringify(logEntry, null, 2);
      
      switch (level) {
        case 'DEBUG':
          console.log(output);
          break;
        case 'INFO':
          console.info(output);
          break;
        case 'WARN':
          console.warn(output);
          break;
        case 'ERROR':
        case 'CRITICAL':
          console.error(output);
          break;
        default:
          console.log(output);
      }
    } else {
      // Simple formatted output
      const formattedMessage = `[${timestamp}] [${level}] [${source}] ${message}`;
      
      switch (level) {
        case 'DEBUG':
          console.log(formattedMessage, context);
          break;
        case 'INFO':
          console.info(formattedMessage, context);
          break;
        case 'WARN':
          console.warn(formattedMessage, context);
          break;
        case 'ERROR':
        case 'CRITICAL':
          console.error(formattedMessage, context);
          break;
        default:
          console.log(formattedMessage, context);
      }
    }
  }

  /**
   * Handle critical log entries with immediate actions
   * @param {Object} logEntry - Critical log entry
   */
  handleCriticalLog(logEntry) {
    try {
      // Store critical logs immediately (placeholder for PropertiesService storage)
      this.storeCriticalLog(logEntry);
      
      // Alert administrators (placeholder for WhatsApp integration)
      this.alertAdministrators(logEntry);
      
    } catch (error) {
      console.error('Failed to handle critical log:', error);
    }
  }

  /**
   * Store critical log for persistence
   * @param {Object} logEntry - Critical log entry
   */
  storeCriticalLog(logEntry) {
    try {
      const properties = PropertiesService.getScriptProperties();
      const criticalLogs = JSON.parse(properties.getProperty('CRITICAL_LOGS') || '[]');
      
      criticalLogs.push(logEntry);
      
      // Keep only last 50 critical logs
      if (criticalLogs.length > 50) {
        criticalLogs.splice(0, criticalLogs.length - 50);
      }
      
      properties.setProperty('CRITICAL_LOGS', JSON.stringify(criticalLogs));
    } catch (error) {
      console.error('Failed to store critical log:', error);
    }
  }

  /**
   * Alert administrators of critical issues
   * @param {Object} logEntry - Critical log entry
   */
  alertAdministrators(logEntry) {
    try {
      // Placeholder for WhatsApp integration
      const alertMessage = `🚨 CRITICAL SYSTEM ALERT 🚨\n\n` +
                          `Time: ${logEntry.timestamp}\n` +
                          `Source: ${logEntry.source}\n` +
                          `Message: ${logEntry.message}\n\n` +
                          `Please investigate immediately.`;
      
      console.error('ADMIN ALERT:', alertMessage);
      
      // TODO: Integrate with WhatsAppService
      // WhatsAppService.sendMessage(Config.ADMIN_PHONE, alertMessage);
      
    } catch (error) {
      console.error('Failed to alert administrators:', error);
    }
  }

  /**
   * Get session ID for log correlation
   * @returns {string} Session ID
   */
  getSessionId() {
    try {
      let sessionId = PropertiesService.getScriptProperties().getProperty('SESSION_ID');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        PropertiesService.getScriptProperties().setProperty('SESSION_ID', sessionId);
      }
      return sessionId;
    } catch (error) {
      return `session_${Date.now()}_fallback`;
    }
  }

  /**
   * Get execution ID for log correlation
   * @returns {string} Execution ID
   */
  getExecutionId() {
    try {
      return Session.getTemporaryActiveUserKey() || `exec_${Date.now()}`;
    } catch (error) {
      return `exec_${Date.now()}_fallback`;
    }
  }

  /**
   * Capture stack trace for error logging
   * @returns {string} Stack trace
   */
  captureStackTrace() {
    try {
      throw new Error('Stack trace capture');
    } catch (error) {
      // Remove the first line (our thrown error) and return the rest
      const stackLines = error.stack.split('\n');
      return stackLines.slice(2).join('\n');
    }
  }

  /**
   * Get logs from buffer with optional filtering
   * @param {Object} filters - Filter criteria
   * @returns {Array} Filtered log entries
   */
  getLogs(filters = {}) {
    let logs = [...this.logBuffer];

    // Filter by level
    if (filters.level) {
      const levelValue = this.logLevels[filters.level];
      logs = logs.filter(log => this.logLevels[log.level] >= levelValue);
    }

    // Filter by source
    if (filters.source) {
      logs = logs.filter(log => log.source === filters.source);
    }

    // Filter by time range
    if (filters.startTime) {
      const startTime = new Date(filters.startTime);
      logs = logs.filter(log => new Date(log.timestamp) >= startTime);
    }

    if (filters.endTime) {
      const endTime = new Date(filters.endTime);
      logs = logs.filter(log => new Date(log.timestamp) <= endTime);
    }

    // Limit results
    if (filters.limit) {
      logs = logs.slice(-filters.limit);
    }

    return logs;
  }

  /**
   * Clear log buffer
   */
  clearBuffer() {
    this.logBuffer = [];
  }

  /**
   * Get logging statistics
   * @returns {Object} Logging statistics
   */
  getStatistics() {
    const stats = {
      totalLogs: this.logBuffer.length,
      byLevel: {},
      bySource: {},
      oldestLog: null,
      newestLog: null
    };

    if (this.logBuffer.length > 0) {
      stats.oldestLog = this.logBuffer[0].timestamp;
      stats.newestLog = this.logBuffer[this.logBuffer.length - 1].timestamp;

      // Count by level
      this.logBuffer.forEach(log => {
        stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
        stats.bySource[log.source] = (stats.bySource[log.source] || 0) + 1;
      });
    }

    return stats;
  }

  /**
   * Enable or disable console output
   * @param {boolean} enabled - Enable console output
   */
  setConsoleOutput(enabled) {
    this.enableConsoleOutput = enabled;
  }

  /**
   * Enable or disable structured logging
   * @param {boolean} enabled - Enable structured logging
   */
  setStructuredLogging(enabled) {
    this.enableStructuredLogging = enabled;
  }

  /**
   * Create a child logger with predefined context
   * @param {string} source - Source identifier for child logger
   * @param {Object} defaultContext - Default context for all logs
   * @returns {Object} Child logger instance
   */
  createChildLogger(source, defaultContext = {}) {
    const parent = this;
    
    return {
      debug: (message, context = {}) => 
        parent.debug(message, { ...defaultContext, ...context }, source),
      info: (message, context = {}) => 
        parent.info(message, { ...defaultContext, ...context }, source),
      warn: (message, context = {}) => 
        parent.warn(message, { ...defaultContext, ...context }, source),
      error: (message, context = {}) => 
        parent.error(message, { ...defaultContext, ...context }, source),
      critical: (message, context = {}) => 
        parent.critical(message, { ...defaultContext, ...context }, source)
    };
  }
}

// Create global logger instance
var Logger = new LoggerService();
