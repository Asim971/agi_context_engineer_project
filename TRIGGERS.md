# Trigger Documentation

This document outlines the automated triggers used in the Anwar Sales Ecosystem project.

## Trigger Types

The project utilizes two main types of triggers:

1.  **Event-Driven Triggers**: These are fired in response to specific events, such as form submissions or edits to a spreadsheet.
2.  **Time-Driven Triggers**: These run at a specified time or on a recurring schedule.

---

## Event-Driven Triggers

### `onFormSubmit(e)`

-   **File**: `src/handlers/MainHandler.js`
-   **Trigger Type**: Form Submit
-   **Description**: This is the main entry point for all form submissions. It identifies the source form and routes the submission event to the appropriate handler (`BDLeadHandler`, `EngineerHandler`, `PotentialSiteHandler`, `RetailerHandler`, or `SiteUpdateHandler`).
-   **Setup**: Triggers are created programmatically by the `setupTriggers` function in `src/services/TestEnvironmentService.js` when the test environment is initialized. This function iterates through the forms defined in `FormService` and creates an `onFormSubmit` trigger for each.

### `onEdit(e)`

-   **File**: `src/handlers/MainHandler.js`
-   **Trigger Type**: Spreadsheet Edit
-   **Description**: This trigger fires whenever a user edits a cell in the associated Google Sheet. It checks the name of the edited sheet and routes the event to the corresponding handler (`BDLeadHandler`, `EngineerHandler`, `PotentialSiteHandler`, or `RetailerHandler`) to process status changes and other updates.
-   **Setup**: This is a simple trigger that is automatically configured by Google Apps Script when the `onEdit` function is present in a script attached to a spreadsheet.

---

## Time-Driven Triggers

### `initializeNewSheets()`

-   **File**: `src/handlers/MainHandler.js` (calls `LegacyInitializer.initializeNewSheets()`)
-   **Trigger Type**: Time-Driven (Daily)
-   **Description**: This trigger runs once a day to perform legacy sheet initialization tasks. It is configured to ensure that any required sheets from the older system are available.
-   **Setup**: The trigger is created by the `setupTriggers` function in `src/handlers/MainHandler.js`, which can be run manually. It deletes all existing project triggers before creating a new daily time-based trigger.

---

## Manual Setup Functions

These functions are not triggers themselves but are used to configure the environment and its triggers.

### `setupProductionEnvironment()`

-   **File**: `src/handlers/MainHandler.js`
-   **Description**: A master setup function for the production environment. It initializes the database and sets up the necessary triggers for production use.

### `setupTestEnvironment()`

-   **File**: `src/handlers/MainHandler.js`
-   **Description**: A master setup function for the test environment. It initializes the test database and sets up the necessary triggers for testing purposes.

### `setupIdTracking()`

-   **File**: `src/handlers/MainHandler.js`
-   **Description**: Ensures that the `ID Tracking` sheet exists, which is critical for the unique ID generation feature.

### `setupTestEnvironment()`

-   **File**: `src/services/TestEnvironmentService.js`
-   **Description**: Creates a dedicated test folder in Google Drive, sets up a test spreadsheet, and calls its own `setupTriggers` function to create all the necessary `onFormSubmit` triggers for the test environment.