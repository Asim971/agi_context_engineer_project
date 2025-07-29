/**
 * 00_GlobalServiceLocator.js
 * Google Apps Script Service Locator & Dependency Injection Container
 * 
 * CRITICAL: This file MUST load first (00_ prefix ensures loading order)
 * Resolves global scope dependency issues in Google Apps Script V8 runtime
 * 
 * @fileoverview Service Locator Pattern for Google Apps Script dependency injection
 * @version 1.0.0
 * @author Google Apps Script Service Initialization Troubleshooter Agent
 */

/**
 * Global Service Locator - Centralized dependency injection container
 * Ensures all services are available in Google Apps Script global execution context
 */
var GlobalServiceLocator = (function() {
  'use strict';
  
  // Private service registry
  const services = new Map();
  const singletons = new Map();
  const initializedServices = new Set();
  
  // Service initialization queue for proper dependency ordering
  const initializationQueue = [];
  let isInitializing = false;
  
  // Debug logging utility
  function log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      component: 'GlobalServiceLocator',
      message,
      ...data
    };
    
    if (level === 'error') {
      console.error(`[${timestamp}] GSL-ERROR: ${message}`, data);
    } else if (level === 'warn') {
      console.warn(`[${timestamp}] GSL-WARN: ${message}`, data);
    } else {
      console.log(`[${timestamp}] GSL-${level.toUpperCase()}: ${message}`, data);
    }
  }
  
  return {
    /**
     * Register a service class for dependency injection
     * @param {string} name - Service name
     * @param {Function} serviceClass - Service constructor
     * @param {Object} options - Registration options
     */
    register(name, serviceClass, options = {}) {
      const config = {
        singleton: options.singleton !== false, // Default to singleton
        dependencies: options.dependencies || [],
        factory: options.factory || null,
        eager: options.eager || false,
        ...options
      };
      
      services.set(name, {
        serviceClass,
        config,
        instance: null
      });
      
      log('info', `Service registered: ${name}`, { 
        singleton: config.singleton,
        dependencies: config.dependencies,
        eager: config.eager
      });
      
      // If eager loading, queue for immediate initialization
      if (config.eager) {
        initializationQueue.push(name);
      }
      
      return this;
    },
    
    /**
     * Get service instance with dependency injection
     * @param {string} name - Service name
     * @returns {Object} Service instance
     */
    get(name) {
      // Check singleton cache first
      if (singletons.has(name)) {
        return singletons.get(name);
      }
      
      const serviceDefinition = services.get(name);
      if (!serviceDefinition) {
        const error = new Error(`Service '${name}' not registered in GlobalServiceLocator`);
        log('error', `Service not found: ${name}`, { 
          availableServices: Array.from(services.keys()) 
        });
        throw error;
      }
      
      try {
        const instance = this.createInstance(name, serviceDefinition);
        
        // Cache singleton instances
        if (serviceDefinition.config.singleton) {
          singletons.set(name, instance);
        }
        
        initializedServices.add(name);
        log('info', `Service instantiated: ${name}`);
        
        return instance;
      } catch (error) {
        log('error', `Failed to instantiate service: ${name}`, {
          error: error.message,
          stack: error.stack
        });
        throw new Error(`Service instantiation failed for '${name}': ${error.message}`);
      }
    },
    
    /**
     * Create service instance with dependency resolution
     * @param {string} name - Service name
     * @param {Object} serviceDefinition - Service definition
     * @returns {Object} Service instance
     */
    createInstance(name, serviceDefinition) {
      const { serviceClass, config } = serviceDefinition;
      
      // Prevent circular dependencies
      if (isInitializing) {
        throw new Error(`Circular dependency detected during initialization of '${name}'`);
      }
      
      // Use custom factory if provided
      if (config.factory) {
        return config.factory(this);
      }
      
      // Resolve dependencies
      const dependencies = [];
      if (config.dependencies && config.dependencies.length > 0) {
        isInitializing = true;
        try {
          for (const depName of config.dependencies) {
            dependencies.push(this.get(depName));
          }
        } finally {
          isInitializing = false;
        }
      }
      
      // Create instance with resolved dependencies
      if (dependencies.length === 0) {
        return new serviceClass();
      } else {
        return new serviceClass(...dependencies);
      }
    },
    
    /**
     * Check if service is registered
     * @param {string} name - Service name
     * @returns {boolean} Registration status
     */
    has(name) {
      return services.has(name);
    },
    
    /**
     * Initialize all registered services (especially eager ones)
     */
    initializeAll() {
      log('info', 'Initializing all registered services');
      
      // Initialize eager services first
      for (const serviceName of initializationQueue) {
        try {
          this.get(serviceName);
        } catch (error) {
          log('error', `Failed to initialize eager service: ${serviceName}`, {
            error: error.message
          });
        }
      }
      
      log('info', 'Service initialization complete', {
        totalServices: services.size,
        initializedServices: initializedServices.size
      });
    },
    
    /**
     * Get service registry status for debugging
     * @returns {Object} Registry status
     */
    getStatus() {
      return {
        registeredServices: Array.from(services.keys()),
        initializedServices: Array.from(initializedServices),
        singletonCount: singletons.size,
        queuedServices: [...initializationQueue]
      };
    },
    
    /**
     * Clear all services (for testing)
     */
    clear() {
      services.clear();
      singletons.clear();
      initializedServices.clear();
      initializationQueue.length = 0;
      log('info', 'Service locator cleared');
    }
  };
})();

/**
 * Global scope registration for Google Apps Script compatibility
 * Ensures GlobalServiceLocator is available across all execution contexts
 */
if (typeof globalThis !== 'undefined') {
  globalThis.GlobalServiceLocator = GlobalServiceLocator;
}

// Also register on global scope for legacy compatibility
if (typeof global !== 'undefined') {
  global.GlobalServiceLocator = GlobalServiceLocator;
}

console.log('✅ GlobalServiceLocator initialized and registered in global scope');
