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
        const isAvailable = GlobalServiceLocator.has(serviceName);
        
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
    if (!GlobalServiceLocator.has('BaseService')) {
      throw new Error('BaseService not registered in GlobalServiceLocator.');
    }
    
    // Initialize global service registry if needed
    
    
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
        const isAvailable = typeof eval(funcName) === 'function';
        
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
    if (GlobalServiceLocator.has(serviceName)) {
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
