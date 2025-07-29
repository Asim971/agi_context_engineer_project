# Database Directory

This directory contains the database service for the Anwar Sales Management System.

## `DatabaseService.js`

This is the core database abstraction layer, providing a single, consistent interface for all interactions with the Google Sheets database. It is implemented as an ES6 class, `DatabaseService`, which extends `BaseService`.

### Architectural Role

- **Abstraction Layer**: It completely abstracts the underlying `SpreadsheetApp` and `DriveApp` services. This means other parts of the application (like handlers) do not need to know the details of how data is stored and retrieved.
- **Single Responsibility**: Its sole responsibility is database operations (CRUD - Create, Read, Update, Delete).
- **Testability**: It includes a crucial feature for testing. When instantiated in a test environment (`new DatabaseService(true)`), it will automatically connect to a temporary test spreadsheet instead of the production one.

### Key Features & Methods

- **Dynamic Sheet Initialization**: Automatically creates sheets with the correct headers if they don't exist, ensuring the database structure is always correct.
- **`insertRecord(sheetName, data)`**: Inserts a new row of data into the specified sheet. The `data` is an object where keys match the header names.
- **`getAllRecords(sheetName)`**: Retrieves all records from a sheet as an array of objects.
- **`findRecord(sheetName, key, value)`**: Finds the first record in a sheet that matches a specific key-value pair.
- **`updateRecord(sheetName, key, value, newData)`**: Updates a specific record identified by a key-value pair with new data.
- **Header Management**: Provides utilities to get column indexes by name, which makes the code more readable and resilient to changes in column order.

### Usage

The `DatabaseService` is instantiated as a global singleton. All other services should access it via the `getGlobalDB()` function to ensure they are using the same database connection.

```javascript
// Correct way to get the database instance
const db = getGlobalDB();

// Example: Inserting a new engineer record
const engineerData = {
  'Timestamp': new Date(),
  'Name': 'Asim',
  'Phone': '1234567890',
  'Status': 'Pending'
};
db.insertRecord(Config.SHEETS.ENGINEER, engineerData);
```
  - [ ] Try-catch blocks for all database operations
  - [ ] Retry mechanisms for failed operations
  - [ ] Graceful degradation strategies
  - [ ] Comprehensive logging implementation
  - [ ] Transaction management with rollback

#### TASK-DB-003: Database Query Optimization
- **Category**: Enhancement
- **Priority**: High
- **Complexity**: Complex
- **Phase 1 Alignment**: Modern JS | Service Architecture
- **Description**: Optimize database queries and implement caching mechanisms
- **Requirements**:
  - Implement query result caching
  - Optimize batch operations for large datasets
  - Add query performance monitoring
  - Create efficient data filtering and sorting
  - Implement lazy loading for large datasets
- **Dependencies**: TASK-DB-001
- **Acceptance Criteria**:
  - [ ] Query result caching system
  - [ ] Optimized batch operations
  - [ ] Performance monitoring metrics
  - [ ] Efficient filtering and sorting algorithms
  - [ ] Lazy loading implementation

### Medium Priority Tasks

#### TASK-DB-004: Database Schema Management
- **Category**: Feature Development
- **Priority**: Medium
- **Complexity**: Complex
- **Phase 1 Alignment**: Service Architecture | Documentation
- **Description**: Implement database schema validation and migration capabilities
- **Requirements**:
  - Create schema definition and validation
  - Implement database migration scripts
  - Add schema versioning support
  - Create data integrity checks
  - Implement backup and restore functionality
- **Dependencies**: TASK-DB-001, TASK-DB-002
- **Acceptance Criteria**:
  - [ ] Schema validation system
  - [ ] Migration script framework
  - [ ] Schema versioning implementation
  - [ ] Data integrity validation
  - [ ] Backup and restore capabilities

#### TASK-DB-005: Database Testing Framework
- **Category**: Testing
- **Priority**: Medium
- **Complexity**: Moderate
- **Phase 1 Alignment**: Documentation | Modern JS
- **Description**: Create comprehensive testing framework for database operations
- **Requirements**:
  - Implement unit tests for all database methods
  - Create integration tests for sheet operations
  - Add performance testing for large datasets
  - Implement mock data generation
  - Create test data cleanup utilities
- **Dependencies**: TASK-DB-001
- **Acceptance Criteria**:
  - [ ] Complete unit test coverage
  - [ ] Integration test suite
  - [ ] Performance test benchmarks
  - [ ] Mock data generation tools
  - [ ] Test cleanup automation

#### TASK-DB-006: Database Documentation and API Reference
- **Category**: Documentation
- **Priority**: Medium
- **Complexity**: Simple
- **Phase 1 Alignment**: Documentation
- **Description**: Create comprehensive documentation for database service
- **Requirements**:
  - Document all database methods with JSDoc
  - Create API reference documentation
  - Add usage examples and best practices
  - Create troubleshooting guides
  - Document performance optimization tips
- **Dependencies**: TASK-DB-001, TASK-DB-002
- **Acceptance Criteria**:
  - [ ] Complete JSDoc documentation
  - [ ] API reference guide
  - [ ] Usage examples and tutorials
  - [ ] Troubleshooting documentation
  - [ ] Performance optimization guide

### Low Priority Tasks

#### TASK-DB-007: Advanced Database Features
- **Category**: Enhancement
- **Priority**: Low
- **Complexity**: Complex
- **Phase 1 Alignment**: Service Architecture | Modern JS
- **Description**: Implement advanced database features like indexing and relationships
- **Requirements**:
  - Create virtual indexing for faster queries
  - Implement relationship management between sheets
  - Add data aggregation and reporting functions
  - Create data export/import utilities
  - Implement data archiving capabilities
- **Dependencies**: TASK-DB-003, TASK-DB-004
- **Acceptance Criteria**:
  - [ ] Virtual indexing system
  - [ ] Relationship management
  - [ ] Aggregation and reporting tools
  - [ ] Export/import utilities
  - [ ] Data archiving system

#### TASK-DB-008: Database Monitoring and Analytics
- **Category**: Enhancement
- **Priority**: Low
- **Complexity**: Moderate
- **Phase 1 Alignment**: Service Architecture | Documentation
- **Description**: Implement database monitoring, analytics, and health checks
- **Requirements**:
  - Create database health monitoring
  - Implement usage analytics and reporting
  - Add performance metrics collection
  - Create alerting for database issues
  - Implement capacity planning tools
- **Dependencies**: TASK-DB-001, TASK-DB-002
- **Acceptance Criteria**:
  - [ ] Health monitoring dashboard
  - [ ] Usage analytics reports
  - [ ] Performance metrics collection
  - [ ] Automated alerting system
  - [ ] Capacity planning tools

## Implementation Guidelines

### Phase 1 Modernization Checklist
- [ ] Modern JavaScript features (ES6+ classes, async/await, destructuring)
- [ ] Comprehensive error handling with try-catch blocks
- [ ] Service-oriented architecture with clear interfaces
- [ ] Complete JSDoc documentation for all methods
- [ ] Modular, reusable code design
- [ ] Performance optimizations and caching
- [ ] User-friendly error messages and logging

### Quality Assurance
- All database operations must include comprehensive error handling
- Performance impact must be measured and optimized
- Data integrity must be maintained at all times
- All changes must include unit and integration tests
- Documentation must be updated with all modifications

### Security Considerations
- Implement proper data validation and sanitization
- Ensure secure handling of sensitive data
- Add audit logging for data modifications
- Implement access control and authorization

### Reference Documents
- **Task Analysis Template**: `/.agent-os/templates/task-analysis-prompt.md`
- **Code Standards**: `/.agent-os/code-standards.md`
- **Project Configuration**: `/.agent-os/project-config.md`