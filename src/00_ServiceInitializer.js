/**
 * 00_ServiceInitializer.js
 * Service initialization and dependency management for Anwar Sales Ecosystem
 * 
 * This file is prefixed with "00_" to ensure it loads first in Google Apps Script
 * Provides centralized service initialization and dependency validation
 * 
 * @fileoverview Service loading order management and validation
 * @version 1.0.0
 */

/**
 * Global service initialization function
 * Must be called before using any services to ensure proper loading order
 * 
 * @returns {Object} Initialization status and diagnostics
 */
function initializeServices() {
  const startTime = Date.now();
  const diagnostics = {
    timestamp: new Date().toISOString(),
    loadingOrder: [],
    services: {},
    errors: [],
    warnings: []
  };

  try {
    console.log('=== Anwar Sales Ecosystem Service Initialization ===');
    
    // Phase 1: Validate core dependencies
    console.log('Phase 1: Core dependency validation...');
    
    const coreServices = ['BaseService', 'Config', 'Logger'];
    for (const serviceName of coreServices) {
      try {
        // Check global scope - Google Apps Script doesn't have window object
        const isAvailable = (typeof globalThis !== 'undefined' && typeof globalThis[serviceName] !== 'undefined') ||
                           (typeof global !== 'undefined' && typeof global[serviceName] !== 'undefined') ||
                           (typeof eval(serviceName) !== 'undefined');
        
        if (isAvailable) {
          diagnostics.services[serviceName] = 'available';
          diagnostics.loadingOrder.push(serviceName);
          console.log(`✓ ${serviceName} loaded successfully`);
        } else {
          diagnostics.services[serviceName] = 'missing';
          diagnostics.errors.push(`${serviceName} not found in global scope`);
          console.error(`✗ ${serviceName} not available`);
        }
      } catch (error) {
        diagnostics.services[serviceName] = 'error';
        diagnostics.errors.push(`${serviceName} validation failed: ${error.message}`);
        console.error(`✗ ${serviceName} validation error:`, error);
      }
    }
    
    // Phase 2: Initialize service dependencies
    console.log('Phase 2: Service dependency initialization...');
    
    // Validate BaseService before proceeding
    if (typeof BaseService === 'undefined') {
      console.warn('⚠️ BaseService not found, attempting emergency creation...');
      // Try to create emergency BaseService if not available
      try {
        if (typeof createEmergencyBaseService === 'function') {
          createEmergencyBaseService();
          console.log('✅ Emergency BaseService created successfully');
        } else {
          console.error('❌ Emergency BaseService creation function not available');
          const error = new Error('BaseService not available and cannot be created. Check file loading order.');
          diagnostics.errors.push(error.message);
          // Don't throw, just log and continue
          console.error('Continuing without BaseService...');
        }
      } catch (emergencyError) {
        console.error('❌ Emergency BaseService creation failed:', emergencyError);
        diagnostics.errors.push(`Emergency BaseService creation failed: ${emergencyError.message}`);
      }
    } else {
      console.log('✅ BaseService is available');
    }
    
    // Initialize global service registry if needed
    if (typeof serviceRegistry === 'undefined') {
      diagnostics.warnings.push('ServiceRegistry not available - using direct instantiation');
    }
    
    // Phase 3: Database service validation
    console.log('Phase 3: Database service validation...');
    
    try {
      if (typeof DatabaseService !== 'undefined') {
        diagnostics.services['DatabaseService'] = 'available';
        diagnostics.loadingOrder.push('DatabaseService');
        console.log('✓ DatabaseService class available');
        
        // Test instantiation
        const testDB = new DatabaseService(true);
        diagnostics.services['DatabaseService'] = 'instantiable';
        console.log('✓ DatabaseService instantiation successful');
      } else {
        diagnostics.services['DatabaseService'] = 'missing';
        diagnostics.errors.push('DatabaseService class not found');
        console.error('✗ DatabaseService not available');
      }
    } catch (error) {
      diagnostics.services['DatabaseService'] = 'error';
      diagnostics.errors.push(`DatabaseService instantiation failed: ${error.message}`);
      console.error('✗ DatabaseService instantiation failed:', error);
    }
    
    // Phase 4: Global function validation
    console.log('Phase 4: Global function validation...');
    
    const globalFunctions = ['getGlobalDB', 'setup', 'healthCheck'];
    for (const funcName of globalFunctions) {
      try {
        // Check global scope safely - Google Apps Script doesn't have window object
        const isAvailable = (typeof globalThis !== 'undefined' && typeof globalThis[funcName] === 'function') ||
                           (typeof global !== 'undefined' && typeof global[funcName] === 'function') ||
                           (typeof eval(`typeof ${funcName}`) !== 'undefined' && typeof eval(funcName) === 'function');
        
        if (isAvailable) {
          diagnostics.services[funcName] = 'available';
          console.log(`✓ ${funcName} function available`);
        } else {
          diagnostics.services[funcName] = 'missing';
          diagnostics.warnings.push(`${funcName} function not found`);
          console.warn(`⚠ ${funcName} function not available`);
        }
      } catch (error) {
        diagnostics.services[funcName] = 'missing';
        diagnostics.warnings.push(`${funcName} function validation failed: ${error.message}`);
        console.warn(`⚠ ${funcName} function not available:`, error);
      }
    }
    
    // Calculate initialization time
    const initTime = Date.now() - startTime;
    diagnostics.initializationTime = `${initTime}ms`;
    
    // Log summary
    const successCount = Object.values(diagnostics.services).filter(status => 
      status === 'available' || status === 'instantiable'
    ).length;
    const totalServices = Object.keys(diagnostics.services).length;
    
    console.log(`=== Initialization Complete in ${initTime}ms ===`);
    console.log(`Services: ${successCount}/${totalServices} successful`);
    console.log(`Errors: ${diagnostics.errors.length}`);
    console.log(`Warnings: ${diagnostics.warnings.length}`);
    
    if (diagnostics.errors.length === 0) {
      console.log('🎉 All critical services initialized successfully!');
      return { success: true, diagnostics };
    } else {
      console.warn('⚠️ Service initialization completed with errors');
      return { success: false, diagnostics };
    }
    
  } catch (error) {
    diagnostics.errors.push(`Service initialization failed: ${error.message}`);
    console.error('💥 Service initialization failed:', error);
    
    return { 
      success: false, 
      error: error.message,
      diagnostics 
    };
  }
}

/**
 * Service dependency validator
 * Checks if all required services are available before operations
 * 
 * @param {Array<string>} requiredServices - List of required service names
 * @returns {Object} Validation result with missing services
 */
function validateServiceDependencies(requiredServices = []) {
  const missing = [];
  const available = [];
  
  for (const serviceName of requiredServices) {
    if (typeof globalThis[serviceName] !== 'undefined' || typeof window[serviceName] !== 'undefined') {
      available.push(serviceName);
    } else {
      missing.push(serviceName);
    }
  }
  
  return {
    valid: missing.length === 0,
    available,
    missing,
    message: missing.length > 0 ? 
      `Missing required services: ${missing.join(', ')}` : 
      'All required services available'
  };
}

/**
 * Service health check function
 * Performs comprehensive health check of all services
 * 
 * @returns {Object} Health status for all services
 */
function performServiceHealthCheck() {
  console.log('=== Service Health Check ===');
  
  const healthStatus = {
    timestamp: new Date().toISOString(),
    overall: 'unknown',
    services: {},
    recommendations: []
  };
  
  // Check BaseService
  try {
    if (typeof BaseService !== 'undefined') {
      const testBase = new BaseService();
      healthStatus.services.BaseService = 'healthy';
    } else {
      healthStatus.services.BaseService = 'unavailable';
      healthStatus.recommendations.push('BaseService is not loaded - check file loading order');
    }
  } catch (error) {
    healthStatus.services.BaseService = 'error';
    healthStatus.recommendations.push(`BaseService error: ${error.message}`);
  }
  
  // Check DatabaseService
  try {
    if (typeof DatabaseService !== 'undefined') {
      const testDB = new DatabaseService(true);
      healthStatus.services.DatabaseService = 'healthy';
    } else {
      healthStatus.services.DatabaseService = 'unavailable';
      healthStatus.recommendations.push('DatabaseService is not loaded');
    }
  } catch (error) {
    healthStatus.services.DatabaseService = 'error';
    healthStatus.recommendations.push(`DatabaseService error: ${error.message}`);
  }
  
  // Check global DB function
  try {
    if (typeof getGlobalDB === 'function') {
      const globalDB = getGlobalDB();
      healthStatus.services.getGlobalDB = 'healthy';
    } else {
      healthStatus.services.getGlobalDB = 'unavailable';
    }
  } catch (error) {
    healthStatus.services.getGlobalDB = 'error';
    healthStatus.recommendations.push(`getGlobalDB error: ${error.message}`);
  }
  
  // Determine overall health
  const serviceStatuses = Object.values(healthStatus.services);
  const healthyCount = serviceStatuses.filter(status => status === 'healthy').length;
  const totalCount = serviceStatuses.length;
  
  if (healthyCount === totalCount) {
    healthStatus.overall = 'healthy';
  } else if (healthyCount > totalCount / 2) {
    healthStatus.overall = 'degraded';
  } else {
    healthStatus.overall = 'unhealthy';
  }
  
  console.log(`Overall health: ${healthStatus.overall} (${healthyCount}/${totalCount} services healthy)`);
  
  return healthStatus;
}

// Ensure functions are globally accessible
if (typeof globalThis !== 'undefined') {
  globalThis.initializeServices = initializeServices;
  globalThis.validateServiceDependencies = validateServiceDependencies;
  globalThis.performServiceHealthCheck = performServiceHealthCheck;
}

// Auto-initialize services when this file loads
// Wrapped in try-catch to prevent blocking other file loads
try {
  console.log('🚀 Auto-initializing services...');
  const initResult = initializeServices();
  
  if (initResult.success) {
    console.log('✅ Services auto-initialized successfully');
  } else {
    console.warn('⚠️ Service auto-initialization completed with issues:', initResult.diagnostics.errors);
  }
} catch (error) {
  console.error('❌ Service auto-initialization failed:', error);
  // Don't throw - allow other files to continue loading
}

/**
 * Emergency service recovery function
 * Attempts to recover from service initialization failures
 */
function emergencyServiceRecovery() {
  console.log('🚨 Emergency Service Recovery Initiated');
  
  try {
    // Try to manually load BaseService if missing
    if (typeof BaseService === 'undefined') {
      console.error('BaseService missing - manual recovery required');
      return {
        success: false,
        message: 'BaseService missing - check BaseService.js file loading'
      };
    }
    
    // Try to create fallback services
    const recovery = {
      BaseService: typeof BaseService !== 'undefined',
      DatabaseService: false
    };
    
    if (typeof DatabaseService !== 'undefined') {
      try {
        const testDB = new DatabaseService(true);
        recovery.DatabaseService = true;
      } catch (error) {
        console.error('DatabaseService recovery failed:', error);
      }
    }
    
    return {
      success: recovery.BaseService && recovery.DatabaseService,
      recovery
    };
    
  } catch (error) {
    console.error('Emergency recovery failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Make emergency recovery globally available
if (typeof globalThis !== 'undefined') {
  globalThis.emergencyServiceRecovery = emergencyServiceRecovery;
}
