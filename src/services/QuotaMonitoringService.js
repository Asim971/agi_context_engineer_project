/**
 * QuotaMonitoringService - Advanced quota monitoring and management for Google Apps Script
 * Tracks usage patterns, predicts quota exhaustion, and implements intelligent throttling
 */

class QuotaMonitoringService {
  constructor() {
    this.serviceName = 'QuotaMonitoringService';
    this.version = '1.0.0';
    this.logger = null; // Will be injected via service locator
    this.errorHandler = null; // Will be injected via service locator
    
    // Quota definitions (Google Apps Script limits)
    this.quotaLimits = {
      // Daily limits
      emailQuota: { limit: 100, resetType: 'daily', resetTime: '00:00' },
      urlFetchQuota: { limit: 20000, resetType: 'daily', resetTime: '00:00' },
      driveApiQuota: { limit: 1000000000, resetType: 'daily', resetTime: '00:00' }, // 1B requests
      sheetsApiQuota: { limit: 300, resetType: 'per_minute', resetTime: null },
      
      // Runtime limits
      executionTimeQuota: { limit: 360000, resetType: 'per_execution', resetTime: null }, // 6 minutes
      triggerQuota: { limit: 20, resetType: 'static', resetTime: null },
      
      // Storage limits
      propertiesQuota: { limit: 9216, resetType: 'static', resetTime: null }, // 9KB
      scriptPropertiesCount: { limit: 500, resetType: 'static', resetTime: null },
      
      // Custom application quotas
      idGenerationQuota: { limit: 1000, resetType: 'daily', resetTime: '00:00' },
      logEntryQuota: { limit: 10000, resetType: 'daily', resetTime: '00:00' },
      errorHandlingQuota: { limit: 500, resetType: 'daily', resetTime: '00:00' }
    };
    
    // Warning thresholds
    this.warningThresholds = {
      yellow: 0.7,  // 70% usage
      orange: 0.85, // 85% usage
      red: 0.95     // 95% usage
    };
    
    // Throttling configuration
    this.throttlingConfig = {
      enabled: true,
      aggressiveMode: false,
      backoffMultiplier: 1.5,
      maxBackoffTime: 30000, // 30 seconds
      quotaBufferPercentage: 0.1 // Reserve 10% of quota
    };
    
    // Usage tracking
    this.usageTracking = {
      current: {},
      history: [],
      predictions: {},
      alerts: []
    };
    
    // Performance tracking
    this.performanceMetrics = {
      throttleEvents: 0,
      quotaViolations: 0,
      successfulThrottles: 0,
      lastOptimization: null
    };
    
    this.initializeQuotaMonitoring();
  }
  
  /**
   * Initialize quota monitoring service
   */
  initializeQuotaMonitoring() {
    try {
      // Get service dependencies
      const serviceLocator = GlobalServiceLocator.getInstance();
      this.logger = serviceLocator.get('LoggerService');
      this.errorHandler = serviceLocator.get('ErrorHandlerService');
      
      // Load existing usage data
      this.loadUsageData();
      
      // Initialize quota tracking
      this.initializeQuotaTracking();
      
      this.logger?.info('QuotaMonitoringService initialized', {
        version: this.version,
        quotaCount: Object.keys(this.quotaLimits).length,
        throttlingEnabled: this.throttlingConfig.enabled
      }, this.serviceName);
      
    } catch (error) {
      console.error('Failed to initialize QuotaMonitoringService:', error);
    }
  }
  
  /**
   * Initialize quota tracking for all defined quotas
   */
  initializeQuotaTracking() {
    const propertiesService = PropertiesService.getScriptProperties();
    const today = new Date().toDateString();
    
    for (const [quotaName, quotaConfig] of Object.entries(this.quotaLimits)) {
      const usageKey = this.getUsageKey(quotaName, quotaConfig.resetType);
      
      if (!this.usageTracking.current[quotaName]) {
        this.usageTracking.current[quotaName] = {
          used: parseInt(propertiesService.getProperty(usageKey) || '0'),
          limit: quotaConfig.limit,
          resetType: quotaConfig.resetType,
          lastReset: propertiesService.getProperty(`${usageKey}_RESET`) || today,
          usagePercentage: 0,
          status: 'HEALTHY',
          predictions: {}
        };
      }
      
      this.updateUsagePercentage(quotaName);
    }
  }
  
  /**
   * Get usage key for storing quota data
   * @param {string} quotaName - Name of the quota
   * @param {string} resetType - Reset type (daily, per_minute, etc.)
   * @returns {string} Usage key
   */
  getUsageKey(quotaName, resetType) {
    const today = new Date().toDateString();
    const currentHour = new Date().getHours();
    const currentMinute = new Date().getMinutes();
    
    switch (resetType) {
      case 'daily':
        return `QUOTA_${quotaName.toUpperCase()}_${today}`;
      case 'per_minute':
        return `QUOTA_${quotaName.toUpperCase()}_${today}_${currentHour}_${currentMinute}`;
      case 'per_execution':
        return `QUOTA_${quotaName.toUpperCase()}_EXECUTION_${Date.now()}`;
      case 'static':
        return `QUOTA_${quotaName.toUpperCase()}_STATIC`;
      default:
        return `QUOTA_${quotaName.toUpperCase()}_${today}`;
    }
  }
  
  /**
   * Record quota usage
   * @param {string} quotaName - Name of the quota
   * @param {number} amount - Amount of quota used (default: 1)
   * @returns {Object} Usage result with throttling information
   */
  recordUsage(quotaName, amount = 1) {
    try {
      if (!this.quotaLimits[quotaName]) {
        throw new Error(`Unknown quota: ${quotaName}`);
      }
      
      const quotaConfig = this.quotaLimits[quotaName];
      const usageKey = this.getUsageKey(quotaName, quotaConfig.resetType);
      const propertiesService = PropertiesService.getScriptProperties();
      
      // Check if quota reset is needed
      this.checkAndResetQuota(quotaName);
      
      // Get current usage
      const currentUsage = this.usageTracking.current[quotaName];
      const newUsage = currentUsage.used + amount;
      
      // Check if usage would exceed limit
      const usageResult = {
        quotaName,
        previousUsage: currentUsage.used,
        requestedAmount: amount,
        newUsage,
        limit: quotaConfig.limit,
        allowed: true,
        throttled: false,
        waitTime: 0,
        status: 'SUCCESS'
      };
      
      // Apply throttling if enabled
      if (this.throttlingConfig.enabled) {
        const throttleResult = this.checkThrottling(quotaName, newUsage, quotaConfig.limit);
        
        if (throttleResult.shouldThrottle) {
          usageResult.throttled = true;
          usageResult.waitTime = throttleResult.waitTime;
          usageResult.status = 'THROTTLED';
          
          this.performanceMetrics.throttleEvents++;
          
          this.logger?.warn('Quota usage throttled', {
            quotaName,
            currentUsage: currentUsage.used,
            requestedAmount: amount,
            waitTime: throttleResult.waitTime
          }, this.serviceName);
          
          return usageResult;
        }
      }
      
      // Check hard limits
      if (newUsage > quotaConfig.limit) {
        usageResult.allowed = false;
        usageResult.status = 'QUOTA_EXCEEDED';
        
        this.performanceMetrics.quotaViolations++;
        
        this.logger?.error('Quota limit exceeded', {
          quotaName,
          currentUsage: currentUsage.used,
          requestedAmount: amount,
          limit: quotaConfig.limit
        }, this.serviceName);
        
        // Trigger quota exceeded alert
        this.triggerQuotaAlert(quotaName, 'EXCEEDED', currentUsage.used, quotaConfig.limit);
        
        return usageResult;
      }
      
      // Record the usage
      currentUsage.used = newUsage;
      this.updateUsagePercentage(quotaName);
      
      // Store in properties service
      propertiesService.setProperty(usageKey, newUsage.toString());
      
      // Check for warning thresholds
      this.checkWarningThresholds(quotaName);
      
      // Update predictions
      this.updateUsagePredictions(quotaName);
      
      // Log successful usage
      if (amount > 1 || Math.random() < 0.1) { // Log large amounts or 10% of single uses
        this.logger?.debug('Quota usage recorded', {
          quotaName,
          amount,
          newUsage,
          usagePercentage: currentUsage.usagePercentage
        }, this.serviceName);
      }
      
      return usageResult;
      
    } catch (error) {
      this.errorHandler?.handleError(error, {
        operation: 'recordUsage',
        quotaName,
        amount,
        service: this.serviceName
      });
      
      return {
        quotaName,
        allowed: false,
        status: 'ERROR',
        error: error.message
      };
    }
  }
  
  /**
   * Check if throttling should be applied
   * @param {string} quotaName - Name of the quota
   * @param {number} newUsage - Proposed new usage
   * @param {number} limit - Quota limit
   * @returns {Object} Throttling decision
   */
  checkThrottling(quotaName, newUsage, limit) {
    const usagePercentage = newUsage / limit;
    const bufferThreshold = 1 - this.throttlingConfig.quotaBufferPercentage;
    
    // Check if we're approaching the buffer zone
    if (usagePercentage >= bufferThreshold) {
      const excessPercentage = usagePercentage - bufferThreshold;
      const maxExcess = this.throttlingConfig.quotaBufferPercentage;
      const throttleIntensity = Math.min(excessPercentage / maxExcess, 1);
      
      // Calculate wait time based on throttle intensity
      const baseWaitTime = this.throttlingConfig.aggressiveMode ? 5000 : 1000; // 5s or 1s
      const waitTime = Math.min(
        baseWaitTime * Math.pow(this.throttlingConfig.backoffMultiplier, throttleIntensity * 5),
        this.throttlingConfig.maxBackoffTime
      );
      
      return {
        shouldThrottle: true,
        waitTime: Math.round(waitTime),
        throttleIntensity,
        reason: 'APPROACHING_LIMIT'
      };
    }
    
    // Check usage velocity for predictive throttling
    const predictions = this.usageTracking.current[quotaName]?.predictions;
    if (predictions?.timeToExhaustion && predictions.timeToExhaustion < 3600000) { // Less than 1 hour
      return {
        shouldThrottle: true,
        waitTime: 2000, // 2 second delay
        throttleIntensity: 0.3,
        reason: 'PREDICTIVE_THROTTLING'
      };
    }
    
    return {
      shouldThrottle: false,
      waitTime: 0
    };
  }
  
  /**
   * Check and reset quota if needed
   * @param {string} quotaName - Name of the quota
   */
  checkAndResetQuota(quotaName) {
    const quotaConfig = this.quotaLimits[quotaName];
    const currentUsage = this.usageTracking.current[quotaName];
    
    if (!currentUsage || quotaConfig.resetType === 'static') {
      return;
    }
    
    const now = new Date();
    const lastReset = new Date(currentUsage.lastReset);
    let shouldReset = false;
    
    switch (quotaConfig.resetType) {
      case 'daily':
        shouldReset = now.toDateString() !== lastReset.toDateString();
        break;
      case 'per_minute':
        shouldReset = now.getTime() - lastReset.getTime() >= 60000; // 1 minute
        break;
      case 'per_execution':
        shouldReset = true; // Always reset for per-execution quotas
        break;
    }
    
    if (shouldReset) {
      this.resetQuota(quotaName);
    }
  }
  
  /**
   * Reset quota usage
   * @param {string} quotaName - Name of the quota to reset
   */
  resetQuota(quotaName) {
    try {
      const currentUsage = this.usageTracking.current[quotaName];
      const previousUsage = currentUsage.used;
      
      // Archive current usage to history
      this.usageTracking.history.push({
        quotaName,
        usage: previousUsage,
        limit: currentUsage.limit,
        resetTime: new Date().toISOString(),
        usagePercentage: currentUsage.usagePercentage
      });
      
      // Reset current usage
      currentUsage.used = 0;
      currentUsage.lastReset = new Date().toISOString();
      this.updateUsagePercentage(quotaName);
      
      // Update properties service
      const quotaConfig = this.quotaLimits[quotaName];
      const usageKey = this.getUsageKey(quotaName, quotaConfig.resetType);
      const propertiesService = PropertiesService.getScriptProperties();
      
      propertiesService.setProperty(usageKey, '0');
      propertiesService.setProperty(`${usageKey}_RESET`, new Date().toISOString());
      
      this.logger?.info('Quota reset', {
        quotaName,
        previousUsage,
        resetType: quotaConfig.resetType
      }, this.serviceName);
      
      // Limit history size
      if (this.usageTracking.history.length > 1000) {
        this.usageTracking.history.splice(0, this.usageTracking.history.length - 1000);
      }
      
    } catch (error) {
      this.errorHandler?.handleError(error, {
        operation: 'resetQuota',
        quotaName,
        service: this.serviceName
      });
    }
  }
  
  /**
   * Update usage percentage for a quota
   * @param {string} quotaName - Name of the quota
   */
  updateUsagePercentage(quotaName) {
    const currentUsage = this.usageTracking.current[quotaName];
    if (currentUsage) {
      currentUsage.usagePercentage = currentUsage.used / currentUsage.limit;
      
      // Update status based on usage percentage
      if (currentUsage.usagePercentage >= this.warningThresholds.red) {
        currentUsage.status = 'CRITICAL';
      } else if (currentUsage.usagePercentage >= this.warningThresholds.orange) {
        currentUsage.status = 'WARNING';
      } else if (currentUsage.usagePercentage >= this.warningThresholds.yellow) {
        currentUsage.status = 'CAUTION';
      } else {
        currentUsage.status = 'HEALTHY';
      }
    }
  }
  
  /**
   * Check warning thresholds and trigger alerts
   * @param {string} quotaName - Name of the quota
   */
  checkWarningThresholds(quotaName) {
    const currentUsage = this.usageTracking.current[quotaName];
    const usagePercentage = currentUsage.usagePercentage;
    
    // Check if we've crossed a new threshold
    const previousStatus = currentUsage.status;
    this.updateUsagePercentage(quotaName);
    const newStatus = currentUsage.status;
    
    if (newStatus !== previousStatus && newStatus !== 'HEALTHY') {
      this.triggerQuotaAlert(quotaName, newStatus, currentUsage.used, currentUsage.limit);
    }
  }
  
  /**
   * Trigger quota alert
   * @param {string} quotaName - Name of the quota
   * @param {string} alertLevel - Alert level (WARNING, CRITICAL, EXCEEDED)
   * @param {number} currentUsage - Current usage amount
   * @param {number} limit - Quota limit
   */
  triggerQuotaAlert(quotaName, alertLevel, currentUsage, limit) {
    const alert = {
      id: `quota_${quotaName}_${Date.now()}`,
      quotaName,
      level: alertLevel,
      currentUsage,
      limit,
      usagePercentage: currentUsage / limit,
      timestamp: new Date().toISOString(),
      acknowledged: false
    };
    
    this.usageTracking.alerts.push(alert);
    
    // Log the alert
    const logLevel = alertLevel === 'EXCEEDED' ? 'CRITICAL' : 
                    alertLevel === 'CRITICAL' ? 'ERROR' : 'WARN';
    
    this.logger?.[logLevel.toLowerCase()](`Quota alert: ${alertLevel}`, {
      quotaName,
      currentUsage,
      limit,
      usagePercentage: (currentUsage / limit * 100).toFixed(1) + '%'
    }, this.serviceName);
    
    // Store alert in properties service for persistence
    try {
      const propertiesService = PropertiesService.getScriptProperties();
      const existingAlerts = JSON.parse(propertiesService.getProperty('QUOTA_ALERTS') || '[]');
      existingAlerts.push(alert);
      
      // Keep only recent alerts
      if (existingAlerts.length > 100) {
        existingAlerts.splice(0, existingAlerts.length - 100);
      }
      
      propertiesService.setProperty('QUOTA_ALERTS', JSON.stringify(existingAlerts));
    } catch (error) {
      this.logger?.error('Failed to store quota alert', { error: error.message }, this.serviceName);
    }
  }
  
  /**
   * Update usage predictions
   * @param {string} quotaName - Name of the quota
   */
  updateUsagePredictions(quotaName) {
    try {
      const currentUsage = this.usageTracking.current[quotaName];
      const quotaConfig = this.quotaLimits[quotaName];
      
      // Get recent usage history for this quota
      const recentHistory = this.usageTracking.history
        .filter(h => h.quotaName === quotaName)
        .slice(-10); // Last 10 resets
      
      if (recentHistory.length >= 2) {
        // Calculate average usage rate
        const totalUsage = recentHistory.reduce((sum, h) => sum + h.usage, 0);
        const averageUsage = totalUsage / recentHistory.length;
        
        // Calculate current usage velocity (usage per hour)
        const now = Date.now();
        const lastReset = new Date(currentUsage.lastReset).getTime();
        const timeSinceReset = now - lastReset;
        const hoursElapsed = timeSinceReset / (1000 * 60 * 60);
        
        const currentVelocity = hoursElapsed > 0 ? currentUsage.used / hoursElapsed : 0;
        
        // Predict time to exhaustion
        const remainingQuota = currentUsage.limit - currentUsage.used;
        const timeToExhaustion = currentVelocity > 0 ? 
          (remainingQuota / currentVelocity) * (1000 * 60 * 60) : // Convert to milliseconds
          null;
        
        // Predict end-of-period usage
        let endOfPeriodUsage = null;
        if (quotaConfig.resetType === 'daily') {
          const hoursUntilReset = 24 - new Date().getHours();
          endOfPeriodUsage = currentUsage.used + (currentVelocity * hoursUntilReset);
        }
        
        currentUsage.predictions = {
          averageUsage,
          currentVelocity,
          timeToExhaustion,
          endOfPeriodUsage,
          riskLevel: this.calculateRiskLevel(currentUsage.usagePercentage, timeToExhaustion),
          lastUpdated: new Date().toISOString()
        };
      }
    } catch (error) {
      this.logger?.error('Failed to update usage predictions', {
        error: error.message,
        quotaName
      }, this.serviceName);
    }
  }
  
  /**
   * Calculate risk level based on usage and predictions
   * @param {number} usagePercentage - Current usage percentage
   * @param {number} timeToExhaustion - Time to quota exhaustion in milliseconds
   * @returns {string} Risk level
   */
  calculateRiskLevel(usagePercentage, timeToExhaustion) {
    if (usagePercentage >= 0.95) return 'CRITICAL';
    if (usagePercentage >= 0.85) return 'HIGH';
    
    if (timeToExhaustion) {
      const hoursToExhaustion = timeToExhaustion / (1000 * 60 * 60);
      if (hoursToExhaustion < 1) return 'CRITICAL';
      if (hoursToExhaustion < 4) return 'HIGH';
      if (hoursToExhaustion < 12) return 'MEDIUM';
    }
    
    if (usagePercentage >= 0.7) return 'MEDIUM';
    return 'LOW';
  }
  
  /**
   * Get quota status for a specific quota
   * @param {string} quotaName - Name of the quota
   * @returns {Object} Quota status information
   */
  getQuotaStatus(quotaName) {
    if (!this.quotaLimits[quotaName]) {
      throw new Error(`Unknown quota: ${quotaName}`);
    }
    
    this.checkAndResetQuota(quotaName);
    return this.usageTracking.current[quotaName];
  }
  
  /**
   * Get all quota statuses
   * @returns {Object} All quota statuses
   */
  getAllQuotaStatuses() {
    const statuses = {};
    
    for (const quotaName of Object.keys(this.quotaLimits)) {
      try {
        statuses[quotaName] = this.getQuotaStatus(quotaName);
      } catch (error) {
        statuses[quotaName] = {
          error: error.message,
          status: 'ERROR'
        };
      }
    }
    
    return statuses;
  }
  
  /**
   * Get quota alerts
   * @param {boolean} unacknowledgedOnly - Return only unacknowledged alerts
   * @returns {Array} Quota alerts
   */
  getQuotaAlerts(unacknowledgedOnly = false) {
    let alerts = this.usageTracking.alerts;
    
    if (unacknowledgedOnly) {
      alerts = alerts.filter(alert => !alert.acknowledged);
    }
    
    return alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }
  
  /**
   * Acknowledge quota alert
   * @param {string} alertId - ID of the alert to acknowledge
   */
  acknowledgeAlert(alertId) {
    const alert = this.usageTracking.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedAt = new Date().toISOString();
      
      this.logger?.info('Quota alert acknowledged', {
        alertId,
        quotaName: alert.quotaName,
        level: alert.level
      }, this.serviceName);
    }
  }
  
  /**
   * Clear old alerts
   * @param {number} maxAge - Maximum age in milliseconds
   */
  clearOldAlerts(maxAge = 7 * 24 * 60 * 60 * 1000) { // 7 days default
    const cutoffTime = Date.now() - maxAge;
    const initialCount = this.usageTracking.alerts.length;
    
    this.usageTracking.alerts = this.usageTracking.alerts.filter(alert => 
      new Date(alert.timestamp).getTime() > cutoffTime
    );
    
    const removedCount = initialCount - this.usageTracking.alerts.length;
    
    if (removedCount > 0) {
      this.logger?.info('Old quota alerts cleared', {
        removedCount,
        remainingCount: this.usageTracking.alerts.length
      }, this.serviceName);
    }
  }
  
  /**
   * Load usage data from persistent storage
   */
  loadUsageData() {
    try {
      const propertiesService = PropertiesService.getScriptProperties();
      
      // Load usage history
      const historyData = propertiesService.getProperty('QUOTA_USAGE_HISTORY');
      if (historyData) {
        this.usageTracking.history = JSON.parse(historyData);
      }
      
      // Load alerts
      const alertsData = propertiesService.getProperty('QUOTA_ALERTS');
      if (alertsData) {
        this.usageTracking.alerts = JSON.parse(alertsData);
      }
      
      // Load performance metrics
      const metricsData = propertiesService.getProperty('QUOTA_PERFORMANCE_METRICS');
      if (metricsData) {
        this.performanceMetrics = { ...this.performanceMetrics, ...JSON.parse(metricsData) };
      }
      
    } catch (error) {
      this.logger?.error('Failed to load usage data', { error: error.message }, this.serviceName);
    }
  }
  
  /**
   * Save usage data to persistent storage
   */
  saveUsageData() {
    try {
      const propertiesService = PropertiesService.getScriptProperties();
      
      // Save usage history (keep only recent entries)
      const recentHistory = this.usageTracking.history.slice(-500);
      propertiesService.setProperty('QUOTA_USAGE_HISTORY', JSON.stringify(recentHistory));
      
      // Save alerts (keep only recent entries)
      const recentAlerts = this.usageTracking.alerts.slice(-100);
      propertiesService.setProperty('QUOTA_ALERTS', JSON.stringify(recentAlerts));
      
      // Save performance metrics
      propertiesService.setProperty('QUOTA_PERFORMANCE_METRICS', JSON.stringify(this.performanceMetrics));
      
    } catch (error) {
      this.logger?.error('Failed to save usage data', { error: error.message }, this.serviceName);
    }
  }
  
  /**
   * Get quota monitoring statistics
   * @returns {Object} Monitoring statistics
   */
  getMonitoringStats() {
    const stats = {
      totalQuotas: Object.keys(this.quotaLimits).length,
      activeAlerts: this.usageTracking.alerts.filter(a => !a.acknowledged).length,
      totalAlerts: this.usageTracking.alerts.length,
      historyEntries: this.usageTracking.history.length,
      performanceMetrics: this.performanceMetrics,
      quotaStatuses: {},
      overallHealth: 'HEALTHY'
    };
    
    // Calculate quota status summary
    const statuses = this.getAllQuotaStatuses();
    const statusCounts = { HEALTHY: 0, CAUTION: 0, WARNING: 0, CRITICAL: 0, ERROR: 0 };
    
    for (const [quotaName, status] of Object.entries(statuses)) {
      stats.quotaStatuses[quotaName] = {
        status: status.status,
        usagePercentage: status.usagePercentage,
        riskLevel: status.predictions?.riskLevel || 'UNKNOWN'
      };
      
      statusCounts[status.status] = (statusCounts[status.status] || 0) + 1;
    }
    
    // Determine overall health
    if (statusCounts.CRITICAL > 0 || statusCounts.ERROR > 0) {
      stats.overallHealth = 'CRITICAL';
    } else if (statusCounts.WARNING > 0) {
      stats.overallHealth = 'WARNING';
    } else if (statusCounts.CAUTION > 0) {
      stats.overallHealth = 'CAUTION';
    }
    
    stats.statusCounts = statusCounts;
    
    return stats;
  }
  
  /**
   * Optimize quota usage based on patterns
   */
  optimizeQuotaUsage() {
    try {
      const optimizations = [];
      const statuses = this.getAllQuotaStatuses();
      
      for (const [quotaName, status] of Object.entries(statuses)) {
        if (status.predictions?.riskLevel === 'HIGH' || status.predictions?.riskLevel === 'CRITICAL') {
          // Enable aggressive throttling for high-risk quotas
          if (!this.throttlingConfig.aggressiveMode) {
            this.throttlingConfig.aggressiveMode = true;
            optimizations.push(`Enabled aggressive throttling for ${quotaName}`);
          }
        }
        
        if (status.usagePercentage > 0.9) {
          // Increase buffer percentage for quotas near limit
          this.throttlingConfig.quotaBufferPercentage = Math.max(
            this.throttlingConfig.quotaBufferPercentage,
            0.15
          );
          optimizations.push(`Increased buffer percentage for ${quotaName}`);
        }
      }
      
      if (optimizations.length > 0) {
        this.performanceMetrics.lastOptimization = new Date().toISOString();
        
        this.logger?.info('Quota usage optimized', {
          optimizations,
          newConfig: this.throttlingConfig
        }, this.serviceName);
      }
      
      return optimizations;
      
    } catch (error) {
      this.errorHandler?.handleError(error, {
        operation: 'optimizeQuotaUsage',
        service: this.serviceName
      });
      return [];
    }
  }
  
  /**
   * Get service information
   * @returns {Object} Service information
   */
  getServiceInfo() {
    return {
      serviceName: this.serviceName,
      version: this.version,
      quotaCount: Object.keys(this.quotaLimits).length,
      throttlingEnabled: this.throttlingConfig.enabled,
      monitoringStats: this.getMonitoringStats()
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QuotaMonitoringService;
}