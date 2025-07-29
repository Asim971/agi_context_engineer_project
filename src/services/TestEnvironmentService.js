/**
 * TestEnvironmentService.js
 * Manages the creation and setup of a dedicated test environment.
 */

var TestEnvironmentService = (function() {

  var TEST_FOLDER_ID_KEY = 'testEnvironmentFolderId';

  /**
   * Sets up the test environment by creating a dedicated folder and setting up form triggers.
   */
  function setupTestEnvironment() {
    var folderId = PropertiesService.getScriptProperties().getProperty(TEST_FOLDER_ID_KEY);
    if (folderId && DriveApp.getFolderById(folderId)) {
      console.log('Test environment folder already exists: ' + folderId);
    } else {
      try {
        var folder = DriveApp.createFolder('Anwar Sales Eco - Test Environment - ' + new Date().getTime());
        folderId = folder.getId();
        PropertiesService.getScriptProperties().setProperty(TEST_FOLDER_ID_KEY, folderId);
        console.log('Test environment folder created: ' + folderId);
      } catch (error) {
        console.error('Failed to create test environment folder: ' + error.toString());
        throw new Error('Failed to create test environment folder.');
      }
    }
    
    // Create test spreadsheet if it doesn't exist
    var testSpreadsheetId = PropertiesService.getScriptProperties().getProperty('testSpreadsheetId');
    if (!testSpreadsheetId) {
      try {
        var testSpreadsheet = SpreadsheetApp.create('Anwar Sales Eco - Test Spreadsheet - ' + new Date().getTime());
        testSpreadsheetId = testSpreadsheet.getId();
        
        // Move the spreadsheet to the test folder
        var file = DriveApp.getFileById(testSpreadsheetId);
        var folder = DriveApp.getFolderById(folderId);
        folder.addFile(file);
        DriveApp.getRootFolder().removeFile(file);
        
        PropertiesService.getScriptProperties().setProperty('testSpreadsheetId', testSpreadsheetId);
        console.log('Test spreadsheet created: ' + testSpreadsheetId);
      } catch (error) {
        console.error('Failed to create test spreadsheet: ' + error.toString());
        throw new Error('Failed to create test spreadsheet.');
      }
    } else {
      console.log('Test spreadsheet already exists: ' + testSpreadsheetId);
    }
    
    setupTriggers();

    return folderId;
  }

  /**
   * Sets up all the form submit triggers.
   */
  function setupTriggers() {
    var formConfigs = FormService.getFormConfigs(); // Assuming this method exists to get configs
    var spreadsheetId = PropertiesService.getScriptProperties().getProperty('testSpreadsheetId');

    Object.keys(formConfigs).forEach(function(formName) {
      var formId = PropertiesService.getScriptProperties().getProperty('formId_' + formName);
      if (!formId) {
        var form = FormService.createForm(formName, spreadsheetId);
        formId = form.getId();
        FormService.storeFormId(formName, formId);
      }
    });

    var formIds = FormService.getFormIds();
    Object.keys(formIds).forEach(function(formType) {
      var formId = formIds[formType];
      if (formId) {
        var triggerFunction;
        switch (formType) {
          case 'Retailer':
            triggerFunction = 'onRetailerFormSubmit';
            break;
          case 'Potential Site':
            triggerFunction = 'onPotentialSiteFormSubmit';
            break;
          case 'Engineer':
            triggerFunction = 'onEngineerFormSubmit';
            break;
          case 'Site Update':
            triggerFunction = 'onSiteUpdateFormSubmit';
            break;
          case 'Visit':
            triggerFunction = 'onVisitFormSubmit';
            break;
          default:
            Logger.log('No trigger function defined for form type: ' + formType);
            return;
        }
        createFormSubmitTrigger(formId, triggerFunction);
      }
    });
  }

  /**
   * Creates a trigger for a form submit event, avoiding duplicates.
   * @param {string} formId The ID of the form.
   * @param {string} functionName The name of the function to trigger.
   */
  function createFormSubmitTrigger(formId, functionName) {
    // Delete existing triggers for the same function to avoid duplication
    var allTriggers = ScriptApp.getProjectTriggers();
    for (var i = 0; i < allTriggers.length; i++) {
      if (allTriggers[i].getHandlerFunction() === functionName) {
        ScriptApp.deleteTrigger(allTriggers[i]);
        console.log('Removed existing trigger for: ' + functionName);
      }
    }
    // Create a new trigger
    ScriptApp.newTrigger(functionName)
      .forForm(formId)
      .onFormSubmit()
      .create();
    console.log('Created new trigger for ' + functionName + ' on form ' + formId);
  }

  /**
   * Gets the ID of the test environment folder.
   * @returns {string|null} The folder ID or null if not set.
   */
  function getTestEnvironmentFolderId() {
    return PropertiesService.getScriptProperties().getProperty(TEST_FOLDER_ID_KEY);
  }

  /**
   * Resets the test environment by deleting the folder ID from properties.
   */
  function resetTestEnvironment() {
    PropertiesService.getScriptProperties().deleteProperty(TEST_FOLDER_ID_KEY);
    console.log('Test environment has been reset.');
  }

  return {
    setupTestEnvironment: setupTestEnvironment,
    getTestEnvironmentFolderId: getTestEnvironmentFolderId,
    resetTestEnvironment: resetTestEnvironment
  };


})();