/**
 * DisputeHandler.test.js
 * Comprehensive test suite for DisputeHandler functionality
 * 
 * @fileoverview Unit and integration tests for dispute resolution workflow
 * @version 1.0.0
 * @author Senior Development Agent
 */

// Mock dependencies
const mockConfig = {
  SHEETS: {
    DISPUTES: 'Disputes'
  }
};

const mockLogger = {
  info: jasmine.createSpy('info'),
  error: jasmine.createSpy('error'),
  warn: jasmine.createSpy('warn'),
  debug: jasmine.createSpy('debug')
};

const mockDatabase = {
  getSheet: jasmine.createSpy('getSheet').and.returnValue({
    appendRow: jasmine.createSpy('appendRow'),
    getDataRange: jasmine.createSpy('getDataRange').and.returnValue({
      getValues: jasmine.createSpy('getValues').and.returnValue([
        ['Timestamp', 'Dispute ID', 'Type', 'Title', 'Description', 'Priority', 'Status', 'Submitted By Name', 'Submitted By Email', 'Submitted By Role', 'Assigned To', 'Assigned At', 'Resolution Summary', 'Resolution Actions', 'Resolved By', 'Resolved At', 'Created At', 'Last Updated', 'History']
      ])
    }),
    getRange: jasmine.createSpy('getRange').and.returnValue({
      setValues: jasmine.createSpy('setValues')
    })
  })
};

const mockWhatsAppService = {
  sendMessage: jasmine.createSpy('sendMessage').and.returnValue(Promise.resolve())
};

const mockIdService = {
  getNextId: jasmine.createSpy('getNextId').and.returnValue(Promise.resolve(1))
};

const mockValidator = {
  validateEmail: jasmine.createSpy('validateEmail').and.returnValue(true),
  validatePhone: jasmine.createSpy('validatePhone').and.returnValue(true)
};

// Mock GlobalServiceLocator
global.GlobalServiceLocator = {
  get: jasmine.createSpy('get').and.callFake((serviceName) => {
    switch (serviceName) {
      case 'Config': return mockConfig;
      case 'DatabaseService': return mockDatabase;
      case 'ValidationService': return mockValidator;
      case 'WhatsAppService': return mockWhatsAppService;
      case 'IdService': return mockIdService;
      default: return null;
    }
  }),
  register: jasmine.createSpy('register')
};

// Mock Logger
global.Logger = {
  createChildLogger: jasmine.createSpy('createChildLogger').and.returnValue(mockLogger)
};

// Mock PropertiesService
global.PropertiesService = {
  getScriptProperties: jasmine.createSpy('getScriptProperties').and.returnValue({
    getProperty: jasmine.createSpy('getProperty').and.returnValue('+1234567890')
  })
};

// Mock AppScriptError
global.AppScriptError = class AppScriptError extends Error {
  constructor(code, message, context) {
    super(message);
    this.code = code;
    this.context = context;
  }
};

// Load the DisputeHandler
require('../../src/handlers/DisputeHandler.js');

describe('DisputeHandler', () => {
  let disputeHandler;
  let mockUserContext;
  let mockDisputeData;

  beforeEach(() => {
    // Reset all spies
    jasmine.createSpyObj.calls.reset();
    
    // Create fresh instance
    disputeHandler = new DisputeHandlerService();
    
    // Setup mock data
    mockUserContext = {
      name: 'John Doe',
      email: 'john.doe@anwar.com',
      role: 'cro'
    };

    mockDisputeData = {
      type: 'registration',
      title: 'Registration Issue',
      description: 'Unable to complete registration process',
      priority: 'high'
    };
  });

  describe('Initialization', () => {
    it('should initialize with correct service name', () => {
      expect(disputeHandler.serviceName).toBe('DisputeHandler');
    });

    it('should initialize all required dependencies', () => {
      expect(disputeHandler.config).toBeDefined();
      expect(disputeHandler.database).toBeDefined();
      expect(disputeHandler.validator).toBeDefined();
      expect(disputeHandler.whatsAppService).toBeDefined();
      expect(disputeHandler.idService).toBeDefined();
    });

    it('should initialize state machine and notification service', () => {
      expect(disputeHandler.stateMachine).toBeDefined();
      expect(disputeHandler.notificationService).toBeDefined();
    });

    it('should register with GlobalServiceLocator', () => {
      expect(GlobalServiceLocator.register).toHaveBeenCalledWith('DisputeHandler', jasmine.any(Object));
    });
  });

  describe('submitDispute', () => {
    it('should successfully submit a valid dispute', async () => {
      const result = await disputeHandler.submitDispute(mockDisputeData, mockUserContext);
      
      expect(result.success).toBe(true);
      expect(result.disputeId).toMatch(/^DSP-\d{6}$/);
      expect(result.status).toBe('submitted');
      expect(result.message).toBe('Dispute submitted successfully');
    });

    it('should validate required fields', async () => {
      const invalidData = { ...mockDisputeData };
      delete invalidData.title;

      try {
        await disputeHandler.submitDispute(invalidData, mockUserContext);
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.code).toBe('VALIDATION_MISSING_FIELD');
        expect(error.message).toContain('title');
      }
    });

    it('should validate dispute type', async () => {
      const invalidData = { ...mockDisputeData, type: 'invalid_type' };

      try {
        await disputeHandler.submitDispute(invalidData, mockUserContext);
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.code).toBe('VALIDATION_INVALID_TYPE');
      }
    });

    it('should validate priority', async () => {
      const invalidData = { ...mockDisputeData, priority: 'invalid_priority' };

      try {
        await disputeHandler.submitDispute(invalidData, mockUserContext);
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.code).toBe('VALIDATION_INVALID_PRIORITY');
      }
    });

    it('should validate title length', async () => {
      const invalidData = { ...mockDisputeData, title: 'a'.repeat(201) };

      try {
        await disputeHandler.submitDispute(invalidData, mockUserContext);
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.code).toBe('VALIDATION_TITLE_TOO_LONG');
      }
    });

    it('should validate description length', async () => {
      const invalidData = { ...mockDisputeData, description: 'a'.repeat(2001) };

      try {
        await disputeHandler.submitDispute(invalidData, mockUserContext);
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.code).toBe('VALIDATION_DESCRIPTION_TOO_LONG');
      }
    });

    it('should generate unique dispute ID', async () => {
      const result1 = await disputeHandler.submitDispute(mockDisputeData, mockUserContext);
      mockIdService.getNextId.and.returnValue(Promise.resolve(2));
      const result2 = await disputeHandler.submitDispute(mockDisputeData, mockUserContext);
      
      expect(result1.disputeId).not.toBe(result2.disputeId);
    });

    it('should insert dispute record into database', async () => {
      await disputeHandler.submitDispute(mockDisputeData, mockUserContext);
      
      expect(mockDatabase.getSheet).toHaveBeenCalledWith('Disputes');
      expect(mockDatabase.getSheet().appendRow).toHaveBeenCalled();
    });

    it('should send notification after submission', async () => {
      await disputeHandler.submitDispute(mockDisputeData, mockUserContext);
      
      expect(mockWhatsAppService.sendMessage).toHaveBeenCalled();
    });

    it('should log audit trail', async () => {
      await disputeHandler.submitDispute(mockDisputeData, mockUserContext);
      
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Dispute submitted successfully',
        jasmine.objectContaining({
          submittedBy: mockUserContext.email,
          type: mockDisputeData.type,
          priority: mockDisputeData.priority
        })
      );
    });
  });

  describe('assignDispute', () => {
    let mockDispute;

    beforeEach(() => {
      mockDispute = {
        id: 'DSP-000001',
        type: 'registration',
        title: 'Test Dispute',
        status: 'submitted',
        submittedBy: mockUserContext
      };
      
      spyOn(disputeHandler, 'getDisputeById').and.returnValue(Promise.resolve(mockDispute));
      spyOn(disputeHandler, 'updateDisputeStatus').and.returnValue(Promise.resolve({ success: true }));
    });

    it('should successfully assign dispute to stakeholder', async () => {
      const stakeholderId = 'cro1@anwar.com';
      const result = await disputeHandler.assignDispute('DSP-000001', stakeholderId, mockUserContext);
      
      expect(result.success).toBe(true);
      expect(result.assignedTo).toBe(stakeholderId);
      expect(result.status).toBe('assigned');
    });

    it('should auto-assign if no stakeholder specified', async () => {
      const result = await disputeHandler.assignDispute('DSP-000001', null, mockUserContext);
      
      expect(result.success).toBe(true);
      expect(result.assignedTo).toBeDefined();
      expect(result.assignedTo).toContain('@anwar.com');
    });

    it('should validate state transition', async () => {
      mockDispute.status = 'closed';
      
      try {
        await disputeHandler.assignDispute('DSP-000001', 'cro1@anwar.com', mockUserContext);
        fail('Should have thrown state transition error');
      } catch (error) {
        expect(error.code).toBe('INVALID_STATE_TRANSITION');
      }
    });

    it('should validate user access', async () => {
      const unauthorizedUser = { ...mockUserContext, role: 'retailer' };
      
      try {
        await disputeHandler.assignDispute('DSP-000001', 'cro1@anwar.com', unauthorizedUser);
        fail('Should have thrown access denied error');
      } catch (error) {
        expect(error.code).toBe('ACCESS_DENIED');
      }
    });

    it('should send assignment notification', async () => {
      await disputeHandler.assignDispute('DSP-000001', 'cro1@anwar.com', mockUserContext);
      
      expect(mockWhatsAppService.sendMessage).toHaveBeenCalled();
    });
  });

  describe('updateDisputeStatus', () => {
    let mockDispute;

    beforeEach(() => {
      mockDispute = {
        id: 'DSP-000001',
        status: 'assigned',
        history: []
      };
      
      spyOn(disputeHandler, 'getDisputeById').and.returnValue(Promise.resolve(mockDispute));
      spyOn(disputeHandler, 'updateDisputeRecord').and.returnValue(Promise.resolve());
    });

    it('should successfully update dispute status', async () => {
      const result = await disputeHandler.updateDisputeStatus('DSP-000001', 'in-review', {
        actor: 'cro1@anwar.com',
        notes: 'Starting review process'
      });
      
      expect(result.success).toBe(true);
      expect(result.status).toBe('in-review');
    });

    it('should validate state transition', async () => {
      try {
        await disputeHandler.updateDisputeStatus('DSP-000001', 'closed');
        fail('Should have thrown state transition error');
      } catch (error) {
        expect(error.code).toBe('INVALID_STATE_TRANSITION');
      }
    });

    it('should create history entry', async () => {
      await disputeHandler.updateDisputeStatus('DSP-000001', 'in-review', {
        actor: 'cro1@anwar.com',
        notes: 'Starting review'
      });
      
      expect(disputeHandler.updateDisputeRecord).toHaveBeenCalledWith(
        'DSP-000001',
        jasmine.objectContaining({
          history: jasmine.arrayContaining([
            jasmine.objectContaining({
              status: 'in-review',
              actor: 'cro1@anwar.com',
              notes: 'Starting review'
            })
          ])
        })
      );
    });

    it('should send status change notification', async () => {
      await disputeHandler.updateDisputeStatus('DSP-000001', 'in-review');
      
      expect(mockWhatsAppService.sendMessage).toHaveBeenCalled();
    });
  });

  describe('resolveDispute', () => {
    let mockDispute;
    let mockResolutionData;

    beforeEach(() => {
      mockDispute = {
        id: 'DSP-000001',
        status: 'in-review',
        assignedTo: 'cro1@anwar.com'
      };
      
      mockResolutionData = {
        summary: 'Issue resolved by updating user permissions',
        actions: ['Updated user role', 'Sent confirmation email']
      };
      
      spyOn(disputeHandler, 'getDisputeById').and.returnValue(Promise.resolve(mockDispute));
      spyOn(disputeHandler, 'updateDisputeStatus').and.returnValue(Promise.resolve({ success: true }));
    });

    it('should successfully resolve dispute', async () => {
      const result = await disputeHandler.resolveDispute('DSP-000001', mockResolutionData, mockUserContext);
      
      expect(result.success).toBe(true);
      expect(result.status).toBe('resolved');
      expect(result.resolution).toBeDefined();
      expect(result.resolution.summary).toBe(mockResolutionData.summary);
    });

    it('should validate resolution data', async () => {
      const invalidResolution = { summary: '' };
      
      try {
        await disputeHandler.resolveDispute('DSP-000001', invalidResolution, mockUserContext);
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.code).toBe('VALIDATION_MISSING_RESOLUTION_SUMMARY');
      }
    });

    it('should validate resolution summary length', async () => {
      const invalidResolution = { summary: 'a'.repeat(1001) };
      
      try {
        await disputeHandler.resolveDispute('DSP-000001', invalidResolution, mockUserContext);
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.code).toBe('VALIDATION_RESOLUTION_SUMMARY_TOO_LONG');
      }
    });

    it('should validate user access for resolution', async () => {
      const unauthorizedUser = { ...mockUserContext, role: 'retailer', email: 'retailer@anwar.com' };
      
      try {
        await disputeHandler.resolveDispute('DSP-000001', mockResolutionData, unauthorizedUser);
        fail('Should have thrown access denied error');
      } catch (error) {
        expect(error.code).toBe('ACCESS_DENIED');
      }
    });

    it('should allow assigned stakeholder to resolve', async () => {
      const assignedUser = { ...mockUserContext, email: 'cro1@anwar.com', role: 'engineer' };
      
      const result = await disputeHandler.resolveDispute('DSP-000001', mockResolutionData, assignedUser);
      
      expect(result.success).toBe(true);
    });
  });

  describe('getDisputeById', () => {
    it('should return cached dispute if available', async () => {
      const mockDispute = { id: 'DSP-000001', status: 'submitted' };
      disputeHandler.cacheDispute(mockDispute);
      
      const result = await disputeHandler.getDisputeById('DSP-000001');
      
      expect(result).toEqual(mockDispute);
    });

    it('should query database if not cached', async () => {
      spyOn(disputeHandler, 'queryDisputeFromDatabase').and.returnValue(Promise.resolve({
        id: 'DSP-000001',
        status: 'submitted'
      }));
      
      const result = await disputeHandler.getDisputeById('DSP-000001');
      
      expect(disputeHandler.queryDisputeFromDatabase).toHaveBeenCalledWith('DSP-000001');
      expect(result.id).toBe('DSP-000001');
    });

    it('should throw error if dispute not found', async () => {
      spyOn(disputeHandler, 'queryDisputeFromDatabase').and.returnValue(Promise.resolve(null));
      
      try {
        await disputeHandler.getDisputeById('DSP-999999');
        fail('Should have thrown not found error');
      } catch (error) {
        expect(error.code).toBe('DISPUTE_NOT_FOUND');
      }
    });
  });

  describe('DisputeStateMachine', () => {
    let stateMachine;

    beforeEach(() => {
      stateMachine = new DisputeStateMachine();
    });

    it('should validate valid state transitions', () => {
      expect(() => {
        stateMachine.validateTransition('submitted', 'assigned');
      }).not.toThrow();
      
      expect(() => {
        stateMachine.validateTransition('assigned', 'in-review');
      }).not.toThrow();
      
      expect(() => {
        stateMachine.validateTransition('in-review', 'resolved');
      }).not.toThrow();
      
      expect(() => {
        stateMachine.validateTransition('resolved', 'closed');
      }).not.toThrow();
    });

    it('should reject invalid state transitions', () => {
      expect(() => {
        stateMachine.validateTransition('submitted', 'resolved');
      }).toThrow();
      
      expect(() => {
        stateMachine.validateTransition('closed', 'in-review');
      }).toThrow();
    });

    it('should return allowed transitions for current state', () => {
      expect(stateMachine.getAllowedTransitions('submitted')).toEqual(['assigned']);
      expect(stateMachine.getAllowedTransitions('assigned')).toEqual(['in-review', 'submitted']);
      expect(stateMachine.getAllowedTransitions('closed')).toEqual([]);
    });

    it('should identify terminal states', () => {
      expect(stateMachine.isTerminalState('closed')).toBe(true);
      expect(stateMachine.isTerminalState('submitted')).toBe(false);
    });
  });

  describe('DisputeAccessControl', () => {
    it('should allow admin to perform all operations', () => {
      const adminUser = { email: 'admin@anwar.com', role: 'admin' };
      
      expect(DisputeAccessControl.validateAccess(adminUser, 'submit')).toBe(true);
      expect(DisputeAccessControl.validateAccess(adminUser, 'assign')).toBe(true);
      expect(DisputeAccessControl.validateAccess(adminUser, 'resolve')).toBe(true);
      expect(DisputeAccessControl.validateAccess(adminUser, 'view_all')).toBe(true);
    });

    it('should allow CRO to assign and resolve disputes', () => {
      const croUser = { email: 'cro@anwar.com', role: 'cro' };
      
      expect(DisputeAccessControl.validateAccess(croUser, 'assign')).toBe(true);
      expect(DisputeAccessControl.validateAccess(croUser, 'resolve')).toBe(true);
      expect(DisputeAccessControl.validateAccess(croUser, 'view_all')).toBe(true);
    });

    it('should allow assigned stakeholder to update status', () => {
      const stakeholder = { email: 'cro1@anwar.com', role: 'engineer' };
      const dispute = { assignedTo: 'cro1@anwar.com' };
      
      expect(DisputeAccessControl.validateAccess(stakeholder, 'update_status', dispute)).toBe(true);
      expect(DisputeAccessControl.validateAccess(stakeholder, 'resolve', dispute)).toBe(true);
    });

    it('should deny unauthorized operations', () => {
      const retailer = { email: 'retailer@anwar.com', role: 'retailer' };
      
      expect(DisputeAccessControl.validateAccess(retailer, 'assign')).toBe(false);
      expect(DisputeAccessControl.validateAccess(retailer, 'view_all')).toBe(false);
    });
  });

  describe('Caching', () => {
    it('should cache disputes after retrieval', async () => {
      const mockDispute = { id: 'DSP-000001', status: 'submitted' };
      disputeHandler.cacheDispute(mockDispute);
      
      const cached = disputeHandler.getCachedDispute('DSP-000001');
      expect(cached).toEqual(mockDispute);
    });

    it('should expire cached disputes after timeout', () => {
      const mockDispute = { id: 'DSP-000001', status: 'submitted' };
      disputeHandler.cacheDispute(mockDispute);
      
      // Simulate cache timeout
      disputeHandler.cacheTimeout = -1;
      
      const cached = disputeHandler.getCachedDispute('DSP-000001');
      expect(cached).toBeNull();
    });

    it('should limit cache size', () => {
      // Fill cache beyond limit
      for (let i = 0; i < 105; i++) {
        disputeHandler.cacheDispute({ id: `DSP-${i.toString().padStart(6, '0')}` });
      }
      
      expect(disputeHandler.disputeCache.size).toBeLessThanOrEqual(100);
    });

    it('should clear cache when requested', () => {
      disputeHandler.cacheDispute({ id: 'DSP-000001' });
      disputeHandler.clearCache();
      
      expect(disputeHandler.disputeCache.size).toBe(0);
    });
  });

  describe('Health Status', () => {
    it('should return comprehensive health status', () => {
      const health = disputeHandler.getHealthStatus();
      
      expect(health.serviceName).toBe('DisputeHandler');
      expect(health.status).toBe('HEALTHY');
      expect(health.version).toBe('1.0.0');
      expect(health.dependencies).toBeDefined();
      expect(health.lastHealthCheck).toBeDefined();
    });

    it('should report dependency status', () => {
      const health = disputeHandler.getHealthStatus();
      
      expect(health.dependencies.config).toBe(true);
      expect(health.dependencies.database).toBe(true);
      expect(health.dependencies.validator).toBe(true);
      expect(health.dependencies.whatsAppService).toBe(true);
      expect(health.dependencies.idService).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      mockDatabase.getSheet.and.throwError('Database connection failed');
      
      try {
        await disputeHandler.submitDispute(mockDisputeData, mockUserContext);
        fail('Should have thrown database error');
      } catch (error) {
        expect(error.code).toBe('DATABASE_INSERT_FAILED');
      }
    });

    it('should handle ID service failures with fallback', async () => {
      mockIdService.getNextId.and.throwError('ID service unavailable');
      
      const result = await disputeHandler.submitDispute(mockDisputeData, mockUserContext);
      
      expect(result.success).toBe(true);
      expect(result.disputeId).toMatch(/^DSP-\d+$/);
    });

    it('should handle notification failures gracefully', async () => {
      mockWhatsAppService.sendMessage.and.throwError('WhatsApp service unavailable');
      
      const result = await disputeHandler.submitDispute(mockDisputeData, mockUserContext);
      
      expect(result.success).toBe(true);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to send dispute submission notification',
        jasmine.any(Object)
      );
    });
  });

  describe('Integration Tests', () => {
    it('should complete full dispute lifecycle', async () => {
      // Submit dispute
      const submitResult = await disputeHandler.submitDispute(mockDisputeData, mockUserContext);
      expect(submitResult.success).toBe(true);
      
      const disputeId = submitResult.disputeId;
      
      // Mock the dispute for subsequent operations
      const mockDispute = {
        id: disputeId,
        status: 'submitted',
        type: mockDisputeData.type,
        title: mockDisputeData.title,
        submittedBy: mockUserContext
      };
      
      spyOn(disputeHandler, 'getDisputeById').and.returnValue(Promise.resolve(mockDispute));
      spyOn(disputeHandler, 'updateDisputeRecord').and.returnValue(Promise.resolve());
      
      // Assign dispute
      const assignResult = await disputeHandler.assignDispute(disputeId, 'cro1@anwar.com', mockUserContext);
      expect(assignResult.success).toBe(true);
      
      // Update to in-review
      mockDispute.status = 'assigned';
      const reviewResult = await disputeHandler.updateDisputeStatus(disputeId, 'in-review');
      expect(reviewResult.success).toBe(true);
      
      // Resolve dispute
      mockDispute.status = 'in-review';
      const resolveResult = await disputeHandler.resolveDispute(disputeId, {
        summary: 'Issue resolved successfully'
      }, mockUserContext);
      expect(resolveResult.success).toBe(true);
      
      // Close dispute
      mockDispute.status = 'resolved';
      const closeResult = await disputeHandler.updateDisputeStatus(disputeId, 'closed');
      expect(closeResult.success).toBe(true);
    });
  });
});

// Export for test runner
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DisputeHandlerService,
    DisputeStateMachine,
    DisputeAccessControl
  };
}

console.log('✅ DisputeHandler tests loaded successfully');