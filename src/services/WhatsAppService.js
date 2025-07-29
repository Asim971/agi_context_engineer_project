/**
 * WhatsAppService.js
 * Service module for sending WhatsApp messages via Maytapi API
 * Updated for unified Anwar Sales Ecosystem with Phase 1 modernization
 * 
 * @fileoverview Modern WhatsApp service with comprehensive error handling and recovery
 * @version 2.0.0
 */

/**
 * WhatsApp messaging service with comprehensive error handling
 * Extends BaseService for robust API communication
 */
class WhatsAppMessagingService extends BaseService {
  constructor() {
    super();
    this.serviceName = 'WhatsAppService';
    this.logger = Logger.createChildLogger('WhatsAppService', { module: 'services' });
    this.apiUrl = Config.MAYTAPI_URL;
    this.apiKey = null;
    this.rateLimitDelay = 1000; // 1 second between messages
    this.lastMessageTime = 0;
    
    this.initialize();
  }

  /**
   * Initialize WhatsApp service
   * @protected
   */
  initialize() {
    super.initialize();
    this.loadApiKey();
    this.validateConfiguration();
  }

  /**
   * Load API key securely from PropertiesService
   * @private
   */
  loadApiKey() {
    try {
      this.apiKey = PropertiesService.getScriptProperties().getProperty('MAYTAPI_API_KEY');
      
      if (!this.apiKey) {
        throw new AppScriptError(
          'CONFIG_MISSING_API_KEY',
          'MAYTAPI_API_KEY not found in PropertiesService',
          { service: 'WhatsAppService' },
          false,
          'CRITICAL'
        );
      }
      
      this.logger.info('API key loaded successfully');
    } catch (error) {
      this.logger.critical('Failed to load API key', { error: error.message });
      throw error;
    }
  }

  /**
   * Validate service configuration
   * @private
   */
  validateConfiguration() {
    if (!this.apiUrl) {
      throw new AppScriptError(
        'CONFIG_MISSING_API_URL',
        'MAYTAPI_URL not configured',
        { service: 'WhatsAppService' },
        false,
        'CRITICAL'
      );
    }

    this.logger.info('Configuration validated successfully', {
      apiUrl: this.apiUrl,
      hasApiKey: !!this.apiKey
    });
  }

  /**
   * Send WhatsApp message with comprehensive error handling
   * @param {string} phone - Phone number to send message to
   * @param {string} message - Message content
   * @returns {Promise<boolean>} Success status
   */
  async sendMessage(phone, message) {
    return this.executeWithErrorHandling(
      async () => {
        // Validate input parameters
        this.validateMessageInput(phone, message);
        
        // Apply rate limiting
        await this.applyRateLimit();
        
        // Prepare API request
        const payload = {
          'to_number': phone,
          'type': 'text',
          'message': message
        };
        
        const options = {
          'method': 'post',
          'contentType': 'application/json',
          'payload': JSON.stringify(payload),
          'headers': {
            'x-maytapi-key': this.apiKey
          }
        };

        this.logger.debug('Sending WhatsApp message', {
          phone: this.sanitizePhoneForLogging(phone),
          messageLength: message.length,
          type: 'text'
        });

        // Make API request
        const response = await this.makeApiRequest(options);
        const result = JSON.parse(response.getContentText());
        
        if (result.success) {
          this.logger.info('WhatsApp message sent successfully', {
            phone: this.sanitizePhoneForLogging(phone),
            messageId: result.message_id || 'unknown'
          });
          return true;
        } else {
          throw new AppScriptError(
            'API_WHATSAPP_SEND_FAILED',
            `WhatsApp API returned error: ${result.message || 'Unknown error'}`,
            { 
              phone: this.sanitizePhoneForLogging(phone),
              apiResponse: result 
            },
            true, // May be recoverable
            'ERROR'
          );
        }
      },
      {
        operation: 'sendMessage',
        phone: this.sanitizePhoneForLogging(phone),
        messageLength: message?.length,
        timestamp: new Date().toISOString()
      },
      'sendMessage'
    );
  }

  /**
   * Send bulk messages to multiple phone numbers
   * @param {Array<string>} phoneNumbers - Array of phone numbers
   * @param {string} message - Message content
   * @returns {Promise<Array<Object>>} Results array with success/failure status
   */
  async sendBulkMessage(phoneNumbers, message) {
    return this.executeWithErrorHandling(
      async () => {
        if (!Array.isArray(phoneNumbers) || phoneNumbers.length === 0) {
          throw new AppScriptError(
            'VALIDATION_INVALID_PHONE_ARRAY',
            'Phone numbers must be a non-empty array',
            { phoneCount: phoneNumbers?.length },
            false,
            'ERROR'
          );
        }

        this.logger.info('Starting bulk message send', {
          recipientCount: phoneNumbers.length,
          messageLength: message.length
        });

        const results = [];
        
        // Send messages with rate limiting
        for (let i = 0; i < phoneNumbers.length; i++) {
          const phone = phoneNumbers[i];
          
          try {
            const success = await this.sendMessage(phone, message);
            results.push({
              phone: this.sanitizePhoneForLogging(phone),
              success: success,
              index: i
            });
          } catch (error) {
            results.push({
              phone: this.sanitizePhoneForLogging(phone),
              success: false,
              error: error.message,
              index: i
            });
          }
          
          // Progress logging
          if ((i + 1) % 10 === 0) {
            this.logger.info(`Bulk message progress: ${i + 1}/${phoneNumbers.length}`);
          }
        }

        const successCount = results.filter(r => r.success).length;
        const failureCount = results.length - successCount;

        this.logger.info('Bulk message send completed', {
          total: results.length,
          successful: successCount,
          failed: failureCount,
          successRate: (successCount / results.length * 100).toFixed(2) + '%'
        });

        return results;
      },
      {
        operation: 'sendBulkMessage',
        recipientCount: phoneNumbers?.length,
        messageLength: message?.length
      },
      'sendBulkMessage'
    );
  }

  /**
   * Format message template with data
   * @param {string} template - Message template with {{placeholders}}
   * @param {Object} data - Data to substitute in template
   * @returns {string} Formatted message
   */
  formatMessage(template, data) {
    if (!template || typeof template !== 'string') {
      throw new AppScriptError(
        'VALIDATION_INVALID_TEMPLATE',
        'Message template must be a non-empty string',
        { template: typeof template },
        false,
        'ERROR'
      );
    }

    let formatted = template;
    
    // Replace placeholders with data
    for (const [key, value] of Object.entries(data || {})) {
      const placeholder = `{{${key}}}`;
      const replacement = value !== null && value !== undefined ? String(value) : '';
      formatted = formatted.replace(new RegExp(placeholder, 'g'), replacement);
    }

    this.logger.debug('Message formatted', {
      templateLength: template.length,
      formattedLength: formatted.length,
      placeholderCount: Object.keys(data || {}).length
    });

    return formatted;
  }

  /**
   * Validate message input parameters
   * @private
   * @param {string} phone - Phone number
   * @param {string} message - Message content
   */
  validateMessageInput(phone, message) {
    if (!phone || typeof phone !== 'string' || phone.trim() === '') {
      throw new AppScriptError(
        'VALIDATION_INVALID_PHONE',
        'Phone number is required and must be a non-empty string',
        { phone: 'invalid' },
        false,
        'ERROR'
      );
    }

    // Basic phone number format validation
    if (!/^\+?[\d\s\-\(\)]+$/.test(phone.trim())) {
      throw new AppScriptError(
        'VALIDATION_INVALID_PHONE_FORMAT',
        'Phone number contains invalid characters',
        { phone: this.sanitizePhoneForLogging(phone) },
        false,
        'ERROR'
      );
    }

    if (!message || typeof message !== 'string' || message.trim() === '') {
      throw new AppScriptError(
        'VALIDATION_INVALID_MESSAGE',
        'Message is required and must be a non-empty string',
        { messageType: typeof message },
        false,
        'ERROR'
      );
    }

    // Check message length (WhatsApp limit is typically 4096 characters)
    if (message.length > 4096) {
      throw new AppScriptError(
        'VALIDATION_MESSAGE_TOO_LONG',
        'Message exceeds maximum length of 4096 characters',
        { messageLength: message.length },
        false,
        'ERROR'
      );
    }
  }

  /**
   * Apply rate limiting between API calls
   * @private
   */
  async applyRateLimit() {
    const now = Date.now();
    const timeSinceLastMessage = now - this.lastMessageTime;
    
    if (timeSinceLastMessage < this.rateLimitDelay) {
      const delay = this.rateLimitDelay - timeSinceLastMessage;
      this.logger.debug('Applying rate limit delay', { delay });
      await this.sleep(delay);
    }
    
    this.lastMessageTime = Date.now();
  }

  /**
   * Make API request with error handling
   * @private
   * @param {Object} options - UrlFetchApp options
   * @returns {Promise<HTTPResponse>} API response
   */
  async makeApiRequest(options) {
    try {
      const response = UrlFetchApp.fetch(this.apiUrl, options);
      
      // Check response status
      const responseCode = response.getResponseCode();
      if (responseCode < 200 || responseCode >= 300) {
        throw new AppScriptError(
          'API_HTTP_ERROR',
          `HTTP ${responseCode}: ${response.getContentText()}`,
          { 
            responseCode,
            apiUrl: this.apiUrl 
          },
          responseCode >= 500, // Server errors are potentially recoverable
          'ERROR'
        );
      }
      
      return response;
    } catch (error) {
      if (error instanceof AppScriptError) {
        throw error;
      }
      
      // Handle UrlFetchApp specific errors
      if (error.message.includes('timeout')) {
        throw new AppScriptError(
          'API_TIMEOUT',
          'WhatsApp API request timed out',
          { 
            apiUrl: this.apiUrl,
            originalError: error.message 
          },
          true, // Timeout is recoverable
          'WARN'
        );
      }
      
      throw new AppScriptError(
        'API_CONNECTION_ERROR',
        'Failed to connect to WhatsApp API',
        { 
          apiUrl: this.apiUrl,
          originalError: error.message 
        },
        true, // Connection errors are potentially recoverable
        'ERROR'
      );
    }
  }

  /**
   * Sanitize phone number for logging (remove sensitive digits)
   * @private
   * @param {string} phone - Phone number
   * @returns {string} Sanitized phone number
   */
  sanitizePhoneForLogging(phone) {
    if (!phone || typeof phone !== 'string') {
      return '[INVALID_PHONE]';
    }
    
    // Keep first 3 and last 2 digits, mask the rest
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 6) {
      return '[PHONE_TOO_SHORT]';
    }
    
    const start = digits.substring(0, 3);
    const end = digits.substring(digits.length - 2);
    const masked = '*'.repeat(digits.length - 5);
    
    return `${start}${masked}${end}`;
  }

  /**
   * Service-specific health check
   * @protected
   * @returns {Promise<Object>} Health check results
   */
  async performServiceHealthCheck() {
    const checks = {
      apiKey: this.apiKey ? 'AVAILABLE' : 'MISSING',
      apiUrl: this.apiUrl ? 'CONFIGURED' : 'MISSING',
      connectivity: 'UNKNOWN'
    };

    // Test API connectivity (lightweight ping)
    try {
      // Simple test without actually sending a message
      const testOptions = {
        'method': 'get',
        'headers': {
          'x-maytapi-key': this.apiKey
        }
      };
      
      const response = UrlFetchApp.fetch(this.apiUrl.replace('/sendMessage', '/status'), testOptions);
      checks.connectivity = response.getResponseCode() < 400 ? 'HEALTHY' : 'DEGRADED';
    } catch (error) {
      checks.connectivity = 'UNHEALTHY';
    }

    return {
      checks,
      rateLimitDelay: this.rateLimitDelay,
      lastMessageTime: this.lastMessageTime ? new Date(this.lastMessageTime).toISOString() : null
    };
  }

  /**
   * Sleep utility for delays
   * @private
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Create global instance
const whatsAppService = new WhatsAppMessagingService();

// Export legacy interface for backward compatibility
var WhatsAppService = {
  sendMessage: (phone, message) => whatsAppService.sendMessage(phone, message),
  sendBulkMessage: (phoneNumbers, message) => whatsAppService.sendBulkMessage(phoneNumbers, message),
  formatMessage: (template, data) => whatsAppService.formatMessage(template, data)
};