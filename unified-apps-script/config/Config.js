/**
 * Config.js
 * Centralized configuration for unified Google Apps Script project.
 */

var Config = {
  ENGINEER_FORM_ID: '1a2b3c4d5e6f7g8h9i0j', // Replace with actual ID
  POTENTIAL_SITE_FORM_ID: '16FOGBAvAS2ac85EaJuUARaQE60wEMAG5oA9Iz4xtA9g',
  RETAILER_FORM_ID: '1LBy0y-emr08r1ccJoOzuDe7oIw2VS4hUJGFi3s_0NHE',
  CRM_SPREADSHEET_ID: '1S06FspVASoTMd2v0khQ6WPJ59JCvdoyz2aDllPpPNh8',
  MAYTAPI_API_KEY: PropertiesService.getScriptProperties().getProperty('MAYTAPI_API_KEY'),
  MAYTAPI_URL: 'https://api.maytapi.com/api/55968f1b-01dc-4f02-baca-af83b92ca455/90126/sendMessage'
};

// Add other configuration constants as needed