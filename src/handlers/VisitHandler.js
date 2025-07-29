/**
 * @fileoverview Handles the form submission for the Visit form.
 */

/**
 * Handles the form submission event for the Visit form.
 * @param {GoogleAppsScript.Events.FormsOnFormSubmit} e The form submission event object.
 */
function onVisitFormSubmit(e) {
    try {
        const itemResponses = e.response.getItemResponses();
        const data = {};

        itemResponses.forEach(itemResponse => {
            const title = itemResponse.getItem().getTitle();
            const response = itemResponse.getResponse();
            data[title] = response;
        });

        const territory = data['Territory'];
        const clientType = data['Type of Client'];
        const clientName = data['Client Name'];

        // Add to Visit Sheet
        const visitSheet = DatabaseService.getOrCreateSheet(Config.SHEET_NAMES.VISIT);
        const visitHeaders = DatabaseService.getHeadersForSheet(Config.SHEET_NAMES.VISIT);
        const visitRowData = DatabaseService.formatRowData(data, visitHeaders);
        visitSheet.appendRow(visitRowData);

        // Send WhatsApp Notification
        const message = `New Visit logged:\nTerritory: ${territory}\nClient Type: ${clientType}\nClient Name: ${clientName}`;
        const users = DatabaseService.getUsersByTerritory(territory);
        users.forEach(user => {
            WhatsAppService.sendWhatsAppMessage(user.phone, message);
        });

    } catch (error) {
        Logger.log(`Error in onVisitFormSubmit: ${error.message}`);
        // Optional: Send an email or notification about the error
    }
}