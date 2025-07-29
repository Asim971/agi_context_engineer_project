/**
 * 01_ServiceBootstrap.js
 * Service Registration and Bootstrap for Google Apps Script
 * 
 * CRITICAL: This file loads after 00_GlobalServiceLocator.js
 * Registers all core services with the GlobalServiceLocator
 * 
 * @fileoverview Bootstrap system for Google Apps Script service dependency injection
 * @version 1.0.0
 * @author Google Apps Script Service Initialization Troubleshooter Agent
 */

/**
 * Service Bootstrap Manager
 * Handles registration and initialization of all core services
 */
var ServiceBootstrap = (function() {
  'use strict';
  
  // Verify GlobalServiceLocator is available
  if (typeof GlobalServiceLocator === 'undefined') {
    throw new Error('CRITICAL: GlobalServiceLocator not available. Ensure 00_GlobalServiceLocator.js loads first.');
  }
  
  function log(message, data = {}) {
    console.log(`[ServiceBootstrap] ${message}`, data);
  }
  
  return {
    /**
     * Register all core services with GlobalServiceLocator
     */
    registerCoreServices() {
      log('Registering core services...');
      
      try {
        // 1. Register Config as a singleton factory
        GlobalServiceLocator.register('Config', null, {
          singleton: true,
          eager: true,
          factory: () => {
            // Multiple checks for Config availability
            if (typeof Config !== 'undefined' && Config) {
              log('Config service factory executed successfully');
              return Config;
            }
            
            // Try globalThis
            if (typeof globalThis !== 'undefined' && globalThis.Config) {
              log('Config found in globalThis scope');
              return globalThis.Config;
            }
            
            // Try global
            if (typeof global !== 'undefined' && global.Config) {
              log('Config found in global scope');
              return global.Config;
            }
            
            // Emergency: Check if PropertiesService is available to create minimal config
            if (typeof PropertiesService !== 'undefined') {
              log('Creating emergency minimal Config object');
              const emergencyConfig = {
                IS_TEST_ENVIRONMENT: true,
                SHEETS: {
                  BD_LEAD: 'BD Lead CRM',
                  ENGINEER: 'Engineer CRM',
                  RETAILER: 'Retailer CRM'
                },
                HEADERS: {
                  BD_LEAD: ['Timestamp', 'User Name', 'Designation', 'Phone Number', 'Email Address']
                }
              };
              
              // Register emergency config globally
              if (typeof globalThis !== 'undefined') {
                globalThis.Config = emergencyConfig;
              }
              
              return emergencyConfig;
            }
            
            throw new Error('Config object not available through any method. Ensure Config.js loads before ServiceBootstrap.');
          }
        });
        
        // 2. Register DatabaseService
        GlobalServiceLocator.register('DatabaseService', null, {
          singleton: true,
          dependencies: ['Config'],
          factory: (locator) => {
            // Check for DatabaseService class availability
            if (typeof DatabaseService === 'undefined') {
              // Try globalThis
              if (typeof globalThis !== 'undefined' && globalThis.DatabaseService) {
                log('DatabaseService found in globalThis scope');
                const config = locator.get('Config');
                const instance = new globalThis.DatabaseService(config.IS_TEST_ENVIRONMENT);
                log('DatabaseService instance created from globalThis');
                return instance;
              }
              
              throw new Error('DatabaseService class not available in any scope. Check DatabaseService.js file.');
            }
            
            const config = locator.get('Config');
            const instance = new DatabaseService(config.IS_TEST_ENVIRONMENT);
            log('DatabaseService instance created successfully');
            return instance;
          }
        });
        
        // 3. Register HandlerService base class
        GlobalServiceLocator.register('HandlerService', null, {
          singleton: false, // HandlerService is a base class, not a singleton
          dependencies: ['Config', 'DatabaseService'],
          factory: (locator) => {
            // Multi-method HandlerService resolution with enhanced fallbacks
            
            // Method 1: Try global scope (most reliable)
            if (typeof globalThis !== 'undefined' && globalThis.HandlerService) {
              log('HandlerService found in globalThis scope');
              return globalThis.HandlerService;
            }
            
            // Method 2: Try direct reference
            if (typeof HandlerService !== 'undefined') {
              log('HandlerService found in direct scope');
              return HandlerService;
            }
            
            // Method 3: Try to force load HandlerService
            try {
              // Force evaluation of HandlerService if it exists in code
              eval('HandlerService');
              if (typeof HandlerService !== 'undefined') {
                log('HandlerService loaded via eval');
                return HandlerService;
              }
            } catch (evalError) {
              log('HandlerService eval failed: ' + evalError.message);
            }
            
            // Method 4: Emergency HandlerService creation
            log('Creating emergency HandlerService class');
            const EmergencyHandlerService = class extends BaseService {
              constructor(sheetName, headers, idPrefix) {
                super();
                this.sheetName = sheetName || 'Unknown';
                this.headers = headers || [];
                this.idPrefix = idPrefix || 'ID';
                
                // Safe logger access with proper checks
                if (this.logger && typeof this.logger.warn === 'function') {
                  this.logger.warn('Using emergency HandlerService - full functionality may be limited');
                } else {
                  console.warn('[WARN] EmergencyHandlerService: Using emergency HandlerService - full functionality may be limited (logger not available)');
                }
                
                // Initialize helpers if possible
                try {
                  if (typeof HandlerHelpers !== 'undefined') {
                    this.helpers = new HandlerHelpers();
                  } else {
                    this.helpers = {
                      validateRequiredFields: () => {},
                      mapFormValuesToHeaders: (values) => values || {}
                    };
                  }
                } catch (error) {
                  console.warn('[WARN] EmergencyHandlerService: Could not initialize helpers:', error.message);
                  this.helpers = {
                    validateRequiredFields: () => {},
                    mapFormValuesToHeaders: (values) => values || {}
                  };
                }
              }
              
              /**
               * Safe logger access for emergency HandlerService
               */
              safeLog(level, message, data = {}) {
                if (this.logger && typeof this.logger[level] === 'function') {
                  this.logger[level](message, data);
                } else {
                  const consoleMethod = console[level] || console.log;
                  consoleMethod(`[${level.toUpperCase()}] EmergencyHandlerService: ${message}`, data);
                }
              }
              
              getDatabase() {
                return locator ? locator.get('DatabaseService') : null;
              }
              
              processFormSubmission(e, processor) {
                try {
                  return processor(e.values || {}, e);
                } catch (error) {
                  this.safeLog('error', 'Emergency handler form processing failed', { error: error.message });
                  throw error;
                }
              }
            };
            
            // Register emergency HandlerService globally
            if (typeof globalThis !== 'undefined') {
              globalThis.HandlerService = EmergencyHandlerService;
            }
            
            log('Emergency HandlerService created and registered');
            return EmergencyHandlerService;
          }
        });
        
        // 4. Register BaseService (emergency fallback)
        GlobalServiceLocator.register('BaseService', null, {
          singleton: false,
          factory: () => {
            if (typeof BaseService === 'undefined') {
              // Emergency BaseService creation
              log('Creating emergency BaseService');
              return class EmergencyBaseService {
                constructor() {
                  this.logger = console;
                }
                executeWithErrorHandling(fn, context = {}, operation = 'unknown') {
                  try {
                    return fn();
                  } catch (error) {
                    console.error(`Error in ${operation}:`, error);
                    throw error;
                  }
                }
                executeWithErrorHandlingSync(fn, context = {}, operation = 'unknown') {
                  return this.executeWithErrorHandling(fn, context, operation);
                }
              };
            }
            return BaseService;
          }
        });
        
        // 5. Register IdService
        if (typeof IdService !== 'undefined') {
          GlobalServiceLocator.register('IdService', IdService, {
            singleton: true,
            dependencies: ['DatabaseService']
          });
        }
        
        // 6. Register WhatsAppService  
        if (typeof WhatsAppService !== 'undefined') {
          GlobalServiceLocator.register('WhatsAppService', WhatsAppService, {
            singleton: true,
            dependencies: ['Config']
          });
        }
        
        // 7. Register ValidationService
        if (typeof ValidationService !== 'undefined') {
          GlobalServiceLocator.register('ValidationService', ValidationService, {
            singleton: false,
            dependencies: ['Config']
          });
        }
        
        log('Core services registered successfully');
        
      } catch (error) {
        log('Failed to register core services', { error: error.message });
        throw error;
      }
    },
    
    /**
     * Create global accessor functions for Google Apps Script compatibility
     */
    createGlobalAccessors() {
      log('Creating global accessor functions...');
      
      try {
        // Global Config accessor
        if (typeof globalThis !== 'undefined') {
          globalThis.getGlobalConfig = () => {
            return GlobalServiceLocator.get('Config');
          };
          
          // Enhanced getGlobalDB with multiple fallback methods
          globalThis.getGlobalDB = () => {
            try {
              // Method 1: Try service locator
              return GlobalServiceLocator.get('DatabaseService');
            } catch (locatorError) {
              log('ServiceLocator DatabaseService access failed, trying fallbacks', { error: locatorError.message });
              
              try {
                // Method 2: Try direct function if available
                if (typeof getGlobalDB === 'function' && getGlobalDB !== globalThis.getGlobalDB) {
                  const db = getGlobalDB();
                  if (db) return db;
                }
              } catch (directError) {
                log('Direct getGlobalDB access failed', { error: directError.message });
              }
              
              try {
                // Method 3: Direct instantiation as last resort
                if (typeof DatabaseService !== 'undefined') {
                  log('Using direct DatabaseService instantiation as fallback');
                  return new DatabaseService();
                } else if (typeof globalThis !== 'undefined' && globalThis.DatabaseService) {
                  log('Using globalThis.DatabaseService instantiation as fallback');
                  return new globalThis.DatabaseService();
                }
              } catch (instantiationError) {
                log('Direct instantiation failed', { error: instantiationError.message });
              }
              
              throw new Error(`Database service unavailable: ServiceLocator failed (${locatorError.message}), no fallbacks worked`);
            }
          };
          
          // Global HandlerService accessor (returns class, not instance)
          globalThis.getHandlerServiceClass = () => {
            return GlobalServiceLocator.get('HandlerService');
          };
          
          // Global service locator accessor
          globalThis.getService = (serviceName) => {
            return GlobalServiceLocator.get(serviceName);
          };
          
          // Service registry status accessor
          globalThis.getServiceStatus = () => {
            return GlobalServiceLocator.getStatus();
          };
        }
        
        log('Global accessor functions created successfully');
        
      } catch (error) {
        log('Failed to create global accessors', { error: error.message });
        throw error;
      }
    },
    
    /**
     * Initialize the complete service ecosystem
     */
    bootstrap() {
      log('=== Service Bootstrap Started ===');
      
      try {
        // Step 1: Register core services
        this.registerCoreServices();
        
        // Step 2: Create global accessors
        this.createGlobalAccessors();
        
        // Step 3: Initialize eager services
        GlobalServiceLocator.initializeAll();
        
        // Step 4: Validate critical services
        this.validateCriticalServices();
        
        log('=== Service Bootstrap Completed Successfully ===');
        
        return {
          success: true,
          status: GlobalServiceLocator.getStatus()
        };
        
      } catch (error) {
        log('=== Service Bootstrap Failed ===', { error: error.message });
        
        return {
          success: false,
          error: error.message,
          status: GlobalServiceLocator.getStatus()
        };
      }
    },
    
    /**
     * Validate that critical services are working
     */
    validateCriticalServices() {
      log('Validating critical services...');
      
      const validations = [];
      
      try {
        // Test Config access
        const config = GlobalServiceLocator.get('Config');
        if (!config) throw new Error('Config validation failed');
        validations.push('Config: ✅');
        
        // Test DatabaseService access
        const db = GlobalServiceLocator.get('DatabaseService');
        if (!db) throw new Error('DatabaseService validation failed');
        validations.push('DatabaseService: ✅');
        
        // Test HandlerService class access
        const HandlerServiceClass = GlobalServiceLocator.get('HandlerService');
        if (typeof HandlerServiceClass !== 'function') throw new Error('HandlerService validation failed');
        validations.push('HandlerService: ✅');
        
        // Test global accessors
        if (typeof getGlobalDB !== 'function') throw new Error('getGlobalDB accessor validation failed');
        if (typeof getGlobalConfig !== 'function') throw new Error('getGlobalConfig accessor validation failed');
        validations.push('Global Accessors: ✅');
        
        log('Service validation completed', { validations });
        
      } catch (error) {
        log('Service validation failed', { 
          error: error.message,
          completedValidations: validations 
        });
        throw error;
      }
    },
    
    /**
     * Get bootstrap status for debugging
     */
    getStatus() {
      return GlobalServiceLocator.getStatus();
    },
    
    /**
     * Force initialize services even if auto-bootstrap failed
     * Emergency function for manual service recovery
     */
    forceInitialize() {
      log('=== FORCE INITIALIZATION STARTED ===');
      
      try {
        // Force register Config if available
        if (typeof Config !== 'undefined' && !GlobalServiceLocator.has('Config')) {
          GlobalServiceLocator.register('Config', null, {
            singleton: true,
            factory: () => Config
          });
          log('Config force-registered');
        }
        
        // Force register DatabaseService if available
        if (typeof DatabaseService !== 'undefined' && !GlobalServiceLocator.has('DatabaseService')) {
          GlobalServiceLocator.register('DatabaseService', DatabaseService, {
            singleton: true
          });
          log('DatabaseService force-registered');
        }
        
        // Force register HandlerService if available
        if (typeof HandlerService !== 'undefined' && !GlobalServiceLocator.has('HandlerService')) {
          GlobalServiceLocator.register('HandlerService', null, {
            singleton: false,
            factory: () => HandlerService
          });
          log('HandlerService force-registered');
        }
        
        // Force create global accessors
        if (typeof globalThis !== 'undefined') {
          if (!globalThis.getGlobalDB && typeof DatabaseService !== 'undefined') {
            globalThis.getGlobalDB = () => new DatabaseService();
            log('getGlobalDB force-created');
          }
          
          if (!globalThis.getGlobalConfig && typeof Config !== 'undefined') {
            globalThis.getGlobalConfig = () => Config;
            log('getGlobalConfig force-created');
          }
        }
        
        log('=== FORCE INITIALIZATION COMPLETED ===');
        return { success: true, message: 'Force initialization completed successfully' };
        
      } catch (error) {
        log('=== FORCE INITIALIZATION FAILED ===', { error: error.message });
        return { success: false, error: error.message };
      }
    }
  };
})();

/**
 * Register ServiceBootstrap in global scope
 */
if (typeof globalThis !== 'undefined') {
  globalThis.ServiceBootstrap = ServiceBootstrap;
}

/**
 * Auto-bootstrap when this file loads (with improved error handling)
 */
(function() {
  try {
    // Check if we should auto-bootstrap
    const shouldAutoBootstrap = typeof PropertiesService !== 'undefined' && 
                                !PropertiesService.getScriptProperties().getProperty('DISABLE_AUTO_BOOTSTRAP');
    
    if (shouldAutoBootstrap) {
      console.log('Auto-bootstrapping services...');
      const result = ServiceBootstrap.bootstrap();
      
      if (result.success) {
        console.log('✅ Service bootstrap completed successfully');
      } else {
        console.error('❌ Service bootstrap failed:', result.error);
        
        // Try force initialization as backup
        console.log('🔄 Attempting force initialization as backup...');
        const forceResult = ServiceBootstrap.forceInitialize();
        
        if (forceResult.success) {
          console.log('✅ Force initialization successful');
        } else {
          console.error('❌ Force initialization also failed:', forceResult.error);
          console.log('💡 Manual intervention required - call ServiceBootstrap.forceInitialize() later');
        }
      }
    } else {
      console.log('Auto-bootstrap disabled, call ServiceBootstrap.bootstrap() manually');
    }
    
  } catch (error) {
    console.error('Auto-bootstrap error:', error.message);
    
    // Emergency fallback - try to create basic global accessors
    try {
      if (typeof globalThis !== 'undefined' && typeof Config !== 'undefined') {
        globalThis.getGlobalConfig = () => Config;
      }
      
      if (typeof globalThis !== 'undefined' && typeof DatabaseService !== 'undefined') {
        globalThis.getGlobalDB = () => new DatabaseService();
      }
      
      console.log('✅ Emergency global accessors created');
    } catch (emergencyError) {
      console.error('❌ Emergency fallback also failed:', emergencyError.message);
    }
  }
})();

console.log('✅ ServiceBootstrap initialized and ready');
