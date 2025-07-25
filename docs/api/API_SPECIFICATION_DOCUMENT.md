# Anwar Sales Management System - API Specification Document

## Executive Summary

This document provides comprehensive API specifications for the Anwar Sales Management System MVP, designed specifically for Google Apps Script runtime environment with Google Sheets as the primary database. The API design follows RESTful principles with GraphQL integration, event-driven architecture, and optimized patterns for Google Apps Script constraints.

**Key Design Principles:**
- **Google Apps Script Optimized**: All APIs designed within 6-minute execution limits
- **Google Sheets Native**: Data access patterns optimized for Google Sheets API
- **Event-Driven**: Asynchronous processing with Google Apps Script triggers
- **Serverless Architecture**: Stateless design leveraging Google's infrastructure
- **Security First**: Google OAuth 2.0 integration with role-based access control

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [API Architecture Overview](#api-architecture-overview)
3. [Authentication & Authorization](#authentication--authorization)
4. [Core Microservices APIs](#core-microservices-apis)
5. [GraphQL Schema Specifications](#graphql-schema-specifications)
6. [Event-Driven Communication](#event-driven-communication)
7. [Error Handling Patterns](#error-handling-patterns)
8. [Integration Specifications](#integration-specifications)
9. [Performance Optimization](#performance-optimization)
10. [Testing Specifications](#testing-specifications)
11. [Implementation Guidelines](#implementation-guidelines)

---

## API Architecture Overview

### System Architecture Context

```
┌─────────────────────────────────────────────────────────────────┐
│                    API Architecture Overview                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    HTTPS/REST   ┌─────────────────────────────┐│
│  │   Client    │◄────────────────►│     Google Apps Script      ││
│  │Applications │                  │     (API Gateway)           ││
│  └─────────────┘                  └─────────────────────────────┘│
│                                           │                     │
│                                           ▼                     │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                 API Service Layer                           ││
│  │                                                             ││
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐││
│  │ │Contractor   │ │ Engineer    │ │ Retailer    │ │  Site   │││
│  │ │Registration │ │Registration │ │Registration │ │ Service │││
│  │ │   Service   │ │   Service   │ │   Service   │ │         │││
│  │ └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘││
│  └─────────────────────────────────────────────────────────────┘│
│                                           │                     │
│                                           ▼                     │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                Shared Services Layer                        ││
│  │                                                             ││
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐││
│  │ │ Workflow    │ │Notification │ │ Document    │ │ Event   │││
│  │ │  Service    │ │  Service    │ │  Service    │ │ Service │││
│  │ └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘││
│  └─────────────────────────────────────────────────────────────┘│
│                                           │                     │
│                                           ▼                     │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                 Data Access Layer                           ││
│  │                                                             ││
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐││
│  │ │   Google    │ │   Google    │ │   Google    │ │ MyTAPI  │││
│  │ │   Sheets    │ │   Drive     │ │   Gmail     │ │WhatsApp │││
│  │ │  (Database) │ │ (Documents) │ │(Notifications)│ │   API   │││
│  │ └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### API Design Constraints

#### Google Apps Script Constraints
- **Execution Time Limit**: 6 minutes maximum per request
- **Memory Limit**: 100MB heap size
- **Concurrent Executions**: Limited concurrent requests
- **External API Calls**: UrlFetchApp with quotas and timeouts
- **No Persistent Connections**: Stateless request/response only

#### Google Sheets Database Constraints
- **Row Limit**: 10 million cells per spreadsheet
- **API Quotas**: 300 requests per minute per project
- **Concurrent Access**: Optimistic locking required
- **Query Limitations**: No SQL, array-based operations only
- **Data Types**: Limited to basic types (string, number, date, boolean)

### Base URL Structure

```
Production: https://script.google.com/macros/s/{SCRIPT_ID}/exec
Development: https://script.google.com/macros/s/{DEV_SCRIPT_ID}/exec

API Versioning: /api/v1/{service}/{resource}
```

---

## Authentication & Authorization

### Google OAuth 2.0 Integration

#### Authentication Flow
```javascript
// Google Apps Script OAuth implementation
function authenticateRequest(request) {
  try {
    // Get OAuth token from Google Apps Script
    const token = ScriptApp.getOAuthToken();
    
    // Validate user session
    const user = Session.getActiveUser();
    if (!user.getEmail()) {
      throw new AuthenticationError('User not authenticated');
    }
    
    return {
      user: {
        email: user.getEmail(),
        domain: user.getEmail().split('@')[1]
      },
      token: token,
      authenticated: true
    };
  } catch (error) {
    throw new AuthenticationError('Authentication failed: ' + error.message);
  }
}
```

#### Authorization Middleware
```javascript
function authorizeRequest(user, requiredPermissions) {
  const userRoles = getUserRoles(user.email);
  const userPermissions = getUserPermissions(userRoles);
  
  const hasPermission = requiredPermissions.every(permission => 
    userPermissions.includes(permission) || userPermissions.includes('*')
  );
  
  if (!hasPermission) {
    throw new AuthorizationError('Insufficient permissions');
  }
  
  return true;
}
```

### Role-Based Access Control (RBAC)

#### Role Definitions
```json
{
  "roles": {
    "admin": {
      "name": "System Administrator",
      "permissions": ["*"],
      "description": "Full system access"
    },
    "manager": {
      "name": "Regional Manager",
      "permissions": [
        "contractors:*",
        "engineers:*",
        "retailers:*",
        "sites:*",
        "workflows:advance",
        "reports:view"
      ]
    },
    "cro": {
      "name": "Contractor Relations Officer",
      "permissions": [
        "contractors:read",
        "contractors:verify",
        "contractors:update",
        "workflows:advance:contractor"
      ]
    },
    "bdo": {
      "name": "Business Development Officer",
      "permissions": [
        "sites:read",
        "sites:prescribe",
        "sites:assess",
        "retailers:approve",
        "workflows:advance:site",
        "workflows:advance:retailer"
      ]
    },
    "sr": {
      "name": "Sales Representative",
      "permissions": [
        "retailers:read",
        "retailers:create",
        "retailers:update:own",
        "sites:read",
        "sites:create"
      ]
    },
    "engineer": {
      "name": "Field Engineer",
      "permissions": [
        "engineers:read:own",
        "engineers:update:own",
        "assignments:read:own",
        "sites:assess:assigned"
      ]
    }
  }
}
```

#### Permission Validation
```javascript
function validatePermission(userEmail, resource, action, resourceId = null) {
  const userRoles = getUserRoles(userEmail);
  const requiredPermission = `${resource}:${action}`;
  
  // Check for wildcard permissions
  if (hasPermission(userRoles, '*') || hasPermission(userRoles, `${resource}:*`)) {
    return true;
  }
  
  // Check specific permission
  if (hasPermission(userRoles, requiredPermission)) {
    return true;
  }
  
  // Check ownership-based permissions
  if (action.endsWith(':own') && resourceId) {
    return checkResourceOwnership(userEmail, resource, resourceId);
  }
  
  return false;
}
```

---

## Core Microservices APIs

### 1. Contractor Registration Service

#### Base URL
```
https://script.google.com/macros/s/{SCRIPT_ID}/exec/api/v1/contractors
```

#### OpenAPI 3.0 Specification

```yaml
openapi: 3.0.3
info:
  title: Contractor Registration Service
  version: 1.0.0
  description: API for managing contractor registrations in Google Apps Script environment

paths:
  /api/v1/contractors:
    post:
      summary: Create new contractor registration
      description: Submit contractor registration with automatic workflow initiation
      security:
        - GoogleOAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateContractorRequest'
            example:
              personalInfo:
                firstName: "Ahmed"
                lastName: "Khan"
                cnic: "12345-6789012-3"
                dateOfBirth: "1985-06-15"
              contactInfo:
                email: "ahmed.khan@example.com"
                phone: "+92-300-1234567"
                whatsappNumber: "+92-300-1234567"
                address:
                  street: "123 Main Street"
                  city: "Lahore"
                  state: "Punjab"
                  postalCode: "54000"
                  country: "Pakistan"
              professionalInfo:
                specialization: "electrical"
                yearsExperience: 8
                licenseNumber: "ELC-2024-001"
                licenseExpiryDate: "2025-12-31"
                previousProjects: [
                  {
                    name: "Residential Complex A"
                    duration: "6 months"
                    value: 500000
                  }
                ]
              businessInfo:
                companyName: "Khan Electrical Services"
                businessType: "sole_proprietorship"
                taxId: "TAX-123456"
                bankDetails:
                  accountNumber: "1234567890"
                  bankName: "HBL"
                  branchCode: "1234"
      responses:
        '201':
          description: Contractor registration created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ContractorResponse'
              example:
                success: true
                data:
                  id: "contractor_123456"
                  registrationId: "REG-CTR-2024-001"
                  status: "pending_verification"
                  workflowStatus:
                    currentStep: "cro_verification"
                    estimatedCompletion: "2024-01-28T10:00:00Z"
                  createdAt: "2024-01-21T10:30:00Z"
                  nextSteps: [
                    "CRO will review your application within 48 hours"
                  ]
                events:
                  - eventType: "contractor.registration.submitted"
                    timestamp: "2024-01-21T10:30:00Z"
        '400':
          description: Validation error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '401':
          description: Authentication required
        '403':
          description: Insufficient permissions
        '429':
          description: Rate limit exceeded
        '503':
          description: Google Sheets service unavailable

    get:
      summary: List contractors with filtering and pagination
      description: Retrieve contractors based on filters and user permissions
      security:
        - GoogleOAuth: []
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [pending_verification, verified, active, inactive, suspended]
        - name: territory
          in: query
          schema:
            type: string
        - name: specialization
          in: query
          schema:
            type: string
        - name: croId
          in: query
          schema:
            type: string
        - name: page
          in: query
          schema:
            type: integer
            minimum: 1
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 20
        - name: sortBy
          in: query
          schema:
            type: string
            enum: [createdAt, updatedAt, name, status]
            default: createdAt
        - name: sortOrder
          in: query
          schema:
            type: string
            enum: [asc, desc]
            default: desc
      responses:
        '200':
          description: List of contractors
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ContractorListResponse'

  /api/v1/contractors/{contractorId}:
    get:
      summary: Get contractor details
      description: Retrieve detailed contractor information including workflow status
      security:
        - GoogleOAuth: []
      parameters:
        - name: contractorId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Contractor details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ContractorDetailResponse'
        '404':
          description: Contractor not found

    put:
      summary: Update contractor information
      description: Update contractor details with audit trail
      security:
        - GoogleOAuth: []
      parameters:
        - name: contractorId
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateContractorRequest'
      responses:
        '200':
          description: Contractor updated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ContractorResponse'

    delete:
      summary: Delete contractor (48-hour cleanup)
      description: Soft delete contractor with 48-hour cleanup period
      security:
        - GoogleOAuth: []
      parameters:
        - name: contractorId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Contractor marked for deletion
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  message:
                    type: string
                  cleanupDate:
                    type: string
                    format: date-time

  /api/v1/contractors/{contractorId}/verify:
    post:
      summary: CRO verification workflow
      description: Complete CRO verification process for contractor
      security:
        - GoogleOAuth: []
      parameters:
        - name: contractorId
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/VerificationRequest'
      responses:
        '200':
          description: Verification completed
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/VerificationResponse'

  /api/v1/contractors/{contractorId}/documents:
    post:
      summary: Upload contractor documents
      description: Upload and validate contractor documents
      security:
        - GoogleOAuth: []
      parameters:
        - name: contractorId
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                documentType:
                  type: string
                  enum: [license, cnic, experience_certificate, bank_statement]
                file:
                  type: string
                  format: binary
      responses:
        '201':
          description: Document uploaded successfully

    get:
      summary: List contractor documents
      description: Get list of uploaded documents for contractor
      security:
        - GoogleOAuth: []
      parameters:
        - name: contractorId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: List of documents
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DocumentListResponse'

components:
  securitySchemes:
    GoogleOAuth:
      type: oauth2
      flows:
        implicit:
          authorizationUrl: https://accounts.google.com/oauth/authorize
          scopes:
            https://www.googleapis.com/auth/spreadsheets: Access to Google Sheets
            https://www.googleapis.com/auth/drive: Access to Google Drive

  schemas:
    CreateContractorRequest:
      type: object
      required:
        - personalInfo
        - contactInfo
        - professionalInfo
      properties:
        personalInfo:
          $ref: '#/components/schemas/PersonalInfo'
        contactInfo:
          $ref: '#/components/schemas/ContactInfo'
        professionalInfo:
          $ref: '#/components/schemas/ContractorProfessionalInfo'
        businessInfo:
          $ref: '#/components/schemas/BusinessInfo'

    PersonalInfo:
      type: object
      required:
        - firstName
        - lastName
        - cnic
        - dateOfBirth
      properties:
        firstName:
          type: string
          minLength: 2
          maxLength: 50
        lastName:
          type: string
          minLength: 2
          maxLength: 50
        cnic:
          type: string
          pattern: '^[0-9]{5}-[0-9]{7}-[0-9]$'
        dateOfBirth:
          type: string
          format: date
        gender:
          type: string
          enum: [male, female, other]
        nationality:
          type: string
          default: "Pakistani"

    ContactInfo:
      type: object
      required:
        - email
        - phone
        - address
      properties:
        email:
          type: string
          format: email
        phone:
          type: string
          pattern: '^\+92-[0-9]{3}-[0-9]{7}$'
        whatsappNumber:
          type: string
          pattern: '^\+92-[0-9]{3}-[0-9]{7}$'
        address:
          $ref: '#/components/schemas/Address'

    Address:
      type: object
      required:
        - street
        - city
        - state
        - postalCode
        - country
      properties:
        street:
          type: string
        city:
          type: string
        state:
          type: string
        postalCode:
          type: string
        country:
          type: string
          default: "Pakistan"

    ContractorProfessionalInfo:
      type: object
      required:
        - specialization
        - yearsExperience
      properties:
        specialization:
          type: string
          enum: [electrical, plumbing, construction, hvac, solar, general]
        yearsExperience:
          type: integer
          minimum: 0
          maximum: 50
        licenseNumber:
          type: string
        licenseExpiryDate:
          type: string
          format: date
        certifications:
          type: array
          items:
            type: string
        previousProjects:
          type: array
          items:
            $ref: '#/components/schemas/ProjectReference'
        skills:
          type: array
          items:
            type: string
        equipmentOwned:
          type: array
          items:
            type: string

    ProjectReference:
      type: object
      properties:
        name:
          type: string
        clientName:
          type: string
        duration:
          type: string
        value:
          type: number
        description:
          type: string
        completionDate:
          type: string
          format: date

    BusinessInfo:
      type: object
      properties:
        companyName:
          type: string
        businessType:
          type: string
          enum: [sole_proprietorship, partnership, private_limited, public_limited]
        taxId:
          type: string
        businessLicense:
          type: string
        bankDetails:
          $ref: '#/components/schemas/BankDetails'

    BankDetails:
      type: object
      required:
        - accountNumber
        - bankName
        - branchCode
      properties:
        accountNumber:
          type: string
        bankName:
          type: string
        branchCode:
          type: string
        iban:
          type: string

    ContractorResponse:
      type: object
      properties:
        success:
          type: boolean
        data:
          $ref: '#/components/schemas/Contractor'
        events:
          type: array
          items:
            $ref: '#/components/schemas/Event'

    Contractor:
      type: object
      properties:
        id:
          type: string
        registrationId:
          type: string
        personalInfo:
          $ref: '#/components/schemas/PersonalInfo'
        contactInfo:
          $ref: '#/components/schemas/ContactInfo'
        professionalInfo:
          $ref: '#/components/schemas/ContractorProfessionalInfo'
        businessInfo:
          $ref: '#/components/schemas/BusinessInfo'
        status:
          type: string
          enum: [pending_verification, verified, active, inactive, suspended]
        workflowStatus:
          $ref: '#/components/schemas/WorkflowStatus'
        assignedCRO:
          type: string
        rating:
          type: number
          minimum: 0
          maximum: 5
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
        verifiedAt:
          type: string
          format: date-time

    WorkflowStatus:
      type: object
      properties:
        currentStep:
          type: string
        pendingApprovals:
          type: array
          items:
            $ref: '#/components/schemas/PendingApproval'
        completedSteps:
          type: array
          items:
            $ref: '#/components/schemas/CompletedStep'
        estimatedCompletion:
          type: string
          format: date-time
        blockers:
          type: array
          items:
            $ref: '#/components/schemas/WorkflowBlocker'

    PendingApproval:
      type: object
      properties:
        stepName:
          type: string
        assignedTo:
          type: string
        dueDate:
          type: string
          format: date-time
        priority:
          type: string
          enum: [low, medium, high, urgent]

    CompletedStep:
      type: object
      properties:
        stepName:
          type: string
        completedBy:
          type: string
        completedAt:
          type: string
          format: date-time
        notes:
          type: string

    WorkflowBlocker:
      type: object
      properties:
        reason:
          type: string
        blockedSince:
          type: string
          format: date-time
        resolution:
          type: string

    Event:
      type: object
      properties:
        eventType:
          type: string
        timestamp:
          type: string
          format: date-time
        data:
          type: object

    ErrorResponse:
      type: object
      properties:
        error:
          type: object
          properties:
            type:
              type: string
            title:
              type: string
            status:
              type: integer
            detail:
              type: string
            instance:
              type: string
            code:
              type: string
            timestamp:
              type: string
              format: date-time
            requestId:
              type: string
            errors:
              type: array
              items:
                type: object
                properties:
                  field:
                    type: string
                  message:
                    type: string
                  code:
                    type: string
                  value:
                    type: string

    ContractorListResponse:
      type: object
      properties:
        success:
          type: boolean
        data:
          type: array
          items:
            $ref: '#/components/schemas/Contractor'
        pagination:
          $ref: '#/components/schemas/Pagination'
        filters:
          type: object

    Pagination:
      type: object
      properties:
        page:
          type: integer
        limit:
          type: integer
        total:
          type: integer
        totalPages:
          type: integer
        hasNext:
          type: boolean
        hasPrevious:
          type: boolean

    ContractorDetailResponse:
      type: object
      properties:
        success:
          type: boolean
        data:
          allOf:
            - $ref: '#/components/schemas/Contractor'
            - type: object
              properties:
                documents:
                  type: array
                  items:
                    $ref: '#/components/schemas/Document'
                auditTrail:
                  type: array
                  items:
                    $ref: '#/components/schemas/AuditEntry'
                communications:
                  type: array
                  items:
                    $ref: '#/components/schemas/Communication'

    Document:
      type: object
      properties:
        id:
          type: string
        documentType:
          type: string
        fileName:
          type: string
        fileSize:
          type: integer
        mimeType:
          type: string
        uploadedBy:
          type: string
        uploadedAt:
          type: string
          format: date-time
        status:
          type: string
          enum: [pending, verified, rejected]
        downloadUrl:
          type: string

    AuditEntry:
      type: object
      properties:
        id:
          type: string
        action:
          type: string
        performedBy:
          type: string
        timestamp:
          type: string
          format: date-time
        oldValues:
          type: object
        newValues:
          type: object
        ipAddress:
          type: string
        userAgent:
          type: string

    Communication:
      type: object
      properties:
        id:
          type: string
        type:
          type: string
          enum: [whatsapp, email, sms, call]
        direction:
          type: string
          enum: [inbound, outbound]
        subject:
          type: string
        content:
          type: string
        sentBy:
          type: string
        sentAt:
          type: string
          format: date-time
        status:
          type: string
          enum: [pending, sent, delivered, failed, read]

    UpdateContractorRequest:
      type: object
      properties:
        personalInfo:
          $ref: '#/components/schemas/PersonalInfo'
        contactInfo:
          $ref: '#/components/schemas/ContactInfo'
        professionalInfo:
          $ref: '#/components/schemas/ContractorProfessionalInfo'
        businessInfo:
          $ref: '#/components/schemas/BusinessInfo'

    VerificationRequest:
      type: object
      required:
        - verificationStatus
        - notes
      properties:
        verificationStatus:
          type: string
          enum: [approved, rejected, requires_additional_info]
        notes:
          type: string
        requiredDocuments:
          type: array
          items:
            type: string
        followUpDate:
          type: string
          format: date-time

    VerificationResponse:
      type: object
      properties:
        success:
          type: boolean
        data:
          type: object
          properties:
            verificationStatus:
              type: string
            verifiedBy:
              type: string
            verifiedAt:
              type: string
              format: date-time
            nextSteps:
              type: array
              items:
                type: string
        events:
          type: array
          items:
            $ref: '#/components/schemas/Event'

    DocumentListResponse:
      type: object
      properties:
        success:
          type: boolean
        data:
          type: array
          items:
            $ref: '#/components/schemas/Document'
```

#### Google Apps Script Implementation

```javascript
// Contractor Registration Service Implementation
class ContractorRegistrationService {
  constructor() {
    this.spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    this.contractorsSheet = this.spreadsheet.getSheetByName('Contractors');
    this.registrationsSheet = this.spreadsheet.getSheetByName('Registrations');
    this.workflowsSheet = this.spreadsheet.getSheetByName('Workflows');
    this.auditSheet = this.spreadsheet.getSheetByName('Audit_Trail');
  }

  // Create new contractor registration
  createContractor(requestData) {
    try {
      // Validate request data
      const validation = this.validateContractorData(requestData);
      if (!validation.isValid) {
        throw new ValidationError('Invalid contractor data', validation.errors);
      }

      // Generate unique IDs
      const contractorId = 'contractor_' + Utilities.getUuid();
      const registrationId = this.generateRegistrationId('CTR');

      // Prepare contractor data for Google Sheets
      const contractorData = this.prepareContractorData(contractorId, registrationId, requestData);

      // Insert into Contractors sheet
      this.insertContractorRecord(contractorData);

      // Create registration record
      this.createRegistrationRecord(contractorId, registrationId, 'contractor');

      // Initialize workflow
      this.initializeWorkflow(contractorId, 'contractor_registration');

      // Publish event
      this.publishEvent('contractor.registration.submitted', 'contractor', contractorId, {
        registrationId: registrationId,
        submittedBy: Session.getActiveUser().getEmail(),
        timestamp: new Date().toISOString()
      });

      // Send notifications
      this.sendRegistrationNotifications(contractorData);

      // Create audit entry
      this.createAuditEntry('contractor', contractorId, 'created', null, contractorData);

      return {
        success: true,
        data: {
          id: contractorId,
          registrationId: registrationId,
          status: 'pending_verification',
          workflowStatus: {
            currentStep: 'cro_verification',
            estimatedCompletion: this.calculateEstimatedCompletion('contractor_registration')
          },
          createdAt: new Date().toISOString(),
          nextSteps: [
            'CRO will review your application within 48 hours',
            'You will receive WhatsApp notifications for status updates'
          ]
        },
        events: [{
          eventType: 'contractor.registration.submitted',
          timestamp: new Date().toISOString()
        }]
      };
    } catch (error) {
      Logger.log('Error creating contractor: ' + error.toString());
      throw error;
    }
  }

  // Get contractor by ID
  getContractor(contractorId) {
    try {
      const contractor = this.findContractorById(contractorId);
      if (!contractor) {
        throw new NotFoundError('Contractor not found');
      }

      // Get workflow status
      const workflowStatus = this.getWorkflowStatus('contractor', contractorId);

      // Get documents
      const documents = this.getContractorDocuments(contractorId);

      // Get audit trail
      const auditTrail = this.getAuditTrail('contractor', contractorId);

      // Get communications
      const communications = this.getCommunications('contractor', contractorId);

      return {
        success: true,
        data: {
          ...contractor,
          workflowStatus: workflowStatus,
          documents: documents,
          auditTrail: auditTrail,
          communications: communications
        }
      };
    } catch (error) {
      Logger.log('Error getting contractor: ' + error.toString());
      throw error;
    }
  }

  // List contractors with filtering
  listContractors(filters = {}, pagination = {}) {
    try {
      const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
      
      // Get all contractor data
      const allData = this.contractorsSheet.getDataRange().getValues();
      const headers = allData[0];
      const rows = allData.slice(1);

      // Convert to objects
      let contractors = rows.map(row => {
        const contractor = {};
        headers.forEach((header, index) => {
          contractor[header] = row[index];
        });
        return contractor;
      });

      // Apply filters
      contractors = this.applyFilters(contractors, filters);

      // Apply sorting
      contractors = this.applySorting(contractors, sortBy, sortOrder);

      // Apply pagination
      const total = contractors.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedContractors = contractors.slice(startIndex, endIndex);

      return {
        success: true,
        data: paginatedContractors,
        pagination: {
          page: page,
          limit: limit,
          total: total,
          totalPages: totalPages,
          hasNext: page < totalPages,
          hasPrevious: page > 1
        },
        filters: filters
      };
    } catch (error) {
      Logger.log('Error listing contractors: ' + error.toString());
      throw error;
    }
  }

  // Update contractor
  updateContractor(contractorId, updateData) {
    try {
      const existingContractor = this.findContractorById(contractorId);
      if (!existingContractor) {
        throw new NotFoundError('Contractor not found');
      }

      // Validate update data
      const validation = this.validateContractorUpdateData(updateData);
      if (!validation.isValid) {
        throw new ValidationError('Invalid update data', validation.errors);
      }

      // Prepare updated data
      const updatedData = { ...existingContractor, ...updateData, updatedAt: new Date().toISOString() };

      // Update in Google Sheets
      this.updateContractorRecord(contractorId, updatedData);

      // Publish event
      this.publishEvent('contractor.updated', 'contractor', contractorId, {
        updatedFields: Object.keys(updateData),
        updatedBy: Session.getActiveUser().getEmail(),
        timestamp: new Date().toISOString()
      });

      // Create audit entry
      this.createAuditEntry('contractor', contractorId, 'updated', existingContractor, updatedData);

      return {
        success: true,
        data: updatedData,
        events: [{
          eventType: 'contractor.updated',
          timestamp: new Date().toISOString()
        }]
      };
    } catch (error) {
      Logger.log('Error updating contractor: ' + error.toString());
      throw error;
    }
  }

  // CRO verification
  verifyContractor(contractorId, verificationData) {
    try {
      const contractor = this.findContractorById(contractorId);
      if (!contractor) {
        throw new NotFoundError('Contractor not found');
      }

      // Validate CRO permissions
      const user = Session.getActiveUser().getEmail();
      if (!this.hasPermission(user, 'contractors:verify')) {
        throw new AuthorizationError('Insufficient permissions for verification');
      }

      // Update contractor status
      const updatedContractor = {
        ...contractor,
        verificationStatus: verificationData.verificationStatus,
        verificationNotes: verificationData.notes,
        verifiedBy: user,
        verifiedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Update in Google Sheets
      this.updateContractorRecord(contractorId, updatedContractor);

      // Advance workflow
      this.advanceWorkflow('contractor', contractorId, 'cro_verification_completed');

      // Publish event
      this.publishEvent('contractor.verification.completed', 'contractor', contractorId, {
        verificationStatus: verificationData.verificationStatus,
        verifiedBy: user,
        timestamp: new Date().toISOString()
      });

      // Send notification to contractor
      this.sendVerificationNotification(contractor, verificationData.verificationStatus);

      // Create audit entry
      this.createAuditEntry('contractor', contractorId, 'verified', contractor, updatedContractor);

      return {
        success: true,
        data: {
          verificationStatus: verificationData.verificationStatus,
          verifiedBy: user,
          verifiedAt: new Date().toISOString(),
          nextSteps: this.getNextSteps(verificationData.verificationStatus)
        },
        events: [{
          eventType: 'contractor.verification.completed',
          timestamp: new Date().toISOString()
        }]
      };
    } catch (error) {
      Logger.log('Error verifying contractor: ' + error.toString());
      throw error;
    }
  }

  // Helper methods
  validateContractorData(data) {
    const errors = [];
    
    // Required fields validation
    if (!data.personalInfo?.firstName) errors.push({ field: 'personalInfo.firstName', message: 'First name is required' });
    if (!data.personalInfo?.lastName) errors.push({ field: 'personalInfo.lastName', message: 'Last name is required' });
    if (!data.personalInfo?.cnic) errors.push({ field: 'personalInfo.cnic', message: 'CNIC is required' });
    if (!data.contactInfo?.email) errors.push({ field: 'contactInfo.email', message: 'Email is required' });
    if (!data.contactInfo?.phone) errors.push({ field: 'contactInfo.phone', message: 'Phone is required' });
    if (!data.professionalInfo?.specialization) errors.push({ field: 'professionalInfo.specialization', message: 'Specialization is required' });

    // Format validation
    if (data.contactInfo?.email && !this.isValidEmail(data.contactInfo.email)) {
      errors.push({ field: 'contactInfo.email', message: 'Invalid email format' });
    }
    
    if (data.contactInfo?.phone && !this.isValidPhone(data.contactInfo.phone)) {
      errors.push({ field: 'contactInfo.phone', message: 'Invalid phone format' });
    }

    if (data.personalInfo?.cnic && !this.isValidCNIC(data.personalInfo.cnic)) {
      errors.push({ field: 'personalInfo.cnic', message: 'Invalid CNIC format' });
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  prepareContractorData(contractorId, registrationId, requestData) {
    return {
      id: contractorId,
      registrationId: registrationId,
      firstName: requestData.personalInfo.firstName,
      lastName: requestData.personalInfo.lastName,
      cnic: requestData.personalInfo.cnic,
      dateOfBirth: requestData.personalInfo.dateOfBirth,
      email: requestData.contactInfo.email,
      phone: requestData.contactInfo.phone,
      whatsappNumber: requestData.contactInfo.whatsappNumber || requestData.contactInfo.phone,
      address: JSON.stringify(requestData.contactInfo.address),
      specialization: requestData.professionalInfo.specialization,
      yearsExperience: requestData.professionalInfo.yearsExperience,
      licenseNumber: requestData.professionalInfo.licenseNumber,
      licenseExpiryDate: requestData.professionalInfo.licenseExpiryDate,
      companyName: requestData.businessInfo?.companyName,
      businessType: requestData.businessInfo?.businessType,
      taxId: requestData.businessInfo?.taxId,
      bankDetails: JSON.stringify(requestData.businessInfo?.bankDetails),
      status: 'pending_verification',
      createdBy: Session.getActiveUser().getEmail(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  insertContractorRecord(contractorData) {
    const headers = this.contractorsSheet.getRange(1, 1, 1, this.contractorsSheet.getLastColumn()).getValues()[0];
    const row = headers.map(header => contractorData[header] || '');
    this.contractorsSheet.appendRow(row);
  }

  findContractorById(contractorId) {
    const data = this.contractorsSheet.getDataRange().getValues();
    const headers = data[0];
    const idIndex = headers.indexOf('id');
    
    if (idIndex === -1) return null;
    
    const contractorRow = data.find(row => row[idIndex] === contractorId);
    if (!contractorRow) return null;
    
    const contractor = {};
    headers.forEach((header, index) => {
      contractor[header] = contractorRow[index];
    });
    
    return contractor;
  }

  updateContractorRecord(contractorId, updatedData) {
    const data = this.contractorsSheet.getDataRange().getValues();
    const headers = data[0];
    const idIndex = headers.indexOf('id');
    
    const rowIndex = data.findIndex(row => row[idIndex] === contractorId);
    if (rowIndex === -1) throw new NotFoundError('Contractor not found');
    
    // Update each field
    Object.keys(updatedData).forEach(field => {
      const columnIndex = headers.indexOf(field);
      if (columnIndex !== -1) {
        this.contractorsSheet.getRange(rowIndex + 1, columnIndex + 1).setValue(updatedData[field]);
      }
    });
  }

  generateRegistrationId(prefix) {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    return `REG-${prefix}-${year}-${timestamp}`;
  }

  isValidEmail(email) {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone) {
    const phoneRegex = /^\+92-[0-9]{3}-[0-9]{7}$/;
    return phoneRegex.test(phone);
  }

  isValidCNIC(cnic) {
    const cnicRegex = /^[0-9]{5}-[0-9]{7}-[0-9]$/;
    return cnicRegex.test(cnic);
  }
}

// Main API handler for Contractor Registration
function handleContractorAPI(request) {
  const service = new ContractorRegistrationService();
  
  try {
    // Authenticate user
    const auth = authenticateRequest(request);
    
    // Route request
    switch (request.method) {
      case 'POST':
        if (request.path === '/api/v1/contractors') {
          authorizeRequest(auth.user, ['contractors:create']);
          return service.createContractor(request.body);
        } else if (request.path.includes('/verify')) {
          authorizeRequest(auth.user, ['contractors:verify']);
          const contractorId = extractIdFromPath(request.path);
          return service.verifyContractor(contractorId, request.body);
        }
        break;
        
      case 'GET':
        if (request.path === '/api/v1/contractors') {
          authorizeRequest(auth.user, ['contractors:read']);
          return service.listContractors(request.query.filters, request.query.pagination);
        } else {
          authorizeRequest(auth.user, ['contractors:read']);
          const contractorId = extractIdFromPath(request.path);
          return service.getContractor(contractorId);
        }
        break;
        
      case 'PUT':
        authorizeRequest(auth.user, ['contractors:update']);
        const contractorId = extractIdFromPath(request.path);
        return service.updateContractor(contractorId, request.body);
        break;
        
      default:
        throw new MethodNotAllowedError('Method not allowed');
    }
  } catch (error) {
    return handleApiError(error);
  }
}
```

---

### 2. Engineer Registration Service

#### Base URL
```
https://script.google.com/macros/s/{SCRIPT_ID}/exec/api/v1/engineers
```

#### Key Endpoints

```yaml
paths:
  /api/v1/engineers:
    post:
      summary: Create engineer registration with technical qualifications
      description: Submit engineer registration with enhanced technical validation
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required:
                - personalInfo
                - contactInfo
                - technicalProfile
              properties:
                personalInfo:
                  $ref: '#/components/schemas/PersonalInfo'
                contactInfo:
                  $ref: '#/components/schemas/ContactInfo'
                technicalProfile:
                  type: object
                  required:
                    - specialization
                    - experienceLevel
                    - educationLevel
                  properties:
                    specialization:
                      type: string
                      enum: [civil, electrical, mechanical, software, telecommunications, environmental]
                    experienceLevel:
                      type: string
                      enum: [junior, mid_level, senior, expert]
                    educationLevel:
                      type: string
                      enum: [diploma, bachelors, masters, phd]
                    yearsExperience:
                      type: integer
                      minimum: 0
                      maximum: 50
                    certifications:
                      type: array
                      items:
                        type: object
                        properties:
                          name:
                            type: string
                          issuingOrganization:
                            type: string
                          issueDate:
                            type: string
                            format: date
                          expiryDate:
                            type: string
                            format: date
                          certificateNumber:
                            type: string
                    skills:
                      type: array
                      items:
                        type: object
                        properties:
                          skillName:
                            type: string
                          proficiencyLevel:
                            type: string
                            enum: [beginner, intermediate, advanced, expert]
                          yearsExperience:
                            type: integer
                    projects:
                      type: array
                      items:
                        type: object
                        properties:
                          projectName:
                            type: string
                          role:
                            type: string
                          duration:
                            type: string
                          technologies:
                            type: array
                            items:
                              type: string
                          description:
                            type: string
                    availability:
                      type: object
                      properties:
                        status:
                          type: string
                          enum: [available, busy, unavailable]
                        preferredWorkType:
                          type: string
                          enum: [full_time, part_time, contract, freelance]
                        hourlyRate:
                          type: number
                        availableFrom:
                          type: string
                          format: date
            example:
              personalInfo:
                firstName: "Muhammad"
                lastName: "Ali"
                cnic: "12345-6789012-3"
                dateOfBirth: "1990-03-15"
              contactInfo:
                email: "m.ali.engineer@example.com"
                phone: "+92-300-1234567"
                whatsappNumber: "+92-300-1234567"
                address:
                  street: "456 Tech Street"
                  city: "Karachi"
                  state: "Sindh"
                  postalCode: "75000"
                  country: "Pakistan"
              technicalProfile:
                specialization: "software"
                experienceLevel: "senior"
                educationLevel: "masters"
                yearsExperience: 8
                certifications:
                  - name: "AWS Solutions Architect"
                    issuingOrganization: "Amazon Web Services"
                    issueDate: "2023-01-15"
                    expiryDate: "2026-01-15"
                    certificateNumber: "AWS-SA-001"
                skills:
                  - skillName: "JavaScript"
                    proficiencyLevel: "expert"
                    yearsExperience: 8
                  - skillName: "Python"
                    proficiencyLevel: "advanced"
                    yearsExperience: 5
                projects:
                  - projectName: "E-commerce Platform"
                    role: "Lead Developer"
                    duration: "12 months"
                    technologies: ["React", "Node.js", "MongoDB"]
                    description: "Led development of scalable e-commerce platform"
                availability:
                  status: "available"
                  preferredWorkType: "full_time"
                  hourlyRate: 5000
                  availableFrom: "2024-02-01"
      responses:
        '201':
          description: Engineer registration created successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: object
                    properties:
                      id:
                        type: string
                      registrationId:
                        type: string
                      status:
                        type: string
                      workflowStatus:
                        type: object
                        properties:
                          currentStep:
                            type: string
                          estimatedCompletion:
                            type: string
                            format: date-time
                      createdAt:
                        type: string
                        format: date-time
                      nextSteps:
                        type: array
                        items:
                          type: string
                  events:
                    type: array
                    items:
                      type: object

  /api/v1/engineers/search:
    get:
      summary: Search engineers by skills and availability
      description: Advanced search for engineers based on technical criteria
      parameters:
        - name: skills
          in: query
          schema:
            type: array
            items:
              type: string
        - name: specialization
          in: query
          schema:
            type: string
        - name: experienceLevel
          in: query
          schema:
            type: string
        - name: availability
          in: query
          schema:
            type: string
        - name: location
          in: query
          schema:
            type: string
        - name: hourlyRateMin
          in: query
          schema:
            type: number
        - name: hourlyRateMax
          in: query
          schema:
            type: number
      responses:
        '200':
          description: Search results
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: array
                    items:
                      type: object
                  pagination:
                    type: object
```

#### Google Apps Script Implementation for Engineer Service

```javascript
class EngineerRegistrationService {
  constructor() {
    this.spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    this.engineersSheet = this.spreadsheet.getSheetByName('Engineers');
    this.skillsSheet = this.spreadsheet.getSheetByName('Engineer_Skills');
    this.assignmentsSheet = this.spreadsheet.getSheetByName('Engineer_Assignments');
  }

  createEngineer(requestData) {
    try {
      const validation = this.validateEngineerData(requestData);
      if (!validation.isValid) {
        throw new ValidationError('Invalid engineer data', validation.errors);
      }

      const engineerId = 'engineer_' + Utilities.getUuid();
      const registrationId = this.generateRegistrationId('ENG');

      const engineerData = this.prepareEngineerData(engineerId, registrationId, requestData);
      this.insertEngineerRecord(engineerData);
      this.insertEngineerSkills(engineerId, requestData.technicalProfile.skills);
      
      this.createRegistrationRecord(engineerId, registrationId, 'engineer');
      this.initializeWorkflow(engineerId, 'engineer_registration');
      
      this.publishEvent('engineer.registration.submitted', 'engineer', engineerId, {
        registrationId: registrationId,
        specialization: requestData.technicalProfile.specialization,
        submittedBy: Session.getActiveUser().getEmail()
      });

      return {
        success: true,
        data: {
          id: engineerId,
          registrationId: registrationId,
          status: 'pending_technical_review',
          workflowStatus: {
            currentStep: 'technical_assessment',
            estimatedCompletion: this.calculateEstimatedCompletion('engineer_registration')
          },
          createdAt: new Date().toISOString()
        }
      };
    } catch (error) {
      Logger.log('Error creating engineer: ' + error.toString());
      throw error;
    }
  }

  verifyEngineer(engineerId, verificationData) {
    try {
      const engineer = this.findEngineerById(engineerId);
      if (!engineer) {
        throw new NotFoundError('Engineer not found');
      }

      const user = Session.getActiveUser().getEmail();
      if (!this.hasPermission(user, 'engineers:verify')) {
        throw new AuthorizationError('Insufficient permissions');
      }

      const updatedEngineer = {
        ...engineer,
        [`${verificationData.verificationType}Status`]: verificationData.verificationStatus,
        [`${verificationData.verificationType}Notes`]: verificationData.notes,
        [`${verificationData.verificationType}By`]: user,
        [`${verificationData.verificationType}At`]: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (verificationData.technicalAssessment) {
        updatedEngineer.technicalRating = verificationData.technicalAssessment.overallTechnicalRating;
        this.updateEngineerSkillsVerification(engineerId, verificationData.technicalAssessment.skillsVerified);
      }

      this.updateEngineerRecord(engineerId, updatedEngineer);
      this.advanceWorkflow('engineer', engineerId, `${verificationData.verificationType}_completed`);
      
      this.publishEvent('engineer.verification.completed', 'engineer', engineerId, {
        verificationType: verificationData.verificationType,
        verificationStatus: verificationData.verificationStatus,
        verifiedBy: user
      });

      return {
        success: true,
        data: {
          verificationType: verificationData.verificationType,
          verificationStatus: verificationData.verificationStatus,
          verifiedBy: user,
          verifiedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      Logger.log('Error verifying engineer: ' + error.toString());
      throw error;
    }
  }

  assignEngineer(engineerId, assignmentData) {
    try {
      const engineer = this.findEngineerById(engineerId);
      if (!engineer) {
        throw new NotFoundError('Engineer not found');
      }

      if (engineer.status !== 'verified') {
        throw new ValidationError('Engineer must be verified before assignment');
      }

      const assignmentId = 'assignment_' + Utilities.getUuid();
      const assignment = {
        id: assignmentId,
        engineerId: engineerId,
        projectId: assignmentData.projectId,
        role: assignmentData.role,
        startDate: assignmentData.startDate,
        endDate: assignmentData.endDate,
        workType: assignmentData.workType,
        hourlyRate: assignmentData.hourlyRate,
        status: 'assigned',
        assignedBy: Session.getActiveUser().getEmail(),
        assignedAt: new Date().toISOString()
      };

      this.insertAssignmentRecord(assignment);
      this.updateEngineerStatus(engineerId, 'assigned');
      
      this.publishEvent('engineer.assigned', 'engineer', engineerId, {
        assignmentId: assignmentId,
        projectId: assignmentData.projectId,
        assignedBy: Session.getActiveUser().getEmail()
      });

      return {
        success: true,
        data: assignment
      };
    } catch (error) {
      Logger.log('Error assigning engineer: ' + error.toString());
      throw error;
    }
  }
}
```

---

### 3. Retailer Registration Service

#### Base URL
```
https://script.google.com/macros/s/{SCRIPT_ID}/exec/api/v1/retailers
```

#### Key Features
- **Business Profile Management**: Comprehensive business information capture
- **Territory Assignment**: Automatic territory mapping based on location
- **BDO Approval Workflow**: Multi-stage approval process
- **Sales Performance Tracking**: Integration with sales metrics
- **Inventory Management**: Basic inventory tracking capabilities

#### OpenAPI Specification

```yaml
paths:
  /api/v1/retailers:
    post:
      summary: Create retailer registration
      description: Submit retailer registration with business profile
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required:
                - businessInfo
                - contactInfo
                - locationInfo
              properties:
                businessInfo:
                  type: object
                  required:
                    - businessName
                    - businessType
                    - registrationNumber
                  properties:
                    businessName:
                      type: string
                      minLength: 2
                      maxLength: 100
                    businessType:
                      type: string
                      enum: [retail_store, wholesale, distributor, online_only, hybrid]
                    registrationNumber:
                      type: string
                    taxId:
                      type: string
                    establishedYear:
                      type: integer
                      minimum: 1900
                      maximum: 2024
                    employeeCount:
                      type: integer
                      minimum: 1
                    annualRevenue:
                      type: number
                    businessLicense:
                      type: string
                    operatingHours:
                      type: object
                      properties:
                        monday:
                          type: string
                        tuesday:
                          type: string
                        wednesday:
                          type: string
                        thursday:
                          type: string
                        friday:
                          type: string
                        saturday:
                          type: string
                        sunday:
                          type: string
                contactInfo:
                  type: object
                  required:
                    - ownerName
                    - email
                    - phone
                  properties:
                    ownerName:
                      type: string
                    ownerCnic:
                      type: string
                      pattern: '^[0-9]{5}-[0-9]{7}-[0-9]$'
                    email:
                      type: string
                      format: email
                    phone:
                      type: string
                      pattern: '^\+92-[0-9]{3}-[0-9]{7}$'
                    whatsappNumber:
                      type: string
                    alternateContact:
                      type: object
                      properties:
                        name:
                          type: string
                        phone:
                          type: string
                        relationship:
                          type: string
                locationInfo:
                  type: object
                  required:
                    - address
                    - coordinates
                  properties:
                    address:
                      $ref: '#/components/schemas/Address'
                    coordinates:
                      type: object
                      required:
                        - latitude
                        - longitude
                      properties:
                        latitude:
                          type: number
                          minimum: -90
                          maximum: 90
                        longitude:
                          type: number
                          minimum: -180
                          maximum: 180
                    territoryId:
                      type: string
                    marketType:
                      type: string
                      enum: [urban, suburban, rural, commercial_district]
                    footTraffic:
                      type: string
                      enum: [low, medium, high, very_high]
                    competitorCount:
                      type: integer
                      minimum: 0
                    parkingAvailable:
                      type: boolean
                    publicTransportAccess:
                      type: boolean
                salesInfo:
                  type: object
                  properties:
                    currentSuppliers:
                      type: array
                      items:
                        type: string
                    productCategories:
                      type: array
                      items:
                        type: string
                        enum: [electronics, appliances, solar_equipment, electrical_supplies, tools, accessories]
                    averageMonthlyOrders:
                      type: number
                    preferredPaymentTerms:
                      type: string
                      enum: [cash_on_delivery, net_30, net_60, advance_payment]
                    creditLimit:
                      type: number
                    salesRepresentative:
                      type: string
            example:
              businessInfo:
                businessName: "Tech Solutions Store"
                businessType: "retail_store"
                registrationNumber: "REG-123456"
                taxId: "TAX-789012"
                establishedYear: 2018
                employeeCount: 8
                annualRevenue: 5000000
                operatingHours:
                  monday: "09:00-18:00"
                  tuesday: "09:00-18:00"
                  wednesday: "09:00-18:00"
                  thursday: "09:00-18:00"
                  friday: "09:00-18:00"
                  saturday: "09:00-16:00"
                  sunday: "Closed"
              contactInfo:
                ownerName: "Fatima Sheikh"
                ownerCnic: "12345-6789012-3"
                email: "fatima@techsolutions.com"
                phone: "+92-300-1234567"
                whatsappNumber: "+92-300-1234567"
              locationInfo:
                address:
                  street: "789 Business Avenue"
                  city: "Islamabad"
                  state: "Federal Capital Territory"
                  postalCode: "44000"
                  country: "Pakistan"
                coordinates:
                  latitude: 33.6844
                  longitude: 73.0479
                marketType: "commercial_district"
                footTraffic: "high"
                competitorCount: 3
                parkingAvailable: true
                publicTransportAccess: true
              salesInfo:
                currentSuppliers: ["ABC Electronics", "XYZ Distributors"]
                productCategories: ["electronics", "appliances"]
                averageMonthlyOrders: 150000
                preferredPaymentTerms: "net_30"
                creditLimit: 500000
      responses:
        '201':
          description: Retailer registration created successfully

  /api/v1/retailers/{retailerId}/approve:
    post:
      summary: BDO approval process for retailer
      description: Complete BDO approval workflow for retailer registration
      parameters:
        - name: retailerId
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - approvalStatus
                - notes
              properties:
                approvalStatus:
                  type: string
                  enum: [approved, rejected, requires_site_visit, requires_additional_info]
                notes:
                  type: string
                creditLimitApproved:
                  type: number
                paymentTermsApproved:
                  type: string
                territoryAssignment:
                  type: string
                salesRepAssignment:
                  type: string
                siteVisitRequired:
                  type: boolean
                siteVisitDate:
                  type: string
                  format: date-time
                conditions:
                  type: array
                  items:
                    type: string
      responses:
        '200':
          description: Approval completed successfully

  /api/v1/retailers/territory/{territoryId}:
    get:
      summary: Get retailers by territory
      description: Retrieve all retailers within a specific territory
      parameters:
        - name: territoryId
          in: path
          required: true
          schema:
            type: string
        - name: status
          in: query
          schema:
            type: string
        - name: performanceMetrics
          in: query
          schema:
            type: boolean
            default: false
      responses:
        '200':
          description: List of retailers in territory
```

---

### 4. Potential Site Registration Service

#### Base URL
```
https://script.google.com/macros/s/{SCRIPT_ID}/exec/api/v1/sites
```

#### Key Features
- **Site Assessment Workflow**: Multi-stage site evaluation process
- **Prescription Generation**: Automated technical recommendations
- **Engineer Assignment**: Automatic assignment based on location and expertise
- **Progress Tracking**: Real-time site development status
- **Document Management**: Site-specific document handling

#### OpenAPI Specification

```yaml
paths:
  /api/v1/sites:
    post:
      summary: Register potential site
      description: Submit new potential site for assessment
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required:
                - siteInfo
                - customerInfo
                - requirements
              properties:
                siteInfo:
                  type: object
                  required:
                    - siteName
                    - siteType
                    - address
                    - coordinates
                  properties:
                    siteName:
                      type: string
                    siteType:
                      type: string
                      enum: [residential, commercial, industrial, agricultural, institutional]
                    address:
                      $ref: '#/components/schemas/Address'
                    coordinates:
                      type: object
                      properties:
                        latitude:
                          type: number
                        longitude:
                          type: number
                    siteArea:
                      type: number
                      description: "Site area in square meters"
                    buildingType:
                      type: string
                      enum: [single_story, multi_story, warehouse, factory, office_building]
                    roofType:
                      type: string
                      enum: [flat, sloped, mixed, shed_type]
                    roofCondition:
                      type: string
                      enum: [excellent, good, fair, poor, needs_repair]
                    shadingIssues:
                      type: boolean
                    accessibilityRating:
                      type: string
                      enum: [easy, moderate, difficult, very_difficult]
                customerInfo:
                  type: object
                  required:
                    - customerName
                    - contactInfo
                  properties:
                    customerName:
                      type: string
                    customerType:
                      type: string
                      enum: [individual, business, government, ngo]
                    contactInfo:
                      type: object
                      required:
                        - email
                        - phone
                      properties:
                        email:
                          type: string
                          format: email
                        phone:
                          type: string
                        whatsappNumber:
                          type: string
                        alternateContact:
                          type: object
                    businessInfo:
                      type: object
                      properties:
                        companyName:
                          type: string
                        industry:
                          type: string
                        annualEnergyConsumption:
                          type: number
                        currentEnergySource:
                          type: string
                          enum: [grid_only, generator, hybrid, solar_existing]
                requirements:
                  type: object
                  required:
                    - projectType
                    - estimatedCapacity
                  properties:
                    projectType:
                      type: string
                      enum: [solar_installation, electrical_upgrade, energy_audit, maintenance, consultation]
                    estimatedCapacity:
                      type: number
                      description: "Estimated capacity in kW"
                    budget:
                      type: object
                      properties:
                        min:
                          type: number
                        max:
                          type: number
                        currency:
                          type: string
                          default: "PKR"
                    timeline:
                      type: object
                      properties:
                        preferredStartDate:
                          type: string
                          format: date
                        expectedCompletion:
                          type: string
                          format: date
                        urgency:
                          type: string
                          enum: [low, medium, high, urgent]
                    specialRequirements:
                      type: array
                      items:
                        type: string
                    environmentalFactors:
                      type: object
                      properties:
                        averageSunlightHours:
                          type: number
                        seasonalVariations:
                          type: string
                        weatherChallenges:
                          type: array
                          items:
                            type: string
            example:
              siteInfo:
                siteName: "Green Valley Residence"
                siteType: "residential"
                address:
                  street: "123 Green Valley Road"
                  city: "Lahore"
                  state: "Punjab"
                  postalCode: "54000"
                  country: "Pakistan"
                coordinates:
                  latitude: 31.5204
                  longitude: 74.3587
                siteArea: 500
                buildingType: "single_story"
                roofType: "flat"
                roofCondition: "good"
                shadingIssues: false
                accessibilityRating: "easy"
              customerInfo:
                customerName: "Ahmed Hassan"
                customerType: "individual"
                contactInfo:
                  email: "ahmed.hassan@example.com"
                  phone: "+92-300-1234567"
                  whatsappNumber: "+92-300-1234567"
              requirements:
                projectType: "solar_installation"
                estimatedCapacity: 10
                budget:
                  min: 800000
                  max: 1200000
                  currency: "PKR"
                timeline:
                  preferredStartDate: "2024-03-01"
                  expectedCompletion: "2024-04-15"
                  urgency: "medium"
                environmentalFactors:
                  averageSunlightHours: 8
                  seasonalVariations: "moderate"
      responses:
        '201':
          description: Site registered successfully

  /api/v1/sites/{siteId}/assess:
    post:
      summary: Conduct site assessment
      description: Complete technical assessment of potential site
      parameters:
        - name: siteId
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - assessmentType
                - findings
              properties:
                assessmentType:
                  type: string
                  enum: [initial_survey, detailed_assessment, feasibility_study, final_inspection]
                assessorId:
                  type: string
                assessmentDate:
                  type: string
                  format: date-time
                findings:
                  type: object
                  properties:
                    technicalFeasibility:
                      type: string
                      enum: [excellent, good, fair, poor, not_feasible]
                    structuralAssessment:
                      type: object
                      properties:
                        roofLoadCapacity:
                          type: number
                        structuralModifications:
                          type: boolean
                        foundationStrength:
                          type: string
                    electricalAssessment:
                      type: object
                      properties:
                        existingInfrastructure:
                          type: string
                        upgradesRequired:
                          type: array
                          items:
                            type: string
                        gridConnectionStatus:
                          type: string
                    solarPotential:
                      type: object
                      properties:
                        dailySolarIrradiance:
                          type: number
                        shadingAnalysis:
                          type: string
                        optimalPanelOrientation:
                          type: string
                        estimatedEnergyGeneration:
                          type: number
                    recommendations:
                      type: array
                      items:
                        type: object
                        properties:
                          category:
                            type: string
                          recommendation:
                            type: string
                          priority:
                            type: string
                            enum: [low, medium, high, critical]
                          estimatedCost:
                            type: number
                    riskFactors:
                      type: array
                      items:
                        type: object
                        properties:
                          riskType:
                            type: string
                          description:
                            type: string
                          severity:
                            type: string
                            enum: [low, medium, high, critical]
                          mitigation:
                            type: string
      responses:
        '200':
          description: Assessment completed successfully

  /api/v1/sites/{siteId}/prescribe:
    post:
      summary: Generate technical prescription
      description: Create detailed technical prescription based on assessment
      parameters:
        - name: siteId
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - prescriptionType
                - technicalSpecs
              properties:
                prescriptionType:
                  type: string
                  enum: [basic_prescription, detailed_design, custom_solution]
                prescribedBy:
                  type: string
                technicalSpecs:
                  type: object
                  properties:
                    systemCapacity:
                      type: number
                    panelSpecifications:
                      type: object
                      properties:
                        panelType:
                          type: string
                        panelWattage:
                          type: number
                        panelCount:
                          type: integer
                        panelBrand:
                          type: string
                    inverterSpecifications:
                      type: object
                      properties:
                        inverterType:
                          type: string
                        inverterCapacity:
                          type: number
                        inverterBrand:
                          type: string
                    mountingSystem:
                      type: object
                      properties:
                        mountingType:
                          type: string
                        railingSystem:
                          type: string
                        foundationRequirements:
                          type: string
                    electricalComponents:
                      type: array
                      items:
                        type: object
                        properties:
                          component:
                            type: string
                          specification:
                            type: string
                          quantity:
                            type: integer
                    estimatedCosts:
                      type: object
                      properties:
                        equipmentCost:
                          type: number
                        installationCost:
                          type: number
                        additionalCosts:
                          type: number
                        totalCost:
                          type: number
                    timeline:
                      type: object
                      properties:
                        procurementTime:
                          type: string
                        installationTime:
                          type: string
                        commissioningTime:
                          type: string
                        totalProjectTime:
                          type: string
      responses:
         '200':
           description: Prescription generated successfully
```

---

## Shared Services APIs

### 5. Workflow Management Service

#### Base URL
```
https://script.google.com/macros/s/{SCRIPT_ID}/exec/api/v1/workflows
```

#### Key Features
- **Multi-Entity Workflow Support**: Handles workflows for contractors, engineers, retailers, and sites
- **Step-by-Step Progression**: Manages workflow state transitions
- **Approval Mechanisms**: Built-in approval processes
- **Deadline Management**: Automatic deadline tracking and notifications
- **Audit Trail**: Complete workflow history tracking

#### OpenAPI Specification

```yaml
paths:
  /api/v1/workflows:
    get:
      summary: Get all workflows
      description: Retrieve workflows with optional filtering
      parameters:
        - name: entityType
          in: query
          schema:
            type: string
            enum: [contractor, engineer, retailer, site]
        - name: entityId
          in: query
          schema:
            type: string
        - name: status
          in: query
          schema:
            type: string
            enum: [active, completed, paused, cancelled]
        - name: workflowType
          in: query
          schema:
            type: string
      responses:
        '200':
          description: List of workflows

  /api/v1/workflows/{workflowId}/advance:
    post:
      summary: Advance workflow to next step
      description: Move workflow to the next step in the process
      parameters:
        - name: workflowId
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - action
              properties:
                action:
                  type: string
                notes:
                  type: string
                approvedBy:
                  type: string
                attachments:
                  type: array
                  items:
                    type: string
      responses:
        '200':
          description: Workflow advanced successfully
```

### 6. Notification Service

#### Base URL
```
https://script.google.com/macros/s/{SCRIPT_ID}/exec/api/v1/notifications
```

#### Key Features
- **Multi-Channel Support**: Email, WhatsApp, SMS, in-app notifications
- **Template Management**: Predefined notification templates
- **Delivery Tracking**: Track notification delivery status
- **Preference Management**: User notification preferences
- **Bulk Notifications**: Support for mass notifications

#### OpenAPI Specification

```yaml
paths:
  /api/v1/notifications/send:
    post:
      summary: Send notification
      description: Send notification via specified channels
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - recipients
                - message
                - channels
              properties:
                recipients:
                  type: array
                  items:
                    type: object
                    properties:
                      id:
                        type: string
                      type:
                        type: string
                        enum: [user, contractor, engineer, retailer]
                      contactInfo:
                        type: object
                message:
                  type: object
                  required:
                    - subject
                    - body
                  properties:
                    subject:
                      type: string
                    body:
                      type: string
                    template:
                      type: string
                    variables:
                      type: object
                channels:
                  type: array
                  items:
                    type: string
                    enum: [email, whatsapp, sms, in_app]
                priority:
                  type: string
                  enum: [low, medium, high, urgent]
                  default: medium
                scheduledAt:
                  type: string
                  format: date-time
      responses:
        '200':
          description: Notification sent successfully

  /api/v1/notifications/templates:
    get:
      summary: Get notification templates
      description: Retrieve available notification templates
      parameters:
        - name: category
          in: query
          schema:
            type: string
        - name: channel
          in: query
          schema:
            type: string
      responses:
        '200':
          description: List of notification templates
```

### 7. Document Management Service

#### Base URL
```
https://script.google.com/macros/s/{SCRIPT_ID}/exec/api/v1/documents
```

#### Key Features
- **Google Drive Integration**: Seamless file storage and retrieval
- **Document Generation**: Automated document creation from templates
- **Version Control**: Document versioning and history
- **Access Control**: Role-based document access
- **Bulk Operations**: Support for multiple document operations

#### OpenAPI Specification

```yaml
paths:
  /api/v1/documents/upload:
    post:
      summary: Upload document
      description: Upload document to Google Drive with metadata
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              required:
                - file
                - entityType
                - entityId
              properties:
                file:
                  type: string
                  format: binary
                entityType:
                  type: string
                  enum: [contractor, engineer, retailer, site]
                entityId:
                  type: string
                documentType:
                  type: string
                  enum: [identity, license, certificate, assessment, prescription, contract]
                description:
                  type: string
                tags:
                  type: array
                  items:
                    type: string
      responses:
        '201':
          description: Document uploaded successfully

  /api/v1/documents/generate:
    post:
      summary: Generate document from template
      description: Create document using predefined templates
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - templateId
                - data
              properties:
                templateId:
                  type: string
                data:
                  type: object
                outputFormat:
                  type: string
                  enum: [pdf, docx, xlsx]
                  default: pdf
                fileName:
                  type: string
      responses:
        '201':
          description: Document generated successfully
```

---

## GraphQL Schema Integration

### Core Type Definitions

```graphql
type Contractor {
  id: ID!
  registrationId: String!
  personalInfo: PersonalInfo!
  contactInfo: ContactInfo!
  businessInfo: BusinessInfo
  locationInfo: LocationInfo!
  workProfile: WorkProfile!
  verificationStatus: VerificationStatus!
  documents: [Document!]!
  workflowStatus: WorkflowStatus!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Engineer {
  id: ID!
  registrationId: String!
  personalInfo: PersonalInfo!
  contactInfo: ContactInfo!
  technicalProfile: TechnicalProfile!
  locationInfo: LocationInfo!
  verificationStatus: VerificationStatus!
  assignments: [Assignment!]!
  skills: [Skill!]!
  documents: [Document!]!
  workflowStatus: WorkflowStatus!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Retailer {
  id: ID!
  registrationId: String!
  businessInfo: RetailerBusinessInfo!
  contactInfo: ContactInfo!
  locationInfo: LocationInfo!
  salesInfo: SalesInfo!
  approvalStatus: ApprovalStatus!
  territory: Territory
  documents: [Document!]!
  workflowStatus: WorkflowStatus!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type PotentialSite {
  id: ID!
  registrationId: String!
  siteInfo: SiteInfo!
  customerInfo: CustomerInfo!
  requirements: SiteRequirements!
  assessments: [SiteAssessment!]!
  prescriptions: [TechnicalPrescription!]!
  assignedEngineers: [Engineer!]!
  workflowStatus: WorkflowStatus!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type WorkflowStatus {
  id: ID!
  entityType: EntityType!
  entityId: String!
  workflowType: String!
  currentStep: String!
  status: WorkflowStatusEnum!
  steps: [WorkflowStep!]!
  estimatedCompletion: DateTime
  actualCompletion: DateTime
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Event {
  id: ID!
  eventType: String!
  entityType: EntityType!
  entityId: String!
  data: JSON!
  timestamp: DateTime!
  source: String!
  processed: Boolean!
}

enum EntityType {
  CONTRACTOR
  ENGINEER
  RETAILER
  SITE
}

enum WorkflowStatusEnum {
  ACTIVE
  COMPLETED
  PAUSED
  CANCELLED
}
```

### Query Operations

```graphql
type Query {
  # Entity Queries
  contractor(id: ID!): Contractor
  contractors(filter: ContractorFilter, pagination: PaginationInput): ContractorConnection!
  
  engineer(id: ID!): Engineer
  engineers(filter: EngineerFilter, pagination: PaginationInput): EngineerConnection!
  
  retailer(id: ID!): Retailer
  retailers(filter: RetailerFilter, pagination: PaginationInput): RetailerConnection!
  
  site(id: ID!): PotentialSite
  sites(filter: SiteFilter, pagination: PaginationInput): SiteConnection!
  
  # Workflow Queries
  workflow(id: ID!): WorkflowStatus
  workflows(filter: WorkflowFilter, pagination: PaginationInput): WorkflowConnection!
  
  # Event Queries
  events(filter: EventFilter, pagination: PaginationInput): EventConnection!
  
  # Analytics Queries
  registrationStats(timeRange: TimeRangeInput): RegistrationStats!
  workflowMetrics(entityType: EntityType, timeRange: TimeRangeInput): WorkflowMetrics!
  territoryAnalytics(territoryId: ID!): TerritoryAnalytics!
}
```

### Mutation Operations

```graphql
type Mutation {
  # Contractor Mutations
  createContractor(input: CreateContractorInput!): ContractorPayload!
  updateContractor(id: ID!, input: UpdateContractorInput!): ContractorPayload!
  verifyContractor(id: ID!, input: VerificationInput!): VerificationPayload!
  
  # Engineer Mutations
  createEngineer(input: CreateEngineerInput!): EngineerPayload!
  updateEngineer(id: ID!, input: UpdateEngineerInput!): EngineerPayload!
  verifyEngineer(id: ID!, input: VerificationInput!): VerificationPayload!
  assignEngineer(id: ID!, input: AssignmentInput!): AssignmentPayload!
  
  # Retailer Mutations
  createRetailer(input: CreateRetailerInput!): RetailerPayload!
  updateRetailer(id: ID!, input: UpdateRetailerInput!): RetailerPayload!
  approveRetailer(id: ID!, input: ApprovalInput!): ApprovalPayload!
  
  # Site Mutations
  createSite(input: CreateSiteInput!): SitePayload!
  updateSite(id: ID!, input: UpdateSiteInput!): SitePayload!
  assessSite(id: ID!, input: AssessmentInput!): AssessmentPayload!
  prescribeSite(id: ID!, input: PrescriptionInput!): PrescriptionPayload!
  
  # Workflow Mutations
  advanceWorkflow(id: ID!, input: AdvanceWorkflowInput!): WorkflowPayload!
  pauseWorkflow(id: ID!, reason: String): WorkflowPayload!
  resumeWorkflow(id: ID!): WorkflowPayload!
  
  # Document Mutations
  uploadDocument(input: UploadDocumentInput!): DocumentPayload!
  generateDocument(input: GenerateDocumentInput!): DocumentPayload!
  
  # Notification Mutations
  sendNotification(input: SendNotificationInput!): NotificationPayload!
}
```

### Subscription Operations

```graphql
type Subscription {
  # Real-time Entity Updates
  contractorUpdated(id: ID): Contractor!
  engineerUpdated(id: ID): Engineer!
  retailerUpdated(id: ID): Retailer!
  siteUpdated(id: ID): PotentialSite!
  
  # Workflow Updates
  workflowStatusChanged(entityType: EntityType, entityId: ID): WorkflowStatus!
  
  # Event Stream
  eventPublished(eventTypes: [String!], entityTypes: [EntityType!]): Event!
  
  # Notification Updates
  notificationReceived(userId: ID!): Notification!
}
```

---

## Authentication & Authorization

### Google OAuth 2.0 Integration

```javascript
class AuthenticationService {
  constructor() {
    this.oauth2Service = OAuth2.createService('AnwarSalesSystem')
      .setAuthorizationBaseUrl('https://accounts.google.com/oauth2/auth')
      .setTokenUrl('https://oauth2.googleapis.com/token')
      .setClientId(PropertiesService.getScriptProperties().getProperty('GOOGLE_CLIENT_ID'))
      .setClientSecret(PropertiesService.getScriptProperties().getProperty('GOOGLE_CLIENT_SECRET'))
      .setCallbackFunction('authCallback')
      .setPropertyStore(PropertiesService.getUserProperties())
      .setScope('https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile');
  }

  getAuthorizationUrl() {
    return this.oauth2Service.getAuthorizationUrl();
  }

  handleCallback(request) {
    const authorized = this.oauth2Service.handleCallback(request);
    if (authorized) {
      const userInfo = this.getUserInfo();
      return this.createUserSession(userInfo);
    }
    throw new AuthenticationError('Authorization failed');
  }

  getUserInfo() {
    const response = UrlFetchApp.fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: 'Bearer ' + this.oauth2Service.getAccessToken()
      }
    });
    return JSON.parse(response.getContentText());
  }

  validateToken(token) {
    try {
      const response = UrlFetchApp.fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`);
      const tokenInfo = JSON.parse(response.getContentText());
      return tokenInfo.audience === PropertiesService.getScriptProperties().getProperty('GOOGLE_CLIENT_ID');
    } catch (error) {
      return false;
    }
  }
}
```

### Role-Based Access Control (RBAC)

```javascript
class AuthorizationService {
  constructor() {
    this.roles = {
      'admin': {
        permissions: ['*']
      },
      'bdo': {
        permissions: [
          'contractors:read', 'contractors:verify', 'contractors:approve',
          'engineers:read', 'engineers:verify', 'engineers:assign',
          'retailers:read', 'retailers:approve',
          'sites:read', 'sites:assign',
          'workflows:read', 'workflows:advance',
          'documents:read', 'documents:generate',
          'notifications:send'
        ]
      },
      'engineer': {
        permissions: [
          'sites:read', 'sites:assess', 'sites:prescribe',
          'contractors:read',
          'documents:read', 'documents:upload',
          'workflows:read'
        ]
      },
      'contractor': {
        permissions: [
          'profile:read', 'profile:update',
          'documents:read', 'documents:upload',
          'workflows:read'
        ]
      },
      'retailer': {
        permissions: [
          'profile:read', 'profile:update',
          'documents:read', 'documents:upload',
          'workflows:read',
          'territory:read'
        ]
      }
    };
  }

  hasPermission(userRole, permission) {
    const role = this.roles[userRole];
    if (!role) return false;
    
    return role.permissions.includes('*') || 
           role.permissions.includes(permission) ||
           role.permissions.some(p => p.endsWith(':*') && permission.startsWith(p.slice(0, -1)));
  }

  checkPermission(userRole, permission) {
    if (!this.hasPermission(userRole, permission)) {
      throw new AuthorizationError(`Insufficient permissions: ${permission}`);
    }
  }

  getUserRole(userEmail) {
    const userSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Users');
    const users = userSheet.getDataRange().getValues();
    
    for (let i = 1; i < users.length; i++) {
      if (users[i][1] === userEmail) { // Assuming email is in column B
        return users[i][2]; // Assuming role is in column C
      }
    }
    
    return 'guest'; // Default role
  }
}
```

---

## Error Handling Patterns

### Standardized Error Response Format

```javascript
class APIError extends Error {
  constructor(message, code, statusCode = 500, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
        timestamp: this.timestamp
      }
    };
  }
}

class ValidationError extends APIError {
  constructor(message, validationErrors = []) {
    super(message, 'VALIDATION_ERROR', 400, validationErrors);
  }
}

class AuthenticationError extends APIError {
  constructor(message = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401);
  }
}

class AuthorizationError extends APIError {
  constructor(message = 'Insufficient permissions') {
    super(message, 'AUTHORIZATION_ERROR', 403);
  }
}

class NotFoundError extends APIError {
  constructor(message = 'Resource not found') {
    super(message, 'NOT_FOUND', 404);
  }
}

class ConflictError extends APIError {
  constructor(message = 'Resource conflict') {
    super(message, 'CONFLICT', 409);
  }
}

class RateLimitError extends APIError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 'RATE_LIMIT_EXCEEDED', 429);
  }
}

// Global Error Handler
function handleError(error) {
  Logger.log('API Error: ' + error.toString());
  
  if (error instanceof APIError) {
    return ContentService
      .createTextOutput(JSON.stringify(error.toJSON()))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  // Handle unexpected errors
  const unexpectedError = new APIError(
    'Internal server error',
    'INTERNAL_ERROR',
    500,
    { originalError: error.toString() }
  );
  
  return ContentService
    .createTextOutput(JSON.stringify(unexpectedError.toJSON()))
    .setMimeType(ContentService.MimeType.JSON);
}
```

---

## Performance Guidelines

### Google Apps Script Optimization

1. **Batch Operations**: Use batch reads/writes for Google Sheets
2. **Caching Strategy**: Implement PropertiesService caching
3. **Async Processing**: Use triggers for long-running operations
4. **Rate Limiting**: Implement request throttling
5. **Memory Management**: Optimize object creation and disposal

### API Response Optimization

```javascript
class PerformanceOptimizer {
  static batchSheetOperations(operations) {
    const results = [];
    const batchSize = 100;
    
    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize);
      results.push(...this.executeBatch(batch));
    }
    
    return results;
  }
  
  static cacheResponse(key, data, ttl = 300) {
    const cache = CacheService.getScriptCache();
    cache.put(key, JSON.stringify(data), ttl);
  }
  
  static getCachedResponse(key) {
    const cache = CacheService.getScriptCache();
    const cached = cache.get(key);
    return cached ? JSON.parse(cached) : null;
  }
}
```

---

## API Testing Strategy

### Unit Testing Framework

```javascript
class APITestSuite {
  constructor() {
    this.tests = [];
    this.results = [];
  }
  
  addTest(name, testFunction) {
    this.tests.push({ name, testFunction });
  }
  
  runTests() {
    this.results = [];
    
    for (const test of this.tests) {
      try {
        test.testFunction();
        this.results.push({ name: test.name, status: 'PASSED' });
      } catch (error) {
        this.results.push({ 
          name: test.name, 
          status: 'FAILED', 
          error: error.message 
        });
      }
    }
    
    return this.results;
  }
}

// Example test cases
function runAPITests() {
  const testSuite = new APITestSuite();
  
  testSuite.addTest('Contractor Registration', () => {
    const service = new ContractorRegistrationService();
    const testData = {
      personalInfo: {
        firstName: 'Test',
        lastName: 'Contractor',
        cnic: '12345-6789012-3'
      },
      contactInfo: {
        email: 'test@example.com',
        phone: '+92-300-1234567'
      }
    };
    
    const result = service.createContractor(testData);
    if (!result.success) {
      throw new Error('Contractor registration failed');
    }
  });
  
  return testSuite.runTests();
}
```

---

## Conclusion

This API specification document provides a comprehensive foundation for the Anwar Sales Management System, ensuring:

- **Scalable Architecture**: Microservices-based design with clear separation of concerns
- **Robust Authentication**: Google OAuth 2.0 integration with RBAC
- **Event-Driven Communication**: Real-time updates and notifications
- **Performance Optimization**: Google Apps Script best practices
- **Comprehensive Testing**: Built-in testing framework
- **Error Handling**: Standardized error responses
- **Documentation**: Complete OpenAPI 3.0 specifications

The APIs are designed to support the full lifecycle of contractor, engineer, retailer, and site management while maintaining security, performance, and scalability requirements.
              example:
                success: true
                data:
                  id: "engineer_789012"
                  registrationId: "REG-ENG-2024-001"
                  status: "pending_technical_review"
                  workflowStatus:
                    currentStep: "technical_assessment"
                    estimatedCompletion: "2024-01-28T10:00:00Z"
                  createdAt: "2024-01-21T10:30:00Z"
                  nextSteps:
                    - "Technical review will be conducted within 72 hours"
                    - "You may be contacted for technical interview"
                events:
                  - eventType: "engineer.registration.submitted"
                    timestamp: "2024-01-21T10:30:00Z"

  /api/v1/engineers/{engineerId}/verify:
    post:
      summary: Multi-level engineer verification process
      description: Complete technical and administrative verification for engineer
      parameters:
        - name: engineerId
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - verificationType
                - verificationStatus
                - notes
              properties:
                verificationType:
                  type: string
                  enum: [technical_review, administrative_review, final_approval]
                verificationStatus:
                  type: string
                  enum: [approved, rejected, requires_interview, requires_additional_info]
                notes:
                  type: string
                technicalAssessment:
                  type: object
                  properties:
                    skillsVerified:
                      type: array
                      items:
                        type: object
                        properties:
                          skillName:
                            type: string
                          verifiedLevel:
                            type: string
                          assessorNotes:
                            type: string
                    certificationsVerified:
                      type: array
                      items:
                        type: object
                        properties:
                          certificationName:
                            type: string
                          verificationStatus:
                            type: string
                            enum: [verified, invalid, expired]
                    overallTechnicalRating:
                      type: integer
                      minimum: 1
                      maximum: 10
                interviewRequired:
                  type: boolean
                interviewDate:
                  type: string
                  format: date-time
                requiredDocuments:
                  type: array
                  items:
                    type: string
                followUpDate:
                  type: string
                  format: date-time
      responses:
        '200':
          description: Verification completed successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: object
                    properties:
                      verificationType:
                        type: string
                      verificationStatus:
                        type: string
                      verifiedBy:
                        type: string
                      verifiedAt:
                        type: string
                        format: date-time
                      technicalRating:
                        type: integer
                      nextSteps:
                        type: array
                        items:
                          type: string
                  events:
                    type: array
                    items:
                      type: object

  /api/v1/engineers/{engineerId}/assign:
    post:
      summary: Assign engineer to project
      description: Create project assignment for verified engineer
      parameters:
        - name: engineerId
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - projectId
                - role
                - startDate
              properties:
                projectId:
                  type: string
                role:
                  type: string
                startDate:
                  type: string
                  format: date
                endDate:
                  type: string
                  format: date
                workType:
                  type: string
                  enum: [full_time, part_time, contract]
                hourlyRate:
                  type: number
                responsibilities:
                  type: array
                  items:
                    type: string
                requiredSkills:
                  type: array
                  items:
                    type: string
      responses:
        '200':
          description: Engineer assigned successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: object
                    properties:
                      assignmentId:
                        type: string
                      engineerId:
                        type: string
                      projectId:
                        type: string
                      status:
                        type: string
                      assignedAt:
                        type: string
                        format: date-time
                  events:
                    type: array
                    items:
                      type: object