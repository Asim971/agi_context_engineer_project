/**
 * WhatsAppService.js
 * Service module for sending WhatsApp messages via Maytapi API.
 */

var WhatsAppService = (function() {
  function sendMessage(phone, message) {
    var url = Config.MAYTAPI_URL;
    var payload = {
      'to_number': phone,
      'type': 'text',
      'message': message
    };
    var options = {
      'method': 'post',
      'contentType': 'application/json',
      'payload': JSON.stringify(payload),
      'headers': {
        'x-maytapi-key': Config.MAYTAPI_API_KEY
      }
    };
    UrlFetchApp.fetch(url, options);
  }

  return {
    sendMessage: sendMessage
  };
})();