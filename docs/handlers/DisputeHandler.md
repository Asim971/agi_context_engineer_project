# DisputeHandler Documentation

## Overview

The `DisputeHandler` is a comprehensive dispute resolution workflow management system for the Anwar Sales Ecosystem. It addresses the critical gap identified in the journey analysis audit by providing a structured, state-driven approach to handling disputes with automated notifications, audit trails, and access control.

## Features

### Core Functionality
- **State Machine-Driven Workflow**: Enforces valid state transitions throughout the dispute lifecycle
- **Comprehensive Validation**: Input validation for all dispute data and operations
- **Access Control**: Role-based permissions for different operations
- **Automated Notifications**: WhatsApp notifications for key workflow events
- **Audit Trail**: Complete history tracking for all dispute activities
- **Performance Optimization**: Caching and rate limiting for optimal performance
- **Error Handling**: Robust error handling with detailed logging

### Dispute States

```
submitted → assigned → in-review → resolved → closed
     ↑         ↑           ↑          ↑
     └─────────┴───────────┴──────────┘
     (backward transitions allowed for workflow flexibility)
```

## Architecture

### Class Structure

```
DisputeHandlerService (extends BaseService)
├── DisputeStateMachine
├── DisputeNotificationService
├── DisputeAccessControl
└── Caching & Performance Optimization
```

### Dependencies
- `BaseService` - Core service architecture
- `GlobalServiceLocator` - Dependency injection
- `Config` - Configuration management
- `DatabaseService` - Data persistence
- `ValidationService` - Data validation
- `WhatsAppService` - Notification delivery
- `IdService` - Unique ID generation

## API Reference

### Core Methods

#### `submitDispute(disputeData, userContext)`

Submits a new dispute with comprehensive validation.

**Parameters:**
- `disputeData` (Object): Dispute information
  - `type` (string): Dispute type (`registration`, `approval`, `technical`, `billing`, `other`)
  - `title` (string): Dispute title (max 200 characters)
  - `description` (string): Detailed description (max 2000 characters)
  - `priority` (string): Priority level (`low`, `medium`, `high`, `urgent`)
- `userContext` (Object): Submitter context
  - `name` (string): User's full name
  - `email` (string): User's email address
  - `role` (string): User's role in the system

**Returns:**
```javascript
{
  success: true,
  disputeId: "DSP-000001",
  status: "submitted",
  message: "Dispute submitted successfully"
}
```

**Example:**
```javascript
const disputeData = {
  type: 'registration',
  title: 'Unable to complete registration',
  description: 'The registration form is not accepting my documents',
  priority: 'high'
};

const userContext = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  role: 'retailer'
};

const result = await DisputeHandler.submitDispute(disputeData, userContext);
```

#### `assignDispute(disputeId, stakeholderId, userContext)`

Assigns a dispute to a stakeholder with workload balancing.

**Parameters:**
- `disputeId` (string): Unique dispute identifier
- `stakeholderId` (string, optional): Specific stakeholder email (auto-assigned if null)
- `userContext` (Object): User performing the assignment

**Returns:**
```javascript
{
  success: true,
  assignedTo: "cro1@anwar.com",
  status: "assigned",
  message: "Dispute assigned to cro1@anwar.com"
}
```

**Example:**
```javascript
// Manual assignment
const result = await DisputeHandler.assignDispute(
  'DSP-000001', 
  'cro1@anwar.com', 
  userContext
);

// Auto-assignment
const result = await DisputeHandler.assignDispute(
  'DSP-000001', 
  null, 
  userContext
);
```

#### `updateDisputeStatus(disputeId, newStatus, updateData)`

Updates dispute status with validation and audit trail.

**Parameters:**
- `disputeId` (string): Dispute identifier
- `newStatus` (string): New status value
- `updateData` (Object, optional): Additional update information
  - `actor` (string): User performing the update
  - `notes` (string): Update notes
  - `assignedTo` (string): New assignee (for assignment updates)
  - `resolution` (Object): Resolution data (for resolution updates)

**Returns:**
```javascript
{
  success: true,
  status: "in-review",
  timestamp: "2024-01-15T10:30:00.000Z",
  message: "Status updated to in-review"
}
```

#### `resolveDispute(disputeId, resolutionData, userContext)`

Resolves a dispute with comprehensive resolution data.

**Parameters:**
- `disputeId` (string): Dispute identifier
- `resolutionData` (Object): Resolution information
  - `summary` (string): Resolution summary (max 1000 characters)
  - `actions` (Array, optional): List of actions taken
- `userContext` (Object): User resolving the dispute

**Returns:**
```javascript
{
  success: true,
  status: "resolved",
  resolution: {
    summary: "Issue resolved by updating user permissions",
    actions: ["Updated user role", "Sent confirmation email"],
    resolvedBy: "cro1@anwar.com",
    resolvedAt: "2024-01-15T10:30:00.000Z"
  },
  message: "Dispute resolved successfully"
}
```

#### `getDisputeById(disputeId)`

Retrieves a specific dispute by ID with caching.

**Parameters:**
- `disputeId` (string): Dispute identifier

**Returns:**
```javascript
{
  id: "DSP-000001",
  type: "registration",
  title: "Registration Issue",
  description: "Unable to complete registration process",
  priority: "high",
  status: "in-review",
  submittedBy: {
    name: "John Doe",
    email: "john.doe@example.com",
    role: "retailer"
  },
  assignedTo: "cro1@anwar.com",
  submittedAt: "2024-01-15T09:00:00.000Z",
  assignedAt: "2024-01-15T09:15:00.000Z",
  lastUpdated: "2024-01-15T10:00:00.000Z",
  history: [
    {
      status: "submitted",
      timestamp: "2024-01-15T09:00:00.000Z",
      actor: "john.doe@example.com",
      notes: "Dispute submitted"
    },
    {
      status: "assigned",
      timestamp: "2024-01-15T09:15:00.000Z",
      actor: "admin@anwar.com",
      notes: "Assigned to cro1@anwar.com"
    }
  ]
}
```

#### `getDisputesByStatus(status, options)`

Retrieves disputes filtered by status.

**Parameters:**
- `status` (string): Dispute status to filter by
- `options` (Object, optional): Additional filtering options

**Returns:** Array of dispute objects

#### `getAssignedDisputes(stakeholderEmail, options)`

Retrieves disputes assigned to a specific stakeholder.

**Parameters:**
- `stakeholderEmail` (string): Stakeholder's email address
- `options` (Object, optional): Additional filtering options

**Returns:** Array of assigned dispute objects

## Access Control

### Role-Based Permissions

| Operation | Admin | CRO | BDO | Engineer | Retailer | Assigned Stakeholder |
|-----------|-------|-----|-----|----------|----------|-----------------------|
| Submit | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Assign | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update Status | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Resolve | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| View All | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Assigned | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### Access Validation

The system automatically validates user permissions for each operation:

```javascript
// Example: Only admins, CROs, and BDOs can assign disputes
if (!DisputeAccessControl.validateAccess(userContext, 'assign')) {
  throw new AppScriptError('ACCESS_DENIED', 'Insufficient permissions');
}
```

## State Machine

### Valid State Transitions

```javascript
const STATE_TRANSITIONS = {
  'submitted': ['assigned'],
  'assigned': ['in-review', 'submitted'],
  'in-review': ['resolved', 'assigned'],
  'resolved': ['closed', 'in-review'],
  'closed': [] // Terminal state
};
```

### State Validation

All status updates are validated against the state machine:

```javascript
// This will throw an error
try {
  await DisputeHandler.updateDisputeStatus('DSP-000001', 'closed'); // From 'submitted'
} catch (error) {
  console.log(error.code); // 'INVALID_STATE_TRANSITION'
}
```

## Notifications

### Notification Events

1. **Dispute Submitted**: Notifies administrators
2. **Dispute Assigned**: Notifies assigned stakeholder
3. **Status Updated**: Notifies submitter and assigned stakeholder
4. **Dispute Resolved**: Notifies all relevant parties

### Notification Format

```
🚨 New Dispute Submitted

ID: DSP-000001
Type: REGISTRATION
Priority: HIGH
Title: Registration Issue
Submitted by: John Doe
Time: 1/15/2024, 9:00:00 AM
```

### Configuration

Notifications require phone number configuration in PropertiesService:

```javascript
// Admin notification
PropertiesService.getScriptProperties().setProperty('ADMIN_PHONE', '+1234567890');

// Stakeholder notifications (email-based keys)
PropertiesService.getScriptProperties().setProperty(
  'PHONE_cro1_anwar_com', 
  '+1234567891'
);
```

## Database Schema

### Disputes Sheet Columns

| Column | Type | Description |
|--------|------|-------------|
| Timestamp | DateTime | Submission timestamp |
| Dispute ID | String | Unique identifier (DSP-XXXXXX) |
| Type | String | Dispute type |
| Title | String | Dispute title |
| Description | Text | Detailed description |
| Priority | String | Priority level |
| Status | String | Current status |
| Submitted By Name | String | Submitter's name |
| Submitted By Email | String | Submitter's email |
| Submitted By Role | String | Submitter's role |
| Assigned To | String | Assigned stakeholder email |
| Assigned At | DateTime | Assignment timestamp |
| Resolution Summary | Text | Resolution summary |
| Resolution Actions | Text | Actions taken (semicolon-separated) |
| Resolved By | String | Resolver's email |
| Resolved At | DateTime | Resolution timestamp |
| Created At | DateTime | Record creation timestamp |
| Last Updated | DateTime | Last modification timestamp |
| History | JSON | Complete audit trail |

## Error Handling

### Error Types

- `VALIDATION_MISSING_FIELD`: Required field is missing
- `VALIDATION_INVALID_TYPE`: Invalid dispute type
- `VALIDATION_INVALID_PRIORITY`: Invalid priority level
- `VALIDATION_TITLE_TOO_LONG`: Title exceeds character limit
- `VALIDATION_DESCRIPTION_TOO_LONG`: Description exceeds character limit
- `INVALID_DISPUTE_STATE`: Invalid current state
- `INVALID_STATE_TRANSITION`: Invalid state transition
- `ACCESS_DENIED`: Insufficient permissions
- `DISPUTE_NOT_FOUND`: Dispute does not exist
- `DATABASE_INSERT_FAILED`: Database insertion failed
- `DATABASE_UPDATE_FAILED`: Database update failed
- `DATABASE_QUERY_FAILED`: Database query failed

### Error Response Format

```javascript
{
  code: "VALIDATION_MISSING_FIELD",
  message: "Required field 'title' is missing or empty",
  context: {
    field: "title",
    disputeData: { /* original data */ }
  }
}
```

## Performance Optimization

### Caching

- **Cache Size**: Maximum 100 disputes
- **Cache Timeout**: 5 minutes
- **Cache Strategy**: LRU (Least Recently Used)

### Rate Limiting

- **Minimum Interval**: 1 second between operations
- **Purpose**: Prevent system overload

## Configuration

### Required Configuration

Add to `Config.js`:

```javascript
SHEETS: {
  DISPUTES: 'Disputes'
},

FORMS: {
  DISPUTES: 'your-dispute-form-id'
},

COLUMN_HEADERS: {
  DISPUTES: [
    'Timestamp', 'Dispute ID', 'Type', 'Title', 'Description',
    'Priority', 'Status', 'Submitted By Name', 'Submitted By Email',
    'Submitted By Role', 'Assigned To', 'Assigned At',
    'Resolution Summary', 'Resolution Actions', 'Resolved By',
    'Resolved At', 'Created At', 'Last Updated', 'History'
  ]
}
```

## Usage Examples

### Complete Dispute Workflow

```javascript
// 1. Submit a dispute
const disputeData = {
  type: 'technical',
  title: 'System Login Issues',
  description: 'Unable to login to the system after password reset',
  priority: 'urgent'
};

const userContext = {
  name: 'Jane Smith',
  email: 'jane.smith@retailer.com',
  role: 'retailer'
};

const submitResult = await DisputeHandler.submitDispute(disputeData, userContext);
console.log('Dispute submitted:', submitResult.disputeId);

// 2. Assign to stakeholder
const adminContext = {
  name: 'Admin User',
  email: 'admin@anwar.com',
  role: 'admin'
};

const assignResult = await DisputeHandler.assignDispute(
  submitResult.disputeId,
  'tech1@anwar.com',
  adminContext
);

// 3. Update status to in-review
const reviewResult = await DisputeHandler.updateDisputeStatus(
  submitResult.disputeId,
  'in-review',
  {
    actor: 'tech1@anwar.com',
    notes: 'Started investigating the login issue'
  }
);

// 4. Resolve the dispute
const techContext = {
  name: 'Tech Support',
  email: 'tech1@anwar.com',
  role: 'engineer'
};

const resolutionData = {
  summary: 'Password reset issue resolved by clearing browser cache',
  actions: [
    'Identified browser cache issue',
    'Provided cache clearing instructions',
    'Verified successful login'
  ]
};

const resolveResult = await DisputeHandler.resolveDispute(
  submitResult.disputeId,
  resolutionData,
  techContext
);

// 5. Close the dispute
const closeResult = await DisputeHandler.updateDisputeStatus(
  submitResult.disputeId,
  'closed',
  {
    actor: 'admin@anwar.com',
    notes: 'Dispute resolved and closed'
  }
);
```

### Querying Disputes

```javascript
// Get all pending disputes
const pendingDisputes = await DisputeHandler.getDisputesByStatus('submitted');

// Get disputes assigned to a specific stakeholder
const assignedDisputes = await DisputeHandler.getAssignedDisputes('cro1@anwar.com');

// Get specific dispute details
const dispute = await DisputeHandler.getDisputeById('DSP-000001');
console.log('Dispute history:', dispute.history);
```

## Testing

Comprehensive test suite available at `tests/handlers/DisputeHandler.test.js`:

```bash
# Run tests
npm test -- --grep "DisputeHandler"
```

### Test Coverage

- ✅ Dispute submission validation
- ✅ State machine transitions
- ✅ Access control enforcement
- ✅ Notification delivery
- ✅ Database operations
- ✅ Caching functionality
- ✅ Error handling
- ✅ Complete workflow integration

## Monitoring and Health

### Health Check

```javascript
const health = DisputeHandler.getHealthStatus();
console.log('Service health:', health);
```

### Health Response

```javascript
{
  serviceName: "DisputeHandler",
  status: "HEALTHY",
  version: "1.0.0",
  cacheSize: 15,
  dependencies: {
    config: true,
    database: true,
    validator: true,
    whatsAppService: true,
    idService: true
  },
  lastHealthCheck: "2024-01-15T10:30:00.000Z"
}
```

## Troubleshooting

### Common Issues

1. **Dispute Not Found**
   - Verify dispute ID format (DSP-XXXXXX)
   - Check database connectivity
   - Ensure dispute exists in the system

2. **Access Denied**
   - Verify user role and permissions
   - Check if user is assigned stakeholder for the dispute
   - Ensure proper user context is provided

3. **Invalid State Transition**
   - Review current dispute status
   - Check allowed transitions in state machine
   - Ensure proper workflow sequence

4. **Notification Failures**
   - Verify WhatsApp service configuration
   - Check phone number format in PropertiesService
   - Ensure API keys are properly configured

### Logging

All operations are logged with appropriate levels:

- `INFO`: Successful operations and state changes
- `WARN`: Non-critical issues (e.g., missing phone numbers)
- `ERROR`: Critical failures requiring attention
- `DEBUG`: Detailed operation information

## Security Considerations

1. **Input Validation**: All inputs are validated against defined schemas
2. **Access Control**: Role-based permissions enforced at every operation
3. **Audit Trail**: Complete history of all dispute activities
4. **Error Handling**: Sensitive information not exposed in error messages
5. **Rate Limiting**: Protection against system abuse

## Future Enhancements

1. **Advanced Assignment Logic**: Workload balancing and expertise matching
2. **SLA Tracking**: Automatic escalation based on time limits
3. **Integration APIs**: REST endpoints for external system integration
4. **Advanced Analytics**: Dispute trends and performance metrics
5. **Mobile Notifications**: Push notifications for mobile apps
6. **Document Attachments**: File upload support for dispute evidence

## Support

For technical support or questions about the DisputeHandler:

1. Check the test suite for usage examples
2. Review error logs for specific issues
3. Consult the health status endpoint for system status
4. Contact the development team for advanced troubleshooting

---

**Version**: 1.0.0  
**Last Updated**: January 2024  
**Maintainer**: Senior Development Agent