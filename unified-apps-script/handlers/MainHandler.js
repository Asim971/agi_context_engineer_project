/**
 * MainHandler.js
 * Entry points and routing for unified Google Apps Script project.
 */

function doGet(e) {
  var params = e.parameter || {};
  var formId = params.formId || '';

  if (formId === Config.ENGINEER_FORM_ID) {
    return EngineerHandler.doGet(e);
  } else if (formId === Config.POTENTIAL_SITE_FORM_ID) {
    return PotentialSiteHandler.doGet(e);
  } else if (formId === Config.RETAILER_FORM_ID) {
    return RetailerHandler.doGet(e);
  } else {
    return ContentService.createTextOutput('Unified Google Apps Script Project');
  }
}

function onFormSubmit(e) {
  var formId = e.source.getId();

  if (formId === Config.ENGINEER_FORM_ID) {
    EngineerHandler.onFormSubmit(e);
  } else if (formId === Config.POTENTIAL_SITE_FORM_ID) {
    PotentialSiteHandler.onFormSubmit(e);
  } else if (formId === Config.RETAILER_FORM_ID) {
    RetailerHandler.onFormSubmit(e);
  }
}

function onEdit(e) {
  var sheetName = e.range.getSheet().getName();

  if (sheetName === 'Engineer Approvals') {
    EngineerHandler.onEdit(e);
  } else if (sheetName === 'Potential Site Approvals') {
    PotentialSiteHandler.onEdit(e);
  } else if (sheetName === 'Retailer Approvals') {
    RetailerHandler.onEdit(e);
  } else {
    CRMHandler.onEdit(e);
  }
}