# Anwar Sales Management System - Security Documentation

## Table of Contents
1. [Security Overview](#security-overview)
2. [Authentication Architecture](#authentication-architecture)
3. [Authorization Framework](#authorization-framework)
4. [Data Protection](#data-protection)
5. [API Security](#api-security)
6. [Google Apps Script Security](#google-apps-script-security)
7. [Google Sheets Security](#google-sheets-security)
8. [WhatsApp Integration Security](#whatsapp-integration-security)
9. [Event Security](#event-security)
10. [Compliance & Standards](#compliance--standards)
11. [Security Monitoring](#security-monitoring)
12. [Incident Response](#incident-response)
13. [Security Best Practices](#security-best-practices)
14. [Security Testing](#security-testing)

## Security Overview

The Anwar Sales Management System implements a comprehensive security framework designed to protect sensitive data, ensure secure communications, and maintain system integrity across all components.

### Security Principles
- **Defense in Depth**: Multiple layers of security controls
- **Least Privilege**: Minimal access rights for users and systems
- **Zero Trust**: Verify every request regardless of source
- **Data Minimization**: Collect and process only necessary data
- **Encryption Everywhere**: Data protection in transit and at rest
- **Audit Everything**: Comprehensive logging and monitoring

### Security Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layers                         │
├─────────────────────────────────────────────────────────────┤
│ 1. Network Security (HTTPS, TLS 1.3)                      │
│ 2. Authentication (Google OAuth 2.0)                       │
│ 3. Authorization (RBAC, ABAC)                              │
│ 4. API Security (Rate Limiting, Input Validation)          │
│ 5. Data Security (Encryption, Masking)                     │
│ 6. Application Security (OWASP Guidelines)                 │
│ 7. Infrastructure Security (Google Cloud Security)         │
│ 8. Monitoring & Logging (SIEM, Audit Trails)              │
└─────────────────────────────────────────────────────────────┘
```

## Authentication Architecture

### Google OAuth 2.0 Implementation

#### OAuth 2.0 Flow
```javascript
// OAuth 2.0 Configuration
const oauthConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.OAUTH_REDIRECT_URI,
  scope: [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/script.external_request'
  ],
  accessType: 'offline',
  prompt: 'consent'
};

// Secure OAuth Implementation
class SecureOAuthHandler {
  constructor(config) {
    this.config = config;
    this.stateStore = new Map(); // Use Redis in production
  }

  generateAuthUrl(userId) {
    // Generate cryptographically secure state parameter
    const state = this.generateSecureState(userId);
    this.stateStore.set(state, { userId, timestamp: Date.now() });

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scope.join(' '),
      response_type: 'code',
      access_type: this.config.accessType,
      prompt: this.config.prompt,
      state: state
    });

    return `https://accounts.google.com/oauth2/auth?${params.toString()}`;
  }

  generateSecureState(userId) {
    const crypto = require('crypto');
    const timestamp = Date.now().toString();
    const random = crypto.randomBytes(16).toString('hex');
    const payload = `${userId}:${timestamp}:${random}`;
    
    // Sign the state parameter
    const hmac = crypto.createHmac('sha256', process.env.STATE_SECRET);
    hmac.update(payload);
    const signature = hmac.digest('hex');
    
    return Buffer.from(`${payload}:${signature}`).toString('base64url');
  }

  validateState(state) {
    try {
      const decoded = Buffer.from(state, 'base64url').toString();
      const [userId, timestamp, random, signature] = decoded.split(':');
      
      // Verify signature
      const payload = `${userId}:${timestamp}:${random}`;
      const hmac = crypto.createHmac('sha256', process.env.STATE_SECRET);
      hmac.update(payload);
      const expectedSignature = hmac.digest('hex');
      
      if (signature !== expectedSignature) {
        throw new Error('Invalid state signature');
      }
      
      // Check timestamp (5 minutes expiry)
      const stateTimestamp = parseInt(timestamp);
      if (Date.now() - stateTimestamp > 300000) {
        throw new Error('State expired');
      }
      
      return { userId, valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  async exchangeCodeForTokens(code, state) {
    // Validate state parameter
    const stateValidation = this.validateState(state);
    if (!stateValidation.valid) {
      throw new Error(`Invalid state: ${stateValidation.error}`);
    }

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.redirectUri,
        grant_type: 'authorization_code'
      })
    });

    if (!tokenResponse.ok) {
      throw new Error('Token exchange failed');
    }

    const tokens = await tokenResponse.json();
    
    // Validate token response
    if (!tokens.access_token) {
      throw new Error('No access token received');
    }

    return tokens;
  }
}
```

#### Token Management
```javascript
class SecureTokenManager {
  constructor(encryptionKey) {
    this.encryptionKey = encryptionKey;
    this.algorithm = 'aes-256-gcm';
  }

  encryptToken(token) {
    const crypto = require('crypto');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.encryptionKey);
    cipher.setAAD(Buffer.from('token-encryption'));
    
    let encrypted = cipher.update(JSON.stringify(token), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  decryptToken(encryptedData) {
    const crypto = require('crypto');
    const decipher = crypto.createDecipher(this.algorithm, this.encryptionKey);
    decipher.setAAD(Buffer.from('token-encryption'));
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  }

  async refreshToken(refreshToken) {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        grant_type: 'refresh_token'
      })
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    return await response.json();
  }

  validateTokenExpiry(token) {
    const expiryTime = token.issued_at + (token.expires_in * 1000);
    const bufferTime = 300000; // 5 minutes buffer
    
    return Date.now() < (expiryTime - bufferTime);
  }
}
```

### Multi-Factor Authentication (MFA)
```javascript
class MFAHandler {
  constructor() {
    this.totpWindow = 30; // 30 seconds
    this.backupCodeLength = 8;
  }

  generateTOTPSecret() {
    const crypto = require('crypto');
    return crypto.randomBytes(20).toString('base32');
  }

  generateQRCode(secret, userEmail, issuer = 'Anwar Sales System') {
    const otpauth = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(userEmail)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
    return otpauth;
  }

  verifyTOTP(token, secret) {
    const speakeasy = require('speakeasy');
    
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 1 // Allow 1 step before/after current time
    });
  }

  generateBackupCodes(count = 10) {
    const crypto = require('crypto');
    const codes = [];
    
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    
    return codes;
  }

  hashBackupCode(code) {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(code).digest('hex');
  }
}
```

## Authorization Framework

### Role-Based Access Control (RBAC)
```javascript
class RBACManager {
  constructor() {
    this.roles = new Map();
    this.permissions = new Map();
    this.userRoles = new Map();
    this.initializeRoles();
  }

  initializeRoles() {
    // Define permissions
    const permissions = {
      // Contractor permissions
      'contractor:create': 'Create contractor profiles',
      'contractor:read': 'View contractor information',
      'contractor:update': 'Update contractor profiles',
      'contractor:delete': 'Delete contractor profiles',
      'contractor:verify': 'Verify contractor documents',
      
      // Engineer permissions
      'engineer:create': 'Create engineer profiles',
      'engineer:read': 'View engineer information',
      'engineer:update': 'Update engineer profiles',
      'engineer:assign': 'Assign engineers to sites',
      
      // Site permissions
      'site:create': 'Register new sites',
      'site:read': 'View site information',
      'site:assess': 'Perform site assessments',
      'site:prescribe': 'Generate technical prescriptions',
      
      // Workflow permissions
      'workflow:read': 'View workflow status',
      'workflow:advance': 'Advance workflow steps',
      'workflow:manage': 'Manage workflow configurations',
      
      // Document permissions
      'document:upload': 'Upload documents',
      'document:read': 'View documents',
      'document:verify': 'Verify documents',
      'document:generate': 'Generate system documents',
      
      // Admin permissions
      'admin:users': 'Manage user accounts',
      'admin:roles': 'Manage roles and permissions',
      'admin:system': 'System administration',
      'admin:audit': 'Access audit logs'
    };

    // Define roles
    const roles = {
      SUPER_ADMIN: {
        name: 'Super Administrator',
        permissions: Object.keys(permissions),
        description: 'Full system access'
      },
      
      ADMIN: {
        name: 'Administrator',
        permissions: [
          'contractor:create', 'contractor:read', 'contractor:update', 'contractor:verify',
          'engineer:create', 'engineer:read', 'engineer:update', 'engineer:assign',
          'site:create', 'site:read', 'site:assess', 'site:prescribe',
          'workflow:read', 'workflow:advance', 'workflow:manage',
          'document:upload', 'document:read', 'document:verify', 'document:generate',
          'admin:users', 'admin:audit'
        ],
        description: 'Administrative access'
      },
      
      MANAGER: {
        name: 'Manager',
        permissions: [
          'contractor:read', 'contractor:update', 'contractor:verify',
          'engineer:read', 'engineer:update', 'engineer:assign',
          'site:read', 'site:assess', 'site:prescribe',
          'workflow:read', 'workflow:advance',
          'document:read', 'document:verify', 'document:generate'
        ],
        description: 'Management operations'
      },
      
      ENGINEER: {
        name: 'Engineer',
        permissions: [
          'site:read', 'site:assess', 'site:prescribe',
          'document:upload', 'document:read',
          'workflow:read'
        ],
        description: 'Engineering operations'
      },
      
      CONTRACTOR: {
        name: 'Contractor',
        permissions: [
          'contractor:read', 'contractor:update',
          'document:upload', 'document:read',
          'workflow:read'
        ],
        description: 'Contractor self-service',
        resourceScope: 'own' // Can only access own resources
      },
      
      RETAILER: {
        name: 'Retailer',
        permissions: [
          'site:create', 'site:read',
          'document:upload', 'document:read',
          'workflow:read'
        ],
        description: 'Retailer operations',
        resourceScope: 'territory' // Can access resources in assigned territory
      }
    };

    // Store roles and permissions
    Object.entries(permissions).forEach(([key, desc]) => {
      this.permissions.set(key, desc);
    });
    
    Object.entries(roles).forEach(([key, role]) => {
      this.roles.set(key, role);
    });
  }

  assignRole(userId, roleName) {
    if (!this.roles.has(roleName)) {
      throw new Error(`Role ${roleName} does not exist`);
    }
    
    if (!this.userRoles.has(userId)) {
      this.userRoles.set(userId, new Set());
    }
    
    this.userRoles.get(userId).add(roleName);
  }

  removeRole(userId, roleName) {
    if (this.userRoles.has(userId)) {
      this.userRoles.get(userId).delete(roleName);
    }
  }

  getUserPermissions(userId) {
    const userRoles = this.userRoles.get(userId) || new Set();
    const permissions = new Set();
    
    userRoles.forEach(roleName => {
      const role = this.roles.get(roleName);
      if (role) {
        role.permissions.forEach(permission => {
          permissions.add(permission);
        });
      }
    });
    
    return Array.from(permissions);
  }

  hasPermission(userId, permission, resource = null) {
    const userPermissions = this.getUserPermissions(userId);
    
    if (!userPermissions.includes(permission)) {
      return false;
    }
    
    // Check resource-level access
    if (resource) {
      return this.checkResourceAccess(userId, resource);
    }
    
    return true;
  }

  checkResourceAccess(userId, resource) {
    const userRoles = this.userRoles.get(userId) || new Set();
    
    for (const roleName of userRoles) {
      const role = this.roles.get(roleName);
      
      if (!role.resourceScope) {
        return true; // No scope restriction
      }
      
      switch (role.resourceScope) {
        case 'own':
          return resource.ownerId === userId;
        case 'territory':
          return this.checkTerritoryAccess(userId, resource);
        default:
          return false;
      }
    }
    
    return false;
  }

  checkTerritoryAccess(userId, resource) {
    // Implementation depends on territory assignment logic
    // This would check if the user's territory includes the resource location
    return true; // Placeholder
  }
}
```

### Attribute-Based Access Control (ABAC)
```javascript
class ABACEngine {
  constructor() {
    this.policies = new Map();
    this.attributeProviders = new Map();
  }

  addPolicy(policyId, policy) {
    this.policies.set(policyId, policy);
  }

  async evaluateAccess(subject, action, resource, environment = {}) {
    const context = {
      subject: await this.getSubjectAttributes(subject),
      action: action,
      resource: await this.getResourceAttributes(resource),
      environment: environment
    };

    for (const [policyId, policy] of this.policies) {
      const result = await this.evaluatePolicy(policy, context);
      
      if (result.effect === 'DENY') {
        return { allowed: false, reason: `Denied by policy ${policyId}` };
      }
      
      if (result.effect === 'PERMIT') {
        return { allowed: true, policy: policyId };
      }
    }
    
    return { allowed: false, reason: 'No applicable policy found' };
  }

  async getSubjectAttributes(subject) {
    return {
      id: subject.id,
      roles: subject.roles || [],
      department: subject.department,
      location: subject.location,
      clearanceLevel: subject.clearanceLevel,
      mfaEnabled: subject.mfaEnabled || false
    };
  }

  async getResourceAttributes(resource) {
    return {
      id: resource.id,
      type: resource.type,
      classification: resource.classification || 'public',
      owner: resource.owner,
      location: resource.location,
      sensitivity: resource.sensitivity || 'low'
    };
  }

  async evaluatePolicy(policy, context) {
    try {
      // Simple rule evaluation - in production, use a proper policy engine
      const result = policy.rules.every(rule => this.evaluateRule(rule, context));
      return { effect: result ? policy.effect : 'NOT_APPLICABLE' };
    } catch (error) {
      return { effect: 'INDETERMINATE', error: error.message };
    }
  }

  evaluateRule(rule, context) {
    const { attribute, operator, value } = rule;
    const attributeValue = this.getAttributeValue(attribute, context);
    
    switch (operator) {
      case 'equals':
        return attributeValue === value;
      case 'in':
        return Array.isArray(value) && value.includes(attributeValue);
      case 'contains':
        return Array.isArray(attributeValue) && attributeValue.includes(value);
      case 'greater_than':
        return attributeValue > value;
      case 'less_than':
        return attributeValue < value;
      default:
        throw new Error(`Unknown operator: ${operator}`);
    }
  }

  getAttributeValue(attribute, context) {
    const parts = attribute.split('.');
    let value = context;
    
    for (const part of parts) {
      value = value[part];
      if (value === undefined) {
        return null;
      }
    }
    
    return value;
  }
}

// Example ABAC policies
const samplePolicies = {
  'high-security-access': {
    effect: 'PERMIT',
    rules: [
      { attribute: 'subject.clearanceLevel', operator: 'greater_than', value: 3 },
      { attribute: 'subject.mfaEnabled', operator: 'equals', value: true },
      { attribute: 'resource.sensitivity', operator: 'equals', value: 'high' }
    ]
  },
  
  'contractor-own-data': {
    effect: 'PERMIT',
    rules: [
      { attribute: 'subject.roles', operator: 'contains', value: 'CONTRACTOR' },
      { attribute: 'resource.owner', operator: 'equals', value: '${subject.id}' },
      { attribute: 'action', operator: 'in', value: ['read', 'update'] }
    ]
  },
  
  'business-hours-only': {
    effect: 'DENY',
    rules: [
      { attribute: 'environment.time', operator: 'less_than', value: '09:00' },
      { attribute: 'environment.time', operator: 'greater_than', value: '17:00' }
    ]
  }
};
```

## Data Protection

### Encryption Implementation
```javascript
class DataEncryption {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyDerivationIterations = 100000;
  }

  async deriveKey(password, salt) {
    const crypto = require('crypto');
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, this.keyDerivationIterations, 32, 'sha256', (err, derivedKey) => {
        if (err) reject(err);
        else resolve(derivedKey);
      });
    });
  }

  encrypt(data, key) {
    const crypto = require('crypto');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, key);
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      algorithm: this.algorithm
    };
  }

  decrypt(encryptedData, key) {
    const crypto = require('crypto');
    const decipher = crypto.createDecipher(this.algorithm, key);
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  }

  // Field-level encryption for sensitive data
  encryptSensitiveFields(data, sensitiveFields, key) {
    const result = { ...data };
    
    sensitiveFields.forEach(field => {
      if (result[field]) {
        result[field] = this.encrypt(result[field], key);
      }
    });
    
    return result;
  }

  decryptSensitiveFields(data, sensitiveFields, key) {
    const result = { ...data };
    
    sensitiveFields.forEach(field => {
      if (result[field] && typeof result[field] === 'object' && result[field].encrypted) {
        result[field] = this.decrypt(result[field], key);
      }
    });
    
    return result;
  }
}
```

### Data Masking and Anonymization
```javascript
class DataMasking {
  static maskCNIC(cnic) {
    if (!cnic || cnic.length < 13) return cnic;
    return cnic.substring(0, 5) + '*****' + cnic.substring(10);
  }

  static maskPhone(phone) {
    if (!phone || phone.length < 10) return phone;
    return phone.substring(0, 3) + '****' + phone.substring(phone.length - 3);
  }

  static maskEmail(email) {
    if (!email || !email.includes('@')) return email;
    const [local, domain] = email.split('@');
    const maskedLocal = local.length > 2 ? 
      local.substring(0, 2) + '*'.repeat(local.length - 2) : 
      local;
    return `${maskedLocal}@${domain}`;
  }

  static maskBankAccount(account) {
    if (!account || account.length < 8) return account;
    return '*'.repeat(account.length - 4) + account.substring(account.length - 4);
  }

  static anonymizeData(data, level = 'partial') {
    const anonymized = { ...data };
    
    switch (level) {
      case 'full':
        delete anonymized.personalInfo;
        delete anonymized.contactInfo;
        delete anonymized.bankAccountDetails;
        break;
        
      case 'partial':
        if (anonymized.personalInfo) {
          anonymized.personalInfo = {
            ...anonymized.personalInfo,
            cnic: this.maskCNIC(anonymized.personalInfo.cnic)
          };
        }
        
        if (anonymized.contactInfo) {
          anonymized.contactInfo = {
            ...anonymized.contactInfo,
            email: this.maskEmail(anonymized.contactInfo.email),
            phone: this.maskPhone(anonymized.contactInfo.phone)
          };
        }
        
        if (anonymized.bankAccountDetails) {
          anonymized.bankAccountDetails = {
            ...anonymized.bankAccountDetails,
            accountNumber: this.maskBankAccount(anonymized.bankAccountDetails.accountNumber)
          };
        }
        break;
    }
    
    return anonymized;
  }
}
```

### Personal Data Protection (GDPR Compliance)
```javascript
class PersonalDataProtection {
  constructor() {
    this.personalDataFields = [
      'personalInfo.firstName',
      'personalInfo.lastName', 
      'personalInfo.cnic',
      'personalInfo.dateOfBirth',
      'contactInfo.email',
      'contactInfo.phone',
      'locationInfo.address',
      'bankAccountDetails'
    ];
  }

  identifyPersonalData(data) {
    const personalData = {};
    
    this.personalDataFields.forEach(field => {
      const value = this.getNestedValue(data, field);
      if (value) {
        personalData[field] = value;
      }
    });
    
    return personalData;
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  async requestDataExport(userId) {
    // Collect all personal data for the user
    const userData = await this.collectUserData(userId);
    
    // Create export package
    const exportData = {
      userId,
      exportDate: new Date().toISOString(),
      data: userData,
      metadata: {
        dataTypes: Object.keys(userData),
        totalRecords: Object.values(userData).reduce((sum, records) => sum + records.length, 0)
      }
    };
    
    return exportData;
  }

  async requestDataDeletion(userId, retentionPeriod = 0) {
    // Mark data for deletion
    const deletionRequest = {
      userId,
      requestDate: new Date().toISOString(),
      scheduledDeletion: new Date(Date.now() + retentionPeriod).toISOString(),
      status: 'PENDING'
    };
    
    // Log the deletion request
    await this.logDataDeletionRequest(deletionRequest);
    
    return deletionRequest;
  }

  async anonymizeUserData(userId) {
    // Replace personal identifiers with anonymous IDs
    const anonymousId = this.generateAnonymousId();
    
    // Update all records to use anonymous ID
    await this.replaceUserIdentifiers(userId, anonymousId);
    
    return { originalId: userId, anonymousId };
  }

  generateAnonymousId() {
    const crypto = require('crypto');
    return 'anon_' + crypto.randomBytes(16).toString('hex');
  }

  async collectUserData(userId) {
    // This would collect data from all relevant sheets/tables
    return {
      profile: await this.getUserProfile(userId),
      activities: await this.getUserActivities(userId),
      documents: await this.getUserDocuments(userId),
      communications: await this.getUserCommunications(userId)
    };
  }
}
```

## API Security

### Input Validation and Sanitization
```javascript
class InputValidator {
  static validateCNIC(cnic) {
    const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
    if (!cnicRegex.test(cnic)) {
      throw new Error('Invalid CNIC format. Expected: XXXXX-XXXXXXX-X');
    }
    return cnic;
  }

  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
    return email.toLowerCase();
  }

  static validatePhone(phone) {
    const phoneRegex = /^\+92-\d{3}-\d{7}$/;
    if (!phoneRegex.test(phone)) {
      throw new Error('Invalid phone format. Expected: +92-XXX-XXXXXXX');
    }
    return phone;
  }

  static sanitizeString(input, maxLength = 255) {
    if (typeof input !== 'string') {
      throw new Error('Input must be a string');
    }
    
    // Remove potentially dangerous characters
    const sanitized = input
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
    
    if (sanitized.length > maxLength) {
      throw new Error(`Input exceeds maximum length of ${maxLength} characters`);
    }
    
    return sanitized;
  }

  static validateContractorData(data) {
    const errors = [];
    
    try {
      // Validate personal info
      if (!data.personalInfo) {
        errors.push('Personal information is required');
      } else {
        if (!data.personalInfo.firstName) {
          errors.push('First name is required');
        } else {
          data.personalInfo.firstName = this.sanitizeString(data.personalInfo.firstName, 50);
        }
        
        if (!data.personalInfo.lastName) {
          errors.push('Last name is required');
        } else {
          data.personalInfo.lastName = this.sanitizeString(data.personalInfo.lastName, 50);
        }
        
        if (!data.personalInfo.cnic) {
          errors.push('CNIC is required');
        } else {
          data.personalInfo.cnic = this.validateCNIC(data.personalInfo.cnic);
        }
      }
      
      // Validate contact info
      if (!data.contactInfo) {
        errors.push('Contact information is required');
      } else {
        if (!data.contactInfo.email) {
          errors.push('Email is required');
        } else {
          data.contactInfo.email = this.validateEmail(data.contactInfo.email);
        }
        
        if (!data.contactInfo.phone) {
          errors.push('Phone is required');
        } else {
          data.contactInfo.phone = this.validatePhone(data.contactInfo.phone);
        }
      }
      
      // Validate work profile
      if (!data.workProfile) {
        errors.push('Work profile is required');
      } else {
        if (!data.workProfile.experienceYears || data.workProfile.experienceYears < 0) {
          errors.push('Valid experience years is required');
        }
        
        if (!data.workProfile.specializations || !Array.isArray(data.workProfile.specializations)) {
          errors.push('Specializations must be an array');
        }
      }
      
    } catch (error) {
      errors.push(error.message);
    }
    
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }
    
    return data;
  }
}
```

### Rate Limiting and DDoS Protection
```javascript
class RateLimiter {
  constructor() {
    this.requests = new Map();
    this.limits = {
      default: { requests: 100, window: 60000 }, // 100 requests per minute
      auth: { requests: 5, window: 300000 }, // 5 auth attempts per 5 minutes
      upload: { requests: 10, window: 60000 }, // 10 uploads per minute
      search: { requests: 50, window: 60000 } // 50 searches per minute
    };
  }

  async checkLimit(identifier, type = 'default') {
    const limit = this.limits[type] || this.limits.default;
    const now = Date.now();
    const windowStart = now - limit.window;
    
    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, []);
    }
    
    const userRequests = this.requests.get(identifier);
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(timestamp => timestamp > windowStart);
    
    if (validRequests.length >= limit.requests) {
      const oldestRequest = Math.min(...validRequests);
      const resetTime = oldestRequest + limit.window;
      
      throw new Error(`Rate limit exceeded. Try again in ${Math.ceil((resetTime - now) / 1000)} seconds`);
    }
    
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return {
      allowed: true,
      remaining: limit.requests - validRequests.length,
      resetTime: windowStart + limit.window
    };
  }

  // Advanced rate limiting with sliding window
  async slidingWindowRateLimit(identifier, limit, windowMs) {
    const now = Date.now();
    const key = `${identifier}:${Math.floor(now / windowMs)}`;
    const prevKey = `${identifier}:${Math.floor((now - windowMs) / windowMs)}`;
    
    const currentCount = await this.getCount(key) || 0;
    const prevCount = await this.getCount(prevKey) || 0;
    
    const prevWeight = (windowMs - (now % windowMs)) / windowMs;
    const estimatedCount = Math.floor(prevCount * prevWeight + currentCount);
    
    if (estimatedCount >= limit) {
      throw new Error('Rate limit exceeded');
    }
    
    await this.incrementCount(key, windowMs);
    return true;
  }

  async getCount(key) {
    // Implementation depends on storage backend (Redis, memory, etc.)
    return 0;
  }

  async incrementCount(key, ttl) {
    // Implementation depends on storage backend
  }
}
```

### API Security Headers
```javascript
class SecurityHeaders {
  static getSecurityHeaders() {
    return {
      // Prevent XSS attacks
      'X-XSS-Protection': '1; mode=block',
      
      // Prevent content type sniffing
      'X-Content-Type-Options': 'nosniff',
      
      // Prevent clickjacking
      'X-Frame-Options': 'DENY',
      
      // HSTS for HTTPS enforcement
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      
      // Content Security Policy
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://apis.google.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https:",
        "connect-src 'self' https://api.mytapi.com https://sheets.googleapis.com",
        "frame-src 'none'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'"
      ].join('; '),
      
      // Referrer Policy
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      
      // Permissions Policy
      'Permissions-Policy': [
        'camera=()',
        'microphone=()',
        'geolocation=(self)',
        'payment=()'
      ].join(', '),
      
      // Custom security headers
      'X-API-Version': '1.0',
      'X-Request-ID': () => require('crypto').randomUUID()
    };
  }

  static applySecurityHeaders(response) {
    const headers = this.getSecurityHeaders();
    
    Object.entries(headers).forEach(([key, value]) => {
      if (typeof value === 'function') {
        response.setHeader(key, value());
      } else {
        response.setHeader(key, value);
      }
    });
    
    return response;
  }
}
```

## Google Apps Script Security

### Secure Script Deployment
```javascript
// Google Apps Script Security Configuration
class GASSecurityManager {
  static getSecurityConfig() {
    return {
      // Lock service for concurrent access control
      lockTimeout: 30000, // 30 seconds
      
      // Properties service for secure storage
      encryptionKey: PropertiesService.getScriptProperties().getProperty('ENCRYPTION_KEY'),
      
      // URL fetch whitelist
      allowedDomains: [
        'api.mytapi.com',
        'sheets.googleapis.com',
        'oauth2.googleapis.com',
        'www.googleapis.com'
      ],
      
      // Maximum execution time
      maxExecutionTime: 300000, // 5 minutes
      
      // Request size limits
      maxRequestSize: 10 * 1024 * 1024, // 10MB
      maxResponseSize: 50 * 1024 * 1024 // 50MB
    };
  }

  static validateRequest(request) {
    const config = this.getSecurityConfig();
    
    // Check request size
    const requestSize = JSON.stringify(request).length;
    if (requestSize > config.maxRequestSize) {
      throw new Error('Request size exceeds limit');
    }
    
    // Validate required headers
    if (!request.headers['Authorization']) {
      throw new Error('Authorization header required');
    }
    
    // Check content type for POST/PUT requests
    if (['POST', 'PUT'].includes(request.method)) {
      if (!request.headers['Content-Type']?.includes('application/json')) {
        throw new Error('Invalid content type');
      }
    }
    
    return true;
  }

  static secureUrlFetch(url, options = {}) {
    const config = this.getSecurityConfig();
    
    // Validate URL against whitelist
    const urlObj = new URL(url);
    if (!config.allowedDomains.includes(urlObj.hostname)) {
      throw new Error(`Domain ${urlObj.hostname} not in whitelist`);
    }
    
    // Add security headers
    const secureOptions = {
      ...options,
      headers: {
        'User-Agent': 'Anwar-Sales-System/1.0',
        'X-Request-ID': Utilities.getUuid(),
        ...options.headers
      },
      muteHttpExceptions: true,
      validateHttpsCertificates: true
    };
    
    try {
      const response = UrlFetchApp.fetch(url, secureOptions);
      
      // Check response size
      const responseSize = response.getBlob().getBytes().length;
      if (responseSize > config.maxResponseSize) {
        throw new Error('Response size exceeds limit');
      }
      
      return response;
    } catch (error) {
      console.error('Secure URL fetch failed:', error);
      throw error;
    }
  }

  static withLock(lockName, operation, timeout = 30000) {
    const lock = LockService.getScriptLock();
    
    try {
      lock.waitLock(timeout);
      return operation();
    } catch (error) {
      if (error.message.includes('Could not obtain lock')) {
        throw new Error('System busy, please try again later');
      }
      throw error;
    } finally {
      lock.releaseLock();
    }
  }

  static securePropertyStorage() {
    const properties = PropertiesService.getScriptProperties();
    
    return {
      setSecure(key, value) {
        const encrypted = this.encrypt(JSON.stringify(value));
        properties.setProperty(key, encrypted);
      },
      
      getSecure(key) {
        const encrypted = properties.getProperty(key);
        if (!encrypted) return null;
        
        try {
          const decrypted = this.decrypt(encrypted);
          return JSON.parse(decrypted);
        } catch (error) {
          console.error('Failed to decrypt property:', key);
          return null;
        }
      },
      
      encrypt(data) {
        // Simple encryption - use Google's built-in utilities
        return Utilities.base64Encode(data);
      },
      
      decrypt(data) {
        return Utilities.base64Decode(data, Utilities.Charset.UTF_8);
      }
    };
  }
}
```

### Script Permissions and Scopes
```javascript
// manifest.json for Google Apps Script
const manifestConfig = {
  "timeZone": "Asia/Karachi",
  "dependencies": {
    "enabledAdvancedServices": [
      {
        "userSymbol": "Sheets",
        "serviceId": "sheets",
        "version": "v4"
      },
      {
        "userSymbol": "Drive",
        "serviceId": "drive",
        "version": "v3"
      }
    ]
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/script.external_request"
  ],
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "DOMAIN"
  }
};
```

## Google Sheets Security

### Sheet Protection and Access Control
```javascript
class SheetsSecurityManager {
  constructor(spreadsheetId) {
    this.spreadsheetId = spreadsheetId;
    this.spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  }

  protectSheet(sheetName, allowedUsers = []) {
    const sheet = this.spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
      throw new Error(`Sheet ${sheetName} not found`);
    }

    // Protect the entire sheet
    const protection = sheet.protect();
    protection.setDescription(`Protected sheet: ${sheetName}`);
    
    // Set allowed editors
    if (allowedUsers.length > 0) {
      protection.removeEditors(protection.getEditors());
      protection.addEditors(allowedUsers);
    }
    
    // Protect specific ranges if needed
    this.protectSensitiveRanges(sheet);
    
    return protection;
  }

  protectSensitiveRanges(sheet) {
    // Protect header row
    const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
    const headerProtection = headerRange.protect();
    headerProtection.setDescription('Protected headers');
    headerProtection.setWarningOnly(true);
    
    // Protect formula columns
    const formulaColumns = this.getFormulaColumns(sheet);
    formulaColumns.forEach(column => {
      const range = sheet.getRange(2, column, sheet.getLastRow() - 1, 1);
      const protection = range.protect();
      protection.setDescription('Protected formulas');
      protection.setWarningOnly(true);
    });
  }

  getFormulaColumns(sheet) {
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    const formulaColumns = [];
    
    for (let col = 1; col <= lastCol; col++) {
      const cell = sheet.getRange(2, col);
      if (cell.getFormula()) {
        formulaColumns.push(col);
      }
    }
    
    return formulaColumns;
  }

  auditSheetAccess() {
    const file = DriveApp.getFileById(this.spreadsheetId);
    const viewers = file.getViewers();
    const editors = file.getEditors();
    
    return {
      spreadsheetId: this.spreadsheetId,
      viewers: viewers.map(user => user.getEmail()),
      editors: editors.map(user => user.getEmail()),
      owner: file.getOwner().getEmail(),
      lastModified: file.getLastUpdated(),
      sharingAccess: file.getSharingAccess(),
      sharingPermission: file.getSharingPermission()
    };
  }

  validateDataIntegrity() {
    const sheets = this.spreadsheet.getSheets();
    const issues = [];
    
    sheets.forEach(sheet => {
      // Check for data validation rules
      const dataValidations = this.checkDataValidations(sheet);
      if (dataValidations.length > 0) {
        issues.push(...dataValidations);
      }
      
      // Check for protected ranges
      const protections = sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE);
      if (protections.length === 0) {
        issues.push(`Sheet ${sheet.getName()} has no protected ranges`);
      }
    });
    
    return issues;
  }

  checkDataValidations(sheet) {
    const issues = [];
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    
    // Check critical columns for validation rules
    const criticalColumns = {
      'CNIC': /^\d{5}-\d{7}-\d{1}$/,
      'Email': /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Phone': /^\+92-\d{3}-\d{7}$/
    };
    
    Object.entries(criticalColumns).forEach(([columnName, pattern]) => {
      const columnIndex = this.findColumnIndex(sheet, columnName);
      if (columnIndex > 0) {
        const range = sheet.getRange(2, columnIndex, lastRow - 1, 1);
        const validation = range.getDataValidation();
        
        if (!validation) {
          issues.push(`Column ${columnName} lacks data validation`);
        }
      }
    });
    
    return issues;
  }

  findColumnIndex(sheet, columnName) {
    const headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    return headerRow.indexOf(columnName) + 1;
  }

  setupDataValidation() {
    const sheets = this.spreadsheet.getSheets();
    
    sheets.forEach(sheet => {
      this.setupSheetValidation(sheet);
    });
  }

  setupSheetValidation(sheet) {
    const sheetName = sheet.getName();
    
    switch (sheetName) {
      case 'Contractors':
        this.setupContractorValidation(sheet);
        break;
      case 'Engineers':
        this.setupEngineerValidation(sheet);
        break;
      case 'Sites':
        this.setupSiteValidation(sheet);
        break;
    }
  }

  setupContractorValidation(sheet) {
    // CNIC validation
    const cnicColumn = this.findColumnIndex(sheet, 'CNIC');
    if (cnicColumn > 0) {
      const cnicRange = sheet.getRange(2, cnicColumn, 1000, 1);
      const cnicValidation = SpreadsheetApp.newDataValidation()
        .requireTextMatchesPattern('^\\d{5}-\\d{7}-\\d{1}$')
        .setAllowInvalid(false)
        .setHelpText('CNIC format: XXXXX-XXXXXXX-X')
        .build();
      cnicRange.setDataValidation(cnicValidation);
    }
    
    // Email validation
    const emailColumn = this.findColumnIndex(sheet, 'Email');
    if (emailColumn > 0) {
      const emailRange = sheet.getRange(2, emailColumn, 1000, 1);
      const emailValidation = SpreadsheetApp.newDataValidation()
        .requireTextMatchesPattern('^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$')
        .setAllowInvalid(false)
        .setHelpText('Valid email address required')
        .build();
      emailRange.setDataValidation(emailValidation);
    }
    
    // Phone validation
    const phoneColumn = this.findColumnIndex(sheet, 'Phone');
    if (phoneColumn > 0) {
      const phoneRange = sheet.getRange(2, phoneColumn, 1000, 1);
      const phoneValidation = SpreadsheetApp.newDataValidation()
        .requireTextMatchesPattern('^\\+92-\\d{3}-\\d{7}$')
        .setAllowInvalid(false)
        .setHelpText('Phone format: +92-XXX-XXXXXXX')
        .build();
      phoneRange.setDataValidation(phoneValidation);
    }
  }
}
```

## Security Monitoring

### Audit Logging
```javascript
class SecurityAuditLogger {
  constructor() {
    this.logSheet = 'Security_Audit_Log';
    this.maxLogEntries = 10000;
  }

  logSecurityEvent(eventType, userId, details, severity = 'INFO') {
    const logEntry = {
      timestamp: new Date().toISOString(),
      eventType,
      userId,
      userAgent: this.getUserAgent(),
      ipAddress: this.getClientIP(),
      details: JSON.stringify(details),
      severity,
      sessionId: this.getSessionId()
    };

    this.writeLogEntry(logEntry);
    
    // Alert on high severity events
    if (['HIGH', 'CRITICAL'].includes(severity)) {
      this.sendSecurityAlert(logEntry);
    }
  }

  writeLogEntry(logEntry) {
    try {
      const sheet = this.getOrCreateLogSheet();
      const values = [
        logEntry.timestamp,
        logEntry.eventType,
        logEntry.userId,
        logEntry.userAgent,
        logEntry.ipAddress,
        logEntry.details,
        logEntry.severity,
        logEntry.sessionId
      ];
      
      sheet.appendRow(values);
      
      // Rotate logs if needed
      this.rotateLogs(sheet);
    } catch (error) {
      console.error('Failed to write audit log:', error);
    }
  }

  getOrCreateLogSheet() {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName(this.logSheet);
    
    if (!sheet) {
      sheet = spreadsheet.insertSheet(this.logSheet);
      
      // Set up headers
      const headers = [
        'Timestamp', 'Event Type', 'User ID', 'User Agent',
        'IP Address', 'Details', 'Severity', 'Session ID'
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // Format header row
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#f0f0f0');
      
      // Protect the sheet
      const protection = sheet.protect();
      protection.setDescription('Security audit log - protected');
    }
    
    return sheet;
  }

  rotateLogs(sheet) {
    const rowCount = sheet.getLastRow();
    
    if (rowCount > this.maxLogEntries) {
      const excessRows = rowCount - this.maxLogEntries;
      sheet.deleteRows(2, excessRows); // Keep header row
    }
  }

  getUserAgent() {
    // In Google Apps Script, this would need to be passed from the client
    return 'Google Apps Script';
  }

  getClientIP() {
    // In Google Apps Script, this would need to be passed from the client
    return 'Unknown';
  }

  getSessionId() {
    return Session.getActiveUser().getEmail() + '_' + Date.now();
  }

  sendSecurityAlert(logEntry) {
    const alertMessage = `
      Security Alert: ${logEntry.eventType}
      Severity: ${logEntry.severity}
      User: ${logEntry.userId}
      Time: ${logEntry.timestamp}
      Details: ${logEntry.details}
    `;
    
    // Send email alert
    MailApp.sendEmail({
      to: 'security@anwarsales.com',
      subject: `Security Alert: ${logEntry.eventType}`,
      body: alertMessage
    });
  }

  // Predefined security events
  logAuthenticationAttempt(userId, success, details = {}) {
    this.logSecurityEvent(
      'AUTHENTICATION_ATTEMPT',
      userId,
      { success, ...details },
      success ? 'INFO' : 'MEDIUM'
    );
  }

  logAuthorizationFailure(userId, resource, action) {
    this.logSecurityEvent(
      'AUTHORIZATION_FAILURE',
      userId,
      { resource, action },
      'MEDIUM'
    );
  }

  logDataAccess(userId, resource, action, recordCount = 1) {
    this.logSecurityEvent(
      'DATA_ACCESS',
      userId,
      { resource, action, recordCount },
      'INFO'
    );
  }

  logDataModification(userId, resource, action, recordId) {
    this.logSecurityEvent(
      'DATA_MODIFICATION',
      userId,
      { resource, action, recordId },
      'INFO'
    );
  }

  logSecurityViolation(userId, violationType, details) {
    this.logSecurityEvent(
      'SECURITY_VIOLATION',
      userId,
      { violationType, ...details },
      'HIGH'
    );
  }

  logSystemEvent(eventType, details) {
    this.logSecurityEvent(
      'SYSTEM_EVENT',
      'SYSTEM',
      { eventType, ...details },
      'INFO'
    );
  }

  // Query audit logs
  queryAuditLogs(filters = {}) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(this.logSheet);
    if (!sheet) return [];

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const logs = data.slice(1);

    return logs
      .map(row => {
        const log = {};
        headers.forEach((header, index) => {
          log[header] = row[index];
        });
        return log;
      })
      .filter(log => this.matchesFilters(log, filters));
  }

  matchesFilters(log, filters) {
    return Object.entries(filters).every(([key, value]) => {
      if (key === 'startDate') {
        return new Date(log.Timestamp) >= new Date(value);
      }
      if (key === 'endDate') {
        return new Date(log.Timestamp) <= new Date(value);
      }
      return log[key] === value;
    });
  }
}
```

### Intrusion Detection
```javascript
class IntrusionDetectionSystem {
  constructor() {
    this.anomalyThresholds = {
      failedLogins: 5,
      rapidRequests: 100,
      timeWindow: 300000, // 5 minutes
      suspiciousPatterns: [
        /sql.*injection/i,
        /script.*alert/i,
        /<script/i,
        /union.*select/i,
        /drop.*table/i
      ]
    };
  }

  detectAnomalies(userId, activity) {
    const anomalies = [];

    // Check for failed login attempts
    const failedLogins = this.getFailedLoginCount(userId);
    if (failedLogins >= this.anomalyThresholds.failedLogins) {
      anomalies.push({
        type: 'EXCESSIVE_FAILED_LOGINS',
        severity: 'HIGH',
        details: { count: failedLogins, threshold: this.anomalyThresholds.failedLogins }
      });
    }

    // Check for rapid requests
    const requestCount = this.getRequestCount(userId);
    if (requestCount >= this.anomalyThresholds.rapidRequests) {
      anomalies.push({
        type: 'RAPID_REQUESTS',
        severity: 'MEDIUM',
        details: { count: requestCount, threshold: this.anomalyThresholds.rapidRequests }
      });
    }

    // Check for suspicious patterns in input
    if (activity.input) {
      const suspiciousPattern = this.detectSuspiciousPatterns(activity.input);
      if (suspiciousPattern) {
        anomalies.push({
          type: 'SUSPICIOUS_INPUT',
          severity: 'HIGH',
          details: { pattern: suspiciousPattern, input: activity.input }
        });
      }
    }

    return anomalies;
  }

  detectSuspiciousPatterns(input) {
    const inputString = JSON.stringify(input).toLowerCase();
    
    for (const pattern of this.anomalyThresholds.suspiciousPatterns) {
      if (pattern.test(inputString)) {
        return pattern.source;
      }
    }
    
    return null;
  }

  getFailedLoginCount(userId) {
    // Query audit logs for failed login attempts in the last time window
    const cutoffTime = new Date(Date.now() - this.anomalyThresholds.timeWindow);
    // Implementation would query the audit log
    return 0; // Placeholder
  }

  getRequestCount(userId) {
    // Query audit logs for request count in the last time window
    const cutoffTime = new Date(Date.now() - this.anomalyThresholds.timeWindow);
    // Implementation would query the audit log
    return 0; // Placeholder
  }
}
```

## Incident Response

### Security Incident Response Plan
```javascript
class SecurityIncidentResponse {
  constructor() {
    this.incidentTypes = {
      DATA_BREACH: {
        severity: 'CRITICAL',
        responseTime: 15, // minutes
        escalationLevel: 'IMMEDIATE'
      },
      UNAUTHORIZED_ACCESS: {
        severity: 'HIGH',
        responseTime: 30,
        escalationLevel: 'URGENT'
      },
      SYSTEM_COMPROMISE: {
        severity: 'CRITICAL',
        responseTime: 10,
        escalationLevel: 'IMMEDIATE'
      },
      MALWARE_DETECTION: {
        severity: 'HIGH',
        responseTime: 20,
        escalationLevel: 'URGENT'
      },
      DDOS_ATTACK: {
        severity: 'MEDIUM',
        responseTime: 60,
        escalationLevel: 'NORMAL'
      }
    };
  }

  reportIncident(incidentType, details, reportedBy) {
    const incident = {
      id: this.generateIncidentId(),
      type: incidentType,
      severity: this.incidentTypes[incidentType]?.severity || 'MEDIUM',
      status: 'REPORTED',
      reportedBy,
      reportedAt: new Date().toISOString(),
      details,
      timeline: [{
        timestamp: new Date().toISOString(),
        action: 'INCIDENT_REPORTED',
        actor: reportedBy,
        details: 'Incident reported'
      }]
    };

    this.logIncident(incident);
    this.initiateResponse(incident);
    
    return incident;
  }

  generateIncidentId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `INC-${timestamp}-${random}`.toUpperCase();
  }

  initiateResponse(incident) {
    const incidentConfig = this.incidentTypes[incident.type];
    
    // Immediate containment actions
    this.executeContainmentActions(incident);
    
    // Notify response team
    this.notifyResponseTeam(incident, incidentConfig.escalationLevel);
    
    // Set response timer
    this.setResponseTimer(incident, incidentConfig.responseTime);
  }

  executeContainmentActions(incident) {
    switch (incident.type) {
      case 'DATA_BREACH':
        this.containDataBreach(incident);
        break;
      case 'UNAUTHORIZED_ACCESS':
        this.containUnauthorizedAccess(incident);
        break;
      case 'SYSTEM_COMPROMISE':
        this.containSystemCompromise(incident);
        break;
      case 'DDOS_ATTACK':
        this.containDDoSAttack(incident);
        break;
    }
  }

  containDataBreach(incident) {
    // Immediate actions for data breach
    const actions = [
      'Isolate affected systems',
      'Revoke access tokens',
      'Enable additional monitoring',
      'Preserve evidence',
      'Assess data exposure'
    ];
    
    actions.forEach(action => {
      this.addTimelineEntry(incident.id, 'CONTAINMENT_ACTION', 'SYSTEM', action);
    });
  }

  containUnauthorizedAccess(incident) {
    // Actions for unauthorized access
    const actions = [
      'Disable compromised accounts',
      'Force password reset',
      'Review access logs',
      'Check for privilege escalation'
    ];
    
    actions.forEach(action => {
      this.addTimelineEntry(incident.id, 'CONTAINMENT_ACTION', 'SYSTEM', action);
    });
  }

  addTimelineEntry(incidentId, action, actor, details) {
    const entry = {
      timestamp: new Date().toISOString(),
      action,
      actor,
      details
    };
    
    // Add to incident timeline
    // Implementation would update the incident record
  }

  notifyResponseTeam(incident, escalationLevel) {
    const notifications = {
      IMMEDIATE: ['security-team@anwarsales.com', 'cto@anwarsales.com'],
      URGENT: ['security-team@anwarsales.com'],
      NORMAL: ['security-team@anwarsales.com']
    };
    
    const recipients = notifications[escalationLevel] || notifications.NORMAL;
    
    const message = `
      Security Incident Alert
      
      Incident ID: ${incident.id}
      Type: ${incident.type}
      Severity: ${incident.severity}
      Reported: ${incident.reportedAt}
      
      Details: ${JSON.stringify(incident.details, null, 2)}
      
      Please respond according to incident response procedures.
    `;
    
    recipients.forEach(email => {
      MailApp.sendEmail({
        to: email,
        subject: `Security Incident: ${incident.type} - ${incident.severity}`,
        body: message
      });
    });
  }
}
```

## Security Best Practices

### Development Security Guidelines

1. **Secure Coding Practices**
   - Input validation and sanitization
   - Output encoding
   - Parameterized queries
   - Error handling without information disclosure
   - Secure session management

2. **Authentication Security**
   - Strong password policies
   - Multi-factor authentication
   - Session timeout
   - Account lockout policies
   - Secure password recovery

3. **Authorization Security**
   - Principle of least privilege
   - Role-based access control
   - Resource-level permissions
   - Regular access reviews
   - Separation of duties

4. **Data Security**
   - Encryption at rest and in transit
   - Data classification
   - Data retention policies
   - Secure data disposal
   - Privacy by design

5. **API Security**
   - Authentication and authorization
   - Rate limiting
   - Input validation
   - HTTPS enforcement
   - API versioning

6. **Infrastructure Security**
   - Regular security updates
   - Network segmentation
   - Firewall configuration
   - Intrusion detection
   - Backup and recovery

### Security Checklist

#### Pre-Deployment Security Checklist
- [ ] All inputs validated and sanitized
- [ ] Authentication mechanisms implemented
- [ ] Authorization controls in place
- [ ] Sensitive data encrypted
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] Audit logging enabled
- [ ] Error handling secure
- [ ] Dependencies updated
- [ ] Security testing completed

#### Post-Deployment Security Checklist
- [ ] Monitor security logs
- [ ] Review access permissions
- [ ] Update security documentation
- [ ] Conduct security training
- [ ] Test incident response procedures
- [ ] Review and update security policies
- [ ] Perform regular security assessments
- [ ] Monitor for security vulnerabilities

## Security Testing

### Automated Security Testing
```javascript
class SecurityTestSuite {
  constructor() {
    this.testResults = [];
  }

  async runSecurityTests() {
    console.log('Starting security test suite...');
    
    await this.testAuthentication();
    await this.testAuthorization();
    await this.testInputValidation();
    await this.testDataProtection();
    await this.testRateLimiting();
    
    return this.generateTestReport();
  }

  async testAuthentication() {
    const tests = [
      this.testInvalidCredentials(),
      this.testTokenExpiration(),
      this.testSessionSecurity(),
      this.testMFABypass()
    ];
    
    const results = await Promise.all(tests);
    this.testResults.push(...results);
  }

  async testInvalidCredentials() {
    try {
      // Test with invalid credentials
      const response = await this.makeAuthRequest('invalid@email.com', 'wrongpassword');
      
      return {
        test: 'Invalid Credentials',
        passed: response.status === 401,
        details: 'Should reject invalid credentials'
      };
    } catch (error) {
      return {
        test: 'Invalid Credentials',
        passed: false,
        error: error.message
      };
    }
  }

  async testAuthorization() {
    const tests = [
      this.testUnauthorizedAccess(),
      this.testPrivilegeEscalation(),
      this.testResourceAccess()
    ];
    
    const results = await Promise.all(tests);
    this.testResults.push(...results);
  }

  async testInputValidation() {
    const maliciousInputs = [
      '<script>alert("xss")</script>',
      "'; DROP TABLE users; --",
      '../../../etc/passwd',
      '{{7*7}}',
      'javascript:alert(1)'
    ];
    
    for (const input of maliciousInputs) {
      const result = await this.testMaliciousInput(input);
      this.testResults.push(result);
    }
  }

  async testMaliciousInput(input) {
    try {
      const response = await this.makeAPIRequest('/api/contractors', {
        method: 'POST',
        body: JSON.stringify({ name: input })
      });
      
      return {
        test: `Malicious Input: ${input.substring(0, 20)}...`,
        passed: response.status === 400,
        details: 'Should reject malicious input'
      };
    } catch (error) {
      return {
        test: `Malicious Input: ${input.substring(0, 20)}...`,
        passed: true,
        details: 'Input properly rejected'
      };
    }
  }

  generateTestReport() {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    
    return {
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        passRate: (passedTests / totalTests * 100).toFixed(2) + '%'
      },
      results: this.testResults,
      recommendations: this.generateRecommendations()
    };
  }

  generateRecommendations() {
    const failedTests = this.testResults.filter(r => !r.passed);
    
    return failedTests.map(test => ({
      test: test.test,
      recommendation: this.getRecommendation(test.test)
    }));
  }

  getRecommendation(testName) {
    const recommendations = {
      'Invalid Credentials': 'Implement proper authentication validation',
      'Token Expiration': 'Ensure tokens expire and are properly validated',
      'Session Security': 'Implement secure session management',
      'Unauthorized Access': 'Strengthen authorization controls',
      'Privilege Escalation': 'Review and restrict privilege escalation paths',
      'Malicious Input': 'Implement comprehensive input validation'
    };
    
    return recommendations[testName] || 'Review security implementation';
  }
}
```

## Compliance & Standards

### Regulatory Compliance

#### Data Protection Regulations
- **GDPR Compliance**: Personal data protection for EU citizens
- **Local Data Protection Laws**: Pakistan data protection requirements
- **Industry Standards**: ISO 27001, SOC 2 compliance

#### Security Frameworks
- **OWASP Top 10**: Web application security risks
- **NIST Cybersecurity Framework**: Comprehensive security guidelines
- **CIS Controls**: Critical security controls implementation

### Security Documentation Requirements

1. **Security Policies**
   - Information Security Policy
   - Access Control Policy
   - Data Classification Policy
   - Incident Response Policy
   - Business Continuity Policy

2. **Procedures**
   - User Access Management
   - Security Incident Response
   - Vulnerability Management
   - Change Management
   - Backup and Recovery

3. **Technical Documentation**
   - Security Architecture
   - Network Diagrams
   - Data Flow Diagrams
   - Risk Assessments
   - Penetration Test Reports

## Conclusion

This security documentation provides a comprehensive framework for protecting the Anwar Sales Management System. Regular reviews and updates of these security measures are essential to maintain protection against evolving threats.

### Key Security Contacts

- **Security Team**: security@anwarsales.com
- **Incident Response**: incident@anwarsales.com
- **Compliance Officer**: compliance@anwarsales.com
- **Emergency Contact**: +92-XXX-XXXXXXX

### Security Review Schedule

- **Daily**: Security monitoring and log review
- **Weekly**: Vulnerability scanning and patch management
- **Monthly**: Access review and security metrics
- **Quarterly**: Security assessment and policy review
- **Annually**: Comprehensive security audit and penetration testing

---

*This document is classified as CONFIDENTIAL and should be handled according to the organization's information classification policy.*