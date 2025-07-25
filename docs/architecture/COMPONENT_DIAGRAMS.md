# Component Diagrams - Anwar Sales Management System

## Overview

This document provides detailed component diagrams for the Anwar Sales Management System, complementing the main System Architecture Document. These diagrams illustrate the internal structure, boundaries, and interactions of system components across all four registration systems.

## Table of Contents

1. [System-Level Component Architecture](#system-level-component-architecture)
2. [Registration System Components](#registration-system-components)
3. [Cross-Cutting Concern Components](#cross-cutting-concern-components)
4. [Component Interaction Patterns](#component-interaction-patterns)
5. [Technology Stack Mapping](#technology-stack-mapping)

---

## System-Level Component Architecture

### High-Level Component Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        Anwar Sales Management System                           │
│                           Component Architecture                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                        Presentation Layer                              │   │
│  │                                                                         │   │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │   │
│  │ │ Contractor  │ │  Engineer   │ │  Retailer   │ │ Potential Site  │   │   │
│  │ │Registration │ │Registration │ │Registration │ │  Registration   │   │   │
│  │ │    Form     │ │    Form     │ │    Form     │ │      Form       │   │   │
│  │ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                    │                                           │
│                                    ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                      Application Layer                                 │   │
│  │                                                                         │   │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │   │
│  │ │ Contractor  │ │  Engineer   │ │  Retailer   │ │ Potential Site  │   │   │
│  │ │Registration │ │Registration │ │Registration │ │  Registration   │   │   │
│  │ │  Service    │ │  Service    │ │  Service    │ │    Service      │   │   │
│  │ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                    │                                           │
│                                    ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                       Shared Services Layer                            │   │
│  │                                                                         │   │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │   │
│  │ │ Validation  │ │ Notification│ │  Workflow   │ │   Document      │   │   │
│  │ │  Service    │ │  Service    │ │  Service    │ │  Generation     │   │   │
│  │ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────┘   │   │
│  │                                                                         │   │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │   │
│  │ │ Analytics   │ │   Audit     │ │   Security  │ │   Integration   │   │   │
│  │ │  Service    │ │  Service    │ │  Service    │ │    Service      │   │   │
│  │ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                    │                                           │
│                                    ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                        Data Layer                                      │   │
│  │                                                                         │   │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │   │
│  │ │   Google    │ │   Google    │ │   Google    │ │     Google      │   │   │
│  │ │   Sheets    │ │    Drive    │ │    Gmail    │ │   Properties    │   │   │
│  │ │ (Database)  │ │(File Storage)│ │(Email Svc)  │ │   (Config)      │   │   │
│  │ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                    │                                           │
│                                    ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                    External Integration Layer                          │   │
│  │                                                                         │   │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │   │
│  │ │   MyTAPI    │ │   Google    │ │   Third     │ │    Future       │   │   │
│  │ │  WhatsApp   │ │   APIs      │ │   Party     │ │  Integrations   │   │   │
│  │ │     API     │ │             │ │   APIs      │ │                 │   │   │
│  │ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Registration System Components

### 1. Contractor Registration Component

```
┌─────────────────────────────────────────────────────────────────┐
│                Contractor Registration Component                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Input Interface                            │   │
│  │                                                         │   │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │   │
│  │ │   Google    │ │   Form      │ │    Webhook      │   │   │
│  │ │    Form     │ │ Validation  │ │   Handler       │   │   │
│  │ │  Handler    │ │   Rules     │ │                 │   │   │
│  │ └─────────────┘ └─────────────┘ └─────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                 │
│                              ▼                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │            Business Logic Layer                        │   │
│  │                                                         │   │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │   │
│  │ │ Contractor  │ │ Skill Set   │ │   Experience    │   │   │
│  │ │ Validator   │ │ Validator   │ │   Validator     │   │   │
│  │ └─────────────┘ └─────────────┘ └─────────────────┘   │   │
│  │                                                         │   │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │   │
│  │ │ CRO Review  │ │ Approval    │ │   Status        │   │   │
│  │ │  Workflow   │ │  Engine     │ │  Management     │   │   │
│  │ └─────────────┘ └─────────────┘ └─────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                 │
│                              ▼                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Data Access Layer                         │   │
│  │                                                         │   │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │   │
│  │ │ Contractor  │ │   Audit     │ │   Document      │   │   │
│  │ │   Sheet     │ │   Trail     │ │   Storage       │   │   │
│  │ │  Manager    │ │  Logger     │ │                 │   │   │
│  │ └─────────────┘ └─────────────┘ └─────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Engineer Registration Component

```
┌─────────────────────────────────────────────────────────────────┐
│                Engineer Registration Component                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Input Interface                            │   │
│  │                                                         │   │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │   │
│  │ │   Google    │ │ Enhanced    │ │   Document      │   │   │
│  │ │    Form     │ │Validation   │ │   Upload        │   │   │
│  │ │  Handler    │ │   Rules     │ │   Handler       │   │   │
│  │ └─────────────┘ └─────────────┘ └─────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                 │
│                              ▼                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │            Business Logic Layer                        │   │
│  │                                                         │   │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │   │
│  │ │ Credential  │ │  License    │ │   Education     │   │   │
│  │ │ Validator   │ │ Validator   │ │   Validator     │   │   │
│  │ └─────────────┘ └─────────────┘ └─────────────────┘   │   │
│  │                                                         │   │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │   │
│  │ │ Technical   │ │ Multi-Level │ │   Certification │   │   │
│  │ │ Assessment  │ │ Approval    │ │   Tracking      │   │   │
│  │ └─────────────┘ └─────────────┘ └─────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                 │
│                              ▼                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Data Access Layer                         │   │
│  │                                                         │   │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │   │
│  │ │ Engineer    │ │ Credential  │ │   Document      │   │   │
│  │ │   Sheet     │ │   Store     │ │   Repository    │   │   │
│  │ │  Manager    │ │             │ │                 │   │   │
│  │ └─────────────┘ └─────────────┘ └─────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Retailer Registration Component

```
┌─────────────────────────────────────────────────────────────────┐
│                Retailer Registration Component                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Input Interface                            │   │
│  │                                                         │   │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │   │
│  │ │   Google    │ │ Business    │ │   Financial     │   │   │
│  │ │    Form     │ │Validation   │ │   Document      │   │   │
│  │ │  Handler    │ │   Rules     │ │   Handler       │   │   │
│  │ └─────────────┘ └─────────────┘ └─────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                 │
│                              ▼                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │            Business Logic Layer                        │   │
│  │                                                         │   │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │   │
│  │ │ Business    │ │  Financial  │ │   Location      │   │   │
│  │ │ License     │ │ Capability  │ │   Validator     │   │   │
│  │ │ Validator   │ │ Validator   │ │                 │   │   │
│  │ └─────────────┘ └─────────────┘ └─────────────────┘   │   │
│  │                                                         │   │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │   │
│  │ │ Partnership │ │ Comprehensive│ │   Territory     │   │   │
│  │ │ Assessment  │ │   Approval   │ │   Assignment    │   │   │
│  │ └─────────────┘ └─────────────┘ └─────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                 │
│                              ▼                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Data Access Layer                         │   │
│  │                                                         │   │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │   │
│  │ │ Retailer    │ │ Business    │ │   Territory     │   │   │
│  │ │   Sheet     │ │ Document    │ │   Management    │   │   │
│  │ │  Manager    │ │   Store     │ │                 │   │   │
│  │ └─────────────┘ └─────────────┘ └─────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4. Potential Site Registration Component

```
┌─────────────────────────────────────────────────────────────────┐
│             Potential Site Registration Component               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Input Interface                            │   │
│  │                                                         │   │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │   │
│  │ │   Google    │ │ Geographic  │ │   Market        │   │   │
│  │ │    Form     │ │Validation   │ │   Analysis      │   │   │
│  │ │  Handler    │ │   Rules     │ │   Handler       │   │   │
│  │ └─────────────┘ └─────────────┘ └─────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                 │
│                              ▼                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │            Business Logic Layer                        │   │
│  │                                                         │   │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │   │
│  │ │ Location    │ │ Market      │ │   Feasibility   │   │   │
│  │ │ Analyzer    │ │ Potential   │ │   Assessor      │   │   │
│  │ │             │ │ Evaluator   │ │                 │   │   │
│  │ └─────────────┘ └─────────────┘ └─────────────────┘   │   │
│  │                                                         │   │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │   │
│  │ │ Strategic   │ │ Expansion   │ │   Priority      │   │   │
│  │ │ Assessment  │ │ Planning    │ │   Scoring       │   │   │
│  │ └─────────────┘ └─────────────┘ └─────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                 │
│                              ▼                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Data Access Layer                         │   │
│  │                                                         │   │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │   │
│  │ │ Site Data   │ │ Geographic  │ │   Market        │   │   │
│  │ │   Sheet     │ │   Data      │ │   Research      │   │   │
│  │ │  Manager    │ │   Store     │ │   Repository    │   │   │
│  │ └─────────────┘ └─────────────┘ └─────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Cross-Cutting Concern Components

### 1. Security Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Security Component Layer                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Authentication & Authorization             │   │
│  │                                                         │   │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │   │
│  │ │   Google    │ │    Role     │ │   Permission    │   │   │
│  │ │    OAuth    │ │  Manager    │ │   Controller    │   │   │
│  │ │  Handler    │ │             │ │                 │   │   │
│  │ └─────────────┘ └─────────────┘ └─────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                 │
│                              ▼                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                Data Protection                          │   │
│  │                                                         │   │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │   │
│  │ │ Data        │ │ PII         │ │   Encryption    │   │   │
│  │ │ Sanitizer   │ │ Protector   │ │   Manager       │   │   │
│  │ └─────────────┘ └─────────────┘ └─────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                 │
│                              ▼                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Audit & Compliance                        │   │
│  │                                                         │   │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │   │
│  │ │ Activity    │ │ Compliance  │ │   Security      │   │   │
│  │ │ Logger      │ │ Monitor     │ │   Event         │   │   │
│  │ │             │ │             │ │   Handler       │   │   │
│  │ └─────────────┘ └─────────────┘ └─────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Data Processing Pipeline Components

```
┌─────────────────────────────────────────────────────────────────┐
│                Data Processing Pipeline                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                Input Processing                         │   │
│  │                                                         │   │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │   │
│  │ │   Form      │ │   Data      │ │   Format        │   │   │
│  │ │ Extractor   │ │ Parser      │ │ Normalizer      │   │   │
│  │ └─────────────┘ └─────────────┘ └─────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                 │
│                              ▼                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Validation Engine                          │   │
│  │                                                         │   │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │   │
│  │ │ Schema      │ │ Business    │ │   Cross-Field   │   │   │
│  │ │ Validator   │ │ Rule        │ │   Validator     │   │   │
│  │ │             │ │ Validator   │ │                 │   │   │
│  │ └─────────────┘ └─────────────┘ └─────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                 │
│                              ▼                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Data Transformation                       │   │
│  │                                                         │   │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │   │
│  │ │ Data        │ │ Enrichment  │ │   Storage       │   │   │
│  │ │ Mapper      │ │ Engine      │ │   Formatter     │   │   │
│  │ └─────────────┘ └─────────────┘ └─────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Integration Layer Components

```
┌─────────────────────────────────────────────────────────────────┐
│                   Integration Layer                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              External API Gateway                      │   │
│  │                                                         │   │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │   │
│  │ │   MyTAPI    │ │   Google    │ │   Third Party   │   │   │
│  │ │ Connector   │ │    API      │ │     API         │   │   │
│  │ │             │ │ Connector   │ │   Connector     │   │   │
│  │ └─────────────┘ └─────────────┘ └─────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                 │
│                              ▼                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Message Processing                        │   │
│  │                                                         │   │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │   │
│  │ │ Message     │ │ Event       │ │   Webhook       │   │   │
│  │ │ Router      │ │ Processor   │ │   Handler       │   │   │
│  │ └─────────────┘ └─────────────┘ └─────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                 │
│                              ▼                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Error Handling                            │   │
│  │                                                         │   │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │   │
│  │ │ Retry       │ │ Circuit     │ │   Fallback      │   │   │
│  │ │ Manager     │ │ Breaker     │ │   Handler       │   │   │
│  │ └─────────────┘ └─────────────┘ └─────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Interaction Patterns

### Event-Driven Component Interactions

```
┌─────────────────────────────────────────────────────────────────┐
│                Component Interaction Flow                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Form Submission Event                                          │
│  ┌─────────────┐    trigger    ┌─────────────────────────┐     │
│  │   Google    │──────────────▶│   Apps Script Trigger   │     │
│  │    Form     │               │   (onFormSubmit)        │     │
│  └─────────────┘               └─────────────────────────┘     │
│                                          │                     │
│                                          ▼                     │
│  Data Processing Chain                                          │
│  ┌─────────────┐    extract    ┌─────────────────────────┐     │
│  │ Form Data   │──────────────▶│   Registration Service   │     │
│  │ Extractor   │               │   (Type-Specific)       │     │
│  └─────────────┘               └─────────────────────────┘     │
│                                          │                     │
│                                          ▼                     │
│  Validation Chain                                               │
│  ┌─────────────┐    validate   ┌─────────────────────────┐     │
│  │ Validation  │──────────────▶│   Business Logic        │     │
│  │  Service    │               │   Processor             │     │
│  └─────────────┘               └─────────────────────────┘     │
│                                          │                     │
│                                          ▼                     │
│  Workflow Trigger                                               │
│  ┌─────────────┐    initiate   ┌─────────────────────────┐     │
│  │ Workflow    │──────────────▶│   Approval Workflow     │     │
│  │ Manager     │               │   Engine                │     │
│  └─────────────┘               └─────────────────────────┘     │
│                                          │                     │
│                                          ▼                     │
│  Parallel Processing                                            │
│  ┌─────────────┐    notify     ┌─────────────────────────┐     │
│  │Notification │──────────────▶│   WhatsApp Service      │     │
│  │ Service     │               │   (MyTAPI)              │     │
│  └─────────────┘               └─────────────────────────┘     │
│                                                                 │
│  ┌─────────────┐    store      ┌─────────────────────────┐     │
│  │ Data Store  │──────────────▶│   Google Sheets         │     │
│  │ Manager     │               │   Database              │     │
│  └─────────────┘               └─────────────────────────┘     │
│                                                                 │
│  ┌─────────────┐    log        ┌─────────────────────────┐     │
│  │ Audit       │──────────────▶│   Audit Trail           │     │
│  │ Service     │               │   Logger                │     │
│  └─────────────┘               └─────────────────────────┘     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Component Communication Patterns

#### 1. Synchronous Communication
```
Form Submission → Data Validation → Immediate Response
     │                   │                    │
     ▼                   ▼                    ▼
[Real-time]        [Blocking]           [User Feedback]
```

#### 2. Asynchronous Communication
```
Workflow Trigger → Background Processing → Event Notifications
     │                      │                       │
     ▼                      ▼                       ▼
[Non-blocking]        [Parallel Tasks]        [Status Updates]
```

#### 3. Event-Driven Communication
```
Status Change → Event Publisher → Multiple Subscribers
     │               │                    │
     ▼               ▼                    ▼
[State Update]  [Event Bus]        [Reactive Components]
```

---

## Technology Stack Mapping

### Component Technology Assignments

```
┌─────────────────────────────────────────────────────────────────┐
│                Technology Stack Mapping                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Presentation Layer                                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Google Forms (HTML5, CSS3, JavaScript)                 │   │
│  │ • Form Components: Native Google Forms                 │   │
│  │ • Validation: Client-side JavaScript                   │   │
│  │ • UI Framework: Google Material Design                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Application Layer                                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Google Apps Script (JavaScript ES6+)                   │   │
│  │ • Runtime: V8 JavaScript Engine                        │   │
│  │ • Execution: Serverless Functions                      │   │
│  │ • Triggers: Event-driven Architecture                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Service Layer                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Google Workspace APIs                                   │   │
│  │ • Sheets API: Data Management                           │   │
│  │ • Drive API: File Storage                               │   │
│  │ • Gmail API: Email Services                             │   │
│  │ • Forms API: Form Management                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Data Layer                                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Google Sheets (Structured Data)                         │   │
│  │ • Database: Spreadsheet-based                           │   │
│  │ • Query Language: Google Query Language (GQL)          │   │
│  │ • Backup: Google Drive Versioning                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Integration Layer                                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ External APIs                                           │   │
│  │ • MyTAPI: WhatsApp Business API                         │   │
│  │ • HTTP Client: UrlFetchApp (Google Apps Script)        │   │
│  │ • Authentication: API Keys, OAuth 2.0                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Security Layer                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Google Cloud Security                                   │   │
│  │ • Authentication: Google OAuth 2.0                     │   │
│  │ • Authorization: Google IAM                             │   │
│  │ • Encryption: TLS 1.3, AES-256                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Component Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                Deployment Architecture                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Google Cloud Platform                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │   │
│  │  │   Google    │ │   Google    │ │     Google      │   │   │
│  │  │ Apps Script │ │ Workspace   │ │     Drive       │   │   │
│  │  │   Runtime   │ │   Services  │ │    Storage      │   │   │
│  │  └─────────────┘ └─────────────┘ └─────────────────┘   │   │
│  │                                                         │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │   │
│  │  │   Google    │ │   Google    │ │     Google      │   │   │
│  │  │    Forms    │ │   Sheets    │ │     Gmail       │   │   │
│  │  │   Service   │ │   Service   │ │    Service      │   │   │
│  │  └─────────────┘ └─────────────┘ └─────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                 │
│                              ▼                                 │
│  External Services                                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │   │
│  │  │   MyTAPI    │ │   Future    │ │     Monitoring  │   │   │
│  │  │  WhatsApp   │ │Integration  │ │     Services    │   │   │
│  │  │   Service   │ │  Services   │ │                 │   │   │
│  │  └─────────────┘ └─────────────┘ └─────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Dependencies and Interfaces

### Internal Component Dependencies

```
Registration Services
├── Validation Service (Required)
├── Workflow Service (Required)
├── Notification Service (Required)
└── Data Store Service (Required)

Validation Service
├── Security Service (Required)
└── Configuration Service (Required)

Workflow Service
├── Notification Service (Required)
├── Audit Service (Required)
└── Timer Service (Required)

Notification Service
├── Integration Service (Required)
└── Template Service (Required)

Data Store Service
├── Security Service (Required)
└── Backup Service (Required)
```

### External Service Dependencies

```
Google Services (Critical)
├── Google Apps Script Runtime
├── Google Sheets API
├── Google Drive API
├── Google Forms API
└── Google Gmail API

Third-Party Services (Important)
├── MyTAPI WhatsApp Service
└── Future Integration Services

Monitoring Services (Optional)
├── Google Cloud Monitoring
└── Custom Analytics Services
```

---

## Summary

This Component Diagrams document provides a comprehensive view of the Anwar Sales Management System's component architecture, including:

1. **System-Level Architecture**: Overall component organization and layering
2. **Registration System Components**: Detailed breakdown of each registration type
3. **Cross-Cutting Concerns**: Security, data processing, and integration components
4. **Interaction Patterns**: How components communicate and collaborate
5. **Technology Mapping**: Specific technologies assigned to each component
6. **Dependencies**: Internal and external component relationships

These diagrams complement the main System Architecture Document and provide the detailed component view necessary for development, testing, and maintenance activities.