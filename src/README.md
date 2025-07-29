# Anwar Sales Ecosystem - Source Code

This directory contains the complete, modernized source code for the Anwar Sales Ecosystem. The codebase has been refactored to a robust Service-Oriented Architecture (SOA).

## 🚀 Architectural Overview

The project follows a modern, class-based, three-tier architecture:

1.  **Handler Layer (`/handlers`)**: A unified `MainHandlerService` routes all incoming requests to specialized handler services.
2.  **Service Layer (`/services`)**: Contains all business logic encapsulated within modern ES6+ classes that extend a common `BaseService`.
3.  **Data Layer (`/database`)**: A single `DatabaseService` manages all interactions with Google Sheets.

## 📁 Directory Structure

```
src/
├── appsscript.json          # Apps Script manifest and configuration
├── Code.gs                  # Main entry points and global setup
├── config/                  # Static configuration (headers, sheet names)
│   └── Config.js
├── database/
│   └── DatabaseService.js   # Unified, robust database operations
├── services/
│   ├── BaseService.js       # Foundational class for all services
│   ├── ErrorHandlerService.js # Centralized error handling and custom errors
│   ├── LoggerService.js     # Structured JSON logging
│   ├── WhatsAppService.js   # WhatsApp messaging service
│   ├── IdService.js         # Concurrency-safe ID generation
│   ├── LocationService.js   # Location-based data retrieval
│   ├── ValidationService.js # Centralized data validation logic
│   └── ConfigurationService.js # Abstraction for PropertiesService
├── handlers/
│   ├── MainHandler.js       # Main entry points and routing logic
│   ├── EngineerHandler.js   # Engineer registration workflow
│   ├── PotentialSiteHandler.js # Potential site registration workflow
│   ├── RetailerHandler.js   # Retailer registration workflow
│   └── ...                  # Other specific handlers
├── legacy/
│   └── ...                  # Backward compatibility modules
└── utilities/
    └── ...                  # Shared, stateless utility functions
```

## � Core Services

- **`BaseService`**: The cornerstone of the architecture. Provides all other services with `executeWithErrorHandling` and inherited instances of the logger and error handler.
- **`DatabaseService`**: A reliable, singleton service for all Google Sheets operations.
- **`ErrorHandlerService`**: Catches all errors, categorizes them using `AppScriptError`, and enables recovery strategies.
- **`LoggerService`**: Creates detailed, queryable JSON logs for all operations, providing deep insight into application behavior.
- **`ConfigurationService`**: Manages all environment variables and application settings, abstracting away `PropertiesService` and handling test vs. production environments automatically.
- **`ValidationService`**: A central place for all data validation rules, ensuring consistency and reducing code duplication.
- **`IdService`**: Guarantees unique, sequential ID generation without race conditions by using `LockService`.

## � Usage

The system is designed to be event-driven, responding to Google Form submissions and sheet edits.

### Adding a New Registration Type
1.  Add new sheet and header configurations in `config/Config.js`.
2.  Create a new handler class in `handlers/` that extends `BaseService`.
3.  Implement the `onFormSubmit` and/or `onEdit` methods.
4.  Add the new handler to the `serviceMap` in `handlers/MainHandler.js`.

### Calling Services
All services are designed to be used via their global instances (e.g., `WhatsAppService.sendMessage(...)`, `IdService.getNextId(...)`). This is managed via legacy wrappers that point to a singleton instance of the service class.

## 📝 Best Practices

1.  **Extend `BaseService`**: All new services should extend `BaseService` to inherit core functionality.
2.  **Use `executeWithErrorHandling`**: Wrap all core logic in service methods with this function to ensure robustness.
3.  **Centralize Configuration**: All new settings should be managed via `ConfigurationService` and `config/Config.js`.
4.  **Centralize Validation**: All data validation should be delegated to `ValidationService`.
5.  **Keep Handlers Lean**: Handlers should only orchestrate calls to services. All business logic belongs in the `services` layer.