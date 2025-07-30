5:54:05 PM	Notice	Execution started
5:54:05 PM	Info	✅ Config registered globally
5:54:05 PM	Info	🏗️ Loading Foundation...
5:54:05 PM	Info	✅ Foundation loaded successfully - BaseService is now globally available
5:54:05 PM	Info	🔍 Verifying Foundation...
5:54:05 PM	Info	✅ PASS: BaseService Definition - BaseService class is defined
5:54:05 PM	Info	❌ ERROR: BaseService Instantiation - Cannot read properties of undefined (reading 'get')
5:54:05 PM	Info	❌ ERROR: Service Methods - Cannot read properties of undefined (reading 'get')
5:54:05 PM	Info	✅ PASS: Global Accessibility - BaseService is globally accessible
5:54:05 PM	Info
🏁 Foundation Verification: ❌ SOME TESTS FAILED
5:54:05 PM	Info	✅ GlobalServiceLocator initialized and registered in global scope
5:54:05 PM	Info	Auto-bootstrapping services...
5:54:05 PM	Info	[ServiceBootstrap] === Service Bootstrap Started === {}
5:54:05 PM	Info	[ServiceBootstrap] Registering core services... {}
5:54:05 PM	Info	[2025-07-30T11:54:05.909Z] GSL-INFO: Service registered: Config { singleton: true, dependencies: [], eager: true }
5:54:05 PM	Info	[2025-07-30T11:54:05.914Z] GSL-INFO: Service registered: DatabaseService { singleton: true, dependencies: [ 'Config' ], eager: false }
5:54:05 PM	Info	[2025-07-30T11:54:05.916Z] GSL-INFO: Service registered: HandlerService { singleton: false,
  dependencies: [ 'Config', 'DatabaseService' ],
  eager: false }
5:54:05 PM	Info	[2025-07-30T11:54:05.918Z] GSL-INFO: Service registered: BaseService { singleton: false, dependencies: [], eager: false }
5:54:05 PM	Info	[2025-07-30T11:54:05.920Z] GSL-INFO: Service registered: Logger { singleton: true, dependencies: [], eager: true }
5:54:05 PM	Info	[ServiceBootstrap] Core services registered successfully {}
5:54:05 PM	Info	[2025-07-30T11:54:05.922Z] GSL-INFO: Initializing all registered services {}
5:54:05 PM	Info	[ServiceBootstrap] Config service factory executed successfully {}
5:54:05 PM	Info	[2025-07-30T11:54:05.924Z] GSL-INFO: Service instantiated: Config {}
5:54:05 PM	Info	[ServiceBootstrap] Logger service factory executed successfully {}
5:54:05 PM	Info	[2025-07-30T11:54:05.926Z] GSL-INFO: Service instantiated: Logger {}
5:54:05 PM	Info	[2025-07-30T11:54:05.927Z] GSL-INFO: Service initialization complete { totalServices: 5, initializedServices: 2 }
5:54:05 PM	Info	[ServiceBootstrap] Validating critical services... {}
5:54:05 PM	Error	[2025-07-30T11:54:05.932Z] GSL-ERROR: Failed to instantiate service: DatabaseService { error: 'DatabaseService class not defined. Ensure DatabaseService.js is loaded.',
  stack: 'Error: DatabaseService class not defined. Ensure DatabaseService.js is loaded.\n    at Object.factory (01_ServiceBootstrap:56:21)\n    at Object.createInstance (00_GlobalServiceLocator:142:23)\n    at Object.get (00_GlobalServiceLocator:106:31)\n    at Object.validateCriticalServices (01_ServiceBootstrap:219:41)\n    at Object.bootstrap (01_ServiceBootstrap:188:14)\n    at 01_ServiceBootstrap:263:39\n    at 01_ServiceBootstrap:278:3' }
5:54:05 PM	Info	[ServiceBootstrap] Service validation failed { error: 'Service instantiation failed for \'DatabaseService\': DatabaseService class not defined. Ensure DatabaseService.js is loaded.',
  completedValidations: [ 'Config: ✅' ] }
5:54:05 PM	Info	[ServiceBootstrap] === Service Bootstrap Failed === { error: 'Service instantiation failed for \'DatabaseService\': DatabaseService class not defined. Ensure DatabaseService.js is loaded.' }
5:54:05 PM	Error	❌ Auto-bootstrap error: [Error: Service instantiation failed for 'DatabaseService': DatabaseService class not defined. Ensure DatabaseService.js is loaded.]
5:54:05 PM	Info	✅ Strict dependency injection enforced - use GlobalServiceLocator for all service access
5:54:05 PM	Info	✅ ServiceBootstrap initialized and ready
5:54:05 PM	Info
🔄 Auto-running Foundation tests in test environment...
5:54:06 PM	Info
🧪 === FOUNDATION TESTS STARTING ===
5:54:06 PM	Info
📋 Testing: Core Dependencies
5:54:06 PM	Info	  ✅ BaseService Availability: BaseService is defined and accessible
5:54:06 PM	Info	  ✅ Config Availability: Config object is available
5:54:06 PM	Info	  ✅ Global Access: BaseService is globally accessible
5:54:06 PM	Info
📋 Testing: BaseService Functionality
5:54:06 PM	Error	[2025-07-30T11:54:06.050Z] GSL-ERROR: Service not found: ErrorHandler { availableServices:
   [ 'Config',
     'DatabaseService',
     'HandlerService',
     'BaseService',
     'Logger' ] }
5:54:06 PM	Info	  ❌ Instantiation: ERROR - Service 'ErrorHandler' not registered in GlobalServiceLocator
5:54:06 PM	Error	[2025-07-30T11:54:06.053Z] GSL-ERROR: Service not found: ErrorHandler { availableServices:
   [ 'Config',
     'DatabaseService',
     'HandlerService',
     'BaseService',
     'Logger' ] }
5:54:06 PM	Info	  ❌ Method Availability: ERROR - Service 'ErrorHandler' not registered in GlobalServiceLocator
5:54:06 PM	Error	[2025-07-30T11:54:06.055Z] GSL-ERROR: Service not found: ErrorHandler { availableServices:
   [ 'Config',
     'DatabaseService',
     'HandlerService',
     'BaseService',
     'Logger' ] }
5:54:06 PM	Info	  ❌ Error Handling: ERROR - Service 'ErrorHandler' not registered in GlobalServiceLocator
5:54:06 PM	Info
📋 Testing: Service Inheritance
5:54:06 PM	Warning	DatabaseService not found - skipping inheritance test
5:54:06 PM	Info	  ✅ DatabaseService Inheritance: DatabaseService extends BaseService correctly
5:54:06 PM	Warning	BDLeadHandlerService not found - skipping inheritance test
5:54:06 PM	Info	  ✅ BDLeadHandlerService Inheritance: BDLeadHandlerService extends BaseService correctly
5:54:06 PM	Info
📋 Testing: Original Error Resolution
5:54:06 PM	Error	[2025-07-30T11:54:06.064Z] GSL-ERROR: Service not found: ErrorHandler { availableServices:
   [ 'Config',
     'DatabaseService',
     'HandlerService',
     'BaseService',
     'Logger' ] }
5:54:06 PM	Info	  ✅ No ReferenceError for BaseService: No ReferenceError when extending BaseService
5:54:06 PM	Error	[2025-07-30T11:54:06.066Z] GSL-ERROR: Service not found: ErrorHandler { availableServices:
   [ 'Config',
     'DatabaseService',
     'HandlerService',
     'BaseService',
     'Logger' ] }
5:54:06 PM	Info	  ✅ Logger Property Access: No undefined property access errors
5:54:06 PM	Info
⚠️ === FOUNDATION TESTS COMPLETE ===
5:54:06 PM	Info	📊 Results: 7/10 tests passed (70.0%)
5:54:06 PM	Info	❌ Failed tests: 3
5:54:06 PM	Info	📋 Failures:
5:54:06 PM	Info	  • BaseService Functionality - Instantiation: Service 'ErrorHandler' not registered in GlobalServiceLocator
5:54:06 PM	Info	  • BaseService Functionality - Method Availability: Service 'ErrorHandler' not registered in GlobalServiceLocator
5:54:06 PM	Info	  • BaseService Functionality - Error Handling: Service 'ErrorHandler' not registered in GlobalServiceLocator
5:54:06 PM	Info
🎯 Testing Original Error Scenario...
5:54:06 PM	Info	  🧪 Testing BaseService inheritance...
5:54:06 PM	Error	[2025-07-30T11:54:06.078Z] GSL-ERROR: Service not found: ErrorHandler { availableServices:
   [ 'Config',
     'DatabaseService',
     'HandlerService',
     'BaseService',
     'Logger' ] }
5:54:06 PM	Info	  ❌ Test failed with error: Service 'ErrorHandler' not registered in GlobalServiceLocator
5:54:06 PM	Info
📋 FINAL VERIFICATION SUMMARY:
5:54:06 PM	Info	Foundation tests: PARTIAL (70.0% passed)
5:54:06 PM	Info	Original error resolution: PARTIAL
5:54:06 PM	Info
⚠️ Some issues remain. Review the test results above.
5:54:06 PM	Info	✅ Foundation verified - BaseService available for inheritance
5:54:06 PM	Info	Anwar Sales Ecosystem - Unified Apps Script loaded
5:54:06 PM	Info	DatabaseService registered globally
5:54:06 PM	Error	[2025-07-30T11:54:06.088Z] GSL-ERROR: Failed to instantiate service: HandlerService { error: 'HandlerService class not defined. Ensure HandlerService.js is loaded.',
  stack: 'Error: HandlerService class not defined. Ensure HandlerService.js is loaded.\n    at Object.factory (01_ServiceBootstrap:71:21)\n    at Object.createInstance (00_GlobalServiceLocator:142:23)\n    at Object.get (00_GlobalServiceLocator:106:31)\n    at handlers/BDLeadHandler_Enhanced:21:50\n    at handlers/BDLeadHandler_Enhanced:397:3' }
5:54:06 PM	Warning	⚠️ BDLeadHandler_Enhanced: ServiceLocator failed, trying direct access { error: 'Service instantiation failed for \'HandlerService\': HandlerService class not defined. Ensure HandlerService.js is loaded.' }
5:54:07 PM	Error
Error: HandlerService not available through any method. Ensure proper service initialization.
(anonymous)	@ handlers/BDLeadHandler_Enhanced.gs:36
(anonymous)	@ handlers/BDLeadHandler_Enhanced.gs:397
