# Copilot Instructions - Anwar Sales Management System (v2.0)

## Project Architecture Overview

This is a **Google Apps Script-based sales ecosystem** built on a modern, robust, and service-oriented architecture (SOA). The system consolidates multiple registration workflows into a unified platform, using Google Sheets as the database and integrating with external APIs for notifications.

### Key Architectural Patterns

- **Service-Oriented Architecture (SOA)**: The entire system is built around a set of single-responsibility services. A foundational `BaseService.js` provides core functionalities like structured logging and centralized error handling to all other services.
- **Class-Based Services**: All modules in `src/services/`, `src/handlers/`, and `src/database/` are implemented as ES6 classes, promoting code reusability and maintainability.
- **Centralized Routing**: `src/handlers/MainHandler.js` acts as the central router for all `doGet`, `onFormSubmit`, and `onEdit` events, delegating tasks to specific handlers using a service map.
- **Configuration as a Service**: `src/services/ConfigurationService.js` abstracts `PropertiesService`, providing a clean, testable interface for managing environment variables and application settings.
- **Robust Error Handling**: `src/services/ErrorHandlerService.js` and a custom `AppScriptError` class provide consistent, detailed error reporting across the application.
- **Structured Logging**: `src/services/LoggerService.js` generates detailed, queryable JSON logs for effective debugging and monitoring.

## Essential Development Patterns

### Event Handling Flow

```javascript
// MainHandler routes events to specific handlers, which are class instances.
// Example: src/handlers/MainHandler.js
function onFormSubmit(e) {
  mainHandlerInstance.handleFormSubmit(e);
}

// Inside MainHandler class:
handleFormSubmit(e) {
  const formId = e.source.getId();
  const formName = this.configService.getFormNameById(formId); // Reverse lookup
  
  if (this.serviceMap[formName]) {
    this.serviceMap[formName].onFormSubmit(e);
  } else {
    this.logger.error(`No handler found for form ID: ${formId}`);
  }
}
```

### Database Operations

```javascript
// Use the global DatabaseService instance. It's a class extending BaseService.
const db = getGlobalDB();
const data = { /* ... */ };
const record = db.insertRecord(Config.SHEETS.ENGINEER, data);
const allRecords = db.getAllRecords(Config.SHEETS.ENGINEER);
```

### Environment & Configuration

```javascript
// Use the ConfigurationService singleton for all settings.
const apiKey = ConfigurationService.get('MAYTAPI_API_KEY');
const isTest = ConfigurationService.isTestEnvironment();

// In a service class (extending BaseService):
const apiKey = this.configService.get('MAYTAPI_API_KEY');
```

## Critical Integration Points

### WhatsApp Notifications

- `WhatsAppService` is a class-based service.
- Use `WhatsAppService.sendMessage(phone, message)` for all notifications.
- The service handles API key management and error handling internally.

### Sheet Structure & ID Generation

- Headers are defined in `src/config/Config.js`.
- `IdService.js` manages unique ID generation. It now uses `LockService` to prevent race conditions and ensure ID uniqueness during concurrent executions.

## Development Workflow

### Setup Commands

```bash
# Deploy to Google Apps Script
clasp push

# View structured JSON logs
clasp logs --json

# Open project in browser
clasp open
```

### Testing Strategy

The testing strategy relies on a dedicated, class-based `TestEnvironmentService`.

- **Isolation**: It creates a temporary, timestamped folder and spreadsheet in Google Drive for each test run.
- **Lifecycle Management**:
  - `TestEnvironmentService.setup()`: Creates the test folder/spreadsheet, initializes all sheets with headers, and sets the `IS_TEST_ENVIRONMENT` flag.
  - `TestEnvironmentService.teardown()`: Deletes the test folder and clears all test-related script properties.
- **Usage**: Call these methods from a dedicated test function in `Code.gs`.

## Essential Workflows

### 1. Adding a New Registration Form

1. **Update Config**: Add the new form's ID and sheet configuration to `src/config/Config.js`.
2. **Create Handler Class**: Create a new handler file (e.g., `src/handlers/NewFormHandler.js`). The handler must be a class that extends `BaseService`.
    ```javascript
    class NewFormHandler extends BaseService {
      constructor() {
        super();
        this.db = getGlobalDB();
        this.validationService = new ValidationService(Config.VALIDATION_RULES.NEW_FORM);
      }

      onFormSubmit(e) {
        this.executeWithErrorHandling(() => {
          // 1. Extract and validate data
          // 2. Store in database via this.db
          // 3. Send notifications via WhatsAppService
        });
      }
    }
    ```
3. **Register Handler**: In `src/handlers/MainHandler.js`, instantiate your new handler and add it to the `serviceMap`.
    ```javascript
    // In MainHandler constructor:
    this.serviceMap = {
      [Config.FORM_NAMES.ENGINEER]: new EngineerHandler(),
      [Config.FORM_NAMES.RETAILER]: new RetailerHandler(),
      [Config.FORM_NAMES.NEW_FORM]: new NewFormHandler() // Add new handler here
    };
    ```

### 2. Registration Approval Workflow

The logic remains in the `onEdit` function but is now routed through `MainHandler` to the specific handler for the sheet being edited.

```javascript
// src/handlers/MainHandler.js
handleEdit(e) {
  const sheetName = e.source.getActiveSheet().getName();
  const handler = this.findHandlerBySheet(sheetName); // Logic to map sheet to handler
  if (handler && typeof handler.onEdit === 'function') {
    handler.onEdit(e);
  }
}

// src/handlers/EngineerHandler.js
onEdit(e) {
  this.executeWithErrorHandling(() => {
    const range = e.range;
    const sheet = range.getSheet();
    const row = range.getRow();
    const status = sheet.getRange(row, this.db.getColumnName('Status')).getValue();

    if (status === 'Approved') {
      const id = IdService.getNextId('ENGINEER');
      // ... update sheet, send notification ...
    }
  });
}
```

## Debugging and Monitoring

- **Structured Logs**: Check `clasp logs --json` to see detailed, queryable JSON logs. This is the primary way to debug.
- **Error Handling**: All operations within services are wrapped in `executeWithErrorHandling` or `executeWithErrorHandlingSync`. This ensures that any failure is caught, logged with rich context by `ErrorHandlerService`, and handled gracefully.
- **System Health Check**: Run the `healthCheck()` function in `Code.gs` to get a status report of all core services and configurations.

## File Organization

- **`src/services/`**: Contains all business logic and integration services (e.g., `WhatsAppService`, `IdService`, `ValidationService`). All are ES6 classes extending `BaseService`.
- **`src/handlers/`**: Contains handlers for specific forms and sheet events (e.g., `EngineerHandler`). All are ES6 classes extending `BaseService`.
- **`src/database/`**: Contains the `DatabaseService.js` class, the sole interface for Google Sheets operations.
- **`src/config/`**: Contains the static `Config.js` file.
- **`src/Code.gs`**: Main entry point containing global function definitions (`doGet`, `onEdit`, etc.) and service initializations.


## Critical Integration Points

### WhatsApp Notifications
- `WhatsAppService` is a class-based service.
- Use `WhatsAppService.sendMessage(phone, message)` for all notifications.
- The service handles API key management and error handling internally.

### Sheet Structure & ID Generation
- Headers are defined in `src/config/Config.js`.
- `IdService.js` manages unique ID generation. It now uses `LockService` to prevent race conditions and ensure ID uniqueness during concurrent executions.

## Development Workflow

### Setup Commands
```bash
# Deploy to Google Apps Script
clasp push

# View structured JSON logs
clasp logs --json

# Open project in browser
clasp open
```

### Testing Strategy
The testing strategy relies on a dedicated, class-based `TestEnvironmentService`.
- **Isolation**: It creates a temporary, timestamped folder and spreadsheet in Google Drive for each test run.
- **Lifecycle Management**:
  - `TestEnvironmentService.setup()`: Creates the test folder/spreadsheet, initializes all sheets with headers, and sets the `IS_TEST_ENVIRONMENT` flag.
  - `TestEnvironmentService.teardown()`: Deletes the test folder and clears all test-related script properties.
- **Usage**: Call these methods from a dedicated test function in `Code.gs`.

## Essential Workflows

### 1. Adding a New Registration Form

1.  **Update Config**: Add the new form's ID and sheet configuration to `src/config/Config.js`.
2.  **Create Handler Class**: Create a new handler file (e.g., `src/handlers/NewFormHandler.js`). The handler must be a class that extends `BaseService`.

    ```javascript
    class NewFormHandler extends BaseService {
      constructor() {
        super();
        this.db = getGlobalDB();
        this.validationService = new ValidationService(Config.VALIDATION_RULES.NEW_FORM);
      }

      onFormSubmit(e) {
        this.executeWithErrorHandling(() => {
          // 1. Extract and validate data
          // 2. Store in database via this.db
          // 3. Send notifications via WhatsAppService
        });
      }
    }
    ```

3.  **Register Handler**: In `src/handlers/MainHandler.js`, instantiate your new handler and add it to the `serviceMap`.

    ```javascript
    // In MainHandler constructor:
    this.serviceMap = {
      [Config.FORM_NAMES.ENGINEER]: new EngineerHandler(),
      [Config.FORM_NAMES.RETAILER]: new RetailerHandler(),
      [Config.FORM_NAMES.NEW_FORM]: new NewFormHandler() // Add new handler here
    };
    ```

### 2. Registration Approval Workflow

The logic remains in the `onEdit` function but is now routed through `MainHandler` to the specific handler for the sheet being edited.

```javascript
// src/handlers/MainHandler.js
handleEdit(e) {
  const sheetName = e.source.getActiveSheet().getName();
  const handler = this.findHandlerBySheet(sheetName); // Logic to map sheet to handler
  if (handler && typeof handler.onEdit === 'function') {
    handler.onEdit(e);
  }
}

// src/handlers/EngineerHandler.js
onEdit(e) {
  this.executeWithErrorHandling(() => {
    const range = e.range;
    const sheet = range.getSheet();
    const row = range.getRow();
    const status = sheet.getRange(row, this.db.getColumnName('Status')).getValue();

    if (status === 'Approved') {
      const id = IdService.getNextId('ENGINEER');
      // ... update sheet, send notification ...
    }
  });
}
```

## Debugging and Monitoring

- **Structured Logs**: Check `clasp logs --json` to see detailed, queryable JSON logs. This is the primary way to debug.
- **Error Handling**: All operations within services are wrapped in `executeWithErrorHandling` or `executeWithErrorHandlingSync`. This ensures that any failure is caught, logged with rich context by `ErrorHandlerService`, and handled gracefully.
- **System Health Check**: Run the `healthCheck()` function in `Code.gs` to get a status report of all core services and configurations.

## File Organization

- **`src/services/`**: Contains all business logic and integration services (e.g., `WhatsAppService`, `IdService`, `ValidationService`). All are ES6 classes extending `BaseService`.
- **`src/handlers/`**: Contains handlers for specific forms and sheet events (e.g., `EngineerHandler`). All are ES6 classes extending `BaseService`.
- **`src/database/`**: Contains the `DatabaseService.js` class, the sole interface for Google Sheets operations.
- **`src/config/`**: Contains the static `Config.js` file.
- **`src/Code.gs`**: Main entry point containing global function definitions (`doGet`, `onEdit`, etc.) and service initializations.
