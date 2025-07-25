# Google Sheets Schema Design for Anwar Sales Management System MVP

## Overview

This document outlines the Google Sheets schema design for the Anwar Sales Management System MVP. The design leverages Google Sheets as the primary database, providing a cost-effective and accessible solution for the initial deployment while maintaining data integrity and supporting all six registration systems.

## Design Principles

1. **Simplicity**: Easy to understand and maintain by business users
2. **Scalability**: Designed to handle growth in data volume and complexity
3. **Data Integrity**: Proper validation and referential integrity through formulas
4. **Performance**: Optimized for Google Sheets limitations and capabilities
5. **Security**: Role-based access control using Google Workspace features
6. **Auditability**: Complete audit trail for all changes

## Google Sheets Structure

### Master Workbook: "Anwar_Sales_Management_System"

#### Sheet 1: Registrations (Main)
| Column | Field Name | Data Type | Description | Validation |
|--------|------------|-----------|-------------|------------|
| A | registration_id | Text | Unique identifier (AUTO-GENERATED) | UNIQUE |
| B | registration_type | Dropdown | Type of registration | LIST: Contractor, Engineer, Retailer, Potential Site, User Order, Visit |
| C | status | Dropdown | Current status | LIST: Pending, Approved, Rejected, In Review, Completed |
| D | priority | Dropdown | Priority level | LIST: High, Medium, Low |
| E | created_date | Date | Registration creation date | DATE |
| F | created_by | Text | User who created the registration | REQUIRED |
| G | updated_date | Date | Last update date | DATE |
| H | updated_by | Text | User who last updated | REQUIRED |
| I | assigned_to | Dropdown | Assigned approver | LIST from Users sheet |
| J | approval_date | Date | Date of approval/rejection | DATE |
| K | approved_by | Text | User who approved/rejected | TEXT |
| L | notes | Text | General notes | TEXT |
| M | reference_id | Text | Reference to specific registration sheet | REQUIRED |

#### Sheet 2: Contractors
| Column | Field Name | Data Type | Description | Validation |
|--------|------------|-----------|-------------|------------|
| A | contractor_id | Text | Unique identifier | UNIQUE |
| B | registration_id | Text | Link to main registration | VLOOKUP |
| C | company_name | Text | Company name | REQUIRED |
| D | contact_person | Text | Primary contact | REQUIRED |
| E | phone_number | Text | Contact phone | PHONE FORMAT |
| F | email | Email | Contact email | EMAIL FORMAT |
| G | address | Text | Company address | REQUIRED |
| H | city | Text | City | REQUIRED |
| I | state | Text | State/Province | REQUIRED |
| J | postal_code | Text | Postal code | REQUIRED |
| K | business_license | Text | License number | REQUIRED |
| L | tax_id | Text | Tax identification | REQUIRED |
| M | specialization | Dropdown | Area of specialization | LIST |
| N | experience_years | Number | Years of experience | NUMBER |
| O | certification_status | Dropdown | Certification status | LIST |
| P | documents_uploaded | Text | List of uploaded documents | TEXT |
| Q | verification_status | Dropdown | Verification status | LIST |

#### Sheet 3: Engineers
| Column | Field Name | Data Type | Description | Validation |
|--------|------------|-----------|-------------|------------|
| A | engineer_id | Text | Unique identifier | UNIQUE |
| B | registration_id | Text | Link to main registration | VLOOKUP |
| C | full_name | Text | Engineer's full name | REQUIRED |
| D | phone_number | Text | Contact phone | PHONE FORMAT |
| E | email | Email | Contact email | EMAIL FORMAT |
| F | address | Text | Residential address | REQUIRED |
| G | city | Text | City | REQUIRED |
| H | state | Text | State/Province | REQUIRED |
| I | postal_code | Text | Postal code | REQUIRED |
| J | license_number | Text | Professional license | REQUIRED |
| K | specialization | Dropdown | Engineering specialization | LIST |
| L | experience_years | Number | Years of experience | NUMBER |
| M | education_level | Dropdown | Highest education | LIST |
| N | certifications | Text | Professional certifications | TEXT |
| O | availability_status | Dropdown | Current availability | LIST |
| P | hourly_rate | Number | Hourly rate | CURRENCY |
| Q | documents_uploaded | Text | List of uploaded documents | TEXT |

#### Sheet 4: Retailers
| Column | Field Name | Data Type | Description | Validation |
|--------|------------|-----------|-------------|------------|
| A | retailer_id | Text | Unique identifier | UNIQUE |
| B | registration_id | Text | Link to main registration | VLOOKUP |
| C | business_name | Text | Retail business name | REQUIRED |
| D | owner_name | Text | Business owner name | REQUIRED |
| E | phone_number | Text | Contact phone | PHONE FORMAT |
| F | email | Email | Contact email | EMAIL FORMAT |
| G | business_address | Text | Business address | REQUIRED |
| H | city | Text | City | REQUIRED |
| I | state | Text | State/Province | REQUIRED |
| J | postal_code | Text | Postal code | REQUIRED |
| K | business_type | Dropdown | Type of retail business | LIST |
| L | business_license | Text | Business license number | REQUIRED |
| M | tax_id | Text | Tax identification | REQUIRED |
| N | years_in_business | Number | Years in operation | NUMBER |
| O | monthly_volume | Number | Expected monthly volume | NUMBER |
| P | payment_terms | Dropdown | Preferred payment terms | LIST |
| Q | documents_uploaded | Text | List of uploaded documents | TEXT |

#### Sheet 5: Potential_Sites
| Column | Field Name | Data Type | Description | Validation |
|--------|------------|-----------|-------------|------------|
| A | site_id | Text | Unique identifier | UNIQUE |
| B | registration_id | Text | Link to main registration | VLOOKUP |
| C | site_name | Text | Site name/identifier | REQUIRED |
| D | address | Text | Site address | REQUIRED |
| E | city | Text | City | REQUIRED |
| F | state | Text | State/Province | REQUIRED |
| G | postal_code | Text | Postal code | REQUIRED |
| H | coordinates | Text | GPS coordinates | COORDINATES |
| I | site_type | Dropdown | Type of site | LIST |
| J | size_sqft | Number | Site size in square feet | NUMBER |
| K | zoning | Text | Zoning classification | TEXT |
| L | utilities_available | Text | Available utilities | TEXT |
| M | access_road | Dropdown | Road access quality | LIST |
| N | ownership_status | Dropdown | Ownership status | LIST |
| O | estimated_value | Number | Estimated site value | CURRENCY |
| P | development_potential | Dropdown | Development potential | LIST |
| Q | environmental_concerns | Text | Environmental issues | TEXT |
| R | documents_uploaded | Text | List of uploaded documents | TEXT |

#### Sheet 6: User_Orders
| Column | Field Name | Data Type | Description | Validation |
|--------|------------|-----------|-------------|------------|
| A | order_id | Text | Unique identifier | UNIQUE |
| B | registration_id | Text | Link to main registration | VLOOKUP |
| C | customer_name | Text | Customer name | REQUIRED |
| D | customer_phone | Text | Customer phone | PHONE FORMAT |
| E | customer_email | Email | Customer email | EMAIL FORMAT |
| F | delivery_address | Text | Delivery address | REQUIRED |
| G | city | Text | City | REQUIRED |
| H | state | Text | State/Province | REQUIRED |
| I | postal_code | Text | Postal code | REQUIRED |
| J | order_type | Dropdown | Type of order | LIST |
| K | product_category | Dropdown | Product category | LIST |
| L | quantity | Number | Order quantity | NUMBER |
| M | unit_price | Number | Price per unit | CURRENCY |
| N | total_amount | Number | Total order amount | FORMULA |
| O | payment_method | Dropdown | Payment method | LIST |
| P | delivery_date | Date | Requested delivery date | DATE |
| Q | special_instructions | Text | Special delivery instructions | TEXT |
| R | order_source | Dropdown | Source of order | LIST |

#### Sheet 7: Visits
| Column | Field Name | Data Type | Description | Validation |
|--------|------------|-----------|-------------|------------|
| A | visit_id | Text | Unique identifier | UNIQUE |
| B | registration_id | Text | Link to main registration | VLOOKUP |
| C | visitor_name | Text | Visitor's name | REQUIRED |
| D | visitor_phone | Text | Visitor's phone | PHONE FORMAT |
| E | visitor_email | Email | Visitor's email | EMAIL FORMAT |
| F | company_organization | Text | Visitor's company | TEXT |
| G | visit_purpose | Dropdown | Purpose of visit | LIST |
| H | visit_date | Date | Scheduled visit date | DATE |
| I | visit_time | Time | Scheduled visit time | TIME |
| J | duration_hours | Number | Expected duration | NUMBER |
| K | location | Text | Visit location | REQUIRED |
| L | host_contact | Text | Internal host contact | REQUIRED |
| M | security_clearance | Dropdown | Security clearance level | LIST |
| N | equipment_needed | Text | Required equipment | TEXT |
| O | parking_required | Dropdown | Parking requirement | LIST |
| P | visit_status | Dropdown | Visit status | LIST |
| Q | actual_arrival | DateTime | Actual arrival time | DATETIME |
| R | actual_departure | DateTime | Actual departure time | DATETIME |
| S | visit_notes | Text | Visit summary notes | TEXT |

#### Sheet 8: Users
| Column | Field Name | Data Type | Description | Validation |
|--------|------------|-----------|-------------|------------|
| A | user_id | Text | Unique identifier | UNIQUE |
| B | username | Text | System username | REQUIRED |
| C | full_name | Text | User's full name | REQUIRED |
| D | email | Email | User's email | EMAIL FORMAT |
| E | phone_number | Text | Contact phone | PHONE FORMAT |
| F | role | Dropdown | User role | LIST |
| G | department | Dropdown | Department | LIST |
| H | manager | Text | Reporting manager | TEXT |
| I | hire_date | Date | Date of hire | DATE |
| J | status | Dropdown | User status | LIST |
| K | last_login | DateTime | Last login timestamp | DATETIME |
| L | permissions | Text | Specific permissions | TEXT |
| M | created_date | Date | Account creation date | DATE |
| N | created_by | Text | Account creator | TEXT |

#### Sheet 9: Workflows
| Column | Field Name | Data Type | Description | Validation |
|--------|------------|-----------|-------------|------------|
| A | workflow_id | Text | Unique identifier | UNIQUE |
| B | registration_id | Text | Link to main registration | VLOOKUP |
| C | workflow_type | Dropdown | Type of workflow | LIST |
| D | current_step | Number | Current step number | NUMBER |
| E | total_steps | Number | Total steps in workflow | NUMBER |
| F | step_name | Text | Current step name | TEXT |
| G | assigned_to | Text | Currently assigned user | TEXT |
| H | step_start_date | DateTime | Step start timestamp | DATETIME |
| I | step_due_date | DateTime | Step due timestamp | DATETIME |
| J | step_status | Dropdown | Step status | LIST |
| K | step_notes | Text | Step-specific notes | TEXT |
| L | escalation_level | Number | Escalation level | NUMBER |
| M | sla_breach | Dropdown | SLA breach status | LIST |
| N | workflow_data | Text | Workflow-specific data | JSON |

#### Sheet 10: Audit_Trail
| Column | Field Name | Data Type | Description | Validation |
|--------|------------|-----------|-------------|------------|
| A | audit_id | Text | Unique identifier | UNIQUE |
| B | timestamp | DateTime | Action timestamp | DATETIME |
| C | user_id | Text | User who performed action | REQUIRED |
| D | action_type | Dropdown | Type of action | LIST |
| E | table_name | Text | Affected table/sheet | TEXT |
| F | record_id | Text | Affected record ID | TEXT |
| G | field_name | Text | Changed field | TEXT |
| H | old_value | Text | Previous value | TEXT |
| I | new_value | Text | New value | TEXT |
| J | ip_address | Text | User's IP address | IP FORMAT |
| K | user_agent | Text | Browser/client info | TEXT |
| L | session_id | Text | Session identifier | TEXT |
| M | change_reason | Text | Reason for change | TEXT |

#### Sheet 11: Notifications
| Column | Field Name | Data Type | Description | Validation |
|--------|------------|-----------|-------------|------------|
| A | notification_id | Text | Unique identifier | UNIQUE |
| B | recipient_user_id | Text | Recipient user | REQUIRED |
| C | sender_user_id | Text | Sender user | TEXT |
| D | notification_type | Dropdown | Type of notification | LIST |
| E | title | Text | Notification title | REQUIRED |
| F | message | Text | Notification message | REQUIRED |
| G | priority | Dropdown | Priority level | LIST |
| H | created_date | DateTime | Creation timestamp | DATETIME |
| I | read_date | DateTime | Read timestamp | DATETIME |
| J | status | Dropdown | Notification status | LIST |
| K | related_record_id | Text | Related record reference | TEXT |
| L | action_required | Dropdown | Action required | LIST |
| M | expiry_date | DateTime | Notification expiry | DATETIME |

#### Sheet 12: Configuration
| Column | Field Name | Data Type | Description | Validation |
|--------|------------|-----------|-------------|------------|
| A | config_key | Text | Configuration key | UNIQUE |
| B | config_value | Text | Configuration value | REQUIRED |
| C | config_type | Dropdown | Value type | LIST |
| D | description | Text | Configuration description | TEXT |
| E | category | Dropdown | Configuration category | LIST |
| F | is_system | Dropdown | System configuration | LIST |
| G | created_date | Date | Creation date | DATE |
| H | updated_date | Date | Last update date | DATE |
| I | updated_by | Text | Last updated by | TEXT |

## Data Validation Rules

### Dropdown Lists (Data Validation)

#### Registration Types
- Contractor
- Engineer
- Retailer
- Potential Site
- User Order
- Visit

#### Status Values
- Pending
- Approved
- Rejected
- In Review
- Completed
- Cancelled
- On Hold

#### Priority Levels
- High
- Medium
- Low
- Critical

#### User Roles
- Admin
- Manager
- Supervisor
- Operator
- Viewer
- Guest

### Formula-Based Validations

#### Unique ID Generation
```
=CONCATENATE(TEXT(TODAY(),"YYYYMMDD"),"-",TEXT(ROW(),"0000"))
```

#### Auto-Update Timestamp
```
=IF(INDIRECT("RC[-1]",FALSE)<>"",NOW(),"")
```

#### Total Amount Calculation
```
=IF(AND(K2<>"",L2<>""),K2*L2,"")
```

#### Status Color Coding
```
=IF(C2="Approved","✅",IF(C2="Rejected","❌",IF(C2="Pending","⏳","📋")))
```

## Google Apps Script Integration

### Automated Functions

#### 1. Auto-ID Generation
```javascript
function generateRegistrationId() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const date = new Date();
  const dateStr = Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyyMMdd');
  const rowNum = sheet.getLastRow() + 1;
  return `REG-${dateStr}-${rowNum.toString().padStart(4, '0')}`;
}
```

#### 2. Audit Trail Logger
```javascript
function logAuditTrail(action, tableName, recordId, fieldName, oldValue, newValue) {
  const auditSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Audit_Trail');
  const user = Session.getActiveUser().getEmail();
  const timestamp = new Date();
  
  auditSheet.appendRow([
    generateAuditId(),
    timestamp,
    user,
    action,
    tableName,
    recordId,
    fieldName,
    oldValue,
    newValue,
    '', // IP address (not available in Apps Script)
    '', // User agent (not available in Apps Script)
    Session.getTemporaryActiveUserKey(),
    ''
  ]);
}
```

#### 3. Notification System
```javascript
function sendNotification(recipientEmail, title, message, priority = 'Medium') {
  const notificationSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Notifications');
  const notificationId = generateNotificationId();
  
  // Log notification
  notificationSheet.appendRow([
    notificationId,
    recipientEmail,
    Session.getActiveUser().getEmail(),
    'System',
    title,
    message,
    priority,
    new Date(),
    '',
    'Unread',
    '',
    'None',
    ''
  ]);
  
  // Send email
  GmailApp.sendEmail(recipientEmail, title, message);
}
```

#### 4. Workflow Automation
```javascript
function processWorkflow(registrationId, workflowType) {
  const workflowSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Workflows');
  const workflows = {
    'contractor_approval': [
      'Document Review',
      'Background Check',
      'Manager Approval',
      'Final Approval'
    ],
    'engineer_certification': [
      'License Verification',
      'Experience Review',
      'Technical Assessment',
      'Certification'
    ]
  };
  
  const steps = workflows[workflowType] || [];
  
  steps.forEach((step, index) => {
    workflowSheet.appendRow([
      generateWorkflowId(),
      registrationId,
      workflowType,
      index + 1,
      steps.length,
      step,
      '', // assigned_to
      new Date(),
      '', // due_date
      'Pending',
      '',
      0,
      'No',
      '{}'
    ]);
  });
}
```

## Data Relationships

### Primary Relationships
1. **Registrations** → All specific registration sheets (1:1)
2. **Users** → Registrations (1:Many) - created_by, updated_by
3. **Workflows** → Registrations (1:Many)
4. **Audit_Trail** → All sheets (Many:1)
5. **Notifications** → Users (Many:1)

### Lookup Formulas

#### Registration Status Lookup
```
=VLOOKUP(B2,Registrations!A:C,3,FALSE)
```

#### User Name Lookup
```
=VLOOKUP(F2,Users!A:C,3,FALSE)
```

#### Workflow Progress
```
=COUNTIFS(Workflows!B:B,A2,Workflows!J:J,"Completed")/COUNTIF(Workflows!B:B,A2)
```

## Security and Access Control

### Sheet-Level Permissions
1. **Admin**: Full access to all sheets
2. **Manager**: Read/Write access to operational sheets, Read-only to audit
3. **Supervisor**: Read/Write access to assigned registration types
4. **Operator**: Read/Write access to specific records
5. **Viewer**: Read-only access to summary data

### Protected Ranges
- Audit Trail: Protected from editing
- System Configuration: Admin-only access
- User Management: Manager+ access
- ID Columns: Auto-generated, protected

### Data Validation Security
```javascript
function protectSystemColumns() {
  const sheets = ['Registrations', 'Contractors', 'Engineers', 'Retailers', 'Potential_Sites', 'User_Orders', 'Visits'];
  
  sheets.forEach(sheetName => {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    const protection = sheet.getRange('A:A').protect(); // Protect ID column
    protection.setDescription('System-generated IDs');
    protection.setWarningOnly(true);
  });
}
```

## Performance Optimization

### Indexing Strategy
1. **Primary Keys**: Column A in all sheets
2. **Foreign Keys**: Registration_ID columns
3. **Search Fields**: Name, Email, Phone columns
4. **Date Fields**: Created_date, Updated_date

### Query Optimization
```javascript
// Efficient data retrieval
function getRegistrationData(registrationId) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Registrations');
  const data = sheet.getDataRange().getValues();
  
  return data.find(row => row[0] === registrationId);
}
```

### Batch Operations
```javascript
function batchUpdateStatus(registrationIds, newStatus) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Registrations');
  const data = sheet.getDataRange().getValues();
  
  const updates = [];
  data.forEach((row, index) => {
    if (registrationIds.includes(row[0])) {
      updates.push([index + 1, 3, newStatus]); // Row, Column, Value
    }
  });
  
  updates.forEach(update => {
    sheet.getRange(update[0], update[1]).setValue(update[2]);
  });
}
```

## Backup and Recovery

### Automated Backup
```javascript
function createDailyBackup() {
  const sourceSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const backupName = `Backup_${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd_HH-mm')}`;
  
  const backup = sourceSpreadsheet.copy(backupName);
  
  // Move to backup folder
  const backupFolder = DriveApp.getFoldersByName('System_Backups').next();
  DriveApp.getFileById(backup.getId()).moveTo(backupFolder);
  
  return backup.getId();
}
```

### Data Export
```javascript
function exportToCSV(sheetName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  
  const csv = data.map(row => row.join(',')).join('\n');
  
  const blob = Utilities.newBlob(csv, 'text/csv', `${sheetName}_export.csv`);
  DriveApp.createFile(blob);
}
```

## Monitoring and Analytics

### Dashboard Formulas

#### Registration Summary
```
=QUERY(Registrations!A:M,"SELECT B, COUNT(A) GROUP BY B LABEL COUNT(A) 'Count'")
```

#### Status Distribution
```
=QUERY(Registrations!A:M,"SELECT C, COUNT(A) GROUP BY C LABEL COUNT(A) 'Count'")
```

#### Daily Registration Count
```
=COUNTIFS(Registrations!E:E,">="&TODAY(),Registrations!E:E,"<"&TODAY()+1)
```

### Performance Metrics
```javascript
function generatePerformanceReport() {
  const registrations = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Registrations');
  const data = registrations.getDataRange().getValues();
  
  const metrics = {
    totalRegistrations: data.length - 1, // Exclude header
    pendingCount: data.filter(row => row[2] === 'Pending').length,
    approvedCount: data.filter(row => row[2] === 'Approved').length,
    rejectedCount: data.filter(row => row[2] === 'Rejected').length,
    avgProcessingTime: calculateAvgProcessingTime(data)
  };
  
  return metrics;
}
```

## Migration Strategy

### Phase 1: Setup and Configuration
1. Create master spreadsheet with all sheets
2. Set up data validation rules
3. Configure protected ranges
4. Install Google Apps Script functions

### Phase 2: Data Import
1. Import existing registration data
2. Set up user accounts and permissions
3. Configure workflows
4. Test all formulas and validations

### Phase 3: Integration
1. Connect with Google Forms for data entry
2. Set up email notifications
3. Configure automated backups
4. Implement audit logging

### Phase 4: Training and Rollout
1. Train users on the new system
2. Provide documentation and guides
3. Monitor system performance
4. Gather feedback and iterate

## Limitations and Considerations

### Google Sheets Limitations
1. **Row Limit**: 10 million cells per spreadsheet
2. **Performance**: Slower with large datasets (>100k rows)
3. **Concurrent Users**: Limited simultaneous editing
4. **Complex Queries**: Limited SQL-like functionality

### Mitigation Strategies
1. **Data Archiving**: Move old records to archive sheets
2. **Sheet Splitting**: Separate sheets by year/quarter
3. **Caching**: Use Apps Script to cache frequently accessed data
4. **Indexing**: Maintain lookup tables for performance

## Future Scalability

### Migration Path to Database
When the system outgrows Google Sheets:
1. Export data to CSV format
2. Import to PostgreSQL/MySQL database
3. Maintain Google Sheets as frontend interface
4. Use Google Apps Script as API layer

### Hybrid Approach
1. Keep Google Sheets for user interface
2. Use external database for data storage
3. Sync data between systems
4. Maintain audit trail in both systems

## Conclusion

This Google Sheets schema design provides a robust foundation for the Anwar Sales Management System MVP. It leverages Google Sheets' strengths while implementing proper data structure, validation, and automation to support all six registration systems effectively.

The design is scalable within Google Sheets limitations and provides a clear migration path to more robust database solutions as the system grows.

## Next Steps

1. **Implementation**: Create the spreadsheet structure
2. **Testing**: Validate all formulas and scripts
3. **User Training**: Prepare training materials
4. **Deployment**: Roll out to production
5. **Monitoring**: Track performance and usage
6. **Iteration**: Gather feedback and improve

---

*Document Version: 1.0*  
*Last Updated: January 20, 2024*  
*Author: Database Design Agent*