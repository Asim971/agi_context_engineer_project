/**
 * HealthCheckService - Comprehensive system health monitoring for Google Apps Script
 * Monitors quotas, service availability, performance metrics, and system dependencies
 */

class HealthCheckService {
  constructor() {
    this.serviceName = 'HealthCheckService';
    this.version = '1.0.0';
    this.logger = null; // Will be injected via service locator
    this.errorHandler = null; // Will be injected via service locator
    
    // Health check configuration
    this.healthCheckInterval = 5 * 60 * 1000; // 5 minutes
    this.criticalThresholds = {
      quotaUsage: 0.8, // 80% quota usage triggers warning
      criticalQuotaUsage: 0.95, // 95% quota usage triggers critical alert
      responseTime: 5000, // 5 seconds max response time
      errorRate: 0.1, // 10% error rate threshold
      memoryUsage: 0.8 // 80% memory usage threshold
    };
    
    // Service dependencies to monitor
    this.serviceDependencies = [
      'Sheets',
      'Drive',
      'Properties',
      'Lock',
      'UrlFetch',
      'HtmlService',
      'ScriptApp'
    ];
    
    // Health status cache
    this.lastHealthCheck = null;
    this.healthHistory = [];
    this.maxHistoryEntries = 100;
    
    // Performance tracking
    this.performanceMetrics = {
      averageResponseTime: 0,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      lastResetTime: new Date()
    };
    
    this.initializeHealthCheck();
  }
  
  /**
   * Initialize health check service
   */
  initializeHealthCheck() {
    try {
      // Get service dependencies
      const serviceLocator = GlobalServiceLocator.getInstance();
      this.logger = serviceLocator.get('LoggerService');
      this.errorHandler = serviceLocator.get('ErrorHandlerService');
      
      this.logger?.info('HealthCheckService initialized', {
        version: this.version,
        thresholds: this.criticalThresholds
      }, this.serviceName);
      
      // Perform initial health check
      this.performHealthCheck();
      
    } catch (error) {
      console.error('Failed to initialize HealthCheckService:', error);
    }
  }
  
  /**
   * Perform comprehensive health check
   * @returns {Object} Health check results
   */
  performHealthCheck() {
    const startTime = Date.now();
    const healthStatus = {
      timestamp: new Date().toISOString(),
      overall: 'HEALTHY',
      checks: {},
      metrics: {},
      alerts: [],
      recommendations: []
    };
    
    try {
      // Check quota usage
      healthStatus.checks.quotas = this.checkQuotaUsage();
      
      // Check service availability
      healthStatus.checks.services = this.checkServiceAvailability();
      
      // Check performance metrics
      healthStatus.checks.performance = this.checkPerformanceMetrics();
      
      // Check system resources
      healthStatus.checks.resources = this.checkSystemResources();
      
      // Check error rates
      healthStatus.checks.errors = this.checkErrorRates();
      
      // Check dependencies
      healthStatus.checks.dependencies = this.checkDependencies();
      
      // Determine overall health status
      healthStatus.overall = this.determineOverallHealth(healthStatus.checks);
      
      // Generate alerts and recommendations
      this.generateAlertsAndRecommendations(healthStatus);
      
      // Store health check results
      this.storeHealthCheckResults(healthStatus);
      
      // Log health check completion
      const duration = Date.now() - startTime;
      this.logger?.info('Health check completed', {
        duration,
        status: healthStatus.overall,
        alertCount: healthStatus.alerts.length
      }, this.serviceName);
      
      this.lastHealthCheck = healthStatus;
      return healthStatus;
      
    } catch (error) {
      this.errorHandler?.handleError(error, {
        operation: 'performHealthCheck',
        service: this.serviceName
      });
      
      return {
        timestamp: new Date().toISOString(),
        overall: 'CRITICAL',
        error: error.message,
        checks: {},
        alerts: [{
          level: 'CRITICAL',
          message: 'Health check system failure',
          details: error.message
        }]
      };
    }
  }
  
  /**
   * Check quota usage across different Google Apps Script services
   * @returns {Object} Quota check results
   */
  checkQuotaUsage() {
    const quotaStatus = {
      status: 'HEALTHY',
      details: {},
      warnings: [],
      critical: []
    };
    
    try {
      // Check script runtime quota
      const runtimeQuota = this.checkScriptRuntimeQuota();
      quotaStatus.details.runtime = runtimeQuota;
      
      // Check trigger quota
      const triggerQuota = this.checkTriggerQuota();
      quotaStatus.details.triggers = triggerQuota;
      
      // Check email quota
      const emailQuota = this.checkEmailQuota();
      quotaStatus.details.email = emailQuota;
      
      // Check URL fetch quota
      const urlFetchQuota = this.checkUrlFetchQuota();
      quotaStatus.details.urlFetch = urlFetchQuota;
      
      // Check properties service quota
      const propertiesQuota = this.checkPropertiesQuota();
      quotaStatus.details.properties = propertiesQuota;
      
      // Determine overall quota status
      const allQuotas = [runtimeQuota, triggerQuota, emailQuota, urlFetchQuota, propertiesQuota];
      const maxUsage = Math.max(...allQuotas.map(q => q.usagePercentage || 0));
      
      if (maxUsage >= this.criticalThresholds.criticalQuotaUsage) {
        quotaStatus.status = 'CRITICAL';
        quotaStatus.critical.push(`Critical quota usage detected: ${(maxUsage * 100).toFixed(1)}%`);
      } else if (maxUsage >= this.criticalThresholds.quotaUsage) {
        quotaStatus.status = 'WARNING';
        quotaStatus.warnings.push(`High quota usage detected: ${(maxUsage * 100).toFixed(1)}%`);
      }
      
    } catch (error) {
      quotaStatus.status = 'ERROR';
      quotaStatus.error = error.message;
    }
    
    return quotaStatus;
  }
  
  /**
   * Check script runtime quota
   * @returns {Object} Runtime quota information
   */
  checkScriptRuntimeQuota() {
    try {
      // Google Apps Script has a 6-minute execution time limit
      const maxRuntimeMs = 6 * 60 * 1000;
      const currentRuntime = Date.now() - this.performanceMetrics.lastResetTime.getTime();
      const usagePercentage = Math.min(currentRuntime / maxRuntimeMs, 1);
      
      return {
        type: 'runtime',
        current: currentRuntime,
        limit: maxRuntimeMs,
        usagePercentage,
        status: usagePercentage > 0.8 ? 'WARNING' : 'HEALTHY'
      };
    } catch (error) {
      return {
        type: 'runtime',
        status: 'ERROR',
        error: error.message
      };
    }
  }
  
  /**
   * Check trigger quota
   * @returns {Object} Trigger quota information
   */
  checkTriggerQuota() {
    try {
      const triggers = ScriptApp.getProjectTriggers();
      const maxTriggers = 20; // Google Apps Script limit
      const usagePercentage = triggers.length / maxTriggers;
      
      return {
        type: 'triggers',
        current: triggers.length,
        limit: maxTriggers,
        usagePercentage,
        status: usagePercentage > 0.8 ? 'WARNING' : 'HEALTHY',
        details: triggers.map(t => ({
          handlerFunction: t.getHandlerFunction(),
          triggerSource: t.getTriggerSource().toString(),
          eventType: t.getEventType().toString()
        }))
      };
    } catch (error) {
      return {
        type: 'triggers',
        status: 'ERROR',
        error: error.message
      };
    }
  }
  
  /**
   * Check email quota
   * @returns {Object} Email quota information
   */
  checkEmailQuota() {
    try {
      // Google Apps Script allows 100 emails per day for free accounts
      const dailyLimit = 100;
      const propertiesService = PropertiesService.getScriptProperties();
      const today = new Date().toDateString();
      const emailCountKey = `EMAIL_COUNT_${today}`;
      const currentCount = parseInt(propertiesService.getProperty(emailCountKey) || '0');
      const usagePercentage = currentCount / dailyLimit;
      
      return {
        type: 'email',
        current: currentCount,
        limit: dailyLimit,
        usagePercentage,
        status: usagePercentage > 0.8 ? 'WARNING' : 'HEALTHY',
        resetTime: 'Daily at midnight'
      };
    } catch (error) {
      return {
        type: 'email',
        status: 'ERROR',
        error: error.message
      };
    }
  }
  
  /**
   * Check URL fetch quota
   * @returns {Object} URL fetch quota information
   */
  checkUrlFetchQuota() {
    try {
      // Google Apps Script allows 20,000 URL fetch calls per day
      const dailyLimit = 20000;
      const propertiesService = PropertiesService.getScriptProperties();
      const today = new Date().toDateString();
      const fetchCountKey = `URL_FETCH_COUNT_${today}`;
      const currentCount = parseInt(propertiesService.getProperty(fetchCountKey) || '0');
      const usagePercentage = currentCount / dailyLimit;
      
      return {
        type: 'urlFetch',
        current: currentCount,
        limit: dailyLimit,
        usagePercentage,
        status: usagePercentage > 0.8 ? 'WARNING' : 'HEALTHY',
        resetTime: 'Daily at midnight'
      };
    } catch (error) {
      return {
        type: 'urlFetch',
        status: 'ERROR',
        error: error.message
      };
    }
  }
  
  /**
   * Check properties service quota
   * @returns {Object} Properties quota information
   */
  checkPropertiesQuota() {
    try {
      const propertiesService = PropertiesService.getScriptProperties();
      const allProperties = propertiesService.getProperties();
      const propertyCount = Object.keys(allProperties).length;
      const maxProperties = 500; // Estimated limit
      const usagePercentage = propertyCount / maxProperties;
      
      // Calculate total storage size
      const totalSize = JSON.stringify(allProperties).length;
      const maxSize = 9 * 1024; // 9KB limit per property store
      const sizeUsagePercentage = totalSize / maxSize;
      
      return {
        type: 'properties',
        current: propertyCount,
        limit: maxProperties,
        usagePercentage: Math.max(usagePercentage, sizeUsagePercentage),
        status: Math.max(usagePercentage, sizeUsagePercentage) > 0.8 ? 'WARNING' : 'HEALTHY',
        details: {
          propertyCount,
          totalSize,
          maxSize,
          sizeUsagePercentage
        }
      };
    } catch (error) {
      return {
        type: 'properties',
        status: 'ERROR',
        error: error.message
      };
    }
  }
  
  /**
   * Check service availability
   * @returns {Object} Service availability results
   */
  checkServiceAvailability() {
    const serviceStatus = {
      status: 'HEALTHY',
      services: {},
      unavailable: []
    };
    
    for (const serviceName of this.serviceDependencies) {
      try {
        const isAvailable = this.testServiceAvailability(serviceName);
        serviceStatus.services[serviceName] = {
          available: isAvailable,
          lastChecked: new Date().toISOString()
        };
        
        if (!isAvailable) {
          serviceStatus.unavailable.push(serviceName);
        }
      } catch (error) {
        serviceStatus.services[serviceName] = {
          available: false,
          error: error.message,
          lastChecked: new Date().toISOString()
        };
        serviceStatus.unavailable.push(serviceName);
      }
    }
    
    if (serviceStatus.unavailable.length > 0) {
      serviceStatus.status = serviceStatus.unavailable.length > 2 ? 'CRITICAL' : 'WARNING';
    }
    
    return serviceStatus;
  }
  
  /**
   * Test individual service availability
   * @param {string} serviceName - Name of service to test
   * @returns {boolean} Service availability status
   */
  testServiceAvailability(serviceName) {
    try {
      switch (serviceName) {
        case 'Sheets':
          // Test Sheets API
          SpreadsheetApp.getActiveSpreadsheet();
          return true;
          
        case 'Drive':
          // Test Drive API
          DriveApp.getRootFolder();
          return true;
          
        case 'Properties':
          // Test Properties Service
          PropertiesService.getScriptProperties().getProperty('test');
          return true;
          
        case 'Lock':
          // Test Lock Service
          LockService.getScriptLock();
          return true;
          
        case 'UrlFetch':
          // Test URL Fetch (with a simple HEAD request)
          UrlFetchApp.fetch('https://www.google.com', { method: 'HEAD', muteHttpExceptions: true });
          return true;
          
        case 'HtmlService':
          // Test HTML Service
          HtmlService.createHtmlOutput('<html></html>');
          return true;
          
        case 'ScriptApp':
          // Test Script App
          ScriptApp.getProjectTriggers();
          return true;
          
        default:
          return false;
      }
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Check performance metrics
   * @returns {Object} Performance check results
   */
  checkPerformanceMetrics() {
    const performanceStatus = {
      status: 'HEALTHY',
      metrics: this.performanceMetrics,
      issues: []
    };
    
    try {
      // Calculate error rate
      const errorRate = this.performanceMetrics.totalRequests > 0 ?
        this.performanceMetrics.failedRequests / this.performanceMetrics.totalRequests : 0;
      
      // Check response time
      if (this.performanceMetrics.averageResponseTime > this.criticalThresholds.responseTime) {
        performanceStatus.status = 'WARNING';
        performanceStatus.issues.push(`High average response time: ${this.performanceMetrics.averageResponseTime}ms`);
      }
      
      // Check error rate
      if (errorRate > this.criticalThresholds.errorRate) {
        performanceStatus.status = 'WARNING';
        performanceStatus.issues.push(`High error rate: ${(errorRate * 100).toFixed(2)}%`);
      }
      
      performanceStatus.metrics.errorRate = errorRate;
      
    } catch (error) {
      performanceStatus.status = 'ERROR';
      performanceStatus.error = error.message;
    }
    
    return performanceStatus;
  }
  
  /**
   * Check system resources
   * @returns {Object} Resource check results
   */
  checkSystemResources() {
    const resourceStatus = {
      status: 'HEALTHY',
      resources: {},
      warnings: []
    };
    
    try {
      // Check execution time
      const executionTime = Date.now() - this.performanceMetrics.lastResetTime.getTime();
      const maxExecutionTime = 6 * 60 * 1000; // 6 minutes
      const executionTimeUsage = executionTime / maxExecutionTime;
      
      resourceStatus.resources.executionTime = {
        current: executionTime,
        limit: maxExecutionTime,
        usage: executionTimeUsage
      };
      
      if (executionTimeUsage > 0.8) {
        resourceStatus.status = 'WARNING';
        resourceStatus.warnings.push('High execution time usage');
      }
      
      // Check memory usage (estimated)
      const memoryUsage = this.estimateMemoryUsage();
      resourceStatus.resources.memory = memoryUsage;
      
      if (memoryUsage.usage > this.criticalThresholds.memoryUsage) {
        resourceStatus.status = 'WARNING';
        resourceStatus.warnings.push('High memory usage detected');
      }
      
    } catch (error) {
      resourceStatus.status = 'ERROR';
      resourceStatus.error = error.message;
    }
    
    return resourceStatus;
  }
  
  /**
   * Estimate memory usage
   * @returns {Object} Memory usage estimation
   */
  estimateMemoryUsage() {
    try {
      // Rough estimation based on object sizes
      const estimatedUsage = {
        logBuffer: JSON.stringify(this.logger?.logBuffer || []).length,
        healthHistory: JSON.stringify(this.healthHistory).length,
        performanceMetrics: JSON.stringify(this.performanceMetrics).length
      };
      
      const totalUsage = Object.values(estimatedUsage).reduce((sum, size) => sum + size, 0);
      const estimatedLimit = 100 * 1024 * 1024; // 100MB rough estimate
      
      return {
        estimated: totalUsage,
        limit: estimatedLimit,
        usage: totalUsage / estimatedLimit,
        breakdown: estimatedUsage
      };
    } catch (error) {
      return {
        error: error.message,
        usage: 0
      };
    }
  }
  
  /**
   * Check error rates from logger service
   * @returns {Object} Error rate check results
   */
  checkErrorRates() {
    const errorStatus = {
      status: 'HEALTHY',
      rates: {},
      recentErrors: []
    };
    
    try {
      if (this.logger) {
        // Get recent error logs
        const recentErrors = this.logger.getPersistentLogs('ERROR', 50);
        const recentCritical = this.logger.getPersistentLogs('CRITICAL', 20);
        
        errorStatus.recentErrors = [...recentCritical, ...recentErrors]
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 10);
        
        // Calculate error rates
        const now = Date.now();
        const oneHourAgo = now - (60 * 60 * 1000);
        
        const recentErrorsInHour = recentErrors.filter(log => 
          new Date(log.timestamp).getTime() > oneHourAgo
        );
        
        errorStatus.rates = {
          errorsLastHour: recentErrorsInHour.length,
          criticalErrors: recentCritical.length,
          totalRecentErrors: recentErrors.length
        };
        
        // Determine status based on error frequency
        if (recentCritical.length > 0) {
          errorStatus.status = 'CRITICAL';
        } else if (recentErrorsInHour.length > 10) {
          errorStatus.status = 'WARNING';
        }
      }
    } catch (error) {
      errorStatus.status = 'ERROR';
      errorStatus.error = error.message;
    }
    
    return errorStatus;
  }
  
  /**
   * Check system dependencies
   * @returns {Object} Dependency check results
   */
  checkDependencies() {
    const dependencyStatus = {
      status: 'HEALTHY',
      dependencies: {},
      missing: []
    };
    
    try {
      const serviceLocator = GlobalServiceLocator.getInstance();
      const requiredServices = ['LoggerService', 'ErrorHandlerService', 'IdService'];
      
      for (const serviceName of requiredServices) {
        try {
          const service = serviceLocator.get(serviceName);
          dependencyStatus.dependencies[serviceName] = {
            available: !!service,
            type: typeof service
          };
          
          if (!service) {
            dependencyStatus.missing.push(serviceName);
          }
        } catch (error) {
          dependencyStatus.dependencies[serviceName] = {
            available: false,
            error: error.message
          };
          dependencyStatus.missing.push(serviceName);
        }
      }
      
      if (dependencyStatus.missing.length > 0) {
        dependencyStatus.status = 'WARNING';
      }
      
    } catch (error) {
      dependencyStatus.status = 'ERROR';
      dependencyStatus.error = error.message;
    }
    
    return dependencyStatus;
  }
  
  /**
   * Determine overall health status
   * @param {Object} checks - All health check results
   * @returns {string} Overall health status
   */
  determineOverallHealth(checks) {
    const statuses = Object.values(checks).map(check => check.status);
    
    if (statuses.includes('CRITICAL')) {
      return 'CRITICAL';
    } else if (statuses.includes('ERROR')) {
      return 'ERROR';
    } else if (statuses.includes('WARNING')) {
      return 'WARNING';
    } else {
      return 'HEALTHY';
    }
  }
  
  /**
   * Generate alerts and recommendations
   * @param {Object} healthStatus - Health status object to modify
   */
  generateAlertsAndRecommendations(healthStatus) {
    // Generate alerts based on check results
    Object.entries(healthStatus.checks).forEach(([checkType, result]) => {
      if (result.status === 'CRITICAL') {
        healthStatus.alerts.push({
          level: 'CRITICAL',
          type: checkType,
          message: `Critical issue detected in ${checkType}`,
          details: result.critical || result.error || 'Unknown critical issue'
        });
      } else if (result.status === 'WARNING') {
        healthStatus.alerts.push({
          level: 'WARNING',
          type: checkType,
          message: `Warning in ${checkType}`,
          details: result.warnings || result.issues || 'Performance degradation detected'
        });
      }
    });
    
    // Generate recommendations
    if (healthStatus.checks.quotas?.status === 'WARNING') {
      healthStatus.recommendations.push('Consider optimizing quota usage or implementing caching');
    }
    
    if (healthStatus.checks.performance?.status === 'WARNING') {
      healthStatus.recommendations.push('Review and optimize slow operations');
    }
    
    if (healthStatus.checks.services?.unavailable?.length > 0) {
      healthStatus.recommendations.push('Check Google Apps Script service status and network connectivity');
    }
    
    if (healthStatus.checks.errors?.rates?.errorsLastHour > 5) {
      healthStatus.recommendations.push('Investigate recent error patterns and implement fixes');
    }
  }
  
  /**
   * Store health check results
   * @param {Object} healthStatus - Health check results
   */
  storeHealthCheckResults(healthStatus) {
    try {
      // Add to history
      this.healthHistory.push({
        timestamp: healthStatus.timestamp,
        overall: healthStatus.overall,
        alertCount: healthStatus.alerts.length,
        summary: this.createHealthSummary(healthStatus)
      });
      
      // Limit history size
      if (this.healthHistory.length > this.maxHistoryEntries) {
        this.healthHistory.splice(0, this.healthHistory.length - this.maxHistoryEntries);
      }
      
      // Store in properties service for persistence
      const propertiesService = PropertiesService.getScriptProperties();
      propertiesService.setProperty('LAST_HEALTH_CHECK', JSON.stringify({
        timestamp: healthStatus.timestamp,
        overall: healthStatus.overall,
        alertCount: healthStatus.alerts.length
      }));
      
      // Store critical alerts separately
      const criticalAlerts = healthStatus.alerts.filter(alert => alert.level === 'CRITICAL');
      if (criticalAlerts.length > 0) {
        propertiesService.setProperty('CRITICAL_HEALTH_ALERTS', JSON.stringify(criticalAlerts));
      }
      
    } catch (error) {
      this.logger?.error('Failed to store health check results', { error: error.message }, this.serviceName);
    }
  }
  
  /**
   * Create health summary
   * @param {Object} healthStatus - Health status object
   * @returns {Object} Health summary
   */
  createHealthSummary(healthStatus) {
    return {
      quotaStatus: healthStatus.checks.quotas?.status || 'UNKNOWN',
      serviceStatus: healthStatus.checks.services?.status || 'UNKNOWN',
      performanceStatus: healthStatus.checks.performance?.status || 'UNKNOWN',
      errorStatus: healthStatus.checks.errors?.status || 'UNKNOWN',
      criticalAlerts: healthStatus.alerts.filter(a => a.level === 'CRITICAL').length,
      warnings: healthStatus.alerts.filter(a => a.level === 'WARNING').length
    };
  }
  
  /**
   * Get current health status
   * @returns {Object} Current health status
   */
  getHealthStatus() {
    return this.lastHealthCheck || this.performHealthCheck();
  }
  
  /**
   * Get health history
   * @param {number} limit - Maximum number of entries to return
   * @returns {Array} Health history entries
   */
  getHealthHistory(limit = 50) {
    return this.healthHistory.slice(-limit);
  }
  
  /**
   * Get critical alerts
   * @returns {Array} Current critical alerts
   */
  getCriticalAlerts() {
    try {
      const propertiesService = PropertiesService.getScriptProperties();
      const criticalAlerts = propertiesService.getProperty('CRITICAL_HEALTH_ALERTS');
      return criticalAlerts ? JSON.parse(criticalAlerts) : [];
    } catch (error) {
      this.logger?.error('Failed to retrieve critical alerts', { error: error.message }, this.serviceName);
      return [];
    }
  }
  
  /**
   * Clear critical alerts
   */
  clearCriticalAlerts() {
    try {
      const propertiesService = PropertiesService.getScriptProperties();
      propertiesService.deleteProperty('CRITICAL_HEALTH_ALERTS');
      this.logger?.info('Critical alerts cleared', {}, this.serviceName);
    } catch (error) {
      this.logger?.error('Failed to clear critical alerts', { error: error.message }, this.serviceName);
    }
  }
  
  /**
   * Record performance metric
   * @param {number} responseTime - Response time in milliseconds
   * @param {boolean} success - Whether the operation was successful
   */
  recordPerformanceMetric(responseTime, success = true) {
    try {
      this.performanceMetrics.totalRequests++;
      
      if (success) {
        this.performanceMetrics.successfulRequests++;
      } else {
        this.performanceMetrics.failedRequests++;
      }
      
      // Update average response time
      const totalResponseTime = this.performanceMetrics.averageResponseTime * 
        (this.performanceMetrics.totalRequests - 1) + responseTime;
      this.performanceMetrics.averageResponseTime = totalResponseTime / this.performanceMetrics.totalRequests;
      
    } catch (error) {
      this.logger?.error('Failed to record performance metric', { 
        error: error.message,
        responseTime,
        success
      }, this.serviceName);
    }
  }
  
  /**
   * Reset performance metrics
   */
  resetPerformanceMetrics() {
    this.performanceMetrics = {
      averageResponseTime: 0,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      lastResetTime: new Date()
    };
    
    this.logger?.info('Performance metrics reset', {}, this.serviceName);
  }
  
  /**
   * Get service information
   * @returns {Object} Service information
   */
  getServiceInfo() {
    return {
      serviceName: this.serviceName,
      version: this.version,
      lastHealthCheck: this.lastHealthCheck?.timestamp,
      healthHistoryCount: this.healthHistory.length,
      performanceMetrics: this.performanceMetrics,
      thresholds: this.criticalThresholds
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HealthCheckService;
}