# AI Guidelines for Anwar Sales Management System

## Overview
These guidelines provide best practices for using AI coding assistants in the development of the Anwar Sales Management System, ensuring alignment with project architecture (Google Apps Script, Google Sheets MVP, Google Forms) and requirements.

## Prompt Engineering Best Practices
- **Reference Structured Documents**: Always include context from <mcfile name="mission.md" path="e:\Anwar_sales_eco\.agent-os\product\mission.md"></mcfile>, <mcfile name="sales-eco-spec.md" path="e:\Anwar_sales_eco\.agent-os\projects\sales-eco-spec.md"></mcfile>, and ADR files when prompting for code related to registrations or integrations.
- **Incorporate Stakeholder Contexts**: For workflows involving CRO approvals or BDO prescriptions, specify role-based access and audit trails in prompts.
- **Security and Compliance**: Emphasize GDPR compliance, encryption, and role-based access in all security-related prompts.

## Integration Guidelines
- **Google Workspace**: When prompting for automations, reference Google Apps Script limits (e.g., 6-minute execution) and native integrations with Sheets and Forms.
- **WhatsApp API**: Use MyTAPI specifics for notification prompts, including message templates and retry logic.

## Testing and Validation
- Include prompts for generating unit tests that cover edge cases in registration workflows and data validation in Google Sheets.

## Example Prompt
"Develop a Google Apps Script function for contractor registration approval, following the specs in sales-eco-spec.md and ensuring audit logging."