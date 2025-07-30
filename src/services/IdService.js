/**
 * @file IdService.js
 * @description Enhanced service for generating unique, sequential, and concurrency-safe IDs.
 * Features advanced caching, quota monitoring integration, and robust concurrency control.
 * @version 3.0.0
 */

class IdService extends BaseService {
  constructor() {
    super();
    this.idTrackingSheet = Config.SHEETS.ID_TRACKING;
    this.db = getGlobalDB();
    
    // Enhanced lock configuration
    this.lockConfig = {
      timeout: 30000, // 30 seconds
      retryAttempts: 5,
      backoffMultiplier: 1.5,
      circuitBreakerThreshold: 10,
      circuitBreakerResetTime: 300000 // 5 minutes
    };
    
    // Advanced caching configuration
    this.cacheConfig = {
      inMemorySize: 100,
      propertiesServiceTTL: 3600000, // 1 hour
      preGenerationBatchSize: 50,
      invalidationThreshold: 0.8,
      warmupEnabled: true
    };
    
    // Quota monitoring integration
    this.quotaConfig = {
      warningThresholds: [0.7, 0.85, 0.95],
      throttlingEnabled: true,
      adaptiveThrottling: true,
      quotaName: 'idGenerationQuota'
    };
    
    // Circuit breaker state
    this.circuitBreaker = {
      failures: 0,
      lastFailureTime: null,
      state: 'CLOSED' // CLOSED, OPEN, HALF_OPEN
    };
    
    // In-memory cache for frequently accessed IDs
    this.inMemoryCache = new Map();
    this.cacheStats = {
      hits: 0,
      misses: 0,
      evictions: 0
    };
    
    // Performance metrics
    this.performanceMetrics = {
      totalRequests: 0,
      successfulRequests: 0,
      averageResponseTime: 0,
      lockTimeouts: 0,
      cacheHitRate: 0
    };
    
    // Initialize services
    this.quotaMonitor = null;
    this.initializeServices();
    
    this.logger.info('Enhanced IdService initialized', {
      version: '3.0.0',
      lockTimeout: this.lockConfig.timeout,
      cacheEnabled: true,
      quotaMonitoringEnabled: true
    });
  }

  /**
   * Initialize required services and dependencies
   * @private
   */
  initializeServices() {
    try {
      // Get quota monitoring service
      const serviceLocator = GlobalServiceLocator.getInstance();
      this.quotaMonitor = serviceLocator.get('QuotaMonitoringService');
      
      if (this.quotaMonitor) {
        this.logger.info('Quota monitoring service integrated successfully');
      } else {
        this.logger.warn('Quota monitoring service not available - using fallback quota management');
      }
      
      // Initialize cache if warmup is enabled
      if (this.cacheConfig.warmupEnabled) {
        this.warmCache();
      }
      
    } catch (error) {
      this.logger.error('Failed to initialize services', { error: error.message });
    }
  }

  /**
   * Check circuit breaker status before attempting operations
   * @private
   * @returns {boolean} Whether operations should proceed
   */
  checkCircuitBreakerStatus() {
    const now = Date.now();
    
    if (this.circuitBreaker.state === 'OPEN') {
      // Check if enough time has passed to attempt recovery
      if (now - this.circuitBreaker.lastFailureTime > this.lockConfig.circuitBreakerResetTime) {
        this.circuitBreaker.state = 'HALF_OPEN';
        this.logger.info('Circuit breaker transitioning to HALF_OPEN state');
        return true;
      }
      return false;
    }
    
    return true;
  }

  /**
   * Record circuit breaker failure
   * @private
   */
  recordCircuitBreakerFailure() {
    this.circuitBreaker.failures++;
    this.circuitBreaker.lastFailureTime = Date.now();
    
    if (this.circuitBreaker.failures >= this.lockConfig.circuitBreakerThreshold) {
      this.circuitBreaker.state = 'OPEN';
      this.logger.error('Circuit breaker opened due to repeated failures', {
        failures: this.circuitBreaker.failures,
        threshold: this.lockConfig.circuitBreakerThreshold
      });
    }
  }

  /**
   * Record circuit breaker success
   * @private
   */
  recordCircuitBreakerSuccess() {
    if (this.circuitBreaker.state === 'HALF_OPEN') {
      this.circuitBreaker.state = 'CLOSED';
      this.circuitBreaker.failures = 0;
      this.logger.info('Circuit breaker closed - service recovered');
    }
  }

  /**
   * Enhanced lock acquisition with retries, exponential backoff, and circuit breaker
   * @private
   * @param {string} lockKey - Unique identifier for the lock operation
   * @param {Object} options - Lock acquisition options
   * @returns {Object} Lock acquisition result
   */
  acquireLockWithRetry(lockKey = 'id_generation', options = {}) {
    // Check circuit breaker first
    if (!this.checkCircuitBreakerStatus()) {
      return {
        success: false,
        lock: null,
        reason: 'CIRCUIT_BREAKER_OPEN',
        error: 'Service temporarily unavailable due to repeated failures'
      };
    }
    
    const lock = LockService.getScriptLock();
    let attempts = 0;
    const maxAttempts = options.maxAttempts || this.lockConfig.retryAttempts;
    const baseDelay = options.baseDelay || 1000;
    
    while (attempts < maxAttempts) {
      try {
        if (lock.tryLock(this.lockConfig.timeout)) {
          this.recordCircuitBreakerSuccess();
          this.logger.debug('Lock acquired successfully', {
            lockKey,
            attempts: attempts + 1,
            maxAttempts
          });
          
          return {
            success: true,
            lock: lock,
            attempts: attempts + 1
          };
        }
      } catch (error) {
        this.logger.warn('Lock acquisition attempt failed', {
          lockKey,
          attempt: attempts + 1,
          error: error.message
        });
      }
      
      attempts++;
      
      if (attempts < maxAttempts) {
        const backoffDelay = baseDelay * Math.pow(this.lockConfig.backoffMultiplier, attempts);
        const jitteredDelay = backoffDelay + (Math.random() * 1000); // Add jitter
        
        this.logger.debug('Retrying lock acquisition', {
          lockKey,
          attempt: attempts + 1,
          maxAttempts,
          backoffDelay: Math.round(jitteredDelay)
        });
        
        Utilities.sleep(jitteredDelay);
      }
    }
    
    // All attempts failed
    this.recordCircuitBreakerFailure();
    this.performanceMetrics.lockTimeouts++;
    
    return {
      success: false,
      lock: null,
      reason: 'LOCK_TIMEOUT',
      attempts: attempts,
      error: `Failed to acquire lock after ${attempts} attempts`
    };
  }

  /**
   * Safely release lock with error handling
   * @private
   * @param {Object} lock - Lock object to release
   * @param {string} lockKey - Lock identifier for logging
   */
  releaseLockSafely(lock, lockKey = 'id_generation') {
    try {
      if (lock) {
        lock.releaseLock();
        this.logger.debug('Lock released successfully', { lockKey });
      }
    } catch (error) {
      this.logger.error('Failed to release lock', {
        lockKey,
        error: error.message
      });
    }
  }

  /**
   * Initialize cache warming for frequently used entity types
   * @private
   */
  warmCache() {
    try {
      this.logger.info('Starting cache warmup process');
      
      // Get all entity types from ID tracking sheet
      const trackingData = this.db.findRecords(this.idTrackingSheet, {});
      
      if (trackingData && trackingData.length > 0) {
        trackingData.forEach(record => {
          const entityType = record['Form Type'];
          const lastId = parseInt(record['Last ID'], 10) || 0;
          
          // Warm both in-memory and PropertiesService cache
          this.setCachedLastId(entityType, lastId, 'WARMUP');
        });
        
        this.logger.info('Cache warmup completed', {
          entitiesWarmed: trackingData.length
        });
      }
    } catch (error) {
      this.logger.error('Cache warmup failed', { error: error.message });
    }
  }

  /**
   * Get cached last ID with multi-level cache hierarchy
   * @private
   * @param {string} entityType - Entity type to get cached ID for
   * @param {string} priority - Cache priority ('HIGH', 'NORMAL', 'LOW')
   * @returns {Object} Cache result with value and source
   */
  getCachedId(entityType, priority = 'NORMAL') {
    const startTime = Date.now();
    
    try {
      // Level 1: Check in-memory cache first (fastest)
      const inMemoryResult = this.getFromInMemoryCache(entityType);
      if (inMemoryResult.found) {
        this.cacheStats.hits++;
        this.logger.debug('Cache hit - in-memory', {
          entityType,
          value: inMemoryResult.value,
          responseTime: Date.now() - startTime
        });
        
        return {
          found: true,
          value: inMemoryResult.value,
          source: 'IN_MEMORY',
          responseTime: Date.now() - startTime
        };
      }
      
      // Level 2: Check PropertiesService cache
      const propertiesResult = this.getFromPropertiesCache(entityType);
      if (propertiesResult.found) {
        // Promote to in-memory cache for faster future access
        this.setInMemoryCache(entityType, propertiesResult.value, priority);
        
        this.cacheStats.hits++;
        this.logger.debug('Cache hit - PropertiesService', {
          entityType,
          value: propertiesResult.value,
          responseTime: Date.now() - startTime
        });
        
        return {
          found: true,
          value: propertiesResult.value,
          source: 'PROPERTIES_SERVICE',
          responseTime: Date.now() - startTime
        };
      }
      
      // Cache miss
      this.cacheStats.misses++;
      this.updateCacheHitRate();
      
      return {
        found: false,
        value: null,
        source: 'MISS',
        responseTime: Date.now() - startTime
      };
      
    } catch (error) {
      this.logger.error('Cache retrieval failed', {
        entityType,
        error: error.message
      });
      
      return {
        found: false,
        value: null,
        source: 'ERROR',
        error: error.message
      };
    }
  }

  /**
   * Get value from in-memory cache
   * @private
   * @param {string} entityType
   * @returns {Object} Cache result
   */
  getFromInMemoryCache(entityType) {
    const cacheEntry = this.inMemoryCache.get(entityType);
    
    if (!cacheEntry) {
      return { found: false, value: null };
    }
    
    // Check if entry is still valid
    const now = Date.now();
    if (now - cacheEntry.timestamp > this.cacheConfig.propertiesServiceTTL) {
      this.inMemoryCache.delete(entityType);
      return { found: false, value: null };
    }
    
    // Update access time for LRU eviction
    cacheEntry.lastAccessed = now;
    cacheEntry.accessCount++;
    
    return {
      found: true,
      value: cacheEntry.value
    };
  }

  /**
   * Get value from PropertiesService cache
   * @private
   * @param {string} entityType
   * @returns {Object} Cache result
   */
  getFromPropertiesCache(entityType) {
    try {
      const key = `lastId_${entityType}`;
      const propertiesService = PropertiesService.getScriptProperties();
      const cached = propertiesService.getProperty(key);
      
      if (!cached) {
        return { found: false, value: null };
      }
      
      const cacheData = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache entry is still valid
      if (now - cacheData.timestamp > this.cacheConfig.propertiesServiceTTL) {
        propertiesService.deleteProperty(key);
        return { found: false, value: null };
      }
      
      return {
        found: true,
        value: parseInt(cacheData.value, 10)
      };
      
    } catch (error) {
      this.logger.warn('PropertiesService cache read failed', {
        entityType,
        error: error.message
      });
      
      return { found: false, value: null };
    }
  }

  /**
   * Set value in in-memory cache with LRU eviction
   * @private
   * @param {string} entityType
   * @param {number} value
   * @param {string} priority
   */
  setInMemoryCache(entityType, value, priority = 'NORMAL') {
    const now = Date.now();
    
    // Check if cache is full and needs eviction
    if (this.inMemoryCache.size >= this.cacheConfig.inMemorySize) {
      this.evictLRUEntry();
    }
    
    const cacheEntry = {
      value: value,
      timestamp: now,
      lastAccessed: now,
      accessCount: 1,
      priority: priority
    };
    
    this.inMemoryCache.set(entityType, cacheEntry);
  }

  /**
   * Evict least recently used entry from in-memory cache
   * @private
   */
  evictLRUEntry() {
    let oldestKey = null;
    let oldestTime = Date.now();
    
    // Find the least recently used entry with lowest priority
    for (const [key, entry] of this.inMemoryCache.entries()) {
      if (entry.priority !== 'HIGH' && entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.inMemoryCache.delete(oldestKey);
      this.cacheStats.evictions++;
      
      this.logger.debug('Cache entry evicted', {
        evictedKey: oldestKey,
        cacheSize: this.inMemoryCache.size
      });
    }
  }

  /**
   * Set cached last ID in both cache levels
   * @private
   * @param {string} entityType
   * @param {number} lastId
   * @param {string} source - Source of the update ('GENERATION', 'WARMUP', 'REFRESH')
   */
  setCachedLastId(entityType, lastId, source = 'GENERATION') {
    const now = Date.now();
    
    try {
      // Update in-memory cache
      const priority = source === 'GENERATION' ? 'HIGH' : 'NORMAL';
      this.setInMemoryCache(entityType, lastId, priority);
      
      // Update PropertiesService cache
      const key = `lastId_${entityType}`;
      const cacheData = {
        value: lastId,
        timestamp: now,
        source: source,
        version: '3.0.0'
      };
      
      const propertiesService = PropertiesService.getScriptProperties();
      propertiesService.setProperty(key, JSON.stringify(cacheData));
      
      this.logger.debug('Cache updated', {
        entityType,
        lastId,
        source,
        cacheSize: this.inMemoryCache.size
      });
      
    } catch (error) {
      this.logger.error('Cache update failed', {
        entityType,
        lastId,
        source,
        error: error.message
      });
    }
  }

  /**
   * Invalidate cache based on strategy and criteria
   * @private
   * @param {string} strategy - Invalidation strategy ('TIME', 'USAGE', 'MANUAL', 'ALL')
   * @param {Object} criteria - Invalidation criteria
   */
  invalidateCache(strategy = 'MANUAL', criteria = {}) {
    try {
      let invalidatedCount = 0;
      const now = Date.now();
      
      switch (strategy) {
        case 'TIME':
          // Invalidate entries older than specified time
          const maxAge = criteria.maxAge || this.cacheConfig.propertiesServiceTTL;
          
          for (const [key, entry] of this.inMemoryCache.entries()) {
            if (now - entry.timestamp > maxAge) {
              this.inMemoryCache.delete(key);
              invalidatedCount++;
            }
          }
          break;
          
        case 'USAGE':
          // Invalidate based on usage threshold
          const threshold = criteria.threshold || this.cacheConfig.invalidationThreshold;
          
          if (this.cacheStats.hits + this.cacheStats.misses > 0) {
            const hitRate = this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses);
            
            if (hitRate < threshold) {
              this.inMemoryCache.clear();
              invalidatedCount = this.inMemoryCache.size;
            }
          }
          break;
          
        case 'MANUAL':
          // Invalidate specific entity type
          if (criteria.entityType) {
            if (this.inMemoryCache.has(criteria.entityType)) {
              this.inMemoryCache.delete(criteria.entityType);
              invalidatedCount = 1;
            }
            
            // Also invalidate PropertiesService cache
            const key = `lastId_${criteria.entityType}`;
            PropertiesService.getScriptProperties().deleteProperty(key);
          }
          break;
          
        case 'ALL':
          // Clear all caches
          invalidatedCount = this.inMemoryCache.size;
          this.inMemoryCache.clear();
          
          // Clear PropertiesService cache entries
          const propertiesService = PropertiesService.getScriptProperties();
          const allProperties = propertiesService.getProperties();
          
          for (const key in allProperties) {
            if (key.startsWith('lastId_')) {
              propertiesService.deleteProperty(key);
            }
          }
          break;
      }
      
      this.logger.info('Cache invalidation completed', {
        strategy,
        criteria,
        invalidatedCount
      });
      
    } catch (error) {
      this.logger.error('Cache invalidation failed', {
        strategy,
        criteria,
        error: error.message
      });
    }
  }

  /**
   * Update cache hit rate metric
   * @private
   */
  updateCacheHitRate() {
    const totalRequests = this.cacheStats.hits + this.cacheStats.misses;
    if (totalRequests > 0) {
      this.performanceMetrics.cacheHitRate = this.cacheStats.hits / totalRequests;
    }
  }

  /**
   * Check quota status and apply throttling if necessary
   * @private
   * @param {string} entityType - Entity type for quota checking
   * @returns {Object} Quota check result
   */
  async checkQuotaAndThrottling(entityType) {
    const startTime = Date.now();
    
    try {
      // Check if quota monitoring is enabled
      if (!this.quotaMonitor) {
        return {
          allowed: true,
          quotaStatus: 'MONITORING_DISABLED',
          throttlingApplied: false
        };
      }
      
      // Record the ID generation attempt
      await this.quotaMonitor.recordUsage('idGenerationQuota', 1, {
        entityType: entityType,
        timestamp: Date.now(),
        source: 'IdService'
      });
      
      // Check current quota status
      const quotaStatus = await this.quotaMonitor.getQuotaStatus('idGenerationQuota');
      
      // Check if throttling should be applied
      const throttlingResult = await this.quotaMonitor.checkThrottling('idGenerationQuota');
      
      if (throttlingResult.shouldThrottle) {
        // Apply throttling delay
        const delay = throttlingResult.delayMs || this.quotaConfig.throttlingDelay;
        
        this.logger.warn('Quota throttling applied', {
          entityType,
          delay,
          quotaUsage: quotaStatus.usagePercentage,
          reason: throttlingResult.reason
        });
        
        // Wait for the specified delay
        await this.sleep(delay);
        
        this.performanceMetrics.throttlingEvents++;
      }
      
      // Check if quota is exceeded
      if (quotaStatus.usagePercentage >= 100) {
        this.logger.error('Quota limit exceeded', {
          entityType,
          quotaUsage: quotaStatus.usagePercentage,
          limit: quotaStatus.limit
        });
        
        return {
          allowed: false,
          quotaStatus: 'EXCEEDED',
          throttlingApplied: throttlingResult.shouldThrottle,
          error: 'QUOTA_EXCEEDED'
        };
      }
      
      // Check if approaching quota limit
      if (quotaStatus.usagePercentage >= this.quotaConfig.warningThreshold) {
        this.logger.warn('Approaching quota limit', {
          entityType,
          quotaUsage: quotaStatus.usagePercentage,
          threshold: this.quotaConfig.warningThreshold
        });
      }
      
      return {
        allowed: true,
        quotaStatus: 'WITHIN_LIMITS',
        throttlingApplied: throttlingResult.shouldThrottle,
        usagePercentage: quotaStatus.usagePercentage,
        responseTime: Date.now() - startTime
      };
      
    } catch (error) {
      this.logger.error('Quota check failed', {
        entityType,
        error: error.message
      });
      
      // Fail open - allow operation if quota check fails
      return {
        allowed: true,
        quotaStatus: 'CHECK_FAILED',
        throttlingApplied: false,
        error: error.message
      };
    }
  }
  
  /**
   * Record successful ID generation for quota tracking
   * @private
   * @param {string} entityType - Entity type
   * @param {string} generatedId - Generated ID
   * @param {number} processingTime - Time taken to generate ID
   */
  async recordQuotaUsage(entityType, generatedId, processingTime) {
    try {
      if (!this.quotaMonitor) {
        return;
      }
      
      // Record successful generation
      await this.quotaMonitor.recordUsage('idGenerationQuota', 1, {
        entityType: entityType,
        generatedId: generatedId,
        processingTime: processingTime,
        timestamp: Date.now(),
        source: 'IdService',
        operation: 'successful_generation'
      });
      
      // Update performance metrics
      this.performanceMetrics.totalGenerations++;
      this.performanceMetrics.averageGenerationTime = 
        (this.performanceMetrics.averageGenerationTime + processingTime) / 2;
      
    } catch (error) {
      this.logger.error('Failed to record quota usage', {
        entityType,
        generatedId,
        error: error.message
      });
    }
  }
  
  /**
   * Get quota monitoring statistics
   * @public
   * @returns {Object} Quota statistics
   */
  async getQuotaStatistics() {
    try {
      if (!this.quotaMonitor) {
        return {
          available: false,
          reason: 'Quota monitoring service not available'
        };
      }
      
      const quotaStatus = await this.quotaMonitor.getQuotaStatus('idGenerationQuota');
      const alerts = await this.quotaMonitor.getAlerts('idGenerationQuota');
      
      return {
        available: true,
        quota: quotaStatus,
        alerts: alerts,
        performance: this.performanceMetrics,
        cache: this.cacheStats
      };
      
    } catch (error) {
      this.logger.error('Failed to get quota statistics', {
        error: error.message
      });
      
      return {
        available: false,
        error: error.message
      };
    }
  }
  
  /**
   * Sleep utility for throttling
   * @private
   * @param {number} ms - Milliseconds to sleep
   */
  sleep(ms) {
    return new Promise(resolve => {
      Utilities.sleep(ms);
      resolve();
    });
  }

  /**
   * Generate next unique ID with enhanced concurrency control, caching, and quota monitoring
   * @public
   * @param {string} entityType - Type of entity to generate ID for
   * @param {Object} options - Generation options
   * @returns {Promise<string>} Generated ID
   */
  async getNextId(entityType, options = {}) {
    const startTime = Date.now();
    const operationId = `${entityType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.logger.info('ID generation started', {
      entityType,
      operationId,
      options
    });
    
    try {
      // Check circuit breaker status
      if (!this.checkCircuitBreakerStatus()) {
        throw new AppScriptError('ID_GENERATION_CIRCUIT_OPEN', 
          'Circuit breaker is open - service temporarily unavailable');
      }
      
      // Check quota and apply throttling
      const quotaResult = await this.checkQuotaAndThrottling(entityType);
      if (!quotaResult.allowed) {
        throw new AppScriptError('ID_GENERATION_QUOTA_EXCEEDED', 
          `Quota exceeded for entity type: ${entityType}`);
      }
      
      // Attempt ID generation with enhanced lock management
      const lockResult = this.acquireLockWithRetry();
      if (!lockResult.success) {
        throw new AppScriptError('ID_GENERATION_LOCK_TIMEOUT', 
          `Could not acquire lock: ${lockResult.error}`);
      }
      
      let generatedId;
      try {
        generatedId = await this.generateIdWithCaching(entityType, options);
      } finally {
        this.releaseLockSafely(lockResult.lock);
      }
      
      // Record successful generation
      const processingTime = Date.now() - startTime;
      await this.recordQuotaUsage(entityType, generatedId, processingTime);
      this.recordCircuitBreakerSuccess();
      
      this.performanceMetrics.totalRequests++;
      this.performanceMetrics.successfulRequests++;
      this.performanceMetrics.averageResponseTime = 
        (this.performanceMetrics.averageResponseTime + processingTime) / 2;
      
      this.logger.info('ID generation completed', {
        entityType,
        operationId,
        generatedId,
        processingTime,
        quotaThrottling: quotaResult.throttlingApplied
      });
      
      return generatedId;
      
    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      // Record circuit breaker failure
      this.recordCircuitBreakerFailure();
      
      this.logger.error('ID generation failed', {
        entityType,
        operationId,
        error: error.message,
        processingTime
      });
      
      // Re-throw with enhanced error context
      if (error instanceof AppScriptError) {
        throw error;
      }
      
      throw new AppScriptError('ID_GENERATION_FAILED', 
        `Failed to generate ID for ${entityType}: ${error.message}`);
    }
  }
  
  /**
   * Generate ID with advanced caching integration
   * @private
   * @param {string} entityType - Entity type
   * @param {Object} options - Generation options
   * @returns {Promise<string>} Generated ID
   */
  async generateIdWithCaching(entityType, options = {}) {
    try {
      // Try to get last ID from multi-level cache
      const cacheResult = this.getCachedId(entityType, options.priority || 'NORMAL');
      let lastId = null;
      
      if (cacheResult.found) {
        lastId = cacheResult.value;
        this.logger.debug('Using cached last ID', {
          entityType,
          lastId,
          cacheSource: cacheResult.source,
          responseTime: cacheResult.responseTime
        });
      } else {
        // Cache miss - fetch from database
        this.logger.debug('Cache miss - fetching from database', {
          entityType
        });
        
        const trackingData = this.db.findRecords(this.idTrackingSheet, {'Form Type': entityType});
        if (!trackingData || trackingData.length === 0) {
          throw new AppScriptError('INVALID_ENTITY_TYPE', 
            `Entity type '${entityType}' not found in tracking sheet`);
        }
        
        lastId = parseInt(trackingData[0]['Last ID'], 10) || 0;
        
        // Cache the fetched value for future use
        this.setCachedLastId(entityType, lastId, 'DATABASE_FETCH');
      }
      
      // Generate new ID
      const newId = lastId + 1;
      
      // Update tracking sheet with new ID
      const updateResult = this.db.updateRecord(
        this.idTrackingSheet, 
        'Form Type', 
        entityType, 
        {'Last ID': newId}
      );
      
      if (!updateResult) {
        throw new AppScriptError('DATABASE_UPDATE_FAILED', 
          `Failed to update tracking sheet for ${entityType}`);
      }
      
      // Update cache with new ID
      this.setCachedLastId(entityType, newId, 'GENERATION');
      
      // Get prefix and construct final ID
      const trackingData = this.db.findRecords(this.idTrackingSheet, {'Form Type': entityType});
      const prefix = trackingData[0]['Prefix'] || '';
      const paddingLength = options.paddingLength || 4;
      const paddedId = newId.toString().padStart(paddingLength, '0');
      
      const finalId = `${prefix}${paddedId}`;
      
      this.logger.debug('ID generated successfully', {
        entityType,
        lastId,
        newId,
        prefix,
        finalId
      });
      
      return finalId;
      
    } catch (error) {
      this.logger.error('ID generation with caching failed', {
        entityType,
        error: error.message
      });
      
      throw error;
     }
   }
   
   /**
    * Get comprehensive service health status
    * @public
    * @returns {Object} Service health information
    */
   getHealthStatus() {
     try {
       const now = Date.now();
       const uptime = now - this.performanceMetrics.startTime;
       
       return {
         status: this.circuitBreaker.isOpen ? 'DEGRADED' : 'HEALTHY',
         uptime: uptime,
         circuitBreaker: {
           isOpen: this.circuitBreaker.isOpen,
           failureCount: this.circuitBreaker.failureCount,
           lastFailureTime: this.circuitBreaker.lastFailureTime,
           nextRetryTime: this.circuitBreaker.nextRetryTime
         },
         performance: {
           totalRequests: this.performanceMetrics.totalRequests,
           successfulRequests: this.performanceMetrics.successfulRequests,
           failedRequests: this.performanceMetrics.failedRequests,
           averageResponseTime: this.performanceMetrics.averageResponseTime,
           throttlingEvents: this.performanceMetrics.throttlingEvents
         },
         cache: {
           hitRate: this.performanceMetrics.cacheHitRate,
           size: this.inMemoryCache.size,
           maxSize: this.cacheConfig.inMemorySize,
           hits: this.cacheStats.hits,
           misses: this.cacheStats.misses,
           evictions: this.cacheStats.evictions
         },
         quotaMonitoring: {
           enabled: !!this.quotaMonitor,
           warningThreshold: this.quotaConfig.warningThreshold,
           throttlingEnabled: this.quotaConfig.throttlingEnabled
         },
         timestamp: now
       };
     } catch (error) {
       this.logger.error('Failed to get health status', {
         error: error.message
       });
       
       return {
         status: 'ERROR',
         error: error.message,
         timestamp: Date.now()
       };
     }
   }
   
   /**
    * Reset performance metrics and cache statistics
    * @public
    * @param {Object} options - Reset options
    */
   resetMetrics(options = {}) {
     try {
       if (options.performance !== false) {
         this.performanceMetrics = {
           startTime: Date.now(),
           totalRequests: 0,
           successfulRequests: 0,
           failedRequests: 0,
           averageResponseTime: 0,
           cacheHitRate: 0,
           throttlingEvents: 0,
           totalGenerations: 0,
           averageGenerationTime: 0
         };
       }
       
       if (options.cache !== false) {
         this.cacheStats = {
           hits: 0,
           misses: 0,
           evictions: 0
         };
       }
       
       if (options.circuitBreaker !== false) {
         this.circuitBreaker = {
           isOpen: false,
           failureCount: 0,
           lastFailureTime: null,
           nextRetryTime: null
         };
       }
       
       this.logger.info('Metrics reset completed', {
         options,
         timestamp: Date.now()
       });
       
     } catch (error) {
       this.logger.error('Failed to reset metrics', {
         error: error.message
       });
     }
   }
   
   /**
    * Perform cache maintenance operations
    * @public
    * @param {Object} options - Maintenance options
    */
   performCacheMaintenance(options = {}) {
     try {
       const startTime = Date.now();
       let operationsPerformed = [];
       
       // Clean expired entries
       if (options.cleanExpired !== false) {
         this.invalidateCache('TIME', {
           maxAge: this.cacheConfig.propertiesServiceTTL
         });
         operationsPerformed.push('CLEAN_EXPIRED');
       }
       
       // Optimize cache if hit rate is low
       if (options.optimizeCache !== false) {
         const totalRequests = this.cacheStats.hits + this.cacheStats.misses;
         if (totalRequests > 100) {
           const hitRate = this.cacheStats.hits / totalRequests;
           if (hitRate < this.cacheConfig.invalidationThreshold) {
             this.warmCache();
             operationsPerformed.push('CACHE_WARMING');
           }
         }
       }
       
       // Compact in-memory cache if needed
       if (options.compactMemory !== false) {
         const utilizationRate = this.inMemoryCache.size / this.cacheConfig.inMemorySize;
         if (utilizationRate > 0.8) {
           // Remove low-priority entries
           for (const [key, entry] of this.inMemoryCache.entries()) {
             if (entry.priority === 'LOW' && entry.accessCount < 2) {
               this.inMemoryCache.delete(key);
             }
           }
           operationsPerformed.push('MEMORY_COMPACTION');
         }
       }
       
       const maintenanceTime = Date.now() - startTime;
       
       this.logger.info('Cache maintenance completed', {
         operations: operationsPerformed,
         maintenanceTime,
         cacheSize: this.inMemoryCache.size,
         hitRate: this.performanceMetrics.cacheHitRate
       });
       
       return {
         success: true,
         operations: operationsPerformed,
         maintenanceTime
       };
       
     } catch (error) {
       this.logger.error('Cache maintenance failed', {
         error: error.message
       });
       
       return {
         success: false,
         error: error.message
       };
     }
   }
   
   /**
    * Export service configuration and statistics for debugging
    * @public
    * @returns {Object} Service diagnostic information
    */
   exportDiagnostics() {
     try {
       return {
         version: '3.0.0',
         timestamp: Date.now(),
         configuration: {
           lockConfig: this.lockConfig,
           cacheConfig: this.cacheConfig,
           quotaConfig: this.quotaConfig
         },
         health: this.getHealthStatus(),
         performance: this.performanceMetrics,
         cache: {
           stats: this.cacheStats,
           inMemoryEntries: Array.from(this.inMemoryCache.entries()).map(([key, entry]) => ({
             key,
             timestamp: entry.timestamp,
             lastAccessed: entry.lastAccessed,
             accessCount: entry.accessCount,
             priority: entry.priority
           }))
         }
       };
     } catch (error) {
       this.logger.error('Failed to export diagnostics', {
         error: error.message
       });
       
       return {
         error: error.message,
         timestamp: Date.now()
       };
     }
   }
 }

// Export IdService globally for Google Apps Script environment
if (typeof globalThis !== 'undefined') {
  globalThis.IdService = IdService;
}

// Also make it available as a module export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = IdService;
}

// --- Global Instance & Legacy Wrapper (Lazy Loading) ---
let idServiceInstance = null;

const IdServiceGlobal = {
   // Core ID generation
   getNextId: async (entityType, options) => {
     if (!idServiceInstance) {
       idServiceInstance = new IdService();
     }
     return await idServiceInstance.getNextId(entityType, options);
   },
   
   // Quota and monitoring
   getQuotaStatistics: async () => {
     if (!idServiceInstance) {
       idServiceInstance = new IdService();
     }
     return await idServiceInstance.getQuotaStatistics();
   },
   
   // Cache management
   invalidateCache: (strategy, criteria) => {
     if (!idServiceInstance) {
       idServiceInstance = new IdService();
     }
     return idServiceInstance.invalidateCache(strategy, criteria);
   },
   performCacheMaintenance: (options) => {
     if (!idServiceInstance) {
       idServiceInstance = new IdService();
     }
     return idServiceInstance.performCacheMaintenance(options);
   },
   getCacheStatistics: () => {
     if (!idServiceInstance) {
       idServiceInstance = new IdService();
     }
     return idServiceInstance.cacheStats;
   },
   
   // Performance and health monitoring
   getHealthStatus: () => {
     if (!idServiceInstance) {
       idServiceInstance = new IdService();
     }
     return idServiceInstance.getHealthStatus();
   },
   getPerformanceMetrics: () => {
     if (!idServiceInstance) {
       idServiceInstance = new IdService();
     }
     return idServiceInstance.performanceMetrics;
   },
   resetMetrics: (options) => {
     if (!idServiceInstance) {
       idServiceInstance = new IdService();
     }
     return idServiceInstance.resetMetrics(options);
   },
   
   // Diagnostics and debugging
   exportDiagnostics: () => {
     if (!idServiceInstance) {
       idServiceInstance = new IdService();
     }
     return idServiceInstance.exportDiagnostics();
   },
   
   // Service management
   initialize: async () => {
     if (!idServiceInstance) {
       idServiceInstance = new IdService();
     }
     return await idServiceInstance.initialize();
   },
   warmCache: () => {
     if (!idServiceInstance) {
       idServiceInstance = new IdService();
     }
     return idServiceInstance.warmCache();
   }
 };
