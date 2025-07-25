# Google Sheets Schema Diagrams for Anwar Sales Management System

## Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    REGISTRATIONS {
        string registration_id PK
        string registration_type
        string status
        string priority
        date created_date
        string created_by
        date updated_date
        string updated_by
        string assigned_to
        date approval_date
        string approved_by
        string notes
        string reference_id
    }
    
    CONTRACTORS {
        string contractor_id PK
        string registration_id FK
        string company_name
        string contact_person
        string phone_number
        string email
        string address
        string city
        string state
        string postal_code
        string business_license
        string tax_id
        string specialization
        number experience_years
        string certification_status
        string documents_uploaded
        string verification_status
    }
    
    ENGINEERS {
        string engineer_id PK
        string registration_id FK
        string full_name
        string phone_number
        string email
        string address
        string city
        string state
        string postal_code
        string license_number
        string specialization
        number experience_years
        string education_level
        string certifications
        string availability_status
        number hourly_rate
        string documents_uploaded
    }
    
    RETAILERS {
        string retailer_id PK
        string registration_id FK
        string business_name
        string owner_name
        string phone_number
        string email
        string business_address
        string city
        string state
        string postal_code
        string business_type
        string business_license
        string tax_id
        number years_in_business
        number monthly_volume
        string payment_terms
        string documents_uploaded
    }
    
    POTENTIAL_SITES {
        string site_id PK
        string registration_id FK
        string site_name
        string address
        string city
        string state
        string postal_code
        string coordinates
        string site_type
        number size_sqft
        string zoning
        string utilities_available
        string access_road
        string ownership_status
        number estimated_value
        string development_potential
        string environmental_concerns
        string documents_uploaded
    }
    
    USER_ORDERS {
        string order_id PK
        string registration_id FK
        string customer_name
        string customer_phone
        string customer_email
        string delivery_address
        string city
        string state
        string postal_code
        string order_type
        string product_category
        number quantity
        number unit_price
        number total_amount
        string payment_method
        date delivery_date
        string special_instructions
        string order_source
    }
    
    VISITS {
        string visit_id PK
        string registration_id FK
        string visitor_name
        string visitor_phone
        string visitor_email
        string company_organization
        string visit_purpose
        date visit_date
        time visit_time
        number duration_hours
        string location
        string host_contact
        string security_clearance
        string equipment_needed
        string parking_required
        string visit_status
        datetime actual_arrival
        datetime actual_departure
        string visit_notes
    }
    
    USERS {
        string user_id PK
        string username
        string full_name
        string email
        string phone_number
        string role
        string department
        string manager
        date hire_date
        string status
        datetime last_login
        string permissions
        date created_date
        string created_by
    }
    
    WORKFLOWS {
        string workflow_id PK
        string registration_id FK
        string workflow_type
        number current_step
        number total_steps
        string step_name
        string assigned_to
        datetime step_start_date
        datetime step_due_date
        string step_status
        string step_notes
        number escalation_level
        string sla_breach
        string workflow_data
    }
    
    AUDIT_TRAIL {
        string audit_id PK
        datetime timestamp
        string user_id FK
        string action_type
        string table_name
        string record_id
        string field_name
        string old_value
        string new_value
        string ip_address
        string user_agent
        string session_id
        string change_reason
    }
    
    NOTIFICATIONS {
        string notification_id PK
        string recipient_user_id FK
        string sender_user_id FK
        string notification_type
        string title
        string message
        string priority
        datetime created_date
        datetime read_date
        string status
        string related_record_id
        string action_required
        datetime expiry_date
    }
    
    CONFIGURATION {
        string config_key PK
        string config_value
        string config_type
        string description
        string category
        string is_system
        date created_date
        date updated_date
        string updated_by
    }
    
    %% Relationships
    REGISTRATIONS ||--|| CONTRACTORS : "has"
    REGISTRATIONS ||--|| ENGINEERS : "has"
    REGISTRATIONS ||--|| RETAILERS : "has"
    REGISTRATIONS ||--|| POTENTIAL_SITES : "has"
    REGISTRATIONS ||--|| USER_ORDERS : "has"
    REGISTRATIONS ||--|| VISITS : "has"
    
    REGISTRATIONS ||--o{ WORKFLOWS : "triggers"
    REGISTRATIONS }o--|| USERS : "created_by"
    REGISTRATIONS }o--|| USERS : "updated_by"
    REGISTRATIONS }o--|| USERS : "assigned_to"
    
    WORKFLOWS }o--|| USERS : "assigned_to"
    
    AUDIT_TRAIL }o--|| USERS : "performed_by"
    
    NOTIFICATIONS }o--|| USERS : "recipient"
    NOTIFICATIONS }o--|| USERS : "sender"
    
    CONFIGURATION }o--|| USERS : "updated_by"
```

## System Architecture Diagram

```mermaid
graph TB
    subgraph "Google Workspace"
        subgraph "Google Sheets - Master Workbook"
            A[Registrations Sheet]
            B[Contractors Sheet]
            C[Engineers Sheet]
            D[Retailers Sheet]
            E[Potential Sites Sheet]
            F[User Orders Sheet]
            G[Visits Sheet]
            H[Users Sheet]
            I[Workflows Sheet]
            J[Audit Trail Sheet]
            K[Notifications Sheet]
            L[Configuration Sheet]
        end
        
        subgraph "Google Apps Script"
            M[Auto-ID Generation]
            N[Audit Trail Logger]
            O[Notification System]
            P[Workflow Automation]
            Q[Data Validation]
            R[Backup System]
        end
        
        subgraph "Google Forms"
            S[Contractor Registration Form]
            T[Engineer Registration Form]
            U[Retailer Registration Form]
            V[Site Registration Form]
            W[Order Form]
            X[Visit Request Form]
        end
        
        subgraph "Google Drive"
            Y[Document Storage]
            Z[Backup Files]
            AA[Export Files]
        end
    end
    
    subgraph "External Integrations"
        BB[WhatsApp API]
        CC[Email System]
        DD[SMS Gateway]
        EE[Payment Gateway]
    end
    
    subgraph "User Interfaces"
        FF[Web Interface]
        GG[Mobile App]
        HH[Admin Dashboard]
    end
    
    %% Data Flow
    A --> B
    A --> C
    A --> D
    A --> E
    A --> F
    A --> G
    
    A --> I
    I --> H
    
    M --> A
    N --> J
    O --> K
    P --> I
    Q --> A
    R --> Z
    
    S --> B
    T --> C
    U --> D
    V --> E
    W --> F
    X --> G
    
    B --> Y
    C --> Y
    D --> Y
    E --> Y
    F --> Y
    G --> Y
    
    O --> CC
    O --> DD
    P --> BB
    
    FF --> A
    GG --> A
    HH --> A
    
    A --> AA
```

## Data Flow Diagram

```mermaid
flowchart TD
    subgraph "Data Entry"
        A[Google Forms] --> B[Registration Data]
        C[Manual Entry] --> B
        D[API Import] --> B
    end
    
    subgraph "Data Processing"
        B --> E[Data Validation]
        E --> F[Auto-ID Generation]
        F --> G[Registration Sheet]
        G --> H[Specific Registration Sheets]
    end
    
    subgraph "Workflow Management"
        H --> I[Workflow Trigger]
        I --> J[Workflow Assignment]
        J --> K[Approval Process]
        K --> L[Status Update]
    end
    
    subgraph "Audit & Notifications"
        L --> M[Audit Trail]
        L --> N[Notification System]
        N --> O[Email/SMS]
        N --> P[In-App Notifications]
    end
    
    subgraph "Reporting & Analytics"
        G --> Q[Dashboard Queries]
        H --> Q
        M --> Q
        Q --> R[Performance Reports]
        Q --> S[Status Dashboards]
    end
    
    subgraph "Data Management"
        G --> T[Backup System]
        H --> T
        M --> T
        T --> U[Google Drive Storage]
        
        G --> V[Data Export]
        H --> V
        V --> W[CSV/Excel Files]
    end
```

## Workflow State Diagram

```mermaid
stateDiagram-v2
    [*] --> Pending : New Registration
    
    Pending --> InReview : Assign Reviewer
    Pending --> Cancelled : User Cancels
    
    InReview --> DocumentReview : Start Process
    InReview --> Rejected : Initial Rejection
    InReview --> Pending : Return for Info
    
    DocumentReview --> BackgroundCheck : Documents OK
    DocumentReview --> Rejected : Documents Invalid
    DocumentReview --> Pending : Missing Documents
    
    BackgroundCheck --> ManagerApproval : Check Passed
    BackgroundCheck --> Rejected : Check Failed
    
    ManagerApproval --> FinalApproval : Manager Approves
    ManagerApproval --> Rejected : Manager Rejects
    ManagerApproval --> InReview : Return for Review
    
    FinalApproval --> Approved : Final Approval
    FinalApproval --> Rejected : Final Rejection
    
    Approved --> Completed : Process Complete
    Approved --> OnHold : Temporary Hold
    
    OnHold --> Approved : Resume Process
    OnHold --> Cancelled : Cancel Registration
    
    Rejected --> [*] : End Process
    Completed --> [*] : End Process
    Cancelled --> [*] : End Process
```

## User Role Access Matrix

```mermaid
graph LR
    subgraph "User Roles"
        A[Admin]
        B[Manager]
        C[Supervisor]
        D[Operator]
        E[Viewer]
    end
    
    subgraph "Sheet Access Levels"
        F[Full Access]
        G[Read/Write]
        H[Read Only]
        I[No Access]
    end
    
    subgraph "Specific Sheets"
        J[Registrations]
        K[User Management]
        L[Audit Trail]
        M[Configuration]
        N[Workflows]
        O[Notifications]
    end
    
    %% Admin Access
    A --> F
    F --> J
    F --> K
    F --> L
    F --> M
    F --> N
    F --> O
    
    %% Manager Access
    B --> G
    G --> J
    G --> N
    G --> O
    B --> H
    H --> L
    B --> I
    I --> M
    
    %% Supervisor Access
    C --> G
    C --> H
    
    %% Operator Access
    D --> G
    D --> H
    
    %% Viewer Access
    E --> H
```

## Integration Architecture

```mermaid
graph TB
    subgraph "Core System"
        A[Google Sheets Database]
        B[Google Apps Script Engine]
        C[Google Forms Interface]
    end
    
    subgraph "Communication Layer"
        D[Email Integration]
        E[WhatsApp Integration]
        F[SMS Integration]
    end
    
    subgraph "External Services"
        G[Payment Gateway]
        H[Document Verification]
        I[Background Check API]
        J[Geolocation Services]
    end
    
    subgraph "User Interfaces"
        K[Web Dashboard]
        L[Mobile App]
        M[Admin Panel]
    end
    
    subgraph "Data Storage"
        N[Google Drive]
        O[Backup Storage]
        P[Archive Storage]
    end
    
    %% Core Connections
    B --> A
    C --> A
    
    %% Communication
    B --> D
    B --> E
    B --> F
    
    %% External Services
    B --> G
    B --> H
    B --> I
    B --> J
    
    %% User Interfaces
    K --> B
    L --> B
    M --> B
    
    %% Storage
    A --> N
    B --> O
    A --> P
```

## Security Architecture

```mermaid
graph TB
    subgraph "Authentication Layer"
        A[Google Workspace SSO]
        B[Multi-Factor Authentication]
        C[Session Management]
    end
    
    subgraph "Authorization Layer"
        D[Role-Based Access Control]
        E[Sheet-Level Permissions]
        F[Row-Level Security]
    end
    
    subgraph "Data Protection"
        G[Data Encryption]
        H[Audit Logging]
        I[Data Masking]
    end
    
    subgraph "Compliance"
        J[GDPR Compliance]
        K[Data Retention]
        L[Privacy Controls]
    end
    
    subgraph "Monitoring"
        M[Access Monitoring]
        N[Anomaly Detection]
        O[Security Alerts]
    end
    
    %% Flow
    A --> D
    B --> D
    C --> D
    
    D --> E
    E --> F
    
    F --> G
    G --> H
    H --> I
    
    I --> J
    J --> K
    K --> L
    
    H --> M
    M --> N
    N --> O
```

## Performance Optimization Strategy

```mermaid
graph LR
    subgraph "Data Optimization"
        A[Data Partitioning]
        B[Index Optimization]
        C[Query Optimization]
    end
    
    subgraph "Caching Strategy"
        D[Formula Caching]
        E[Lookup Caching]
        F[Result Caching]
    end
    
    subgraph "Load Management"
        G[Batch Processing]
        H[Async Operations]
        I[Rate Limiting]
    end
    
    subgraph "Monitoring"
        J[Performance Metrics]
        K[Usage Analytics]
        L[Bottleneck Detection]
    end
    
    %% Relationships
    A --> D
    B --> E
    C --> F
    
    D --> G
    E --> H
    F --> I
    
    G --> J
    H --> K
    I --> L
```

## Backup and Recovery Strategy

```mermaid
flowchart TD
    subgraph "Primary System"
        A[Google Sheets Database]
        B[Google Apps Script]
        C[Google Drive Files]
    end
    
    subgraph "Backup Types"
        D[Daily Automated Backup]
        E[Weekly Full Backup]
        F[Monthly Archive]
        G[On-Demand Backup]
    end
    
    subgraph "Backup Storage"
        H[Google Drive Backup Folder]
        I[External Cloud Storage]
        J[Local Download]
    end
    
    subgraph "Recovery Options"
        K[Point-in-Time Recovery]
        L[Full System Restore]
        M[Selective Data Recovery]
        N[Disaster Recovery]
    end
    
    %% Backup Flow
    A --> D
    A --> E
    A --> F
    B --> G
    
    D --> H
    E --> I
    F --> J
    G --> H
    
    %% Recovery Flow
    H --> K
    I --> L
    J --> M
    H --> N
```

## Migration Timeline

```mermaid
gantt
    title Google Sheets Implementation Timeline
    dateFormat  YYYY-MM-DD
    section Phase 1: Setup
    Create Spreadsheet Structure    :done, setup1, 2024-01-20, 2d
    Configure Data Validation       :done, setup2, after setup1, 1d
    Set Up Apps Script Functions    :active, setup3, after setup2, 2d
    
    section Phase 2: Configuration
    User Role Setup                 :config1, after setup3, 1d
    Workflow Configuration          :config2, after config1, 2d
    Integration Setup               :config3, after config2, 2d
    
    section Phase 3: Testing
    Unit Testing                    :test1, after config3, 3d
    Integration Testing             :test2, after test1, 2d
    User Acceptance Testing         :test3, after test2, 3d
    
    section Phase 4: Deployment
    Production Setup                :deploy1, after test3, 1d
    Data Migration                  :deploy2, after deploy1, 2d
    User Training                   :deploy3, after deploy2, 3d
    Go Live                         :deploy4, after deploy3, 1d
    
    section Phase 5: Monitoring
    Performance Monitoring          :monitor1, after deploy4, 30d
    User Feedback Collection        :monitor2, after deploy4, 30d
    System Optimization             :monitor3, after deploy4, 30d
```

## Conclusion

These diagrams provide a comprehensive visual representation of the Google Sheets schema design for the Anwar Sales Management System. They illustrate:

1. **Entity Relationships**: Clear understanding of data connections
2. **System Architecture**: Overall system structure and components
3. **Data Flow**: How information moves through the system
4. **Workflow States**: Registration approval process
5. **Security Model**: Access control and data protection
6. **Performance Strategy**: Optimization approaches
7. **Backup Strategy**: Data protection and recovery
8. **Implementation Timeline**: Project execution plan

These visual aids complement the detailed schema design and provide stakeholders with clear understanding of the system architecture and implementation approach.

---

*Document Version: 1.0*  
*Last Updated: January 20, 2024*  
*Author: Database Design Agent*