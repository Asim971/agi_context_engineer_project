# Database

This directory contains the database service for the application.

## `DatabaseService.js`

This service acts as an abstraction layer for all interactions with Google Sheets, which is used as the database for this project. It provides a set of functions to perform common database operations, such as:

- Initializing the database and sheets.
- Inserting, updating, and retrieving records.
- Finding records based on specific criteria.
- Handling headers and data formatting.
- Generating the next available ID for a new record before the implementation of `IdService.js`.