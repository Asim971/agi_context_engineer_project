/**
 * CRMHandler.js
 * General CRM operations handler for unified Anwar Sales Ecosystem
 */

var CRMHandler = (function() {
  
  function onEdit(e) {
    var range = e.range;
    var sheet = range.getSheet();
    var sheetName = sheet.getName();
    
    // Handle general CRM updates
    if (sheetName === Config.NEW_CRM_SHEET_NAME) {
      handleCRMUpdate(e);
    }
  }
  
  function handleCRMUpdate(e) {
    var range = e.range;
    var sheet = range.getSheet();
    var row = range.getRow();
    var col = range.getColumn();
    
    // Get the updated data
    var rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    var record = {};
    headers.forEach(function(header, index) {
      record[header] = rowData[index];
    });
    
    // Log the update
    console.log('CRM Update - Row: ' + row + ', Column: ' + col + ', Data: ' + JSON.stringify(record));
    
    // You can add specific CRM update logic here
    // For example, trigger notifications, update related records, etc.
  }
  
  function getCRMData(type, status) {
    var sheetName;
    switch(type) {
      case 'engineer':
        sheetName = Config.SHEETS.ENGINEER;
        break;
      case 'potential_site':
        sheetName = Config.SHEETS.POTENTIAL_SITE;
        break;
      case 'retailer':
        sheetName = Config.SHEETS.RETAILER;
        break;
      default:
        sheetName = Config.NEW_CRM_SHEET_NAME;
    }
    
    var records = getGlobalDB().getAllRecords(sheetName);
    
    if (status) {
      records = records.filter(function(record) {
        return record.Status === status;
      });
    }
    
    return records;
  }
  
  return {
    onEdit: onEdit,
    getCRMData: getCRMData
  };
})();