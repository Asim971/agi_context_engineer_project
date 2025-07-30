# ConfigurationService v2.0.0 Documentation

Comprehensive configuration management service with robust validation, environment-aware defaults, and manifest integration for the Anwar Sales Ecosystem.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Advanced Features](#advanced-features)
- [Configuration Schema](#configuration-schema)
- [Environment Management](#environment-management)
- [Validation Framework](#validation-framework)
- [Performance Optimization](#performance-optimization)
- [Best Practices](#best-practices)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)

## Overview

The ConfigurationService provides a centralized, type-safe, and environment-aware configuration management system for Google Apps Script applications. It features comprehensive validation, intelligent defaults, caching, and manifest-based configuration.

### Key Benefits

- **Type Safety**: Comprehensive validation with custom validators
- **Environment Awareness**: Automatic environment detection and configuration
- **Performance**: Built-in caching and optimization
- **Flexibility**: Support for multiple configuration sources
- **Reliability**: Robust error handling and fallback mechanisms
- **Security**: Sensitive data protection and validation

## Features

### Core Features

- ✅ **Robust Default Fallbacks**: Intelligent default value management
- ✅ **Comprehensive Validation**: Type checking and custom validators
- ✅ **Environment-Aware Configuration**: Automatic environment detection
- ✅ **Manifest Integration**: Google Apps Script manifest support
- ✅ **Performance Caching**: Intelligent caching with TTL
- ✅ **Error Handling**: Comprehensive error management
- ✅ **Security**: Sensitive data protection

### Advanced Features

- 🔧 **Schema-Based Configuration**: Structured configuration definitions
- 🔧 **Multi-Environment Support**: Development, test, staging, production
- 🔧 **Validation Framework**: Built-in and custom validators
- 🔧 **Performance Monitoring**: Built-in performance tracking
- 🔧 **Configuration Summary**: Debugging and monitoring tools

## Installation

The ConfigurationService is automatically registered with the GlobalServiceLocator:

```javascript
// Get service instance
const serviceLocator = GlobalServiceLocator.getInstance();
const configService = serviceLocator.get('ConfigurationService');
```

## Basic Usage

### Getting Configuration Values

```javascript
// Basic get operation
const apiKey = configService.get('MAYTAPI_API_KEY');

// Get with default value
const timeout = configService.getWithDefault('REQUEST_TIMEOUT', 30000);

// Get required value (throws error if missing)
const spreadsheetId = configService.getRequired('SPREADSHEET_ID');
```

### Setting Configuration Values

```javascript
// Set configuration value
configService.set('LOG_LEVEL', 'DEBUG');

// Set environment-specific value
configService.set('TEST_SPREADSHEET_ID', 'test-sheet-id-123');
```

### Environment-Aware Configuration

```javascript
// Get environment-specific configuration
const envConfig = configService.getEnvironmentConfig('SPREADSHEET_ID');

// Get with environment fallback
const config = configService.getWithEnvironmentFallback('API_ENDPOINT', 'https://api.default.com');
```

## Advanced Features

### Configuration Validation

```javascript
// Validate all configurations
const validationResults = configService.validateConfiguration();
if (!validationResults.valid) {
  console.error('Configuration errors:', validationResults.errors);
}

// Load default values for missing configurations
const defaultsLoaded = configService.loadDefaults();
console.log(`Loaded ${defaultsLoaded} default configurations`);
```

### Configuration with Validation

```javascript
// Get value with validation
const email = configService.getWithDefault(
  'NOTIFICATION_EMAIL',
  'admin@example.com',
  'email'
);

// Custom validator function
const customValidator = (value) => value.length > 10;
const apiKey = configService.getWithDefault(
  'API_KEY',
  null,
  customValidator
);
```

### Cache Management

```javascript
// Refresh configuration cache
configService.refreshCache();

// Get configuration summary (includes cache info)
const summary = configService.getConfigurationSummary();
console.log('Cache size:', summary.cacheSize);
```

## Configuration Schema

The service uses a comprehensive schema defined in `ConfigurationSchema.js`:

```javascript
// Example schema entry
SPREADSHEET_ID: {
  type: 'string',
  required: true,
  validator: 'spreadsheetId',
  description: 'Main spreadsheet ID for data storage',
  category: 'core'
}
```

### Schema Properties

- **type**: Data type (string, number, boolean, array, object)
- **required**: Whether the configuration is required
- **default**: Default value if not set
- **validator**: Validation function or validator name
- **enum**: Allowed values for enumeration
- **min/max**: Range validation for numbers
- **description**: Human-readable description
- **category**: Configuration category
- **sensitive**: Whether the value contains sensitive data

## Environment Management

### Environment Detection

The service automatically detects the current environment:

```javascript
// Get current environment
const environment = configService.environment;
console.log('Current environment:', environment);

// Check if in test environment
if (configService.isTest) {
  console.log('Running in test mode');
}
```

### Environment-Specific Configuration

Configuration keys can be prefixed with environment names:

```javascript
// Environment-specific keys
// PRODUCTION_SPREADSHEET_ID
// TEST_SPREADSHEET_ID
// DEVELOPMENT_SPREADSHEET_ID

// Automatic environment resolution
const spreadsheetId = configService.getWithEnvironmentFallback('SPREADSHEET_ID');
```

### Environment Indicators

The service checks for these environment indicators:

- **Test Environment**: `IS_TEST_ENVIRONMENT`, `TEST_MODE`, `TESTING`, `DEBUG_MODE`
- **Development Environment**: `DEV_MODE`, `DEVELOPMENT`
- **Explicit Setting**: `ENVIRONMENT` property
- **Default**: `production`

## Validation Framework

### Built-in Validators

```javascript
// Available built-in validators
const validators = {
  'url': 'https://example.com',
  'email': 'user@example.com',
  'spreadsheetId': '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
  'formId': '1FAIpQLSe4B5W8q9X...',
  'apiKey': 'minimum-10-chars',
  'positiveNumber': '123'
};
```

### Custom Validators

```javascript
// Function validator
const customValidator = (value) => {
  return value.startsWith('prefix_') && value.length > 10;
};

const config = configService.getWithDefault(
  'CUSTOM_KEY',
  'prefix_default',
  customValidator
);
```

### Type Validation

```javascript
// Type validation examples
configService._validateType('123', 'number');     // true
configService._validateType('true', 'boolean');   // true
configService._validateType('[1,2,3]', 'array'); // true
configService._validateType('{"a":1}', 'object'); // true
```

## Performance Optimization

### Caching Strategy

- **Automatic Caching**: All configuration values are cached
- **Environment-Aware**: Cache keys include environment prefix
- **Cache Invalidation**: Automatic cache clearing on set operations
- **TTL Support**: Configurable cache timeout

### Performance Monitoring

```javascript
// Built-in performance monitoring
const summary = configService.getConfigurationSummary();
console.log('Performance metrics:', {
  cacheSize: summary.cacheSize,
  schemaKeys: summary.schemaKeys,
  environment: summary.environment
});
```

### Optimization Tips

1. **Use Caching**: Leverage built-in caching for frequently accessed values
2. **Batch Operations**: Group configuration changes together
3. **Environment Awareness**: Use environment-specific configurations
4. **Validation**: Use appropriate validators to prevent invalid data

## Best Practices

### Configuration Organization

```javascript
// Group related configurations
const apiConfig = {
  key: configService.getRequired('MAYTAPI_API_KEY'),
  phoneId: configService.getRequired('MAYTAPI_PHONE_ID'),
  timeout: configService.getWithDefault('API_TIMEOUT', 30000)
};
```

### Error Handling

```javascript
try {
  const criticalConfig = configService.getRequired('CRITICAL_SETTING');
  // Use configuration
} catch (error) {
  console.error('Critical configuration missing:', error.message);
  // Handle gracefully
}
```

### Environment-Specific Defaults

```javascript
// Use environment-aware defaults
const logLevel = configService.getWithEnvironmentFallback(
  'LOG_LEVEL',
  configService.isTest ? 'DEBUG' : 'INFO'
);
```

### Security Considerations

```javascript
// Never log sensitive configurations
const summary = configService.getConfigurationSummary();
// Sensitive values are automatically redacted in summary

// Use validation for security
const apiKey = configService.getWithDefault(
  'API_KEY',
  null,
  'apiKey' // Validates minimum length
);
```

## API Reference

### Core Methods

#### `get(key: string): string | null`
Retrieves a configuration value with caching and environment awareness.

#### `set(key: string, value: string): void`
Sets a configuration value and clears related cache.

#### `getRequired(key: string): string`
Retrieves a required configuration value, throws error if missing.

#### `getWithDefault(key: string, defaultValue: any, validator?: Function | string): any`
Retrieves a configuration value with default fallback and optional validation.

### Environment Methods

#### `getEnvironmentConfig(key: string): any`
Retrieves environment-specific configuration.

#### `getWithEnvironmentFallback(key: string, defaultValue?: any): any`
Retrieves configuration with environment fallback.

### Validation Methods

#### `validateConfiguration(): Object`
Validates all configurations against schema.

#### `loadDefaults(): number`
Loads default values for missing configurations.

### Utility Methods

#### `refreshCache(): void`
Clears the configuration cache.

#### `getConfigurationSummary(): Object`
Returns configuration summary for debugging.

#### `getFormId(formName: string): string`
Retrieves form ID for specified form name.

#### `getSpreadsheetId(sheetName: string): string`
Retrieves spreadsheet ID for specified sheet name.

### Properties

#### `environment: string`
Current detected environment.

#### `isTest: boolean`
Whether running in test environment.

#### `configSchema: Object`
Configuration schema definition.

## Troubleshooting

### Common Issues

#### Configuration Not Found
```javascript
// Problem: Required configuration missing
// Solution: Check if key exists and load defaults
const validationResults = configService.validateConfiguration();
if (validationResults.missing.length > 0) {
  console.log('Missing configurations:', validationResults.missing);
  configService.loadDefaults();
}
```

#### Validation Failures
```javascript
// Problem: Configuration fails validation
// Solution: Check validation results and fix values
const results = configService.validateConfiguration();
if (!results.valid) {
  console.error('Validation errors:', results.errors);
  // Fix invalid configurations
}
```

#### Performance Issues
```javascript
// Problem: Slow configuration access
// Solution: Check cache and optimize access patterns
const summary = configService.getConfigurationSummary();
if (summary.cacheSize === 0) {
  console.warn('Cache not being utilized');
}
```

#### Environment Detection Issues
```javascript
// Problem: Wrong environment detected
// Solution: Set explicit environment
configService.set('ENVIRONMENT', 'test');
// Or use environment indicators
configService.set('IS_TEST_ENVIRONMENT', 'true');
```

### Debug Mode

```javascript
// Enable debug mode for detailed logging
configService.set('DEBUG_MODE', 'true');
configService.set('LOG_LEVEL', 'DEBUG');

// Get detailed summary
const summary = configService.getConfigurationSummary();
console.log('Debug summary:', summary);
```

### Testing Configuration

```javascript
// Run comprehensive tests
runConfigurationServiceTests();

// Run performance tests
runConfigurationPerformanceTests();

// Run integration tests
runConfigurationIntegrationTests();
```

## Migration Guide

### From v1.x to v2.0

1. **Update Service Registration**: No changes required
2. **Update Method Calls**: New methods available, existing methods unchanged
3. **Add Schema**: Include ConfigurationSchema.js
4. **Update Tests**: Use new test suite
5. **Environment Setup**: Configure environment indicators

### Breaking Changes

- None - v2.0 is fully backward compatible

### New Features to Adopt

1. Use `getWithDefault()` instead of manual default handling
2. Implement `validateConfiguration()` in startup routines
3. Use environment-aware configuration methods
4. Leverage built-in validators for data integrity

---

**Version**: 2.0.0  
**Last Updated**: 2024  
**Compatibility**: Google Apps Script Runtime V8+