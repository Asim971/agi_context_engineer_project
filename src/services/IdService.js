/**
 * @fileoverview Service for generating unique IDs.
 */

const IdService = (function() {
  const ID_TRACKING_SHEET = Config.SHEETS.ID_TRACKING;

  /**
   * Generates the next unique ID for a given form type.
   * @param {string} formType - The type of the form (e.g., 'Engineer', 'Retailer').
   * @returns {string} The new unique ID.
   */
  function getNextId(formType) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ID_TRACKING_SHEET);
    if (!sheet) {
      throw new Error(`Sheet "${ID_TRACKING_SHEET}" not found.`);
    }

    const data = sheet.getDataRange().getValues();
    const headers = data.shift();
    const formTypeIndex = headers.indexOf('Form Type');
    const prefixIndex = headers.indexOf('Prefix');
    const lastIdIndex = headers.indexOf('Last ID');

    if (formTypeIndex === -1 || prefixIndex === -1 || lastIdIndex === -1) {
      throw new Error('ID Tracking sheet is missing required columns.');
    }

    for (let i = 0; i < data.length; i++) {
      if (data[i][formTypeIndex] === formType) {
        const prefix = data[i][prefixIndex];
        let lastId = data[i][lastIdIndex];
        
        if (typeof lastId !== 'number') {
            lastId = 0;
        }

        const newId = lastId + 1;
        sheet.getRange(i + 2, lastIdIndex + 1).setValue(newId);
        
        return `${prefix}${('0000' + newId).slice(-4)}`;
      }
    }

    throw new Error(`Form type "${formType}" not found in ID Tracking sheet.`);
  }

  return {
    getNextId: getNextId
  };
})();