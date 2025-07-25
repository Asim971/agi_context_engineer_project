# Anwar Sales Management System - API Integration Guide

## Table of Contents
1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Authentication & Authorization](#authentication--authorization)
4. [RESTful API Integration](#restful-api-integration)
5. [GraphQL Integration](#graphql-integration)
6. [Event-Driven Architecture](#event-driven-architecture)
7. [WhatsApp Integration (MyTAPI)](#whatsapp-integration-mytapi)
8. [Google Sheets Data Access](#google-sheets-data-access)
9. [Error Handling](#error-handling)
10. [Rate Limiting & Performance](#rate-limiting--performance)
11. [Testing & Debugging](#testing--debugging)
12. [Best Practices](#best-practices)
13. [Code Examples](#code-examples)
14. [Troubleshooting](#troubleshooting)

## Overview

The Anwar Sales Management System provides a comprehensive API ecosystem built on Google Apps Script with Google Sheets as the primary database. This guide covers integration patterns for both RESTful APIs and GraphQL endpoints, along with event-driven communication and WhatsApp integration.

### Architecture Components
- **Runtime**: Google Apps Script
- **Database**: Google Sheets
- **API Styles**: RESTful + GraphQL
- **Messaging**: Event-driven architecture
- **WhatsApp**: MyTAPI integration
- **Authentication**: Google OAuth 2.0
- **Authorization**: Role-Based Access Control (RBAC)

## Getting Started

### Prerequisites
1. Google Cloud Project with Apps Script API enabled
2. OAuth 2.0 credentials configured
3. MyTAPI account for WhatsApp integration
4. Access to the system's Google Sheets database

### Base URLs
```
Production: https://script.google.com/macros/s/{SCRIPT_ID}/exec
Development: https://script.google.com/macros/d/{SCRIPT_ID}/dev
```

### Service Endpoints
```
Contractor Service: /api/v1/contractors
Engineer Service: /api/v1/engineers
Retailer Service: /api/v1/retailers
Site Service: /api/v1/sites
Workflow Service: /api/v1/workflows
Notification Service: /api/v1/notifications
Document Service: /api/v1/documents
GraphQL Endpoint: /api/graphql
```

## Authentication & Authorization

### Google OAuth 2.0 Setup

#### 1. Client Configuration
```javascript
const authConfig = {
  clientId: 'your-google-client-id',
  clientSecret: 'your-google-client-secret',
  redirectUri: 'your-redirect-uri',
  scope: [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/spreadsheets'
  ]
};
```

#### 2. Authorization Flow
```javascript
// Step 1: Redirect to Google OAuth
const authUrl = `https://accounts.google.com/oauth2/auth?` +
  `client_id=${authConfig.clientId}&` +
  `redirect_uri=${authConfig.redirectUri}&` +
  `scope=${authConfig.scope.join(' ')}&` +
  `response_type=code&` +
  `access_type=offline`;

// Step 2: Exchange code for tokens
const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    code: authorizationCode,
    client_id: authConfig.clientId,
    client_secret: authConfig.clientSecret,
    redirect_uri: authConfig.redirectUri,
    grant_type: 'authorization_code'
  })
});
```

#### 3. API Request Headers
```javascript
const headers = {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json',
  'X-API-Version': 'v1'
};
```

### Role-Based Access Control

#### Role Definitions
```javascript
const roles = {
  ADMIN: {
    permissions: ['*'],
    description: 'Full system access'
  },
  MANAGER: {
    permissions: [
      'contractors:read', 'contractors:write',
      'engineers:read', 'engineers:write',
      'retailers:read', 'retailers:write',
      'sites:read', 'sites:write',
      'workflows:read', 'workflows:write'
    ],
    description: 'Management operations'
  },
  ENGINEER: {
    permissions: [
      'sites:read', 'sites:assess',
      'assessments:write', 'prescriptions:write',
      'documents:read', 'documents:upload'
    ],
    description: 'Engineering operations'
  },
  CONTRACTOR: {
    permissions: [
      'profile:read', 'profile:write',
      'assignments:read', 'documents:upload'
    ],
    description: 'Contractor self-service'
  },
  RETAILER: {
    permissions: [
      'profile:read', 'profile:write',
      'sites:read', 'territory:read'
    ],
    description: 'Retailer operations'
  }
};
```

## RESTful API Integration

### Standard Request/Response Pattern

#### Request Structure
```javascript
const apiRequest = {
  method: 'POST',
  url: 'https://script.google.com/macros/s/{SCRIPT_ID}/exec/api/v1/contractors',
  headers: {
    'Authorization': 'Bearer {ACCESS_TOKEN}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    personalInfo: {
      firstName: 'John',
      lastName: 'Doe',
      cnic: '12345-6789012-3',
      dateOfBirth: '1990-01-01'
    },
    contactInfo: {
      email: 'john.doe@example.com',
      phone: '+92-300-1234567'
    }
    // ... additional fields
  })
};
```

#### Response Structure
```javascript
{
  "success": true,
  "data": {
    "id": "CONT-2024-001",
    "registrationId": "REG-CONT-001",
    "personalInfo": {
      "firstName": "John",
      "lastName": "Doe",
      "cnic": "12345-6789012-3"
    },
    "verificationStatus": {
      "status": "PENDING",
      "documents": []
    },
    "workflowStatus": {
      "currentStep": "DOCUMENT_UPLOAD",
      "status": "ACTIVE"
    }
  },
  "message": "Contractor registered successfully",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Service-Specific Integration

#### Contractor Service
```javascript
class ContractorService {
  constructor(baseUrl, accessToken) {
    this.baseUrl = baseUrl;
    this.headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
  }

  async registerContractor(contractorData) {
    const response = await fetch(`${this.baseUrl}/api/v1/contractors`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(contractorData)
    });
    return await response.json();
  }

  async getContractor(id) {
    const response = await fetch(`${this.baseUrl}/api/v1/contractors/${id}`, {
      method: 'GET',
      headers: this.headers
    });
    return await response.json();
  }

  async searchContractors(filters) {
    const queryParams = new URLSearchParams(filters);
    const response = await fetch(`${this.baseUrl}/api/v1/contractors/search?${queryParams}`, {
      method: 'GET',
      headers: this.headers
    });
    return await response.json();
  }

  async verifyContractor(id, verificationData) {
    const response = await fetch(`${this.baseUrl}/api/v1/contractors/${id}/verify`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(verificationData)
    });
    return await response.json();
  }
}
```

#### Site Assessment Integration
```javascript
class SiteAssessmentService {
  async createAssessment(siteId, assessmentData) {
    const response = await fetch(`${this.baseUrl}/api/v1/sites/${siteId}/assessments`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        engineerId: assessmentData.engineerId,
        technicalFindings: {
          roofCondition: assessmentData.roofCondition,
          roofArea: assessmentData.roofArea,
          roofOrientation: assessmentData.roofOrientation,
          shadingAnalysis: assessmentData.shadingAnalysis,
          structuralAssessment: assessmentData.structuralAssessment,
          electricalAssessment: assessmentData.electricalAssessment,
          gridConnection: assessmentData.gridConnection,
          accessibilityAssessment: assessmentData.accessibilityAssessment
        },
        recommendations: assessmentData.recommendations,
        photos: assessmentData.photos
      })
    });
    return await response.json();
  }

  async generatePrescription(assessmentId, prescriptionData) {
    const response = await fetch(`${this.baseUrl}/api/v1/assessments/${assessmentId}/prescription`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(prescriptionData)
    });
    return await response.json();
  }
}
```

## GraphQL Integration

### Client Setup
```javascript
class GraphQLClient {
  constructor(endpoint, accessToken) {
    this.endpoint = endpoint;
    this.headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
  }

  async query(query, variables = {}) {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        query,
        variables
      })
    });
    return await response.json();
  }

  async mutate(mutation, variables = {}) {
    return await this.query(mutation, variables);
  }

  subscribe(subscription, variables = {}) {
    // WebSocket implementation for subscriptions
    const ws = new WebSocket(`wss://your-websocket-endpoint`);
    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'start',
        payload: { query: subscription, variables }
      }));
    };
    return ws;
  }
}
```

### Query Examples
```javascript
// Get contractor with related data
const GET_CONTRACTOR = `
  query GetContractor($id: ID!) {
    contractor(id: $id) {
      id
      registrationId
      personalInfo {
        firstName
        lastName
        cnic
      }
      contactInfo {
        email
        phone
      }
      verificationStatus {
        status
        verificationDate
        documents {
          documentType
          status
        }
      }
      workflowStatus {
        currentStep
        status
        steps {
          stepName
          status
          completedAt
        }
      }
      assignments {
        id
        assignmentType
        status
        dueDate
      }
    }
  }
`;

// Search contractors with filters
const SEARCH_CONTRACTORS = `
  query SearchContractors($filter: ContractorFilter!, $pagination: PaginationInput) {
    contractors(filter: $filter, pagination: $pagination) {
      edges {
        node {
          id
          registrationId
          personalInfo {
            firstName
            lastName
          }
          locationInfo {
            district
            tehsil
          }
          workProfile {
            specializations
            experienceYears
          }
          verificationStatus {
            status
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;
```

### Mutation Examples
```javascript
// Create contractor
const CREATE_CONTRACTOR = `
  mutation CreateContractor($input: CreateContractorInput!) {
    createContractor(input: $input) {
      success
      contractor {
        id
        registrationId
        workflowStatus {
          currentStep
          status
        }
      }
      errors
      message
    }
  }
`;

// Verify contractor
const VERIFY_CONTRACTOR = `
  mutation VerifyContractor($id: ID!, $input: VerificationInput!) {
    verifyContractor(id: $id, input: $input) {
      success
      verificationStatus {
        status
        verificationDate
        verifiedBy
      }
      workflowStatus {
        currentStep
        status
      }
      errors
      message
    }
  }
`;
```

### Subscription Examples
```javascript
// Real-time workflow updates
const WORKFLOW_UPDATES = `
  subscription WorkflowUpdates($entityType: EntityType!, $entityId: ID!) {
    workflowStatusChanged(entityType: $entityType, entityId: $entityId) {
      id
      currentStep
      status
      steps {
        stepName
        status
        completedAt
      }
      updatedAt
    }
  }
`;

// Event stream
const EVENT_STREAM = `
  subscription EventStream($eventTypes: [String!], $entityTypes: [EntityType!]) {
    eventPublished(eventTypes: $eventTypes, entityTypes: $entityTypes) {
      id
      eventType
      entityType
      entityId
      data
      timestamp
      source
    }
  }
`;
```

## Event-Driven Architecture

### Event Publishing
```javascript
class EventPublisher {
  constructor(baseUrl, accessToken) {
    this.baseUrl = baseUrl;
    this.headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
  }

  async publishEvent(eventType, entityType, entityId, data) {
    const event = {
      eventType,
      entityType,
      entityId,
      data,
      timestamp: new Date().toISOString(),
      source: 'api-client'
    };

    const response = await fetch(`${this.baseUrl}/api/v1/events`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(event)
    });

    return await response.json();
  }
}

// Usage examples
const publisher = new EventPublisher(baseUrl, accessToken);

// Contractor registration event
await publisher.publishEvent(
  'contractor.registered',
  'CONTRACTOR',
  'CONT-2024-001',
  {
    registrationId: 'REG-CONT-001',
    personalInfo: { firstName: 'John', lastName: 'Doe' },
    location: { district: 'Lahore', tehsil: 'Model Town' }
  }
);

// Site assessment completed event
await publisher.publishEvent(
  'site.assessment.completed',
  'SITE',
  'SITE-2024-001',
  {
    assessmentId: 'ASSESS-001',
    engineerId: 'ENG-001',
    findings: { roofCondition: 'Good', systemCapacity: 5.0 }
  }
);
```

### Event Handling
```javascript
class EventHandler {
  constructor() {
    this.handlers = new Map();
  }

  on(eventType, handler) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType).push(handler);
  }

  async handle(event) {
    const handlers = this.handlers.get(event.eventType) || [];
    for (const handler of handlers) {
      try {
        await handler(event);
      } catch (error) {
        console.error(`Error handling event ${event.eventType}:`, error);
      }
    }
  }
}

// Event handler setup
const eventHandler = new EventHandler();

// Handle contractor registration
eventHandler.on('contractor.registered', async (event) => {
  console.log('New contractor registered:', event.data.registrationId);
  
  // Send welcome notification
  await notificationService.sendWelcomeMessage(
    event.entityId,
    event.data.personalInfo
  );
  
  // Create verification workflow
  await workflowService.createVerificationWorkflow(event.entityId);
});

// Handle site assessment completion
eventHandler.on('site.assessment.completed', async (event) => {
  console.log('Site assessment completed:', event.data.assessmentId);
  
  // Notify customer
  await notificationService.notifyCustomer(
    event.entityId,
    'assessment_completed',
    event.data
  );
  
  // Trigger prescription generation workflow
  await workflowService.triggerPrescriptionGeneration(
    event.data.assessmentId
  );
});
```

## WhatsApp Integration (MyTAPI)

### MyTAPI Client Setup
```javascript
class MyTAPIClient {
  constructor(apiKey, instanceId) {
    this.apiKey = apiKey;
    this.instanceId = instanceId;
    this.baseUrl = 'https://api.mytapi.com/v1';
  }

  async sendMessage(phoneNumber, message, type = 'text') {
    const response = await fetch(`${this.baseUrl}/instances/${this.instanceId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: phoneNumber,
        type: type,
        text: { body: message }
      })
    });
    return await response.json();
  }

  async sendTemplate(phoneNumber, templateName, parameters) {
    const response = await fetch(`${this.baseUrl}/instances/${this.instanceId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: phoneNumber,
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'en' },
          components: [{
            type: 'body',
            parameters: parameters
          }]
        }
      })
    });
    return await response.json();
  }

  async sendDocument(phoneNumber, documentUrl, caption) {
    const response = await fetch(`${this.baseUrl}/instances/${this.instanceId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: phoneNumber,
        type: 'document',
        document: {
          link: documentUrl,
          caption: caption
        }
      })
    });
    return await response.json();
  }
}
```

### WhatsApp Notification Service
```javascript
class WhatsAppNotificationService {
  constructor(myTAPIClient) {
    this.client = myTAPIClient;
    this.templates = {
      welcome_contractor: 'welcome_contractor_template',
      verification_complete: 'verification_complete_template',
      assessment_scheduled: 'assessment_scheduled_template',
      prescription_ready: 'prescription_ready_template'
    };
  }

  async sendWelcomeMessage(contractorId, personalInfo, contactInfo) {
    const message = `Welcome ${personalInfo.firstName}! Your contractor registration (ID: ${contractorId}) has been received. We'll notify you about the next steps.`;
    
    return await this.client.sendMessage(
      contactInfo.whatsappNumber || contactInfo.phone,
      message
    );
  }

  async notifyVerificationComplete(contractorId, personalInfo, contactInfo) {
    return await this.client.sendTemplate(
      contactInfo.whatsappNumber || contactInfo.phone,
      this.templates.verification_complete,
      [
        { type: 'text', text: personalInfo.firstName },
        { type: 'text', text: contractorId }
      ]
    );
  }

  async notifyAssessmentScheduled(siteId, customerInfo, engineerInfo, scheduledDate) {
    const message = `Your solar assessment for site ${siteId} has been scheduled for ${scheduledDate}. Engineer ${engineerInfo.name} will contact you soon.`;
    
    return await this.client.sendMessage(
      customerInfo.contactInfo.whatsappNumber || customerInfo.contactInfo.phone,
      message
    );
  }

  async sendPrescriptionDocument(siteId, customerInfo, prescriptionUrl) {
    return await this.client.sendDocument(
      customerInfo.contactInfo.whatsappNumber || customerInfo.contactInfo.phone,
      prescriptionUrl,
      `Your solar system prescription for site ${siteId} is ready!`
    );
  }
}
```

## Google Sheets Data Access

### Sheets Service Integration
```javascript
class SheetsService {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';
  }

  async getSheetData(spreadsheetId, range) {
    const response = await fetch(
      `${this.baseUrl}/${spreadsheetId}/values/${range}`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      }
    );
    return await response.json();
  }

  async appendData(spreadsheetId, range, values) {
    const response = await fetch(
      `${this.baseUrl}/${spreadsheetId}/values/${range}:append?valueInputOption=RAW`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          values: values
        })
      }
    );
    return await response.json();
  }

  async updateData(spreadsheetId, range, values) {
    const response = await fetch(
      `${this.baseUrl}/${spreadsheetId}/values/${range}?valueInputOption=RAW`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          values: values
        })
      }
    );
    return await response.json();
  }

  async batchUpdate(spreadsheetId, requests) {
    const response = await fetch(
      `${this.baseUrl}/${spreadsheetId}:batchUpdate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requests: requests
        })
      }
    );
    return await response.json();
  }
}
```

### Data Access Patterns
```javascript
class ContractorDataAccess {
  constructor(sheetsService, spreadsheetId) {
    this.sheets = sheetsService;
    this.spreadsheetId = spreadsheetId;
    this.contractorSheet = 'Contractors';
  }

  async createContractor(contractorData) {
    const row = [
      contractorData.id,
      contractorData.registrationId,
      contractorData.personalInfo.firstName,
      contractorData.personalInfo.lastName,
      contractorData.personalInfo.cnic,
      contractorData.contactInfo.email,
      contractorData.contactInfo.phone,
      contractorData.locationInfo.district,
      contractorData.locationInfo.tehsil,
      JSON.stringify(contractorData.workProfile),
      contractorData.verificationStatus.status,
      new Date().toISOString()
    ];

    return await this.sheets.appendData(
      this.spreadsheetId,
      `${this.contractorSheet}!A:L`,
      [row]
    );
  }

  async getContractor(id) {
    const data = await this.sheets.getSheetData(
      this.spreadsheetId,
      `${this.contractorSheet}!A:L`
    );

    const rows = data.values || [];
    const contractorRow = rows.find(row => row[0] === id);
    
    if (!contractorRow) {
      return null;
    }

    return {
      id: contractorRow[0],
      registrationId: contractorRow[1],
      personalInfo: {
        firstName: contractorRow[2],
        lastName: contractorRow[3],
        cnic: contractorRow[4]
      },
      contactInfo: {
        email: contractorRow[5],
        phone: contractorRow[6]
      },
      locationInfo: {
        district: contractorRow[7],
        tehsil: contractorRow[8]
      },
      workProfile: JSON.parse(contractorRow[9] || '{}'),
      verificationStatus: {
        status: contractorRow[10]
      },
      createdAt: contractorRow[11]
    };
  }

  async searchContractors(filters) {
    const data = await this.sheets.getSheetData(
      this.spreadsheetId,
      `${this.contractorSheet}!A:L`
    );

    const rows = data.values || [];
    const headers = rows[0] || [];
    const dataRows = rows.slice(1);

    let filteredRows = dataRows;

    // Apply filters
    if (filters.district) {
      filteredRows = filteredRows.filter(row => 
        row[7] && row[7].toLowerCase().includes(filters.district.toLowerCase())
      );
    }

    if (filters.verificationStatus) {
      filteredRows = filteredRows.filter(row => 
        row[10] === filters.verificationStatus
      );
    }

    // Convert to objects
    return filteredRows.map(row => ({
      id: row[0],
      registrationId: row[1],
      personalInfo: {
        firstName: row[2],
        lastName: row[3],
        cnic: row[4]
      },
      contactInfo: {
        email: row[5],
        phone: row[6]
      },
      locationInfo: {
        district: row[7],
        tehsil: row[8]
      },
      verificationStatus: {
        status: row[10]
      }
    }));
  }
}
```

## Error Handling

### Standard Error Response
```javascript
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "personalInfo.cnic",
      "issue": "CNIC format is invalid",
      "expected": "XXXXX-XXXXXXX-X"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "req-12345"
}
```

### Error Handling Client
```javascript
class APIErrorHandler {
  static handle(error, context = {}) {
    const errorMap = {
      400: 'Bad Request - Invalid input data',
      401: 'Unauthorized - Invalid or expired token',
      403: 'Forbidden - Insufficient permissions',
      404: 'Not Found - Resource does not exist',
      409: 'Conflict - Resource already exists',
      422: 'Unprocessable Entity - Validation failed',
      429: 'Too Many Requests - Rate limit exceeded',
      500: 'Internal Server Error - Server error occurred',
      502: 'Bad Gateway - Google Apps Script error',
      503: 'Service Unavailable - Service temporarily down'
    };

    const statusCode = error.status || error.response?.status;
    const message = errorMap[statusCode] || 'Unknown error occurred';

    console.error('API Error:', {
      status: statusCode,
      message: message,
      context: context,
      error: error
    });

    return {
      status: statusCode,
      message: message,
      retryable: [429, 500, 502, 503].includes(statusCode)
    };
  }

  static async withRetry(apiCall, maxRetries = 3, delay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await apiCall();
      } catch (error) {
        const errorInfo = this.handle(error, { attempt });
        
        if (!errorInfo.retryable || attempt === maxRetries) {
          throw error;
        }

        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }
}
```

## Rate Limiting & Performance

### Rate Limiting Implementation
```javascript
class RateLimiter {
  constructor(requestsPerMinute = 60) {
    this.requestsPerMinute = requestsPerMinute;
    this.requests = [];
  }

  async checkLimit() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Remove old requests
    this.requests = this.requests.filter(time => time > oneMinuteAgo);
    
    if (this.requests.length >= this.requestsPerMinute) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = oldestRequest + 60000 - now;
      
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return this.checkLimit();
      }
    }
    
    this.requests.push(now);
    return true;
  }
}

// Usage with API client
class RateLimitedAPIClient {
  constructor(baseUrl, accessToken, requestsPerMinute = 60) {
    this.baseUrl = baseUrl;
    this.accessToken = accessToken;
    this.rateLimiter = new RateLimiter(requestsPerMinute);
  }

  async request(endpoint, options = {}) {
    await this.rateLimiter.checkLimit();
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }
}
```

### Performance Optimization
```javascript
class PerformanceOptimizer {
  // Batch operations
  static async batchRequests(requests, batchSize = 10) {
    const results = [];
    
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(request => request().catch(error => ({ error })))
      );
      results.push(...batchResults);
    }
    
    return results;
  }

  // Cache implementation
  static createCache(ttlMs = 300000) { // 5 minutes default
    const cache = new Map();
    
    return {
      get(key) {
        const item = cache.get(key);
        if (!item) return null;
        
        if (Date.now() > item.expiry) {
          cache.delete(key);
          return null;
        }
        
        return item.value;
      },
      
      set(key, value) {
        cache.set(key, {
          value,
          expiry: Date.now() + ttlMs
        });
      },
      
      clear() {
        cache.clear();
      }
    };
  }

  // Debounced search
  static debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }
}
```

## Testing & Debugging

### Unit Testing Framework
```javascript
class APITestSuite {
  constructor(baseUrl, accessToken) {
    this.client = new APIClient(baseUrl, accessToken);
    this.testResults = [];
  }

  async runTest(testName, testFunction) {
    console.log(`Running test: ${testName}`);
    
    try {
      const startTime = Date.now();
      await testFunction();
      const duration = Date.now() - startTime;
      
      this.testResults.push({
        name: testName,
        status: 'PASSED',
        duration
      });
      
      console.log(`✅ ${testName} - PASSED (${duration}ms)`);
    } catch (error) {
      this.testResults.push({
        name: testName,
        status: 'FAILED',
        error: error.message
      });
      
      console.log(`❌ ${testName} - FAILED: ${error.message}`);
    }
  }

  async testContractorRegistration() {
    await this.runTest('Contractor Registration', async () => {
      const contractorData = {
        personalInfo: {
          firstName: 'Test',
          lastName: 'Contractor',
          cnic: '12345-6789012-3',
          dateOfBirth: '1990-01-01'
        },
        contactInfo: {
          email: 'test@example.com',
          phone: '+92-300-1234567'
        },
        locationInfo: {
          province: 'Punjab',
          district: 'Lahore',
          tehsil: 'Model Town',
          address: 'Test Address'
        },
        workProfile: {
          experienceYears: 5,
          specializations: ['SOLAR_INSTALLATION'],
          workingRadius: 50,
          availability: 'FULL_TIME'
        }
      };

      const response = await this.client.post('/api/v1/contractors', contractorData);
      
      if (!response.success) {
        throw new Error('Registration failed');
      }
      
      if (!response.data.id) {
        throw new Error('No contractor ID returned');
      }
    });
  }

  async testGraphQLQuery() {
    await this.runTest('GraphQL Contractor Query', async () => {
      const query = `
        query {
          contractors(pagination: { first: 5 }) {
            edges {
              node {
                id
                registrationId
                personalInfo {
                  firstName
                  lastName
                }
              }
            }
            totalCount
          }
        }
      `;

      const response = await this.client.graphql(query);
      
      if (response.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(response.errors)}`);
      }
      
      if (!response.data.contractors) {
        throw new Error('No contractors data returned');
      }
    });
  }

  generateReport() {
    const passed = this.testResults.filter(r => r.status === 'PASSED').length;
    const failed = this.testResults.filter(r => r.status === 'FAILED').length;
    
    console.log('\n=== Test Report ===');
    console.log(`Total Tests: ${this.testResults.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / this.testResults.length) * 100).toFixed(2)}%`);
    
    if (failed > 0) {
      console.log('\nFailed Tests:');
      this.testResults
        .filter(r => r.status === 'FAILED')
        .forEach(r => console.log(`- ${r.name}: ${r.error}`));
    }
  }
}
```

## Best Practices

### 1. Authentication & Security
- Always use HTTPS for API calls
- Implement token refresh logic
- Store tokens securely (not in localStorage)
- Validate user permissions before API calls
- Use API keys for server-to-server communication

### 2. Error Handling
- Implement comprehensive error handling
- Use exponential backoff for retries
- Log errors with context information
- Provide meaningful error messages to users
- Handle network timeouts gracefully

### 3. Performance
- Implement client-side caching
- Use pagination for large datasets
- Batch multiple operations when possible
- Implement request debouncing for search
- Monitor API response times

### 4. Data Management
- Validate data before sending to API
- Use consistent data formats
- Implement optimistic updates where appropriate
- Handle concurrent modifications
- Maintain data consistency across services

### 5. Integration Patterns
- Use event-driven architecture for loose coupling
- Implement circuit breakers for external services
- Use correlation IDs for request tracing
- Implement health checks for dependencies
- Design for eventual consistency

## Troubleshooting

### Common Issues

#### 1. Authentication Errors
```javascript
// Check token validity
const validateToken = async (token) => {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v1/tokeninfo', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};
```

#### 2. Rate Limiting
```javascript
// Handle rate limit responses
const handleRateLimit = (response) => {
  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After');
    const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 60000;
    
    return new Promise(resolve => {
      setTimeout(resolve, waitTime);
    });
  }
};
```

#### 3. Google Sheets Quota Limits
```javascript
// Monitor quota usage
const monitorQuota = {
  requestCount: 0,
  resetTime: Date.now() + 100000, // 100 seconds
  
  checkQuota() {
    if (Date.now() > this.resetTime) {
      this.requestCount = 0;
      this.resetTime = Date.now() + 100000;
    }
    
    if (this.requestCount >= 100) {
      throw new Error('Quota limit reached');
    }
    
    this.requestCount++;
  }
};
```

#### 4. Network Connectivity
```javascript
// Network status monitoring
const networkMonitor = {
  isOnline: navigator.onLine,
  
  init() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('Network connection restored');
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('Network connection lost');
    });
  },
  
  waitForConnection() {
    return new Promise(resolve => {
      if (this.isOnline) {
        resolve();
      } else {
        const checkConnection = () => {
          if (this.isOnline) {
            resolve();
          } else {
            setTimeout(checkConnection, 1000);
          }
        };
        checkConnection();
      }
    });
  }
};
```

### Debug Logging
```javascript
class APILogger {
  constructor(level = 'INFO') {
    this.level = level;
    this.levels = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
  }

  log(level, message, data = {}) {
    if (this.levels[level] >= this.levels[this.level]) {
      console.log(`[${new Date().toISOString()}] ${level}: ${message}`, data);
    }
  }

  debug(message, data) { this.log('DEBUG', message, data); }
  info(message, data) { this.log('INFO', message, data); }
  warn(message, data) { this.log('WARN', message, data); }
  error(message, data) { this.log('ERROR', message, data); }
}

// Usage
const logger = new APILogger('DEBUG');

// Log API requests
const loggedFetch = async (url, options) => {
  const requestId = Math.random().toString(36).substr(2, 9);
  
  logger.debug('API Request', {
    requestId,
    url,
    method: options.method || 'GET',
    headers: options.headers
  });
  
  try {
    const response = await fetch(url, options);
    
    logger.info('API Response', {
      requestId,
      status: response.status,
      statusText: response.statusText
    });
    
    return response;
  } catch (error) {
    logger.error('API Error', {
      requestId,
      error: error.message
    });
    throw error;
  }
};
```

This integration guide provides comprehensive coverage of all API integration patterns, authentication mechanisms, error handling strategies, and best practices for the Anwar Sales Management System. Use this guide as a reference for implementing robust integrations with the system's APIs.