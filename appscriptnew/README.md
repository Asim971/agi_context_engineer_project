# New Google Apps Script Project

This project is a new Google Apps Script setup designed to create new sheets and import existing form data without affecting existing sheets or data.

## Features
- Creates new sheets for Engineer, Potential Site, Retailer, and CRM data.
- Imports existing form responses into the new sheets.
- Scheduled trigger to update data daily.

## Setup Instructions
1. Deploy the project as a Google Apps Script project.
2. Run `initializeNewSheets` function manually once to create sheets and import data.
3. Run `setupTriggers` function to schedule daily updates.

## Notes
- This project does not modify existing sheets or data.
- Ensure the form IDs in `config/Config.js` are correct.

## Future Improvements
- Add error handling and logging.
- Add UI for manual data refresh.