/**
 * Unified Config.js
 * Centralized configuration for the consolidated Anwar Sales Ecosystem
 * Combines legacy appscriptnew and unified-apps-script configurations
 */

var Config = {
  // Environment Configuration
  IS_TEST_ENVIRONMENT: true, // Set to false for production
  // Legacy configuration (from appscriptnew)
  NEW_ENGINEER_SHEET_NAME: 'New Engineer Responses',
  NEW_POTENTIAL_SITE_SHEET_NAME: 'New Potential Site Responses',
  NEW_RETAILER_SHEET_NAME: 'New Retailer Responses',
  NEW_CRM_SHEET_NAME: 'New CRM',
  
  // Unified configuration (from unified-apps-script)
  ENGINEER_FORM_ID: '1a2b3c4d5e6f7g8h9i0j',
  POTENTIAL_SITE_FORM_ID: '16FOGBAvAS2ac85EaJuUARaQE60wEMAG5oA9Iz4xtA9g',
  RETAILER_FORM_ID: '1LBy0y-emr08r1ccJoOzuDe7oIw2VS4hUJGFi3s_0NHE',
  CRM_SPREADSHEET_ID: 'YOUR_TEST_SPREADSHEET_ID_HERE', // IMPORTANT: Replace with a test spreadsheet ID
  
  // API Configuration
  MAYTAPI_API_KEY: PropertiesService.getScriptProperties().getProperty('MAYTAPI_API_KEY'),
  MAYTAPI_URL: 'https://api.maytapi.com/api/55968f1b-01dc-4f02-baca-af83b92ca455/90126/sendMessage',
  
  // Sheet names for different modules
  SHEETS: {
    ENGINEER: 'Engineer CRM',
    POTENTIAL_SITE: 'Potential Site CRM',
    RETAILER: 'Retailer CRM',
    MASTER: 'Master CRM',
    VISIT: 'Visits',
    DEMARCATION: 'Demarcation',
    ADMINISTRATIVE_SETTINGS: 'Administrative Settings',
    BD_LEAD: 'BD Lead CRM',
    SR: 'Sales Representative CRM',
    ID_TRACKING: 'ID Tracking'
  },
  
  // Additional sheet names
  SITE_UPDATES_SHEET_NAME: 'Site Updates',
  SITE_UPDATE_FORM_ID: 'YOUR_SITE_UPDATE_FORM_ID_HERE', // IMPORTANT: Replace with a real form ID
  USERS_SHEET_NAME: 'Users',
  
  // Form IDs mapping
  FORMS: {
    ENGINEER: '1a2b3c4d5e6f7g8h9i0j',
    POTENTIAL_SITE: '16FOGBAvAS2ac85EaJuUARaQE60wEMAG5oA9Iz4xtA9g',
    RETAILER: '1LBy0y-emr08r1ccJoOzuDe7oIw2VS4hUJGFi3s_0NHE',
    BD_LEAD: 'YOUR_BD_LEAD_FORM_ID_HERE', // IMPORTANT: Replace with a real form ID
    SR: 'YOUR_SR_FORM_ID_HERE' // IMPORTANT: Replace with a real form ID
  },
  
  // Legacy existing form IDs (set to empty string if no existing forms to import)
  EXISTING_ENGINEER_FORM_ID: '',
  EXISTING_POTENTIAL_SITE_FORM_ID: '',
  EXISTING_RETAILER_FORM_ID: '',
  
  // Column headers for different sheets
  HEADERS: {
    DEMARCATION: [
        'District', 'Uujila', 'Bazaar'
    ],
    ADMINISTRATIVE_SETTINGS: [
        'Territory', 'Area', 'Zone', 'Division', 'Country'
    ],
    RETAILER: [
        'Timestamp', 'SR Name', 'SR Phone', 'Shop Name', 'Retailer Name', 'Phone number', 'Shop Address', 'NID No', 'Dealer', 'Bazaar', 'Territory', 'Bkash Number', 'Photo'
    ],
    POTENTIAL_SITE: [
        'Timestamp', 'CRO Territory', 'Project Owner Name', 'Phone number', 'Project Address', 'Site Image', 'Start Storied Building', 'End Storied Building', 'AIL Territory', 'ACL Territory', 'Engineer Details', 'Contractor Details'
    ],
    ENGINEER: [
        'Timestamp', 'Engineer Name', 'ID', 'Phone Number', 'Email Address', 'Address with Organization Name', 'Designation of Organization', 'District Name Of Working Area', 'Thana Of Working Area', 'Concerned BD Officer', 'Select Education', 'Engineer Classification', 'Business Unit'
    ],
    SITE_UPDATE: [
        'Timestamp', 'Site ID', 'Engineer ID', 'Engineer Details', 'Contractor ID', 'Contractor Details'
    ],
    VISIT: [
        'Timestamp',
        'Type of Visit',
        'Territory',
        'Type of Client',
        'Upload Image',
        'Client Name',
        'Client Phone Number'
    ],
    BD_LEAD: [
        'Timestamp', 'User Name', 'Designation', 'Line Manager', 'Nation', 'Phone Number', 'Email Address'
    ],
    SR: [
        'Timestamp', 'SR Name', 'Line Manager', 'Business Unit', 'Nation', 'Division', 'Zone', 'Area', 'Territory', 'Phone Number', 'Email Address', 'Status', 'SR ID', 'Created By', 'Last Updated'
    ],
    ID_TRACKING: [
        'Form Type', 'Prefix', 'Last ID'
    ]
  }
};

/**
 * Ensure Config is globally accessible in Google Apps Script
 * Critical for service locator pattern to work correctly
 */
if (typeof globalThis !== 'undefined') {
  globalThis.Config = Config;
}

// Also ensure it's available on the global scope for Google Apps Script
if (typeof global !== 'undefined') {
  global.Config = Config;
}

// Additional compatibility for Google Apps Script V8 runtime
if (typeof window !== 'undefined') {
  window.Config = Config;
}

console.log('✅ Config loaded and registered in global scope');