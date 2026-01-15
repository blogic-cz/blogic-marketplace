---
name: process-spec
description: |
  This skill creates detailed process specifications for the Nexus system. Use when designing new processes, migrating Portal processes to Nexus, or documenting import/export processes. The skill produces structured markdown documents describing business processes, operations, data flows, validations, and integration points. Invoke with /process-spec.
---

# Process Specification Skill

## Overview

Create comprehensive process specifications for the system which will be used as a requirements document for development team. The output is a structured markdown document following a standardized template that covers all aspects of a business process.

## When to Use

* Designing a new process for the system
* Describing existing process
* Preparing technical documentation for development

## Workflow

### Step 1: Gather Requirements

Before starting, collect the following information from the user:

1. **Process name and purpose** - what the process does and why, what is the name and ID
2. **Update of existing or creation of new process** - are we designing new process or updating existing one
3. **Data sources** - where data comes from (API, files, database)
4. **Target systems** - where data goes
5. **Trigger type** - automatic (CRON) / manual / event-driven
6. **User roles** - who works with the process
7. **Existing documentation** - Confluence pages, existing code references

Ask clarifying questions as below so you understand properly the need:

* "What is the main business goal of this process?"
* "Is there any process documentation?"
* "Do you aim to optimize existing process?"
* "What are the regular exceptions, edge cases and manual interventions in the process?"
* "How is the process triggered - automatically on schedule, manually, or by an event?"
* "What external systems does this process integrate with?"
* "Who are the users and what are their roles?"

### Step 2: Analyze Existing Implementation

If migrating from Portal, search codebase for relevant implementation:

* Use `Grep` to find related classes and functions
* Use `Read` to understand existing business logic
* Use `Glob` to find related files

### Step 3: Fetch Documentation

Ask user if any documentation exists and use tools to retrieve relevant documentation:

* Ask user if there is any domain dictionary
* Ask user if there is any existing process documentation

### Step 4: Create Specification

Produce the markdown document following the template structure in `references/process-template.md`.

### Step 5: Save Document

Save to `docs/` directory with naming convention: `{process-ID}-{process-name}.md`

### Step 6: Save summary of requirements into basic-memory

Save summary of the requirements and outcome of the analysis into basic-memory tool.

* use mcp__basic-memory__write_note
* Folder: {project_name}
* Project: {project_name}
* Create summary formatted as [Subject] [predicate] [Object]

## Output Document Structure

### 1. Business Goal

* **1.1 Process Purpose** - bullet points describing what the process ensures
* **1.2 Business Context** - explanation of why the process exists, types of processed data
* **1.3 Key Stakeholders** - table of roles and responsibilities

### 2. Input and Output Data

* API endpoints, DB tables or files which are used as input for the process
* **2.1 Input Data** - tables: Name, Source, Description
* **2.2 Output Data** - tables: Name, Type, Target, Description
* **2.3 Data Dependencies** - ASCII diagram of data flows

### 3. Data Validation

* **3.1 Input Validation** - Field, Rule, Error Message
* **3.2 Business Validation** - Validation, Condition, Action on Failure
* **3.3 Permission Checks** - permissions for operations, always use three level description in format {module}.{mainAggregate}.{action}, e.g. contracts.contract.detailview

### 4. Operations Description

* **4.1 Operations Overview** - table listing all operations (automatic and manual)
* **4.2 Operation Details** - for each operation provide:
  * **Purpose** - what the operation does
  * **Trigger** - what starts the operation (CRON, user action, event)
  * **Executor** - who/what executes the operation (system, user role)
  * **Required permission** - for manual operations
  * **Input/Output data** - tables with Source/Target, Data, Description
  * **API calls** - only endpoints used, DO NOT include examples of request and response bodies
  * **Validation rules** - table with Rule, Action on failure
  * **Exception handling** - table with Exception, Automatic resolution, Manual resolution
  * **Retry strategy** - number of attempts, intervals (if applicable)
  * **Specific error codes** - defined codes like UNKNOWN_PRODUCT, MISSING_HIERARCHY
* **4.3 State Diagram** - ASCII state diagram showing all states and transitions

### 5. UI Description

* **5.1 Screens Overview** - table: Screen name, Purpose
* **5.2 Screen Details** - for each screen provide:
  * **Purpose** - what the screen does and when user uses it
  * **Form fields** - if applicable, table with Field, Type, Validation
  * **Workflow** - numbered steps describing how user interacts with the screen
* **5.3 UI Components** - component details with visibility conditions
* **5.4 User Actions** - Action, Element, Backend endpoint, Notes

### 6. Process Exceptions

* **6.1 Expected Exceptions** - common errors and resolution
* **6.2 Error States** - technical errors
* **6.3 Rollback / Cancellation** - behavior on failure

### 7. Integration with Existing System

* **7.1 Affected Modules** - overview of integrations
* **7.2 Database Tables** - table names only (no SQL)
* **7.3 API Endpoints** - external and internal APIs
* **7.4 External Systems** - external dependencies

### 8. BPMN Diagram

* Placeholder section to add link to BPMN diagram

### 9. Specifics (optional)

* Process-specific aspects (e.g., AML processing, currency conversion)

## Rules

### DO:

* Structure document according to the template
* Use tables for clarity
* Describe input/output data for each operation
* Define validations and error messages
* Describe exception handling (automatic and manual)
* Include retry strategies where applicable (number of attempts, intervals)
* Define specific error codes for different failure scenarios
* Use ASCII diagrams for visualization
* For each UI screen, describe its purpose, form fields, and user workflow
* Ask about uncertainties before documenting
* Update based on user feedback
* Refer to examples in `examples/` directory for expected level of detail

### DO NOT:

* **DO NOT write SQL queries** - only list proposed table names
* **DO NOT invent API call examples** - only include them if the source documentation clearly specifies the API format
* **DO NOT create new internal API endpoints** if not explicitly asked for
* Do not describe BPMN process, it will be linked from another app
* Do not invent business rules - ask the user
* Do not assume technical details without verification
* Do not skip sections - mark as "N/A" if not relevant
* Do not include URL paths in UI screen descriptions

### Formatting:

* Document version in header (Version, Date, Author, Status)
* Markdown tables for structured data
* Code blocks for API examples and diagrams
* Blockquotes (`>`) for important notes
* **Maximum 3 heading levels** - use **bold text** or tables for further breakdown

## Example Interaction

**User:** I need to describe the process of importing contracts from external system XYZ to ABC.

**Response:** To prepare the process specification, clarify the following:

1. **Data source:** How does XYZ provide data? (API, files, other)
2. **Contract types:** What types of contracts are imported?
3. **Trigger:** Should the import be automatic (how often) or manual?
4. **Reference data:** Where do code lists come from (products, advisors)?
5. **Error states:** Who resolves import errors?
6. **Existing documentation:** Is there a Confluence page or existing code?

**User:** [provides answers]

**Response:** [Creates structured document according to the template]

## Resources

### references/

Contains the process specification template:

* `process-template.md` - standardized template for process specifications

### examples/

Contains example process specifications:

* `process-example.md!` - example documentation showing the expected level of detail and formatting