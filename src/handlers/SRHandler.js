/**
 * Sales Representative (SR) Handler
 * Manages SR registration, updates, and data operations
 */

class SRHandler {
  constructor() {
    this.sheetName = Config.SHEET_NAMES.SR;
    this.formId = Config.FORM_IDS.SR;
  }

  /**
   * Handle GET requests for SR management
   * @param {Object} e - Event object
   * @returns {HtmlOutput} HTML page
   */
  doGet(e) {
    try {
      const template = HtmlService.createTemplateFromFile('SRForm');
      template.formId = this.formId;
      
      // Get location data for dropdowns
      template.countries = LocationService.getUniqueColumnValues('ADMINISTRATIVE_SETTINGS', 'Country');
      template.divisions = LocationService.getUniqueColumnValues('ADMINISTRATIVE_SETTINGS', 'Division');
      template.zones = LocationService.getUniqueColumnValues('ADMINISTRATIVE_SETTINGS', 'Zone');
      template.areas = LocationService.getUniqueColumnValues('ADMINISTRATIVE_SETTINGS', 'Area');
      template.territories = LocationService.getUniqueColumnValues('ADMINISTRATIVE_SETTINGS', 'Territory');
      
      return template.evaluate()
        .setTitle('Sales Representative Registration')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    } catch (error) {
      console.error('Error in SRHandler.doGet:', error);
      throw new Error('Failed to load SR form: ' + error.message);
    }
  }

  /**
   * Handle form submissions for SR registration
   * @param {Object} formData - Form submission data
   * @returns {Object} Response object
   */
  onFormSubmit(formData) {
    try {
      console.log('Processing SR form submission:', formData);
      
      // Validate required fields
      this.validateFormData(formData);
      
      // Prepare data for insertion
      const srData = this.prepareDataForInsertion(formData);
      
      // Insert into database
      const result = DatabaseService.insertRecord(this.sheetName, srData);
      
      if (result.success) {
        console.log('SR registered successfully:', result);
        
        // Send WhatsApp notification if configured
        this.sendNotification(srData);
        
        return {
          success: true,
          message: 'Sales Representative registered successfully',
          data: result.data
        };
      } else {
        throw new Error('Failed to insert SR data: ' + result.error);
      }
    } catch (error) {
      console.error('Error in SRHandler.onFormSubmit:', error);
      return {
        success: false,
        message: 'Registration failed: ' + error.message
      };
    }
  }

  /**
   * Handle edit events for SR status updates
   * @param {Object} e - Edit event object
   */
  onEdit(e) {
    try {
      const range = e.range;
      const sheet = range.getSheet();
      
      if (sheet.getName() !== this.sheetName) return;
      
      const row = range.getRow();
      const col = range.getColumn();
      const newValue = range.getValue();
      
      // Check if status column was edited (assuming status is in a specific column)
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const statusColIndex = headers.indexOf('Status') + 1;
      
      if (col === statusColIndex && newValue === 'Approved') {
        // Generate SR ID when approved
        const srId = IdService.generateId('SR');
        const idColIndex = headers.indexOf('SR ID') + 1;
        
        if (idColIndex > 0) {
          sheet.getRange(row, idColIndex).setValue(srId);
          console.log(`Generated SR ID: ${srId} for row ${row}`);
        }
      }
    } catch (error) {
      console.error('Error in SRHandler.onEdit:', error);
    }
  }

  /**
   * Validate form data
   * @param {Object} formData - Form data to validate
   * @throws {Error} If validation fails
   */
  validateFormData(formData) {
    const requiredFields = [
      'srName',
      'lineManager',
      'businessUnit',
      'nation',
      'division',
      'zone',
      'area',
      'territory',
      'phoneNumber',
      'emailAddress'
    ];
    
    for (const field of requiredFields) {
      if (!formData[field] || formData[field].toString().trim() === '') {
        throw new Error(`${field} is required`);
      }
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.emailAddress)) {
      throw new Error('Invalid email address format');
    }
    
    // Validate phone number (basic validation)
    const phoneRegex = /^[+]?[0-9\s\-()]+$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      throw new Error('Invalid phone number format');
    }
  }

  /**
   * Prepare data for database insertion
   * @param {Object} formData - Raw form data
   * @returns {Object} Prepared data object
   */
  prepareDataForInsertion(formData) {
    return {
      'Timestamp': new Date(),
      'SR Name': formData.srName,
      'Line Manager': formData.lineManager,
      'Business Unit': formData.businessUnit,
      'Nation': formData.nation,
      'Division': formData.division,
      'Zone': formData.zone,
      'Area': formData.area,
      'Territory': formData.territory,
      'Phone Number': formData.phoneNumber,
      'Email Address': formData.emailAddress,
      'Status': 'Pending',
      'SR ID': '', // Will be generated when approved
      'Created By': Session.getActiveUser().getEmail(),
      'Last Updated': new Date()
    };
  }

  /**
   * Send WhatsApp notification for new SR registration
   * @param {Object} srData - SR data
   */
  sendNotification(srData) {
    try {
      const message = `🆕 New Sales Representative Registration\n\n` +
        `👤 Name: ${srData['SR Name']}\n` +
        `👨‍💼 Line Manager: ${srData['Line Manager']}\n` +
        `🌍 Location: ${srData['Nation']} > ${srData['Division']} > ${srData['Zone']} > ${srData['Area']} > ${srData['Territory']}\n` +
        `📱 Phone: ${srData['Phone Number']}\n` +
        `📧 Email: ${srData['Email Address']}\n` +
        `⏰ Submitted: ${srData['Timestamp']}`;
      
      WhatsAppService.sendMessage(message);
    } catch (error) {
      console.error('Error sending SR notification:', error);
      // Don't throw error as this is not critical for the main flow
    }
  }

  /**
   * Get all SR records
   * @returns {Array} Array of SR records
   */
  getAllSRs() {
    try {
      return DatabaseService.getAllRecords(this.sheetName);
    } catch (error) {
      console.error('Error getting all SRs:', error);
      throw new Error('Failed to retrieve SR records: ' + error.message);
    }
  }

  /**
   * Get SR by ID
   * @param {string} srId - SR ID
   * @returns {Object|null} SR record or null if not found
   */
  getSRById(srId) {
    try {
      const records = this.getAllSRs();
      return records.find(record => record['SR ID'] === srId) || null;
    } catch (error) {
      console.error('Error getting SR by ID:', error);
      throw new Error('Failed to retrieve SR record: ' + error.message);
    }
  }

  /**
   * Update SR status
   * @param {string} srId - SR ID
   * @param {string} status - New status
   * @returns {Object} Update result
   */
  updateSRStatus(srId, status) {
    try {
      const updateData = {
        'Status': status,
        'Last Updated': new Date()
      };
      
      return DatabaseService.updateRecord(this.sheetName, 'SR ID', srId, updateData);
    } catch (error) {
      console.error('Error updating SR status:', error);
      throw new Error('Failed to update SR status: ' + error.message);
    }
  }
}