/**
 * FormService.js
 * A service for creating and managing Google Forms.
 */

var FormService = (function() {

  var formConfigs = {
    'Retailer': {
      title: 'Anwar Sales Eco - Test Retailer Registration',
      fields: [
        { title: 'Shop Name', type: FormApp.ItemType.TEXT, required: true },
        { title: 'Retailer Name', type: FormApp.ItemType.TEXT, required: true },
        { title: 'Phone number', type: FormApp.ItemType.TEXT, required: true },
        { title: 'Shop Address', type: FormApp.ItemType.TEXT, required: true },
        { title: 'NID No', type: FormApp.ItemType.TEXT, required: true },
        { title: 'Dealer', type: FormApp.ItemType.TEXT, required: true },
        { title: 'Bazaar', type: FormApp.ItemType.LIST, choices: [], required: true },
        { title: 'Territory', type: FormApp.ItemType.LIST, choices: [], required: true },
        { title: 'Bkash Number', type: FormApp.ItemType.TEXT, required: true },
        { title: 'Photo', type: FormApp.ItemType.IMAGE, required: true },
      ],
    },
    'Potential Site': {
      title: 'Anwar Sales Eco - Test Potential Site Registration',
      fields: [
        { title: 'CRO Territory', type: FormApp.ItemType.LIST, choices: [], required: true },
        { title: 'Project Owner Name', type: FormApp.ItemType.TEXT, required: true },
        { title: 'Phone number', type: FormApp.ItemType.TEXT, required: true },
        { title: 'Project Address', type: FormApp.ItemType.TEXT, required: true },
        { title: 'Site Image', type: FormApp.ItemType.IMAGE, required: true },
        { title: 'Start Storied Building', type: FormApp.ItemType.TEXT, required: true },
        { title: 'End Storied Building', type: FormApp.ItemType.TEXT, required: true },
        { title: 'AIL Territory', type: FormApp.ItemType.LIST, choices: [], required: true },
        { title: 'ACL Territory', type: FormApp.ItemType.LIST, choices: [], required: true },
        { title: 'Engineer Details', type: FormApp.ItemType.TEXT, required: true },
        { title: 'Contractor Details', type: FormApp.ItemType.TEXT, required: true },
      ],
    },
    'Engineer': {
      title: 'Anwar Sales Eco - Test Engineer Registration',
      fields: [
        { title: 'Engineer Name', type: FormApp.ItemType.TEXT, required: true },
        { title: 'ID', type: FormApp.ItemType.TEXT, required: true },
        { title: 'Phone Number', type: FormApp.ItemType.TEXT, required: true },
        { title: 'Email Address', type: FormApp.ItemType.TEXT, required: true },
        { title: 'Address with Organization Name', type: FormApp.ItemType.TEXT, required: true },
        { title: 'Designation of Organization', type: FormApp.ItemType.TEXT, required: true },
        { title: 'District Name Of Working Area', type: FormApp.ItemType.LIST, choices: [], required: true },
        { title: 'Thana Of Working Area', type: FormApp.ItemType.LIST, choices: [], required: true },
        { title: 'Concerned BD Officer', type: FormApp.ItemType.TEXT, required: true },
        { title: 'Select Education', type: FormApp.ItemType.TEXT, required: true },
        { title: 'Engineer Classification', type: FormApp.ItemType.TEXT, required: true },
        { title: 'Business Unit', type: FormApp.ItemType.LIST, choices: ['BU1', 'BU2', 'BU3'], required: true },
      ],
    },
    'Site Update': {
      title: 'Anwar Sales Eco - Test Site Update',
      fields: [
          { title: 'Tag Site ID', type: FormApp.ItemType.TEXT, required: true },
          { title: 'Tag Engineer ID', type: FormApp.ItemType.TEXT, required: true },
          { title: 'Tag Engineer Details', type: FormApp.ItemType.PARAGRAPH_TEXT, required: true },
          { title: 'Tag Contractor ID', type: FormApp.ItemType.TEXT, required: true },
          { title: 'Tag Contractor Details', type: FormApp.ItemType.PARAGRAPH_TEXT, required: true },
      ],
    },
    'BD Lead': {
      title: 'Anwar Sales Eco - BD Lead Registration',
      fields: [
        { title: 'User Name', type: FormApp.ItemType.TEXT, required: true },
        { title: 'Designation', type: FormApp.ItemType.LIST, choices: [], required: true },
        { title: 'Line Manager', type: FormApp.ItemType.TEXT, required: true },
        { title: 'Nation', type: FormApp.ItemType.LIST, choices: [], required: true },
        { title: 'Phone Number', type: FormApp.ItemType.TEXT, required: true },
        { title: 'Email Address', type: FormApp.ItemType.TEXT, required: true },
      ],
    },
    'Sales Representative': {
      title: 'Anwar Sales Eco - Sales Representative Registration',
      fields: [
        { title: 'SR Name', type: FormApp.ItemType.TEXT, required: true },
        { title: 'Line Manager', type: FormApp.ItemType.TEXT, required: true },
        { title: 'Business Unit', type: FormApp.ItemType.LIST, choices: ['AIL', 'ACL'], required: true },
        { title: 'Nation', type: FormApp.ItemType.LIST, choices: [], required: true },
        { title: 'Division', type: FormApp.ItemType.LIST, choices: [], required: true },
        { title: 'Zone', type: FormApp.ItemType.LIST, choices: [], required: true },
        { title: 'Area', type: FormApp.ItemType.LIST, choices: [], required: true },
        { title: 'Territory', type: FormApp.ItemType.LIST, choices: [], required: true },
        { title: 'Phone Number', type: FormApp.ItemType.TEXT, required: true },
        { title: 'Email Address', type: FormApp.ItemType.TEXT, required: true },
      ],
    },
    'Visit': {
      title: 'Anwar Sales Eco - Test Visit',
      fields: [
        { title: 'Site ID', type: FormApp.ItemType.TEXT, required: true },
        { title: 'User ID', type: FormApp.ItemType.TEXT, required: true },
        { title: 'Visit Notes', type: FormApp.ItemType.PARAGRAPH_TEXT, required: true },
        { title: 'Visit Photo', type: FormApp.ItemType.IMAGE, required: true },
      ],
    },
  };

  /**
   * Creates a Google Form based on a predefined configuration.
   * @param {string} formName The name of the form to create (e.g., 'Retailer').
   * @param {string} spreadsheetId The ID of the spreadsheet to link the form to.
   * @returns {Form} The created Google Form object.
   */
  function createForm(formName, spreadsheetId) {
    var config = formConfigs[formName];
    if (!config) {
      throw new Error('Form configuration not found for: ' + formName);
    }

    var form = FormApp.create(config.title);
    form.setDestination(FormApp.DestinationType.SPREADSHEET, spreadsheetId);

    config.fields.forEach(function(item) {
      var formItem;

      if (item.title === 'Business Unit') {
        item.choices = LocationService.getTerritories();
      }
      if (item.title === 'District Name Of Working Area') {
        item.choices = LocationService.getDistricts();
      }
      if (item.title === 'Thana Of Working Area') {
        item.choices = LocationService.getUpazilas();
      }
      if (item.title === 'Bazaar') {
        item.choices = LocationService.getBazaars();
      }
      if (item.title === 'Territory') {
        item.choices = LocationService.getTerritories();
      }
      if (item.title === 'CRO Territory' || item.title === 'AIL Territory' || item.title === 'ACL Territory') {
        item.choices = LocationService.getTerritories();
      }
      if (item.title === 'Nation') {
        item.choices = LocationService.getCountries();
      }
      if (item.title === 'Designation') {
        item.choices = ['BD Lead', 'BDO', 'CRO', 'Company Admin', 'BMD Admin'];
      }

      switch (item.type) {
        case FormApp.ItemType.TEXT:
          formItem = form.addTextItem();
          break;
        case FormApp.ItemType.PARAGRAPH_TEXT:
          formItem = form.addParagraphTextItem();
          break;
        case FormApp.ItemType.LIST:
          formItem = form.addListItem();
          // Check if choices array is not empty before setting values
          if (item.choices && item.choices.length > 0) {
            formItem.setChoiceValues(item.choices);
          } else {
            // Provide a default choice when no data is available
            formItem.setChoiceValues(['No data available']);
          }
          break;
        case FormApp.ItemType.IMAGE:
          formItem = form.addImageItem();
          break;
        default:
          Logger.log('Unsupported item type: ' + item.type + ' for title: ' + item.title);
          return; // Skip this item
      }

      formItem.setTitle(item.title);

      // Check if the item type supports the setRequired method (e.g., ImageItem does not)
      if (typeof formItem.setRequired === 'function') {
        formItem.setRequired(item.required || false);
      } else if (item.required) {
        Logger.log('Warning: The "required" property is not supported for item "' + item.title + '" and will be ignored.');
      }
    });

    return form;
  }

  /**
   * Stores the ID of a created form in script properties.
   * @param {string} formName The name of the form.
   * @param {string} formId The ID of the form.
   */
  function storeFormId(formName, formId) {
    var properties = PropertiesService.getScriptProperties();
    properties.setProperty('formId_' + formName, formId);
  }

  /**
   * Retrieves the IDs of all stored forms.
   * @returns {Object} An object mapping form names to form IDs.
   */
  function getFormIds() {
    var formIds = {};
    Object.keys(formConfigs).forEach(function(formName) {
      var formId = PropertiesService.getScriptProperties().getProperty('formId_' + formName);
      if (formId) {
        formIds[formName] = formId;
      }
    });
    return formIds;
  }

  function getFormConfigs() {
    return formConfigs;
  }

  return {
    createForm: createForm,
    storeFormId: storeFormId,
    getFormIds: getFormIds,
    getFormConfigs: getFormConfigs
  };


})();