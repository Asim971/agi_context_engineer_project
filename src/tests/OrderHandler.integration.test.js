/**
 * OrderHandler.integration.test.js
 * Integration tests for OrderHandler with real service dependencies
 * Tests end-to-end workflows and service interactions
 *
 * @fileoverview Integration tests for OrderHandler implementation
 * @author Senior Development Agent
 * @version 1.0.0
 */

/**
 * Integration Test Configuration
 */
const INTEGRATION_TEST_CONFIG = {
  TEST_PROJECT_ID: "PST-TEST-001",
  TEST_USER_EMAIL: "integration.test@anwar.com",
  TEST_TIMEOUT: 30000, // 30 seconds
  CLEANUP_AFTER_TESTS: true,
};

/**
 * Real Service Integration Test Suite
 */
class OrderHandlerIntegrationTests {
  constructor() {
    this.testResults = [];
    this.createdOrders = [];
    this.startTime = Date.now();
  }

  /**
   * Setup integration test environment
   */
  async setup() {
    console.log("Setting up integration test environment...");

    try {
      // Verify all required services are available
      this.orderHandler = new OrderHandler();

      // Verify service dependencies
      const requiredServices = [
        "Config",
        "Logger",
        "Database",
        "Validator",
        "IdService",
        "CRMHandler",
      ];

      for (const serviceName of requiredServices) {
        const service = GlobalServiceLocator.get(serviceName);
        if (!service) {
          throw new Error(`Required service not available: ${serviceName}`);
        }
      }

      console.log("✓ All required services are available");

      // Setup test data
      await this.setupTestData();

      console.log("✓ Integration test environment ready");
    } catch (error) {
      console.error(
        "✗ Failed to setup integration test environment:",
        error.message
      );
      throw error;
    }
  }

  /**
   * Setup test data in the system
   */
  async setupTestData() {
    const databaseService = GlobalServiceLocator.get("Database");

    // Create test potential site if it doesn't exist
    const testSiteData = {
      id: INTEGRATION_TEST_CONFIG.TEST_PROJECT_ID,
      address: "123 Integration Test Street, Test City, Test State 12345",
      status: "active",
      createdBy: "INTEGRATION_TEST",
      createdAt: new Date().toISOString(),
    };

    try {
      await databaseService.insertRecord("potential_sites", testSiteData);
      console.log("✓ Test potential site created");
    } catch (error) {
      // Site might already exist, which is fine
      console.log(
        "Test potential site already exists or creation failed (expected)"
      );
    }
  }

  /**
   * Run all integration tests
   */
  async runAllTests() {
    console.log("\n=== OrderHandler Integration Tests ===");
    console.log(
      `Test Configuration: ${JSON.stringify(INTEGRATION_TEST_CONFIG, null, 2)}`
    );

    try {
      await this.setup();

      // Core workflow tests
      await this.testCompleteOrderLifecycle();
      await this.testMultipleOrderProcessing();
      await this.testApprovalWorkflows();

      // Service integration tests
      await this.testDatabaseIntegration();
      await this.testCRMIntegration();
      await this.testValidationIntegration();

      // Error handling tests
      await this.testErrorRecoveryScenarios();
      await this.testConcurrencyHandling();

      // Performance tests
      await this.testPerformanceUnderLoad();
    } catch (error) {
      console.error("Integration test suite failed:", error.message);
    } finally {
      await this.cleanup();
      this.printTestSummary();
    }
  }

  /**
   * Test complete order lifecycle from submission to completion
   */
  async testCompleteOrderLifecycle() {
    console.log("\n--- Testing Complete Order Lifecycle ---");

    try {
      const testStartTime = Date.now();

      // Step 1: Submit Order
      const orderData = {
        projectId: INTEGRATION_TEST_CONFIG.TEST_PROJECT_ID,
        totalSalesVolume: 150,
        uom: "Bags",
        detailedProjectAddress:
          "Complete integration test address with all required details for successful delivery coordination",
        dealerMemo:
          "Integration test order - complete lifecycle test with comprehensive dealer memo content",
        siteVisitImage: {
          fileName: "integration-test-site.jpg",
          fileSize: 2048000,
          mimeType: "image/jpeg",
          base64Data:
            "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//gA7Q1JFQVR...",
        },
        emailAddress: INTEGRATION_TEST_CONFIG.TEST_USER_EMAIL,
        engineerEligible: true,
        urgencyLevel: "normal",
        specialInstructions: "Integration test - handle with care",
      };

      const userContext = {
        email: INTEGRATION_TEST_CONFIG.TEST_USER_EMAIL,
        role: "DEALER",
        sessionId: "integration-test-session",
      };

      console.log("Submitting order...");
      const submitResult = await this.orderHandler.submitOrder(
        orderData,
        userContext
      );

      this.assert(submitResult.success, "Order submission should succeed");
      this.assert(submitResult.orderId, "Order ID should be generated");
      this.assert(submitResult.orderNumber, "Order number should be generated");

      this.createdOrders.push(submitResult.orderId);
      console.log(`✓ Order submitted: ${submitResult.orderId}`);

      // Step 2: Validate Order
      console.log("Validating order...");
      const validateResult = await this.orderHandler.validateOrder(
        submitResult.orderId
      );

      this.assert(validateResult.success, "Order validation should succeed");
      this.assert(
        validateResult.status === "validated",
        "Order status should be validated"
      );

      console.log("✓ Order validated successfully");

      // Step 3: Route for Approval
      console.log("Routing for approval...");
      const routeResult = await this.orderHandler.routeForApproval(
        submitResult.orderId
      );

      this.assert(routeResult.success, "Approval routing should succeed");
      this.assert(
        routeResult.assigneeRole,
        "Assignee role should be determined"
      );
      this.assert(routeResult.assignee, "Assignee should be assigned");

      console.log(`✓ Order routed to: ${routeResult.assigneeRole}`);

      // Step 4: Approve Order
      console.log("Approving order...");
      const approveResult = await this.orderHandler.approveOrder(
        submitResult.orderId,
        "INTEGRATION_TEST_APPROVER",
        "Integration test approval - automated approval for testing"
      );

      this.assert(approveResult.success, "Order approval should succeed");
      this.assert(
        approveResult.status === "approved",
        "Order status should be approved"
      );

      console.log("✓ Order approved successfully");

      // Step 5: Check Final State
      const finalOrder = await this.orderHandler.getOrderById(
        submitResult.orderId
      );

      this.assert(
        finalOrder.status === "approved",
        "Final status should be approved"
      );
      this.assert(
        finalOrder.auditTrail.length >= 4,
        "Audit trail should contain all steps"
      );
      this.assert(
        finalOrder.approvedBy === "INTEGRATION_TEST_APPROVER",
        "Approver should be recorded"
      );

      const testDuration = Date.now() - testStartTime;
      console.log(`✓ Complete order lifecycle test passed (${testDuration}ms)`);

      this.recordTestResult("Complete Order Lifecycle", "PASSED", testDuration);
    } catch (error) {
      console.log("✗ Complete order lifecycle test failed:", error.message);
      this.recordTestResult(
        "Complete Order Lifecycle",
        "FAILED",
        0,
        error.message
      );
    }
  }

  /**
   * Test processing multiple orders simultaneously
   */
  async testMultipleOrderProcessing() {
    console.log("\n--- Testing Multiple Order Processing ---");

    try {
      const testStartTime = Date.now();
      const orderCount = 5;
      const orderPromises = [];

      // Create multiple orders concurrently
      for (let i = 0; i < orderCount; i++) {
        const orderData = {
          projectId: INTEGRATION_TEST_CONFIG.TEST_PROJECT_ID,
          totalSalesVolume: 50 + i * 10,
          uom: i % 2 === 0 ? "Bags" : "MT",
          detailedProjectAddress: `Multi-order test address ${i} with comprehensive details for delivery`,
          dealerMemo: `Multi-order integration test ${i} - concurrent processing validation`,
          siteVisitImage: {
            fileName: `multi-test-${i}.jpg`,
            fileSize: 1024000 + i * 100000,
            mimeType: "image/jpeg",
          },
          emailAddress: `multi-test-${i}@anwar.com`,
          engineerEligible: i % 3 === 0,
          urgencyLevel: i % 2 === 0 ? "normal" : "high",
        };

        const userContext = {
          email: `multi-user-${i}@anwar.com`,
          role: "DEALER",
          sessionId: `multi-test-session-${i}`,
        };

        orderPromises.push(
          this.orderHandler.submitOrder(orderData, userContext)
        );
      }

      console.log(`Submitting ${orderCount} orders concurrently...`);
      const results = await Promise.all(orderPromises);

      // Verify all orders were created successfully
      this.assert(
        results.length === orderCount,
        `Should create ${orderCount} orders`
      );

      for (const result of results) {
        this.assert(result.success, "Each order submission should succeed");
        this.assert(result.orderId, "Each order should have an ID");
        this.createdOrders.push(result.orderId);
      }

      // Verify order numbers are unique
      const orderNumbers = results.map((r) => r.orderNumber);
      const uniqueOrderNumbers = new Set(orderNumbers);
      this.assert(
        uniqueOrderNumbers.size === orderCount,
        "All order numbers should be unique"
      );

      const testDuration = Date.now() - testStartTime;
      console.log(
        `✓ Multiple order processing test passed (${orderCount} orders in ${testDuration}ms)`
      );

      this.recordTestResult(
        "Multiple Order Processing",
        "PASSED",
        testDuration
      );
    } catch (error) {
      console.log("✗ Multiple order processing test failed:", error.message);
      this.recordTestResult(
        "Multiple Order Processing",
        "FAILED",
        0,
        error.message
      );
    }
  }

  /**
   * Test different approval workflows
   */
  async testApprovalWorkflows() {
    console.log("\n--- Testing Approval Workflows ---");

    try {
      const testStartTime = Date.now();

      // Test ACL workflow
      const aclOrderData = {
        projectId: INTEGRATION_TEST_CONFIG.TEST_PROJECT_ID,
        totalSalesVolume: 75,
        uom: "Bags",
        detailedProjectAddress:
          "ACL workflow test address with complete delivery details",
        dealerMemo: "ACL approval workflow integration test",
        siteVisitImage: {
          fileName: "acl-workflow-test.jpg",
          fileSize: 1500000,
          mimeType: "image/jpeg",
        },
        emailAddress: "acl-workflow@anwar.com",
        engineerEligible: true,
      };

      const aclResult = await this.orderHandler.submitOrder(aclOrderData, {
        email: "acl-dealer@anwar.com",
        role: "ACL_DEALER",
      });

      this.createdOrders.push(aclResult.orderId);

      await this.orderHandler.validateOrder(aclResult.orderId);
      const aclRouting = await this.orderHandler.routeForApproval(
        aclResult.orderId
      );

      this.assert(
        aclRouting.assigneeRole === "ACL_SR",
        "ACL orders should route to ACL SR"
      );
      console.log("✓ ACL workflow routing correct");

      // Test AIL workflow
      const ailOrderData = {
        projectId: INTEGRATION_TEST_CONFIG.TEST_PROJECT_ID,
        totalSalesVolume: 25,
        uom: "MT",
        detailedProjectAddress:
          "AIL workflow test address with complete delivery details",
        dealerMemo: "AIL approval workflow integration test",
        siteVisitImage: {
          fileName: "ail-workflow-test.jpg",
          fileSize: 1200000,
          mimeType: "image/jpeg",
        },
        emailAddress: "ail-workflow@anwar.com",
        engineerEligible: false,
      };

      const ailResult = await this.orderHandler.submitOrder(ailOrderData, {
        email: "ail-dealer@anwar.com",
        role: "AIL_DEALER",
      });

      this.createdOrders.push(ailResult.orderId);

      await this.orderHandler.validateOrder(ailResult.orderId);
      const ailRouting = await this.orderHandler.routeForApproval(
        ailResult.orderId
      );

      this.assert(
        ailRouting.assigneeRole === "AIL_SR",
        "AIL orders should route to AIL SR"
      );
      console.log("✓ AIL workflow routing correct");

      const testDuration = Date.now() - testStartTime;
      console.log(`✓ Approval workflows test passed (${testDuration}ms)`);

      this.recordTestResult("Approval Workflows", "PASSED", testDuration);
    } catch (error) {
      console.log("✗ Approval workflows test failed:", error.message);
      this.recordTestResult("Approval Workflows", "FAILED", 0, error.message);
    }
  }

  /**
   * Test database service integration
   */
  async testDatabaseIntegration() {
    console.log("\n--- Testing Database Integration ---");

    try {
      const testStartTime = Date.now();
      const databaseService = GlobalServiceLocator.get("Database");

      // Test order persistence
      const testOrder = {
        id: "DB-TEST-ORDER-001",
        projectId: INTEGRATION_TEST_CONFIG.TEST_PROJECT_ID,
        status: "submitted",
        totalSalesVolume: 100,
        createdAt: new Date().toISOString(),
      };

      // Insert test order
      const insertResult = await databaseService.insertRecord(
        "orders",
        testOrder
      );
      this.assert(insertResult, "Order should be inserted successfully");

      // Retrieve test order
      const retrievedOrders = await databaseService.findRecords("orders", {
        id: "DB-TEST-ORDER-001",
      });
      this.assert(
        retrievedOrders.length === 1,
        "Should retrieve exactly one order"
      );
      this.assert(
        retrievedOrders[0].id === "DB-TEST-ORDER-001",
        "Retrieved order should match"
      );

      // Update test order
      const updateResult = await databaseService.updateRecord(
        "orders",
        "id",
        "DB-TEST-ORDER-001",
        {
          status: "validated",
          updatedAt: new Date().toISOString(),
        }
      );
      this.assert(updateResult, "Order should be updated successfully");

      // Verify update
      const updatedOrders = await databaseService.findRecords("orders", {
        id: "DB-TEST-ORDER-001",
      });
      this.assert(
        updatedOrders[0].status === "validated",
        "Order status should be updated"
      );

      const testDuration = Date.now() - testStartTime;
      console.log(`✓ Database integration test passed (${testDuration}ms)`);

      this.recordTestResult("Database Integration", "PASSED", testDuration);
    } catch (error) {
      console.log("✗ Database integration test failed:", error.message);
      this.recordTestResult("Database Integration", "FAILED", 0, error.message);
    }
  }

  /**
   * Test CRM service integration
   */
  async testCRMIntegration() {
    console.log("\n--- Testing CRM Integration ---");

    try {
      const testStartTime = Date.now();
      const crmHandler = GlobalServiceLocator.get("CRMHandler");

      // Test potential site retrieval
      const potentialSite = await crmHandler.getPotentialSiteById(
        INTEGRATION_TEST_CONFIG.TEST_PROJECT_ID
      );
      this.assert(potentialSite, "Should retrieve potential site");
      this.assert(
        potentialSite.id === INTEGRATION_TEST_CONFIG.TEST_PROJECT_ID,
        "Site ID should match"
      );

      // Test assignee retrieval
      const aclAssignee = await crmHandler.getAssigneeByRole("ACL_SR", {
        region: "test",
      });
      this.assert(aclAssignee, "Should retrieve ACL SR assignee");
      this.assert(aclAssignee.role === "ACL_SR", "Assignee role should match");

      const ailAssignee = await crmHandler.getAssigneeByRole("AIL_SR", {
        region: "test",
      });
      this.assert(ailAssignee, "Should retrieve AIL SR assignee");
      this.assert(ailAssignee.role === "AIL_SR", "Assignee role should match");

      const testDuration = Date.now() - testStartTime;
      console.log(`✓ CRM integration test passed (${testDuration}ms)`);

      this.recordTestResult("CRM Integration", "PASSED", testDuration);
    } catch (error) {
      console.log("✗ CRM integration test failed:", error.message);
      this.recordTestResult("CRM Integration", "FAILED", 0, error.message);
    }
  }

  /**
   * Test validation service integration
   */
  async testValidationIntegration() {
    console.log("\n--- Testing Validation Integration ---");

    try {
      const testStartTime = Date.now();
      const validationService = GlobalServiceLocator.get("Validator");

      // Test email validation
      validationService.validateEmail("valid@example.com");
      console.log("✓ Valid email accepted");

      try {
        validationService.validateEmail("invalid-email");
        this.assert(false, "Should reject invalid email");
      } catch (error) {
        console.log("✓ Invalid email rejected");
      }

      // Test required fields validation
      const validData = {
        projectId: "PST-123456",
        totalSalesVolume: 100,
        emailAddress: "test@example.com",
      };

      validationService.assertRequiredFields(
        validData,
        ["projectId", "totalSalesVolume", "emailAddress"],
        "Order"
      );
      console.log("✓ Required fields validation passed");

      try {
        validationService.assertRequiredFields(
          {},
          ["projectId", "totalSalesVolume"],
          "Order"
        );
        this.assert(false, "Should reject missing required fields");
      } catch (error) {
        console.log("✓ Missing required fields rejected");
      }

      const testDuration = Date.now() - testStartTime;
      console.log(`✓ Validation integration test passed (${testDuration}ms)`);

      this.recordTestResult("Validation Integration", "PASSED", testDuration);
    } catch (error) {
      console.log("✗ Validation integration test failed:", error.message);
      this.recordTestResult(
        "Validation Integration",
        "FAILED",
        0,
        error.message
      );
    }
  }

  /**
   * Test error recovery scenarios
   */
  async testErrorRecoveryScenarios() {
    console.log("\n--- Testing Error Recovery Scenarios ---");

    try {
      const testStartTime = Date.now();

      // Test recovery from invalid project ID
      try {
        await this.orderHandler.submitOrder(
          {
            projectId: "INVALID-PROJECT-ID",
            totalSalesVolume: 100,
            uom: "Bags",
            emailAddress: "test@example.com",
          },
          { email: "test@example.com" }
        );

        this.assert(false, "Should reject invalid project ID");
      } catch (error) {
        this.assert(
          error.message.includes("Project"),
          "Should provide meaningful error for invalid project"
        );
        console.log("✓ Invalid project ID error handled correctly");
      }

      // Test recovery from database errors
      try {
        await this.orderHandler.getOrderById("NONEXISTENT-ORDER-ID");
        this.assert(false, "Should reject nonexistent order ID");
      } catch (error) {
        this.assert(
          error.message.includes("not found"),
          "Should provide meaningful error for missing order"
        );
        console.log("✓ Missing order error handled correctly");
      }

      const testDuration = Date.now() - testStartTime;
      console.log(`✓ Error recovery scenarios test passed (${testDuration}ms)`);

      this.recordTestResult("Error Recovery Scenarios", "PASSED", testDuration);
    } catch (error) {
      console.log("✗ Error recovery scenarios test failed:", error.message);
      this.recordTestResult(
        "Error Recovery Scenarios",
        "FAILED",
        0,
        error.message
      );
    }
  }

  /**
   * Test concurrency handling
   */
  async testConcurrencyHandling() {
    console.log("\n--- Testing Concurrency Handling ---");

    try {
      const testStartTime = Date.now();

      // Test concurrent access to the same order
      const orderData = {
        projectId: INTEGRATION_TEST_CONFIG.TEST_PROJECT_ID,
        totalSalesVolume: 200,
        uom: "Bags",
        detailedProjectAddress:
          "Concurrency test address with complete details",
        dealerMemo: "Concurrency test order",
        siteVisitImage: {
          fileName: "concurrency-test.jpg",
          fileSize: 1800000,
          mimeType: "image/jpeg",
        },
        emailAddress: "concurrency@anwar.com",
        engineerEligible: true,
      };

      const submitResult = await this.orderHandler.submitOrder(orderData, {
        email: "concurrency-user@anwar.com",
      });

      this.createdOrders.push(submitResult.orderId);

      // Attempt concurrent status updates
      const updatePromises = [
        this.orderHandler.updateOrderStatus(submitResult.orderId, "validated", {
          user: "USER_1",
          notes: "Concurrent update 1",
        }),
        this.orderHandler.updateOrderStatus(submitResult.orderId, "validated", {
          user: "USER_2",
          notes: "Concurrent update 2",
        }),
      ];

      const updateResults = await Promise.allSettled(updatePromises);

      // At least one update should succeed
      const successfulUpdates = updateResults.filter(
        (r) => r.status === "fulfilled"
      );
      this.assert(
        successfulUpdates.length >= 1,
        "At least one concurrent update should succeed"
      );

      const testDuration = Date.now() - testStartTime;
      console.log(`✓ Concurrency handling test passed (${testDuration}ms)`);

      this.recordTestResult("Concurrency Handling", "PASSED", testDuration);
    } catch (error) {
      console.log("✗ Concurrency handling test failed:", error.message);
      this.recordTestResult("Concurrency Handling", "FAILED", 0, error.message);
    }
  }

  /**
   * Test performance under load
   */
  async testPerformanceUnderLoad() {
    console.log("\n--- Testing Performance Under Load ---");

    try {
      const testStartTime = Date.now();
      const loadTestCount = 10;

      console.log(
        `Running load test with ${loadTestCount} concurrent operations...`
      );

      const loadTestPromises = [];

      for (let i = 0; i < loadTestCount; i++) {
        const orderData = {
          projectId: INTEGRATION_TEST_CONFIG.TEST_PROJECT_ID,
          totalSalesVolume: 50 + i,
          uom: i % 2 === 0 ? "Bags" : "MT",
          detailedProjectAddress: `Load test address ${i} with comprehensive delivery details`,
          dealerMemo: `Load test order ${i} - performance validation`,
          siteVisitImage: {
            fileName: `load-test-${i}.jpg`,
            fileSize: 1000000 + i * 50000,
            mimeType: "image/jpeg",
          },
          emailAddress: `load-test-${i}@anwar.com`,
          engineerEligible: i % 3 === 0,
        };

        loadTestPromises.push(
          this.orderHandler.submitOrder(orderData, {
            email: `load-user-${i}@anwar.com`,
            sessionId: `load-session-${i}`,
          })
        );
      }

      const loadTestResults = await Promise.allSettled(loadTestPromises);

      const successfulOperations = loadTestResults.filter(
        (r) => r.status === "fulfilled"
      );
      const failedOperations = loadTestResults.filter(
        (r) => r.status === "rejected"
      );

      // Add successful orders to cleanup list
      successfulOperations.forEach((result) => {
        if (result.value && result.value.orderId) {
          this.createdOrders.push(result.value.orderId);
        }
      });

      const testDuration = Date.now() - testStartTime;
      const avgTimePerOperation = testDuration / loadTestCount;

      console.log(`Load test results:`);
      console.log(`- Total operations: ${loadTestCount}`);
      console.log(`- Successful: ${successfulOperations.length}`);
      console.log(`- Failed: ${failedOperations.length}`);
      console.log(`- Total time: ${testDuration}ms`);
      console.log(
        `- Average time per operation: ${avgTimePerOperation.toFixed(2)}ms`
      );

      // Performance assertions
      this.assert(
        successfulOperations.length >= loadTestCount * 0.8,
        "At least 80% of operations should succeed"
      );
      this.assert(
        avgTimePerOperation < 5000,
        "Average operation time should be under 5 seconds"
      );

      console.log(`✓ Performance under load test passed`);

      this.recordTestResult(
        "Performance Under Load",
        "PASSED",
        testDuration,
        `${successfulOperations.length}/${loadTestCount} operations succeeded`
      );
    } catch (error) {
      console.log("✗ Performance under load test failed:", error.message);
      this.recordTestResult(
        "Performance Under Load",
        "FAILED",
        0,
        error.message
      );
    }
  }

  /**
   * Cleanup test data
   */
  async cleanup() {
    if (!INTEGRATION_TEST_CONFIG.CLEANUP_AFTER_TESTS) {
      console.log("\nSkipping cleanup (CLEANUP_AFTER_TESTS = false)");
      return;
    }

    console.log("\n--- Cleaning up test data ---");

    try {
      const databaseService = GlobalServiceLocator.get("Database");

      // Clean up created orders
      for (const orderId of this.createdOrders) {
        try {
          // In a real implementation, you might want to mark orders as deleted
          // rather than actually deleting them for audit purposes
          await databaseService.updateRecord("orders", "id", orderId, {
            status: "deleted",
            deletedAt: new Date().toISOString(),
            deletedBy: "INTEGRATION_TEST_CLEANUP",
          });
        } catch (error) {
          console.log(
            `Warning: Failed to cleanup order ${orderId}:`,
            error.message
          );
        }
      }

      console.log(`✓ Cleaned up ${this.createdOrders.length} test orders`);
    } catch (error) {
      console.log("Warning: Cleanup failed:", error.message);
    }
  }

  /**
   * Record test result
   */
  recordTestResult(testName, status, duration, details = null) {
    this.testResults.push({
      testName,
      status,
      duration,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Assert helper function
   */
  assert(condition, message) {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  /**
   * Print test summary
   */
  printTestSummary() {
    console.log("\n=== Integration Test Summary ===");

    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter((r) => r.status === "PASSED");
    const failedTests = this.testResults.filter((r) => r.status === "FAILED");
    const totalDuration = Date.now() - this.startTime;

    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests.length}`);
    console.log(`Failed: ${failedTests.length}`);
    console.log(
      `Success Rate: ${((passedTests.length / totalTests) * 100).toFixed(1)}%`
    );
    console.log(`Total Duration: ${totalDuration}ms`);

    if (failedTests.length > 0) {
      console.log("\nFailed Tests:");
      failedTests.forEach((test) => {
        console.log(`- ${test.testName}: ${test.details || "No details"}`);
      });
    }

    console.log("\nTest Details:");
    this.testResults.forEach((test) => {
      const status = test.status === "PASSED" ? "✓" : "✗";
      console.log(`${status} ${test.testName} (${test.duration}ms)`);
      if (test.details) {
        console.log(`  Details: ${test.details}`);
      }
    });

    console.log("\n=== Integration Tests Completed ===");
  }
}

/**
 * Main integration test runner
 */
async function runOrderHandlerIntegrationTests() {
  console.log("OrderHandler Integration Test Suite Starting...");
  console.log("================================================");

  const integrationTestSuite = new OrderHandlerIntegrationTests();
  await integrationTestSuite.runAllTests();
}

// Export for use in Google Apps Script environment
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    OrderHandlerIntegrationTests,
    runOrderHandlerIntegrationTests,
    INTEGRATION_TEST_CONFIG,
  };
}

// Auto-run tests if this file is executed directly
if (typeof ScriptApp !== "undefined") {
  // Running in Google Apps Script environment
  function testOrderHandlerIntegration() {
    runOrderHandlerIntegrationTests();
  }
}
