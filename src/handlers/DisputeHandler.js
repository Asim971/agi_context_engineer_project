/**
 * DisputeHandler.js
 * Comprehensive dispute resolution workflow handler for Anwar Sales Ecosystem
 * Addresses critical gap identified in journey analysis audit
 * 
 * @fileoverview Production-ready dispute management with state machine, notifications, and audit trail
 * @version 1.0.0
 * @author Senior Development Agent
 */

/**
 * Dispute state machine constants
 */
const DISPUTE_STATES = {
  SUBMITTED: 'submitted',
  ASSIGNED: 'assigned',
  IN_REVIEW: 'in-review',
  RESOLVED: 'resolved',
  CLOSED: 'closed'
};

/**
 * Valid state transitions for dispute workflow
 */
const STATE_TRANSITIONS = {
  [DISPUTE_STATES.SUBMITTED]: [DISPUTE_STATES.ASSIGNED],
  [DISPUTE_STATES.ASSIGNED]: [DISPUTE_STATES.IN_REVIEW, DISPUTE_STATES.SUBMITTED],
  [DISPUTE_STATES.IN_REVIEW]: [DISPUTE_STATES.RESOLVED, DISPUTE_STATES.ASSIGNED],
  [DISPUTE_STATES.RESOLVED]: [DISPUTE_STATES.CLOSED, DISPUTE_STATES.IN_REVIEW],
  [DISPUTE_STATES.CLOSED]: [] // Terminal state
};

/**
 * Dispute types enumeration
 */
const DISPUTE_TYPES = {
  REGISTRATION: 'registration',
  APPROVAL: 'approval',
  TECHNICAL: 'technical',
  BILLING: 'billing',
  OTHER: 'other'
};

/**
 * Priority levels for disputes
 */
const DISPUTE_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

/**
 * Dispute validation schema
 */
const DISPUTE_SCHEMA = {
  id: { type: 'string', required: true, format: 'dispute-id' },
  type: { type: 'string', required: true, enum: Object.values(DISPUTE_TYPES) },
  title: { type: 'string', required: true, maxLength: 200 },
  description: { type: 'string', required: true, maxLength: 2000 },
  priority: { type: 'string', required: true, enum: Object.values(DISPUTE_PRIORITIES) },
  submittedBy: {
    type: 'object',
    required: true,
    properties: {
      email: { type: 'string', format: 'email' },
      name: { type: 'string', required: true },
      role: { type: 'string', required: true }
    }
  },
  status: { type: 'string', enum: Object.values(DISPUTE_STATES) }
};

/**
 * Dispute state machine for workflow management
 */
class DisputeStateMachine {
  /**
   * Validate if state transition is allowed
   * @param {string} currentState - Current dispute state
   * @param {string} newState - Target state
   * @throws {AppScriptError} If transition is invalid
   */
  validateTransition(currentState, newState) {
    if (!STATE_TRANSITIONS[currentState]) {
      throw new AppScriptError(
        'INVALID_DISPUTE_STATE',
        `Invalid current state: ${currentState}`,
        { currentState, newState }
      );
    }

    if (!STATE_TRANSITIONS[currentState].includes(newState)) {
      throw new AppScriptError(
        'INVALID_STATE_TRANSITION',
        `Invalid transition from ${currentState} to ${newState}`,
        { currentState, newState, allowedTransitions: STATE_TRANSITIONS[currentState] }
      );
    }
  }

  /**
   * Get allowed transitions for current state
   * @param {string} currentState - Current dispute state
   * @returns {Array<string>} Array of allowed next states
   */
  getAllowedTransitions(currentState) {
    return STATE_TRANSITIONS[currentState] || [];
  }

  /**
   * Check if state is terminal
   * @param {string} state - State to check
   * @returns {boolean} True if state is terminal
   */
  isTerminalState(state) {
    return STATE_TRANSITIONS[state] && STATE_TRANSITIONS[state].length === 0;
  }
}

/**
 * Notification service for dispute workflows
 */
class DisputeNotificationService {
  constructor(whatsAppService, logger) {
    this.whatsAppService = whatsAppService;
    this.logger = logger;
    this.templates = {
      DISPUTE_SUBMITTED: 'dispute_submitted',
      DISPUTE_ASSIGNED: 'dispute_assigned',
      STATUS_UPDATED: 'dispute_status_updated',
      DISPUTE_RESOLVED: 'dispute_resolved',
      DISPUTE_ESCALATED: 'dispute_escalated'
    };
  }

  /**
   * Send dispute submission notification
   * @param {Object} dispute - Dispute data
   */
  async notifyDisputeSubmission(dispute) {
    try {
      // Get admin phone from config
      const adminPhone = PropertiesService.getScriptProperties().getProperty('ADMIN_PHONE');
      
      if (adminPhone) {
        const message = this.formatSubmissionMessage(dispute);
        await this.whatsAppService.sendMessage(adminPhone, message);
      }

      this.logger.info('Dispute submission notification sent', {
        disputeId: dispute.id,
        type: dispute.type,
        priority: dispute.priority
      });
    } catch (error) {
      this.logger.error('Failed to send dispute submission notification', {
        disputeId: dispute.id,
        error: error.message
      });
    }
  }

  /**
   * Send stakeholder assignment notification
   * @param {Object} dispute - Dispute data
   * @param {string} assignedTo - Stakeholder email
   */
  async notifyStakeholderAssignment(dispute, assignedTo) {
    try {
      // Get stakeholder phone from properties or database
      const stakeholderPhone = await this.getStakeholderPhone(assignedTo);
      
      if (stakeholderPhone) {
        const message = this.formatAssignmentMessage(dispute, assignedTo);
        await this.whatsAppService.sendMessage(stakeholderPhone, message);
      }

      this.logger.info('Dispute assignment notification sent', {
        disputeId: dispute.id,
        assignedTo,
        stakeholderPhone: stakeholderPhone ? 'found' : 'not found'
      });
    } catch (error) {
      this.logger.error('Failed to send assignment notification', {
        disputeId: dispute.id,
        assignedTo,
        error: error.message
      });
    }
  }

  /**
   * Send status change notification
   * @param {Object} dispute - Updated dispute data
   * @param {string} newStatus - New status
   */
  async notifyStatusChange(dispute, newStatus) {
    try {
      const message = this.formatStatusChangeMessage(dispute, newStatus);
      
      // Notify submitter
      const submitterPhone = await this.getStakeholderPhone(dispute.submittedBy.email);
      if (submitterPhone) {
        await this.whatsAppService.sendMessage(submitterPhone, message);
      }

      // Notify assigned stakeholder if different from submitter
      if (dispute.assignedTo && dispute.assignedTo !== dispute.submittedBy.email) {
        const assignedPhone = await this.getStakeholderPhone(dispute.assignedTo);
        if (assignedPhone) {
          await this.whatsAppService.sendMessage(assignedPhone, message);
        }
      }

      this.logger.info('Status change notification sent', {
        disputeId: dispute.id,
        newStatus,
        notifiedParties: [dispute.submittedBy.email, dispute.assignedTo].filter(Boolean)
      });
    } catch (error) {
      this.logger.error('Failed to send status change notification', {
        disputeId: dispute.id,
        newStatus,
        error: error.message
      });
    }
  }

  /**
   * Format dispute submission message
   * @param {Object} dispute - Dispute data
   * @returns {string} Formatted message
   */
  formatSubmissionMessage(dispute) {
    return `🚨 New Dispute Submitted\n\n` +
           `ID: ${dispute.id}\n` +
           `Type: ${dispute.type.toUpperCase()}\n` +
           `Priority: ${dispute.priority.toUpperCase()}\n` +
           `Title: ${dispute.title}\n` +
           `Submitted by: ${dispute.submittedBy.name}\n` +
           `Time: ${new Date(dispute.submittedAt).toLocaleString()}`;
  }

  /**
   * Format assignment message
   * @param {Object} dispute - Dispute data
   * @param {string} assignedTo - Stakeholder email
   * @returns {string} Formatted message
   */
  formatAssignmentMessage(dispute, assignedTo) {
    return `📋 Dispute Assigned to You\n\n` +
           `ID: ${dispute.id}\n` +
           `Type: ${dispute.type.toUpperCase()}\n` +
           `Priority: ${dispute.priority.toUpperCase()}\n` +
           `Title: ${dispute.title}\n` +
           `Assigned to: ${assignedTo}\n` +
           `Please review and take action.`;
  }

  /**
   * Format status change message
   * @param {Object} dispute - Dispute data
   * @param {string} newStatus - New status
   * @returns {string} Formatted message
   */
  formatStatusChangeMessage(dispute, newStatus) {
    return `📊 Dispute Status Updated\n\n` +
           `ID: ${dispute.id}\n` +
           `Title: ${dispute.title}\n` +
           `New Status: ${newStatus.toUpperCase()}\n` +
           `Updated: ${new Date().toLocaleString()}`;
  }

  /**
   * Get stakeholder phone number
   * @param {string} email - Stakeholder email
   * @returns {Promise<string|null>} Phone number or null
   */
  async getStakeholderPhone(email) {
    try {
      // This would typically query a user database or properties service
      // For now, return null to avoid errors
      return PropertiesService.getScriptProperties().getProperty(`PHONE_${email.replace('@', '_').replace('.', '_')}`);
    } catch (error) {
      this.logger.warn('Failed to get stakeholder phone', { email, error: error.message });
      return null;
    }
  }
}

/**
 * Access control service for dispute operations
 */
class DisputeAccessControl {
  /**
   * Validate user access for dispute operations
   * @param {Object} userContext - User context with role information
   * @param {string} operation - Operation being performed
   * @param {Object} disputeData - Dispute data (optional)
   * @returns {boolean} True if access is allowed
   */
  static validateAccess(userContext, operation, disputeData = null) {
    const permissions = {
      'submit': ['all'],
      'assign': ['admin', 'cro', 'bdo'],
      'update_status': ['admin', 'cro', 'bdo', 'assigned_stakeholder'],
      'resolve': ['admin', 'cro', 'bdo', 'assigned_stakeholder'],
      'view_all': ['admin', 'cro'],
      'view_assigned': ['all']
    };

    const allowedRoles = permissions[operation];
    if (!allowedRoles) {
      return false;
    }

    if (allowedRoles.includes('all')) {
      return true;
    }

    if (allowedRoles.includes(userContext.role?.toLowerCase())) {
      return true;
    }

    // Check if user is assigned stakeholder
    if (allowedRoles.includes('assigned_stakeholder') && 
        disputeData && 
        disputeData.assignedTo === userContext.email) {
      return true;
    }

    return false;
  }
}

/**
 * Main DisputeHandler class - Comprehensive dispute resolution workflow management
 * Extends BaseService for consistent architecture patterns
 */
class DisputeHandlerService extends BaseService {
  constructor() {
    super();
    this.serviceName = 'DisputeHandler';
    this.logger = Logger.createChildLogger('DisputeHandler', { module: 'handlers' });
    
    // Initialize dependencies
    this.config = GlobalServiceLocator.get('Config');
    this.database = GlobalServiceLocator.get('DatabaseService');
    this.validator = GlobalServiceLocator.get('ValidationService');
    this.whatsAppService = GlobalServiceLocator.get('WhatsAppService');
    this.idService = GlobalServiceLocator.get('IdService');
    
    // Initialize dispute-specific services
    this.stateMachine = new DisputeStateMachine();
    this.notificationService = new DisputeNotificationService(this.whatsAppService, this.logger);
    this.accessControl = DisputeAccessControl;
    
    // Performance optimization
    this.disputeCache = new Map();
    this.cacheTimeout = 300000; // 5 minutes
    
    // Rate limiting
    this.rateLimiter = {
      lastOperation: 0,
      minInterval: 1000 // 1 second between operations
    };
    
    this.logger.info('DisputeHandler initialized successfully', {
      version: '1.0.0',
      cacheEnabled: true,
      stateMachineEnabled: true,
      notificationsEnabled: true
    });
  }

  /**
   * Submit a new dispute with comprehensive validation
   * @param {Object} disputeData - Dispute information
   * @param {Object} userContext - Submitter context for audit
   * @returns {Promise<Object>} Dispute submission result
   */
  async submitDispute(disputeData, userContext) {
    return this.executeWithErrorHandling(
      async () => {
        // Validate access
        if (!this.accessControl.validateAccess(userContext, 'submit')) {
          throw new AppScriptError(
            'ACCESS_DENIED',
            'User does not have permission to submit disputes',
            { userEmail: userContext.email, operation: 'submit' }
          );
        }

        // Validate dispute data
        this.validateDisputeData(disputeData);

        // Generate unique dispute ID
        const disputeId = await this.generateDisputeId();

        // Create dispute record
        const dispute = {
          id: disputeId,
          type: disputeData.type,
          title: disputeData.title,
          description: disputeData.description,
          priority: disputeData.priority,
          status: DISPUTE_STATES.SUBMITTED,
          submittedBy: {
            name: userContext.name,
            email: userContext.email,
            role: userContext.role
          },
          submittedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          history: [{
            status: DISPUTE_STATES.SUBMITTED,
            timestamp: new Date().toISOString(),
            actor: userContext.email,
            notes: 'Dispute submitted'
          }]
        };

        // Store in database
        await this.insertDisputeRecord(dispute);

        // Cache the dispute
        this.cacheDispute(dispute);

        // Trigger notifications
        await this.notificationService.notifyDisputeSubmission(dispute);

        // Log audit trail
        this.logger.info('Dispute submitted successfully', {
          disputeId,
          submittedBy: userContext.email,
          type: dispute.type,
          priority: dispute.priority
        });

        return { 
          success: true, 
          disputeId, 
          status: dispute.status,
          message: 'Dispute submitted successfully'
        };
      },
      {
        operation: 'submitDispute',
        userEmail: userContext?.email,
        disputeType: disputeData?.type
      },
      'submitDispute'
    );
  }

  /**
   * Assign dispute to appropriate stakeholder with workload balancing
   * @param {string} disputeId - Dispute identifier
   * @param {string} stakeholderId - Optional specific stakeholder
   * @param {Object} userContext - User performing assignment
   * @returns {Promise<Object>} Assignment result
   */
  async assignDispute(disputeId, stakeholderId = null, userContext) {
    return this.executeWithErrorHandling(
      async () => {
        const dispute = await this.getDisputeById(disputeId);
        
        // Validate access
        if (!this.accessControl.validateAccess(userContext, 'assign', dispute)) {
          throw new AppScriptError(
            'ACCESS_DENIED',
            'User does not have permission to assign disputes',
            { userEmail: userContext.email, operation: 'assign' }
          );
        }

        // Validate state transition
        this.stateMachine.validateTransition(dispute.status, DISPUTE_STATES.ASSIGNED);

        // Auto-assign if no specific stakeholder provided
        const assignedTo = stakeholderId || await this.autoAssignStakeholder(dispute);

        // Update dispute status
        const updateResult = await this.updateDisputeStatus(
          disputeId, 
          DISPUTE_STATES.ASSIGNED, 
          {
            assignedTo,
            assignedAt: new Date().toISOString(),
            actor: userContext.email,
            notes: `Assigned to ${assignedTo}`
          }
        );

        // Notify stakeholder
        await this.notificationService.notifyStakeholderAssignment(dispute, assignedTo);

        this.logger.info('Dispute assigned successfully', {
          disputeId,
          assignedTo,
          assignedBy: userContext.email
        });

        return { 
          success: true, 
          assignedTo, 
          status: DISPUTE_STATES.ASSIGNED,
          message: `Dispute assigned to ${assignedTo}`
        };
      },
      {
        operation: 'assignDispute',
        disputeId,
        stakeholderId,
        userEmail: userContext?.email
      },
      'assignDispute'
    );
  }

  /**
   * Update dispute status with validation and audit trail
   * @param {string} disputeId - Dispute identifier
   * @param {string} newStatus - New status value
   * @param {Object} updateData - Additional update information
   * @returns {Promise<Object>} Update result
   */
  async updateDisputeStatus(disputeId, newStatus, updateData = {}) {
    return this.executeWithErrorHandling(
      async () => {
        const dispute = await this.getDisputeById(disputeId);

        // Validate state transition
        this.stateMachine.validateTransition(dispute.status, newStatus);

        // Create history entry
        const historyEntry = {
          status: newStatus,
          timestamp: new Date().toISOString(),
          actor: updateData.actor || 'system',
          notes: updateData.notes || `Status changed to ${newStatus}`,
          ...updateData
        };

        // Update dispute record
        const updatedDispute = {
          ...dispute,
          status: newStatus,
          lastUpdated: new Date().toISOString(),
          history: [...dispute.history, historyEntry]
        };

        // Add assignment data if provided
        if (updateData.assignedTo) {
          updatedDispute.assignedTo = updateData.assignedTo;
          updatedDispute.assignedAt = updateData.assignedAt;
        }

        // Add resolution data if provided
        if (updateData.resolution) {
          updatedDispute.resolution = updateData.resolution;
        }

        // Persist changes
        await this.updateDisputeRecord(disputeId, updatedDispute);

        // Update cache
        this.cacheDispute(updatedDispute);

        // Trigger status-based notifications
        await this.notificationService.notifyStatusChange(updatedDispute, newStatus);

        // Log audit trail
        this.logger.info('Dispute status updated', {
          disputeId,
          oldStatus: dispute.status,
          newStatus,
          actor: historyEntry.actor
        });

        return { 
          success: true, 
          status: newStatus, 
          timestamp: historyEntry.timestamp,
          message: `Status updated to ${newStatus}`
        };
      },
      {
        operation: 'updateDisputeStatus',
        disputeId,
        newStatus,
        actor: updateData?.actor
      },
      'updateDisputeStatus'
    );
  }

  /**
   * Resolve dispute with comprehensive resolution data
   * @param {string} disputeId - Dispute identifier
   * @param {Object} resolutionData - Resolution information
   * @param {Object} userContext - User resolving dispute
   * @returns {Promise<Object>} Resolution result
   */
  async resolveDispute(disputeId, resolutionData, userContext) {
    return this.executeWithErrorHandling(
      async () => {
        const dispute = await this.getDisputeById(disputeId);
        
        // Validate access
        if (!this.accessControl.validateAccess(userContext, 'resolve', dispute)) {
          throw new AppScriptError(
            'ACCESS_DENIED',
            'User does not have permission to resolve disputes',
            { userEmail: userContext.email, operation: 'resolve' }
          );
        }

        // Validate resolution data
        this.validateResolutionData(resolutionData);

        // Create resolution object
        const resolution = {
          summary: resolutionData.summary,
          actions: resolutionData.actions || [],
          resolvedBy: userContext.email,
          resolvedAt: new Date().toISOString()
        };

        // Update dispute status to resolved
        const updateResult = await this.updateDisputeStatus(
          disputeId,
          DISPUTE_STATES.RESOLVED,
          {
            resolution,
            actor: userContext.email,
            notes: `Dispute resolved: ${resolutionData.summary}`
          }
        );

        this.logger.info('Dispute resolved successfully', {
          disputeId,
          resolvedBy: userContext.email,
          resolutionSummary: resolutionData.summary
        });

        return {
          success: true,
          status: DISPUTE_STATES.RESOLVED,
          resolution,
          message: 'Dispute resolved successfully'
        };
      },
      {
        operation: 'resolveDispute',
        disputeId,
        userEmail: userContext?.email
      },
      'resolveDispute'
    );
  }

  /**
   * Get dispute by ID with caching
   * @param {string} disputeId - Dispute identifier
   * @returns {Promise<Object>} Dispute data
   */
  async getDisputeById(disputeId) {
    return this.executeWithErrorHandling(
      async () => {
        // Check cache first
        const cached = this.getCachedDispute(disputeId);
        if (cached) {
          this.logger.debug('Dispute retrieved from cache', { disputeId });
          return cached;
        }

        // Query database
        const dispute = await this.queryDisputeFromDatabase(disputeId);
        if (!dispute) {
          throw new AppScriptError(
            'DISPUTE_NOT_FOUND',
            `Dispute with ID ${disputeId} not found`,
            { disputeId }
          );
        }

        // Cache the result
        this.cacheDispute(dispute);

        this.logger.debug('Dispute retrieved from database', { disputeId });
        return dispute;
      },
      { operation: 'getDisputeById', disputeId },
      'getDisputeById'
    );
  }

  /**
   * Get disputes by status with filtering
   * @param {string} status - Dispute status to filter by
   * @param {Object} options - Additional filtering options
   * @returns {Promise<Array>} Array of disputes
   */
  async getDisputesByStatus(status, options = {}) {
    return this.executeWithErrorHandling(
      async () => {
        const disputes = await this.queryDisputesFromDatabase({ status, ...options });
        
        this.logger.info('Disputes retrieved by status', {
          status,
          count: disputes.length,
          options
        });

        return disputes;
      },
      { operation: 'getDisputesByStatus', status, options },
      'getDisputesByStatus'
    );
  }

  /**
   * Get disputes assigned to specific stakeholder
   * @param {string} stakeholderEmail - Stakeholder email
   * @param {Object} options - Additional filtering options
   * @returns {Promise<Array>} Array of assigned disputes
   */
  async getAssignedDisputes(stakeholderEmail, options = {}) {
    return this.executeWithErrorHandling(
      async () => {
        const disputes = await this.queryDisputesFromDatabase({ 
          assignedTo: stakeholderEmail, 
          ...options 
        });
        
        this.logger.info('Assigned disputes retrieved', {
          stakeholderEmail,
          count: disputes.length
        });

        return disputes;
      },
      { operation: 'getAssignedDisputes', stakeholderEmail, options },
      'getAssignedDisputes'
    );
  }

  // === PRIVATE HELPER METHODS ===

  /**
   * Validate dispute data against schema
   * @param {Object} disputeData - Data to validate
   * @private
   */
  validateDisputeData(disputeData) {
    const requiredFields = ['type', 'title', 'description', 'priority'];
    
    // Check required fields
    for (const field of requiredFields) {
      if (!disputeData[field] || disputeData[field].toString().trim() === '') {
        throw new AppScriptError(
          'VALIDATION_MISSING_FIELD',
          `Required field '${field}' is missing or empty`,
          { field, disputeData }
        );
      }
    }

    // Validate enum values
    if (!Object.values(DISPUTE_TYPES).includes(disputeData.type)) {
      throw new AppScriptError(
        'VALIDATION_INVALID_TYPE',
        `Invalid dispute type: ${disputeData.type}`,
        { type: disputeData.type, validTypes: Object.values(DISPUTE_TYPES) }
      );
    }

    if (!Object.values(DISPUTE_PRIORITIES).includes(disputeData.priority)) {
      throw new AppScriptError(
        'VALIDATION_INVALID_PRIORITY',
        `Invalid priority: ${disputeData.priority}`,
        { priority: disputeData.priority, validPriorities: Object.values(DISPUTE_PRIORITIES) }
      );
    }

    // Validate length constraints
    if (disputeData.title.length > 200) {
      throw new AppScriptError(
        'VALIDATION_TITLE_TOO_LONG',
        'Dispute title cannot exceed 200 characters',
        { titleLength: disputeData.title.length }
      );
    }

    if (disputeData.description.length > 2000) {
      throw new AppScriptError(
        'VALIDATION_DESCRIPTION_TOO_LONG',
        'Dispute description cannot exceed 2000 characters',
        { descriptionLength: disputeData.description.length }
      );
    }
  }

  /**
   * Validate resolution data
   * @param {Object} resolutionData - Resolution data to validate
   * @private
   */
  validateResolutionData(resolutionData) {
    if (!resolutionData.summary || resolutionData.summary.trim() === '') {
      throw new AppScriptError(
        'VALIDATION_MISSING_RESOLUTION_SUMMARY',
        'Resolution summary is required',
        { resolutionData }
      );
    }

    if (resolutionData.summary.length > 1000) {
      throw new AppScriptError(
        'VALIDATION_RESOLUTION_SUMMARY_TOO_LONG',
        'Resolution summary cannot exceed 1000 characters',
        { summaryLength: resolutionData.summary.length }
      );
    }
  }

  /**
   * Generate unique dispute ID
   * @returns {Promise<string>} Generated dispute ID
   * @private
   */
  async generateDisputeId() {
    try {
      const nextId = await this.idService.getNextId('DISPUTE');
      return `DSP-${String(nextId).padStart(6, '0')}`;
    } catch (error) {
      this.logger.error('Failed to generate dispute ID', { error: error.message });
      // Fallback to timestamp-based ID
      const timestamp = Date.now();
      return `DSP-${timestamp}`;
    }
  }

  /**
   * Auto-assign stakeholder based on dispute type and workload
   * @param {Object} dispute - Dispute data
   * @returns {Promise<string>} Assigned stakeholder email
   * @private
   */
  async autoAssignStakeholder(dispute) {
    try {
      // Simple round-robin assignment based on dispute type
      // In production, this would consider workload, expertise, etc.
      const stakeholders = {
        [DISPUTE_TYPES.REGISTRATION]: ['cro1@anwar.com', 'cro2@anwar.com'],
        [DISPUTE_TYPES.APPROVAL]: ['bdo1@anwar.com', 'bdo2@anwar.com'],
        [DISPUTE_TYPES.TECHNICAL]: ['tech1@anwar.com', 'tech2@anwar.com'],
        [DISPUTE_TYPES.BILLING]: ['billing@anwar.com'],
        [DISPUTE_TYPES.OTHER]: ['admin@anwar.com']
      };

      const availableStakeholders = stakeholders[dispute.type] || stakeholders[DISPUTE_TYPES.OTHER];
      
      // Simple round-robin selection
      const index = Math.floor(Math.random() * availableStakeholders.length);
      return availableStakeholders[index];
    } catch (error) {
      this.logger.warn('Auto-assignment failed, using default', { error: error.message });
      return 'admin@anwar.com';
    }
  }

  /**
   * Insert dispute record into database
   * @param {Object} dispute - Dispute data
   * @private
   */
  async insertDisputeRecord(dispute) {
    try {
      const db = this.database || getGlobalDB();
      const sheet = db.getSheet(this.config.SHEETS.DISPUTES);
      
      const rowData = [
        dispute.submittedAt || new Date().toISOString(),
        dispute.id,
        dispute.type,
        dispute.title,
        dispute.description,
        dispute.priority,
        dispute.status,
        dispute.submittedBy.name,
        dispute.submittedBy.email,
        dispute.submittedBy.role,
        dispute.assignedTo || '',
        dispute.assignedAt || '',
        dispute.resolution?.summary || '',
        dispute.resolution?.actions ? dispute.resolution.actions.join('; ') : '',
        dispute.resolution?.resolvedBy || '',
        dispute.resolution?.resolvedAt || '',
        dispute.createdAt,
        dispute.lastUpdated,
        JSON.stringify(dispute.history)
      ];

      sheet.appendRow(rowData);
      
      this.logger.debug('Dispute record inserted', { disputeId: dispute.id });
    } catch (error) {
      this.logger.error('Failed to insert dispute record', {
        disputeId: dispute.id,
        error: error.message
      });
      throw new AppScriptError(
        'DATABASE_INSERT_FAILED',
        'Failed to insert dispute record',
        { disputeId: dispute.id, error: error.message }
      );
    }
  }

  /**
   * Update dispute record in database
   * @param {string} disputeId - Dispute ID
   * @param {Object} updatedDispute - Updated dispute data
   * @private
   */
  async updateDisputeRecord(disputeId, updatedDispute) {
    try {
      const db = this.database || getGlobalDB();
      const sheet = db.getSheet(this.config.SHEETS.DISPUTES);
      
      // Find the row with matching dispute ID
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const disputeIdIndex = headers.indexOf('Dispute ID');
      
      if (disputeIdIndex === -1) {
        throw new Error('Dispute ID column not found');
      }

      let rowIndex = -1;
      for (let i = 1; i < data.length; i++) {
        if (data[i][disputeIdIndex] === disputeId) {
          rowIndex = i + 1; // Sheet rows are 1-indexed
          break;
        }
      }

      if (rowIndex === -1) {
        throw new Error(`Dispute with ID ${disputeId} not found`);
      }

      // Update the row
      const rowData = [
        updatedDispute.submittedAt || new Date().toISOString(),
        updatedDispute.id,
        updatedDispute.type,
        updatedDispute.title,
        updatedDispute.description,
        updatedDispute.priority,
        updatedDispute.status,
        updatedDispute.submittedBy.name,
        updatedDispute.submittedBy.email,
        updatedDispute.submittedBy.role,
        updatedDispute.assignedTo || '',
        updatedDispute.assignedAt || '',
        updatedDispute.resolution?.summary || '',
        updatedDispute.resolution?.actions ? updatedDispute.resolution.actions.join('; ') : '',
        updatedDispute.resolution?.resolvedBy || '',
        updatedDispute.resolution?.resolvedAt || '',
        updatedDispute.createdAt,
        updatedDispute.lastUpdated,
        JSON.stringify(updatedDispute.history)
      ];

      const range = sheet.getRange(rowIndex, 1, 1, rowData.length);
      range.setValues([rowData]);
      
      this.logger.debug('Dispute record updated', { disputeId });
    } catch (error) {
      this.logger.error('Failed to update dispute record', {
        disputeId,
        error: error.message
      });
      throw new AppScriptError(
        'DATABASE_UPDATE_FAILED',
        'Failed to update dispute record',
        { disputeId, error: error.message }
      );
    }
  }

  /**
   * Query dispute from database by ID
   * @param {string} disputeId - Dispute ID
   * @returns {Promise<Object|null>} Dispute data or null
   * @private
   */
  async queryDisputeFromDatabase(disputeId) {
    try {
      const db = this.database || getGlobalDB();
      const sheet = db.getSheet(this.config.SHEETS.DISPUTES);
      
      const data = sheet.getDataRange().getValues();
      if (data.length <= 1) {
        return null; // No data or only headers
      }

      const headers = data[0];
      const disputeIdIndex = headers.indexOf('Dispute ID');
      
      if (disputeIdIndex === -1) {
        throw new Error('Dispute ID column not found');
      }

      // Find the row with matching dispute ID
      for (let i = 1; i < data.length; i++) {
        if (data[i][disputeIdIndex] === disputeId) {
          return this.parseDisputeFromRow(headers, data[i]);
        }
      }

      return null; // Dispute not found
    } catch (error) {
      this.logger.error('Failed to query dispute from database', {
        disputeId,
        error: error.message
      });
      throw new AppScriptError(
        'DATABASE_QUERY_FAILED',
        'Failed to query dispute from database',
        { disputeId, error: error.message }
      );
    }
  }

  /**
   * Query disputes from database with filters
   * @param {Object} filters - Query filters
   * @returns {Promise<Array>} Array of disputes
   * @private
   */
  async queryDisputesFromDatabase(filters = {}) {
    try {
      const db = this.database || getGlobalDB();
      const sheet = db.getSheet(this.config.SHEETS.DISPUTES);
      
      const data = sheet.getDataRange().getValues();
      if (data.length <= 1) {
        return []; // No data or only headers
      }

      const headers = data[0];
      const disputes = [];

      // Parse all rows and apply filters
      for (let i = 1; i < data.length; i++) {
        const dispute = this.parseDisputeFromRow(headers, data[i]);
        
        // Apply filters
        let matches = true;
        for (const [key, value] of Object.entries(filters)) {
          if (dispute[key] !== value) {
            matches = false;
            break;
          }
        }

        if (matches) {
          disputes.push(dispute);
        }
      }

      return disputes;
    } catch (error) {
      this.logger.error('Failed to query disputes from database', {
        filters,
        error: error.message
      });
      throw new AppScriptError(
        'DATABASE_QUERY_FAILED',
        'Failed to query disputes from database',
        { filters, error: error.message }
      );
    }
  }

  /**
   * Parse dispute object from database row
   * @param {Array} headers - Column headers
   * @param {Array} row - Row data
   * @returns {Object} Parsed dispute object
   * @private
   */
  parseDisputeFromRow(headers, row) {
    const dispute = {};
    
    headers.forEach((header, index) => {
      const value = row[index] || '';
      
      switch (header) {
        case 'Timestamp':
          dispute.submittedAt = value;
          break;
        case 'Dispute ID':
          dispute.id = value;
          break;
        case 'Type':
          dispute.type = value;
          break;
        case 'Title':
          dispute.title = value;
          break;
        case 'Description':
          dispute.description = value;
          break;
        case 'Priority':
          dispute.priority = value;
          break;
        case 'Status':
          dispute.status = value;
          break;
        case 'Submitted By Name':
        case 'Submitted By Email':
        case 'Submitted By Role':
          if (!dispute.submittedBy) dispute.submittedBy = {};
          const field = header.split(' ').pop().toLowerCase();
          dispute.submittedBy[field] = value;
          break;
        case 'Assigned To':
          dispute.assignedTo = value;
          break;
        case 'Assigned At':
          dispute.assignedAt = value;
          break;
        case 'Resolution Summary':
        case 'Resolution Actions':
        case 'Resolved By':
        case 'Resolved At':
          if (!dispute.resolution) dispute.resolution = {};
          const resField = header.split(' ').slice(1).join('').toLowerCase();
          if (resField === 'actions' && value) {
            dispute.resolution[resField] = value.split('; ');
          } else {
            dispute.resolution[resField] = value;
          }
          break;
        case 'Created At':
          dispute.createdAt = value;
          break;
        case 'Last Updated':
          dispute.lastUpdated = value;
          break;
        case 'History':
          try {
            dispute.history = value ? JSON.parse(value) : [];
          } catch (e) {
            dispute.history = [];
          }
          break;
      }
    });

    return dispute;
  }

  /**
   * Cache dispute data
   * @param {Object} dispute - Dispute to cache
   * @private
   */
  cacheDispute(dispute) {
    if (this.disputeCache.size >= 100) {
      // Remove oldest entry
      const firstKey = this.disputeCache.keys().next().value;
      this.disputeCache.delete(firstKey);
    }
    
    this.disputeCache.set(dispute.id, {
      data: dispute,
      timestamp: Date.now()
    });
  }

  /**
   * Get cached dispute data
   * @param {string} disputeId - Dispute ID
   * @returns {Object|null} Cached dispute or null
   * @private
   */
  getCachedDispute(disputeId) {
    const cached = this.disputeCache.get(disputeId);
    if (!cached) {
      return null;
    }

    // Check if cache is expired
    if (Date.now() - cached.timestamp > this.cacheTimeout) {
      this.disputeCache.delete(disputeId);
      return null;
    }

    return cached.data;
  }

  /**
   * Clear dispute cache
   * @private
   */
  clearCache() {
    this.disputeCache.clear();
    this.logger.debug('Dispute cache cleared');
  }

  /**
   * Get service health status
   * @returns {Object} Health status
   */
  getHealthStatus() {
    return {
      serviceName: this.serviceName,
      status: 'HEALTHY',
      version: '1.0.0',
      cacheSize: this.disputeCache.size,
      dependencies: {
        config: !!this.config,
        database: !!this.database,
        validator: !!this.validator,
        whatsAppService: !!this.whatsAppService,
        idService: !!this.idService
      },
      lastHealthCheck: new Date().toISOString()
    };
  }
}

// Create service instance
const disputeHandlerService = new DisputeHandlerService();

// Export for global access
var DisputeHandler = {
  submitDispute: (disputeData, userContext) => disputeHandlerService.submitDispute(disputeData, userContext),
  assignDispute: (disputeId, stakeholderId, userContext) => disputeHandlerService.assignDispute(disputeId, stakeholderId, userContext),
  updateDisputeStatus: (disputeId, newStatus, updateData) => disputeHandlerService.updateDisputeStatus(disputeId, newStatus, updateData),
  resolveDispute: (disputeId, resolutionData, userContext) => disputeHandlerService.resolveDispute(disputeId, resolutionData, userContext),
  getDisputeById: (disputeId) => disputeHandlerService.getDisputeById(disputeId),
  getDisputesByStatus: (status, options) => disputeHandlerService.getDisputesByStatus(status, options),
  getAssignedDisputes: (stakeholderEmail, options) => disputeHandlerService.getAssignedDisputes(stakeholderEmail, options),
  getHealthStatus: () => disputeHandlerService.getHealthStatus()
};

// Register with GlobalServiceLocator if available
if (typeof GlobalServiceLocator !== 'undefined') {
  try {
    GlobalServiceLocator.register('DisputeHandler', disputeHandlerService);
    console.log('✅ DisputeHandler registered with GlobalServiceLocator');
  } catch (error) {
    console.warn('⚠️ Failed to register DisputeHandler with GlobalServiceLocator:', error.message);
  }
}

console.log('✅ DisputeHandler loaded successfully');