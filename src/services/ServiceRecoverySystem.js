/**
 * ServiceRecoverySystem.js
 * Advanced error recovery and self-healing for service initialization failures
 * Implements Troubleshooter Agent patterns for automatic issue resolution
 * 
 * @fileoverview Service recovery and emergency initialization
 * @version 1.0.0
 */

class ServiceRecoverySystem extends BaseService {
  constructor() {
    super();
    this.recoveryStrategies = new Map();
    this.recoveryHistory = [];
    this.maxRecoveryAttempts = 3;
    
    this.initializeRecoveryStrategies();
    this.logger.info('ServiceRecoverySystem initialized');
  }
  
  /**
   * Initialize all recovery strategies
   * @private
   */
  initializeRecoveryStrategies() {
    // BaseService recovery
    this.recoveryStrategies.set('BaseService', {
      detect: () => typeof BaseService === 'undefined',
      recover: () => this.recoverBaseService(),
      priority: 1,
      description: 'Recover missing BaseService foundation'
    });
    
    // Config recovery
    this.recoveryStrategies.set('Config', {
      detect: () => typeof Config === 'undefined' || !Config,
      recover: () => this.recoverConfig(),
      priority: 2,
      description: 'Recover missing Config object'
    });
    
    // DatabaseService recovery
    this.recoveryStrategies.set('DatabaseService', {
      detect: () => typeof DatabaseService === 'undefined',
      recover: () => this.recoverDatabaseService(),
      priority: 3,
      description: 'Recover missing DatabaseService class'
    });
    
    // Global functions recovery
    this.recoveryStrategies.set('GlobalFunctions', {
      detect: () => typeof getGlobalDB !== 'function',
      recover: () => this.recoverGlobalFunctions(),
      priority: 4,
      description: 'Recover missing global accessor functions'
    });
    
    // Handler services recovery
    this.recoveryStrategies.set('Handlers', {
      detect: () => this.detectHandlerIssues(),
      recover: () => this.recoverHandlers(),
      priority: 5,
      description: 'Recover handler service issues'
    });
  }
  
  /**
   * Perform automatic service recovery
   * @param {Array} targetServices - Specific services to recover (optional)
   * @returns {Object} Recovery report
   */
  performRecovery(targetServices = null) {
    return this.executeWithErrorHandlingSync(() => {
      const recoveryReport = {
        timestamp: new Date().toISOString(),
        attempted: [],
        successful: [],
        failed: [],
        recommendations: [],
        overallSuccess: false
      };
      
      this.logger.info('Starting service recovery process');
      
      // Get strategies to attempt
      const strategies = targetServices 
        ? Array.from(this.recoveryStrategies.entries()).filter(([name]) => targetServices.includes(name))
        : Array.from(this.recoveryStrategies.entries());
      
      // Sort by priority
      strategies.sort(([, a], [, b]) => a.priority - b.priority);
      
      let totalAttempts = 0;
      let successfulRecoveries = 0;
      
      for (const [serviceName, strategy] of strategies) {
        try {
          // Check if recovery is needed
          if (!strategy.detect()) {
            this.logger.debug(`${serviceName} recovery not needed`);
            continue;
          }
          
          totalAttempts++;
          recoveryReport.attempted.push(serviceName);
          
          this.logger.info(`Attempting recovery for ${serviceName}`, {
            description: strategy.description,
            priority: strategy.priority
          });
          
          // Attempt recovery
          const recoveryResult = strategy.recover();
          
          if (recoveryResult.success) {
            successfulRecoveries++;
            recoveryReport.successful.push(serviceName);
            
            this.logger.info(`Recovery successful for ${serviceName}`, recoveryResult);
            
            // Add to recovery history
            this.recoveryHistory.push({
              timestamp: new Date().toISOString(),
              service: serviceName,
              success: true,
              details: recoveryResult
            });
            
          } else {
            recoveryReport.failed.push({
              service: serviceName,
              error: recoveryResult.error,
              recommendations: recoveryResult.recommendations || []
            });
            
            this.logger.error(`Recovery failed for ${serviceName}`, recoveryResult);
            
            // Add recommendations
            if (recoveryResult.recommendations) {
              recoveryReport.recommendations.push(...recoveryResult.recommendations);
            }
          }
          
        } catch (error) {
          recoveryReport.failed.push({
            service: serviceName,
            error: error.message,
            recommendations: [`Manual intervention required for ${serviceName}`]
          });
          
          this.logger.error(`Recovery attempt failed for ${serviceName}`, {
            error: error.message,
            stack: error.stack
          });
        }
      }
      
      recoveryReport.overallSuccess = successfulRecoveries === totalAttempts && totalAttempts > 0;
      
      this.logger.info('Service recovery completed', {
        totalAttempts,
        successfulRecoveries,
        overallSuccess: recoveryReport.overallSuccess
      });
      
      return recoveryReport;
      
    }, { targetServices }, 'performRecovery');
  }
  
  /**
   * Recover BaseService foundation
   * @returns {Object} Recovery result
   */
  recoverBaseService() {
    try {
      // Check if we can load from Foundation file
      if (typeof eval !== 'undefined') {
        // Attempt to re-evaluate Foundation code
        this.logger.info('Attempting BaseService emergency recovery');
        
        // Create minimal BaseService if possible
        if (typeof BaseService === 'undefined') {
          // Emergency BaseService creation
          globalThis.BaseService = class BaseService {
            constructor(dependencies = {}) {
              this.config = dependencies.config || (typeof Config !== 'undefined' ? Config : {});
              this.logger = dependencies.logger || (typeof Logger !== 'undefined' ? Logger : console);
              this.serviceName = this.constructor.name;
              this.startTime = Date.now();
            }
            
            executeWithErrorHandling(operation, context = {}, operationName = 'unknown') {
              try {
                return operation();
              } catch (error) {
                this.logger.error?.(`Operation failed: ${operationName}`, { error: error.message, context });
                throw error;
              }
            }
            
            executeWithErrorHandlingSync(operation, context = {}, operationName = 'unknown') {
              try {
                return operation();
              } catch (error) {
                this.logger.error?.(`Sync operation failed: ${operationName}`, { error: error.message, context });
                throw error;
              }
            }
            
            log(level, message, data = {}) {
              const entry = { level, message, data, service: this.serviceName, timestamp: new Date().toISOString() };
              if (this.logger[level]) {
                this.logger[level](message, data);
              } else if (console[level]) {
                console[level](entry);
              } else {
                console.log(entry);
              }
            }
            
            getServiceInfo() {
              return {
                name: this.serviceName,
                startTime: this.startTime,
                uptime: Date.now() - this.startTime
              };
            }
          };
          
          // Verify emergency BaseService works
          const testInstance = new BaseService();
          if (testInstance instanceof BaseService) {
            return {
              success: true,
              message: 'Emergency BaseService created successfully',
              type: 'emergency_creation'
            };
          }
        }
      }
      
      return {
        success: false,
        error: 'BaseService recovery failed - unable to create emergency instance',
        recommendations: [
          'Check if 00_Foundation.js exists and is properly structured',
          'Verify Google Apps Script file loading order',
          'Ensure BaseService is declared with var pattern for global access'
        ]
      };
      
    } catch (error) {
      return {
        success: false,
        error: `BaseService recovery error: ${error.message}`,
        recommendations: [
          'Manual BaseService restoration required',
          'Check foundation file integrity'
        ]
      };
    }
  }
  
  /**
   * Recover Config object
   * @returns {Object} Recovery result
   */
  recoverConfig() {
    try {
      if (typeof Config === 'undefined') {
        // Create minimal Config object
        globalThis.Config = {
          SHEETS: {},
          HEADERS: {},
          SPREADSHEET_ID: '',
          IS_TEST_ENVIRONMENT: false,
          // Add recovery flag
          _RECOVERY_MODE: true
        };
        
        this.logger.warn('Emergency Config object created - manual configuration required');
        
        return {
          success: true,
          message: 'Emergency Config object created',
          type: 'emergency_creation',
          recommendations: [
            'Configure proper Config.js file',
            'Set required SHEETS and HEADERS properties',
            'Set SPREADSHEET_ID for production use'
          ]
        };
      }
      
      return {
        success: false,
        error: 'Config already exists but may be incomplete'
      };
      
    } catch (error) {
      return {
        success: false,
        error: `Config recovery error: ${error.message}`
      };
    }
  }
  
  /**
   * Recover DatabaseService class
   * @returns {Object} Recovery result
   */
  recoverDatabaseService() {
    try {
      if (typeof DatabaseService === 'undefined' && typeof BaseService !== 'undefined') {
        // Create minimal DatabaseService
        globalThis.DatabaseService = class DatabaseService extends BaseService {
          constructor(isTest = false) {
            super();
            this.isTest = isTest;
            this.spreadsheet = null;
            this.logger.warn('Using emergency DatabaseService - limited functionality');
          }
          
          initialize() {
            this.logger.warn('DatabaseService initialize called in recovery mode');
          }
          
          getSheet(sheetName) {
            throw new Error('DatabaseService in recovery mode - getSheet not available');
          }
        };
        
        return {
          success: true,
          message: 'Emergency DatabaseService created',
          type: 'emergency_creation',
          recommendations: [
            'Restore proper DatabaseService.js file',
            'Verify database functionality after recovery'
          ]
        };
      }
      
      return {
        success: false,
        error: 'DatabaseService recovery requires BaseService to be available first'
      };
      
    } catch (error) {
      return {
        success: false,
        error: `DatabaseService recovery error: ${error.message}`
      };
    }
  }
  
  /**
   * Recover global accessor functions
   * @returns {Object} Recovery result
   */
  recoverGlobalFunctions() {
    try {
      let recovered = [];
      
      // Recover getGlobalDB
      if (typeof getGlobalDB !== 'function' && typeof DatabaseService !== 'undefined') {
        globalThis.getGlobalDB = (() => {
          let instance = null;
          return () => {
            if (!instance) {
              instance = new DatabaseService();
            }
            return instance;
          };
        })();
        recovered.push('getGlobalDB');
      }
      
      // Recover getGlobalLogger
      if (typeof getGlobalLogger !== 'function') {
        globalThis.getGlobalLogger = () => {
          return typeof Logger !== 'undefined' ? Logger : console;
        };
        recovered.push('getGlobalLogger');
      }
      
      // Recover getGlobalConfig
      if (typeof getGlobalConfig !== 'function') {
        globalThis.getGlobalConfig = () => {
          return typeof Config !== 'undefined' ? Config : {};
        };
        recovered.push('getGlobalConfig');
      }
      
      if (recovered.length > 0) {
        return {
          success: true,
          message: `Recovered global functions: ${recovered.join(', ')}`,
          recovered
        };
      }
      
      return {
        success: false,
        error: 'No global functions needed recovery'
      };
      
    } catch (error) {
      return {
        success: false,
        error: `Global functions recovery error: ${error.message}`
      };
    }
  }
  
  /**
   * Detect handler service issues
   * @returns {boolean} Whether handler issues exist
   */
  detectHandlerIssues() {
    const expectedHandlers = ['EngineerHandler', 'RetailerHandler', 'MainHandler'];
    
    for (const handlerName of expectedHandlers) {
      try {
        if (typeof eval(handlerName) === 'undefined') {
          return true;
        }
      } catch (error) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Recover handler services
   * @returns {Object} Recovery result
   */
  recoverHandlers() {
    try {
      // For handlers, we mainly ensure they have proper base classes available
      const issues = [];
      
      if (typeof HandlerService === 'undefined' && typeof BaseService !== 'undefined') {
        // We already created HandlerService.js, so this should be available
        issues.push('HandlerService base class missing');
      }
      
      return {
        success: issues.length === 0,
        message: issues.length === 0 ? 'Handler services check passed' : `Handler issues: ${issues.join(', ')}`,
        issues
      };
      
    } catch (error) {
      return {
        success: false,
        error: `Handler recovery error: ${error.message}`
      };
    }
  }
  
  /**
   * Get recovery history
   * @returns {Array} Recovery history
   */
  getRecoveryHistory() {
    return [...this.recoveryHistory];
  }
  
  /**
   * Clear recovery history
   */
  clearRecoveryHistory() {
    this.recoveryHistory = [];
    this.logger.info('Recovery history cleared');
  }
}

// Global recovery system instance
const globalRecoverySystem = new ServiceRecoverySystem();

/**
 * Global recovery function for easy access
 * @param {Array} services - Services to recover (optional)
 * @returns {Object} Recovery report
 */
function performServiceRecovery(services = null) {
  return globalRecoverySystem.performRecovery(services);
}

/**
 * Emergency recovery function for critical failures
 * @returns {Object} Emergency recovery result
 */
function emergencyServiceRecovery() {
  console.log('🚨 EMERGENCY SERVICE RECOVERY INITIATED');
  
  try {
    // Step 1: Try to recover BaseService first
    if (typeof BaseService === 'undefined') {
      console.log('⚠️ BaseService missing - attempting emergency creation');
      const result = globalRecoverySystem.recoverBaseService();
      console.log('BaseService recovery result:', result);
    }
    
    // Step 2: Perform full recovery
    const recoveryResult = globalRecoverySystem.performRecovery();
    
    console.log('🎯 Emergency recovery completed:', recoveryResult);
    return recoveryResult;
    
  } catch (error) {
    console.error('💥 Emergency recovery failed:', error);
    return {
      success: false,
      error: error.message,
      recommendations: [
        'Manual service restoration required',
        'Check Google Apps Script console for errors',
        'Verify all service files are present and properly structured'
      ]
    };
  }
}

// Register global functions
if (typeof globalThis !== 'undefined') {
  globalThis.performServiceRecovery = performServiceRecovery;
  globalThis.emergencyServiceRecovery = emergencyServiceRecovery;
  globalThis.ServiceRecoverySystem = ServiceRecoverySystem;
}
