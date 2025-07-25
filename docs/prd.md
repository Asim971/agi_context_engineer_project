



# Product Requirements Document (PRD): Contractor Registration System

## Objectives
The primary goal of this system is to streamline the contractor registration process for the Anwar Sales Management platform. This involves enabling Customer Relationship Officers (CROs) to submit contractor details via a secure form, store the data reliably in a backend database, notify relevant parties, and allow verification and approval through a CRM interface integrated with Google Sheets. The system aims to:
- Improve efficiency in contractor onboarding by automating notifications, data storage, and cleanup.
- Ensure data accuracy and security through verification steps and timed data removal.
- Facilitate scalability for handling multiple registrations while maintaining traceability and compliance (e.g., NID verification).
- Support business growth by providing a structured workflow for contractor management, reducing manual errors and processing time.

Key business outcomes include faster registration approvals, reduced administrative overhead, and enhanced data integrity for sales management operations.

## User Journeys
This section details the end-to-end user interaction flows based on the analyzed PlantUML diagram, incorporating user-confirmed adjustments. The journey emphasizes step-by-step processes, roles, and decision points.

### Primary User Journey: Contractor Registration and Verification
**Role:** Customer Relationship Officer (CRO)

1. **Initiate Registration:**
   - CRO logs in to Google.
   - CRO opens the Google Form for Contractor Registration.

2. **Submit Contractor Details:**
   - Enter Contractor Name.
   - Enter Bkash Number.
   - Enter Contact Number.
   - Enter NID No.
   - Upload NID document.
   - Submit the form.

3. **Notification and Data Storage:**
   - System sends a WhatsApp notification to the CRO confirming submission.
   - Submitted data is stored in the backend database and mirrored to Google Sheets for verification.

4. **Verification and Approval (CRM Role):**
   - CRM user views the contractor data in Google Sheets via the CRM interface.
   - CRM user verifies the data (e.g., checks NID validity, completeness).
   - CRM user approves or rejects the registration.

5. **Post-Verification Cleanup and Final Notification:**
   - System sends a WhatsApp notification to the CRO with the approval or rejection status.
   - After 48 hours of the verification decision, data is automatically removed from Google Sheets to maintain cleanliness, while retained in the backend database.

**Decision Points:**
- During verification: Approve if all data is valid and complete; reject if issues are found (e.g., invalid NID).

**Alternative Flows:**
- If submission fails (e.g., network error), CRO receives an error message and can retry.
- Rejected registrations allow CRO to resubmit corrected details.

This journey ensures a seamless, auditable process from submission to approval, with notifications limited to the CRO for submission confirmation and backend data management for long-term storage.

## User Stories
User stories are defined with clear roles, actions, and outcomes, traced back to the user journey and objectives.

1. **As a CRO, I want to submit contractor details via Google Form so that I can efficiently register new contractors.**
   - Traces to: Journey Steps 1-2; Objective: Improve efficiency.

2. **As a system, I want to notify the CRO via WhatsApp upon submission so that they are informed of the status immediately.**
   - Traces to: Journey Step 3; Objective: Reduce administrative overhead.

3. **As a system, I want to store submitted data in a backend database and mirror it to Google Sheets so that data is secure and accessible for verification.**
   - Traces to: Journey Step 3; Objective: Enhance data integrity.

4. **As a CRM user, I want to view and verify submitted data in Google Sheets so that I can ensure accuracy and compliance.**
   - Traces to: Journey Step 4; Objective: Enhance data integrity.

5. **As a CRM user, I want to approve or reject registrations so that only valid contractors are onboarded.**
   - Traces to: Journey Step 4 (Decision Point); Objective: Support business growth.

6. **As a system, I want to notify the CRO of approval/rejection via WhatsApp so that they can take follow-up actions.**
   - Traces to: Journey Step 5; Objective: Faster registration approvals.

7. **As a system, I want to automatically remove verified data from Google Sheets after 48 hours so that the sheet remains clean and focused on pending verifications.**
   - Traces to: Journey Step 5; Objective: Reduce administrative overhead.

## Acceptance Criteria
Explicit, measurable criteria for each user story to ensure successful completion. These are traceable to user stories and journeys.

1. **User Story 1:**
   - Google Form must include fields for Contractor Name, Bkash Number, Contact Number, NID No, and NID Upload.
   - Form submission succeeds only if all required fields are filled and NID is uploaded.
   - Submission integrates with backend DB and Google Sheets.
   - Verified by: Successful form submission populates both DB and Sheets without errors.

2. **User Story 2:**
   - WhatsApp notification is sent only to the CRO upon submission.
   - Notification includes submission confirmation and a reference ID.
   - Verified by: Log confirms notification delivery to CRO's registered number.

3. **User Story 3:**
   - Data is stored in backend DB with all fields and timestamps.
   - Mirrored to Google Sheets in real-time.
   - Verified by: Data appears in both systems post-submission.

4. **User Story 4:**
   - CRM interface displays data from Google Sheets in a readable format.
   - Verification tools allow checking NID validity (e.g., format validation).
   - Verified by: CRM user can access and view new entries within 5 minutes of submission.

5. **User Story 5:**
   - Approval/Rejection buttons update the status in both DB and Google Sheets.
   - Rejection requires a reason field (e.g., invalid NID).
   - Verified by: Status changes are reflected immediately, and audit logs capture the action.

6. **User Story 6:**
   - Notification includes approval/rejection details and next steps.
   - Sent only to CRO.
   - Verified by: Notification is triggered post-verification and confirmed via logs.

7. **User Story 7:**
   - Automated job removes data from Google Sheets exactly 48 hours after verification decision.
   - Data remains intact in backend DB.
   - Verified by: Sheets entry is deleted after 48 hours, confirmed by logs; DB retains the record.

## Technical Requirements
This section outlines technologies, data management, integrations, performance, and scalability needs.

- **Technologies:**
  - Frontend: Google Forms for submission interface.
  - Backend: Database (e.g., PostgreSQL or MongoDB) for persistent storage; Google Apps Script or serverless functions (e.g., AWS Lambda) for automation.
  - Notifications: WhatsApp Business API for automated messaging.
  - Authentication: Google OAuth for login.

- **Data Management:**
  - Primary storage in backend DB with columns for all form fields, submission timestamp, status (Pending/Approved/Rejected), verification notes, and decision timestamp.
  - Mirror to Google Sheets for verification purposes only.
  - Automated cleanup: Remove from Sheets after 48 hours of decision; retain indefinitely in DB.
  - Ensure data encryption for sensitive info (e.g., NID).
  - Retention: DB records kept for at least 5 years for compliance.

- **Integration Points:**
  - Google Forms to backend DB and Sheets (via webhooks or Apps Script).
  - Google Sheets to CRM (via API or Google Apps Script).
  - WhatsApp API integration for notifications (use webhooks for triggers).
  - Scheduled job (e.g., cron) for 48-hour cleanup.

- **Performance and Scalability:**
  - Handle up to 100 submissions per day initially, scalable to 500 with cloud resources.
  - Response time: Notifications sent within 10 seconds; cleanup jobs run reliably.
  - Availability: 99.9% uptime, using cloud infrastructure.
  - Security: Role-based access (CRO for submission, CRM for verification); data encryption in transit and at rest.

- **Non-Functional Requirements:**
  - Accessibility: Form compliant with WCAG 2.1.
  - Error Handling: Graceful failures with user-friendly messages and logging.

## UML Diagrams
To visually support the documentation, below is a refined PlantUML activity diagram with annotations incorporating the user's adjustments (e.g., CRO-only notifications, backend DB, Google Sheets cleanup). This diagram is annotated for clarity and traceability to the user journey.

```plantuml
autonumber
skinparam backgroundColor #f9f9f9
skinparam activityBackgroundColor #FFFFFF
skinparam activityBorderColor #FF6347
skinparam arrowColor #FF0000
title Contractor Registration Process

|Customer Relationship Officer (CRO)|
start
:Login to Google;
:Open Google Form;

|Contractor Registration Form|
:Enter Contractor Name;
:Enter Bkash Number;
:Enter Contact Number;
:Enter NID No;
:Upload NID;
:Submit;

|WhatsApp Notification|
:Notify CRO (Submission Confirmation);

|Backend Database|
:Store Contractor Data;

|Google Sheets (Verification)|
:Mirror Data for Verification;

|CRM|
:View Data in Google Sheets;
:Verify Data;
if (Verification) then (Pass)
  :Approve;
else (Fail)
  :Reject;
endif

|WhatsApp Notification|
:Notify CRO (Approval/Rejection Status);

|System Cleanup|
:Wait 48 Hours;
:Remove from Google Sheets;
note right: Data retained in Backend DB

stop
```

**Annotations:**
- **Swimlanes:** Represent roles/systems for clear responsibility mapping.
- **Decision Point:** Branch at verification traces to User Story 5.
- **Cleanup Step:** Added to reflect 48-hour removal from Sheets, tracing to User Story 7.
- **Integrations:** Notes on DB and Sheets emphasize technical requirements.
- This diagram aligns with the user journey and can be used for development planning.

---

# Engineer Registration System

## Objectives
The Engineer Registration System aims to streamline the registration and verification process for consultant engineers, ensuring compliance with professional standards and facilitating efficient project assignments.

**Primary Objectives:**
- Establish a standardized registration process for consultant engineers with comprehensive data collection including education, classification, and working areas.
- Implement dual notification system to both CRO and BDO for enhanced oversight and coordination.
- Ensure data integrity through CRM verification with approval/rejection workflow.
- Support scalability for managing multiple engineer registrations while maintaining professional standards compliance.
- Facilitate business growth by providing structured workflow for engineer management, reducing manual errors and processing time.

Key business outcomes include faster engineer onboarding, improved project assignment efficiency, enhanced professional compliance tracking, and reduced administrative overhead.

## User Journeys
This section details the end-to-end user interaction flows for engineer registration based on the analyzed PlantUML diagram.

### Primary User Journey: Engineer Registration and Verification
**Role:** Business Development Officer (BDO)

1. **Initiate Registration:**
   - BDO logs in to Google.
   - BDO opens the Google Form for Engineer Registration.

2. **Submit Engineer Details:**
   - Enter Engineer Name.
   - Enter Engineer ID.
   - Enter Contact information.
   - Enter Address details.
   - Enter Organization details.
   - Specify Working Area.
   - Assign Concerned BDO.
   - Enter Education qualifications.
   - Specify Classification (e.g., Civil, Electrical, Mechanical).
   - Submit the form.

3. **Notification and Data Storage:**
   - System sends WhatsApp notifications to both CRO and BDO confirming submission.
   - Submitted data is stored in the backend database and mirrored to Google Sheets for verification.

4. **Verification and Approval (CRM Role):**
   - CRM user views the engineer data in Google Sheets via the CRM interface.
   - CRM user verifies the data (e.g., checks education credentials, classification validity, completeness).
   - CRM user approves or rejects the registration.

5. **Post-Verification Cleanup and Final Notification:**
   - System sends WhatsApp notifications to both CRO and BDO with the approval or rejection status.
   - After 48 hours of the verification decision, data is automatically removed from Google Sheets to maintain cleanliness, while retained in the backend database.

**Decision Points:**
- During verification: Approve if all data is valid, education credentials are verified, and classification is appropriate; reject if issues are found.

**Alternative Flows:**
- If submission fails, BDO receives an error message and can retry.
- Rejected registrations allow BDO to resubmit corrected details.

## User Stories
User stories for engineer registration with clear roles, actions, and outcomes.

1. **As a BDO, I want to submit engineer details via Google Form so that I can efficiently register new consultant engineers.**
   - Traces to: Journey Steps 1-2; Objective: Improve efficiency.

2. **As a system, I want to notify both CRO and BDO via WhatsApp upon submission so that they are informed of the status immediately.**
   - Traces to: Journey Step 3; Objective: Enhanced oversight and coordination.

3. **As a system, I want to store submitted data in a backend database and mirror it to Google Sheets so that data is secure and accessible for verification.**
   - Traces to: Journey Step 3; Objective: Enhance data integrity.

4. **As a CRM user, I want to view and verify submitted engineer data in Google Sheets so that I can ensure professional compliance and accuracy.**
   - Traces to: Journey Step 4; Objective: Professional standards compliance.

5. **As a CRM user, I want to approve or reject engineer registrations so that only qualified engineers are onboarded.**
   - Traces to: Journey Step 4 (Decision Point); Objective: Support business growth.

6. **As a system, I want to notify both CRO and BDO of approval/rejection via WhatsApp so that they can take follow-up actions.**
   - Traces to: Journey Step 5; Objective: Faster engineer onboarding.

7. **As a system, I want to automatically remove verified data from Google Sheets after 48 hours so that the sheet remains clean and focused on pending verifications.**
   - Traces to: Journey Step 5; Objective: Reduce administrative overhead.

## Acceptance Criteria
Explicit, measurable criteria for each engineer registration user story.

1. **User Story 1:**
   - Google Form must include fields for Engineer Name, ID, Contact, Address, Organization details, Working Area, Concerned BDO, Education, and Classification.
   - Form submission succeeds only if all required fields are filled.
   - Submission integrates with backend DB and Google Sheets.
   - Verified by: Successful form submission populates both DB and Sheets without errors.

2. **User Story 2:**
   - WhatsApp notifications are sent to both CRO and BDO upon submission.
   - Notifications include submission confirmation and a reference ID.
   - Verified by: Log confirms notification delivery to both registered numbers.

3. **User Story 3:**
   - Data is stored in backend DB with all fields and timestamps.
   - Mirrored to Google Sheets in real-time.
   - Verified by: Data appears in both systems post-submission.

4. **User Story 4:**
   - CRM interface displays engineer data from Google Sheets in a readable format.
   - Verification tools allow checking education credentials and classification validity.
   - Verified by: CRM user can access and view new entries within 5 minutes of submission.

5. **User Story 5:**
   - Approval/Rejection buttons update the status in both DB and Google Sheets.
   - Rejection requires a reason field (e.g., invalid credentials, incomplete education).
   - Verified by: Status changes are reflected immediately, and audit logs capture the action.

6. **User Story 6:**
   - Notifications include approval/rejection details and next steps.
   - Sent to both CRO and BDO.
   - Verified by: Notifications are triggered post-verification and confirmed via logs.

7. **User Story 7:**
   - Automated job removes data from Google Sheets exactly 48 hours after verification decision.
   - Data remains intact in backend DB.
   - Verified by: Sheets entry is deleted after 48 hours, confirmed by logs; DB retains the record.

## Technical Requirements
Technical specifications for engineer registration system.

- **Technologies:**
  - Frontend: Google Forms for submission interface with enhanced fields for professional data.
  - Backend: Database with additional tables for engineer-specific data (education, classification, working areas).
  - Notifications: WhatsApp Business API for dual notifications (CRO and BDO).
  - Authentication: Google OAuth for login.

- **Data Management:**
  - Primary storage in backend DB with columns for all engineer form fields, including education credentials, classification, working area, concerned BDO assignment.
  - Enhanced data validation for professional credentials and classification standards.
  - Mirror to Google Sheets for verification purposes only.
  - Automated cleanup: Remove from Sheets after 48 hours of decision; retain indefinitely in DB.
  - Ensure data encryption for sensitive professional information.
  - Retention: DB records kept for at least 7 years for professional compliance.

- **Integration Points:**
  - Google Forms to backend DB and Sheets with enhanced field mapping.
  - Google Sheets to CRM with professional verification tools.
  - WhatsApp API integration for dual notifications.
  - Scheduled job for 48-hour cleanup.

- **Performance and Scalability:**
  - Handle up to 50 engineer submissions per day initially, scalable to 200.
  - Enhanced verification workflow for professional credentials.
  - Response time: Dual notifications sent within 10 seconds.
  - Availability: 99.9% uptime with professional data backup.

## UML Diagrams
PlantUML activity diagram for engineer registration process.

```plantuml
autonumber
skinparam backgroundColor #f0f8ff
skinparam activityBackgroundColor #FFFFFF
skinparam activityBorderColor #4169E1
skinparam arrowColor #0000FF
title Consultant Engineer Registration Process

|Business Development Officer (BDO)|
start
:Login to Google;
:Open Engineer Registration Form;

|Engineer Registration Form|
:Enter Engineer Name;
:Enter Engineer ID;
:Enter Contact;
:Enter Address;
:Enter Organization Details;
:Enter Working Area;
:Enter Concerned BDO;
:Enter Education;
:Enter Classification;
:Submit;

|WhatsApp Notification|
:Notify CRO (Submission Confirmation);
:Notify BDO (Submission Confirmation);

|Data Bank|
:Store Engineer Data;

|Google Sheets (Verification)|
:Mirror Data for Verification;

|CRM|
:View Engineer Data;
:Verify Credentials & Classification;
if (Verification) then (Pass)
  :Approve Engineer;
else (Fail)
  :Reject Engineer;
endif

|WhatsApp Notification|
:Notify CRO (Approval/Rejection Status);
:Notify BDO (Approval/Rejection Status);

|System Cleanup|
:Wait 48 Hours;
:Remove from Google Sheets;
note right: Data retained in Backend DB

stop
```

**Annotations:**
- **Dual Notifications:** Both CRO and BDO receive WhatsApp notifications for enhanced coordination.
- **Professional Data:** Enhanced form fields for education, classification, and working areas.
- **Verification Process:** CRM verifies professional credentials and classification standards.
- **Data Retention:** Professional compliance requires longer retention periods.
- This diagram supports professional engineer management and project assignment workflows.

---

# Retailer Registration System

## Objectives
The Retailer Registration System aims to streamline the registration and verification process for retail partners, ensuring comprehensive data collection for effective sales territory management and dealer network optimization.

**Primary Objectives:**
- Establish a standardized registration process for retailers with comprehensive business and location data collection including shop details, territory mapping, and dealer assignments.
- Implement triple notification system to SR, CRO, and BDO for enhanced sales coordination and territory management.
- Ensure data integrity through CRM verification with approval/rejection workflow and individual data sheet generation.
- Support scalability for managing multiple retailer registrations while maintaining territory compliance and dealer network standards.
- Facilitate business growth by providing structured workflow for retailer onboarding, reducing manual errors and improving sales territory coverage.

Key business outcomes include faster retailer onboarding, improved sales territory management, enhanced dealer network coordination, and reduced administrative overhead in retail partner management.

## User Journeys
This section details the end-to-end user interaction flows for retailer registration based on the analyzed draw.io swimlane diagram.

### Primary User Journey: Retailer Registration and Verification
**Role:** Sales Representative (SR)

1. **Initiate Registration:**
   - SR logs in to Google.
   - SR opens the Google Form for Retailer Registration.

2. **Submit Retailer Details:**
   - Enter Shop Name.
   - Enter Retailer Name.
   - Enter Phone Number.
   - Enter Shop Address.
   - Enter NID No.
   - Select Dealer assignment.
   - Specify Bazaar location.
   - Define Territory.
   - Enter Bkash Number.
   - Upload Photo.
   - Submit the form.

3. **Notification and Data Storage:**
   - System sends WhatsApp notification to SR confirming submission.
   - Submitted data is stored in the backend database (Data Bank) and mirrored to Google Sheets for verification.

4. **Verification and Approval (CRM Role):**
   - CRM user views the retailer data in Google Sheets via the CRM interface.
   - CRM user verifies the data (e.g., checks shop details, territory alignment, dealer assignment validity).
   - CRM user approves or rejects the registration.

5. **Post-Verification Cleanup and Final Notification:**
   - System sends WhatsApp notifications to SR, CRO, and BDO with the approval or rejection status.
   - Individual Data Sheet is generated for approved retailers.
   - After 48 hours of the verification decision, data is automatically removed from Google Sheets to maintain cleanliness, while retained in the backend database.

**Decision Points:**
- During verification: Approve if all data is valid, territory alignment is correct, and dealer assignment is appropriate; reject if issues are found.

**Alternative Flows:**
- If submission fails, SR receives an error message and can retry.
- Rejected registrations allow SR to resubmit corrected details.

## User Stories
User stories for retailer registration with clear roles, actions, and outcomes.

1. **As an SR, I want to submit retailer details via Google Form so that I can efficiently register new retail partners in my territory.**
   - Traces to: Journey Steps 1-2; Objective: Improve efficiency.

2. **As a system, I want to notify SR via WhatsApp upon submission so that they are informed of the status immediately.**
   - Traces to: Journey Step 3; Objective: Enhanced sales coordination.

3. **As a system, I want to store submitted data in a backend database and mirror it to Google Sheets so that data is secure and accessible for verification.**
   - Traces to: Journey Step 3; Objective: Enhance data integrity.

4. **As a CRM user, I want to view and verify submitted retailer data in Google Sheets so that I can ensure territory compliance and business validity.**
   - Traces to: Journey Step 4; Objective: Territory management standards.

5. **As a CRM user, I want to approve or reject retailer registrations so that only qualified retail partners are onboarded.**
   - Traces to: Journey Step 4 (Decision Point); Objective: Support business growth.

6. **As a system, I want to notify SR, CRO, and BDO of approval/rejection via WhatsApp so that they can coordinate follow-up actions.**
   - Traces to: Journey Step 5; Objective: Enhanced sales coordination.

7. **As a system, I want to generate individual data sheets for approved retailers so that they have proper documentation.**
   - Traces to: Journey Step 5; Objective: Improved sales territory management.

8. **As a system, I want to automatically remove verified data from Google Sheets after 48 hours so that the sheet remains clean and focused on pending verifications.**
   - Traces to: Journey Step 5; Objective: Reduce administrative overhead.

## Acceptance Criteria
Explicit, measurable criteria for each retailer registration user story.

1. **User Story 1:**
   - Google Form must include fields for Shop Name, Retailer Name, Phone Number, Shop Address, NID No, Dealer, Bazaar, Territory, Bkash Number, and Photo.
   - Form submission succeeds only if all required fields are filled and photo is uploaded.
   - Submission integrates with backend DB and Google Sheets.
   - Verified by: Successful form submission populates both DB and Sheets without errors.

2. **User Story 2:**
   - WhatsApp notification is sent to SR upon submission.
   - Notification includes submission confirmation and a reference ID.
   - Verified by: Log confirms notification delivery to SR's registered number.

3. **User Story 3:**
   - Data is stored in backend DB with all fields and timestamps.
   - Mirrored to Google Sheets in real-time.
   - Verified by: Data appears in both systems post-submission.

4. **User Story 4:**
   - CRM interface displays retailer data from Google Sheets in a readable format.
   - Verification tools allow checking territory alignment and dealer assignment validity.
   - Verified by: CRM user can access and view new entries within 5 minutes of submission.

5. **User Story 5:**
   - Approval/Rejection buttons update the status in both DB and Google Sheets.
   - Rejection requires a reason field (e.g., invalid territory, incorrect dealer assignment).
   - Verified by: Status changes are reflected immediately, and audit logs capture the action.

6. **User Story 6:**
   - Notifications include approval/rejection details and next steps.
   - Sent to SR, CRO, and BDO.
   - Verified by: Notifications are triggered post-verification and confirmed via logs.

7. **User Story 7:**
   - Individual data sheet is automatically generated for approved retailers.
   - Sheet includes all retailer information in a formatted layout.
   - Verified by: Data sheet is created and accessible within 10 minutes of approval.

8. **User Story 8:**
   - Automated job removes data from Google Sheets exactly 48 hours after verification decision.
   - Data remains intact in backend DB.
   - Verified by: Sheets entry is deleted after 48 hours, confirmed by logs; DB retains the record.

## Technical Requirements
Technical specifications for retailer registration system.

- **Technologies:**
  - Frontend: Google Forms for submission interface with enhanced fields for retail business data.
  - Backend: Database with additional tables for retailer-specific data (shop details, territory mapping, dealer assignments).
  - Notifications: WhatsApp Business API for triple notifications (SR, CRO, BDO).
  - Authentication: Google OAuth for login.
  - Document Generation: Automated individual data sheet creation system.

- **Data Management:**
  - Primary storage in backend DB with columns for all retailer form fields, including shop details, territory mapping, dealer assignments, and business verification data.
  - Enhanced data validation for territory compliance and dealer network standards.
  - Mirror to Google Sheets for verification purposes only.
  - Automated cleanup: Remove from Sheets after 48 hours of decision; retain indefinitely in DB.
  - Individual data sheet generation for approved retailers.
  - Ensure data encryption for sensitive business information.
  - Retention: DB records kept for at least 7 years for business compliance.

- **Integration Points:**
  - Google Forms to backend DB and Sheets with enhanced field mapping for retail data.
  - Google Sheets to CRM with territory management and dealer verification tools.
  - WhatsApp API integration for triple notifications.
  - Document generation system for individual data sheets.
  - Scheduled job for 48-hour cleanup.

- **Performance and Scalability:**
  - Handle up to 100 retailer submissions per day initially, scalable to 500.
  - Enhanced verification workflow for territory and dealer compliance.
  - Response time: Triple notifications sent within 10 seconds; data sheet generation within 10 minutes.
  - Availability: 99.9% uptime with retail data backup.

## UML Diagrams
PlantUML activity diagram for retailer registration process based on the draw.io swimlane analysis.

```plantuml
autonumber
skinparam backgroundColor #f5f5dc
skinparam activityBackgroundColor #FFFFFF
skinparam activityBorderColor #228B22
skinparam arrowColor #006400
title Retailer Registration Process

|Sales Representative (SR)|
start
:Login to Google;
:Open Retailer Registration Form;

|Registration Flow|
:Enter Shop Name;
:Enter Retailer Name;
:Enter Phone Number;
:Enter Shop Address;
:Enter NID No;
:Select Dealer;
:Specify Bazaar;
:Define Territory;
:Enter Bkash Number;
:Upload Photo;
:Submit;

|WhatsApp Notification|
:Notify SR (Submission Confirmation);

|Data Bank|
:Store Retailer Data;

|Google Sheets (Verification)|
:Mirror Data for Verification;

|CRM|
:View Retailer Data;
:Verify Territory & Dealer Assignment;
if (Verification) then (Pass)
  :Approve Retailer;
else (Fail)
  :Reject Retailer;
endif

|WhatsApp Notification|
:Notify SR (Approval/Rejection Status);
:Notify CRO (Approval/Rejection Status);
:Notify BDO (Approval/Rejection Status);

|Data Sheet|
if (Approved?) then (Yes)
  :Generate Individual Data Sheet;
else (No)
  :Skip Data Sheet Generation;
endif

|System Cleanup|
:Wait 48 Hours;
:Remove from Google Sheets;
note right: Data retained in Backend DB

stop
```

**Annotations:**
- **Triple Notifications:** SR, CRO, and BDO receive WhatsApp notifications for comprehensive sales coordination.
- **Retail Business Data:** Enhanced form fields for shop details, territory mapping, and dealer assignments.
- **Territory Management:** CRM verifies territory alignment and dealer assignment validity.
- **Individual Data Sheets:** Automated generation for approved retailers to support sales operations.
- **Sales Coordination:** This diagram supports retail partner management and sales territory optimization workflows.

---

# Potential Site Registration System

## Objectives
The Potential Site Registration System aims to streamline the registration and verification process for potential construction sites, ensuring comprehensive project data collection for effective project management and resource allocation.

**Primary Objectives:**
- Establish a standardized registration process for potential sites with comprehensive project data collection including site details, building specifications, territory mapping, and resource assignments.
- Implement collaborative workflow between BDO and CRO for enhanced project oversight and territory coordination.
- Ensure data integrity through comprehensive project information capture including engineer and contractor details integration.
- Support scalability for managing multiple site registrations while maintaining project compliance and resource allocation standards.
- Facilitate business growth by providing structured workflow for site management, reducing manual errors and improving project planning efficiency.

Key business outcomes include faster site onboarding, improved project planning, enhanced resource coordination, and reduced administrative overhead in construction project management.

## User Journeys
This section details the end-to-end user interaction flows for potential site registration based on the analyzed draw.io swimlane diagram.

### Primary User Journey: Potential Site Registration and Verification
**Roles:** Business Development Officer (BDO) and Customer Relationship Officer (CRO)

1. **Initiate Registration (Dual Access):**
   - BDO logs in to Google and opens the Potential Site Registration Form.
   - CRO logs in to Google and opens the Potential Site Registration Form.

2. **Submit Comprehensive Site Details:**
   - Enter CRO Territory assignment.
   - Enter Project Owner Name.
   - Enter Phone Number.
   - Enter Project Address.
   - Upload Site Image.
   - Specify Start Storied Building details.
   - Specify End Storied Building details.
   - Define AIL Territory.
   - Define ACL Territory.
   - Enter Engineer Details (linked to engineer registration).
   - Enter Contractor Details (linked to contractor registration).
   - Submit the form.

3. **Notification and Data Storage:**
   - System sends WhatsApp notifications to SR, CRO, and BDO confirming submission.
   - Submitted data is stored in the backend database (Data Bank) and mirrored to Google Sheets for verification.

4. **Verification and Approval (CRM Role):**
   - CRM user views the site data in Google Sheets via the CRM interface.
   - CRM user verifies the data (e.g., checks project details, territory alignment, resource assignments).
   - CRM user approves or rejects the registration.

5. **Post-Verification Cleanup and Final Notification:**
   - System sends WhatsApp notifications to SR, CRO, and BDO with the approval or rejection status.
   - Individual Data Sheet is generated for approved sites.
   - After 48 hours of the verification decision, data is automatically removed from Google Sheets to maintain cleanliness, while retained in the backend database.

**Decision Points:**
- During verification: Approve if all project data is valid, territory alignment is correct, and resource assignments are appropriate; reject if issues are found.

**Alternative Flows:**
- If submission fails, both BDO and CRO receive error messages and can retry.
- Rejected registrations allow resubmission of corrected details.

## User Stories
User stories for potential site registration with clear roles, actions, and outcomes.

1. **As a BDO/CRO, I want to submit potential site details via Google Form so that I can efficiently register new construction projects.**
   - Traces to: Journey Steps 1-2; Objective: Improve efficiency.

2. **As a system, I want to notify SR, CRO, and BDO via WhatsApp upon submission so that they are informed of the status immediately.**
   - Traces to: Journey Step 3; Objective: Enhanced project oversight.

3. **As a system, I want to store submitted data in a backend database and mirror it to Google Sheets so that data is secure and accessible for verification.**
   - Traces to: Journey Step 3; Objective: Enhance data integrity.

4. **As a CRM user, I want to view and verify submitted site data in Google Sheets so that I can ensure project compliance and resource validity.**
   - Traces to: Journey Step 4; Objective: Project compliance standards.

5. **As a CRM user, I want to approve or reject site registrations so that only viable projects are onboarded.**
   - Traces to: Journey Step 4 (Decision Point); Objective: Support business growth.

6. **As a system, I want to notify SR, CRO, and BDO of approval/rejection via WhatsApp so that they can coordinate follow-up actions.**
   - Traces to: Journey Step 5; Objective: Enhanced project coordination.

7. **As a system, I want to generate individual data sheets for approved sites so that they have proper project documentation.**
   - Traces to: Journey Step 5; Objective: Improved project planning.

8. **As a system, I want to automatically remove verified data from Google Sheets after 48 hours so that the sheet remains clean and focused on pending verifications.**
   - Traces to: Journey Step 5; Objective: Reduce administrative overhead.

## Acceptance Criteria
Explicit, measurable criteria for each potential site registration user story.

1. **User Story 1:**
   - Google Form must include fields for CRO Territory, Project Owner Name, Phone Number, Project Address, Site Image, Start/End Storied Building, AIL Territory, ACL Territory, Engineer Details, and Contractor Details.
   - Form submission succeeds only if all required fields are filled and site image is uploaded.
   - Submission integrates with backend DB and Google Sheets.
   - Verified by: Successful form submission populates both DB and Sheets without errors.

2. **User Story 2:**
   - WhatsApp notifications are sent to SR, CRO, and BDO upon submission.
   - Notifications include submission confirmation and a reference ID.
   - Verified by: Log confirms notification delivery to all registered numbers.

3. **User Story 3:**
   - Data is stored in backend DB with all fields and timestamps.
   - Mirrored to Google Sheets in real-time.
   - Verified by: Data appears in both systems post-submission.

4. **User Story 4:**
   - CRM interface displays site data from Google Sheets in a readable format.
   - Verification tools allow checking project details, territory alignment, and resource assignments.
   - Verified by: CRM user can access and view new entries within 5 minutes of submission.

5. **User Story 5:**
   - Approval/Rejection buttons update the status in both DB and Google Sheets.
   - Rejection requires a reason field (e.g., invalid project details, territory conflicts).
   - Verified by: Status changes are reflected immediately, and audit logs capture the action.

6. **User Story 6:**
   - Notifications include approval/rejection details and next steps.
   - Sent to SR, CRO, and BDO.
   - Verified by: Notifications are triggered post-verification and confirmed via logs.

7. **User Story 7:**
   - Individual data sheet is automatically generated for approved sites.
   - Sheet includes all project information in a formatted layout.
   - Verified by: Data sheet is created and accessible within 10 minutes of approval.

8. **User Story 8:**
   - Automated job removes data from Google Sheets exactly 48 hours after verification decision.
   - Data remains intact in backend DB.
   - Verified by: Sheets entry is deleted after 48 hours, confirmed by logs; DB retains the record.

## Technical Requirements
Technical specifications for potential site registration system.

- **Technologies:**
  - Frontend: Google Forms for submission interface with enhanced fields for comprehensive project data.
  - Backend: Database with additional tables for site-specific data (project details, building specifications, territory mapping, resource assignments).
  - Notifications: WhatsApp Business API for triple notifications (SR, CRO, BDO).
  - Authentication: Google OAuth for login with dual access (BDO and CRO).
  - Document Generation: Automated individual data sheet creation system.
  - Integration: Links to existing engineer and contractor registration systems.

- **Data Management:**
  - Primary storage in backend DB with columns for all site form fields, including project specifications, building details, territory mapping, and resource assignments.
  - Enhanced data validation for project compliance and territory standards.
  - Mirror to Google Sheets for verification purposes only.
  - Automated cleanup: Remove from Sheets after 48 hours of decision; retain indefinitely in DB.
  - Individual data sheet generation for approved sites.
  - Ensure data encryption for sensitive project information.
  - Retention: DB records kept for at least 10 years for project compliance.
  - Cross-referencing with engineer and contractor databases for resource validation.

- **Integration Points:**
  - Google Forms to backend DB and Sheets with enhanced field mapping for project data.
  - Google Sheets to CRM with project management and territory verification tools.
  - WhatsApp API integration for triple notifications.
  - Document generation system for individual data sheets.
  - Scheduled job for 48-hour cleanup.
  - Integration with engineer and contractor registration systems for resource linking.

- **Performance and Scalability:**
  - Handle up to 50 site submissions per day initially, scalable to 200.
  - Enhanced verification workflow for project and territory compliance.
  - Response time: Triple notifications sent within 10 seconds; data sheet generation within 10 minutes.
  - Availability: 99.9% uptime with project data backup.
  - Dual access support for BDO and CRO collaboration.

## UML Diagrams
PlantUML activity diagram for potential site registration process based on the draw.io swimlane analysis.

```plantuml
autonumber
skinparam backgroundColor #f5f5f5
skinparam activityBackgroundColor #FFFFFF
skinparam activityBorderColor #8B4513
skinparam arrowColor #654321
title Potential Site Registration Process

|Business Development Officer (BDO)|
start
:Login to Google;
:Open Site Registration Form;

|Customer Relationship Officer (CRO)|
:Login to Google;
:Open Site Registration Form;

|Registration Flow|
:Enter CRO Territory;
:Enter Project Owner Name;
:Enter Phone Number;
:Enter Project Address;
:Upload Site Image;
:Enter Start Storied Building;
:Enter End Storied Building;
:Enter AIL Territory;
:Enter ACL Territory;
:Enter Engineer Details;
:Enter Contractor Details;
:Submit;

|WhatsApp Notification|
:Notify SR (Submission Confirmation);
:Notify CRO (Submission Confirmation);
:Notify BDO (Submission Confirmation);

|Data Bank|
:Store Site Data;

|Google Sheets (Verification)|
:Mirror Data for Verification;

|CRM|
:View Site Data;
:Verify Project & Territory Details;
if (Verification) then (Pass)
  :Approve Site;
else (Fail)
  :Reject Site;
endif

|WhatsApp Notification|
:Notify SR (Approval/Rejection Status);
:Notify CRO (Approval/Rejection Status);
:Notify BDO (Approval/Rejection Status);

|Data Sheet|
if (Approved?) then (Yes)
  :Generate Individual Data Sheet;
else (No)
  :Skip Data Sheet Generation;
endif

|System Cleanup|
:Wait 48 Hours;
:Remove from Google Sheets;
note right: Data retained in Backend DB

stop
```

**Annotations:**
- **Dual Access:** Both BDO and CRO can initiate and manage site registrations for collaborative project management.
- **Comprehensive Project Data:** Enhanced form fields for complete site specifications, building details, and territory mapping.
- **Resource Integration:** Links to engineer and contractor registration systems for comprehensive project planning.
- **Triple Notifications:** SR, CRO, and BDO receive WhatsApp notifications for comprehensive project coordination.
- **Project Management:** This diagram supports construction project management and resource allocation workflows.

---

# Site Prescription System

## Objectives
The Site Prescription System aims to streamline the process of creating and managing site prescriptions for construction projects, enabling Business Development Officers (BDOs) to efficiently document site requirements and recommendations.

**Primary Objectives:**
- Establish a standardized prescription process for construction sites with comprehensive data collection including site identification, prescription details, and supporting documentation.
- Implement triple notification system to BDO, CRO, and SR for enhanced project coordination and site management.
- Ensure data integrity through systematic data storage and individual data sheet generation for each prescription.
- Support scalability for managing multiple site prescriptions while maintaining project documentation standards.
- Facilitate business growth by providing structured workflow for site prescription management, reducing manual errors and improving project planning efficiency.

Key business outcomes include faster prescription processing, improved project documentation, enhanced site management coordination, and reduced administrative overhead.

## User Journeys
This section details the end-to-end user interaction flows for site prescription based on the analyzed diagram.

### Primary User Journey: Site Prescription Creation and Documentation
**Role:** Business Development Officer (BDO)

1. **Initiate Prescription:**
   - BDO logs in to Google.
   - BDO opens the Google Form for Site Prescription.

2. **Submit Prescription Details:**
   - Tag Site ID (linking to existing potential site).
   - Enter Prescription details and recommendations.
   - Upload supporting images or documentation.
   - Submit the form.

3. **Notification and Data Storage:**
   - System sends WhatsApp notifications to BDO, CRO, and SR confirming submission.
   - Submitted data is stored in the backend database (Data Bank).

4. **Data Sheet Generation:**
   - System automatically generates individual data sheets for the prescription.
   - Data sheets include all prescription details, site information, and supporting documentation.

**Decision Points:**
- Site ID validation: Ensure the tagged Site ID exists in the potential site database.
- Prescription completeness: Verify all required fields are filled before submission.

**Alternative Flows:**
- If submission fails, BDO receives an error message and can retry.
- If Site ID is invalid, system prompts for correct Site ID selection.

## User Stories
User stories for site prescription with clear roles, actions, and outcomes.

1. **As a BDO, I want to create site prescriptions via Google Form so that I can efficiently document site requirements and recommendations.**
   - Traces to: Journey Steps 1-2; Objective: Improve efficiency.

2. **As a BDO, I want to tag existing Site IDs so that prescriptions are linked to the correct potential sites.**
   - Traces to: Journey Step 2; Objective: Data integrity and project coordination.

3. **As a system, I want to notify BDO, CRO, and SR via WhatsApp upon submission so that all stakeholders are informed immediately.**
   - Traces to: Journey Step 3; Objective: Enhanced project coordination.

4. **As a system, I want to store submitted prescription data in a backend database so that data is secure and accessible.**
   - Traces to: Journey Step 3; Objective: Enhance data integrity.

5. **As a system, I want to automatically generate individual data sheets so that each prescription has proper documentation.**
   - Traces to: Journey Step 4; Objective: Improved project documentation.

6. **As a project stakeholder, I want to access individual data sheets so that I can review prescription details and make informed decisions.**
   - Traces to: Journey Step 4; Objective: Support business growth.

## Acceptance Criteria
Explicit, measurable criteria for each site prescription user story.

1. **User Story 1:**
   - Google Form must include fields for Site ID tagging, Prescription details, and Image upload.
   - Form submission succeeds only if all required fields are filled.
   - Submission integrates with backend database.
   - Verified by: Successful form submission populates database without errors.

2. **User Story 2:**
   - Site ID field must validate against existing potential site database.
   - Invalid Site IDs trigger error messages with suggestions.
   - Verified by: Only valid Site IDs are accepted and linked correctly.

3. **User Story 3:**
   - WhatsApp notifications are sent to BDO, CRO, and SR upon submission.
   - Notifications include prescription confirmation and reference details.
   - Verified by: Log confirms notification delivery to all three stakeholders.

4. **User Story 4:**
   - Data is stored in backend database with all fields, timestamps, and Site ID linkage.
   - Data includes prescription details, images, and metadata.
   - Verified by: Data appears in database post-submission with proper relationships.

5. **User Story 5:**
   - Individual data sheets are automatically generated upon successful submission.
   - Data sheets include all prescription information in a formatted layout.
   - Verified by: Data sheet generation is triggered and completed within 2 minutes of submission.

6. **User Story 6:**
   - Data sheets are accessible through the system interface.
   - Sheets display all relevant prescription and site information.
   - Verified by: Stakeholders can access and view data sheets within 5 minutes of generation.

## Technical Requirements
Technical specifications for site prescription system.

- **Technologies:**
  - Frontend: Google Forms for prescription submission interface with Site ID validation.
  - Backend: Database with integration to potential site data for Site ID validation.
  - Notifications: WhatsApp Business API for triple notifications (BDO, CRO, SR).
  - Authentication: Google OAuth for login.
  - Document Generation: Automated data sheet creation system.

- **Data Management:**
  - Primary storage in backend database with columns for Site ID (foreign key), prescription details, images, submission timestamp, and BDO information.
  - Site ID validation against potential site database to ensure data integrity.
  - Image storage with secure access and backup.
  - Data sheet generation with formatted templates.
  - Retention: Database records kept for project lifecycle duration (minimum 3 years).

- **Integration Points:**
  - Google Forms to backend database with Site ID validation.
  - Integration with potential site database for Site ID lookup.
  - WhatsApp API integration for triple notifications.
  - Data sheet generation system with template management.

- **Performance and Scalability:**
  - Handle up to 30 prescription submissions per day initially, scalable to 100.
  - Site ID validation response time under 2 seconds.
  - Triple notifications sent within 15 seconds.
  - Data sheet generation completed within 2 minutes.
  - Availability: 99.9% uptime with automated backup.

- **Non-Functional Requirements:**
  - Site ID validation with real-time feedback.
  - Image upload with size and format validation.
  - Error handling with user-friendly messages and logging.
  - Data sheet templates with professional formatting.

## UML Diagrams
PlantUML activity diagram for site prescription process.

```plantuml
autonumber
skinparam backgroundColor #f5f5dc
skinparam activityBackgroundColor #FFFFFF
skinparam activityBorderColor #8B4513
skinparam arrowColor #8B0000
title Site Prescription Process

|Business Development Officer (BDO)|
start
:Login to Google;
:Open Site Prescription Form;

|Site Prescription Form|
:Tag Site ID;
:Enter Prescription Details;
:Upload Supporting Images;
:Submit;

|WhatsApp Notification|
:Notify BDO (Submission Confirmation);
:Notify CRO (Submission Confirmation);
:Notify SR (Submission Confirmation);

|Data Bank|
:Store Prescription Data;
note right: Links to Site ID in Potential Site DB

|Data Sheet Generation|
:Generate Individual Data Sheet;
note right: Includes prescription details and site information

|System|
:Data Sheet Available for Access;

stop
```

**Annotations:**
- **Triple Notifications:** BDO, CRO, and SR receive WhatsApp notifications for comprehensive project coordination.
- **Site ID Integration:** Prescription system integrates with potential site database for data consistency.
- **Automated Documentation:** Individual data sheets are automatically generated for each prescription.
- **Data Linkage:** Prescriptions are properly linked to existing potential sites through Site ID validation.
- **Project Management:** This diagram supports construction project management and site prescription workflows.

---

# Potential Site Update System

## Objectives
The Potential Site Update System aims to provide a comprehensive workflow for updating existing potential sites with enhanced engineer and contractor assignment capabilities, ensuring accurate project tracking and resource allocation.

**Primary Objectives:**
- Enable efficient updating of existing potential site records with new engineer and contractor assignments.
- Implement dual access system for both BDO and CRO to ensure comprehensive site management coverage.
- Provide seamless integration with existing engineer and contractor registration systems through ID tagging.
- Establish automated notification system to keep stakeholders informed of site updates.
- Support project lifecycle management through detailed tracking of site modifications and resource assignments.
- Facilitate data integrity through structured update workflows and automated data sheet generation.

Key business outcomes include improved project tracking accuracy, enhanced resource allocation efficiency, better stakeholder coordination, and streamlined site management processes.

## User Journeys
This section details the end-to-end user interaction flows for potential site updates based on the analyzed drawio.xml diagram.

### Primary User Journey: Potential Site Update Process
**Roles:** Business Development Officer (BDO) and Customer Relationship Officer (CRO)

1. **Initiate Update Process:**
   - WhatsApp notification sent with form link to both BDO and CRO.
   - Either BDO or CRO can access and open the update form.

2. **Site Identification and Tagging:**
   - Access the Potential Site Update Form.
   - Tag the specific Site ID for the site being updated.
   - Identify and tag Engineer ID for assignment.
   - Add detailed Engineer information and specifications.
   - Identify and tag Contractor ID for assignment.
   - Add detailed Contractor information and specifications.

3. **Form Submission and Data Processing:**
   - Submit the completed update form with all tagged information.
   - System processes the update and stores data in the Data Bank.
   - Updated information is integrated with existing site records.

4. **Notification and Documentation:**
   - WhatsApp notifications sent to both BDO and CRO confirming the update.
   - System generates individual data sheet with updated site information.
   - Updated records are available for project management and tracking.

**Decision Points:**
- Role Selection: Either BDO or CRO can initiate and complete the update process.
- Resource Assignment: Engineers and contractors are tagged based on project requirements and availability.

**Alternative Flows:**
- If form submission fails, the initiating user receives an error notification and can retry.
- Multiple updates can be processed for the same site as project requirements evolve.
- Updates can be partial (engineer only or contractor only) based on immediate needs.

## User Stories
User stories for potential site updates with clear roles, actions, and outcomes.

1. **As a BDO or CRO, I want to receive WhatsApp notifications with update form links so that I can efficiently access and update potential site information.**
   - Traces to: Journey Step 1; Objective: Improve project tracking accuracy.

2. **As a BDO or CRO, I want to tag specific Site IDs so that I can accurately identify which site requires updates.**
   - Traces to: Journey Step 2; Objective: Enhanced resource allocation efficiency.

3. **As a BDO or CRO, I want to tag Engineer IDs and add detailed engineer information so that I can assign appropriate technical resources to sites.**
   - Traces to: Journey Step 2; Objective: Seamless integration with engineer system.

4. **As a BDO or CRO, I want to tag Contractor IDs and add detailed contractor information so that I can assign appropriate construction resources to sites.**
   - Traces to: Journey Step 2; Objective: Seamless integration with contractor system.

5. **As a system, I want to store updated site information in the Data Bank so that all modifications are tracked and preserved.**
   - Traces to: Journey Step 3; Objective: Facilitate data integrity.

6. **As a system, I want to notify both BDO and CRO of successful updates so that all stakeholders are informed of changes.**
   - Traces to: Journey Step 4; Objective: Better stakeholder coordination.

7. **As a system, I want to generate individual data sheets for updated sites so that project documentation remains current and accessible.**
   - Traces to: Journey Step 4; Objective: Streamlined site management processes.

## Acceptance Criteria
Explicit, measurable criteria for each potential site update user story.

1. **User Story 1:**
   - WhatsApp notifications are sent to both BDO and CRO with valid form links.
   - Notifications include site update context and reference information.
   - Form links remain active and accessible for the update session.
   - Verified by: Log confirms notification delivery to both registered numbers with functional links.

2. **User Story 2:**
   - Site ID tagging field validates against existing potential site records.
   - System prevents updates to non-existent or invalid site IDs.
   - Site identification is clearly displayed throughout the update process.
   - Verified by: Successful site ID validation and clear site identification in form interface.

3. **User Story 3:**
   - Engineer ID tagging integrates with existing engineer registration system.
   - Engineer details are automatically populated when valid ID is tagged.
   - System validates engineer availability and qualifications for the site.
   - Verified by: Successful engineer assignment with populated details and validation checks.

4. **User Story 4:**
   - Contractor ID tagging integrates with existing contractor registration system.
   - Contractor details are automatically populated when valid ID is tagged.
   - System validates contractor availability and capabilities for the site.
   - Verified by: Successful contractor assignment with populated details and validation checks.

5. **User Story 5:**
   - Updated information is stored in Data Bank with timestamp and user identification.
   - Previous site versions are maintained for audit trail.
   - Data integrity checks ensure no corruption during update process.
   - Verified by: Updated data appears in Data Bank with complete audit trail and integrity validation.

6. **User Story 6:**
   - Notifications include update summary and assigned resource details.
   - Both BDO and CRO receive identical notification content.
   - Notifications are sent immediately upon successful form submission.
   - Verified by: Notification delivery confirmed with complete update details to both stakeholders.

7. **User Story 7:**
   - Individual data sheets reflect all updated information including new assignments.
   - Data sheets are generated automatically upon successful update.
   - Generated sheets are accessible through the system interface.
   - Verified by: Updated data sheet available with current information and resource assignments.

## Technical Requirements
Technical specifications for the potential site update system.

- **Technologies:**
  - Frontend: Enhanced Google Forms with dynamic field population and validation.
  - Backend: Database with site update tracking, version control, and integration APIs.
  - Notifications: WhatsApp Business API for dual stakeholder notifications.
  - Integration: APIs connecting to engineer and contractor registration systems.
  - Authentication: Google OAuth with role-based access for BDO and CRO.

- **Data Management:**
  - Primary storage in Data Bank with update versioning and audit trails.
  - Integration tables linking sites with engineers and contractors.
  - Real-time validation against engineer and contractor databases.
  - Automated data sheet generation with updated resource assignments.
  - Data encryption for sensitive project and resource information.
  - Retention: Complete update history maintained for project lifecycle tracking.

- **Integration Points:**
  - Google Forms to Data Bank with enhanced validation and integration logic.
  - Engineer Registration System API for ID validation and detail population.
  - Contractor Registration System API for ID validation and detail population.
  - WhatsApp API for dual notifications to BDO and CRO.
  - Data sheet generation system for automated documentation.

- **Performance and Scalability:**
  - Handle up to 200 site updates per day initially, scalable to 1000.
  - Real-time integration with engineer and contractor systems.
  - Response time: Form validation and submission within 5 seconds.
  - Availability: 99.9% uptime with robust error handling and recovery.
  - Security: Role-based access control and encrypted data transmission.

- **Non-Functional Requirements:**
  - Accessibility: Form interface compliant with WCAG 2.1 standards.
  - Error Handling: Comprehensive validation with user-friendly error messages.
  - Audit Trail: Complete tracking of all updates with user identification and timestamps.

## UML Diagrams
PlantUML activity diagram for potential site update process.

```plantuml
autonumber
skinparam backgroundColor #f5f5dc
skinparam activityBackgroundColor #FFFFFF
skinparam activityBorderColor #32CD32
skinparam arrowColor #228B22
title Potential Site Update Process

|WhatsApp Notification|
start
:Send Notification and Form Link;
note right: Sent to both BDO and CRO

|BDO|
:Receive Notification;
:Open Update Form;

|CRO|
:Receive Notification;
:Open Update Form;

|Update Form|
:Tag Site ID;
:Tag Engineer ID;
:Add Engineer Details;
:Tag Contractor ID;
:Add Contractor Details;
:Submit Update;

|Data Bank|
:Store Updated Data;
note right: Integrated with existing site records

|WhatsApp Notification|
:Notify BDO and CRO;
note right: Update confirmation

|Data Sheet|
:Generate Individual Data Sheet;
note right: Updated site information with resource assignments

stop
```

**Annotations:**
- **Dual Access:** Both BDO and CRO can initiate and complete site updates for comprehensive coverage.
- **Resource Integration:** Seamless tagging and integration with engineer and contractor systems.
- **Real-time Updates:** Immediate data processing and stakeholder notification.
- **Documentation:** Automated generation of updated data sheets for project management.
- This diagram supports efficient site management with enhanced resource allocation capabilities.

---

# User Order System

## Objectives
The User Order System aims to streamline the order processing workflow from potential site creation to final approval, ensuring efficient sales volume tracking and delivery method optimization.

**Primary Objectives:**
- Establish a standardized order processing workflow triggered by potential site creation with comprehensive project and sales data collection.
- Implement conditional delivery method handling with Factory DN direct processing and CRO visit coordination for other methods.
- Ensure triple notification system to SR, BDO, and CRO for enhanced sales coordination and order tracking.
- Support scalability for managing multiple orders while maintaining delivery method flexibility and approval workflow integrity.
- Facilitate business growth by providing structured workflow for order management, reducing processing time and improving conversion rates.

Key business outcomes include faster order processing, improved conversion tracking, enhanced delivery method optimization, and reduced administrative overhead in sales operations.

## User Journeys
This section details the end-to-end user interaction flows for order processing based on the analyzed PlantUML diagram.

### Primary User Journey: User Order Processing and Approval
**Role:** Sales Representative (SR)

1. **Order Initiation:**
   - System sends WhatsApp notification about potential site creation.
   - SR logs in to Google.
   - SR opens the User Order Form.

2. **Submit Order Details:**
   - Provide Project ID (linked to potential site).
   - Provide Sales Volume.
   - Provide Project Details.
   - Select Delivery Method.

3. **Conditional Processing Based on Delivery Method:**
   - **If Factory DN:** Order is sent directly to CRM for approval.
   - **If Other Method:** 
     - System notifies CRO for visit.
     - CRO conducts conversion visit.
     - Order is then sent to CRM for approval.

4. **Order Finalization:**
   - Upload Memo.
   - Click confirmation checkbox.
   - Submit the order.

5. **Notification and Data Storage:**
   - System sends WhatsApp notifications to BDO, CRO, and SR confirming submission.
   - Submitted data is stored in the backend database.

6. **Verification and Approval (CRM Role):**
   - CRM user views the order data.
   - CRM user verifies the order details and conversion visit (if applicable).
   - CRM user approves or rejects the order.

7. **Post-Approval Notification and Data Sheet Generation:**
   - System sends WhatsApp notifications to SR, BDO, and CRO with the approval or rejection status.
   - Individual data sheet is generated for approved orders.

**Decision Points:**
- Delivery Method selection determines processing path (Factory DN vs. CRO visit required).
- During verification: Approve if all data is valid and conversion visit completed (if required); reject if issues are found.

**Alternative Flows:**
- If submission fails, SR receives an error message and can retry.
- Rejected orders allow SR to resubmit corrected details.
- CRO visit scheduling and completion tracking for non-Factory DN orders.

## User Stories
User stories for order processing with clear roles, actions, and outcomes.

1. **As an SR, I want to receive WhatsApp notifications about potential site creation so that I can initiate order processing promptly.**
   - Traces to: Journey Step 1; Objective: Improve conversion rates.

2. **As an SR, I want to submit order details via Google Form so that I can efficiently process customer orders.**
   - Traces to: Journey Steps 1-2; Objective: Improve efficiency.

3. **As a system, I want to handle different delivery methods conditionally so that Factory DN orders can be processed faster while other orders get proper CRO visit coordination.**
   - Traces to: Journey Step 3; Objective: Delivery method optimization.

4. **As a CRO, I want to be notified for conversion visits so that I can coordinate with customers for non-Factory DN orders.**
   - Traces to: Journey Step 3; Objective: Enhanced sales coordination.

5. **As a system, I want to notify SR, BDO, and CRO via WhatsApp upon submission so that all stakeholders are informed immediately.**
   - Traces to: Journey Step 5; Objective: Enhanced coordination.

6. **As a CRM user, I want to view and verify submitted order data so that I can ensure accuracy and completion of required processes.**
   - Traces to: Journey Step 6; Objective: Order tracking integrity.

7. **As a CRM user, I want to approve or reject orders so that only valid orders proceed to fulfillment.**
   - Traces to: Journey Step 6 (Decision Point); Objective: Support business growth.

8. **As a system, I want to notify all stakeholders of approval/rejection and generate data sheets so that order status is communicated and documentation is available.**
   - Traces to: Journey Step 7; Objective: Faster order processing.

## Acceptance Criteria
Explicit, measurable criteria for each user order story.

1. **User Story 1:**
   - WhatsApp notification is triggered automatically upon potential site creation.
   - Notification includes site details and order initiation link.
   - Verified by: Log confirms notification delivery to SR's registered number.

2. **User Story 2:**
   - Google Form must include fields for Project ID, Sales Volume, Project Details, and Delivery Method.
   - Form submission succeeds only if all required fields are filled.
   - Project ID must link to existing potential site.
   - Verified by: Successful form submission with valid project linkage.

3. **User Story 3:**
   - Factory DN orders bypass CRO visit and go directly to CRM.
   - Non-Factory DN orders trigger CRO notification and visit coordination.
   - System tracks visit completion before CRM approval.
   - Verified by: Conditional workflow execution based on delivery method selection.

4. **User Story 4:**
   - CRO receives WhatsApp notification for non-Factory DN orders.
   - Notification includes customer details and visit scheduling information.
   - Visit completion is tracked and confirmed.
   - Verified by: CRO notification delivery and visit completion tracking.

5. **User Story 5:**
   - WhatsApp notifications are sent to SR, BDO, and CRO upon submission.
   - Notifications include submission confirmation and reference ID.
   - Verified by: Log confirms notification delivery to all three registered numbers.

6. **User Story 6:**
   - CRM interface displays order data with delivery method and visit status.
   - Verification tools allow checking project linkage and visit completion.
   - Verified by: CRM user can access and view new entries within 5 minutes of submission.

7. **User Story 7:**
   - Approval/Rejection buttons update the status in the system.
   - Rejection requires a reason field.
   - Verified by: Status changes are reflected immediately, and audit logs capture the action.

8. **User Story 8:**
   - Notifications include approval/rejection details and next steps.
   - Individual data sheet is generated for approved orders.
   - Sent to SR, BDO, and CRO.
   - Verified by: Notifications are triggered post-approval and data sheet generation is confirmed.

## Technical Requirements
Technical specifications for user order system.

- **Technologies:**
  - Frontend: Google Forms for order submission interface with conditional logic.
  - Backend: Database with order tables linked to potential site data.
  - Notifications: WhatsApp Business API for triple notifications and CRO visit coordination.
  - Authentication: Google OAuth for login.
  - Workflow Engine: For conditional delivery method processing.

- **Data Management:**
  - Primary storage in backend DB with columns for Project ID (foreign key), Sales Volume, Project Details, Delivery Method, Memo upload, submission timestamp, CRO visit status, approval status.
  - Data validation for project ID linkage to existing potential sites.
  - Visit tracking for non-Factory DN orders.
  - Order status tracking throughout the workflow.
  - Ensure data encryption for sensitive order information.
  - Retention: DB records kept for at least 5 years for sales analysis.

- **Integration Points:**
  - Google Forms to backend DB with project ID validation.
  - Potential Site system integration for order initiation triggers.
  - WhatsApp API integration for triple notifications and CRO coordination.
  - CRM integration for approval workflow.
  - Data sheet generation system for approved orders.

- **Performance and Scalability:**
  - Handle up to 200 order submissions per day initially, scalable to 1000.
  - Conditional workflow processing with sub-second decision making.
  - Response time: Notifications sent within 10 seconds; CRO visit coordination within 5 minutes.
  - Availability: 99.9% uptime with order data backup.
  - Real-time order status tracking and updates.

- **Non-Functional Requirements:**
  - Accessibility: Form compliant with WCAG 2.1.
  - Error Handling: Graceful failures with user-friendly messages and logging.
  - Audit Trail: Complete order processing history for compliance and analysis.

## UML Diagrams
PlantUML activity diagram for user order processing workflow.

```plantuml
autonumber
skinparam backgroundColor #f9f9f9
skinparam activityBackgroundColor #FFFFFF
skinparam activityBorderColor #FF6347
skinparam arrowColor #FF0000
title User Order Processing Workflow

|WhatsApp Notification|
start
:Potential Site Created;

|Sales Representative (SR)|
:Login to Google;
:Open User Order Form;

|User Order Form|
:Provide Project ID;
:Provide Sales Volume;
:Provide Project Details;
if (Delivery Method?) then (Factory DN)
  :Send Order to CRM for Approval;
else (Other)
  :Notify CRO for Visit;
  :CRO Conducts Conversion Visit;
  :Send Order to CRM for Approval;
endif
:Upload Memo;
:Click Checkbox;
:Submit;

|WhatsApp Notification|
:Notify BDO (Submission Confirmation);
:Notify CRO (Submission Confirmation);
:Notify SR (Submission Confirmation);

|Backend Database|
:Store Order Data;

|CRM|
:View Order Data;
:Verify Details & Visit Status;
if (Verification) then (Pass)
  :Approve Order;
else (Fail)
  :Reject Order;
endif

|WhatsApp Notification|
:Notify SR (Approval/Rejection Status);
:Notify BDO (Approval/Rejection Status);
:Notify CRO (Approval/Rejection Status);

|Data Sheet Generation|
:Generate Individual Data Sheet;
note right: For approved orders only

stop
```

**Annotations:**
- **Conditional Processing:** Delivery method determines workflow path (Factory DN vs. CRO visit).
- **Triple Notifications:** SR, BDO, and CRO receive notifications at key stages.
- **Project Linkage:** Order processing is triggered by potential site creation.
- **Visit Tracking:** CRO visit completion is tracked for non-Factory DN orders.
- **Data Sheet Generation:** Automated generation for approved orders only.
- This diagram supports comprehensive order management from initiation to fulfillment.

---

# Dispute Form System for Engineers

## Objectives
The Dispute Form System aims to provide a structured mechanism for handling disputes related to engineer assignments and project issues, ensuring transparent resolution processes and maintaining project quality standards.

**Primary Objectives:**
- Establish a standardized dispute reporting process for engineer-related issues with comprehensive order and engineer identification.
- Implement dual notification system to BDO for dispute initiation and both BDO and CRO for resolution updates.
- Ensure transparent dispute resolution through a dedicated Dispute Board with approval/rejection workflow.
- Support accountability and quality assurance by providing structured workflow for dispute management and resolution tracking.
- Facilitate project quality improvement by enabling systematic issue reporting and resolution documentation.

Key business outcomes include improved project quality, enhanced engineer accountability, faster dispute resolution, and reduced project delays due to unresolved conflicts.

## User Journeys
This section details the end-to-end user interaction flows for dispute management based on the analyzed PlantUML diagram.

### Primary User Journey: Engineer Dispute Reporting and Resolution
**Role:** Business Development Officer (BDO)

1. **Dispute Initiation:**
   - BDO logs in to Google.
   - BDO opens the Dispute Form.

2. **Submit Dispute Details:**
   - Tag User Order (link to specific order/project).
   - Tag Engineer ID (identify the engineer involved).
   - Submit the dispute form.

3. **Initial Notification and Data Storage:**
   - System sends WhatsApp notification to BDO confirming dispute submission.
   - Dispute data is stored in the backend database.

4. **Dispute Review and Resolution (Dispute Board Role):**
   - Dispute Board members view and verify the dispute details.
   - Dispute Board investigates the issue and gathers additional information if needed.
   - Dispute Board approves the dispute (validates the concern) or rejects it (dispute unfounded).

5. **Post-Resolution Notification and Documentation:**
   - System sends WhatsApp notifications to both BDO and CRO with the resolution status.
   - Individual data sheet is generated for approved disputes for documentation and follow-up actions.

**Decision Points:**
- During dispute review: Approve if the dispute is valid and requires action; reject if the dispute is unfounded or lacks sufficient evidence.

**Alternative Flows:**
- If submission fails, BDO receives an error message and can retry.
- Rejected disputes may be resubmitted with additional evidence or clarification.
- Approved disputes trigger follow-up actions and engineer performance review processes.

## User Stories
User stories for dispute management with clear roles, actions, and outcomes.

1. **As a BDO, I want to submit dispute forms for engineer-related issues so that I can report problems and seek resolution.**
   - Traces to: Journey Steps 1-2; Objective: Systematic issue reporting.

2. **As a BDO, I want to tag specific user orders and engineer IDs so that disputes are clearly linked to relevant projects and personnel.**
   - Traces to: Journey Step 2; Objective: Enhanced accountability.

3. **As a system, I want to notify the BDO via WhatsApp upon dispute submission so that they are informed of successful reporting.**
   - Traces to: Journey Step 3; Objective: Faster dispute resolution.

4. **As a system, I want to store dispute data in a backend database so that all dispute information is preserved for investigation and analysis.**
   - Traces to: Journey Step 3; Objective: Resolution tracking and documentation.

5. **As a Dispute Board member, I want to view and verify dispute details so that I can investigate and make informed resolution decisions.**
   - Traces to: Journey Step 4; Objective: Transparent dispute resolution.

6. **As a Dispute Board member, I want to approve or reject disputes so that valid concerns are addressed and unfounded disputes are dismissed.**
   - Traces to: Journey Step 4 (Decision Point); Objective: Quality assurance and accountability.

7. **As a system, I want to notify both BDO and CRO of dispute resolution via WhatsApp so that all stakeholders are informed of the outcome.**
   - Traces to: Journey Step 5; Objective: Improved project quality.

8. **As a system, I want to generate individual data sheets for approved disputes so that documentation is available for follow-up actions.**
   - Traces to: Journey Step 5; Objective: Resolution tracking and quality improvement.

## Acceptance Criteria
Explicit, measurable criteria for each dispute management user story.

1. **User Story 1:**
   - Google Form must include fields for dispute description, order tagging, and engineer identification.
   - Form submission succeeds only if all required fields are filled.
   - Submission integrates with backend database.
   - Verified by: Successful form submission populates database without errors.

2. **User Story 2:**
   - User Order tagging must link to existing orders in the system.
   - Engineer ID tagging must link to registered engineers.
   - Both tags are mandatory for form submission.
   - Verified by: Form validation ensures valid order and engineer linkage.

3. **User Story 3:**
   - WhatsApp notification is sent to BDO upon dispute submission.
   - Notification includes dispute reference ID and submission confirmation.
   - Verified by: Log confirms notification delivery to BDO's registered number.

4. **User Story 4:**
   - Dispute data is stored with all form fields, timestamps, and status tracking.
   - Data includes order linkage, engineer linkage, and dispute details.
   - Verified by: Database entry is created with complete dispute information.

5. **User Story 5:**
   - Dispute Board interface displays dispute data in a readable format.
   - Interface provides tools for viewing linked order and engineer details.
   - Verified by: Dispute Board can access and view new disputes within 5 minutes of submission.

6. **User Story 6:**
   - Approval/Rejection buttons update the dispute status in the database.
   - Rejection requires a reason field explaining the decision.
   - Verified by: Status changes are reflected immediately, and audit logs capture the decision.

7. **User Story 7:**
   - Notifications include resolution details and next steps.
   - Sent to both BDO and CRO with appropriate resolution information.
   - Verified by: Notifications are triggered post-resolution and confirmed via logs.

8. **User Story 8:**
   - Individual data sheet is generated only for approved disputes.
   - Data sheet includes dispute details, resolution, and recommended actions.
   - Verified by: Data sheet generation is confirmed for approved disputes only.

## Technical Requirements
Technical specifications for dispute management system.

- **Technologies:**
  - Frontend: Google Forms for dispute submission interface with order and engineer tagging capabilities.
  - Backend: Database with dispute tables linked to order and engineer data.
  - Notifications: WhatsApp Business API for BDO and CRO notifications.
  - Authentication: Google OAuth for login.
  - Dispute Board Interface: Web-based interface for dispute review and resolution.

- **Data Management:**
  - Primary storage in backend DB with columns for dispute details, User Order ID (foreign key), Engineer ID (foreign key), submission timestamp, status (Pending/Approved/Rejected), resolution notes, and decision timestamp.
  - Data validation for order and engineer ID linkage to existing records.
  - Dispute status tracking throughout the resolution process.
  - Ensure data encryption for sensitive dispute information.
  - Retention: DB records kept for at least 7 years for compliance and performance analysis.

- **Integration Points:**
  - Google Forms to backend DB with order and engineer validation.
  - User Order system integration for order tagging and linkage.
  - Engineer Registration system integration for engineer identification.
  - WhatsApp API integration for dual notifications (BDO and CRO).
  - Dispute Board interface for resolution workflow.
  - Data sheet generation system for approved disputes.

- **Performance and Scalability:**
  - Handle up to 50 dispute submissions per day initially, scalable to 200.
  - Dispute resolution workflow with efficient review processes.
  - Response time: Notifications sent within 10 seconds; dispute board access within 5 minutes.
  - Availability: 99.9% uptime with dispute data backup.
  - Real-time dispute status tracking and updates.

- **Non-Functional Requirements:**
  - Accessibility: Form and dispute board interface compliant with WCAG 2.1.
  - Error Handling: Graceful failures with user-friendly messages and logging.
  - Audit Trail: Complete dispute resolution history for compliance and analysis.
  - Security: Role-based access for dispute submission and resolution.

## UML Diagrams
PlantUML activity diagram for dispute management workflow.

```plantuml
autonumber
skinparam backgroundColor #f9f9f9
skinparam activityBackgroundColor #FFFFFF
skinparam activityBorderColor #FF6347
skinparam arrowColor #FF0000
title Engineer Dispute Management Workflow

|Business Development Officer (BDO)|
start
:Login to Google;
:Open Dispute Form;

|Dispute Form|
:Tag User Order;
:Tag Engineer ID;
:Submit Dispute;

|WhatsApp Notification|
:Notify BDO (Submission Confirmation);

|Data Bank|
:Store Dispute Data;

|Dispute Board|
:View Dispute Details;
:Verify Order & Engineer Information;
if (Investigation Result) then (Valid Dispute)
  :Approve Dispute;
else (Invalid/Unfounded)
  :Reject Dispute;
endif

|WhatsApp Notification|
:Notify BDO (Resolution Status);
:Notify CRO (Resolution Status);

|Data Sheet Generation|
:Generate Individual Data Sheet;
note right: For approved disputes only

stop
```

**Annotations:**
- **Order and Engineer Linkage:** Disputes are clearly linked to specific orders and engineers for accountability.
- **Dual Resolution Notifications:** Both BDO and CRO receive resolution updates for comprehensive communication.
- **Dispute Board Review:** Dedicated review process ensures thorough investigation and fair resolution.
- **Documentation:** Data sheet generation for approved disputes supports follow-up actions and quality improvement.
- **Status Tracking:** Complete dispute lifecycle tracking from submission to resolution.
- This diagram supports systematic dispute management and quality assurance in engineer assignments.

---

# Dispute Form System for Contractors

## Objectives
The Dispute Form System for Contractors aims to provide a structured mechanism for handling disputes related to contractor assignments and project issues, ensuring transparent resolution processes and maintaining project quality standards.

**Primary Objectives:**
- Establish a standardized dispute reporting process for contractor-related issues with comprehensive order and engineer identification.
- Implement dual notification system to CRO for dispute initiation and both BDO and CRO for resolution updates.
- Ensure transparent dispute resolution through a dedicated Dispute Board with approval/rejection workflow.
- Support accountability and quality assurance by providing structured workflow for dispute management and resolution tracking.
- Facilitate project quality improvement by enabling systematic issue reporting and resolution documentation.

Key business outcomes include improved project quality, enhanced contractor accountability, faster dispute resolution, and reduced project delays due to unresolved conflicts.

## User Journeys
This section details the end-to-end user interaction flows for contractor dispute management based on the analyzed PlantUML diagram.

### Primary User Journey: Contractor Dispute Reporting and Resolution
**Role:** Customer Relationship Officer (CRO)

1. **Dispute Initiation:**
   - CRO logs in to Google.
   - CRO opens the Dispute Form.

2. **Submit Dispute Details:**
   - Tag User Order (link to specific order/project).
   - Tag Engineer ID (identify the engineer involved in the contractor dispute).
   - Submit the dispute form.

3. **Initial Notification and Data Storage:**
   - System sends WhatsApp notification to CRO confirming dispute submission.
   - Dispute data is stored in the backend database.

4. **Dispute Review and Resolution (Dispute Board Role):**
   - Dispute Board members view and verify the dispute details.
   - Dispute Board investigates the contractor-related issue and gathers additional information if needed.
   - Dispute Board approves the dispute (validates the concern) or rejects it (dispute unfounded).

5. **Post-Resolution Notification and Documentation:**
   - System sends WhatsApp notifications to both BDO and CRO with the resolution status.
   - Individual data sheet is generated for approved disputes for documentation and follow-up actions.

**Decision Points:**
- During dispute review: Approve if the contractor dispute is valid and requires action; reject if the dispute is unfounded or lacks sufficient evidence.

**Alternative Flows:**
- If submission fails, CRO receives an error message and can retry.
- Rejected disputes may be resubmitted with additional evidence or clarification.
- Approved disputes trigger follow-up actions and contractor performance review processes.

## User Stories
User stories for contractor dispute management with clear roles, actions, and outcomes.

1. **As a CRO, I want to submit dispute forms for contractor-related issues so that I can report problems and seek resolution.**
   - Traces to: Journey Steps 1-2; Objective: Systematic issue reporting.

2. **As a CRO, I want to tag specific user orders and engineer IDs so that disputes are clearly linked to relevant projects and personnel.**
   - Traces to: Journey Step 2; Objective: Enhanced accountability.

3. **As a system, I want to notify the CRO via WhatsApp upon dispute submission so that they are informed of successful reporting.**
   - Traces to: Journey Step 3; Objective: Faster dispute resolution.

4. **As a system, I want to store dispute data in a backend database so that all dispute information is preserved for investigation and analysis.**
   - Traces to: Journey Step 3; Objective: Resolution tracking and documentation.

5. **As a Dispute Board member, I want to view and verify dispute details so that I can investigate and make informed resolution decisions.**
   - Traces to: Journey Step 4; Objective: Transparent dispute resolution.

6. **As a Dispute Board member, I want to approve or reject contractor disputes so that valid concerns are addressed and unfounded disputes are dismissed.**
   - Traces to: Journey Step 4 (Decision Point); Objective: Quality assurance and accountability.

7. **As a system, I want to notify both BDO and CRO of dispute resolution via WhatsApp so that all stakeholders are informed of the outcome.**
   - Traces to: Journey Step 5; Objective: Improved project quality.

8. **As a system, I want to generate individual data sheets for approved disputes so that documentation is available for follow-up actions.**
   - Traces to: Journey Step 5; Objective: Resolution tracking and quality improvement.

## Acceptance Criteria
Explicit, measurable criteria for each contractor dispute management user story.

1. **User Story 1:**
   - Google Form must include fields for dispute description, order tagging, and engineer identification.
   - Form submission succeeds only if all required fields are filled.
   - Submission integrates with backend database.
   - Verified by: Successful form submission populates database without errors.

2. **User Story 2:**
   - User Order tagging must link to existing orders in the system.
   - Engineer ID tagging must link to registered engineers.
   - Both tags are mandatory for form submission.
   - Verified by: Form validation ensures valid order and engineer linkage.

3. **User Story 3:**
   - WhatsApp notification is sent to CRO upon dispute submission.
   - Notification includes dispute reference ID and submission confirmation.
   - Verified by: Log confirms notification delivery to CRO's registered number.

4. **User Story 4:**
   - Dispute data is stored with all form fields, timestamps, and status tracking.
   - Data includes order linkage, engineer linkage, and dispute details.
   - Verified by: Database entry is created with complete dispute information.

5. **User Story 5:**
   - Dispute Board interface displays dispute data in a readable format.
   - Interface provides tools for viewing linked order and engineer details.
   - Verified by: Dispute Board can access and view new disputes within 5 minutes of submission.

6. **User Story 6:**
   - Approval/Rejection buttons update the dispute status in the database.
   - Rejection requires a reason field explaining the decision.
   - Verified by: Status changes are reflected immediately, and audit logs capture the decision.

7. **User Story 7:**
   - Notifications include resolution details and next steps.
   - Sent to both BDO and CRO with appropriate resolution information.
   - Verified by: Notifications are triggered post-resolution and confirmed via logs.

8. **User Story 8:**
   - Individual data sheet is generated only for approved disputes.
   - Data sheet includes dispute details, resolution, and recommended actions.
   - Verified by: Data sheet generation is confirmed for approved disputes only.

## Technical Requirements
Technical specifications for contractor dispute management system.

- **Technologies:**
  - Frontend: Google Forms for dispute submission interface with order and engineer tagging capabilities.
  - Backend: Database with dispute tables linked to order and engineer data.
  - Notifications: WhatsApp Business API for CRO and BDO notifications.
  - Authentication: Google OAuth for login.
  - Dispute Board Interface: Web-based interface for dispute review and resolution.

- **Data Management:**
  - Primary storage in backend DB with columns for dispute details, User Order ID (foreign key), Engineer ID (foreign key), submission timestamp, status (Pending/Approved/Rejected), resolution notes, and decision timestamp.
  - Data validation for order and engineer ID linkage to existing records.
  - Dispute status tracking throughout the resolution process.
  - Ensure data encryption for sensitive dispute information.
  - Retention: DB records kept for at least 7 years for compliance and performance analysis.

- **Integration Points:**
  - Google Forms to backend DB with order and engineer validation.
  - User Order system integration for order tagging and linkage.
  - Engineer Registration system integration for engineer identification.
  - WhatsApp API integration for dual notifications (BDO and CRO).
  - Dispute Board interface for resolution workflow.
  - Data sheet generation system for approved disputes.

- **Performance and Scalability:**
  - Handle up to 50 contractor dispute submissions per day initially, scalable to 200.
  - Dispute resolution workflow with efficient review processes.
  - Response time: Notifications sent within 10 seconds; dispute board access within 5 minutes.
  - Availability: 99.9% uptime with dispute data backup.
  - Real-time dispute status tracking and updates.

- **Non-Functional Requirements:**
  - Accessibility: Form and dispute board interface compliant with WCAG 2.1.
  - Error Handling: Graceful failures with user-friendly messages and logging.
  - Audit Trail: Complete dispute resolution history for compliance and analysis.
  - Security: Role-based access for dispute submission and resolution.

## UML Diagrams
PlantUML activity diagram for contractor dispute management workflow.

```plantuml
autonumber
skinparam backgroundColor #f9f9f9
skinparam activityBackgroundColor #FFFFFF
skinparam activityBorderColor #FF6347
skinparam arrowColor #FF0000
title Contractor Dispute Management Workflow

|Customer Relationship Officer (CRO)|
start
:Login to Google;
:Open Dispute Form;

|Dispute Form|
:Tag User Order;
:Tag Engineer ID;
:Submit Dispute;

|WhatsApp Notification|
:Notify CRO (Submission Confirmation);

|Data Bank|
:Store Dispute Data;

|Dispute Board|
:View Dispute Details;
:Verify Order & Engineer Information;
if (Investigation Result) then (Valid Dispute)
  :Approve Dispute;
else (Invalid/Unfounded)
  :Reject Dispute;
endif

|WhatsApp Notification|
:Notify BDO (Resolution Status);
:Notify CRO (Resolution Status);

|Data Sheet Generation|
:Generate Individual Data Sheet;
note right: For approved disputes only

stop
```

**Annotations:**
- **Order and Engineer Linkage:** Contractor disputes are clearly linked to specific orders and engineers for accountability.
- **Dual Resolution Notifications:** Both BDO and CRO receive resolution updates for comprehensive communication.
- **Dispute Board Review:** Dedicated review process ensures thorough investigation and fair resolution.
- **Documentation:** Data sheet generation for approved disputes supports follow-up actions and quality improvement.
- **Status Tracking:** Complete dispute lifecycle tracking from submission to resolution.
- This diagram supports systematic contractor dispute management and quality assurance in project assignments.

---

# Visit System

## Objectives
The Visit System aims to provide a comprehensive platform for tracking and managing client visits across different territories and client types, ensuring effective sales coordination and customer relationship management.

**Primary Objectives:**
- Establish a standardized visit tracking process for CRO, BDO, and SR with comprehensive client and territory data collection.
- Implement triple notification system to CRO, BDO, and SR for enhanced coordination and visibility across all sales roles.
- Ensure comprehensive visit documentation through image uploads and detailed client information capture.
- Support territory management and client relationship tracking by categorizing visit types and client classifications.
- Facilitate sales performance analysis by providing structured workflow for visit documentation and follow-up tracking.

Key business outcomes include improved client relationship management, enhanced territory coverage tracking, better sales coordination, and comprehensive visit analytics for performance optimization.

## User Journeys
This section details the end-to-end user interaction flows for visit management based on the analyzed PlantUML diagram.

### Primary User Journey: Client Visit Documentation and Tracking
**Role:** Customer Relationship Officer (CRO), Business Development Officer (BDO), Sales Representative (SR)

1. **Visit Initiation:**
   - User (CRO, BDO, or SR) logs in to Google.
   - User opens the Visit Form.

2. **Visit Details Documentation:**
   - Select Type of Visit (e.g., Initial Contact, Follow-up, Presentation, Closing).
   - Select Territory (geographical area or sales region).
   - Select Type of Client (e.g., Potential, Existing, Premium, Corporate).
   - Upload Image (visit documentation, client meeting photo, or location image).
   - Enter Client Name.
   - Enter Client Phone Number.
   - Submit the visit form.

3. **Notification and Data Storage:**
   - System sends WhatsApp notifications to CRO, BDO, and SR confirming visit submission.
   - Visit data is stored in the backend database for tracking and analysis.

4. **Data Sheet Generation and Access:**
   - Individual data sheet is generated for the visit record.
   - All stakeholders (CRO, BDO, SR) can view individual visit data for follow-up and coordination.

**Decision Points:**
- Visit type selection determines follow-up workflow and priority level.
- Client type classification affects notification priority and assignment protocols.

**Alternative Flows:**
- If submission fails, user receives an error message and can retry.
- Multiple visits for the same client create a visit history for relationship tracking.
- Different user roles may have access to different visit types based on their responsibilities.

## User Stories
User stories for visit management with clear roles, actions, and outcomes.

1. **As a CRO/BDO/SR, I want to submit visit details via Google Form so that I can efficiently document client interactions and territory coverage.**
   - Traces to: Journey Steps 1-2; Objective: Standardized visit tracking.

2. **As a user, I want to categorize visits by type and client classification so that visits are properly organized for follow-up and analysis.**
   - Traces to: Journey Step 2; Objective: Territory management and client relationship tracking.

3. **As a user, I want to upload images during visit documentation so that visual evidence and context are preserved for future reference.**
   - Traces to: Journey Step 2; Objective: Comprehensive visit documentation.

4. **As a system, I want to notify CRO, BDO, and SR via WhatsApp upon visit submission so that all stakeholders are informed of client activities.**
   - Traces to: Journey Step 3; Objective: Enhanced coordination and visibility.

5. **As a system, I want to store visit data in a backend database so that all visit information is preserved for analysis and tracking.**
   - Traces to: Journey Step 3; Objective: Sales performance analysis.

6. **As a system, I want to generate individual data sheets for each visit so that detailed visit records are available for review and follow-up.**
   - Traces to: Journey Step 4; Objective: Comprehensive visit analytics.

7. **As a stakeholder (CRO/BDO/SR), I want to view individual visit data so that I can coordinate follow-up actions and track client relationship progress.**
   - Traces to: Journey Step 4; Objective: Improved client relationship management.

## Acceptance Criteria
Explicit, measurable criteria for each visit management user story.

1. **User Story 1:**
   - Google Form must include fields for Type of Visit, Territory, Type of Client, Image Upload, Client Name, and Client Phone Number.
   - Form submission succeeds only if all required fields are filled.
   - Submission integrates with backend database.
   - Verified by: Successful form submission populates database without errors.

2. **User Story 2:**
   - Visit type dropdown includes predefined categories (Initial Contact, Follow-up, Presentation, Closing, etc.).
   - Client type dropdown includes classification options (Potential, Existing, Premium, Corporate, etc.).
   - Territory selection maps to predefined geographical or sales regions.
   - Verified by: Form validation ensures proper categorization and territory assignment.

3. **User Story 3:**
   - Image upload supports common formats (JPG, PNG, PDF) with size limits.
   - Uploaded images are stored securely and linked to visit records.
   - Image metadata includes upload timestamp and user information.
   - Verified by: Images are successfully uploaded and accessible in visit records.

4. **User Story 4:**
   - WhatsApp notifications are sent to all three roles (CRO, BDO, SR) upon visit submission.
   - Notifications include visit reference ID, client name, and visit type.
   - Verified by: Log confirms notification delivery to all registered numbers.

5. **User Story 5:**
   - Visit data is stored with all form fields, timestamps, and user identification.
   - Data includes visit categorization, client information, and image references.
   - Verified by: Database entry is created with complete visit information.

6. **User Story 6:**
   - Individual data sheet is generated for each visit with comprehensive details.
   - Data sheet includes visit summary, client information, and uploaded images.
   - Verified by: Data sheet generation is confirmed for all submitted visits.

7. **User Story 7:**
   - Visit data is accessible to all stakeholders through appropriate interfaces.
   - Data viewing includes filtering by date, territory, client type, and visit type.
   - Verified by: Stakeholders can access and view visit data within 5 minutes of submission.

## Technical Requirements
Technical specifications for visit management system.

- **Technologies:**
  - Frontend: Google Forms for visit submission interface with dropdown selections and image upload capabilities.
  - Backend: Database with visit tables including categorization, client data, and image storage.
  - Notifications: WhatsApp Business API for triple notifications (CRO, BDO, SR).
  - Authentication: Google OAuth for login.
  - File Storage: Cloud storage for visit images with secure access controls.

- **Data Management:**
  - Primary storage in backend DB with columns for visit type, territory, client type, client name, client phone, image references, submission timestamp, and user identification.
  - Image storage with metadata linking to visit records.
  - Data validation for client phone numbers and territory assignments.
  - Ensure data encryption for client information and visit details.
  - Retention: DB records kept for at least 5 years for sales analysis and client relationship tracking.

- **Integration Points:**
  - Google Forms to backend DB with image upload handling.
  - Cloud storage integration for image management.
  - WhatsApp API integration for triple notifications.
  - Data sheet generation system for visit documentation.
  - Analytics integration for territory and performance tracking.

- **Performance and Scalability:**
  - Handle up to 200 visit submissions per day initially, scalable to 1000.
  - Image upload processing with efficient storage and retrieval.
  - Response time: Notifications sent within 10 seconds; data sheet generation within 2 minutes.
  - Availability: 99.9% uptime with visit data backup.
  - Real-time visit tracking and coordination.

- **Non-Functional Requirements:**
  - Accessibility: Form compliant with WCAG 2.1 for mobile and desktop access.
  - Error Handling: Graceful failures with user-friendly messages and logging.
  - Audit Trail: Complete visit history for sales analysis and client relationship tracking.
  - Security: Role-based access for visit submission and data viewing.
  - Mobile Optimization: Form optimized for mobile devices for field visit documentation.

## UML Diagrams
PlantUML activity diagram for visit management workflow.

```plantuml
autonumber
skinparam backgroundColor #f9f9f9
skinparam activityBackgroundColor #FFFFFF
skinparam activityBorderColor #FF6347
skinparam arrowColor #FF0000
title Client Visit Management Workflow

|CRO, BDO, SR|
start
:Login to Google;
:Open Visit Form;

|Visit Form|
:Select Type of Visit;
:Select Territory;
:Select Type of Client;
:Upload Image;
:Enter Client Name;
:Enter Client Phone Number;
:Submit;

|WhatsApp Notification|
:Notify CRO;
:Notify BDO;
:Notify SR;

|Data Bank|
:Store Visit Data;

|Data Sheet Generation|
:Generate Individual Data Sheet;

|Data Access|
:View Individual Visit Data;
note right: Accessible to CRO, BDO, SR

stop
```

**Annotations:**
- **Multi-Role Access:** CRO, BDO, and SR can all submit visits, ensuring comprehensive territory coverage.
- **Triple Notifications:** All stakeholders receive WhatsApp notifications for enhanced coordination.
- **Comprehensive Documentation:** Image uploads and detailed categorization support thorough visit tracking.
- **Territory Management:** Territory and client type selections enable effective sales region management.
- **Data Accessibility:** Individual data sheets provide detailed visit records for follow-up and analysis.
- This diagram supports comprehensive client relationship management and sales territory optimization.

---

# Retail Point Request System

## Objectives
The Retail Point Request System aims to provide a streamlined platform for Business Development Officers (BDOs) to request and manage retail point establishments across different territories, ensuring effective retail network expansion and territory coverage optimization.

**Primary Objectives:**
- Establish a standardized retail point request process for BDOs with comprehensive territory and location data collection.
- Implement notification system to BDO for request confirmation and status tracking.
- Ensure comprehensive retail point documentation through territory mapping, location specification, and company selection.
- Support retail network expansion by providing structured workflow for retail point establishment requests.
- Facilitate territory management and retail coverage analysis by providing detailed request documentation and tracking.

Key business outcomes include improved retail network planning, enhanced territory coverage, better retail partner coordination, and comprehensive retail expansion analytics for strategic decision-making.

## User Journeys
This section details the end-to-end user interaction flows for retail point request management based on the analyzed PlantUML diagram.

### Primary User Journey: Retail Point Request Submission and Tracking
**Role:** Business Development Officer (BDO)

1. **Request Initiation:**
   - BDO logs in to Google.
   - BDO opens the Retail Point Request Form.

2. **Request Details Documentation:**
   - Select Territory (geographical area or sales region for retail point establishment).
   - Specify Location (detailed address or area description for the proposed retail point).
   - Select Company (partner company or retail chain for collaboration).
   - Submit the retail point request form.

3. **Notification and Data Storage:**
   - System sends WhatsApp notification to BDO confirming request submission.
   - Request data is stored in the backend database for tracking and analysis.

4. **Data Sheet Generation and Access:**
   - Individual data sheet is generated for the retail point request.
   - BDO can view individual request data for follow-up and status tracking.

**Decision Points:**
- Territory selection determines regional expansion strategy and resource allocation.
- Company selection affects partnership protocols and establishment procedures.

**Alternative Flows:**
- If submission fails, BDO receives an error message and can retry.
- Multiple requests for the same territory create a comprehensive expansion plan.
- Different company selections may require different approval workflows.

## User Stories
User stories for retail point request management with clear roles, actions, and outcomes.

1. **As a BDO, I want to submit retail point requests via Google Form so that I can efficiently propose new retail locations for network expansion.**
   - Traces to: Journey Steps 1-2; Objective: Standardized retail point request process.

2. **As a user, I want to specify territory and location details so that retail point requests are properly mapped for strategic planning.**
   - Traces to: Journey Step 2; Objective: Territory management and retail coverage analysis.

3. **As a user, I want to select partner companies so that retail point establishments align with business partnerships and collaboration strategies.**
   - Traces to: Journey Step 2; Objective: Retail network expansion.

4. **As a system, I want to notify BDO via WhatsApp upon request submission so that they are informed of successful request processing.**
   - Traces to: Journey Step 3; Objective: Request confirmation and status tracking.

5. **As a system, I want to store retail point request data in a backend database so that all request information is preserved for analysis and tracking.**
   - Traces to: Journey Step 3; Objective: Comprehensive retail expansion analytics.

6. **As a system, I want to generate individual data sheets for each request so that detailed request records are available for review and follow-up.**
   - Traces to: Journey Step 4; Objective: Structured workflow for retail point establishment.

7. **As a BDO, I want to view individual request data so that I can track request status and coordinate follow-up actions.**
   - Traces to: Journey Step 4; Objective: Improved retail network planning.

## Acceptance Criteria
Explicit, measurable criteria for each retail point request management user story.

1. **User Story 1:**
   - Google Form must include fields for Territory, Location, and Company Selection.
   - Form submission succeeds only if all required fields are filled.
   - Submission integrates with backend database.
   - Verified by: Successful form submission populates database without errors.

2. **User Story 2:**
   - Territory dropdown includes predefined geographical regions or sales areas.
   - Location field accepts detailed address or area descriptions.
   - Territory selection maps to predefined retail expansion zones.
   - Verified by: Form validation ensures proper territory and location specification.

3. **User Story 3:**
   - Company selection dropdown includes approved partner companies and retail chains.
   - Company selection affects request categorization and approval workflow.
   - Partnership status is validated against active business relationships.
   - Verified by: Company selection is validated and properly categorized in the system.

4. **User Story 4:**
   - WhatsApp notification is sent to BDO upon request submission.
   - Notification includes request reference ID, territory, and location details.
   - Verified by: Log confirms notification delivery to registered BDO number.

5. **User Story 5:**
   - Request data is stored with all form fields, timestamps, and user identification.
   - Data includes territory mapping, location details, and company selection.
   - Verified by: Database entry is created with complete request information.

6. **User Story 6:**
   - Individual data sheet is generated for each request with comprehensive details.
   - Data sheet includes request summary, territory information, and company details.
   - Verified by: Data sheet generation is confirmed for all submitted requests.

7. **User Story 7:**
   - Request data is accessible to BDO through appropriate interfaces.
   - Data viewing includes filtering by territory, company, and submission date.
   - Verified by: BDO can access and view request data within 5 minutes of submission.

## Technical Requirements
Technical specifications for retail point request management system.

- **Technologies:**
  - Frontend: Google Forms for request submission interface with dropdown selections for territory and company.
  - Backend: Database with retail request tables including territory mapping, location data, and company information.
  - Notifications: WhatsApp Business API for BDO notifications.
  - Authentication: Google OAuth for login.
  - Data Management: Structured storage for retail expansion planning and analysis.

- **Data Management:**
  - Primary storage in backend DB with columns for territory, location, company selection, submission timestamp, and user identification.
  - Territory mapping with geographical coordinates and regional classifications.
  - Data validation for territory assignments and company partnerships.
  - Ensure data encryption for business partnership information.
  - Retention: DB records kept for at least 3 years for retail expansion analysis and strategic planning.

- **Integration Points:**
  - Google Forms to backend DB with territory and company validation.
  - WhatsApp API integration for BDO notifications.
  - Data sheet generation system for request documentation.
  - Analytics integration for retail expansion planning and territory analysis.

- **Performance and Scalability:**
  - Handle up to 50 retail point requests per day initially, scalable to 200.
  - Territory mapping with efficient data retrieval and analysis.
  - Response time: Notifications sent within 10 seconds; data sheet generation within 2 minutes.
  - Availability: 99.9% uptime with retail request data backup.
  - Real-time request tracking and territory analysis.

- **Non-Functional Requirements:**
  - Accessibility: Form compliant with WCAG 2.1 for mobile and desktop access.
  - Error Handling: Graceful failures with user-friendly messages and logging.
  - Audit Trail: Complete request history for retail expansion analysis and strategic planning.
  - Security: Role-based access for request submission and data viewing.
  - Mobile Optimization: Form optimized for mobile devices for field request submission.

## UML Diagrams
PlantUML activity diagram for retail point request management workflow.

```plantuml
autonumber
skinparam backgroundColor #f9f9f9
skinparam activityBackgroundColor #FFFFFF
skinparam activityBorderColor #FF6347
skinparam arrowColor #FF0000
title Retail Point Request Management Workflow

|Business Development Officer (BDO)|
start
:Login to Google;
:Open Retail Point Request Form;

|Retail Request Form|
:Select Territory;
:Specify Location;
:Select Company;
:Submit;

|WhatsApp Notification|
:Notify BDO;

|Data Bank|
:Store Request Data;

|Data Sheet Generation|
:Generate Individual Data Sheet;

|Data Access|
:View Individual Request Data;
note right: Accessible to BDO

stop
```

**Annotations:**
- **Territory Focus:** Territory selection enables strategic retail network expansion planning.
- **Location Specification:** Detailed location data supports precise retail point establishment.
- **Company Integration:** Partner company selection aligns with business collaboration strategies.
- **BDO Notification:** WhatsApp notification ensures request confirmation and tracking.
- **Data Documentation:** Individual data sheets provide comprehensive request records for follow-up.
- This diagram supports strategic retail network expansion and territory coverage optimization.
        