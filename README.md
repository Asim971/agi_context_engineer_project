# Anwar Sales Ecosystem - Modernized Architecture

This repository contains the Google Apps Script-based ecosystem for managing sales-related activities for Anwar Group. The project has undergone a significant "Foundation Modernization" phase, transforming it into a robust, scalable, and maintainable Service-Oriented Architecture (SOA).

## Architecture Overview

The application now follows a modern, class-based, three-tier architecture:

1.  **Handler Layer (`src/handlers`)**: A unified `MainHandlerService` routes all incoming requests (`doGet`, `onFormSubmit`, `onEdit`) to specialized, stateless handler services. Their only job is to orchestrate calls to the service layer.
2.  **Service Layer (`src/services`)**: Contains all business logic encapsulated within modern ES6+ classes. Every service extends a `BaseService`, inheriting standardized error handling, structured logging, and other core capabilities.
3.  **Data Layer (`src/database`)**: A single, robust `DatabaseService` manages all interactions with Google Sheets, providing a reliable and abstracted data access layer.

## Core Features & Capabilities

- **Service-Oriented Architecture**: The modular design makes the system easy to understand, maintain, and extend.
- **Robust Error Handling**: A centralized `ErrorHandlerService` with a custom `AppScriptError` class ensures that all errors are handled gracefully, with retry logic for transient issues.
- **Structured Logging**: The `LoggerService` provides detailed, contextual JSON-based logging, enabling rapid debugging and system monitoring.
- **Configuration Service**: A dedicated `ConfigurationService` abstracts away `PropertiesService`, providing a clean, environment-aware interface for managing all settings and secrets.
- **Concurrency-Safe ID Generation**: The `IdService` uses `LockService` to ensure unique, sequential IDs are generated without race conditions.
- **Backward Compatibility**: All refactored services include legacy wrappers, ensuring that existing Apps Script triggers and client-side calls continue to function seamlessly.

## Project Structure

The project is organized into the following main directories:

- `src/`: Contains all source code for the application.
  - `config`: Static configuration files.
  - `database`: The data access layer for Google Sheets.
  - `handlers`: Request/event handlers that route to the service layer.
  - `services`: Core business logic and integrations.
  - `legacy`: Compatibility modules for older functionality.
- `analysis/`: Contains project analysis, planning, and reports.
- `docs/`: Project documentation.

## Deployment

The project is deployed using `clasp`, the command-line tool for Google Apps Script. The `filePushOrder` in `.clasp.json` ensures that files are deployed in the correct order to respect dependencies.
```
clasp push
```