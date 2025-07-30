# Context Engineering Expert Prompt Directory

## Overview

This directory contains the complete Context Engineering Expert prompt system for the Anwar Sales Management System. The prompt is modularized across multiple files to enable better organization, reusability, and maintenance.

## Directory Structure

```text
context-engineering-expert/
├── README.md                           # This overview file
├── main-prompt.md                      # Core prompt definition
├── research-methodology.md             # Research approach and phases
├── analysis-criteria.md                # Evaluation frameworks and metrics
├── implementation-patterns.md          # Code patterns and examples
├── deliverables-specification.md       # Required outputs and formats
├── technical-specifications.md         # Technical implementation details
├── quality-gates.md                   # Success criteria and validation
└── extensions/                        # Additional specialized components
    ├── web-research-guide.md          # Web research focus areas
    ├── current-state-analysis.md      # Project analysis templates
    └── improvement-roadmap.md         # Implementation timeline templates
```

## Usage

### For Prompt Builder Agent

Reference the complete prompt system using:

```markdown
<mcfile name="main-prompt.md" path=".agent-os/prompts/context-engineering-expert/main-prompt.md"></mcfile>
```

### For Context Engineering Expert

Use individual components as needed:

```markdown
<mcfile name="research-methodology.md" path=".agent-os/prompts/context-engineering-expert/research-methodology.md"></mcfile>
<mcfile name="analysis-criteria.md" path=".agent-os/prompts/context-engineering-expert/analysis-criteria.md"></mcfile>
```

## File Tags

Each file in this directory uses specific tags for AI context and prompt integration:

- `#context-engineering` - Core context engineering concepts
- `#ai-optimization` - AI workflow optimization
- `#research-methodology` - Research approaches and techniques
- `#analysis-framework` - Evaluation and assessment criteria
- `#implementation-guide` - Technical implementation patterns
- `#quality-assurance` - Success criteria and validation
- `#google-apps-script` - Platform-specific considerations
- `#prompt-extension` - Modular prompt components

## Integration

This modular approach enables:

- **Reusability**: Individual components can be used in other prompts
- **Maintainability**: Easy updates to specific sections without affecting others
- **Extensibility**: New components can be added without restructuring
- **Context Preservation**: Each file maintains rich AI context through tags
- **Version Control**: Granular tracking of changes to specific prompt components

## Version

Current Version: 1.0.0
Last Updated: July 31, 2025
Compatibility: Anwar Sales Management System v2.0
