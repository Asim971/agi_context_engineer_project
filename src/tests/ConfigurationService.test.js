/**
 * Test Suite for Enhanced ConfigurationService
 * Comprehensive testing for validation, defaults, environment handling, and manifest integration
 * 
 * @fileoverview Test suite for ConfigurationService v2.0.0
 * @version 2.0.0
 * @author System
 * @since 2024
 */

/**
 * Test suite for ConfigurationService
 */
function runConfigurationServiceTests() {
  console.log('🧪 Starting ConfigurationService Test Suite...');
  
  const testResults = {
    passed: 0,
    failed: 0,
    total: 0,
    details: []
  };
  
  // Test helper function
  function runTest(testName, testFunction) {
    testResults.total++;
    try {
      testFunction();
      testResults.passed++;
      testResults.details.push(`✅ ${testName}`);
      console.log(`✅ ${testName}`);
    } catch (error) {
      testResults.failed++;
      testResults.details.push(`❌ ${testName}: ${error.message}`);
      console.error(`❌ ${testName}: ${error.message}`);
    }
  }
  
  // Setup test environment
  function setupTestEnvironment() {
    // Clear any existing test properties
    const properties = PropertiesService.getScriptProperties();
    const testKeys = [
      'TEST_KEY',
      'TEST_REQUIRED_KEY',
      'TEST_NUMBER_KEY',
      'TEST_BOOLEAN_KEY',
      'TEST_ENVIRONMENT',
      'ENVIRONMENT',
      'IS_TEST_ENVIRONMENT'
    ];
    
    testKeys.forEach(key => {
      try {
        properties.deleteProperty(key);
      } catch (e) {
        // Ignore if property doesn't exist
      }
    });
    
    // Set test environment
    properties.setProperty('IS_TEST_ENVIRONMENT', 'true');
  }
  
  // Cleanup test environment
  function cleanupTestEnvironment() {
    const properties = PropertiesService.getScriptProperties();
    const testKeys = [
      'TEST_KEY',
      'TEST_REQUIRED_KEY',
      'TEST_NUMBER_KEY',
      'TEST_BOOLEAN_KEY',
      'TEST_ENVIRONMENT',
      'ENVIRONMENT',
      'IS_TEST_ENVIRONMENT'
    ];
    
    testKeys.forEach(key => {
      try {
        properties.deleteProperty(key);
      } catch (e) {
        // Ignore if property doesn't exist
      }
    });
  }
  
  // Initialize test environment
  setupTestEnvironment();
  
  try {
    // Get service instance
    const serviceLocator = GlobalServiceLocator.getInstance();
    const configService = serviceLocator.get('ConfigurationService');
    
    // Test 1: Service Initialization
    runTest('Service Initialization', () => {
      if (!configService) {
        throw new Error('ConfigurationService not initialized');
      }
      if (typeof configService.get !== 'function') {
        throw new Error('ConfigurationService missing get method');
      }
    });
    
    // Test 2: Environment Detection
    runTest('Environment Detection', () => {
      const environment = configService.environment;
      if (!environment) {
        throw new Error('Environment not detected');
      }
      if (!['development', 'test', 'staging', 'production'].includes(environment)) {
        throw new Error(`Invalid environment: ${environment}`);
      }
    });
    
    // Test 3: Basic Get/Set Operations
    runTest('Basic Get/Set Operations', () => {
      configService.set('TEST_KEY', 'test_value');
      const value = configService.get('TEST_KEY');
      if (value !== 'test_value') {
        throw new Error(`Expected 'test_value', got '${value}'`);
      }
    });
    
    // Test 4: Get with Default
    runTest('Get with Default', () => {
      const defaultValue = 'default_test_value';
      const value = configService.getWithDefault('NON_EXISTENT_KEY', defaultValue);
      if (value !== defaultValue) {
        throw new Error(`Expected '${defaultValue}', got '${value}'`);
      }
    });
    
    // Test 5: Required Key Validation
    runTest('Required Key Validation', () => {
      let errorThrown = false;
      try {
        configService.getRequired('NON_EXISTENT_REQUIRED_KEY');
      } catch (error) {
        errorThrown = true;
        if (!error.message.includes('Required configuration key')) {
          throw new Error('Wrong error message for missing required key');
        }
      }
      if (!errorThrown) {
        throw new Error('Expected error for missing required key');
      }
    });
    
    // Test 6: Configuration Schema
    runTest('Configuration Schema', () => {
      const schema = configService.configSchema;
      if (!schema || typeof schema !== 'object') {
        throw new Error('Configuration schema not loaded');
      }
      if (!schema.SPREADSHEET_ID) {
        throw new Error('Required schema keys missing');
      }
    });
    
    // Test 7: Validation Framework
    runTest('Validation Framework', () => {
      // Test number validation
      configService.set('TEST_NUMBER_KEY', '123');
      const numberValue = configService.getWithDefault('TEST_NUMBER_KEY', 0, 'positiveNumber');
      if (numberValue !== '123') {
        throw new Error('Number validation failed');
      }
      
      // Test invalid number
      configService.set('TEST_NUMBER_KEY', 'invalid');
      const invalidNumber = configService.getWithDefault('TEST_NUMBER_KEY', 100, 'positiveNumber');
      if (invalidNumber !== 100) {
        throw new Error('Invalid number should return default');
      }
    });
    
    // Test 8: Environment-Specific Configuration
    runTest('Environment-Specific Configuration', () => {
      const env = configService.environment.toUpperCase();
      configService.set(`${env}_TEST_ENV_KEY`, 'env_specific_value');
      configService.set('TEST_ENV_KEY', 'general_value');
      
      const envValue = configService.getEnvironmentConfig('TEST_ENV_KEY');
      if (envValue !== 'env_specific_value') {
        throw new Error(`Expected 'env_specific_value', got '${envValue}'`);
      }
    });
    
    // Test 9: Environment Fallback
    runTest('Environment Fallback', () => {
      configService.set('TEST_FALLBACK_KEY', 'general_value');
      
      const fallbackValue = configService.getWithEnvironmentFallback('TEST_FALLBACK_KEY', 'default');
      if (fallbackValue !== 'general_value') {
        throw new Error(`Expected 'general_value', got '${fallbackValue}'`);
      }
    });
    
    // Test 10: Cache Functionality
    runTest('Cache Functionality', () => {
      // Set a value and verify it's cached
      configService.set('TEST_CACHE_KEY', 'cached_value');
      const value1 = configService.get('TEST_CACHE_KEY');
      const value2 = configService.get('TEST_CACHE_KEY');
      
      if (value1 !== value2) {
        throw new Error('Cache consistency failed');
      }
      
      // Test cache refresh
      configService.refreshCache();
      const value3 = configService.get('TEST_CACHE_KEY');
      if (value3 !== 'cached_value') {
        throw new Error('Cache refresh failed');
      }
    });
    
    // Test 11: Configuration Validation
    runTest('Configuration Validation', () => {
      const validationResults = configService.validateConfiguration();
      if (!validationResults || typeof validationResults !== 'object') {
        throw new Error('Validation results not returned');
      }
      if (!validationResults.hasOwnProperty('valid')) {
        throw new Error('Validation results missing valid property');
      }
    });
    
    // Test 12: Load Defaults
    runTest('Load Defaults', () => {
      const defaultsLoaded = configService.loadDefaults();
      if (typeof defaultsLoaded !== 'number') {
        throw new Error('Load defaults should return number');
      }
    });
    
    // Test 13: Configuration Summary
    runTest('Configuration Summary', () => {
      const summary = configService.getConfigurationSummary();
      if (!summary || typeof summary !== 'object') {
        throw new Error('Configuration summary not returned');
      }
      if (!summary.environment) {
        throw new Error('Summary missing environment');
      }
    });
    
    // Test 14: Form ID Retrieval
    runTest('Form ID Retrieval', () => {
      configService.set('ENGINEER_FORM_ID', 'test_form_id_123');
      const formId = configService.getFormId('ENGINEER');
      if (formId !== 'test_form_id_123') {
        throw new Error(`Expected 'test_form_id_123', got '${formId}'`);
      }
    });
    
    // Test 15: Spreadsheet ID Retrieval
    runTest('Spreadsheet ID Retrieval', () => {
      configService.set('MAIN_SPREADSHEET_ID', 'test_spreadsheet_id_456');
      const spreadsheetId = configService.getSpreadsheetId('MAIN');
      if (spreadsheetId !== 'test_spreadsheet_id_456') {
        throw new Error(`Expected 'test_spreadsheet_id_456', got '${spreadsheetId}'`);
      }
    });
    
    // Test 16: Test Environment Detection
    runTest('Test Environment Detection', () => {
      const isTest = configService.isTest;
      if (typeof isTest !== 'boolean') {
        throw new Error('isTest should return boolean');
      }
    });
    
    // Test 17: Error Handling
    runTest('Error Handling', () => {
      let errorHandled = false;
      try {
        // This should trigger error handling
        configService.getRequired('');
      } catch (error) {
        errorHandled = true;
      }
      if (!errorHandled) {
        throw new Error('Error handling not working');
      }
    });
    
    // Test 18: Type Validation
    runTest('Type Validation', () => {
      // Test boolean validation
      const isValidBoolean = configService._validateType('true', 'boolean');
      if (!isValidBoolean) {
        throw new Error('Boolean validation failed');
      }
      
      // Test number validation
      const isValidNumber = configService._validateType('123', 'number');
      if (!isValidNumber) {
        throw new Error('Number validation failed');
      }
    });
    
    // Test 19: Named Validators
    runTest('Named Validators', () => {
      const isValidEmail = configService._applyNamedValidator('test@example.com', 'email');
      if (!isValidEmail) {
        throw new Error('Email validation failed');
      }
      
      const isValidUrl = configService._applyNamedValidator('https://example.com', 'url');
      if (!isValidUrl) {
        throw new Error('URL validation failed');
      }
    });
    
    // Test 20: Performance Monitoring
    runTest('Performance Monitoring', () => {
      const startTime = Date.now();
      configService.get('TEST_KEY');
      const endTime = Date.now();
      
      if (endTime - startTime > 1000) {
        throw new Error('Configuration retrieval too slow');
      }
    });
    
  } catch (error) {
    console.error('Test suite setup error:', error);
    testResults.failed++;
    testResults.details.push(`❌ Test Suite Setup: ${error.message}`);
  } finally {
    // Cleanup
    cleanupTestEnvironment();
  }
  
  // Print results
  console.log('\n📊 Test Results Summary:');
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`Passed: ${testResults.passed}`);
  console.log(`Failed: ${testResults.failed}`);
  console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.details
      .filter(detail => detail.startsWith('❌'))
      .forEach(detail => console.log(detail));
  }
  
  return testResults;
}

/**
 * Run performance tests for ConfigurationService
 */
function runConfigurationPerformanceTests() {
  console.log('🚀 Starting ConfigurationService Performance Tests...');
  
  const serviceLocator = GlobalServiceLocator.getInstance();
  const configService = serviceLocator.get('ConfigurationService');
  
  const performanceResults = {
    getOperation: 0,
    setOperation: 0,
    validationOperation: 0,
    cacheOperation: 0
  };
  
  // Test get operation performance
  const getStartTime = Date.now();
  for (let i = 0; i < 100; i++) {
    configService.get('TEST_PERF_KEY');
  }
  performanceResults.getOperation = Date.now() - getStartTime;
  
  // Test set operation performance
  const setStartTime = Date.now();
  for (let i = 0; i < 100; i++) {
    configService.set(`TEST_PERF_KEY_${i}`, `value_${i}`);
  }
  performanceResults.setOperation = Date.now() - setStartTime;
  
  // Test validation performance
  const validationStartTime = Date.now();
  for (let i = 0; i < 10; i++) {
    configService.validateConfiguration();
  }
  performanceResults.validationOperation = Date.now() - validationStartTime;
  
  // Test cache performance
  const cacheStartTime = Date.now();
  for (let i = 0; i < 50; i++) {
    configService.refreshCache();
  }
  performanceResults.cacheOperation = Date.now() - cacheStartTime;
  
  console.log('\n⚡ Performance Results:');
  console.log(`Get Operations (100x): ${performanceResults.getOperation}ms`);
  console.log(`Set Operations (100x): ${performanceResults.setOperation}ms`);
  console.log(`Validation Operations (10x): ${performanceResults.validationOperation}ms`);
  console.log(`Cache Operations (50x): ${performanceResults.cacheOperation}ms`);
  
  return performanceResults;
}

/**
 * Run integration tests with other services
 */
function runConfigurationIntegrationTests() {
  console.log('🔗 Starting ConfigurationService Integration Tests...');
  
  const integrationResults = {
    passed: 0,
    failed: 0,
    total: 0
  };
  
  // Test integration with GlobalServiceLocator
  try {
    const serviceLocator = GlobalServiceLocator.getInstance();
    const configService = serviceLocator.get('ConfigurationService');
    
    if (configService && typeof configService.get === 'function') {
      integrationResults.passed++;
      console.log('✅ GlobalServiceLocator Integration');
    } else {
      integrationResults.failed++;
      console.log('❌ GlobalServiceLocator Integration');
    }
    integrationResults.total++;
  } catch (error) {
    integrationResults.failed++;
    integrationResults.total++;
    console.log(`❌ GlobalServiceLocator Integration: ${error.message}`);
  }
  
  console.log(`\n🔗 Integration Test Results: ${integrationResults.passed}/${integrationResults.total} passed`);
  
  return integrationResults;
}

// Export functions for Google Apps Script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runConfigurationServiceTests,
    runConfigurationPerformanceTests,
    runConfigurationIntegrationTests
  };
}