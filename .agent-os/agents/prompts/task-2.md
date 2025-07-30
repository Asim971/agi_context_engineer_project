Agent Role: Backend Development Agent

Task Objective: Implement Task 2 from tasks.json: Centralize all manual dependency injections and registrations in the GlobalServiceLocator, remove any direct global variable usages and fallback mechanisms, and add comprehensive tests for the injection process. Ensure the implementation maintains current functionality, adheres to Google Apps Script constraints, and prepares for future enhancements as per the project roadmap.

Key Requirements and Constraints:

Centralize all service registrations in a single bootstrap file (e.g., 01_ServiceBootstrap.js), eliminating duplicates and direct global assignments.
Remove all fallback mechanisms (e.g., manual injections or globalThis usages) to enforce strict dependency injection.
Implement early error throwing for missing services with descriptive messages.
Add unit tests covering 100% of injection scenarios, including success cases, missing dependencies, and error handling.
Follow DI best practices: prefer constructor injection and avoid fallbacks.
Limit changes to affected files only; avoid unnecessary modifications.
Ensure compatibility with Google Apps Script V8 runtime, execution limits (e.g., 6-minute timeouts), and quota management.
Maintain GDPR compliance, role-based access, and audit logging where applicable.
Business Context (from Context Engineering Framework):

Align with stakeholder needs: CRO for approval workflows, BDO for site assessments, SR for retailer management, and CRM for data verification.
Support business objectives: Streamline registration, approval, and notification workflows in the Anwar Sales Management System.
Incorporate success metrics: Sub-3s response times, 99.5% availability, <1% error rate.
Reference: mission.md, sales-eco-spec.md.
Technical Context (from Context Engineering Framework):

Technology Stack: Google Apps Script (ES6+), Google Sheets for MVP database, MyTAPI for WhatsApp integrations.
Architecture: Service-oriented with dependency injection via GlobalServiceLocator.
Platform Constraints: Handle API quotas, single-threaded execution, memory limits; use batch operations and caching.
Performance Targets: Optimize for concurrency, implement retry logic with exponential backoff.
Security: Use PropertiesService for configs, input sanitization, no exposure of sensitive data.
Reference: project-config.md.
Domain Context (from Context Engineering Framework):

Business Processes: Registration workflows for contractors, engineers, retailers, potential sites; approval mechanisms and notifications.
Data Models: Entities like registrations with fields (name, email, phone, status, audit trails).
Integration: Google Workspace APIs, WhatsApp notifications; prepare for future PWA and analytics.
Compliance: GDPR, data encryption, audit logging.
Historical Context (from Context Engineering Framework):

Build on Task 1 completions: Refactored global assignments in BaseService.js and related files using DI.
Lessons Learned: Avoid load order issues; ensure tests pass without ReferenceErrors.
Performance Data: Previous refactorings improved stability; apply similar patterns here.
AI Guidelines Integration (from ai-guidelines.md):

Use modern JavaScript (ES6+): const/let, arrow functions, async/await, destructuring.
Implement comprehensive error handling with custom classes (e.g., AppScriptError) and retries.
Optimize performance: Batch operations, caching, quota monitoring.
Prompt Engineering: Chain-of-thought for complex logic; reference prompt-library.md for templates.
Task-Oriented: Break into subtasks with dependencies; track progress.
Reference: ai-guidelines.md.
Code Standards Integration (from code-standards.md):

Modularity: Single responsibility per function/class; use composition over inheritance.
Error Handling: Custom errors with context; graceful degradation.
Security: API key management, validation, audit logging.
Documentation: JSDoc for functions; inline comments for logic.
Testing: 80%+ coverage; unit and integration tests.
Reference: code-standards.md.
Subtasks (from Task 2):

1.
Audit all files for manual injections and fallbacks (e.g., search codebase for globalThis or direct assignments).
2.
Update GlobalServiceLocator with centralized registrations in the bootstrap file.
3.
Remove fallbacks and implement strict error throwing.
4.
Add and run unit tests for validation.
Implementation Steps:

1.
Audit Phase: Use search tools to identify all instances of manual DI and fallbacks in files like BaseService.js, DatabaseService.js, etc.
2.
Centralization: Modify 01_ServiceBootstrap.js to handle all registrations; inject dependencies via constructors.
3.
Removal and Error Handling: Replace fallbacks with locator lookups; throw descriptive errors if services are missing.
4.
Testing: Create tests in a new file (e.g., TestDependencyInjection.js) covering all scenarios; run and verify.
5.
Documentation: Add JSDoc and comments; update README if needed.
6.
Validation: Ensure no breaking changes; test with existing scripts like COMPREHENSIVE_RESOLUTION_VERIFICATION.js.
Expected Output:

Updated files: List affected files (e.g., GlobalServiceLocator.js, bootstrap files, services).
Test results: Confirmation that tests pass with 100% coverage.
Documentation: Changelog of changes.
Verification: Run full system tests to confirm functionality.
Quality Criteria:

Code aligns with all referenced guidelines.
No performance regression.
Comprehensive error handling and logging.
Prepare for EM review: Functionality preservation, DI best practices, test coverage.
Edge Cases and Error Handling:

Handle missing dependencies gracefully with errors.
Test under quota limits and high load.
Ensure backward compatibility with legacy code.
Proceed with implementation, ensuring all changes are testable and documented.
