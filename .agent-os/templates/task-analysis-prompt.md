# Task Analysis Prompt Template

## Overview
This template provides a structured approach for AI agents to analyze tasks within the Anwar Sales Ecosystem, ensuring comprehensive understanding and effective execution aligned with project standards and Phase 1: Foundation Modernization requirements.

## Phase 1: Foundation Modernization Compliance

All task analysis must consider and align with Phase 1 modernization goals:

### Modern JavaScript Implementation
- **ES6+ Features**: Utilize arrow functions, destructuring, template literals, async/await
- **Module System**: Implement proper import/export patterns where applicable
- **Code Quality**: Follow modern JavaScript best practices and patterns
- **Performance**: Optimize for execution efficiency and memory usage

### Enhanced Error Handling
- **Comprehensive Coverage**: Implement try-catch blocks for all critical operations
- **Graceful Degradation**: Ensure system continues functioning when components fail
- **User-Friendly Messages**: Provide clear, actionable error messages
- **Logging Strategy**: Implement structured logging for debugging and monitoring

### Service-Oriented Architecture
- **Modular Design**: Break functionality into reusable, independent services
- **Clear Interfaces**: Define well-documented APIs between services
- **Separation of Concerns**: Maintain distinct responsibilities for each service
- **Scalability**: Design for future expansion and modification

### Comprehensive Documentation
- **Code Documentation**: JSDoc comments for all functions and classes
- **Architecture Documentation**: Clear system design and component relationships
- **User Documentation**: Step-by-step guides and troubleshooting
- **Maintenance Documentation**: Deployment, configuration, and operational procedures

## Task Analysis Framework

### 1. Initial Task Assessment

#### Task Understanding
```
**Task Title**: [Brief, descriptive title]
**Task Category**: [Feature Development | Bug Fix | Enhancement | Maintenance | Documentation | Modernization]
**Priority Level**: [High | Medium | Low]
**Estimated Complexity**: [Simple | Moderate | Complex | Very Complex]
**Phase 1 Alignment**: [Modern JS | Error Handling | Service Architecture | Documentation | Multiple]
**Dependencies**: [List any dependencies or prerequisites]
**Modernization Impact**: [How this task contributes to Phase 1 goals]
```

#### Context Analysis
```
**Business Context**: 
- What business problem does this task solve?
- How does it align with project mission and goals?
- What is the expected business impact?

**Technical Context**:
- Which system components are affected?
- What existing code/functionality needs modification?
- Are there any technical constraints or limitations?

**User Impact**:
- Who are the end users affected by this task?
- How will this change improve user experience?
- Are there any potential user experience risks?
```

### 2. Requirements Analysis

#### Functional Requirements
```
**Core Functionality**:
1. [Requirement 1 - specific, measurable]
2. [Requirement 2 - specific, measurable]
3. [Requirement 3 - specific, measurable]

**Input/Output Specifications**:
- Input: [Data format, validation rules, sources]
- Processing: [Business logic, calculations, transformations]
- Output: [Expected results, format, destinations]

**Integration Points**:
- Google Workspace: [Sheets, Forms, Drive, Gmail]
- External APIs: [MyTAPI, future integrations]
- Internal Services: [List affected services]
```

#### Non-Functional Requirements
```
**Performance**:
- Response time targets: [< X seconds]
- Throughput requirements: [X operations/minute]
- Resource constraints: [Memory, execution time]
- Modern JS optimization opportunities

**Security**:
- Data protection requirements
- Access control needs
- Compliance considerations (GDPR)
- Secure coding practices (input validation, sanitization)

**Reliability**:
- Error handling requirements (try-catch, graceful degradation)
- Fallback mechanisms
- Recovery procedures
- Service resilience patterns

**Maintainability**:
- Code modularity and reusability
- Documentation completeness
- Service interface clarity
- Future extensibility considerations
```

### 3. Technical Analysis

#### Architecture Impact
```
**Affected Components**:
- [ ] Frontend (HTML/CSS/JavaScript)
- [ ] Backend (Google Apps Script)
- [ ] Database (Google Sheets)
- [ ] Forms (Google Forms)
- [ ] Communication (WhatsApp API)
- [ ] Configuration files
- [ ] Documentation

**Code Changes Required**:
- New files to create: [List with purposes]
- Existing files to modify: [List with change types]
- Dependencies to add/update: [List with versions]
```

#### Implementation Approach
```
**Development Strategy**:
1. [Step 1 - specific action]
2. [Step 2 - specific action]
3. [Step 3 - specific action]

**Phase 1 Modernization Checklist**:
- [ ] Modern JavaScript features implemented (ES6+)
- [ ] Comprehensive error handling added
- [ ] Service-oriented design principles applied
- [ ] Complete documentation provided
- [ ] Code follows established standards
- [ ] Performance optimizations included

**Risk Assessment**:
- Technical risks: [List potential issues]
- Business risks: [List potential impacts]
- Mitigation strategies: [How to address risks]

**Testing Strategy**:
- Unit tests: [What to test]
- Integration tests: [What to validate]
- User acceptance criteria: [Success metrics]
```

### 4. Resource Planning

#### Time Estimation
```
**Development Phases**:
- Research & Analysis: [X hours]
- Design & Planning: [X hours]
- Implementation: [X hours]
- Testing & Validation: [X hours]
- Documentation: [X hours]
- Total Estimated Time: [X hours]

**Milestones**:
1. [Milestone 1] - [Date/Timeline]
2. [Milestone 2] - [Date/Timeline]
3. [Milestone 3] - [Date/Timeline]
```

#### Dependencies & Blockers
```
**Prerequisites**:
- [ ] [Dependency 1 - description]
- [ ] [Dependency 2 - description]
- [ ] [Dependency 3 - description]

**Potential Blockers**:
- [Blocker 1 - impact and mitigation]
- [Blocker 2 - impact and mitigation]

**External Dependencies**:
- API availability: [Status and requirements]
- Third-party services: [Dependencies and SLAs]
- Team coordination: [Required approvals or reviews]
```

### 5. Quality Assurance

#### Acceptance Criteria
```
**Functional Criteria**:
- [ ] [Criterion 1 - specific, testable]
- [ ] [Criterion 2 - specific, testable]
- [ ] [Criterion 3 - specific, testable]

**Technical Criteria**:
- [ ] Code follows established standards
- [ ] Performance meets requirements
- [ ] Security measures implemented
- [ ] Error handling comprehensive
- [ ] Documentation complete

**User Experience Criteria**:
- [ ] Interface is intuitive and responsive
- [ ] Workflow is efficient and logical
- [ ] Error messages are clear and helpful
- [ ] Mobile compatibility maintained
```

#### Testing Plan
```
**Test Scenarios**:
1. Happy path: [Normal operation flow]
2. Edge cases: [Boundary conditions]
3. Error conditions: [Failure scenarios]
4. Performance: [Load and stress testing]
5. Security: [Access control and data protection]

**Test Data Requirements**:
- Sample data sets needed
- Test user accounts required
- Environment setup needs
```

### 6. Implementation Checklist

#### Pre-Implementation
```
- [ ] Task analysis completed and reviewed
- [ ] Design approved by stakeholders
- [ ] Dependencies resolved
- [ ] Development environment prepared
- [ ] Test data and scenarios defined
```

#### During Implementation
```
**Phase 1 Foundation Requirements**:
- [ ] Follow coding standards from code-standards.md
- [ ] Implement modern JavaScript features (ES6+)
- [ ] Apply service-oriented architecture principles
- [ ] Implement comprehensive error handling with try-catch blocks
- [ ] Add graceful degradation for failure scenarios
- [ ] Provide user-friendly error messages
- [ ] Add appropriate logging and monitoring
- [ ] Write unit tests for new functionality
- [ ] Create JSDoc comments for all functions
- [ ] Update documentation as needed
- [ ] Ensure modular, reusable code design
- [ ] Validate performance optimizations
```

#### Post-Implementation
```
**Standard Validation**:
- [ ] All tests passing
- [ ] Code review completed
- [ ] Performance validated
- [ ] Security assessment done
- [ ] Documentation updated
- [ ] Deployment plan ready

**Phase 1 Modernization Validation**:
- [ ] Modern JavaScript implementation verified
- [ ] Error handling coverage confirmed
- [ ] Service architecture principles validated
- [ ] Documentation completeness verified
- [ ] Code modularity and reusability confirmed
- [ ] Performance improvements measured
- [ ] User experience enhancements validated
```

### 7. Documentation Requirements

#### Code Documentation
```
**Required Documentation**:
- [ ] JSDoc comments for all functions
- [ ] Inline comments for complex logic
- [ ] API documentation for new endpoints
- [ ] Configuration changes documented

**Update Requirements**:
- [ ] README files updated
- [ ] Technical specifications revised
- [ ] User guides modified
- [ ] Agent-OS configuration updated
```

#### Knowledge Transfer
```
**Documentation Deliverables**:
- Implementation summary
- Architecture changes
- Operational procedures
- Troubleshooting guide
- Future enhancement recommendations
```

## Reference Documents

Always consult these documents during task analysis:
- **<mcfile name="project-config.md" path="e:\\Anwar_sales_eco\\.agent-os\\project-config.md"></mcfile>**: Complete project overview
- **<mcfile name="mission.md" path="e:\\Anwar_sales_eco\\.agent-os\\product\\mission.md"></mcfile>**: Project mission and goals
- **<mcfile name="sales-eco-spec.md" path="e:\\Anwar_sales_eco\\.agent-os\\projects\\sales-eco-spec.md"></mcfile>**: Technical specifications
- **<mcfile name="code-standards.md" path="e:\\Anwar_sales_eco\\.agent-os\\code-standards.md"></mcfile>**: Coding standards and best practices
- **<mcfile name="ai-guidelines.md" path="e:\\Anwar_sales_eco\\.agent-os\\ai-guidelines.md"></mcfile>**: AI development guidelines
- **<mcfile name="task-manager-agent.md" path="e:\\Anwar_sales_eco\\.agent-os\\agents\\task-manager-agent.md"></mcfile>**: Task management guidelines
- **<mcfile name="enhancement-roadmap.md" path="e:\\Anwar_sales_eco\\.agent-os\\roadmap\\enhancement-roadmap.md"></mcfile>**: Future development plans

## Example Usage

### Sample Task Analysis
```
**Task Title**: Add Business Unit Field to Sales Representative Management
**Task Category**: Feature Development
**Priority Level**: High
**Estimated Complexity**: Moderate
**Phase 1 Alignment**: Modern JS | Error Handling | Service Architecture | Documentation
**Modernization Impact**: Implements modern form validation, enhances service modularity, and improves error handling

**Business Context**: 
Support multiple business units (AIL/ACL) in the sales ecosystem to enable proper categorization and reporting of sales representatives.

**Technical Context**:
Modify existing SR management system to include business unit selection, update form validation, database schema, and management interface using modern JavaScript patterns.

**Core Functionality**:
1. Add dropdown field for Business Unit selection (AIL/ACL) with modern validation
2. Implement comprehensive error handling for form submission
3. Modify database schema with proper error recovery
4. Update management interface with responsive design and error states

**Implementation Approach**:
1. Update FormService.js using ES6+ features and modular design
2. Enhance SRHandler.js with try-catch blocks and graceful error handling
3. Modernize SRForm.html with improved validation and user feedback
4. Update SRManagement.html with service-oriented data handling
5. Document all changes with JSDoc comments and user guides

**Phase 1 Modernization Checklist**:
- [x] Modern JavaScript features implemented (arrow functions, destructuring)
- [x] Comprehensive error handling added (try-catch, user-friendly messages)
- [x] Service-oriented design principles applied (modular FormService)
- [x] Complete documentation provided (JSDoc, user guides)
- [x] Code follows established standards
- [x] Performance optimizations included (efficient DOM manipulation)
```

## Best Practices

### Task Analysis Guidelines
1. **Be Specific**: Use concrete, measurable requirements
2. **Consider Impact**: Analyze effects on all system components
3. **Plan for Failure**: Include error handling and recovery scenarios
4. **Think Long-term**: Consider future scalability and maintenance
5. **Document Decisions**: Record rationale for design choices
6. **Align with Modernization**: Ensure tasks contribute to Phase 1 goals

### Phase 1 Modernization Guidelines
1. **Modern JavaScript First**: Prioritize ES6+ features and patterns
2. **Error-Resilient Design**: Build comprehensive error handling from the start
3. **Service Modularity**: Design with clear service boundaries and interfaces
4. **Documentation-Driven**: Create documentation alongside implementation
5. **Performance-Conscious**: Consider optimization opportunities early
6. **Future-Ready**: Design for extensibility and maintainability

### Quality Assurance
1. **Validate Requirements**: Ensure all stakeholder needs are addressed
2. **Review Dependencies**: Confirm all prerequisites are identified
3. **Assess Risks**: Evaluate potential issues and mitigation strategies
4. **Plan Testing**: Define comprehensive test scenarios
5. **Prepare Documentation**: Ensure knowledge transfer materials are ready
6. **Verify Modernization**: Confirm Phase 1 compliance throughout development

---

*This template ensures consistent, thorough task analysis aligned with the Anwar Sales Ecosystem's standards and objectives.*