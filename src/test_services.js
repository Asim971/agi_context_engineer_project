/**
 * Quick test to verify service availability
 */
function testServiceAvailability() {
  console.log("=== Service Availability Test ===");

  console.log(
    "Config:",
    typeof Config !== "undefined" ? "Available" : "Not Available"
  );
  console.log(
    "DatabaseService:",
    typeof DatabaseService !== "undefined" ? "Available" : "Not Available"
  );
  console.log(
    "HandlerService:",
    typeof HandlerService !== "undefined" ? "Available" : "Not Available"
  );
  console.log(
    "Logger:",
    typeof Logger !== "undefined" ? "Available" : "Not Available"
  );
  console.log(
    "LoggerService:",
    typeof LoggerService !== "undefined" ? "Available" : "Not Available"
  );

  // Test GlobalServiceLocator
  if (typeof GlobalServiceLocator !== "undefined") {
    console.log("GlobalServiceLocator: Available");
    try {
      console.log(
        "Config service registered:",
        GlobalServiceLocator.isRegistered("Config")
      );
      console.log(
        "DatabaseService registered:",
        GlobalServiceLocator.isRegistered("DatabaseService")
      );
      console.log(
        "HandlerService registered:",
        GlobalServiceLocator.isRegistered("HandlerService")
      );
      console.log(
        "Logger registered:",
        GlobalServiceLocator.isRegistered("Logger")
      );
      console.log(
        "LoggerService registered:",
        GlobalServiceLocator.isRegistered("LoggerService")
      );
    } catch (e) {
      console.error("Error checking service registration:", e.message);
    }
  } else {
    console.log("GlobalServiceLocator: Not Available");
  }

  console.log("=== Test Complete ===");
}

// Run the test
testServiceAvailability();
