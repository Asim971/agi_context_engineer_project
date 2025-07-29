function setupTriggers() {
  ScriptApp.newTrigger('initializeNewSheets')
    .timeBased()
    .everyDays(1)
    .atHour(1)
    .create();
}