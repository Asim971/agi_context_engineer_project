# Anwar Sales Ecosystem

This project is a Google Apps Script-based ecosystem for managing sales-related activities for Anwar Group. It includes modules for handling Engineers, Retailers, Potential Sites, and BD Leads.

## Project Structure

The project is organized into the following main directories:

- `src/config`: Contains configuration files for the application, such as sheet names, form IDs, and other constants.
- `src/database`: Contains the database service for interacting with Google Sheets.
- `src/handlers`: Contains the handlers for processing form submissions and other events.
- `src/services`: Contains various services used by the application, such as ID generation, location services, and more.

## Features

- **Form Handling**: The application handles submissions from various Google Forms for different entities.
- **Data Management**: Data is stored and managed in Google Sheets, acting as a database.
- **Unique ID Generation**: A custom ID generation system creates unique IDs for records upon approval.
- **Modular Architecture**: The code is organized into modules for better maintainability and scalability.

## Deployment

The project is deployed using `clasp`, the command-line tool for Google Apps Script. The `filePushOrder` in `.clasp.json` ensures that files are deployed in the correct order.