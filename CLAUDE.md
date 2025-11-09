# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is the **Blogic Marketplace** - a Claude Code plugin marketplace containing enterprise-grade plugins developed by Blogic. The primary plugin is **agent-kit**, which provides development workflow automation, MCP server integrations, and quality gate hooks.

## Repository Structure

```
blogic-marketplace/
├── .claude-plugin/
│   └── marketplace.json       # Marketplace configuration
├── agent-kit/                 # Main plugin
│   ├── .claude-plugin/
│   │   └── plugin.json        # Plugin manifest with hooks
│   ├── .mcp.json              # MCP server configurations
│   ├── commands/              # Slash commands
│   ├── scripts/               # Hook scripts and utilities
│   │   ├── check-runner.sh    # Hook execution helper
│   │   ├── edit-tracker.sh    # Edit tracking for conditional hooks
│   │   ├── check-after-edit.sh
│   │   ├── check-after-stop.sh
│   │   ├── celebrate.sh
│   │   └── notify-approval.sh
│   └── install-agent-kit.sh   # Installation script
```

## Development Commands

### Testing Plugin Locally

```bash
# Start Claude Code
claude

# Add marketplace locally
/plugin marketplace add /path/to/blogic-marketplace

# Install plugin
/plugin install agent-kit@blogic-marketplace

# After changes, reinstall
/plugin uninstall agent-kit@blogic-marketplace
/plugin install agent-kit@blogic-marketplace
```

### Manual Hook Testing

```bash
# Test post-edit checks
/agent-kit:check-after-edit

# Test post-stop checks
/agent-kit:check-after-stop
```

## Architecture

### Hook System

The agent-kit plugin uses **file-based edit tracking** to conditionally run hooks:

1. **PostToolUse Hook** (`check-after-edit.sh`):
   - Triggers after Edit/Write tool calls
   - Calls `mark_edit_made()` to track that edits occurred
   - Runs user-configured linting/formatting checks
   - Uses `check-runner.sh` helper for standardized execution

2. **Stop Hook** (`check-after-stop.sh`):
   - Triggers when conversation ends
   - Checks `has_edits()` - **only runs if edits were made**
   - Skips execution during pure analysis sessions
   - Runs user-configured quality gates (builds, tests)
   - Calls `clear_edit_tracking()` on success
   - Executes `celebrate.sh` after successful checks

3. **Edit Tracking** (`edit-tracker.sh`):
   - Uses `.claude/.edit-tracker` file (gitignored)
   - Functions: `mark_edit_made()`, `has_edits()`, `clear_edit_tracking()`
   - Ensures Stop hook only runs when code was modified

### MCP Servers

Integrated MCP servers in `.mcp.json`:
- **chrome-dev-tools** - Chrome DevTools automation
- **sentry-spotlight** - Local error debugging
- **sentry** - Error tracking integration
- **agentsfera** - Extended API capabilities

### User Configuration

Users configure checks in their project's `.claude/` directory:
- `.claude/check-after-edit.sh` - Post-edit checks (linting, formatting)
- `.claude/check-after-stop.sh` - Post-stop checks (builds, tests)
- Scripts use `run_check_hook` helper from `check-runner.sh`

---

## Claude Code Development Guidelines

> **CRITICAL: Research First, Code Second**
>
> When working with ANY Claude Code features (hooks, commands, skills, MCPs), you MUST follow this mandatory research protocol. No exceptions.

### Research & Analysis Protocol

**For EVERY domain analysis step involving Claude Code features:**

1. ✅ **Read official documentation FIRST** - https://code.claude.com/docs
2. ✅ **Use Exa for real-world patterns** - `exa-get_code_context_exa`
3. ✅ **Analyze existing codebase patterns**
4. ✅ **Then design and implement**

**DO NOT skip steps. DO NOT guess. DO NOT assume.**

### 1. Official Documentation First

**Primary Source:** https://code.claude.com/docs

Before implementing ANY Claude Code feature, consult the official documentation:

- **Hooks:** https://code.claude.com/docs/en/hooks
- **Slash Commands:** https://code.claude.com/docs/en/slash-commands
- **Skills:** https://code.claude.com/docs/en/skills
- **MCPs:** https://code.claude.com/docs/en/mcp
- **Plugins:** https://code.claude.com/docs/en/plugins

**How to access:**
```
Use WebFetch tool to read specific documentation pages
Example: WebFetch(url: "https://code.claude.com/docs/en/hooks")
```

### 2. Exa Code Context - MANDATORY for Every Analysis Step

**Tool:** `exa-get_code_context_exa`

**REQUIRED for EVERY domain analysis involving:**
- 🔴 **Hooks** - PostToolUse, Stop, Notification lifecycle
- 🔴 **Commands** - Slash command creation, frontmatter, tool restrictions
- 🔴 **Skills** - Skill definitions, tool permissions, composition
- 🔴 **MCPs** - Server setup, tool registration, resource management

**Use Exa to find:**
- ✅ Real-world implementation patterns
- ✅ Error handling approaches
- ✅ Environment variable usage
- ✅ Best practices from existing plugins
- ✅ Edge cases and gotchas
- ✅ Working examples to learn from

**Example queries:**
```
exa-get_code_context_exa(query: "Claude Code PostToolUse hook patterns")
exa-get_code_context_exa(query: "Claude Code command markdown frontmatter examples")
exa-get_code_context_exa(query: "Claude Code plugin.json hook configuration")
exa-get_code_context_exa(query: "MCP server integration with Claude Code")
```

### 3. Mandatory Domain Analysis Workflow

**ALWAYS follow this workflow for Hooks, Commands, Skills, and MCPs:**

```
Step 1: 📖 Read Official Docs (WebFetch)
         └─ https://code.claude.com/docs/en/[feature]
  ↓
Step 2: 🔍 Research with Exa (MANDATORY)
         └─ exa-get_code_context_exa(query: "Claude Code [feature] patterns")
  ↓
Step 3: 🔬 Analyze Existing Codebase
         └─ Check agent-kit/scripts/, commands/, plugin.json
  ↓
Step 4: 🎯 Design Solution
         └─ Based on docs + Exa findings + codebase patterns
  ↓
Step 5: 💻 Implement
  ↓
Step 6: ✅ Test
  ↓
Step 7: 📝 Document (if new patterns discovered)
```

**If you skip Step 1 or Step 2, you will likely introduce bugs.**

### 4. Feature-Specific Research Requirements

> **Each feature type has mandatory research steps. Complete ALL steps before implementation.**

#### 🪝 Hooks
1. **📖 Read Docs:** https://code.claude.com/docs/en/hooks
2. **🔍 Exa Research:** Hook lifecycle, error handling, environment variables (CLAUDE_PLUGIN_ROOT, CLAUDE_PROJECT_DIR)
3. **📋 Key Topics:** PostToolUse, Stop, Notification hooks, hook chaining, exit codes, conditional execution

#### ⚡ Slash Commands
1. **📖 Read Docs:** https://code.claude.com/docs/en/slash-commands
2. **🔍 Exa Research:** Command patterns, allowed-tools restrictions, natural language instruction approaches
3. **📋 Key Topics:** Markdown frontmatter YAML, tool permissions, command arguments, KISS principles

#### 🎯 Skills
1. **📖 Read Docs:** https://code.claude.com/docs/en/skills
2. **🔍 Exa Research:** Skill definitions, tool access patterns, reusable skill composition
3. **📋 Key Topics:** Skill scope, tool permissions, skill inheritance, skill libraries

#### 🔌 MCPs (Model Context Protocol)
1. **📖 Read Docs:** https://code.claude.com/docs/en/mcp
2. **🔍 Exa Research:** MCP server setup, tool definitions, resource management, transport protocols
3. **📋 Key Topics:** Server configuration (.mcp.json), tool registration, resource URIs, HTTP vs stdio

#### 📦 Plugins
1. **📖 Read Docs:** https://code.claude.com/docs/en/plugins
2. **🔍 Exa Research:** plugin.json structure, marketplace publishing workflows, semantic versioning
3. **📋 Key Topics:** Plugin manifest, hook registration, installation scripts, marketplace.json

### 5. When NOT to Reinvent

**Before writing custom code:**
1. Check if official tooling exists (check docs)
2. Search Exa for existing solutions
3. Consider if simpler approach exists (KISS principle)

### 6. Error Resolution Protocol

When encountering errors with Claude Code features:

```
1. Read error message carefully
2. Check official docs for related concepts
3. Use Exa to find similar error patterns
4. Verify environment variables (CLAUDE_PROJECT_DIR, CLAUDE_PLUGIN_ROOT)
5. Test with minimal reproduction
6. Consider if issue is environmental vs. code-related
```

### 7. Complete Documentation Index

Main documentation: https://code.claude.com/docs

This provides access to all Claude Code documentation including quickstarts, guides, and references.

---

## ⚠️ CRITICAL REMINDERS

### For ANY work on Hooks, Commands, Skills, or MCPs:

1. **📖 ALWAYS read official documentation FIRST**
   - Don't assume you know how it works
   - Don't skip the docs "to save time"
   - Documentation: https://code.claude.com/docs

2. **🔍 ALWAYS use Exa for domain analysis**
   - Use `exa-get_code_context_exa` for EVERY feature
   - Search for patterns, examples, edge cases
   - Learn from real-world implementations

3. **🚫 NEVER guess or assume**
   - If unsure, research first
   - If error occurs, check docs + Exa before debugging
   - If implementing new feature, follow the mandatory workflow

4. **✅ Research → Design → Implement → Test**
   - This order is non-negotiable
   - Shortcuts lead to bugs
   - Research leads to robust solutions

---

> **"Every feature in Claude Code has been designed with specific patterns and best practices.**
> **Don't guess—read the docs and learn from existing implementations using Exa."**
