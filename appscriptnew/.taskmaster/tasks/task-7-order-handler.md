# Task 7: Implement OrderHandler.js - User Order Processing System

## Overview
Develop a complete user order processing system that handles order submissions, validation, approval workflows, and status tracking. This addresses a critical gap where user order journeys are documented but no corresponding handler exists.

## Priority: High
**Assigned to:** Senior Developer

## Implementation Requirements

### Architecture Guidelines
- Must integrate with existing form processing and CRM systems
- Implement proper order validation and business rule enforcement
- Follow existing service architecture patterns and error handling
- Include comprehensive audit logging for order lifecycle
- Support multiple order types and approval workflows

### Core Functionality

#### 1. Order Data Model and Validation
**Order Types:**
- Product orders (equipment, materials)
- Service requests (installation, maintenance)
- Bulk orders (wholesale, enterprise)
- Custom orders (special requirements)

**Validation Rules:**
- Required field validation (including all user order fields)
- Business rule enforcement
- Inventory availability checks
- Credit limit verification
- Geographic service area validation

**User Order Field Validation:**
- **projectId**: String (required)
  - Format: Potential Site ID (generated through potential site process)
  - Validation: Must be a valid potential site ID from the system
  - Purpose: Links order to specific project/potential site
  - Source: Must be selected from existing potential sites
- Total Sales Volume: Must be positive number, validate against inventory
- UOM (Unit of Measure): Required, must be either "Bags" (ACL business unit) or "MT" (AIL business unit)
- Delivery Note Slip: Optional but must be valid format if provided
- Detailed Project Address: Required, must include complete address details
- Dealer Memo: Required, minimum 10 characters for meaningful content
- Site Visit Image: Required, validate file format (JPG, PNG) and size limits
- Email Address: Required, must be valid email format
- Engineer Eligible: Required boolean, determines approval routing

#### 2. Order Submission and Processing
- Accept orders from multiple channels (forms, API, mobile)
- Generate unique order IDs using IdService
- Initial order validation and sanitization
- Automatic order categorization
- Duplicate order detection

#### 3. Approval Workflow Routing
**Routing Logic:**
- ACL SR (Sales Representative) - Orders with UOM "Bags" from ACL business unit
- AIL SR (Sales Representative) - Orders with UOM "MT" from AIL business unit
- CRO (Customer Relations Officer) - Service requests and complaints
- BDO (Business Development Officer) - Bulk and enterprise orders
- Auto-approval for pre-qualified orders
- Territory assignment derived from business unit (UOM) and submitter email in CRM workflow

**Approval Criteria:**
- Order value thresholds
- Customer credit status
- Product availability
- Geographic constraints
- Special terms and conditions

#### 4. Order Status Tracking
**Status Flow:**
- `submitted` - Initial order received
- `validated` - Passed validation checks
- `pending-approval` - Awaiting stakeholder approval
- `approved` - Approved for processing
- `in-fulfillment` - Being processed/shipped
- `completed` - Order fulfilled
- `cancelled` - Order cancelled
- `on-hold` - Temporarily suspended

#### 5. Inventory and Pricing Integration
- Real-time inventory checks
- Dynamic pricing calculations
- Discount and promotion application
- Tax calculations
- Shipping cost estimation

#### 6. Order Fulfillment and Completion
- Fulfillment tracking
- Delivery scheduling
- Completion confirmation
- Customer satisfaction feedback
- Post-order follow-up

## Technical Specifications

### File Location
`src/handlers/OrderHandler.js`

### Dependencies
- BaseService (extends)
- CRMHandler (customer integration)
- FormService (order submission)
- ValidationService (data validation)
- DatabaseService (data persistence)
- LoggerService (audit logging)
- WhatsAppService (notifications)

### Key Methods
```javascript
// Order lifecycle management
submitOrder(orderData)
validateOrder(orderId)
validateUserOrderFields(orderData) // Validate specific user order fields
approveOrder(orderId, approverId, notes)
rejectOrder(orderId, reason)
processOrder(orderId)
completeOrder(orderId, completionData)
cancelOrder(orderId, reason)

// Order queries and reporting
getOrderById(orderId)
getOrdersByCustomer(customerId)
getOrdersByStatus(status)
getOrdersByDateRange(startDate, endDate)
generateOrderReport(filters)

// Inventory and pricing
checkInventoryAvailability(items)
calculateOrderTotal(orderData)
applyDiscounts(orderId, discountCodes)
getShippingOptions(orderData)

// Workflow management
routeForApproval(orderId)
escalateOrder(orderId, reason)
getOrderHistory(orderId)
updateOrderStatus(orderId, newStatus, notes)
```

### Data Model
```javascript
{
  id: "string", // Unique order ID
  orderNumber: "string", // Human-readable order number
  customerId: "string", // Customer identifier
  customerInfo: "object", // Customer details
  orderType: "string", // product, service, bulk, custom
  
  // Required User Order Fields
  projectId: "string", // Project ID
  totalSalesVolume: "number", // Total Sales Volume
  uom: "string", // Unit of Measure (Bags for ACL, MT for AIL)
  deliveryNoteSlip: "string", // Delivery Note (DN) Slip (If Available)
  detailedProjectAddress: "string", // Detailed Project Address
  dealerMemo: "string", // Dealer Memo
  siteVisitImage: "string", // Site Visit Image (file path/URL)
  emailAddress: "string", // Email Address
  engineerEligible: "boolean", // Engineer is eligible
  
  items: "array", // Order line items
  quantities: "object", // Item quantities
  pricing: "object", // Pricing breakdown
  totalAmount: "number", // Total order value
  currency: "string", // Currency code
  status: "string", // Current order status
  submittedAt: "datetime",
  submittedBy: "string", // User who submitted
  assignedTo: "string", // Assigned stakeholder
  approvedBy: "string", // Approver ID
  approvedAt: "datetime",
  fulfillmentInfo: "object", // Shipping/delivery details
  completedAt: "datetime",
  history: "array", // Status change history
  notes: "array", // Order notes and comments
  attachments: "array", // Supporting documents
  notifications: "array" // Notification log
}
```

### Integration Points

#### Form Integration
- Order submission forms
- Customer information capture
- Product selection interfaces
- File upload handling

#### CRM Integration
- Customer lookup and validation
- Order history tracking
- Customer communication logs
- Relationship management

#### Inventory System
- Stock level checks
- Product availability
- Reservation management
- Backorder handling

#### Notification System
- Order confirmation messages
- Status update notifications
- Approval request alerts
- Completion notifications

## Testing Requirements

### Unit Tests
- Order validation logic
- Pricing calculations
- Status transition rules
- Approval routing logic
- Inventory integration

### Integration Tests
- End-to-end order processing
- Form submission handling
- CRM system integration
- Notification delivery
- Database persistence

### Performance Tests
- High-volume order processing
- Concurrent order submissions
- Large order handling
- Query performance optimization

### Business Logic Tests
- Approval workflow scenarios
- Discount and pricing rules
- Inventory constraint handling
- Geographic service validation

## Validation Criteria

**EM Review Points:**
1. Order processing matches documented user journey flows
2. All order types are properly supported
3. Approval workflows function correctly
4. Inventory integration works seamlessly
5. Pricing calculations are accurate
6. Status tracking is comprehensive
7. Error handling covers all scenarios
8. Performance meets business requirements

## Success Metrics
- 100% of order journey flows implemented
- < 3 second response time for order submissions
- 99.9% order processing accuracy
- Zero order data loss
- 95% customer satisfaction with order process
- Complete audit trail for all orders

## Business Rules

### Approval Thresholds
- Orders < $1,000: Auto-approval (if customer qualified)
- Orders $1,000-$10,000: SR approval required
- Orders $10,000-$50,000: CRO approval required
- Orders > $50,000: BDO approval required

### Inventory Rules
- Reserve inventory upon order approval
- Release reservations after 48 hours if not processed
- Handle backorders with customer notification
- Priority allocation for enterprise customers

### Geographic Rules
- Validate service area coverage
- Calculate shipping costs by zone
- Apply regional pricing variations
- Handle international orders separately

## Dependencies
- Task 1-5 must be completed (foundation services)
- CRMHandler.js must be available
- FormService must be functional
- DatabaseService must be operational
- Inventory system integration required

## Estimated Effort
**Development:** 4-5 weeks
**Testing:** 2-3 weeks
**Integration:** 1-2 weeks

## Notes
- This task addresses a critical gap identified in the journey analysis audit
- Implementation should prioritize order accuracy and customer experience
- Consider future integration with WorkflowEngine (Task 8)
- Ensure compliance with business rules and regulations
- Plan for scalability to handle growth in order volume