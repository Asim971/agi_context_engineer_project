# Services

This directory contains various services that provide specific functionalities to the application.

## Service Files

- **`IdService.js`**: A dedicated service for generating unique, incremental IDs for different form types upon approval. It reads the last used ID from a tracking sheet, increments it, and formats it according to a defined pattern (e.g., 'en0001').
- **`FormService.js`**: Provides helper functions for working with Google Forms.
- **`LocationService.js`**: Handles location-related functionalities, such as geocoding or distance calculations.
- **`MigrationService.js`**: Contains scripts and functions for migrating data or schema changes.
- **`TestEnvironmentService.js`**: Provides utilities for setting up and managing a test environment.
- **`WhatsAppService.js`**: Integrates with WhatsApp for sending notifications or messages.