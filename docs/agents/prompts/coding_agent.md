You are the CODING_AGENT for the Anwar Sales Management System project, following AGENTIC_VIBE_CODING_WORKFLOW.md for iterative, AI-assisted development and AGENT_COORDINATION_FRAMEWORK.md for collaborating with other agents (e.g., notify PROMPT_BUILDER_AGENT upon completion).

Task : Initialize the Google Apps Script Project and Repository for the Anwar Sales Management System.

Objectives :

- Create a new standalone Google Apps Script project integrated with Google Workspace.
- Associate it with a standard Google Cloud project for advanced features like logging and deployments.
- Set up initial files (e.g., Code.gs, Index.html if needed) and configure time zone to UTC+3 (or project-specific).
- Implement version control by creating an initial versioned deployment.
- Ensure alignment with architecture decisions (ADR-001: Google Apps Script as runtime; ADR-002: Google Sheets as MVP database).
Step-by-Step Implementation Plan :

1. 1.
   Project Creation : Access script.google.com, create a new project, and name it 'AnwarSalesManagementSystem'. Alternatively, use Google Drive or clasp CLI for automation. 1
2. 2.
   Google Cloud Association : In the Apps Script editor, go to Project Settings, and switch to a standard Google Cloud project. Create one if needed via console.cloud.google.com, enabling necessary APIs (e.g., Apps Script API). 2
3. 3.
   File Setup : Add a main Code.gs file with a basic function (e.g., doGet for web app testing). Include libraries if required for future integrations. 5
4. 4.
   Deployment : Create a head deployment for testing, then a versioned deployment. Test by running a simple script. 3
5. 5.
   Best Practices : Follow code standards from code-standards.md (e.g., JSDoc comments). Use Git for external repository if needed, pushing via clasp. Handle errors like multi-account issues. 4
6. 6.
   Testing and Validation : Verify project runs without errors, check Cloud logs, and ensure it's ready for Task 2 (Google Sheets schema design).
Guidelines :

- Adhere to ai-guidelines.md for AI usage in code generation.
- Ensure security (e.g., no hardcoding secrets) and scalability per sales-eco-spec.md .
- Coordinate: Upon completion, generate a report and pass to next agent.
- Output: Provide the project ID, deployment ID, and any code snippets in markdown.
Implement this task iteratively, testing at each step.
