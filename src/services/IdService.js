/**
 * @file IdService.js
 * @description Service for generating unique, sequential, and concurrency-safe IDs.
 * It uses a dedicated tracking sheet and a lock to prevent race conditions.
 * @version 2.0.0
 */

class IdService extends BaseService {
  constructor() {
    super();
    this.idTrackingSheet = Config.SHEETS.ID_TRACKING;
    this.db = getGlobalDB();
    this.logger.info('IdService initialized');
  }

  /**
   * Generates the next unique ID for a given entity type in a concurrency-safe manner.
   * @param {string} entityType - The type of entity (e.g., 'Engineer', 'Retailer').
   * @returns {string} The new unique ID (e.g., 'EN0001').
   */
  getNextId(entityType) {
    return this.executeWithErrorHandlingSync(() => {
      const lock = LockService.getScriptLock();
      const lockAcquired = lock.tryLock(15000); // Wait for 15 seconds

      if (!lockAcquired) {
        throw new AppScriptError('ID_GENERATION_LOCK_TIMEOUT', `Could not acquire lock for ID generation for entity: ${entityType}`);
      }

      this.logger.debug('Lock acquired for ID generation', { entityType });

      try {
        const trackingData = this.db.findRecords(this.idTrackingSheet, { 'Form Type': entityType });

        if (!trackingData || trackingData.length === 0) {
          throw new AppScriptError('CONFIG_ENTITY_TYPE_NOT_FOUND', `Entity type "${entityType}" not found in ID Tracking sheet.`);
        }

        const record = trackingData[0];
        const prefix = record['Prefix'];
        let lastId = parseInt(record['Last ID'], 10) || 0;
        
        const newIdNumber = lastId + 1;
        
        // Update the tracking sheet with the new last ID
        const updated = this.db.updateRecord(this.idTrackingSheet, 'Form Type', entityType, { 'Last ID': newIdNumber });

        if (!updated) {
            throw new AppScriptError('ID_UPDATE_FAILED', `Failed to update the last ID for entity: ${entityType}`);
        }

        const newId = `${prefix}${('0000' + newIdNumber).slice(-4)}`;
        this.logger.info('New ID generated successfully', { entityType, newId });
        
        return newId;

      } finally {
        lock.releaseLock();
        this.logger.debug('Lock released for ID generation', { entityType });
      }
    }, { entityType }, 'getNextId');
  }
}

// --- Global Instance & Legacy Wrapper ---
const idServiceInstance = new IdService();

const IdServiceGlobal = {
  getNextId: (entityType) => idServiceInstance.getNextId(entityType)
};
