/**
 * ServiceHealthMonitor.js
 * Real-time service health monitoring and diagnostics
 * Implements patterns from the Troubleshooter Agent
 * 
 * @fileoverview Advanced service monitoring and error detection
 * @version 1.0.0
 */

class ServiceHealthMonitor extends BaseService {
  constructor() {
    super();
    this.healthChecks = new Map();
    this.alertThreshold = 3; // Number of failures before alert
    this.checkInterval = 30000; // 30 seconds
    this.lastFullCheck = null;
    
    this.initializeHealthChecks();
    this.logger.info('ServiceHealthMonitor initialized');
  }
  
  /**
   * Initialize all health check functions
   * @private
   */
  initializeHealthChecks() {
    // Core service checks
    this.healthChecks.set('BaseService', () => this.checkBaseService());
    this.healthChecks.set('Config', () => this.checkConfig());
    this.healthChecks.set('DatabaseService', () => this.checkDatabaseService());
    this.healthChecks.set('Logger', () => this.checkLogger());
    
    
    
    // Handler service checks
    this.healthChecks.set('Handlers', () => this.checkHandlers());
  }
  
  /**
   * Perform comprehensive health check
   * @returns {Object} Health status report
   */
  performHealthCheck() {
    return this.executeWithErrorHandlingSync(() => {
      const startTime = Date.now();
      const healthReport = {
        timestamp: new Date().toISOString(),
        overallStatus: 'HEALTHY',
        services: {},
        errors: [],
        warnings: [],
        recommendations: [],
        executionTime: 0
      };
      
      let criticalIssues = 0;
      let warnings = 0;
      
      // Run all health checks
      for (const [serviceName, checkFunction] of this.healthChecks) {
        try {
          const serviceStatus = checkFunction();
          healthReport.services[serviceName] = serviceStatus;
          
          if (serviceStatus.status === 'ERROR' || serviceStatus.status === 'CRITICAL') {
            criticalIssues++;
            healthReport.errors.push(`${serviceName}: ${serviceStatus.message}`);
          } else if (serviceStatus.status === 'WARNING') {
            warnings++;
            healthReport.warnings.push(`${serviceName}: ${serviceStatus.message}`);
          }
          
          // Add recommendations if any
          if (serviceStatus.recommendations) {
            healthReport.recommendations.push(...serviceStatus.recommendations);
          }
          
        } catch (error) {
          criticalIssues++;
          healthReport.services[serviceName] = {
            status: 'ERROR',
            message: error.message,
            timestamp: new Date().toISOString()
          };
          healthReport.errors.push(`${serviceName}: ${error.message}`);
        }
      }
      
      // Determine overall status
      if (criticalIssues > 0) {
        healthReport.overallStatus = 'CRITICAL';
      } else if (warnings > 0) {
        healthReport.overallStatus = 'WARNING';
      }
      
      healthReport.executionTime = Date.now() - startTime;
      this.lastFullCheck = healthReport;
      
      this.logger.info('Health check completed', {
        overallStatus: healthReport.overallStatus,
        criticalIssues,
        warnings,
        executionTime: healthReport.executionTime
      });
      
      return healthReport;
      
    }, {}, 'performHealthCheck');
  }
  
  /**
   * Check BaseService availability and functionality
   * @returns {Object} Service status
   */
  checkBaseService() {
    const status = {
      status: 'HEALTHY',
      message: 'BaseService operational',
      timestamp: new Date().toISOString(),
      details: {}
    };
    
    // Check if BaseService is defined
    if (typeof BaseService === 'undefined') {
      status.status = 'CRITICAL';
      status.message = 'BaseService is not defined - critical foundation issue';
      status.recommendations = [
        'Verify 00_Foundation.js is loading first',
        'Check file loading order in Google Apps Script',
        'Ensure BaseService is declared with var pattern'
      ];
      return status;
    }
    
    // Test instantiation
    try {
      const testInstance = new BaseService();
      status.details.instantiation = 'success';
      status.details.methods = {
        executeWithErrorHandling: typeof testInstance.executeWithErrorHandling === 'function',
        log: typeof testInstance.log === 'function',
        getServiceInfo: typeof testInstance.getServiceInfo === 'function'
      };
      
      // Check for missing methods
      const missingMethods = Object.entries(status.details.methods)
        .filter(([method, available]) => !available)
        .map(([method]) => method);
      
      if (missingMethods.length > 0) {
        status.status = 'WARNING';
        status.message = `BaseService missing methods: ${missingMethods.join(', ')}`;
      }
      
    } catch (error) {
      status.status = 'ERROR';
      status.message = `BaseService instantiation failed: ${error.message}`;
      status.details.error = error.message;
    }
    
    return status;
  }
  
  /**
   * Check Config availability and completeness
   * @returns {Object} Service status
   */
  checkConfig() {
    const status = {
      status: 'HEALTHY',
      message: 'Config service operational',
      timestamp: new Date().toISOString(),
      details: {}
    };
    
    if (typeof Config === 'undefined') {
      status.status = 'CRITICAL';
      status.message = 'Config object not available';
      status.recommendations = ['Verify Config.js is loading properly'];
      return status;
    }
    
    // Check critical config sections
    const requiredSections = ['SHEETS', 'HEADERS', 'SPREADSHEET_ID'];
    const missingSections = [];
    
    requiredSections.forEach(section => {
      if (!Config[section]) {
        missingSections.push(section);
      }
    });
    
    if (missingSections.length > 0) {
      status.status = 'WARNING';
      status.message = `Config missing sections: ${missingSections.join(', ')}`;
      status.details.missingSections = missingSections;
    }
    
    return status;
  }
  
  /**
   * Check Database service health
   * @returns {Object} Service status
   */
  checkDatabaseService() {
    const status = {
      status: 'HEALTHY',
      message: 'DatabaseService operational',
      timestamp: new Date().toISOString(),
      details: {}
    };
    
    // Check class availability
    if (typeof DatabaseService === 'undefined') {
      status.status = 'CRITICAL';
      status.message = 'DatabaseService class not available';
      return status;
    }
    
    // Test instantiation
    try {
      const testDB = new DatabaseService(true); // Test mode
      status.details.instantiation = 'success';
      status.details.inheritance = testDB instanceof BaseService;
      
      if (!status.details.inheritance) {
        status.status = 'WARNING';
        status.message = 'DatabaseService not properly extending BaseService';
      }
      
    } catch (error) {
      status.status = 'ERROR';
      status.message = `DatabaseService instantiation failed: ${error.message}`;
      status.details.error = error.message;
    }
    
    return status;
  }
  
  
  
  /**
   * Check Logger service
   * @returns {Object} Service status
   */
  checkLogger() {
    const status = {
      status: 'HEALTHY',
      message: 'Logger service operational',
      timestamp: new Date().toISOString(),
      details: {}
    };
    
    if (typeof Logger === 'undefined') {
      status.status = 'WARNING';
      status.message = 'Logger service not available via GlobalServiceLocator';
        status.available = false;
        status.critical = true;
      return status;
    }
    
    // Test logger functionality
    try {
      const testLogger = Logger.createChildLogger('HealthCheck');
      status.details.childLogger = typeof testLogger;
      status.details.methods = {
        info: typeof testLogger.info === 'function',
        error: typeof testLogger.error === 'function',
        warn: typeof testLogger.warn === 'function'
      };
      
    } catch (error) {
      status.status = 'WARNING';
      status.message = `Logger functionality limited: ${error.message}`;
    }
    
    return status;
  }
  
  
  
  
  
  /**
   * Check handler services
   * @returns {Object} Service status
   */
  checkHandlers() {
    const status = {
      status: 'HEALTHY',
      message: 'Handler services operational',
      timestamp: new Date().toISOString(),
      details: { available: [], missing: [] }
    };
    
    const expectedHandlers = [
      'EngineerHandler',
      'RetailerHandler',
      'BDLeadHandlerService',
      'MainHandler'
    ];
    
    expectedHandlers.forEach(handlerName => {
      try {
        const handlerExists = typeof eval(handlerName) !== 'undefined';
        if (handlerExists) {
          status.details.available.push(handlerName);
        } else {
          status.details.missing.push(handlerName);
        }
      } catch (error) {
        status.details.missing.push(handlerName);
      }
    });
    
    if (status.details.missing.length > 0) {
      status.status = 'WARNING';
      status.message = `Some handlers not available: ${status.details.missing.join(', ')}`;
    }
    
    return status;
  }
  
  /**
   * Get quick health status without full check
   * @returns {Object} Quick status
   */
  getQuickStatus() {
    const quickStatus = {
      timestamp: new Date().toISOString(),
      coreServices: {},
      overallStatus: 'HEALTHY'
    };
    
    // Quick checks for critical services
    quickStatus.coreServices.BaseService = typeof BaseService !== 'undefined';
    quickStatus.coreServices.Config = typeof Config !== 'undefined';
    quickStatus.coreServices.DatabaseService = typeof DatabaseService !== 'undefined';
    quickStatus.coreServices.getGlobalDB = typeof getGlobalDB === 'function';
    
    const criticalIssues = Object.values(quickStatus.coreServices).filter(status => !status).length;
    
    if (criticalIssues > 0) {
      quickStatus.overallStatus = 'CRITICAL';
    }
    
    return quickStatus;
  }
}

// Global health monitor instance
const globalHealthMonitor = new ServiceHealthMonitor();

/**
 * Global health check function for easy access
 * @returns {Object} Health status report
 */
function healthCheck() {
  return globalHealthMonitor.performHealthCheck();
}

/**
 * Quick status check function
 * @returns {Object} Quick status
 */
function quickHealthCheck() {
  return globalHealthMonitor.getQuickStatus();
}

// Register global functions
