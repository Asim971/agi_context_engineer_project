# Configuration Service Deployment Guide

Comprehensive deployment and setup guide for ConfigurationService v2.0.0 in the Anwar Sales Ecosystem.

## Table of Contents

- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Environment Setup](#environment-setup)
- [Configuration Schema Deployment](#configuration-schema-deployment)
- [Service Registration](#service-registration)
- [Initial Configuration](#initial-configuration)
- [Validation and Testing](#validation-and-testing)
- [Production Deployment](#production-deployment)
- [Post-Deployment Verification](#post-deployment-verification)
- [Rollback Procedures](#rollback-procedures)
- [Monitoring and Maintenance](#monitoring-and-maintenance)

## Pre-Deployment Checklist

### Prerequisites

- [ ] Google Apps Script project with V8 runtime
- [ ] GlobalServiceLocator v2.0+ installed
- [ ] BaseService v2.0+ available
- [ ] Script properties access configured
- [ ] Appropriate permissions for PropertiesService

### Required Files

- [ ] `src/services/ConfigurationService.js` (v2.0.0)
- [ ] `src/config/ConfigurationSchema.js`
- [ ] `src/tests/ConfigurationService.test.js`
- [ ] Documentation files

### Dependencies Check

```javascript
// Verify dependencies are available
function checkDependencies() {
  const checks = {
    GlobalServiceLocator: typeof GlobalServiceLocator !== 'undefined',
    BaseService: typeof BaseService !== 'undefined',
    PropertiesService: typeof PropertiesService !== 'undefined',
    AppScriptError: typeof AppScriptError !== 'undefined'
  };
  
  console.log('Dependency Check:', checks);
  return Object.values(checks).every(check => check);
}
```

## Environment Setup

### 1. Environment Detection Configuration

```javascript
// Set up environment indicators
function setupEnvironment(environment = 'production') {
  const properties = PropertiesService.getScriptProperties();
  
  // Set explicit environment
  properties.setProperty('ENVIRONMENT', environment);
  
  // Environment-specific settings
  switch (environment) {
    case 'development':
      properties.setProperty('DEV_MODE', 'true');
      properties.setProperty('LOG_LEVEL', 'DEBUG');
      properties.setProperty('DEBUG_MODE', 'true');
      break;
      
    case 'test':
      properties.setProperty('IS_TEST_ENVIRONMENT', 'true');
      properties.setProperty('TEST_MODE', 'true');
      properties.setProperty('LOG_LEVEL', 'DEBUG');
      break;
      
    case 'staging':
      properties.setProperty('LOG_LEVEL', 'INFO');
      properties.setProperty('ENABLE_PERFORMANCE_LOGGING', 'true');
      break;
      
    case 'production':
      properties.setProperty('LOG_LEVEL', 'WARN');
      properties.setProperty('ENABLE_PERFORMANCE_LOGGING', 'false');
      break;
  }
  
  console.log(`Environment configured: ${environment}`);
}
```

### 2. Core Configuration Setup

```javascript
// Set up essential configurations
function setupCoreConfiguration() {
  const properties = PropertiesService.getScriptProperties();
  
  // Required configurations (replace with actual values)
  const coreConfigs = {
    'SPREADSHEET_ID': 'your-main-spreadsheet-id',
    'MAYTAPI_API_KEY': 'your-maytapi-api-key',
    'MAYTAPI_PHONE_ID': 'your-phone-instance-id',
    'ENGINEER_FORM_ID': 'your-engineer-form-id',
    'CUSTOMER_FORM_ID': 'your-customer-form-id',
    'SUPPLIER_FORM_ID': 'your-supplier-form-id'
  };
  
  // Set configurations
  Object.entries(coreConfigs).forEach(([key, value]) => {
    if (value && value !== 'your-' + key.toLowerCase().replace('_', '-')) {
      properties.setProperty(key, value);
      console.log(`✅ Set ${key}`);
    } else {
      console.warn(`⚠️  ${key} needs to be configured`);
    }
  });
}
```

## Configuration Schema Deployment

### 1. Deploy Schema File

Ensure `ConfigurationSchema.js` is included in your Google Apps Script project:

```javascript
// Verify schema is available
function verifySchema() {
  try {
    const schema = getConfigurationSchema();
    console.log(`✅ Schema loaded with ${Object.keys(schema).length} keys`);
    return true;
  } catch (error) {
    console.error('❌ Schema not available:', error.message);
    return false;
  }
}
```

### 2. Schema Validation

```javascript
// Validate schema structure
function validateSchema() {
  const schema = getConfigurationSchema();
  const requiredProperties = ['type', 'description', 'category'];
  const issues = [];
  
  Object.entries(schema).forEach(([key, config]) => {
    requiredProperties.forEach(prop => {
      if (!config.hasOwnProperty(prop)) {
        issues.push(`${key} missing ${prop}`);
      }
    });
  });
  
  if (issues.length > 0) {
    console.warn('Schema issues:', issues);
  } else {
    console.log('✅ Schema validation passed');
  }
  
  return issues.length === 0;
}
```

## Service Registration

### 1. Register with GlobalServiceLocator

```javascript
// Register ConfigurationService
function registerConfigurationService() {
  try {
    const serviceLocator = GlobalServiceLocator.getInstance();
    
    serviceLocator.register('ConfigurationService', {
      factory: () => new ConfigurationService(),
      singleton: true,
      dependencies: [],
      eager: true
    });
    
    console.log('✅ ConfigurationService registered');
    return true;
  } catch (error) {
    console.error('❌ Service registration failed:', error.message);
    return false;
  }
}
```

### 2. Verify Service Registration

```javascript
// Verify service is properly registered
function verifyServiceRegistration() {
  try {
    const serviceLocator = GlobalServiceLocator.getInstance();
    const configService = serviceLocator.get('ConfigurationService');
    
    if (configService && typeof configService.get === 'function') {
      console.log('✅ ConfigurationService available');
      console.log('Environment:', configService.environment);
      return true;
    } else {
      console.error('❌ ConfigurationService not properly initialized');
      return false;
    }
  } catch (error) {
    console.error('❌ Service verification failed:', error.message);
    return false;
  }
}
```

## Initial Configuration

### 1. Load Default Values

```javascript
// Load all default configurations
function loadDefaultConfigurations() {
  try {
    const serviceLocator = GlobalServiceLocator.getInstance();
    const configService = serviceLocator.get('ConfigurationService');
    
    const defaultsLoaded = configService.loadDefaults();
    console.log(`✅ Loaded ${defaultsLoaded} default configurations`);
    
    return defaultsLoaded;
  } catch (error) {
    console.error('❌ Failed to load defaults:', error.message);
    return 0;
  }
}
```

### 2. Environment-Specific Configuration

```javascript
// Set up environment-specific configurations
function setupEnvironmentSpecificConfig(environment) {
  const properties = PropertiesService.getScriptProperties();
  const envPrefix = environment.toUpperCase();
  
  const envConfigs = {
    development: {
      [`${envPrefix}_SPREADSHEET_ID`]: 'dev-spreadsheet-id',
      [`${envPrefix}_MAYTAPI_API_KEY`]: 'dev-api-key',
      'CACHE_TIMEOUT': '60000', // 1 minute for dev
      'LOG_LEVEL': 'DEBUG'
    },
    test: {
      [`${envPrefix}_SPREADSHEET_ID`]: 'test-spreadsheet-id',
      [`${envPrefix}_MAYTAPI_API_KEY`]: 'test-api-key',
      'CACHE_TIMEOUT': '30000', // 30 seconds for test
      'LOG_LEVEL': 'DEBUG'
    },
    production: {
      'CACHE_TIMEOUT': '300000', // 5 minutes for production
      'LOG_LEVEL': 'WARN',
      'ENABLE_PERFORMANCE_LOGGING': 'false'
    }
  };
  
  const configs = envConfigs[environment] || {};
  Object.entries(configs).forEach(([key, value]) => {
    properties.setProperty(key, value);
    console.log(`✅ Set ${environment} config: ${key}`);
  });
}
```

## Validation and Testing

### 1. Configuration Validation

```javascript
// Validate all configurations
function validateDeployedConfiguration() {
  try {
    const serviceLocator = GlobalServiceLocator.getInstance();
    const configService = serviceLocator.get('ConfigurationService');
    
    const validationResults = configService.validateConfiguration();
    
    console.log('Validation Results:');
    console.log(`Valid: ${validationResults.valid}`);
    console.log(`Errors: ${validationResults.errors.length}`);
    console.log(`Warnings: ${validationResults.warnings.length}`);
    console.log(`Missing: ${validationResults.missing.length}`);
    
    if (!validationResults.valid) {
      console.error('Validation Errors:', validationResults.errors);
      console.warn('Missing Configurations:', validationResults.missing);
    }
    
    return validationResults.valid;
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    return false;
  }
}
```

### 2. Run Test Suite

```javascript
// Execute comprehensive test suite
function runDeploymentTests() {
  console.log('🧪 Running deployment tests...');
  
  try {
    // Run main test suite
    const testResults = runConfigurationServiceTests();
    
    // Run performance tests
    const perfResults = runConfigurationPerformanceTests();
    
    // Run integration tests
    const integrationResults = runConfigurationIntegrationTests();
    
    const overallSuccess = testResults.failed === 0 && 
                          integrationResults.failed === 0;
    
    console.log('\n📊 Deployment Test Summary:');
    console.log(`Functional Tests: ${testResults.passed}/${testResults.total}`);
    console.log(`Integration Tests: ${integrationResults.passed}/${integrationResults.total}`);
    console.log(`Overall Success: ${overallSuccess ? '✅' : '❌'}`);
    
    return overallSuccess;
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    return false;
  }
}
```

## Production Deployment

### 1. Pre-Production Checklist

```javascript
// Complete pre-production verification
function preProductionChecklist() {
  const checks = {
    dependencies: checkDependencies(),
    schema: verifySchema(),
    service: verifyServiceRegistration(),
    validation: validateDeployedConfiguration(),
    tests: runDeploymentTests()
  };
  
  console.log('\n🔍 Pre-Production Checklist:');
  Object.entries(checks).forEach(([check, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${check}`);
  });
  
  const allPassed = Object.values(checks).every(check => check);
  console.log(`\n${allPassed ? '🚀' : '🚫'} Ready for production: ${allPassed}`);
  
  return allPassed;
}
```

### 2. Production Configuration

```javascript
// Set up production-specific settings
function setupProductionConfiguration() {
  const properties = PropertiesService.getScriptProperties();
  
  // Production settings
  const productionSettings = {
    'ENVIRONMENT': 'production',
    'LOG_LEVEL': 'WARN',
    'ENABLE_PERFORMANCE_LOGGING': 'false',
    'DEBUG_MODE': 'false',
    'CACHE_TIMEOUT': '300000', // 5 minutes
    'ENABLE_RATE_LIMITING': 'true',
    'STRICT_VALIDATION': 'true'
  };
  
  Object.entries(productionSettings).forEach(([key, value]) => {
    properties.setProperty(key, value);
  });
  
  console.log('✅ Production configuration applied');
}
```

### 3. Security Configuration

```javascript
// Apply security settings
function applySecurityConfiguration() {
  const properties = PropertiesService.getScriptProperties();
  
  // Security settings
  const securitySettings = {
    'ENABLE_RATE_LIMITING': 'true',
    'MAX_REQUESTS_PER_MINUTE': '60',
    'STRICT_VALIDATION': 'true',
    'VALIDATION_TIMEOUT': '5000'
  };
  
  Object.entries(securitySettings).forEach(([key, value]) => {
    properties.setProperty(key, value);
  });
  
  console.log('✅ Security configuration applied');
}
```

## Post-Deployment Verification

### 1. Health Check

```javascript
// Perform post-deployment health check
function postDeploymentHealthCheck() {
  console.log('🏥 Performing health check...');
  
  try {
    const serviceLocator = GlobalServiceLocator.getInstance();
    const configService = serviceLocator.get('ConfigurationService');
    
    // Basic functionality test
    const testKey = 'HEALTH_CHECK_' + Date.now();
    configService.set(testKey, 'test_value');
    const retrievedValue = configService.get(testKey);
    
    if (retrievedValue !== 'test_value') {
      throw new Error('Basic get/set functionality failed');
    }
    
    // Environment detection
    const environment = configService.environment;
    if (!environment) {
      throw new Error('Environment detection failed');
    }
    
    // Configuration summary
    const summary = configService.getConfigurationSummary();
    if (!summary || !summary.environment) {
      throw new Error('Configuration summary failed');
    }
    
    console.log('✅ Health check passed');
    console.log('Environment:', environment);
    console.log('Cache size:', summary.cacheSize);
    
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}
```

### 2. Performance Verification

```javascript
// Verify performance meets requirements
function verifyPerformance() {
  console.log('⚡ Verifying performance...');
  
  const perfResults = runConfigurationPerformanceTests();
  
  // Performance thresholds (in milliseconds)
  const thresholds = {
    getOperation: 1000,    // 100 get operations should complete in < 1s
    setOperation: 2000,    // 100 set operations should complete in < 2s
    validationOperation: 5000, // 10 validations should complete in < 5s
    cacheOperation: 1000   // 50 cache operations should complete in < 1s
  };
  
  const performanceIssues = [];
  Object.entries(thresholds).forEach(([operation, threshold]) => {
    if (perfResults[operation] > threshold) {
      performanceIssues.push(`${operation}: ${perfResults[operation]}ms > ${threshold}ms`);
    }
  });
  
  if (performanceIssues.length > 0) {
    console.warn('⚠️  Performance issues detected:', performanceIssues);
    return false;
  } else {
    console.log('✅ Performance verification passed');
    return true;
  }
}
```

## Rollback Procedures

### 1. Configuration Backup

```javascript
// Backup current configuration
function backupConfiguration() {
  try {
    const properties = PropertiesService.getScriptProperties();
    const allProperties = properties.getProperties();
    
    // Store backup with timestamp
    const backupKey = 'CONFIG_BACKUP_' + Date.now();
    const backupData = JSON.stringify(allProperties);
    
    // Note: In production, consider storing backup in Drive or external storage
    console.log('Configuration backup created:', backupKey);
    console.log('Backup size:', backupData.length, 'characters');
    
    return { key: backupKey, data: backupData };
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    return null;
  }
}
```

### 2. Rollback to Previous Version

```javascript
// Rollback to previous configuration
function rollbackConfiguration(backupData) {
  try {
    const properties = PropertiesService.getScriptProperties();
    
    // Clear current properties
    properties.deleteAllProperties();
    
    // Restore from backup
    const configData = JSON.parse(backupData);
    properties.setProperties(configData);
    
    console.log('✅ Configuration rolled back successfully');
    return true;
  } catch (error) {
    console.error('❌ Rollback failed:', error.message);
    return false;
  }
}
```

## Monitoring and Maintenance

### 1. Configuration Monitoring

```javascript
// Monitor configuration health
function monitorConfiguration() {
  try {
    const serviceLocator = GlobalServiceLocator.getInstance();
    const configService = serviceLocator.get('ConfigurationService');
    
    const summary = configService.getConfigurationSummary();
    const validation = configService.validateConfiguration();
    
    const report = {
      timestamp: new Date().toISOString(),
      environment: summary.environment,
      cacheSize: summary.cacheSize,
      schemaKeys: summary.schemaKeys,
      configuredKeys: summary.configuredKeys.length,
      validationStatus: validation.valid,
      errors: validation.errors.length,
      warnings: validation.warnings.length,
      missing: validation.missing.length
    };
    
    console.log('📊 Configuration Monitor Report:', report);
    
    // Alert on issues
    if (!validation.valid || validation.errors.length > 0) {
      console.warn('🚨 Configuration issues detected!');
    }
    
    return report;
  } catch (error) {
    console.error('❌ Monitoring failed:', error.message);
    return null;
  }
}
```

### 2. Maintenance Tasks

```javascript
// Perform routine maintenance
function performMaintenance() {
  console.log('🔧 Performing maintenance...');
  
  try {
    const serviceLocator = GlobalServiceLocator.getInstance();
    const configService = serviceLocator.get('ConfigurationService');
    
    // Clear cache
    configService.refreshCache();
    
    // Load any new defaults
    const defaultsLoaded = configService.loadDefaults();
    
    // Validate configuration
    const validation = configService.validateConfiguration();
    
    console.log('✅ Maintenance completed');
    console.log(`Defaults loaded: ${defaultsLoaded}`);
    console.log(`Validation status: ${validation.valid}`);
    
    return true;
  } catch (error) {
    console.error('❌ Maintenance failed:', error.message);
    return false;
  }
}
```

## Complete Deployment Script

```javascript
// Complete deployment automation
function deployConfigurationService(environment = 'production') {
  console.log(`🚀 Starting ConfigurationService deployment for ${environment}...`);
  
  const steps = [
    { name: 'Check Dependencies', fn: () => checkDependencies() },
    { name: 'Setup Environment', fn: () => setupEnvironment(environment) },
    { name: 'Setup Core Configuration', fn: () => setupCoreConfiguration() },
    { name: 'Verify Schema', fn: () => verifySchema() },
    { name: 'Register Service', fn: () => registerConfigurationService() },
    { name: 'Verify Service', fn: () => verifyServiceRegistration() },
    { name: 'Load Defaults', fn: () => loadDefaultConfigurations() > 0 },
    { name: 'Setup Environment Config', fn: () => setupEnvironmentSpecificConfig(environment) },
    { name: 'Validate Configuration', fn: () => validateDeployedConfiguration() },
    { name: 'Run Tests', fn: () => runDeploymentTests() },
    { name: 'Health Check', fn: () => postDeploymentHealthCheck() },
    { name: 'Performance Check', fn: () => verifyPerformance() }
  ];
  
  const results = [];
  let allPassed = true;
  
  for (const step of steps) {
    console.log(`\n🔄 ${step.name}...`);
    try {
      const result = step.fn();
      results.push({ step: step.name, passed: result });
      if (!result) {
        allPassed = false;
        console.error(`❌ ${step.name} failed`);
      } else {
        console.log(`✅ ${step.name} passed`);
      }
    } catch (error) {
      allPassed = false;
      results.push({ step: step.name, passed: false, error: error.message });
      console.error(`❌ ${step.name} error:`, error.message);
    }
  }
  
  console.log('\n📊 Deployment Summary:');
  results.forEach(result => {
    console.log(`${result.passed ? '✅' : '❌'} ${result.step}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log(`\n${allPassed ? '🎉' : '🚫'} Deployment ${allPassed ? 'successful' : 'failed'}`);
  
  return allPassed;
}
```

## Usage

```javascript
// Deploy to different environments
deployConfigurationService('development');
deployConfigurationService('test');
deployConfigurationService('production');

// Monitor after deployment
monitorConfiguration();

// Perform maintenance
performMaintenance();
```

---

**Version**: 2.0.0  
**Last Updated**: 2024  
**Compatibility**: Google Apps Script Runtime V8+