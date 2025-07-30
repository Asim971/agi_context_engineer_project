/**
 * HandlerService.js
 * Enhanced base class for all form/event handlers
 * Extends BaseService with handler-specific functionality
 *
 * @fileoverview Handler service foundation with validation and utilities
 * @version 1.0.0
 */

/**
 * Helper utilities for form and data processing
 * Defined first to avoid dependency issues
 */
class HandlerHelpers {
  /**
   * Maps form values array to headers object
   * @param {Array} values - Form submission values
   * @param {Array|Object} headers - Header configuration
   * @returns {Object} Mapped data object
   */
  mapFormValuesToHeaders(values, headers) {
    if (!Array.isArray(values)) {
      throw new AppScriptError(
        "INVALID_FORM_VALUES",
        "Form values must be an array"
      );
    }

    const headerArray = Array.isArray(headers)
      ? headers
      : Object.values(headers);

    if (!headerArray || headerArray.length === 0) {
      throw new AppScriptError(
        "INVALID_HEADERS",
        "Headers configuration is empty or invalid"
      );
    }

    const mappedData = {};

    headerArray.forEach((header, index) => {
      if (index < values.length) {
        mappedData[header] = values[index] || "";
      } else {
        mappedData[header] = "";
      }
    });

    return mappedData;
  }

  /**
   * Validates required fields in data object
   * @param {Object} data - Data to validate
   * @param {Array} requiredFields - Array of required field names
   * @throws {AppScriptError} If validation fails
   */
  validateRequiredFields(data, requiredFields) {
    if (!requiredFields || !Array.isArray(requiredFields)) {
      return; // No validation required
    }

    const missingFields = [];

    requiredFields.forEach((field) => {
      if (!data[field] || data[field].toString().trim() === "") {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      throw new AppScriptError(
        "VALIDATION_FAILED",
        `Required fields are missing: ${missingFields.join(", ")}`,
        { missingFields }
      );
    }
  }
}

class HandlerService extends BaseService {
  constructor(sheetName, headers, idPrefix) {
    super();

    // Validate required parameters
    if (!sheetName) {
      throw new AppScriptError(
        "HANDLER_CONFIG_MISSING",
        "Sheet name is required for handler initialization"
      );
    }

    if (!headers) {
      throw new AppScriptError(
        "HANDLER_CONFIG_MISSING",
        "Headers configuration is required for handler initialization"
      );
    }

    // Core handler properties
    this.sheetName = sheetName;
    this.headers = headers;
    this.idPrefix = idPrefix || sheetName;

    // Initialize helper utilities
    this.helpers = new HandlerHelpers();

    // Validate dependencies
    this.validateDependencies();

    this.logger.info(`${this.constructor.name} initialized`, {
      sheetName: this.sheetName,
      idPrefix: this.idPrefix,
      headerCount: Array.isArray(this.headers)
        ? this.headers.length
        : Object.keys(this.headers).length,
    });
  }

  /**
   * Validate that all required dependencies are available
   * Uses GlobalServiceLocator for dependency resolution
   * @private
   */
  validateDependencies() {
    const requiredServices = ["Config", "DatabaseService"];
    const missingServices = [];

    for (const serviceName of requiredServices) {
      if (!GlobalServiceLocator.has(serviceName)) {
        missingServices.push(
          `${serviceName} (not registered in ServiceLocator)`
        );
      } else {
        try {
          GlobalServiceLocator.get(serviceName);
        } catch (error) {
          missingServices.push(
            `${serviceName} (registration failed: ${error.message})`
          );
        }
      }
    }

    if (missingServices.length > 0) {
      const error = new AppScriptError(
        "HANDLER_DEPENDENCIES_MISSING",
        `Handler dependencies not available: ${missingServices.join(
          ", "
        )}. Ensure ServiceBootstrap.bootstrap() has been called.`,
        {
          missingServices,
          handlerName: this.constructor.name,
          serviceLocatorStatus: GlobalServiceLocator.getStatus(),
        }
      );

      this.logger.critical("Handler dependency validation failed", {
        missingServices,
        handlerName: this.constructor.name,
      });

      throw error;
    }

    this.logger.info("Handler dependencies validated successfully", {
      handlerName: this.constructor.name,
    });
  }

  /**
   * Safe database access with validation
   * Uses ServiceLocator for proper dependency injection
   * @returns {DatabaseService} Database service instance
   */
  getDatabase() {
    return this.executeWithErrorHandlingSync(
      () => {
        const db = GlobalServiceLocator.get("DatabaseService");
        if (!db) {
          throw new AppScriptError(
            "DATABASE_UNAVAILABLE",
            "Database service is not available. Ensure ServiceBootstrap.bootstrap() has been called and DatabaseService is registered."
          );
        }
        this.logger.debug("Database accessed via ServiceLocator");
        return db;
      },
      {},
      "getDatabase"
    );
  }

  /**
   * Process form submission with standardized error handling
   * @param {Object} e - Form submission event
   * @param {Function} processor - Custom processing function
   */
  processFormSubmission(e, processor) {
    this.executeWithErrorHandling(
      () => {
        // Validate event data
        if (!e || !e.values) {
          throw new AppScriptError(
            "INVALID_FORM_DATA",
            "Form submission event is missing or invalid"
          );
        }

        // Map form values to headers
        const data = this.helpers.mapFormValuesToHeaders(
          e.values,
          this.headers
        );

        // Set default status
        if (!data["Status"]) {
          data["Status"] = "Pending";
        }

        // Execute custom processor
        const result = processor(data, e);

        this.logger.info("Form submission processed successfully", {
          handlerName: this.constructor.name,
          sheetName: this.sheetName,
        });

        return result;
      },
      { event: e },
      "processFormSubmission"
    );
  }
}

// Make HandlerService and HandlerHelpers globally available
// This is required for ServiceBootstrap to access them
if (typeof globalThis !== "undefined") {
  globalThis.HandlerService = HandlerService;
  globalThis.HandlerHelpers = HandlerHelpers;
} else {
  // Fallback for older environments
  this.HandlerService = HandlerService;
  this.HandlerHelpers = HandlerHelpers;
}

console.log("✅ HandlerService and HandlerHelpers registered globally");
