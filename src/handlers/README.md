# Handlers

This directory contains the handlers for various events and form submissions within the Anwar Sales Ecosystem.

## Handler Files

Each handler file is responsible for managing the logic for a specific entity or process. The primary handlers include:

- **`MainHandler.js`**: The main entry point for the application. It routes incoming requests and events to the appropriate handlers based on the form ID or sheet name.
- **`BDLeadHandler.js`**: Handles form submissions and edits for BD Leads.
- **`EngineerHandler.js`**: Manages form submissions and edits for Engineers.
- **`PotentialSiteHandler.js`**: Processes form submissions and edits for Potential Sites.
- **`RetailerHandler.js`**: Handles form submissions and edits for Retailers.
- **`CRMHandler.js`**: Manages CRM-related functionalities.
- **`SiteUpdateHandler.js`**: Handles updates related to sites.
- **`VisitHandler.js`**: Manages visit-related data and processes.

These handlers contain the core business logic for their respective modules, including data validation, processing, and interaction with the database service.