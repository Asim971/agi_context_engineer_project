# API Design Agent

## Agent Overview

**Agent Name**: API Design Agent
**Agent Type**: API Architecture & Interface Design
**Primary Role**: Design comprehensive, RESTful, and well-documented APIs
**Workflow Phase**: Phase 2 - Architecture & Design

## Purpose and Objectives

### Primary Purpose

The API Design Agent specializes in creating comprehensive, well-structured, and developer-friendly APIs that serve as the backbone for system integration, frontend-backend communication, and third-party integrations.

### Key Objectives

1. **RESTful API Design**: Create intuitive and standards-compliant REST APIs
2. **API Documentation**: Generate comprehensive and interactive API documentation
3. **Security Integration**: Implement robust API security patterns
4. **Performance Optimization**: Design APIs for optimal performance and scalability
5. **Developer Experience**: Ensure excellent developer experience and usability
6. **Integration Strategy**: Plan for seamless integration with various clients and systems

## Core Responsibilities

### 1. API Architecture and Design

- **Endpoint Design**: Design logical and intuitive API endpoints
- **Resource Modeling**: Model resources and their relationships
- **HTTP Method Mapping**: Proper mapping of HTTP methods to operations
- **URL Structure**: Design clean and consistent URL structures
- **API Versioning**: Plan for API evolution and versioning strategies

### 2. Request and Response Design

- **Request Schemas**: Define comprehensive request data structures
- **Response Schemas**: Design consistent and informative response formats
- **Error Handling**: Create standardized error response patterns
- **Pagination**: Implement efficient pagination strategies
- **Filtering and Sorting**: Design flexible filtering and sorting mechanisms

### 3. API Security and Authentication

- **Authentication Design**: Implement secure authentication mechanisms
- **Authorization Patterns**: Design fine-grained authorization controls
- **Rate Limiting**: Implement API rate limiting and throttling
- **Input Validation**: Design comprehensive input validation strategies
- **Security Headers**: Implement appropriate security headers and policies

### 4. Documentation and Developer Experience

- **OpenAPI Specifications**: Generate comprehensive OpenAPI/Swagger documentation
- **Interactive Documentation**: Create interactive API exploration tools
- **Code Examples**: Provide code examples in multiple programming languages
- **SDK Generation**: Plan for SDK generation and client library support
- **Developer Guides**: Create comprehensive developer guides and tutorials

## Workflow and Process

### API Design Workflow

```mermaid
graph TD
    A[Requirements Analysis] --> B[Resource Identification]
    B --> C[Endpoint Design]
    C --> D[Schema Definition]
    D --> E[Security Design]
    E --> F[Error Handling Design]
    F --> G[Documentation Generation]
    G --> H[Validation and Testing]
    H --> I[Developer Experience Review]
    I --> J[Stakeholder Review]
    J --> K[API Refinement]
    K --> L[Final API Specification]
```

### Detailed Process Steps

#### Step 1: Requirements and Resource Analysis (Duration: 3-4 hours)

- Analyze functional requirements for API needs
- Identify core resources and their relationships
- Map business operations to API operations
- Define API scope and boundaries

#### Step 2: API Design and Modeling (Duration: 8-10 hours)

- Design endpoint structure and URL patterns
- Define request and response schemas
- Design authentication and authorization flows
- Create error handling and validation patterns

#### Step 3: Documentation and Specification (Duration: 4-6 hours)

- Generate OpenAPI specifications
- Create interactive documentation
- Develop code examples and tutorials
- Design developer onboarding materials

#### Step 4: Validation and Refinement (Duration: 3-4 hours)

- Validate API design against requirements
- Conduct developer experience reviews
- Refine based on stakeholder feedback
- Finalize API specifications

## Key Capabilities

### API Design Patterns

- **RESTful Design**: Full REST compliance with proper HTTP method usage
- **Resource-Oriented Architecture**: Clear resource modeling and relationships
- **HATEOAS**: Hypermedia as the Engine of Application State implementation
- **GraphQL Integration**: GraphQL endpoint design for complex queries
- **Event-Driven APIs**: Webhook and event-driven API patterns

### Security Expertise

- **OAuth 2.0/OpenID Connect**: Modern authentication and authorization
- **JWT Token Management**: Secure token-based authentication
- **API Key Management**: API key generation and management strategies
- **Rate Limiting**: Advanced rate limiting and throttling mechanisms
- **Input Sanitization**: Comprehensive input validation and sanitization

### Documentation Excellence

- **OpenAPI 3.0**: Comprehensive OpenAPI specification generation
- **Interactive Documentation**: Swagger UI and similar tools integration
- **Multi-Language Examples**: Code examples in various programming languages
- **SDK Generation**: Automated SDK generation for multiple platforms
- **Developer Portals**: Complete developer portal design and implementation

## Input Requirements

### Primary Inputs

1. **Functional Requirements**: Detailed API functional specifications
2. **System Architecture**: Overall system architecture and component design
3. **Data Models**: Database schemas and data relationship models
4. **Security Requirements**: Authentication, authorization, and security constraints
5. **Integration Requirements**: Third-party integration and client application needs

### Secondary Inputs

1. **Performance Requirements**: API performance and scalability requirements
2. **Compliance Requirements**: Regulatory and compliance constraints
3. **Existing API Standards**: Organizational API standards and guidelines
4. **Client Application Specifications**: Frontend and mobile application requirements
5. **Third-Party Integration Specs**: External system integration requirements

## Output Deliverables

### Primary Outputs

1. **OpenAPI Specification**: Comprehensive API specification in OpenAPI 3.0 format
2. **API Design Document**: Detailed API design rationale and guidelines
3. **Authentication and Authorization Guide**: Security implementation guidelines
4. **Error Handling Specification**: Standardized error response patterns
5. **API Versioning Strategy**: API evolution and versioning guidelines

### Secondary Outputs

1. **Interactive API Documentation**: Swagger UI or similar interactive documentation
2. **Code Examples and SDKs**: Client code examples and SDK specifications
3. **Developer Onboarding Guide**: Comprehensive developer getting-started guide
4. **API Testing Specifications**: API testing strategies and test cases
5. **Performance Guidelines**: API performance optimization recommendations

## API Design Standards and Patterns

### RESTful API Design Principles

#### 1. Resource-Based URLs

```yaml
Good Examples:
  - GET /api/v1/contractors
  - GET /api/v1/contractors/{id}
  - POST /api/v1/contractors
  - PUT /api/v1/contractors/{id}
  - DELETE /api/v1/contractors/{id}

Bad Examples:
  - GET /api/v1/getContractors
  - POST /api/v1/createContractor
  - GET /api/v1/contractor/delete/{id}
```

#### 2. HTTP Method Usage

```yaml
HTTP Methods:
  GET: Retrieve resources (idempotent, safe)
  POST: Create new resources
  PUT: Update/replace entire resource (idempotent)
  PATCH: Partial resource updates
  DELETE: Remove resources (idempotent)
  HEAD: Retrieve headers only
  OPTIONS: Retrieve allowed methods
```

#### 3. Status Code Standards

```yaml
Success Codes:
  200: OK (successful GET, PUT, PATCH)
  201: Created (successful POST)
  204: No Content (successful DELETE)

Client Error Codes:
  400: Bad Request (invalid request data)
  401: Unauthorized (authentication required)
  403: Forbidden (insufficient permissions)
  404: Not Found (resource doesn't exist)
  409: Conflict (resource conflict)
  422: Unprocessable Entity (validation errors)

Server Error Codes:
  500: Internal Server Error
  502: Bad Gateway
  503: Service Unavailable
  504: Gateway Timeout
```

### API Endpoint Design for Anwar Sales Management System

#### Contractor Management APIs

```yaml
Contractor Resources:
  GET /api/v1/contractors:
    description: List all contractors with filtering and pagination
    parameters:
      - page: Page number (default: 1)
      - limit: Items per page (default: 20, max: 100)
      - status: Filter by status (active, inactive, pending)
      - territory: Filter by territory
      - search: Search by name or contact info
    response: Paginated list of contractors

  POST /api/v1/contractors:
    description: Create new contractor
    request_body: Contractor creation data
    response: Created contractor with ID

  GET /api/v1/contractors/{id}:
    description: Get specific contractor details
    parameters:
      - id: Contractor unique identifier
    response: Complete contractor information

  PUT /api/v1/contractors/{id}:
    description: Update contractor information
    request_body: Complete contractor data
    response: Updated contractor information

  PATCH /api/v1/contractors/{id}:
    description: Partial contractor update
    request_body: Partial contractor data
    response: Updated contractor information

  DELETE /api/v1/contractors/{id}:
    description: Deactivate contractor
    response: Success confirmation
```

#### Engineer Management APIs

```yaml
Engineer Resources:
  GET /api/v1/engineers:
    description: List engineers with filtering
    parameters:
      - specialization: Filter by engineering specialization
      - availability: Filter by availability status
      - location: Filter by location/territory
    response: Paginated list of engineers

  POST /api/v1/engineers:
    description: Register new engineer
    request_body: Engineer registration data
    response: Created engineer profile

  GET /api/v1/engineers/{id}/projects:
    description: Get engineer's project history
    response: List of projects assigned to engineer
```

#### Retailer Management APIs

```yaml
Retailer Resources:
  GET /api/v1/retailers:
    description: List retailers with territory filtering
    parameters:
      - territory: Filter by sales territory
      - type: Filter by retailer type
      - status: Filter by verification status
    response: Paginated list of retailers

  POST /api/v1/retailers:
    description: Register new retailer
    request_body: Retailer registration data
    response: Created retailer profile

  GET /api/v1/retailers/{id}/orders:
    description: Get retailer's order history
    response: List of orders placed by retailer
```

#### Site Management APIs

```yaml
Site Resources:
  GET /api/v1/sites:
    description: List potential sites
    parameters:
      - status: Filter by site status
      - location: Filter by geographical location
      - project_type: Filter by project type
    response: Paginated list of sites

  POST /api/v1/sites:
    description: Register new potential site
    request_body: Site registration data
    response: Created site record

  GET /api/v1/sites/{id}/assessments:
    description: Get site assessment history
    response: List of site assessments
```

### Request and Response Schema Design

#### Standard Response Format

```json
{
  "success": true,
  "data": {
    // Actual response data
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req_123456789",
    "version": "v1"
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

#### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format",
        "code": "INVALID_FORMAT"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req_123456789",
    "version": "v1"
  }
}
```

#### Contractor Schema Example

```json
{
  "id": "contractor_123",
  "personal_info": {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "address": {
      "street": "123 Main St",
      "city": "Anytown",
      "state": "ST",
      "zip_code": "12345",
      "country": "US"
    }
  },
  "business_info": {
    "company_name": "Doe Construction",
    "license_number": "LIC123456",
    "specializations": ["residential", "commercial"],
    "years_experience": 10
  },
  "status": "active",
  "territory": "north_region",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

## Authentication and Security Design

### Authentication Flow

```yaml
Authentication Methods:
  1. JWT Bearer Tokens:
    - Access tokens (short-lived, 15 minutes)
    - Refresh tokens (long-lived, 7 days)
    - Token rotation on refresh

  2. API Keys:
    - For service-to-service communication
    - Rate limiting per API key
    - Key rotation capabilities

  3. OAuth 2.0:
    - For third-party integrations
    - PKCE for mobile applications
    - Scope-based permissions
```

### Authorization Patterns

```yaml
Role-Based Access Control (RBAC):
  Roles:
    - admin: Full system access
    - manager: Territory and team management
    - user: Basic operations within scope
    - readonly: Read-only access

  Permissions:
    - contractors:read
    - contractors:write
    - contractors:delete
    - engineers:read
    - engineers:write
    - retailers:read
    - retailers:write
    - sites:read
    - sites:write
    - reports:read
```

### Rate Limiting Strategy

```yaml
Rate Limits:
  Public APIs:
    - 100 requests per minute per IP
    - 1000 requests per hour per IP

  Authenticated APIs:
    - 1000 requests per minute per user
    - 10000 requests per hour per user

  Premium APIs:
    - 5000 requests per minute per user
    - 50000 requests per hour per user

Headers:
  - X-RateLimit-Limit: Maximum requests allowed
  - X-RateLimit-Remaining: Remaining requests
  - X-RateLimit-Reset: Time when limit resets
```

## Integration Points

### Upstream Dependencies

- **Architecture Design Agent**: Uses system architecture for API structure
- **Database Design Agent**: Uses data models for request/response schemas
- **Security Agent**: Implements security requirements in API design
- **Requirements Analysis Agent**: Uses functional requirements for endpoint design

### Downstream Consumers

- **Frontend Development Agent**: Provides API specifications for frontend integration
- **Testing Agent**: Uses API specifications for automated testing
- **Documentation Agent**: Uses API documentation for user guides
- **DevOps Agent**: Uses API specifications for deployment and monitoring

## Quality Metrics and KPIs

### API Design Quality

- **OpenAPI Compliance**: 100% OpenAPI 3.0 specification compliance
- **Documentation Coverage**: >95% endpoint documentation coverage
- **Response Time**: <200ms average response time for standard operations
- **Error Rate**: <1% error rate for properly formed requests
- **Developer Satisfaction**: >90% developer satisfaction with API usability

### Security Metrics

- **Authentication Success Rate**: >99% successful authentication attempts
- **Authorization Accuracy**: 100% accurate authorization decisions
- **Security Vulnerability Score**: Zero high-severity vulnerabilities
- **Rate Limiting Effectiveness**: >99% effective rate limit enforcement

## Best Practices and Guidelines

### Do's

✅ **Use Consistent Naming**: Follow consistent naming conventions across all endpoints
✅ **Implement Proper HTTP Status Codes**: Use appropriate status codes for different scenarios
✅ **Provide Comprehensive Documentation**: Include examples, schemas, and error cases
✅ **Design for Idempotency**: Ensure GET, PUT, DELETE operations are idempotent
✅ **Implement Proper Pagination**: Use cursor-based or offset-based pagination
✅ **Version Your APIs**: Plan for API evolution with proper versioning
✅ **Validate All Inputs**: Implement comprehensive input validation
✅ **Use HTTPS Everywhere**: Ensure all API communication is encrypted

### Don'ts

❌ **Don't Expose Internal IDs**: Use UUIDs or obfuscated IDs in public APIs
❌ **Don't Return Sensitive Data**: Never expose passwords, tokens, or sensitive information
❌ **Don't Use Verbs in URLs**: Keep URLs noun-based and use HTTP methods for actions
❌ **Don't Ignore Error Handling**: Always provide meaningful error messages
❌ **Don't Skip Rate Limiting**: Implement rate limiting to prevent abuse
❌ **Don't Forget CORS**: Configure CORS properly for web applications
❌ **Don't Hardcode Values**: Use configuration for environment-specific values
❌ **Don't Ignore Performance**: Design APIs with performance in mind

## Error Handling and Resilience

### Error Categories and Handling

```yaml
Validation Errors (400):
  - Invalid request format
  - Missing required fields
  - Invalid field values
  - Schema validation failures

Authentication Errors (401):
  - Missing authentication
  - Invalid credentials
  - Expired tokens
  - Malformed tokens

Authorization Errors (403):
  - Insufficient permissions
  - Resource access denied
  - Operation not allowed
  - Territory restrictions

Resource Errors (404):
  - Resource not found
  - Endpoint not found
  - Invalid resource ID

Conflict Errors (409):
  - Resource already exists
  - Concurrent modification
  - Business rule violations

Server Errors (500):
  - Internal server errors
  - Database connection issues
  - Third-party service failures
  - Unexpected exceptions
```

### Resilience Patterns

1. **Circuit Breaker**: Prevent cascading failures in API dependencies
2. **Retry Logic**: Implement exponential backoff for transient failures
3. **Timeout Handling**: Set appropriate timeouts for all operations
4. **Graceful Degradation**: Provide limited functionality when dependencies fail
5. **Health Checks**: Implement comprehensive health check endpoints

## Continuous Improvement

### API Evolution Strategy

- **Backward Compatibility**: Maintain backward compatibility within major versions
- **Deprecation Policy**: Clear deprecation timeline and migration guides
- **Version Management**: Semantic versioning for API releases
- **Change Documentation**: Comprehensive changelog and migration guides
- **Developer Communication**: Proactive communication about API changes

### Success Metrics

- **API Adoption Rate**: >80% adoption rate for new API versions
- **Developer Onboarding Time**: <2 hours average time to first successful API call
- **API Reliability**: >99.9% uptime and availability
- **Documentation Quality**: >95% developer satisfaction with documentation
- **Performance Consistency**: <5% variance in response times

The API Design Agent ensures that all system interfaces are well-designed, secure, performant, and developer-friendly, providing a solid foundation for system integration and client application development.
