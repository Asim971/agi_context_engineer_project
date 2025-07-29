# AI Guidelines for Anwar Sales Management System

## Overview
These guidelines provide best practices for using AI coding assistants in the development of the Anwar Sales Management System, ensuring alignment with project architecture (Google Apps Script, Google Sheets MVP, Google Forms) and requirements. These guidelines support both current operations and future enhancement roadmap implementation.

## Task Manager Agent Integration

### Reference Documents
All AI-assisted development must incorporate context from:
- <mcfile name="mission.md" path="e:\Anwar_sales_eco\.agent-os\product\mission.md"></mcfile>
- <mcfile name="sales-eco-spec.md" path="e:\Anwar_sales_eco\.agent-os\projects\sales-eco-spec.md"></mcfile>
- <mcfile name="task-manager-agent.md" path="e:\Anwar_sales_eco\.agent-os\agents\task-manager-agent.md"></mcfile>
- <mcfile name="enhancement-roadmap.md" path="e:\Anwar_sales_eco\.agent-os\roadmap\enhancement-roadmap.md"></mcfile>
- <mcfile name="code-standards.md" path="e:\Anwar_sales_eco\.agent-os\code-standards.md"></mcfile>

### Task-Oriented Development
- **Task Decomposition**: Break complex requests into manageable subtasks with clear dependencies
- **Progress Tracking**: Maintain task status and completion metrics throughout development
- **Quality Gates**: Implement validation checkpoints for each task completion
- **Documentation**: Update task documentation and lessons learned

## Prompt Engineering Best Practices

### Context-Aware Prompting
- **Reference Structured Documents**: Always include context from mission, specifications, and enhancement roadmap
- **Incorporate Stakeholder Contexts**: For workflows involving CRO approvals or BDO prescriptions, specify role-based access and audit trails
- **Security and Compliance**: Emphasize GDPR compliance, encryption, and role-based access in all security-related prompts
- **Future-Ready Development**: Consider enhancement roadmap phases when implementing current features

### Prompt Builder Integration
- **Prompt Library Usage**: Reference <mcfile name="prompt-library.md" path=".agent-os/prompts/prompt-library.md"></mcfile> for standardized prompts
- **Context Engineering**: Follow <mcfile name="context-engineering-framework.md" path=".agent-os/frameworks/context-engineering-framework.md"></mcfile> for context integration
- **Agent Communication**: Use structured handoff templates for inter-agent communication
- **Quality Validation**: Include prompt effectiveness metrics and validation criteria

### Advanced Prompt Techniques
- **Chain-of-Thought**: Break complex tasks into logical step-by-step reasoning
- **Few-Shot Learning**: Provide relevant examples for complex implementation patterns
- **Role-Based Prompting**: Specify agent roles and expertise areas for specialized tasks
- **Context Injection**: Dynamically include relevant context based on task requirements

### Modern Development Practices
- **ES6+ JavaScript**: Use modern JavaScript features (const/let, arrow functions, destructuring, async/await)
- **Error Handling**: Implement comprehensive error handling with logging and recovery mechanisms
- **Performance Optimization**: Consider caching, batch operations, and connection pooling
- **Security First**: Use PropertiesService for API keys, implement input sanitization

## Integration Guidelines

### Google Workspace
- **Apps Script Optimization**: Reference 6-minute execution limits and implement batch operations
- **Native Integrations**: Leverage built-in Sheets and Forms APIs for optimal performance
- **V8 Runtime**: Utilize modern JavaScript capabilities available in V8 runtime
- **Caching Strategy**: Implement intelligent caching for frequently accessed data

### WhatsApp API
- **MyTAPI Integration**: Use MyTAPI specifics for notification prompts
- **Template Management**: Implement message templates and retry logic
- **Error Recovery**: Build robust error handling for API failures
- **Rate Limiting**: Respect API rate limits and implement queuing

### Future Enhancements
- **PWA Readiness**: Structure code to support Progressive Web App implementation
- **Mobile Optimization**: Consider mobile-first design principles
- **Analytics Integration**: Prepare for real-time analytics and reporting features
- **Workflow Automation**: Design with future automation capabilities in mind

## Testing and Validation

### Comprehensive Testing Strategy
- **Unit Tests**: Generate unit tests covering edge cases in registration workflows
- **Integration Tests**: Test Google Sheets data validation and API integrations
- **Performance Tests**: Validate response times and resource usage
- **Security Tests**: Verify access controls and data protection measures

### Quality Assurance
- **Code Reviews**: Implement peer review processes for all changes
- **Automated Testing**: Set up CI/CD pipeline with automated test execution
- **Performance Monitoring**: Track system performance and user experience metrics
- **Documentation**: Maintain current technical and user documentation

## Example Prompts

### Basic Development
"Develop a Google Apps Script function for contractor registration approval, following the specs in sales-eco-spec.md, implementing modern JavaScript patterns from enhancement-roadmap.md, and ensuring audit logging with comprehensive error handling."

### Task-Oriented Development
"Create a task plan for implementing PWA features as outlined in enhancement-roadmap.md, breaking down into subtasks with dependencies, timeline estimates, and quality checkpoints. Reference task-manager-agent.md for coordination guidelines."

### Security-Focused Development
"Implement secure API key management using PropertiesService, following security standards from code-standards.md and GDPR compliance requirements from mission.md. Include comprehensive input validation and audit logging."

### Performance Optimization
"Optimize database operations for the retailer registration system, implementing batch processing, caching strategies, and error recovery mechanisms as specified in enhancement-roadmap.md Phase 1 deliverables."