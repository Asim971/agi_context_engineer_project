/**
 * Comprehensive Test Suite for Enhanced IdService
 * Tests concurrency control, caching, and quota monitoring
 */

function testIdServiceEnhanced() {
  console.log('=== Enhanced IdService Test Suite Started ===');
  
  try {
    // Test 1: Basic ID Generation
    console.log('\n--- Test 1: Basic ID Generation ---');
    const id1 = IdServiceGlobal.getNextId('ENGINEER');
    console.log('Generated ID:', id1);
    
    // Test 2: Cache Performance
    console.log('\n--- Test 2: Cache Performance ---');
    const startTime = new Date().getTime();
    const id2 = IdServiceGlobal.getNextId('ENGINEER');
    const endTime = new Date().getTime();
    const responseTime = endTime - startTime;
    console.log('Response time (ms):', responseTime);
    console.log('Target: <100ms for cached retrieval');
    
    // Test 3: Cache Statistics
    console.log('\n--- Test 3: Cache Statistics ---');
    const cacheStats = IdServiceGlobal.getCacheStatistics();
    console.log('Cache Statistics:', JSON.stringify(cacheStats, null, 2));
    
    // Test 4: Quota Statistics
    console.log('\n--- Test 4: Quota Statistics ---');
    const quotaStats = IdServiceGlobal.getQuotaStatistics();
    console.log('Quota Statistics:', JSON.stringify(quotaStats, null, 2));
    
    // Test 5: Performance Metrics
    console.log('\n--- Test 5: Performance Metrics ---');
    const perfMetrics = IdServiceGlobal.getPerformanceMetrics();
    console.log('Performance Metrics:', JSON.stringify(perfMetrics, null, 2));
    
    // Test 6: Health Status
    console.log('\n--- Test 6: Health Status ---');
    const healthStatus = IdServiceGlobal.getHealthStatus();
    console.log('Health Status:', JSON.stringify(healthStatus, null, 2));
    
    // Test 7: Concurrent ID Generation
    console.log('\n--- Test 7: Concurrent ID Generation ---');
    const concurrentIds = [];
    for (let i = 0; i < 5; i++) {
      const id = IdServiceGlobal.getNextId('RETAILER');
      concurrentIds.push(id);
    }
    console.log('Concurrent IDs:', concurrentIds);
    
    // Verify uniqueness
    const uniqueIds = [...new Set(concurrentIds)];
    const isUnique = uniqueIds.length === concurrentIds.length;
    console.log('All IDs unique:', isUnique);
    
    // Test 8: Cache Invalidation
    console.log('\n--- Test 8: Cache Invalidation ---');
    IdServiceGlobal.invalidateCache('TIME');
    console.log('Cache invalidated (TIME strategy)');
    
    // Test 9: Diagnostics Export
    console.log('\n--- Test 9: Diagnostics Export ---');
    const diagnostics = IdServiceGlobal.exportDiagnostics();
    console.log('Diagnostics exported successfully');
    
    console.log('\n=== Enhanced IdService Test Suite Completed Successfully ===');
    return {
      success: true,
      responseTime: responseTime,
      cacheStats: cacheStats,
      quotaStats: quotaStats,
      healthStatus: healthStatus,
      concurrentTest: isUnique
    };
    
  } catch (error) {
    console.error('Test suite failed:', error.message);
    console.error('Stack trace:', error.stack);
    return {
      success: false,
      error: error.message
    };
  }
}

function testIdServiceConcurrency() {
  console.log('=== Concurrency Test Started ===');
  
  try {
    const results = [];
    const startTime = new Date().getTime();
    
    // Simulate 10 concurrent requests
    for (let i = 0; i < 10; i++) {
      const id = IdServiceGlobal.getNextId('VISIT');
      results.push(id);
    }
    
    const endTime = new Date().getTime();
    const totalTime = endTime - startTime;
    
    console.log('Generated IDs:', results);
    console.log('Total time (ms):', totalTime);
    console.log('Average time per ID (ms):', totalTime / results.length);
    
    // Check uniqueness
    const uniqueResults = [...new Set(results)];
    const allUnique = uniqueResults.length === results.length;
    
    console.log('All IDs unique:', allUnique);
    console.log('=== Concurrency Test Completed ===');
    
    return {
      success: allUnique,
      totalTime: totalTime,
      averageTime: totalTime / results.length,
      idsGenerated: results.length
    };
    
  } catch (error) {
    console.error('Concurrency test failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

function testIdServiceQuotaMonitoring() {
  console.log('=== Quota Monitoring Test Started ===');
  
  try {
    // Generate multiple IDs to test quota tracking
    for (let i = 0; i < 5; i++) {
      IdServiceGlobal.getNextId('BD_LEAD');
    }
    
    const quotaStats = IdServiceGlobal.getQuotaStatistics();
    console.log('Quota Statistics after 5 operations:', JSON.stringify(quotaStats, null, 2));
    
    // Test quota thresholds
    const healthStatus = IdServiceGlobal.getHealthStatus();
    console.log('Health Status:', JSON.stringify(healthStatus, null, 2));
    
    console.log('=== Quota Monitoring Test Completed ===');
    
    return {
      success: true,
      quotaStats: quotaStats,
      healthStatus: healthStatus
    };
    
  } catch (error) {
    console.error('Quota monitoring test failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

function runAllIdServiceTests() {
  console.log('=== Running All IdService Tests ===');
  
  const results = {
    enhanced: testIdServiceEnhanced(),
    concurrency: testIdServiceConcurrency(),
    quotaMonitoring: testIdServiceQuotaMonitoring()
  };
  
  console.log('\n=== Test Results Summary ===');
  console.log(JSON.stringify(results, null, 2));
  
  const allPassed = results.enhanced.success && 
                   results.concurrency.success && 
                   results.quotaMonitoring.success;
  
  console.log('\n=== All Tests Passed:', allPassed, '===');
  
  return results;
}