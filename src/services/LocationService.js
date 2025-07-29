const LocationService = (() => {
  let dbService = null;
  
  const getDbService = () => {
    if (!dbService) {
      dbService = new DatabaseService();
    }
    return dbService;
  };

  // --- Demarcation Functions ---

  const addDemarcation = (data) => {
    return getDbService().insertRecord(Config.SHEETS.DEMARCATION, data);
  };

  const getDemarcations = () => {
    return getDbService().getAllRecords(Config.SHEETS.DEMARCATION);
  };

  const updateDemarcation = (rowNumber, data) => {
    return getDbService().updateRecord(Config.SHEETS.DEMARCATION, rowNumber, data);
  };

  const findDemarcation = (criteria) => {
    return getDbService().findRecords(Config.SHEETS.DEMARCATION, criteria);
  };

  // --- Administrative Settings Functions ---

  const addAdminSetting = (data) => {
    return getDbService().insertRecord(Config.SHEETS.ADMINISTRATIVE_SETTINGS, data);
  };

  const getAdminSettings = () => {
    return getDbService().getAllRecords(Config.SHEETS.ADMINISTRATIVE_SETTINGS);
  };

  const updateAdminSetting = (rowNumber, data) => {
    return getDbService().updateRecord(Config.SHEETS.ADMINISTRATIVE_SETTINGS, rowNumber, data);
  };

  const findAdminSetting = (criteria) => {
    return getDbService().findRecords(Config.SHEETS.ADMINISTRATIVE_SETTINGS, criteria);
  };

  // --- Hierarchy Retrieval Functions ---

  const getUniqueColumnValues = (sheetName, columnName) => {
    try {
      const records = getDbService().getAllRecords(sheetName);
      const values = records.map(record => record[columnName]);
      const uniqueValues = [...new Set(values)].filter(Boolean); // Remove empty values and get unique
      
      // Return fallback if no values found
      return uniqueValues.length > 0 ? uniqueValues : ['No data available'];
    } catch (error) {
      console.error(`Error getting unique values from ${sheetName}.${columnName}:`, error);
      return ['No data available'];
    }
  };

  const getDistricts = () => getUniqueColumnValues(Config.SHEETS.DEMARCATION, 'District');
  const getUpazilas = () => getUniqueColumnValues(Config.SHEETS.DEMARCATION, 'Uujila');
  const getBazaars = () => getUniqueColumnValues(Config.SHEETS.DEMARCATION, 'Bazaar');

  const getTerritories = () => getUniqueColumnValues(Config.SHEETS.ADMINISTRATIVE_SETTINGS, 'Territory');
  const getAreas = () => getUniqueColumnValues(Config.SHEETS.ADMINISTRATIVE_SETTINGS, 'Area');
  const getZones = () => getUniqueColumnValues(Config.SHEETS.ADMINISTRATIVE_SETTINGS, 'Zone');
  const getDivisions = () => getUniqueColumnValues(Config.SHEETS.ADMINISTRATIVE_SETTINGS, 'Division');
  const getCountries = () => getUniqueColumnValues(Config.SHEETS.ADMINISTRATIVE_SETTINGS, 'Country');


  return {
    addDemarcation,
    getDemarcations,
    updateDemarcation,
    findDemarcation,
    addAdminSetting,
    getAdminSettings,
    updateAdminSetting,
    findAdminSetting,
    getDistricts,
    getUpazilas,
    getBazaars,
    getTerritories,
    getAreas,
    getZones,
    getDivisions,
    getCountries
  };
})();