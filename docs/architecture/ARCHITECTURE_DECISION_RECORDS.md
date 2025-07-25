# Architecture Decision Records (ADRs) - Anwar Sales Management System

## Overview

This document contains Architecture Decision Records (ADRs) for the Anwar Sales Management System. Each ADR captures a significant architectural decision, its context, rationale, and consequences.

## ADR Index

| ADR # | Title | Status | Date |
|-------|-------|--------|----- |
| [ADR-001](#adr-001-google-apps-script-as-primary-runtime) | Google Apps Script as Primary Runtime | Accepted | 2024-01-15 |
| [ADR-002](#adr-002-google-sheets-as-primary-database-mvp) | Google Sheets as Primary Database (MVP) | Accepted | 2024-01-21 |
| [ADR-003](#adr-003-mytapi-for-whatsapp-integration) | MyTAPI for WhatsApp Integration | Accepted | 2024-01-16 |
| [ADR-004](#adr-004-event-driven-microservices-architecture) | Event-Driven Microservices Architecture | Accepted | 2024-01-16 |
| [ADR-005](#adr-005-google-forms-for-data-collection) | Google Forms for Data Collection | Accepted | 2024-01-17 |
| [ADR-006](#adr-006-role-based-approval-workflows) | Role-Based Approval Workflows | Accepted | 2024-01-17 |
| [ADR-007](#adr-007-audit-trail-implementation) | Audit Trail Implementation | Accepted | 2024-01-18 |
| [ADR-008](#adr-008-security-and-data-protection-strategy) | Security and Data Protection Strategy | Accepted | 2024-01-18 |
| [ADR-009](#adr-009-polyglot-persistence-architecture) | Polyglot Persistence Architecture | Superseded by ADR-002 | 2024-01-20 |
| [ADR-010](#adr-010-postgresql-for-transactional-data) | PostgreSQL for Transactional Data | Superseded by ADR-002 | 2024-01-20 |
| [ADR-011](#adr-011-firestore-for-real-time-features) | Firestore for Real-time Features | Superseded by ADR-002 | 2024-01-20 |
| [ADR-012](#adr-012-redis-for-caching-and-sessions) | Redis for Caching and Sessions | Superseded by ADR-002 | 2024-01-20 |
| [ADR-013](#adr-013-data-migration-strategy) | Data Migration from Google Sheets | Superseded by ADR-002 | 2024-01-20 |

---

## ADR-001: Google Apps Script as Primary Runtime

### Status
**Accepted** - January 15, 2024

### Context
The Anwar Sales Management System requires a serverless runtime environment that can integrate seamlessly with Google Workspace services while providing cost-effective scalability for a growing sales organization.

### Decision
We will use Google Apps Script as the primary runtime environment for all business logic, data processing, and integration services.

### Rationale

#### Advantages
- **Native Google Workspace Integration**: Seamless access to Google Sheets, Forms, Drive, and Gmail APIs
- **Zero Infrastructure Management**: Fully managed serverless environment
- **Cost Effectiveness**: Free tier supports up to 6 minutes of execution time per trigger
- **Rapid Development**: JavaScript-based with extensive Google Services library
- **Built-in Authentication**: Leverages Google OAuth 2.0 automatically
- **Automatic Scaling**: Handles concurrent executions without configuration

#### Disadvantages
- **Execution Time Limits**: 6-minute maximum execution time per function
- **Limited External Libraries**: Restricted to Google-approved libraries
- **Vendor Lock-in**: Tight coupling with Google ecosystem
- **Limited Debugging**: Basic debugging capabilities compared to full IDEs

### Alternatives Considered

1. **Node.js on Google Cloud Functions**
   - Rejected: Higher complexity and cost for Google Workspace integration
   
2. **AWS Lambda with Google APIs**
   - Rejected: Additional authentication complexity and cross-cloud costs
   
3. **Traditional Web Server (Express.js)**
   - Rejected: Infrastructure management overhead and higher operational costs

### Consequences

#### Positive
- Rapid development and deployment cycles
- Minimal operational overhead
- Strong integration with existing Google Workspace infrastructure
- Cost-effective scaling for expected load

#### Negative
- Need to design functions within execution time constraints
- Limited to JavaScript ecosystem
- Dependency on Google's service availability

### Implementation Notes
- All business logic functions must complete within 6-minute limit
- Long-running processes will be broken into smaller, chained functions
- Error handling and retry mechanisms must be implemented for reliability

---

## ADR-002: Google Sheets as Primary Database (MVP)

### Status
**Accepted** - January 21, 2024

### Context
For the MVP (Minimum Viable Product) launch, the system requires a data storage solution that can handle structured registration data for six different entity types (Contractors, Engineers, Retailers, Potential Sites, User Orders, Visits) while providing rapid development, easy access for business users, and seamless integration with Google Apps Script. The MVP needs to be cost-effective and deployable quickly to validate business requirements.

### Decision
We will use Google Sheets as the primary database for storing all registration data in the MVP, with a comprehensive schema design including separate sheets for each entity type, supporting workflows, audit trails, and user management. This supersedes the previous polyglot persistence architecture (ADR-009 to ADR-013) for the initial release.

### Rationale

#### MVP-Specific Advantages
- **Rapid Development**: Immediate deployment without infrastructure setup
- **Zero Infrastructure Costs**: Included in existing Google Workspace subscription
- **Business User Accessibility**: Stakeholders can directly view and analyze data
- **Quick Iteration**: Schema changes can be made instantly without migrations
- **Familiar Interface**: No training required for business users
- **Built-in Collaboration**: Real-time multi-user access and editing
- **Automatic Backup**: Google Drive provides version history and recovery
- **Native Integration**: Seamless Google Apps Script connectivity
- **Comprehensive Schema**: Supports all six registration types with full audit trails
- **Role-Based Security**: Granular permission controls using Google Workspace

#### Technical Advantages
- **Data Validation**: Built-in validation rules and dropdown lists
- **Formula-Based Logic**: Automated calculations and status updates
- **Workflow Integration**: Direct integration with Google Apps Script automation
- **Notification System**: Email and external API integration capabilities
- **Document Management**: Integration with Google Drive for file attachments
- **Audit Trail**: Complete change tracking and user activity logging

#### Acknowledged Limitations
- **Scalability Constraints**: Performance degrades with very large datasets (>100K rows)
- **Limited Query Capabilities**: No complex SQL-like operations
- **Concurrent Write Conflicts**: Potential issues with simultaneous updates
- **No ACID Transactions**: Application-level consistency management required
- **Vendor Lock-in**: Tight coupling with Google ecosystem

### Alternatives Considered

1. **Polyglot Persistence Architecture (PostgreSQL + Firestore + Redis)**
   - Rejected for MVP: Higher complexity, infrastructure costs, and longer development time
   - Considered for future scaling when Google Sheets limitations are reached
   
2. **Google Cloud Firestore Only**
   - Rejected: Higher complexity for business users, additional costs, longer development cycle
   
3. **Google Cloud SQL**
   - Rejected: Infrastructure management overhead, integration complexity, higher costs
   
4. **MongoDB Atlas**
   - Rejected: Additional service costs, authentication complexity, vendor diversification

### Comprehensive Database Schema Design

The MVP implements a 12-sheet Google Sheets workbook with the following structure:

#### Core Sheets
1. **Registrations (Master)**: Central registry with registration_id, type, status, workflow tracking
2. **Users**: User management with roles, permissions, and authentication data
3. **Workflows**: Step-by-step approval processes with SLA tracking
4. **Audit_Trail**: Complete change history with user attribution
5. **Notifications**: System notifications and communication tracking
6. **Configuration**: System settings and configurable parameters

#### Registration Type Sheets
7. **Contractors**: Company details, licenses, certifications, verification status
8. **Engineers**: Professional credentials, specializations, availability, rates
9. **Retailers**: Business information, licenses, financial capability, territory
10. **Potential_Sites**: Location data, development potential, environmental factors
11. **User_Orders**: Customer orders with delivery details and payment information
12. **Visits**: Visitor management with scheduling and security clearance

#### Advanced Features
- **Data Validation**: Dropdown lists, format validation, required field enforcement
- **Formula-Based Automation**: Auto-ID generation, status calculations, timestamp updates
- **Google Apps Script Integration**: Automated workflows, notifications, audit logging
- **Security Controls**: Sheet-level permissions, protected ranges, role-based access
- **Performance Optimization**: Indexed lookups, batch operations, caching strategies

### Consequences

#### Positive
- **Rapid MVP Delivery**: Immediate deployment without infrastructure setup
- **Business User Empowerment**: Direct data access and manipulation capabilities
- **Cost-Effective Development**: Zero additional infrastructure or licensing costs
- **Flexible Schema Evolution**: Easy modifications during MVP validation phase
- **Built-in Collaboration**: Real-time multi-user access and editing
- **Comprehensive Audit Trail**: Complete change tracking and user attribution
- **Integrated Workflow Management**: Automated approval processes and notifications
- **Document Integration**: Native Google Drive file attachment capabilities
- **Security Framework**: Leverages Google Workspace enterprise security
- **Easy Migration Path**: Structured data export for future database transition

#### Negative
- **Scalability Constraints**: Performance degradation with datasets >100K rows
- **Limited Query Complexity**: No SQL-like operations or complex joins
- **Concurrent Write Limitations**: Potential conflicts with simultaneous updates
- **Vendor Lock-in**: Tight coupling with Google ecosystem
- **Formula Complexity**: Advanced business logic requires Google Apps Script
- **Mobile Experience**: Limited mobile app functionality compared to native solutions

### Implementation Notes

#### Technical Implementation
- **Google Apps Script**: Automated workflows, ID generation, audit logging, notifications
- **Data Validation**: Comprehensive validation rules, dropdown lists, format enforcement
- **Security Controls**: Sheet-level permissions, protected ranges, role-based access
- **Performance Optimization**: Indexed lookups, batch operations, query optimization
- **Backup Strategy**: Automated exports, version control, disaster recovery procedures

#### Documentation References
- **Detailed Schema**: See `google_sheets_schema_design.md` for complete field specifications
- **Visual Diagrams**: See `google_sheets_diagrams.md` for ERD and architecture diagrams
- **Migration Strategy**: Documented path to polyglot persistence architecture

#### Monitoring and Maintenance
- **Performance Metrics**: Response time monitoring, data volume tracking
- **Error Handling**: Comprehensive logging and error recovery procedures
- **User Training**: Documentation and training materials for business users
- **Regular Reviews**: Monthly assessment of scalability and performance requirements

---

## ADR-003: MyTAPI for WhatsApp Integration

### Status
**Accepted** - January 16, 2024

### Context
The system requires WhatsApp integration for real-time notifications to stakeholders about registration status updates, approvals, and important communications. The solution must be reliable, cost-effective, and easy to integrate with Google Apps Script.

### Decision
We will use MyTAPI (WhatsApp Business API service) for all WhatsApp messaging functionality.

### Rationale

#### Advantages
- **Simple REST API**: Easy integration with Google Apps Script's UrlFetchApp
- **Reliable Delivery**: High message delivery rates with status tracking
- **Cost Effective**: Competitive pricing for expected message volume
- **Rich Media Support**: Text, images, documents, and template messages
- **Webhook Support**: Real-time delivery status notifications
- **No Infrastructure**: Fully managed service

#### Disadvantages
- **Third-Party Dependency**: Reliance on external service availability
- **Rate Limiting**: API call limits may affect high-volume scenarios
- **Limited Customization**: Restricted to MyTAPI's feature set

### Alternatives Considered

1. **Twilio WhatsApp API**
   - Rejected: Higher cost and more complex integration requirements
   
2. **Direct WhatsApp Business API**
   - Rejected: Complex setup and Facebook Business verification requirements
   
3. **Telegram Bot API**
   - Rejected: Different user base and less business-oriented features

### Integration Architecture

```javascript
// MyTAPI Integration Service
class WhatsAppService {
  constructor(apiKey, baseUrl) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }
  
  sendMessage(phoneNumber, message) {
    // Implementation with error handling and retry logic
  }
  
  sendTemplate(phoneNumber, templateName, parameters) {
    // Template message implementation
  }
}
```

### Message Templates

1. **Registration Confirmation**
   - "Your {entity_type} registration has been received. Reference: {ref_id}"
   
2. **Status Updates**
   - "Your registration status has been updated to: {status}. Next steps: {next_steps}"
   
3. **Approval Notifications**
   - "Congratulations! Your {entity_type} registration has been approved."
   
4. **Document Requests**
   - "Additional documents required for your registration: {document_list}"

### Consequences

#### Positive
- Immediate stakeholder notifications
- Improved user experience with real-time updates
- Reduced manual communication overhead
- Professional business communication channel

#### Negative
- Additional service dependency and potential point of failure
- Message costs for high-volume scenarios
- Need for fallback communication methods

### Implementation Notes
- Implement retry logic for failed message deliveries
- Store message logs for audit and debugging purposes
- Configure rate limiting to respect API constraints
- Implement fallback to email notifications if WhatsApp fails

---

## ADR-004: Event-Driven Microservices Architecture

### Status
**Accepted** - January 16, 2024

### Context
The system needs to handle multiple registration types with different workflows, validation rules, and approval processes while maintaining loose coupling and scalability.

### Decision
We will implement an event-driven microservices architecture using Google Apps Script functions as individual microservices, with Google Sheets serving as both data store and event log.

### Rationale

#### Advantages
- **Loose Coupling**: Services communicate through events rather than direct calls
- **Scalability**: Individual services can scale independently
- **Maintainability**: Clear separation of concerns and responsibilities
- **Flexibility**: Easy to add new registration types or modify workflows
- **Resilience**: Failure in one service doesn't cascade to others

#### Disadvantages
- **Complexity**: More complex than monolithic architecture
- **Eventual Consistency**: Data consistency challenges across services
- **Debugging Difficulty**: Distributed system debugging complexity

### Service Decomposition

#### Core Services
1. **Registration Service** (per entity type)
   - Contractor Registration Service
   - Engineer Registration Service
   - Retailer Registration Service
   - Potential Site Registration Service

2. **Shared Services**
   - Validation Service
   - Workflow Service
   - Notification Service
   - Document Service
   - Analytics Service
   - Audit Service

### Event Types

```javascript
// Event Schema
const EventTypes = {
  REGISTRATION_SUBMITTED: 'registration.submitted',
  VALIDATION_COMPLETED: 'validation.completed',
  APPROVAL_REQUIRED: 'approval.required',
  STATUS_CHANGED: 'status.changed',
  DOCUMENT_UPLOADED: 'document.uploaded',
  NOTIFICATION_SENT: 'notification.sent'
};
```

### Event Flow Example

```
1. Form Submission → REGISTRATION_SUBMITTED event
2. Validation Service → VALIDATION_COMPLETED event
3. Workflow Service → APPROVAL_REQUIRED event
4. Notification Service → NOTIFICATION_SENT event
5. Audit Service → Logs all events
```

### Consequences

#### Positive
- Clear service boundaries and responsibilities
- Independent development and deployment of services
- Better fault isolation and recovery
- Easier to understand and modify individual components

#### Negative
- Increased operational complexity
- Need for robust event handling and error recovery
- Potential for event ordering issues

### Implementation Notes
- Use Google Sheets as event store with timestamp ordering
- Implement idempotent event handlers
- Add comprehensive logging and monitoring
- Design for eventual consistency

---

## ADR-005: Google Forms for Data Collection

### Status
**Accepted** - January 17, 2024

### Context
The system requires user-friendly data collection interfaces for four different registration types, with built-in validation, mobile responsiveness, and seamless integration with the backend processing system.

### Decision
We will use Google Forms as the primary data collection interface for all registration types, with custom Apps Script triggers for backend processing.

### Rationale

#### Advantages
- **Zero Development Time**: Pre-built form interface with professional appearance
- **Mobile Responsive**: Automatic mobile optimization
- **Built-in Validation**: Basic field validation without custom code
- **Accessibility**: Compliant with accessibility standards
- **Multi-language Support**: Easy localization capabilities
- **Offline Capability**: Forms can be filled offline and submitted when online
- **Integration**: Native integration with Google Apps Script triggers

#### Disadvantages
- **Limited Customization**: Restricted to Google Forms styling and layout options
- **Basic Validation**: Limited to simple validation rules
- **No Complex Logic**: Cannot implement conditional field display based on responses
- **Branding Limitations**: Limited ability to match corporate branding

### Form Design Strategy

#### Common Form Elements
- **Header Section**: Logo, title, and instructions
- **Personal Information**: Name, contact details, identification
- **Entity-Specific Sections**: Tailored to each registration type
- **Document Upload**: Required certificates and supporting documents
- **Declaration**: Terms acceptance and data privacy consent

#### Form-Specific Configurations

1. **Contractor Registration Form**
   - Skills and experience sections
   - Previous project references
   - Certification uploads
   - Availability and location preferences

2. **Engineer Registration Form**
   - Educational qualifications
   - Professional licenses
   - Technical specializations
   - Portfolio submissions

3. **Retailer Registration Form**
   - Business registration details
   - Financial capability documentation
   - Territory preferences
   - Partnership terms

4. **Potential Site Registration Form**
   - Location details and coordinates
   - Market analysis data
   - Feasibility study uploads
   - Strategic importance assessment

### Consequences

#### Positive
- Rapid deployment of data collection interfaces
- Professional appearance without custom development
- Automatic data validation and formatting
- Built-in spam protection and security

#### Negative
- Limited ability to implement complex business rules in forms
- Need for additional validation in backend processing
- Dependency on Google Forms feature set

### Implementation Notes
- Create separate forms for each registration type
- Implement comprehensive backend validation
- Use form sections to organize complex data collection
- Configure appropriate response validation settings

---

## ADR-006: Role-Based Approval Workflows

### Status
**Accepted** - January 17, 2024

### Context
Different registration types require different approval processes with varying levels of review, from simple CRO approval for contractors to comprehensive technical and business evaluation for engineers and retailers.

### Decision
We will implement role-based approval workflows with configurable approval chains based on registration type and complexity.

### Rationale

#### Advantages
- **Flexibility**: Different workflows for different entity types
- **Scalability**: Easy to add new approval roles and processes
- **Accountability**: Clear audit trail of approval decisions
- **Efficiency**: Parallel approval processes where appropriate
- **Quality Control**: Multi-level review ensures quality registrations

#### Disadvantages
- **Complexity**: More complex than single-approval systems
- **Potential Bottlenecks**: Risk of delays if approvers are unavailable
- **Configuration Overhead**: Need to maintain workflow configurations

### Workflow Definitions

#### Contractor Registration Workflow
```
1. Auto-Validation → 2. CRO Review → 3. Final Approval
   (System)           (Human)         (Automated)
```

#### Engineer Registration Workflow
```
1. Auto-Validation → 2. Technical Review → 3. Credential Verification → 4. Final Approval
   (System)           (Technical Lead)     (HR Department)            (Management)
```

#### Retailer Registration Workflow
```
1. Auto-Validation → 2. Business Review → 3. Financial Review → 4. Territory Review → 5. Final Approval
   (System)           (Business Dev)      (Finance Team)      (Sales Manager)     (Management)
```

#### Potential Site Registration Workflow
```
1. Auto-Validation → 2. Location Analysis → 3. Market Assessment → 4. Strategic Review → 5. Final Approval
   (System)           (Site Analyst)        (Market Research)     (Strategy Team)     (Executive)
```

### Role Definitions

```javascript
const ApprovalRoles = {
  SYSTEM: 'system',
  CRO: 'cro',
  TECHNICAL_LEAD: 'technical_lead',
  HR_DEPARTMENT: 'hr_department',
  BUSINESS_DEV: 'business_development',
  FINANCE_TEAM: 'finance_team',
  SALES_MANAGER: 'sales_manager',
  SITE_ANALYST: 'site_analyst',
  MARKET_RESEARCH: 'market_research',
  STRATEGY_TEAM: 'strategy_team',
  MANAGEMENT: 'management',
  EXECUTIVE: 'executive'
};
```

### Workflow Engine Implementation

```javascript
class WorkflowEngine {
  constructor() {
    this.workflows = this.loadWorkflowDefinitions();
  }
  
  initiateWorkflow(registrationId, entityType) {
    const workflow = this.workflows[entityType];
    return this.createWorkflowInstance(registrationId, workflow);
  }
  
  processApproval(workflowId, approverRole, decision, comments) {
    // Implementation for processing approval decisions
  }
  
  getNextApprover(workflowId) {
    // Implementation for determining next approver
  }
}
```

### Consequences

#### Positive
- Appropriate level of review for each registration type
- Clear accountability and audit trail
- Flexible and configurable approval processes
- Parallel processing capabilities for efficiency

#### Negative
- Increased complexity in workflow management
- Potential for approval bottlenecks
- Need for role management and permissions

### Implementation Notes
- Implement timeout mechanisms for approval steps
- Add escalation procedures for delayed approvals
- Create dashboard for approval queue management
- Implement notification system for pending approvals

---

## ADR-007: Audit Trail Implementation

### Status
**Accepted** - January 18, 2024

### Context
The system requires comprehensive audit trails for compliance, debugging, and business intelligence purposes. All data changes, user actions, and system events must be logged with appropriate detail and retention policies.

### Decision
We will implement a comprehensive audit trail system using Google Sheets as the audit log store, with structured logging for all system events and data changes.

### Rationale

#### Advantages
- **Compliance**: Meets regulatory requirements for data change tracking
- **Debugging**: Detailed logs help troubleshoot system issues
- **Business Intelligence**: Audit data provides insights into system usage
- **Security**: Helps detect unauthorized access or data manipulation
- **Accountability**: Clear record of who made what changes when

#### Disadvantages
- **Storage Overhead**: Audit logs consume additional storage space
- **Performance Impact**: Logging operations add processing overhead
- **Privacy Concerns**: Detailed logging may capture sensitive information

### Audit Log Schema

```javascript
const AuditLogEntry = {
  timestamp: 'ISO 8601 timestamp',
  event_id: 'Unique event identifier',
  event_type: 'Type of event (CREATE, UPDATE, DELETE, LOGIN, etc.)',
  entity_type: 'Type of entity affected (CONTRACTOR, ENGINEER, etc.)',
  entity_id: 'ID of the affected entity',
  user_id: 'ID of the user who performed the action',
  user_email: 'Email of the user who performed the action',
  action: 'Specific action performed',
  old_values: 'JSON of previous values (for updates)',
  new_values: 'JSON of new values (for updates)',
  ip_address: 'IP address of the user (if available)',
  user_agent: 'Browser/client information',
  session_id: 'Session identifier',
  notes: 'Additional context or comments',
  severity: 'Log level (INFO, WARN, ERROR, CRITICAL)'
};
```

### Event Types to Audit

#### Data Events
- Registration submissions
- Data updates and modifications
- Status changes
- Approval decisions
- Document uploads and deletions

#### System Events
- User logins and logouts
- Permission changes
- Configuration updates
- Integration API calls
- Error conditions

#### Security Events
- Failed login attempts
- Unauthorized access attempts
- Data export operations
- Administrative actions

### Audit Service Implementation

```javascript
class AuditService {
  constructor() {
    this.auditSheet = SpreadsheetApp.openById(AUDIT_SHEET_ID);
  }
  
  logEvent(eventType, entityType, entityId, action, oldValues, newValues, notes) {
    const entry = {
      timestamp: new Date().toISOString(),
      event_id: Utilities.getUuid(),
      event_type: eventType,
      entity_type: entityType,
      entity_id: entityId,
      user_id: Session.getActiveUser().getEmail(),
      user_email: Session.getActiveUser().getEmail(),
      action: action,
      old_values: JSON.stringify(oldValues),
      new_values: JSON.stringify(newValues),
      notes: notes,
      severity: 'INFO'
    };
    
    this.writeAuditEntry(entry);
  }
  
  logError(error, context) {
    // Implementation for error logging
  }
  
  logSecurityEvent(eventType, details) {
    // Implementation for security event logging
  }
}
```

### Data Retention Policy

- **Active Audit Logs**: 2 years in primary audit sheet
- **Archived Audit Logs**: 7 years in Google Drive archive
- **Critical Security Events**: Permanent retention
- **Performance Logs**: 90 days retention

### Consequences

#### Positive
- Complete visibility into system operations
- Compliance with data protection regulations
- Enhanced security monitoring capabilities
- Valuable data for system optimization

#### Negative
- Additional storage and processing overhead
- Potential privacy implications
- Need for log management and archiving processes

### Implementation Notes
- Implement asynchronous logging to minimize performance impact
- Add log rotation and archiving mechanisms
- Create audit log analysis and reporting tools
- Ensure audit logs themselves are protected from tampering

---

## ADR-008: Security and Data Protection Strategy

### Status
**Accepted** - January 18, 2024

### Context
The system handles sensitive personal and business information requiring robust security measures, data protection compliance, and privacy safeguards while maintaining usability and integration capabilities.

### Decision
We will implement a comprehensive security strategy leveraging Google Workspace security features, supplemented with application-level security controls and data protection measures.

### Rationale

#### Advantages
- **Built-in Security**: Leverages Google's enterprise-grade security infrastructure
- **Compliance Ready**: Google Workspace provides GDPR, SOC 2, and other compliance certifications
- **Minimal Overhead**: Security features are built into the platform
- **Regular Updates**: Google handles security patches and updates
- **Integration**: Security controls integrate seamlessly with Google services

#### Disadvantages
- **Limited Customization**: Restricted to Google's security model
- **Vendor Dependency**: Reliance on Google's security practices
- **Shared Responsibility**: Some security aspects remain application responsibility

### Security Architecture

#### Authentication and Authorization

```javascript
// Role-Based Access Control
const UserRoles = {
  ADMIN: {
    permissions: ['READ_ALL', 'WRITE_ALL', 'DELETE_ALL', 'MANAGE_USERS'],
    description: 'Full system access'
  },
  MANAGER: {
    permissions: ['READ_ALL', 'APPROVE_REGISTRATIONS', 'MANAGE_WORKFLOWS'],
    description: 'Management and approval access'
  },
  REVIEWER: {
    permissions: ['READ_ASSIGNED', 'UPDATE_STATUS', 'ADD_COMMENTS'],
    description: 'Review and update assigned registrations'
  },
  VIEWER: {
    permissions: ['READ_ASSIGNED'],
    description: 'Read-only access to assigned registrations'
  }
};
```

#### Data Classification

1. **Public Data**: System configuration, public documentation
2. **Internal Data**: Aggregated statistics, system logs
3. **Confidential Data**: Registration details, personal information
4. **Restricted Data**: Financial information, sensitive business data

#### Security Controls

##### Access Controls
- Google OAuth 2.0 authentication
- Role-based access control (RBAC)
- Principle of least privilege
- Regular access reviews and cleanup

##### Data Protection
- Data encryption in transit (TLS 1.3)
- Data encryption at rest (Google's encryption)
- Data loss prevention (DLP) policies
- Regular data backup and recovery testing

##### Application Security
- Input validation and sanitization
- SQL injection prevention (through parameterized queries)
- Cross-site scripting (XSS) prevention
- Cross-site request forgery (CSRF) protection

##### Monitoring and Logging
- Comprehensive audit logging
- Security event monitoring
- Anomaly detection
- Incident response procedures

### Data Privacy Implementation

#### GDPR Compliance Measures

```javascript
class DataPrivacyService {
  constructor() {
    this.consentManager = new ConsentManager();
    this.dataProcessor = new DataProcessor();
  }
  
  recordConsent(userId, consentType, consentGiven) {
    // Implementation for recording user consent
  }
  
  processDataSubjectRequest(requestType, userId) {
    // Implementation for handling GDPR requests
    // - Right to access
    // - Right to rectification
    // - Right to erasure
    // - Right to data portability
  }
  
  anonymizeData(entityId) {
    // Implementation for data anonymization
  }
}
```

#### Data Minimization
- Collect only necessary data for business purposes
- Regular data review and purging
- Anonymization of historical data
- Clear data retention policies

#### Consent Management
- Explicit consent for data collection
- Granular consent options
- Easy consent withdrawal
- Consent audit trail

### Security Monitoring

#### Key Security Metrics
- Failed authentication attempts
- Unusual access patterns
- Data export activities
- Permission changes
- System errors and exceptions

#### Incident Response Plan

1. **Detection**: Automated monitoring and manual reporting
2. **Assessment**: Severity classification and impact analysis
3. **Containment**: Immediate actions to limit damage
4. **Investigation**: Root cause analysis and evidence collection
5. **Recovery**: System restoration and service resumption
6. **Lessons Learned**: Post-incident review and improvements

### Consequences

#### Positive
- Strong security posture with minimal implementation effort
- Compliance with major data protection regulations
- Built-in disaster recovery and business continuity
- Regular security updates and patches

#### Negative
- Limited control over underlying security infrastructure
- Dependency on Google's security practices
- Need for additional application-level security measures

### Implementation Notes
- Regular security assessments and penetration testing
- Security awareness training for all users
- Incident response plan testing and updates
- Regular review and update of security policies

---

## ADR-009: Polyglot Persistence Architecture

### Status
**Accepted** - January 20, 2024

### Context
As the Anwar Sales Management System scales beyond the initial MVP phase, the limitations of using Google Sheets as the sole data storage solution have become apparent. The system requires:
- Better performance for large datasets (>100,000 registrations)
- ACID transaction support for critical business operations
- Real-time data synchronization capabilities
- Advanced querying and analytics capabilities
- Improved data security and compliance features

### Decision
We will implement a polyglot persistence architecture that uses different database technologies optimized for specific use cases:
- **PostgreSQL** for transactional data and complex queries
- **Google Firestore** for real-time features and document storage
- **Redis** for caching, session management, and high-performance operations
- **Google Sheets** retained for business user interfaces and reporting

### Rationale

#### Advantages
- **Performance Optimization**: Each database optimized for specific use cases
- **Scalability**: Independent scaling of different data layers
- **Reliability**: ACID transactions for critical operations
- **Real-time Capabilities**: Native real-time synchronization
- **Advanced Analytics**: SQL capabilities for complex reporting
- **Caching Performance**: Sub-millisecond response times for frequent operations

#### Disadvantages
- **Increased Complexity**: Multiple databases to manage and maintain
- **Data Consistency**: Need for careful synchronization between systems
- **Operational Overhead**: More infrastructure components to monitor
- **Development Complexity**: Different APIs and query languages

### Alternatives Considered

1. **Single PostgreSQL Database**
   - Rejected: Limited real-time capabilities and caching performance
   
2. **Single Firestore Database**
   - Rejected: Limited complex querying and analytics capabilities
   
3. **MongoDB with Redis**
   - Rejected: Less mature ecosystem integration with Google Cloud

### Consequences

#### Positive
- Significant performance improvements for all operations
- Better user experience with real-time updates
- Enhanced data security and compliance capabilities
- Future-proof architecture for continued growth

#### Negative
- Increased development and operational complexity
- Need for data synchronization strategies
- Higher infrastructure costs

### Implementation Notes
- Implement gradual migration strategy from Google Sheets
- Use event-driven architecture for data synchronization
- Implement comprehensive monitoring and alerting
- Maintain Google Sheets integration for business users

---

## ADR-010: PostgreSQL for Transactional Data

### Status
**Accepted** - January 20, 2024

### Context
The system requires a robust relational database for storing structured registration data, managing complex relationships, and ensuring ACID transaction properties for critical business operations.

### Decision
We will use PostgreSQL as the primary transactional database for storing all registration data, user management, workflow states, and audit trails.

### Rationale

#### Advantages
- **ACID Compliance**: Full transaction support for data integrity
- **Advanced SQL Features**: Complex queries, joins, and analytics
- **JSON Support**: Native JSON columns for flexible schema evolution
- **Performance**: Excellent performance for complex queries
- **Extensibility**: Rich ecosystem of extensions (PostGIS, pgcrypto)
- **Google Cloud Integration**: Fully managed Cloud SQL service
- **Backup and Recovery**: Automated backup and point-in-time recovery

#### Disadvantages
- **Learning Curve**: Team needs SQL expertise
- **Schema Management**: Requires careful database migration planning
- **Scaling Complexity**: Vertical scaling limitations

### Schema Design

#### Core Tables
- **registrations**: Master registration table with common fields
- **contractors**: Contractor-specific data and relationships
- **engineers**: Engineer credentials and certifications
- **retailers**: Business registration and financial data
- **potential_sites**: Location and feasibility data
- **users**: User accounts and role management
- **workflows**: Approval workflow definitions and states
- **audit_trails**: Comprehensive audit logging

#### Advanced Features
- **Partitioning**: Monthly partitions for audit trails
- **Row-Level Security**: Data access control at database level
- **Encryption**: Sensitive data encryption using pgcrypto
- **Full-Text Search**: Advanced search capabilities

### Consequences

#### Positive
- Reliable data storage with strong consistency guarantees
- Advanced querying capabilities for reporting and analytics
- Excellent performance for complex business operations
- Strong security features for sensitive data protection

#### Negative
- Additional infrastructure complexity
- Need for database administration expertise
- Potential single point of failure (mitigated by replication)

### Implementation Notes
- Use Google Cloud SQL for PostgreSQL for managed service benefits
- Implement read replicas for improved read performance
- Set up automated backup and monitoring
- Use connection pooling for optimal performance

---

## ADR-011: Firestore for Real-time Features

### Status
**Accepted** - January 20, 2024

### Context
The system requires real-time capabilities for live notifications, collaborative features, and instant status updates across multiple users and devices.

### Decision
We will use Google Firestore as the real-time database for live notifications, user sessions, real-time registration updates, and collaborative features.

### Rationale

#### Advantages
- **Real-time Synchronization**: Native real-time listeners and updates
- **Offline Support**: Automatic offline synchronization
- **Scalability**: Automatic scaling with no configuration
- **Security Rules**: Declarative security at database level
- **Google Integration**: Seamless integration with other Google services
- **NoSQL Flexibility**: Schema-less document storage
- **Multi-platform**: Native SDKs for web, mobile, and server

#### Disadvantages
- **Limited Querying**: No complex joins or aggregations
- **Cost Model**: Pay-per-operation pricing can be expensive
- **Vendor Lock-in**: Google-specific technology

### Document Structure

#### Collections
- **live_registrations**: Real-time registration status updates
- **notifications**: User-specific notification queues
- **user_sessions**: Active user sessions and presence
- **collaboration**: Real-time collaborative editing sessions
- **system_events**: Real-time system status and events

#### Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /live_registrations/{registrationId} {
      allow read, write: if request.auth != null && 
        resource.data.assignedUsers[request.auth.uid] == true;
    }
    
    match /notifications/{userId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
  }
}
```

### Consequences

#### Positive
- Excellent user experience with real-time updates
- Reduced server load through client-side real-time listeners
- Built-in offline support for mobile and web applications
- Strong security model with declarative rules

#### Negative
- Additional complexity in data synchronization
- Potential for higher costs with high-frequency updates
- Limited querying capabilities compared to SQL

### Implementation Notes
- Use Firestore for real-time features only, not primary data storage
- Implement data synchronization from PostgreSQL to Firestore
- Use security rules to enforce access control
- Monitor usage and costs carefully

---

## ADR-012: Redis for Caching and Sessions

### Status
**Accepted** - January 20, 2024

### Context
The system requires high-performance caching, session management, rate limiting, and temporary data storage to improve response times and user experience.

### Decision
We will use Redis as the caching layer and session store, providing sub-millisecond response times for frequently accessed data and managing user sessions.

### Rationale

#### Advantages
- **High Performance**: Sub-millisecond response times
- **Rich Data Types**: Strings, hashes, lists, sets, sorted sets
- **Persistence Options**: Configurable persistence for durability
- **Pub/Sub**: Built-in publish/subscribe messaging
- **Atomic Operations**: Thread-safe operations for counters and locks
- **Google Cloud Integration**: Fully managed Memorystore service
- **Clustering**: Built-in clustering for high availability

#### Disadvantages
- **Memory Limitations**: Data must fit in memory
- **Complexity**: Additional infrastructure component
- **Data Volatility**: Risk of data loss if not properly configured

### Use Cases

#### Caching Strategy
- **Database Query Results**: Cache expensive PostgreSQL queries
- **API Responses**: Cache external API responses (MyTAPI, etc.)
- **Computed Data**: Cache calculated values and aggregations
- **Static Data**: Cache configuration and lookup data

#### Session Management
- **User Sessions**: Store active user session data
- **Authentication Tokens**: Cache JWT tokens and refresh tokens
- **User Preferences**: Cache user settings and preferences

#### Rate Limiting
- **API Rate Limits**: Track and enforce API usage limits
- **User Actions**: Prevent abuse with action rate limiting
- **System Protection**: Protect against DDoS and spam

#### Real-time Features
- **Live Counters**: Real-time statistics and counters
- **Message Queues**: Temporary message storage for processing
- **Leaderboards**: Sorted sets for ranking and scoring

### Data Structure Examples

```javascript
// Session Management
SET session:user123 '{"userId":"123","role":"reviewer","lastActivity":"2024-01-20T10:30:00Z"}'
EXPIRE session:user123 3600

// Caching
SET cache:registration:456 '{"id":"456","status":"pending","type":"contractor"}'
EXPIRE cache:registration:456 300

// Rate Limiting
INCR ratelimit:api:user123:minute
EXPIRE ratelimit:api:user123:minute 60

// Real-time Counters
ZADD leaderboard:reviewers 95 "reviewer123"
ZADD leaderboard:reviewers 87 "reviewer456"
```

### Consequences

#### Positive
- Significant performance improvements for frequent operations
- Better user experience with faster response times
- Reduced load on primary databases
- Enhanced real-time capabilities

#### Negative
- Additional infrastructure complexity and costs
- Need for cache invalidation strategies
- Potential data consistency challenges

### Implementation Notes
- Use Google Cloud Memorystore for Redis for managed service benefits
- Implement proper cache invalidation strategies
- Set up monitoring and alerting for cache performance
- Use Redis clustering for high availability

---

## ADR-013: Data Migration Strategy from Google Sheets

### Status
**Accepted** - January 20, 2024

### Context
The system needs to migrate existing data from Google Sheets to the new polyglot persistence architecture while maintaining business continuity and data integrity.

### Decision
We will implement a phased data migration strategy that gradually transitions from Google Sheets to the new database architecture while maintaining backward compatibility and business operations.

### Rationale

#### Advantages
- **Risk Mitigation**: Gradual migration reduces risk of data loss
- **Business Continuity**: Minimal disruption to ongoing operations
- **Validation Opportunity**: Extensive testing and validation during migration
- **Rollback Capability**: Ability to rollback if issues are discovered
- **User Adaptation**: Time for users to adapt to new interfaces

#### Disadvantages
- **Complexity**: Managing dual systems during transition
- **Resource Intensive**: Requires significant development and testing effort
- **Data Synchronization**: Need to keep systems in sync during transition

### Migration Phases

#### Phase 1: Infrastructure Setup (Week 1-2)
- Deploy PostgreSQL, Firestore, and Redis infrastructure
- Set up monitoring, backup, and security configurations
- Create database schemas and initial data structures
- Implement basic CRUD operations for new databases

#### Phase 2: Data Assessment and Preparation (Week 3-4)
- Analyze existing Google Sheets data for quality and completeness
- Identify data cleaning and transformation requirements
- Create data mapping between Google Sheets and new schemas
- Develop data validation and verification procedures

#### Phase 3: Initial Data Migration (Week 5-6)
- Extract data from Google Sheets using Apps Script
- Transform and clean data according to new schema requirements
- Load data into PostgreSQL with comprehensive validation
- Create initial Firestore documents for real-time features
- Populate Redis with initial cache data

#### Phase 4: Dual-Write Implementation (Week 7-8)
- Implement dual-write system to both Google Sheets and new databases
- Ensure data consistency between systems
- Monitor for synchronization issues and data discrepancies
- Implement conflict resolution strategies

#### Phase 5: Application Migration (Week 9-12)
- Gradually migrate application features to use new databases
- Implement new APIs and services
- Update user interfaces to leverage new capabilities
- Maintain Google Sheets integration for business users

#### Phase 6: Validation and Testing (Week 13-14)
- Comprehensive testing of all system functionality
- Performance testing and optimization
- User acceptance testing with key stakeholders
- Security and compliance validation

#### Phase 7: Cutover and Cleanup (Week 15-16)
- Switch primary operations to new database architecture
- Disable dual-write to Google Sheets for transactional data
- Maintain Google Sheets for reporting and business user access
- Archive old data and clean up temporary migration infrastructure

### Data Migration Tools

#### Migration Service
```javascript
class DataMigrationService {
  constructor() {
    this.sheetsService = new GoogleSheetsService();
    this.postgresService = new PostgreSQLService();
    this.firestoreService = new FirestoreService();
    this.redisService = new RedisService();
  }
  
  async migrateRegistrations() {
    const sheetsData = await this.sheetsService.getAllRegistrations();
    const transformedData = this.transformRegistrationData(sheetsData);
    
    for (const registration of transformedData) {
      await this.postgresService.createRegistration(registration);
      await this.firestoreService.createLiveRegistration(registration);
      await this.redisService.cacheRegistration(registration);
    }
  }
  
  transformRegistrationData(sheetsData) {
    // Implementation for data transformation and validation
  }
  
  async validateMigration() {
    // Implementation for data validation and integrity checks
  }
}
```

#### Synchronization Service
```javascript
class DataSynchronizationService {
  constructor() {
    this.conflictResolver = new ConflictResolver();
  }
  
  async syncRegistrationUpdate(registrationId, updates) {
    try {
      // Update PostgreSQL (primary)
      await this.postgresService.updateRegistration(registrationId, updates);
      
      // Update Firestore (real-time)
      await this.firestoreService.updateLiveRegistration(registrationId, updates);
      
      // Update Redis (cache)
      await this.redisService.updateCachedRegistration(registrationId, updates);
      
      // Update Google Sheets (business users)
      await this.sheetsService.updateRegistration(registrationId, updates);
      
    } catch (error) {
      await this.handleSyncError(registrationId, updates, error);
    }
  }
}
```

### Data Validation Strategy

#### Validation Checks
- **Data Completeness**: Ensure all required fields are present
- **Data Accuracy**: Validate data formats and business rules
- **Referential Integrity**: Check relationships between entities
- **Data Consistency**: Compare data across different systems
- **Performance Validation**: Ensure acceptable response times

#### Rollback Procedures
- Maintain complete backup of Google Sheets data
- Implement point-in-time recovery for new databases
- Create rollback scripts for each migration phase
- Document rollback procedures and decision criteria

### Consequences

#### Positive
- Systematic approach minimizes risk of data loss
- Comprehensive validation ensures data quality
- Gradual transition allows for user adaptation
- Maintains business continuity throughout migration

#### Negative
- Extended timeline for complete migration
- Resource-intensive process requiring dedicated team
- Complexity of managing multiple systems simultaneously

### Implementation Notes
- Assign dedicated migration team with clear responsibilities
- Implement comprehensive monitoring and alerting
- Create detailed migration documentation and procedures
- Plan for extended support period after migration completion

---

## ADR Template

### Status
**[Proposed | Accepted | Deprecated | Superseded]** - [Date]

### Context
[Describe the situation that led to this decision]

### Decision
[State the decision that was made]

### Rationale
[Explain why this decision was made, including advantages and disadvantages]

### Alternatives Considered
[List other options that were considered and why they were rejected]

### Consequences
[Describe the positive and negative consequences of this decision]

### Implementation Notes
[Any specific implementation details or considerations]

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-01-18 | Architecture Team | Initial ADR documentation |
| 2.0 | 2024-01-20 | Database Design Agent | Added polyglot persistence architecture ADRs (ADR-009 to ADR-013), superseded ADR-002 |
| 3.0 | 2024-01-20 | MVP Development Team | Reverted ADR-002 to Accepted status for MVP, superseded polyglot persistence ADRs (ADR-009 to ADR-013), updated comprehensive Google Sheets schema design |

---

## References

- [System Architecture Document](./SYSTEM_ARCHITECTURE_DOCUMENT.md)
- [Component Diagrams](./COMPONENT_DIAGRAMS.md)
- [Agent Coordination Guide](../../.taskmaster/docs/AGENT_COORDINATION_GUIDE.md)
- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [Google Workspace Security](https://workspace.google.com/security/)
- [MyTAPI Documentation](https://mytapi.com/docs)