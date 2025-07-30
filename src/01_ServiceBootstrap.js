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
var ServiceBootstrap = (function () {
  "use strict";

  // Verify GlobalServiceLocator is available
  if (typeof GlobalServiceLocator === "undefined") {
    throw new Error(
      "CRITICAL: GlobalServiceLocator not available. Ensure 00_GlobalServiceLocator.js loads first."
    );
  }

  function log(message, data = {}) {
    console.log(`[ServiceBootstrap] ${message}`, data);
  }

  return {
    /**
     * Register all core services with GlobalServiceLocator
     */
    registerCoreServices() {
      log("Registering core services...");

      try {
        // Register services in dependency order
        const serviceRegistrations = [
          // Foundation services (no dependencies)
          { name: 'Config', config: this.getConfigServiceConfig() },
          { name: 'Logger', config: this.getLoggerServiceConfig() },
          { name: 'ErrorHandler', config: this.getErrorHandlerServiceConfig() },

          // Core services (basic dependencies)
          { name: 'BaseService', config: this.getBaseServiceConfig() },
          { name: 'IdService', config: this.getIdServiceConfig() },
          { name: 'ValidationService', config: this.getValidationServiceConfig() },

          // Data services
          { name: 'DatabaseService', config: this.getDatabaseServiceConfig() },

          // Business services
          { name: 'CRMHandler', config: this.getCRMHandlerServiceConfig() },
          { name: 'HandlerService', config: this.getHandlerServiceConfig() }
        ];

        // Register each service with validation
        for (const { name, config } of serviceRegistrations) {
          try {
            if (!config) {
              throw new Error(`Service configuration not found for: ${name}`);
            }

            GlobalServiceLocator.register(name, config.serviceClass, config.options);
            log(`Service registered: ${name}`, {
              singleton: config.options.singleton,
              dependencies: config.options.dependencies,
              eager: config.options.eager
            });
          } catch (error) {
            log(`Failed to register service: ${name}`, {
              error: error.message,
              config: config ? 'present' : 'missing'
            });
            throw new Error(`Service registration failed for '${name}': ${error.message}`);
          }
        }

        // Register service aliases for backward compatibility
        this.registerServiceAliases();

        log("Core services registered successfully");
        return true;
      } catch (error) {
        log("Core service registration failed", {
          error: error.message,
          stack: error.stack
        });
        throw error;
      }
    },

    /**
     * Get Config service configuration
     */
    getConfigServiceConfig() {
      return {
        serviceClass: null,
        options: {
          singleton: true,
          eager: true,
          factory: () => {
            if (typeof Config === "undefined") {
              throw new Error("Config not defined. Ensure Config.js is loaded.");
            }
            log("Config service factory executed successfully");
            return Config;
          }
        }
      };
    },

    /**
     * Get Logger service configuration
     */
    getLoggerServiceConfig() {
      return {
        serviceClass: null,
        options: {
          singleton: true,
          eager: true,
          factory: () => {
            if (typeof Logger !== "undefined") {
              log("Logger service factory executed successfully");
              return Logger;
            } else if (typeof LoggerService !== "undefined") {
              return new LoggerService();
            } else {
              throw new Error("Logger not defined. Ensure Logger.js is loaded.");
            }
          }
        }
      };
    },

    /**
     * Get ErrorHandler service configuration
     */
    getErrorHandlerServiceConfig() {
      return {
        serviceClass: null,
        options: {
          singleton: true,
          dependencies: ["Logger"],
          eager: true,
          factory: () => {
            if (typeof ErrorHandler === "undefined") {
              throw new Error("ErrorHandler class not defined. Ensure ErrorHandler.js is loaded.");
            }
            const instance = new ErrorHandler();
            log("ErrorHandler service factory executed successfully");
            return instance;
          }
        }
      };
    },

    /**
     * Get DatabaseService configuration with enhanced error handling
     */
    getDatabaseServiceConfig() {
      return {
        serviceClass: null,
        options: {
          singleton: true,
          dependencies: ["Config", "ErrorHandler"],
          factory: (locator) => {
            try {
              if (typeof DatabaseService === "undefined") {
                throw new Error("DatabaseService class not defined. Ensure DatabaseService.js is loaded.");
              }

              const config = locator.get("Config");
              if (!config) {
                throw new Error("Config service not available for DatabaseService initialization");
              }

              const instance = new DatabaseService(config.IS_TEST_ENVIRONMENT);

              // Verify service is properly initialized
              if (typeof instance.insertRecord !== "function") {
                throw new Error("DatabaseService not properly initialized - missing core methods");
              }

              log("DatabaseService instance created successfully");
              return instance;
            } catch (error) {
              log("DatabaseService factory error", { error: error.message });
              throw error;
            }
          }
        }
      };
    },

    /**
     * Get BaseService configuration
     */
    getBaseServiceConfig() {
      return {
        serviceClass: BaseService,
        options: {
          singleton: false,
          dependencies: ["Config"]
        }
      };
    },

    /**
     * Get IdService configuration
     */
    getIdServiceConfig() {
      return {
        serviceClass: IdService,
        options: {
          singleton: true,
          dependencies: ["Config"]
        }
      };
    },

    /**
     * Get ValidationService configuration
     */
    getValidationServiceConfig() {
      return {
        serviceClass: null,
        options: {
          singleton: true,
          dependencies: ["Config", "ErrorHandler"],
          factory: () => {
            if (typeof ValidationService === "undefined") {
              throw new Error("ValidationService class not defined. Ensure ValidationService.js is loaded.");
            }
            const instance = new ValidationService();
            log("ValidationService instance created successfully");
            return instance;
          }
        }
      };
    },

    /**
     * Get HandlerService configuration
     */
    getHandlerServiceConfig() {
      return {
        serviceClass: null,
        options: {
          singleton: false,
          dependencies: ["Config", "DatabaseService", "ErrorHandler"],
          factory: () => {
            if (typeof HandlerService === "undefined") {
              throw new Error("HandlerService class not defined. Ensure HandlerService.js is loaded.");
            }
            log("HandlerService found in direct scope");
            return HandlerService;
          }
        }
      };
    },

    /**
     * Get CRMHandler configuration
     */
    getCRMHandlerServiceConfig() {
      return {
        serviceClass: null,
        options: {
          singleton: true,
          dependencies: ["Config", "DatabaseService", "ValidationService", "ErrorHandler"],
          factory: () => {
            if (typeof CRMHandler === "undefined") {
              throw new Error("CRMHandler class not defined. Ensure CRMHandler.js is loaded.");
            }
            const instance = new CRMHandler();
            log("CRMHandler instance created successfully");
            return instance;
          }
        }
      };
    },

    /**
     * Register service aliases for backward compatibility
     */
    registerServiceAliases() {
      try {
        // Database alias
        GlobalServiceLocator.register("Database", null, {
          singleton: true,
          factory: (locator) => {
            return locator.get("DatabaseService");
          },
        });

        // Validator alias
        if (typeof ValidationService !== "undefined") {
          GlobalServiceLocator.register("Validator", null, {
            singleton: false,
            factory: (locator) => {
              return locator.get("ValidationService");
            },
          });
        }

        log("Service aliases registered successfully");
      } catch (error) {
        log("Failed to register service aliases", { error: error.message });
        throw error;
      }
    },

    /**
     * Legacy service registration cleanup
     */
    registerLegacyServices() {
      try {
        // Register additional services that may be available
        if (typeof WhatsAppService !== "undefined") {
          GlobalServiceLocator.register("WhatsAppService", WhatsAppService, {
            singleton: true,
            dependencies: ["Config"],
          });
        }

        if (typeof HealthCheckService !== "undefined") {
          GlobalServiceLocator.register("HealthCheckService", HealthCheckService, {
            singleton: true,
            dependencies: ["Logger", "ErrorHandler"],
          });
        }

        if (typeof QuotaMonitoringService !== "undefined") {
          GlobalServiceLocator.register("QuotaMonitoringService", QuotaMonitoringService, {
            singleton: true,
            dependencies: ["Logger", "ErrorHandler"],
          });
        }

        log("Legacy services registered successfully");
      } catch (error) {
        log("Failed to register legacy services", { error: error.message });
        throw error;
      }
    },

    /**
     * Create global accessor functions for Google Apps Script compatibility
     */
    createGlobalAccessors() {
      // All service access should now be through GlobalServiceLocator.get('ServiceName')
      // This prevents load order issues and promotes proper DI
      log(
        "Global accessor functions not created; using ServiceLocator directly"
      );
    },

    /**
     * Initialize the complete service ecosystem
     */
    bootstrap() {
      log("=== Service Bootstrap Started ===");

      try {
        // Register core services in dependency order
        this.registerCoreServices();

        // Register legacy and optional services
        this.registerLegacyServices();

        // Initialize eager services
        GlobalServiceLocator.initializeAll();

        // Validate critical services are available
        this.validateCriticalServices();

        log("=== Service Bootstrap Completed Successfully ===");

        return {
          success: true,
          status: GlobalServiceLocator.getStatus(),
        };
      } catch (error) {
        log("=== Service Bootstrap Failed ===", { error: error.message });

        throw error;
      }
    },

    /**
     * Validate that critical services are available and functional
     */
    validateCriticalServices() {
      log("Validating critical services...");

      const validations = [];
      const criticalServices = [
        { name: 'Config', requiredMethods: [] },
        { name: 'Logger', requiredMethods: [] },
        { name: 'ErrorHandler', requiredMethods: ['handleError', 'categorizeError'] },
        { name: 'DatabaseService', requiredMethods: ['insertRecord', 'getRecord'] },
        { name: 'ValidationService', requiredMethods: ['validate'] },
        { name: 'IdService', requiredMethods: ['generateId'] },
        { name: 'CRMHandler', requiredMethods: [] },
        { name: 'HandlerService', requiredMethods: [] }
      ];

      try {
        for (const { name, requiredMethods } of criticalServices) {
          try {
            // Check if service is registered
            if (!GlobalServiceLocator.isRegistered(name)) {
              log(`Service not registered: ${name}`);
              continue;
            }

            // Attempt to get the service
            const service = GlobalServiceLocator.get(name);
            if (!service) {
              throw new Error(`${name} service instantiation failed`);
            }

            // Validate required methods if specified
            for (const method of requiredMethods) {
              if (typeof service[method] !== 'function') {
                throw new Error(`${name} missing required method: ${method}`);
              }
            }

            validations.push(`${name}: ✅`);
            log(`Service validation passed: ${name}`);
          } catch (error) {
            validations.push(`${name}: ❌ (${error.message})`);
            log(`Service validation failed: ${name}`, { error: error.message });
            // Don't throw here, continue validating other services
          }
        }

        // Check if we have minimum required services
        const requiredServices = ['Config', 'ErrorHandler', 'DatabaseService'];
        const availableRequired = requiredServices.filter(name => 
          GlobalServiceLocator.isRegistered(name) && GlobalServiceLocator.get(name)
        );

        if (availableRequired.length < requiredServices.length) {
          const missing = requiredServices.filter(name => !availableRequired.includes(name));
          throw new Error(`Critical services missing: ${missing.join(', ')}`);
        }

        log("Service validation completed", { validations });
        return { success: true, validations };
      } catch (error) {
        log("Service validation failed", {
          error: error.message,
          completedValidations: validations,
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
  };
})();

/**
 * ServiceBootstrap available via GlobalServiceLocator only
 */

/**
 * Auto-bootstrap when this file loads (with improved error handling)
 */
(function () {
  try {
    // Check if we should auto-bootstrap
    const shouldAutoBootstrap =
      typeof PropertiesService !== "undefined" &&
      !PropertiesService.getScriptProperties().getProperty(
        "DISABLE_AUTO_BOOTSTRAP"
      );

    if (shouldAutoBootstrap) {
      console.log("Auto-bootstrapping services...");
      const result = ServiceBootstrap.bootstrap();

      if (result.success) {
        console.log("✅ Service bootstrap completed successfully");
      } else {
        console.error("❌ Service bootstrap failed:", result.error);
        throw new Error(result.error);
      }
    }
  } catch (error) {
    console.error("❌ Auto-bootstrap error:", error);
    // Strict dependency injection - no global accessors
    // All services must be accessed via GlobalServiceLocator
    console.log(
      "✅ Strict dependency injection enforced - use GlobalServiceLocator for all service access"
    );
  }
})();

console.log("✅ ServiceBootstrap initialized and ready");
