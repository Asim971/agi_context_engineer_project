# Task 6: DisputeHandler.js Implementation Prompt

## Agent Target
**Senior Development Agent** - Google Apps Script Specialist

## Context Integration

### Framework References
- <mcfile name="context-engineering-framework.md" path="e:\Anwar_sales_eco\.agent-os\frameworks\context-engineering-framework.md"></mcfile>
- <mcfile name="prompt-library.md" path="e:\Anwar_sales_eco\.agent-os\prompts\prompt-library.md"></mcfile>
- <mcfile name="ai-guidelines.md" path="e:\Anwar_sales_eco\.agent-os\ai-guidelines.md"></mcfile>
- <mcfile name="code-standards.md" path="e:\Anwar_sales_eco\.agent-os\code-standards.md"></mcfile>

### Project Context
- <mcfile name="mission.md" path="e:\Anwar_sales_eco\.agent-os\product\mission.md"></mcfile>
- <mcfile name="sales-eco-spec.md" path="e:\Anwar_sales_eco\.agent-os\projects\sales-eco-spec.md"></mcfile>
- <mcfile name="task-6-dispute-handler.md" path="e:\Anwar_sales_eco\appscriptnew\.taskmaster\tasks\task-6-dispute-handler.md"></mcfile>

## Task Overview

**Objective:** Implement a comprehensive dispute resolution workflow handler that addresses a critical gap identified in the journey analysis audit. This handler must manage dispute submissions, stakeholder routing, status tracking, and resolution processes while maintaining full audit compliance.

**Priority:** High - Critical Gap Resolution  
**Estimated Effort:** 3-4 weeks development + 1-2 weeks testing + 1 week integration  
**File Location:** `src/handlers/DisputeHandler.js`

## Business Context

### Stakeholder Requirements

#### CRO (Customer Relationship Officer)
- **Dispute Assignment**: Automatic routing based on dispute type and workload
- **Status Visibility**: Real-time dispute status tracking and updates
- **Resolution Documentation**: Comprehensive resolution capture and reporting
- **Escalation Management**: Clear escalation paths for complex disputes

#### BDO (Business Development Officer)
- **Site-Related Disputes**: Specialized handling for potential site disputes
- **Engineer Disputes**: Technical dispute resolution workflows
- **Performance Tracking**: Dispute resolution metrics and KPIs
- **Integration Needs**: Seamless integration with existing workflows

#### CRM Team
- **Audit Trail**: Complete audit logging for compliance
- **Data Integrity**: Robust data validation and consistency
- **Reporting**: Comprehensive dispute analytics and reporting
- **System Administration**: User management and access control

### Success Metrics
- 100% of dispute journey flows implemented
- < 2 second response time for status updates
- 99.9% notification delivery success rate
- Zero data loss during dispute processing
- Complete audit trail for all disputes

## Technical Context

### Platform Constraints
- **Google Apps Script V8 Runtime**: 6-minute execution time limits
- **Memory Optimization**: Efficient handling of large dispute datasets
- **API Rate Limits**: Google Workspace API quotas and MyTAPI limits
- **Concurrency**: Single-threaded execution model considerations

### Architecture Requirements
- **Service-Oriented Design**: Extend BaseService following existing patterns
- **Dependency Injection**: Constructor-based dependency management
- **Error Handling**: Comprehensive AppScriptError framework integration
- **Performance Optimization**: Batch operations and intelligent caching

### Integration Points
- **CRMHandler**: Seamless integration with existing CRM workflows
- **WhatsAppService**: MyTAPI integration for stakeholder notifications
- **DatabaseService**: Google Sheets data persistence with validation
- **LoggerService**: Comprehensive audit logging and debugging
- **ValidationService**: Input validation and data sanitization

## Implementation Specifications

### Core Architecture

```javascript
/**
 * DisputeHandler - Comprehensive dispute resolution workflow management
 * Extends BaseService for consistent architecture patterns
 * Implements state machine for dispute lifecycle management
 */
class DisputeHandler extends BaseService {
  constructor(dependencies = {}) {
    super('DisputeHandler');
    
    // Dependency injection for testability and modularity
    this.config = dependencies.config || ConfigService;
    this.logger = dependencies.logger || LoggerService;
    this.database = dependencies.database || DatabaseService;
    this.validator = dependencies.validator || ValidationService;
    this.notifier = dependencies.notifier || NotificationService;
    this.crm = dependencies.crm || CRMHandler;
    
    // Initialize dispute state machine
    this.stateMachine = new DisputeStateMachine();
    
    // Performance optimization
    this.disputeCache = new Map();
    this.rateLimiter = new RateLimiter();
  }
}
```

### State Machine Implementation

**Dispute States:**
- `submitted` - Initial dispute submission
- `assigned` - Assigned to stakeholder (CRO/BDO)
- `in-review` - Under investigation
- `resolved` - Resolution provided
- `closed` - Dispute closed and documented

**State Transitions:**
```javascript
const DISPUTE_STATES = {
  SUBMITTED: 'submitted',
  ASSIGNED: 'assigned',
  IN_REVIEW: 'in-review',
  RESOLVED: 'resolved',
  CLOSED: 'closed'
};

const STATE_TRANSITIONS = {
  [DISPUTE_STATES.SUBMITTED]: [DISPUTE_STATES.ASSIGNED],
  [DISPUTE_STATES.ASSIGNED]: [DISPUTE_STATES.IN_REVIEW, DISPUTE_STATES.SUBMITTED],
  [DISPUTE_STATES.IN_REVIEW]: [DISPUTE_STATES.RESOLVED, DISPUTE_STATES.ASSIGNED],
  [DISPUTE_STATES.RESOLVED]: [DISPUTE_STATES.CLOSED, DISPUTE_STATES.IN_REVIEW],
  [DISPUTE_STATES.CLOSED]: [] // Terminal state
};
```

### Core Methods Implementation

#### 1. Dispute Submission
```javascript
/**
 * Submit a new dispute with comprehensive validation
 * @param {Object} disputeData - Dispute information
 * @param {Object} userContext - Submitter context for audit
 * @returns {Promise<Object>} Dispute submission result
 */
async submitDispute(disputeData, userContext) {
  return this.executeWithErrorHandling(async () => {
    // Validate dispute data
    const validatedData = await this.validator.validate(disputeData, 'dispute-schema');
    
    // Generate unique dispute ID
    const disputeId = await IdService.generateDisputeId();
    
    // Create dispute record
    const dispute = {
      id: disputeId,
      ...validatedData,
      status: DISPUTE_STATES.SUBMITTED,
      submittedBy: userContext,
      submittedAt: new Date().toISOString(),
      history: [{
        status: DISPUTE_STATES.SUBMITTED,
        timestamp: new Date().toISOString(),
        actor: userContext.email,
        notes: 'Dispute submitted'
      }]
    };
    
    // Store in database
    await this.database.insertRecord('disputes', dispute);
    
    // Trigger initial notifications
    await this.notifyDisputeSubmission(dispute);
    
    // Log audit trail
    this.logger.info('Dispute submitted successfully', {
      disputeId,
      submittedBy: userContext.email,
      type: dispute.type
    });
    
    return { success: true, disputeId, status: dispute.status };
  });
}
```

#### 2. Stakeholder Assignment
```javascript
/**
 * Assign dispute to appropriate stakeholder with workload balancing
 * @param {string} disputeId - Dispute identifier
 * @param {string} stakeholderId - Optional specific stakeholder
 * @returns {Promise<Object>} Assignment result
 */
async assignDispute(disputeId, stakeholderId = null) {
  return this.executeWithErrorHandling(async () => {
    const dispute = await this.getDisputeById(disputeId);
    
    // Validate state transition
    this.stateMachine.validateTransition(dispute.status, DISPUTE_STATES.ASSIGNED);
    
    // Auto-assign if no specific stakeholder provided
    const assignedTo = stakeholderId || await this.autoAssignStakeholder(dispute);
    
    // Update dispute status
    await this.updateDisputeStatus(disputeId, DISPUTE_STATES.ASSIGNED, {
      assignedTo,
      assignedAt: new Date().toISOString(),
      notes: `Assigned to ${assignedTo}`
    });
    
    // Notify stakeholder
    await this.notifyStakeholderAssignment(dispute, assignedTo);
    
    return { success: true, assignedTo, status: DISPUTE_STATES.ASSIGNED };
  });
}
```

#### 3. Status Management
```javascript
/**
 * Update dispute status with validation and audit trail
 * @param {string} disputeId - Dispute identifier
 * @param {string} newStatus - New status value
 * @param {Object} updateData - Additional update information
 * @returns {Promise<Object>} Update result
 */
async updateDisputeStatus(disputeId, newStatus, updateData = {}) {
  return this.executeWithErrorHandling(async () => {
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
    
    // Persist changes
    await this.database.updateRecord('disputes', disputeId, updatedDispute);
    
    // Clear cache
    this.disputeCache.delete(disputeId);
    
    // Trigger status-based notifications
    await this.notifyStatusChange(updatedDispute, newStatus);
    
    // Log audit trail
    this.logger.info('Dispute status updated', {
      disputeId,
      oldStatus: dispute.status,
      newStatus,
      actor: historyEntry.actor
    });
    
    return { success: true, status: newStatus, timestamp: historyEntry.timestamp };
  });
}
```

### Data Model

```javascript
/**
 * Comprehensive dispute data model
 */
const DISPUTE_SCHEMA = {
  id: { type: 'string', required: true, format: 'dispute-id' },
  type: { type: 'string', required: true, enum: ['registration', 'approval', 'technical', 'billing', 'other'] },
  title: { type: 'string', required: true, maxLength: 200 },
  description: { type: 'string', required: true, maxLength: 2000 },
  priority: { type: 'string', required: true, enum: ['low', 'medium', 'high', 'urgent'] },
  submittedBy: {
    type: 'object',
    required: true,
    properties: {
      email: { type: 'string', format: 'email' },
      name: { type: 'string', required: true },
      role: { type: 'string', required: true }
    }
  },
  submittedAt: { type: 'string', format: 'date-time' },
  assignedTo: { type: 'string', format: 'email' },
  assignedAt: { type: 'string', format: 'date-time' },
  status: { type: 'string', enum: Object.values(DISPUTE_STATES) },
  resolution: {
    type: 'object',
    properties: {
      summary: { type: 'string', maxLength: 1000 },
      actions: { type: 'array', items: { type: 'string' } },
      resolvedBy: { type: 'string', format: 'email' },
      resolvedAt: { type: 'string', format: 'date-time' }
    }
  },
  attachments: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        url: { type: 'string', format: 'url' },
        uploadedAt: { type: 'string', format: 'date-time' }
      }
    }
  },
  history: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        status: { type: 'string' },
        timestamp: { type: 'string', format: 'date-time' },
        actor: { type: 'string' },
        notes: { type: 'string' }
      }
    }
  }
};
```

### Notification Integration

```javascript
/**
 * Comprehensive notification system for dispute workflows
 */
class DisputeNotificationService {
  constructor(notificationService) {
    this.notifier = notificationService;
    this.templates = {
      DISPUTE_SUBMITTED: 'dispute_submitted',
      DISPUTE_ASSIGNED: 'dispute_assigned',
      STATUS_UPDATED: 'dispute_status_updated',
      DISPUTE_RESOLVED: 'dispute_resolved',
      DISPUTE_ESCALATED: 'dispute_escalated'
    };
  }
  
  async notifyDisputeSubmission(dispute) {
    // Notify administrators
    await this.notifier.sendWhatsAppMessage(
      this.config.getAdminPhone(),
      this.templates.DISPUTE_SUBMITTED,
      {
        disputeId: dispute.id,
        type: dispute.type,
        submittedBy: dispute.submittedBy.name,
        priority: dispute.priority
      }
    );
    
    // Send confirmation to submitter
    await this.notifier.sendEmail(
      dispute.submittedBy.email,
      'Dispute Submission Confirmation',
      this.buildSubmissionConfirmationEmail(dispute)
    );
  }
}
```

## Quality Assurance Requirements

### Testing Strategy

#### Unit Tests
```javascript
/**
 * Comprehensive unit test coverage
 */
class DisputeHandlerTests {
  static runAllTests() {
    this.testDisputeSubmission();
    this.testStatusTransitions();
    this.testStakeholderAssignment();
    this.testNotificationTriggers();
    this.testErrorHandling();
    this.testPerformanceOptimization();
  }
  
  static testDisputeSubmission() {
    // Test valid dispute submission
    // Test invalid data handling
    // Test duplicate prevention
    // Test audit trail creation
  }
  
  static testStatusTransitions() {
    // Test valid state transitions
    // Test invalid transition prevention
    // Test history tracking
    // Test notification triggers
  }
}
```

#### Integration Tests
- End-to-end dispute workflow testing
- CRM system integration validation
- WhatsApp notification delivery testing
- Database persistence and retrieval testing
- Performance benchmarking under load

#### Performance Tests
- High-volume dispute processing (1000+ concurrent)
- Status update response time validation (< 2 seconds)
- Memory usage optimization verification
- API rate limit handling validation

### Security Requirements

#### Access Control
```javascript
/**
 * Role-based access control for dispute operations
 */
class DisputeAccessControl {
  static validateAccess(userContext, operation, disputeData = null) {
    const permissions = {
      'submit': ['all'],
      'assign': ['admin', 'cro', 'bdo'],
      'update_status': ['admin', 'cro', 'bdo', 'assigned_stakeholder'],
      'resolve': ['admin', 'cro', 'bdo', 'assigned_stakeholder'],
      'view_all': ['admin', 'cro'],
      'view_assigned': ['all']
    };
    
    return this.checkPermission(userContext.role, operation, permissions);
  }
}
```

#### Data Protection
- Input sanitization for all dispute data
- Encryption of sensitive information
- GDPR compliance for personal data
- Audit logging for all data access
- Secure API key management

## Implementation Steps

### Phase 1: Core Infrastructure (Week 1)
1. **BaseService Extension**: Implement DisputeHandler class structure
2. **State Machine**: Create dispute state management system
3. **Data Model**: Define comprehensive dispute schema
4. **Database Integration**: Implement CRUD operations
5. **Basic Testing**: Unit tests for core functionality

### Phase 2: Workflow Implementation (Week 2)
1. **Submission Workflow**: Complete dispute submission process
2. **Assignment Logic**: Implement stakeholder routing
3. **Status Management**: Build status update system
4. **Validation Framework**: Comprehensive input validation
5. **Error Handling**: Robust error management

### Phase 3: Integration & Notifications (Week 3)
1. **CRM Integration**: Connect with existing CRM workflows
2. **Notification System**: WhatsApp and email notifications
3. **Audit Logging**: Comprehensive audit trail
4. **Performance Optimization**: Caching and batch operations
5. **Security Implementation**: Access control and data protection

### Phase 4: Testing & Validation (Week 4)
1. **Integration Testing**: End-to-end workflow testing
2. **Performance Testing**: Load and stress testing
3. **Security Testing**: Vulnerability assessment
4. **User Acceptance Testing**: Stakeholder validation
5. **Documentation**: Complete API and user documentation

## Success Criteria

### Functional Requirements
- ✅ All dispute states and transitions implemented
- ✅ Stakeholder routing logic operational
- ✅ Notification system fully functional
- ✅ Audit trail comprehensive and compliant
- ✅ Error handling covers all edge cases

### Performance Requirements
- ✅ Status updates complete within 2 seconds
- ✅ System handles 1000+ concurrent disputes
- ✅ 99.9% notification delivery success rate
- ✅ Zero data loss during processing
- ✅ Memory usage optimized for large datasets

### Quality Requirements
- ✅ 90%+ unit test coverage
- ✅ All integration tests passing
- ✅ Security vulnerabilities addressed
- ✅ Code follows established standards
- ✅ Documentation complete and current

## Execution Directive

Implement a production-ready DisputeHandler.js that addresses the critical gap identified in the journey analysis audit. The implementation must follow all established architecture patterns, security standards, and performance requirements while providing a comprehensive dispute resolution workflow that integrates seamlessly with the existing Anwar Sales Management System.

Ensure the solution is scalable, maintainable, and provides the audit trail and compliance features required for business operations. The implementation should serve as a foundation for future workflow automation enhancements outlined in the project roadmap.

**Priority:** Critical - This addresses a high-priority gap that impacts business operations and compliance requirements.

**Timeline:** 4-6 weeks total (development, testing, integration)

**Quality Gate:** All success criteria must be met before deployment to production environment.