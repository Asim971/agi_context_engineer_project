# Code Standards for Anwar Sales Management System

## Overview
These standards ensure consistent, secure, and efficient code development for the Anwar Sales Management System, aligning with the architecture using Google Apps Script, Google Sheets (MVP), Google Forms, and MyTAPI integrations.

## Coding Best Practices
- **Modularity and Reusability**: Write modular Google Apps Script functions for registration workflows, ensuring reusability across Contractor, Engineer, Retailer, and Potential Site systems.
- **Error Handling**: Implement robust error handling with logging to Google Sheets for audit trails, following limits like 6-minute execution times.
- **Security Standards**: Enforce role-based access, data encryption, and GDPR compliance in all scripts; avoid hardcoding sensitive information.
- **Documentation**: Comment code thoroughly, referencing specifications from <mcfile name="sales-eco-spec.md" path="e:\Anwar_sales_eco\.agent-os\projects\sales-eco-spec.md"></mcfile>.

## Integration Standards
- **Google Workspace**: Use native APIs for Sheets and Forms; optimize for performance and quota limits.
- **WhatsApp API**: Implement MyTAPI with template-based notifications and retry mechanisms for reliability.

## Testing Standards
- Write unit tests for each function, covering edge cases in data validation and workflow approvals.

## Example Code Snippet
```javascriptunction approveRegistration(data) {
  // Implementation following specs in mission.md
}
```

Reference <mcfile name="mission.md" path="e:\Anwar_sales_eco\.agent-os\product\mission.md"></mcfile> for mission alignment.