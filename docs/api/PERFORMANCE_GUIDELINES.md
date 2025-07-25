# Anwar Sales Management System - Performance Guidelines

## Table of Contents

1. [Overview](#overview)
2. [Performance Objectives](#performance-objectives)
3. [Google Apps Script Optimization](#google-apps-script-optimization)
4. [Google Sheets Performance](#google-sheets-performance)
5. [API Performance](#api-performance)
6. [Caching Strategies](#caching-strategies)
7. [Rate Limiting](#rate-limiting)
8. [Monitoring and Metrics](#monitoring-and-metrics)
9. [Performance Testing](#performance-testing)
10. [Troubleshooting](#troubleshooting)
11. [Best Practices](#best-practices)

## Overview

This document provides comprehensive performance guidelines for the Anwar Sales Management System, focusing on optimizing Google Apps Script execution, Google Sheets operations, and API performance within the constraints of the Google Workspace ecosystem.

### Performance Targets

- **API Response Time**: < 2 seconds for 95% of requests
- **Google Sheets Operations**: < 5 seconds for data retrieval
- **Batch Operations**: < 30 seconds for bulk data processing
- **Concurrent Users**: Support up to 50 simultaneous users
- **Data Throughput**: Handle 1000+ records per operation

## Performance Objectives

### Primary Goals

1. **Minimize Execution Time**
   - Optimize Google Apps Script functions
   - Reduce Google Sheets read/write operations
   - Implement efficient data processing algorithms

2. **Maximize Throughput**
   - Batch operations where possible
   - Parallel processing for independent tasks
   - Efficient data structures and algorithms

3. **Optimize Resource Usage**
   - Minimize memory consumption
   - Reduce CPU-intensive operations
   - Efficient network utilization

4. **Ensure Scalability**
   - Design for growth in data volume
   - Handle increasing user load
   - Maintain performance under stress

## Google Apps Script Optimization

### Execution Time Optimization

```javascript
// Performance-optimized Google Apps Script patterns

class PerformanceOptimizer {
  constructor() {
    this.cache = CacheService.getScriptCache();
    this.batchSize = 100;
    this.maxExecutionTime = 270000; // 4.5 minutes
  }

  // Batch operations to reduce API calls
  batchSheetOperations(operations) {
    const batches = this.chunkArray(operations, this.batchSize);
    const results = [];
    
    for (const batch of batches) {
      if (this.isNearTimeLimit()) {
        // Save progress and continue in next execution
        this.saveProgress(results, batch);
        break;
      }
      
      const batchResults = this.processBatch(batch);
      results.push(...batchResults);
    }
    
    return results;
  }

  // Efficient data retrieval with minimal API calls
  getDataRange(sheetName, range) {
    const cacheKey = `${sheetName}_${range}`;
    let data = this.cache.get(cacheKey);
    
    if (!data) {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
      data = sheet.getRange(range).getValues();
      
      // Cache for 5 minutes
      this.cache.put(cacheKey, JSON.stringify(data), 300);
    } else {
      data = JSON.parse(data);
    }
    
    return data;
  }

  // Bulk write operations
  bulkWrite(sheetName, data, startRow = 2) {
    if (!data || data.length === 0) return;
    
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    const range = sheet.getRange(startRow, 1, data.length, data[0].length);
    
    // Single batch write instead of multiple individual writes
    range.setValues(data);
    
    // Clear cache after write
    this.clearSheetCache(sheetName);
  }

  // Memory-efficient data processing
  processLargeDataset(data, processor) {
    const chunks = this.chunkArray(data, this.batchSize);
    const results = [];
    
    for (const chunk of chunks) {
      // Process chunk and immediately release memory
      const chunkResults = processor(chunk);
      results.push(...chunkResults);
      
      // Force garbage collection hint
      Utilities.sleep(10);
    }
    
    return results;
  }

  // Utility functions
  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  isNearTimeLimit() {
    // Check if we're approaching the 6-minute execution limit
    return (Date.now() - this.startTime) > this.maxExecutionTime;
  }

  clearSheetCache(sheetName) {
    // Clear all cached data for a specific sheet
    const keys = this.cache.get('cache_keys') || '[]';
    const cacheKeys = JSON.parse(keys);
    
    cacheKeys
      .filter(key => key.startsWith(sheetName))
      .forEach(key => this.cache.remove(key));
  }
}
```

### Memory Management

```javascript
class MemoryManager {
  constructor() {
    this.memoryThreshold = 0.8; // 80% memory usage threshold
  }

  // Monitor memory usage
  checkMemoryUsage() {
    const used = DriveApp.getStorageUsed();
    const limit = DriveApp.getStorageLimit();
    const usage = used / limit;
    
    if (usage > this.memoryThreshold) {
      this.optimizeMemory();
    }
    
    return usage;
  }

  // Optimize memory usage
  optimizeMemory() {
    // Clear caches
    CacheService.getScriptCache().removeAll();
    CacheService.getDocumentCache().removeAll();
    
    // Force garbage collection
    Utilities.sleep(100);
  }

  // Efficient object creation
  createLightweightObject(data) {
    // Use Object.create(null) for objects without prototype
    const obj = Object.create(null);
    Object.assign(obj, data);
    return obj;
  }

  // Stream processing for large datasets
  streamProcess(dataSource, processor, batchSize = 50) {
    let offset = 0;
    let hasMore = true;
    
    while (hasMore) {
      const batch = dataSource.getBatch(offset, batchSize);
      
      if (batch.length === 0) {
        hasMore = false;
        break;
      }
      
      processor(batch);
      offset += batchSize;
      
      // Memory cleanup between batches
      if (offset % (batchSize * 10) === 0) {
        Utilities.sleep(50);
      }
    }
  }
}
```

## Google Sheets Performance

### Efficient Data Access Patterns

```javascript
class SheetsPerformanceOptimizer {
  constructor() {
    this.spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    this.cache = CacheService.getScriptCache();
  }

  // Optimized data retrieval
  getOptimizedData(sheetName, filters = {}) {
    const sheet = this.spreadsheet.getSheetByName(sheetName);
    
    // Get all data in one operation
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    if (values.length === 0) return [];
    
    const headers = values[0];
    const data = values.slice(1);
    
    // Filter in memory instead of multiple sheet operations
    return this.filterData(data, headers, filters);
  }

  // Batch updates for better performance
  batchUpdate(sheetName, updates) {
    const sheet = this.spreadsheet.getSheetByName(sheetName);
    const batchRequests = [];
    
    // Group updates by type
    const valueUpdates = updates.filter(u => u.type === 'value');
    const formatUpdates = updates.filter(u => u.type === 'format');
    
    // Process value updates in batches
    if (valueUpdates.length > 0) {
      const ranges = valueUpdates.map(u => u.range);
      const values = valueUpdates.map(u => u.values);
      
      sheet.getRangeList(ranges).setValues(values);
    }
    
    // Process format updates separately
    if (formatUpdates.length > 0) {
      this.batchFormatUpdates(sheet, formatUpdates);
    }
  }

  // Efficient search operations
  findRecords(sheetName, searchCriteria) {
    const cacheKey = `search_${sheetName}_${JSON.stringify(searchCriteria)}`;
    let results = this.cache.get(cacheKey);
    
    if (!results) {
      const data = this.getOptimizedData(sheetName);
      results = this.searchInMemory(data, searchCriteria);
      
      // Cache results for 2 minutes
      this.cache.put(cacheKey, JSON.stringify(results), 120);
    } else {
      results = JSON.parse(results);
    }
    
    return results;
  }

  // Optimized data insertion
  insertRecords(sheetName, records) {
    if (!records || records.length === 0) return;
    
    const sheet = this.spreadsheet.getSheetByName(sheetName);
    const lastRow = sheet.getLastRow();
    
    // Insert all records in one operation
    const range = sheet.getRange(lastRow + 1, 1, records.length, records[0].length);
    range.setValues(records);
    
    // Update indexes if needed
    this.updateIndexes(sheetName, records);
  }

  // Create indexes for faster lookups
  createIndex(sheetName, columnIndex) {
    const indexKey = `index_${sheetName}_${columnIndex}`;
    const data = this.getOptimizedData(sheetName);
    
    const index = new Map();
    data.forEach((row, rowIndex) => {
      const value = row[columnIndex];
      if (!index.has(value)) {
        index.set(value, []);
      }
      index.get(value).push(rowIndex);
    });
    
    // Store index in cache
    this.cache.put(indexKey, JSON.stringify([...index]), 600); // 10 minutes
    
    return index;
  }

  // Utility functions
  filterData(data, headers, filters) {
    return data.filter(row => {
      return Object.entries(filters).every(([key, value]) => {
        const columnIndex = headers.indexOf(key);
        if (columnIndex === -1) return true;
        
        const cellValue = row[columnIndex];
        
        if (typeof value === 'object' && value.operator) {
          return this.applyOperator(cellValue, value.operator, value.value);
        }
        
        return cellValue === value;
      });
    });
  }

  applyOperator(cellValue, operator, value) {
    switch (operator) {
      case 'contains':
        return String(cellValue).toLowerCase().includes(String(value).toLowerCase());
      case 'gt':
        return Number(cellValue) > Number(value);
      case 'lt':
        return Number(cellValue) < Number(value);
      case 'gte':
        return Number(cellValue) >= Number(value);
      case 'lte':
        return Number(cellValue) <= Number(value);
      default:
        return cellValue === value;
    }
  }
}
```

### Data Structure Optimization

```javascript
class DataStructureOptimizer {
  constructor() {
    this.compressionThreshold = 1000; // Compress data over 1000 records
  }

  // Optimize data storage format
  optimizeDataFormat(data) {
    if (data.length > this.compressionThreshold) {
      return this.compressData(data);
    }
    
    return this.normalizeData(data);
  }

  // Compress large datasets
  compressData(data) {
    // Use column-based storage for better compression
    const columns = {};
    const headers = Object.keys(data[0] || {});
    
    headers.forEach(header => {
      columns[header] = data.map(row => row[header]);
    });
    
    return {
      format: 'columnar',
      headers,
      columns,
      rowCount: data.length
    };
  }

  // Decompress data when needed
  decompressData(compressedData) {
    if (compressedData.format !== 'columnar') {
      return compressedData;
    }
    
    const { headers, columns, rowCount } = compressedData;
    const data = [];
    
    for (let i = 0; i < rowCount; i++) {
      const row = {};
      headers.forEach(header => {
        row[header] = columns[header][i];
      });
      data.push(row);
    }
    
    return data;
  }

  // Normalize data types for consistent performance
  normalizeData(data) {
    return data.map(row => {
      const normalized = {};
      
      Object.entries(row).forEach(([key, value]) => {
        // Normalize data types
        if (typeof value === 'string' && !isNaN(value) && value !== '') {
          normalized[key] = Number(value);
        } else if (value instanceof Date) {
          normalized[key] = value.toISOString();
        } else {
          normalized[key] = value;
        }
      });
      
      return normalized;
    });
  }

  // Create efficient lookup tables
  createLookupTable(data, keyField) {
    const lookup = new Map();
    
    data.forEach(item => {
      const key = item[keyField];
      if (key !== undefined && key !== null) {
        lookup.set(key, item);
      }
    });
    
    return lookup;
  }

  // Optimize array operations
  optimizedArrayOperations(array, operation) {
    const chunkSize = 1000;
    const chunks = [];
    
    // Process in chunks to avoid memory issues
    for (let i = 0; i < array.length; i += chunkSize) {
      const chunk = array.slice(i, i + chunkSize);
      const result = operation(chunk);
      chunks.push(result);
    }
    
    return chunks.flat();
  }
}
```

## API Performance

### Request Optimization

```javascript
class APIPerformanceOptimizer {
  constructor() {
    this.requestQueue = [];
    this.batchInterval = 100; // ms
    this.maxBatchSize = 10;
  }

  // Batch API requests
  batchRequests(requests) {
    return new Promise((resolve) => {
      this.requestQueue.push(...requests.map(req => ({ ...req, resolve })));
      
      if (this.requestQueue.length >= this.maxBatchSize) {
        this.processBatch();
      } else {
        setTimeout(() => this.processBatch(), this.batchInterval);
      }
    });
  }

  processBatch() {
    if (this.requestQueue.length === 0) return;
    
    const batch = this.requestQueue.splice(0, this.maxBatchSize);
    
    // Group requests by endpoint
    const groupedRequests = this.groupRequestsByEndpoint(batch);
    
    Object.entries(groupedRequests).forEach(([endpoint, requests]) => {
      this.processBatchForEndpoint(endpoint, requests);
    });
  }

  // Optimize response serialization
  optimizeResponse(data) {
    // Remove null/undefined values
    const cleaned = this.removeEmptyValues(data);
    
    // Compress large responses
    if (JSON.stringify(cleaned).length > 10000) {
      return this.compressResponse(cleaned);
    }
    
    return cleaned;
  }

  // Implement response compression
  compressResponse(data) {
    // Simple compression for repeated values
    if (Array.isArray(data)) {
      return this.compressArray(data);
    }
    
    return data;
  }

  compressArray(array) {
    if (array.length === 0) return array;
    
    // Find common structure
    const firstItem = array[0];
    const commonKeys = Object.keys(firstItem);
    
    // Check if all items have the same structure
    const hasCommonStructure = array.every(item => 
      commonKeys.every(key => key in item)
    );
    
    if (hasCommonStructure) {
      return {
        format: 'compressed',
        keys: commonKeys,
        values: array.map(item => commonKeys.map(key => item[key]))
      };
    }
    
    return array;
  }

  // Request deduplication
  deduplicateRequests(requests) {
    const seen = new Set();
    return requests.filter(req => {
      const key = `${req.method}_${req.url}_${JSON.stringify(req.params)}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  // Utility functions
  removeEmptyValues(obj) {
    if (Array.isArray(obj)) {
      return obj.map(item => this.removeEmptyValues(item));
    }
    
    if (obj && typeof obj === 'object') {
      const cleaned = {};
      Object.entries(obj).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          cleaned[key] = this.removeEmptyValues(value);
        }
      });
      return cleaned;
    }
    
    return obj;
  }

  groupRequestsByEndpoint(requests) {
    return requests.reduce((groups, request) => {
      const endpoint = request.url.split('?')[0];
      if (!groups[endpoint]) {
        groups[endpoint] = [];
      }
      groups[endpoint].push(request);
      return groups;
    }, {});
  }
}
```

## Caching Strategies

### Multi-Level Caching

```javascript
class CachingStrategy {
  constructor() {
    this.scriptCache = CacheService.getScriptCache();
    this.documentCache = CacheService.getDocumentCache();
    this.userCache = CacheService.getUserCache();
    
    this.cacheTTL = {
      short: 300,    // 5 minutes
      medium: 1800,  // 30 minutes
      long: 3600     // 1 hour
    };
  }

  // Intelligent cache selection
  getCache(scope) {
    switch (scope) {
      case 'user':
        return this.userCache;
      case 'document':
        return this.documentCache;
      case 'script':
      default:
        return this.scriptCache;
    }
  }

  // Cache with automatic expiration
  set(key, value, ttl = this.cacheTTL.medium, scope = 'script') {
    const cache = this.getCache(scope);
    const cacheValue = {
      data: value,
      timestamp: Date.now(),
      ttl: ttl * 1000
    };
    
    try {
      cache.put(key, JSON.stringify(cacheValue), ttl);
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  // Get with freshness check
  get(key, scope = 'script') {
    const cache = this.getCache(scope);
    
    try {
      const cached = cache.get(key);
      if (!cached) return null;
      
      const cacheValue = JSON.parse(cached);
      
      // Check if cache is still fresh
      if (Date.now() - cacheValue.timestamp > cacheValue.ttl) {
        cache.remove(key);
        return null;
      }
      
      return cacheValue.data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  // Cache with refresh strategy
  getOrRefresh(key, refreshFunction, ttl = this.cacheTTL.medium, scope = 'script') {
    let value = this.get(key, scope);
    
    if (value === null) {
      value = refreshFunction();
      this.set(key, value, ttl, scope);
    }
    
    return value;
  }

  // Bulk cache operations
  setBulk(items, ttl = this.cacheTTL.medium, scope = 'script') {
    const cache = this.getCache(scope);
    const cacheItems = {};
    
    Object.entries(items).forEach(([key, value]) => {
      const cacheValue = {
        data: value,
        timestamp: Date.now(),
        ttl: ttl * 1000
      };
      cacheItems[key] = JSON.stringify(cacheValue);
    });
    
    try {
      cache.putAll(cacheItems, ttl);
      return true;
    } catch (error) {
      console.error('Bulk cache set error:', error);
      return false;
    }
  }

  // Cache invalidation patterns
  invalidatePattern(pattern, scope = 'script') {
    // Note: Google Apps Script doesn't support pattern-based invalidation
    // This is a workaround using a registry of keys
    const registryKey = `cache_registry_${scope}`;
    const registry = this.get(registryKey, scope) || [];
    
    const keysToRemove = registry.filter(key => 
      new RegExp(pattern).test(key)
    );
    
    const cache = this.getCache(scope);
    keysToRemove.forEach(key => cache.remove(key));
    
    // Update registry
    const updatedRegistry = registry.filter(key => 
      !keysToRemove.includes(key)
    );
    this.set(registryKey, updatedRegistry, this.cacheTTL.long, scope);
  }

  // Cache warming
  warmCache(warmingFunctions) {
    warmingFunctions.forEach(({ key, fn, ttl, scope }) => {
      if (!this.get(key, scope)) {
        const value = fn();
        this.set(key, value, ttl, scope);
      }
    });
  }

  // Cache statistics
  getStats(scope = 'script') {
    const statsKey = `cache_stats_${scope}`;
    const stats = this.get(statsKey, scope) || {
      hits: 0,
      misses: 0,
      sets: 0
    };
    
    return {
      ...stats,
      hitRate: stats.hits / (stats.hits + stats.misses) || 0
    };
  }

  // Update cache statistics
  updateStats(operation, scope = 'script') {
    const statsKey = `cache_stats_${scope}`;
    const stats = this.get(statsKey, scope) || {
      hits: 0,
      misses: 0,
      sets: 0
    };
    
    stats[operation]++;
    this.set(statsKey, stats, this.cacheTTL.long, scope);
  }
}
```

## Rate Limiting

### Adaptive Rate Limiting

```javascript
class RateLimiter {
  constructor() {
    this.limits = {
      api: { requests: 100, window: 60000 }, // 100 requests per minute
      sheets: { operations: 300, window: 60000 }, // 300 operations per minute
      user: { requests: 1000, window: 3600000 } // 1000 requests per hour
    };
    
    this.cache = CacheService.getScriptCache();
  }

  // Check rate limit
  checkLimit(identifier, limitType = 'api') {
    const limit = this.limits[limitType];
    const key = `rate_limit_${limitType}_${identifier}`;
    
    const current = this.getCurrentUsage(key, limit.window);
    
    if (current >= limit.requests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: this.getResetTime(key, limit.window)
      };
    }
    
    // Increment counter
    this.incrementUsage(key, limit.window);
    
    return {
      allowed: true,
      remaining: limit.requests - current - 1,
      resetTime: this.getResetTime(key, limit.window)
    };
  }

  // Adaptive rate limiting based on system load
  adaptiveLimit(identifier, baseLimit, systemLoad) {
    // Reduce limits when system load is high
    const adaptedLimit = Math.floor(baseLimit * (1 - systemLoad * 0.5));
    
    return this.checkCustomLimit(identifier, adaptedLimit, 60000);
  }

  // Custom rate limit check
  checkCustomLimit(identifier, requests, window) {
    const key = `custom_rate_limit_${identifier}`;
    const current = this.getCurrentUsage(key, window);
    
    if (current >= requests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: this.getResetTime(key, window)
      };
    }
    
    this.incrementUsage(key, window);
    
    return {
      allowed: true,
      remaining: requests - current - 1,
      resetTime: this.getResetTime(key, window)
    };
  }

  // Get current usage
  getCurrentUsage(key, window) {
    const data = this.cache.get(key);
    if (!data) return 0;
    
    const usage = JSON.parse(data);
    const now = Date.now();
    
    // Clean old entries
    usage.requests = usage.requests.filter(
      timestamp => now - timestamp < window
    );
    
    return usage.requests.length;
  }

  // Increment usage counter
  incrementUsage(key, window) {
    const data = this.cache.get(key);
    const usage = data ? JSON.parse(data) : { requests: [] };
    
    usage.requests.push(Date.now());
    
    // Store with TTL slightly longer than window
    const ttl = Math.ceil(window / 1000) + 60;
    this.cache.put(key, JSON.stringify(usage), ttl);
  }

  // Get reset time
  getResetTime(key, window) {
    const data = this.cache.get(key);
    if (!data) return Date.now();
    
    const usage = JSON.parse(data);
    if (usage.requests.length === 0) return Date.now();
    
    const oldestRequest = Math.min(...usage.requests);
    return oldestRequest + window;
  }

  // Rate limiting middleware
  rateLimitMiddleware(limitType = 'api') {
    return (request) => {
      const identifier = this.getIdentifier(request);
      const result = this.checkLimit(identifier, limitType);
      
      if (!result.allowed) {
        throw new Error(`Rate limit exceeded. Reset at ${new Date(result.resetTime)}`);
      }
      
      // Add rate limit headers to response
      request.rateLimitInfo = {
        remaining: result.remaining,
        resetTime: result.resetTime
      };
      
      return request;
    };
  }

  // Get identifier from request
  getIdentifier(request) {
    // Use user email or IP address as identifier
    return request.user?.email || request.remoteAddress || 'anonymous';
  }

  // Burst handling
  handleBurst(identifier, burstLimit = 10) {
    const burstKey = `burst_${identifier}`;
    const burstData = this.cache.get(burstKey);
    
    if (!burstData) {
      // First request in burst window
      this.cache.put(burstKey, JSON.stringify({ count: 1, start: Date.now() }), 10);
      return true;
    }
    
    const burst = JSON.parse(burstData);
    
    if (burst.count >= burstLimit) {
      return false; // Burst limit exceeded
    }
    
    burst.count++;
    this.cache.put(burstKey, JSON.stringify(burst), 10);
    return true;
  }
}
```

## Monitoring and Metrics

### Performance Monitoring

```javascript
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: new Map(),
      operations: new Map(),
      errors: new Map(),
      performance: new Map()
    };
    
    this.thresholds = {
      responseTime: 2000, // 2 seconds
      errorRate: 0.05,    // 5%
      memoryUsage: 0.8    // 80%
    };
  }

  // Start performance measurement
  startMeasurement(operationId) {
    const measurement = {
      id: operationId,
      startTime: Date.now(),
      startMemory: this.getMemoryUsage()
    };
    
    this.metrics.performance.set(operationId, measurement);
    return measurement;
  }

  // End performance measurement
  endMeasurement(operationId, success = true, metadata = {}) {
    const measurement = this.metrics.performance.get(operationId);
    if (!measurement) return null;
    
    const endTime = Date.now();
    const endMemory = this.getMemoryUsage();
    
    const result = {
      ...measurement,
      endTime,
      duration: endTime - measurement.startTime,
      memoryDelta: endMemory - measurement.startMemory,
      success,
      metadata
    };
    
    this.recordMetric('performance', result);
    this.metrics.performance.delete(operationId);
    
    return result;
  }

  // Record metric
  recordMetric(type, data) {
    const timestamp = Date.now();
    const metric = { ...data, timestamp };
    
    if (!this.metrics[type]) {
      this.metrics[type] = new Map();
    }
    
    this.metrics[type].set(timestamp, metric);
    
    // Check thresholds
    this.checkThresholds(type, metric);
    
    // Cleanup old metrics (keep last hour)
    this.cleanupOldMetrics(type, 3600000);
  }

  // Get performance statistics
  getStats(type, timeWindow = 3600000) {
    const metrics = this.getMetricsInWindow(type, timeWindow);
    
    if (metrics.length === 0) {
      return { count: 0 };
    }
    
    switch (type) {
      case 'performance':
        return this.calculatePerformanceStats(metrics);
      case 'requests':
        return this.calculateRequestStats(metrics);
      case 'errors':
        return this.calculateErrorStats(metrics);
      default:
        return { count: metrics.length };
    }
  }

  // Calculate performance statistics
  calculatePerformanceStats(metrics) {
    const durations = metrics.map(m => m.duration);
    const memoryDeltas = metrics.map(m => m.memoryDelta || 0);
    const successCount = metrics.filter(m => m.success).length;
    
    return {
      count: metrics.length,
      successRate: successCount / metrics.length,
      avgDuration: this.average(durations),
      medianDuration: this.median(durations),
      p95Duration: this.percentile(durations, 95),
      avgMemoryDelta: this.average(memoryDeltas),
      maxDuration: Math.max(...durations),
      minDuration: Math.min(...durations)
    };
  }

  // Calculate request statistics
  calculateRequestStats(metrics) {
    const statusCodes = {};
    const endpoints = {};
    
    metrics.forEach(metric => {
      const status = metric.statusCode || 200;
      const endpoint = metric.endpoint || 'unknown';
      
      statusCodes[status] = (statusCodes[status] || 0) + 1;
      endpoints[endpoint] = (endpoints[endpoint] || 0) + 1;
    });
    
    return {
      count: metrics.length,
      statusCodes,
      endpoints,
      errorRate: (statusCodes['4xx'] || 0 + statusCodes['5xx'] || 0) / metrics.length
    };
  }

  // Check performance thresholds
  checkThresholds(type, metric) {
    const alerts = [];
    
    if (type === 'performance' && metric.duration > this.thresholds.responseTime) {
      alerts.push({
        type: 'SLOW_RESPONSE',
        severity: 'WARNING',
        message: `Operation ${metric.id} took ${metric.duration}ms`,
        threshold: this.thresholds.responseTime,
        actual: metric.duration
      });
    }
    
    if (alerts.length > 0) {
      this.handleAlerts(alerts);
    }
  }

  // Handle performance alerts
  handleAlerts(alerts) {
    alerts.forEach(alert => {
      console.warn(`Performance Alert: ${alert.message}`);
      
      // Log to external monitoring system if available
      this.logToExternalMonitoring(alert);
    });
  }

  // Get memory usage
  getMemoryUsage() {
    // Approximate memory usage (Google Apps Script doesn't provide direct access)
    try {
      const used = DriveApp.getStorageUsed();
      const limit = DriveApp.getStorageLimit();
      return used / limit;
    } catch (error) {
      return 0;
    }
  }

  // Utility functions
  getMetricsInWindow(type, timeWindow) {
    const cutoff = Date.now() - timeWindow;
    const typeMetrics = this.metrics[type] || new Map();
    
    return Array.from(typeMetrics.values())
      .filter(metric => metric.timestamp > cutoff);
  }

  cleanupOldMetrics(type, maxAge) {
    const cutoff = Date.now() - maxAge;
    const typeMetrics = this.metrics[type];
    
    if (typeMetrics) {
      for (const [timestamp, metric] of typeMetrics) {
        if (timestamp < cutoff) {
          typeMetrics.delete(timestamp);
        }
      }
    }
  }

  average(numbers) {
    return numbers.length > 0 ? numbers.reduce((a, b) => a + b, 0) / numbers.length : 0;
  }

  median(numbers) {
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];
  }

  percentile(numbers, p) {
    const sorted = [...numbers].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  logToExternalMonitoring(alert) {
    // Implementation for external monitoring integration
    // This could send data to Google Analytics, external APIs, etc.
  }
}
```

## Performance Testing

### Load Testing Framework

```javascript
class LoadTester {
  constructor() {
    this.testResults = [];
    this.concurrentUsers = 1;
    this.testDuration = 60000; // 1 minute
    this.rampUpTime = 10000;   // 10 seconds
  }

  // Run load test
  async runLoadTest(testConfig) {
    const {
      endpoint,
      method = 'GET',
      payload,
      concurrentUsers = 10,
      duration = 60000,
      rampUpTime = 10000
    } = testConfig;
    
    console.log(`Starting load test: ${concurrentUsers} users for ${duration}ms`);
    
    const startTime = Date.now();
    const endTime = startTime + duration;
    const userRampInterval = rampUpTime / concurrentUsers;
    
    const promises = [];
    
    // Ramp up users gradually
    for (let i = 0; i < concurrentUsers; i++) {
      setTimeout(() => {
        const userPromise = this.simulateUser(endpoint, method, payload, endTime);
        promises.push(userPromise);
      }, i * userRampInterval);
    }
    
    // Wait for all users to complete
    const results = await Promise.all(promises);
    
    return this.analyzeResults(results, testConfig);
  }

  // Simulate individual user
  async simulateUser(endpoint, method, payload, endTime) {
    const userResults = [];
    let requestCount = 0;
    
    while (Date.now() < endTime) {
      const startTime = Date.now();
      
      try {
        const response = await this.makeRequest(endpoint, method, payload);
        const duration = Date.now() - startTime;
        
        userResults.push({
          requestId: `${Date.now()}_${requestCount}`,
          startTime,
          duration,
          success: response.status < 400,
          statusCode: response.status,
          responseSize: JSON.stringify(response.data || {}).length
        });
        
      } catch (error) {
        const duration = Date.now() - startTime;
        
        userResults.push({
          requestId: `${Date.now()}_${requestCount}`,
          startTime,
          duration,
          success: false,
          error: error.message
        });
      }
      
      requestCount++;
      
      // Small delay between requests
      await this.sleep(100);
    }
    
    return userResults;
  }

  // Make HTTP request
  async makeRequest(endpoint, method, payload) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (payload && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(payload);
    }
    
    const response = await UrlFetchApp.fetch(endpoint, options);
    
    return {
      status: response.getResponseCode(),
      data: JSON.parse(response.getContentText())
    };
  }

  // Analyze test results
  analyzeResults(userResults, testConfig) {
    const allResults = userResults.flat();
    const successfulRequests = allResults.filter(r => r.success);
    const failedRequests = allResults.filter(r => !r.success);
    
    const durations = successfulRequests.map(r => r.duration);
    const responseSizes = successfulRequests.map(r => r.responseSize || 0);
    
    const analysis = {
      testConfig,
      summary: {
        totalRequests: allResults.length,
        successfulRequests: successfulRequests.length,
        failedRequests: failedRequests.length,
        successRate: successfulRequests.length / allResults.length,
        avgResponseTime: this.average(durations),
        medianResponseTime: this.median(durations),
        p95ResponseTime: this.percentile(durations, 95),
        p99ResponseTime: this.percentile(durations, 99),
        maxResponseTime: Math.max(...durations),
        minResponseTime: Math.min(...durations),
        avgResponseSize: this.average(responseSizes),
        throughput: successfulRequests.length / (testConfig.duration / 1000) // requests per second
      },
      errors: this.analyzeErrors(failedRequests),
      recommendations: this.generateRecommendations(allResults, testConfig)
    };
    
    return analysis;
  }

  // Analyze error patterns
  analyzeErrors(failedRequests) {
    const errorTypes = {};
    const statusCodes = {};
    
    failedRequests.forEach(request => {
      if (request.error) {
        errorTypes[request.error] = (errorTypes[request.error] || 0) + 1;
      }
      
      if (request.statusCode) {
        statusCodes[request.statusCode] = (statusCodes[request.statusCode] || 0) + 1;
      }
    });
    
    return {
      totalErrors: failedRequests.length,
      errorTypes,
      statusCodes,
      errorRate: failedRequests.length / (failedRequests.length + successfulRequests.length)
    };
  }

  // Generate performance recommendations
  generateRecommendations(results, testConfig) {
    const recommendations = [];
    const durations = results.filter(r => r.success).map(r => r.duration);
    const avgDuration = this.average(durations);
    const p95Duration = this.percentile(durations, 95);
    const errorRate = results.filter(r => !r.success).length / results.length;
    
    if (avgDuration > 2000) {
      recommendations.push({
        type: 'PERFORMANCE',
        priority: 'HIGH',
        message: 'Average response time exceeds 2 seconds',
        suggestion: 'Optimize database queries and implement caching'
      });
    }
    
    if (p95Duration > 5000) {
      recommendations.push({
        type: 'PERFORMANCE',
        priority: 'MEDIUM',
        message: '95th percentile response time exceeds 5 seconds',
        suggestion: 'Investigate slow queries and optimize bottlenecks'
      });
    }
    
    if (errorRate > 0.05) {
      recommendations.push({
        type: 'RELIABILITY',
        priority: 'HIGH',
        message: 'Error rate exceeds 5%',
        suggestion: 'Improve error handling and system stability'
      });
    }
    
    return recommendations;
  }

  // Utility functions
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  average(numbers) {
    return numbers.length > 0 ? numbers.reduce((a, b) => a + b, 0) / numbers.length : 0;
  }

  median(numbers) {
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];
  }

  percentile(numbers, p) {
    const sorted = [...numbers].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }
}
```

## Troubleshooting

### Common Performance Issues

#### 1. Slow Google Sheets Operations

**Symptoms:**
- Long response times for data retrieval
- Timeouts during bulk operations
- High memory usage

**Solutions:**
```javascript
// Optimize sheet operations
function optimizeSheetOperations() {
  // Use batch operations
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheet.getDataRange().getValues(); // Single read
  
  // Process data in memory
  const processedData = data.map(row => {
    // Your processing logic
    return row;
  });
  
  // Single write operation
  sheet.getRange(1, 1, processedData.length, processedData[0].length)
    .setValues(processedData);
}
```

#### 2. Google Apps Script Timeout

**Symptoms:**
- Script execution exceeds 6-minute limit
- Incomplete operations
- Data inconsistency

**Solutions:**
```javascript
// Implement continuation pattern
function processLargeDataset() {
  const startTime = Date.now();
  const maxExecutionTime = 5 * 60 * 1000; // 5 minutes
  
  let processed = 0;
  const batchSize = 100;
  
  while (processed < totalRecords) {
    if (Date.now() - startTime > maxExecutionTime) {
      // Save progress and schedule continuation
      saveProgress(processed);
      ScriptApp.newTrigger('processLargeDataset')
        .timeBased()
        .after(1000) // 1 second delay
        .create();
      return;
    }
    
    // Process batch
    processBatch(processed, batchSize);
    processed += batchSize;
  }
}
```

#### 3. Memory Limitations

**Symptoms:**
- Out of memory errors
- Slow performance with large datasets
- Script crashes

**Solutions:**
```javascript
// Stream processing for large datasets
function streamProcessLargeData() {
  const batchSize = 50;
  let offset = 0;
  
  while (true) {
    const batch = getData(offset, batchSize);
    if (batch.length === 0) break;
    
    // Process batch immediately
    processBatch(batch);
    
    // Clear references to allow garbage collection
    batch.length = 0;
    
    offset += batchSize;
    
    // Small delay to allow garbage collection
    Utilities.sleep(10);
  }
}
```

### Performance Debugging

```javascript
class PerformanceDebugger {
  constructor() {
    this.measurements = new Map();
    this.enabled = true;
  }

  // Start timing
  start(label) {
    if (!this.enabled) return;
    
    this.measurements.set(label, {
      startTime: Date.now(),
      startMemory: this.getMemoryUsage()
    });
  }

  // End timing and log results
  end(label) {
    if (!this.enabled) return;
    
    const measurement = this.measurements.get(label);
    if (!measurement) return;
    
    const endTime = Date.now();
    const duration = endTime - measurement.startTime;
    const memoryDelta = this.getMemoryUsage() - measurement.startMemory;
    
    console.log(`Performance [${label}]: ${duration}ms, Memory: ${memoryDelta}`);
    
    this.measurements.delete(label);
    
    return { duration, memoryDelta };
  }

  // Profile function execution
  profile(fn, label) {
    this.start(label);
    const result = fn();
    this.end(label);
    return result;
  }

  // Get memory usage approximation
  getMemoryUsage() {
    // Approximate memory usage
    return JSON.stringify(this.measurements).length;
  }

  // Generate performance report
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      activeMeasurements: this.measurements.size,
      measurements: Array.from(this.measurements.entries())
    };
    
    console.log('Performance Report:', JSON.stringify(report, null, 2));
    return report;
  }
}

// Usage example
const debugger = new PerformanceDebugger();

function optimizedFunction() {
  debugger.start('data-processing');
  
  // Your code here
  const data = processData();
  
  debugger.end('data-processing');
  return data;
}
```

## Best Practices

### Development Best Practices

1. **Code Organization**
   - Modular design with clear separation of concerns
   - Reusable utility functions
   - Consistent naming conventions
   - Comprehensive error handling

2. **Data Management**
   - Minimize Google Sheets read/write operations
   - Use batch operations whenever possible
   - Implement proper data validation
   - Cache frequently accessed data

3. **Performance Optimization**
   - Profile code regularly
   - Optimize critical paths first
   - Use appropriate data structures
   - Implement lazy loading where applicable

4. **Error Handling**
   - Graceful degradation
   - Proper error logging
   - User-friendly error messages
   - Retry mechanisms for transient failures

### Deployment Best Practices

1. **Testing**
   - Comprehensive unit testing
   - Performance testing
   - Load testing
   - User acceptance testing

2. **Monitoring**
   - Real-time performance monitoring
   - Error tracking
   - User behavior analytics
   - System health checks

3. **Maintenance**
   - Regular performance reviews
   - Code optimization
   - Dependency updates
   - Documentation updates

### Performance Checklist

#### Pre-Deployment Checklist
- [ ] Code profiled and optimized
- [ ] Caching implemented where appropriate
- [ ] Rate limiting configured
- [ ] Error handling comprehensive
- [ ] Memory usage optimized
- [ ] Batch operations implemented
- [ ] Performance tests passed
- [ ] Monitoring configured

#### Post-Deployment Checklist
- [ ] Performance metrics monitored
- [ ] Error rates within acceptable limits
- [ ] User feedback collected
- [ ] System resources monitored
- [ ] Performance trends analyzed
- [ ] Optimization opportunities identified

## Conclusion

This performance guidelines document provides a comprehensive framework for optimizing the Anwar Sales Management System. Regular monitoring and continuous optimization are essential for maintaining optimal performance as the system scales.

### Key Performance Contacts

- **Performance Team**: performance@anwarsales.com
- **System Monitoring**: monitoring@anwarsales.com
- **Technical Support**: support@anwarsales.com

### Performance Review Schedule

- **Daily**: Monitor key performance metrics
- **Weekly**: Review performance trends and alerts
- **Monthly**: Conduct performance optimization review
- **Quarterly**: Comprehensive performance audit
- **Annually**: Performance architecture review

---

*This document should be reviewed and updated regularly to reflect system changes and performance improvements.*