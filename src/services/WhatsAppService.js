/**
 * WhatsAppService.js
 * Service module for sending WhatsApp messages via Maytapi API.
 * Updated for unified Anwar Sales Ecosystem
 */

var WhatsAppService = (function() {
  function sendMessage(phone, message) {
    if (!phone || !message) {
      console.error('Phone or message is empty');
      return false;
    }
    
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
    
    try {
      var response = UrlFetchApp.fetch(url, options);
      var result = JSON.parse(response.getContentText());
      
      if (result.success) {
        console.log('WhatsApp message sent successfully to: ' + phone);
        return true;
      } else {
        console.error('Failed to send WhatsApp message: ' + result.message);
        return false;
      }
    } catch (error) {
      console.error('Error sending WhatsApp message: ' + error.toString());
      return false;
    }
  }

  function sendBulkMessage(phoneNumbers, message) {
    var results = [];
    phoneNumbers.forEach(function(phone) {
      results.push({
        phone: phone,
        success: sendMessage(phone, message)
      });
    });
    return results;
  }

  function formatMessage(template, data) {
    var message = template;
    Object.keys(data).forEach(function(key) {
      message = message.replace(new RegExp('{{' + key + '}}', 'g'), data[key]);
    });
    return message;
  }

  return {
    sendMessage: sendMessage,
    sendBulkMessage: sendBulkMessage,
    formatMessage: formatMessage
  };
})();