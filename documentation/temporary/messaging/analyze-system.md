# Creating Custom Claude Commands - `/analyze-feature` Setup Guide

This document explains how to create a custom Claude Code slash command that automatically generates comprehensive documentation for any feature in your codebase.

---

## Quick Start

Run this command to create the `/analyze-feature` command:

```bash
mkdir -p ~/.claude/commands
cat > ~/.claude/commands/analyze-feature.md << 'COMMAND_EOF'
---
argument-hint: [feature-path] [output-dir]
description: Analyze a feature/system and generate comprehensive documentation
---

# Feature Analysis Task

Analyze the feature located at `$1` and generate comprehensive documentation in `$2`.

## Your Task

1. **Explore the feature directory** at `$1`:
   - Find all relevant files (components, hooks, types, API routes, stores)
   - Understand the architecture and data flow
   - Identify key patterns and technologies used

2. **Create a summary.md** in `$2` with:
   - System purpose and overview
   - Architecture diagram (ASCII art)
   - Data flow diagram for the main operations
   - File structure tree
   - Key technologies table
   - Links to detailed documentation files

3. **Create detailed documentation files** in `$2`:

   **data-models.md** - Data structures:
   - Database/Firestore collections and document structure
   - TypeScript interfaces and types
   - Serialization helpers (if any)
   - Configuration constants

   **hooks-detail.md** - React hooks (if applicable):
   - Each custom hook with its purpose
   - Return types and parameters
   - Internal logic explained with code examples
   - How hooks interact with state management

   **state-management.md** - State management (Redux/Context/etc):
   - State shape and initial values
   - Actions/reducers with explanations
   - Selectors
   - How state integrates with the rest of the app

   **api-routes.md** - API endpoints (if applicable):
   - Each endpoint with method, path, purpose
   - Request/response examples
   - Authentication requirements
   - Error handling

   **real-time-updates.md** - Real-time features (if applicable):
   - How real-time sync works
   - Listeners and subscriptions
   - Optimistic updates
   - Any race conditions or edge cases handled

   **components.md** - UI components:
   - Component hierarchy tree
   - Each component with props, purpose, and key features
   - Styling patterns
   - User interaction flows

4. **Only create files that are relevant** to the feature being analyzed. Skip files for concepts that don't apply (e.g., skip api-routes.md if there are no API routes).

5. **Use clear formatting**:
   - ASCII diagrams for architecture
   - Code blocks with syntax highlighting
   - Tables for structured data
   - Clear section headers

## Output Requirements

- Create the output directory if it doesn't exist
- Each file should be self-contained and readable
- Include line number references when discussing specific code
- Explain WHY things are designed the way they are, not just WHAT they do
COMMAND_EOF

echo "Command created! Use it with: /analyze-feature <feature-path> <output-dir>"
```

---

## How Claude Code Custom Commands Work

### File Locations

| Location | Scope | Shown As |
|----------|-------|----------|
| `~/.claude/commands/` | All projects (personal) | `(user)` |
| `.claude/commands/` | Current project only | `(project)` |

On your Debian system:
- Personal commands: `/home/nickkane/.claude/commands/`
- Project commands: `/home/nickkane/Projects/Glamlink-Website/web_app/.claude/commands/`

### File Format

Commands are Markdown files with optional YAML frontmatter:

```markdown
---
argument-hint: [arg1] [arg2]
description: What the command does
allowed-tools: Bash(git:*), Read, Write
model: claude-sonnet-4-20250514
---

Your prompt instructions here.
Use $1, $2, etc. for individual arguments.
Use $ARGUMENTS for all arguments as a string.
```

### Frontmatter Options

| Option | Purpose | Example |
|--------|---------|---------|
| `argument-hint` | Shows expected args in autocomplete | `[feature-path] [output-dir]` |
| `description` | Brief description | `"Analyze a feature"` |
| `allowed-tools` | Restrict which tools can be used | `Bash(npm:*), Read, Write` |
| `model` | Force a specific model | `claude-sonnet-4-20250514` |

### Argument Syntax

```markdown
# Single argument
Analyze $ARGUMENTS

# Multiple arguments
Feature path: $1
Output directory: $2
Options: $3
```

### Dynamic Content

You can embed bash command output:

```markdown
Current git status: !`git status --short`
Current branch: !`git branch --show-current`
```

---

## Usage Examples

### Analyze the messaging system:
```
/analyze-feature lib/features/crm/profile/support-messaging documentation/features/messaging
```

### Analyze analytics dashboard:
```
/analyze-feature lib/features/analytics documentation/features/analytics
```

### Analyze digital cards:
```
/analyze-feature lib/features/digital-card documentation/features/digital-card
```

---

## Creating More Custom Commands

### Command: `/doc-api`
Document all API routes in a directory:

```bash
cat > ~/.claude/commands/doc-api.md << 'EOF'
---
argument-hint: [api-path]
description: Document all API routes in a directory
---

Find all API route files in `$1` and create comprehensive documentation including:
- Endpoint method and path
- Request/response schemas
- Authentication requirements
- Example curl commands
- Error responses

Output to `$1/API.md`
EOF
```

### Command: `/create-tests`
Generate tests for a component/hook:

```bash
cat > ~/.claude/commands/create-tests.md << 'EOF'
---
argument-hint: [file-path]
description: Generate comprehensive tests for a file
---

Read `$1` and create a comprehensive test file covering:
- All exported functions/components
- Edge cases and error handling
- Mocking of dependencies
- Integration with related modules

Save tests next to the original file with `.test.ts` extension.
EOF
```

### Command: `/refactor`
Refactor code with specific goals:

```bash
cat > ~/.claude/commands/refactor.md << 'EOF'
---
argument-hint: [file-path] [goal]
description: Refactor code with a specific goal
---

Refactor `$1` with the goal of: $2

Consider:
- Maintaining existing behavior
- Improving readability
- Reducing complexity
- Following project patterns

Show before/after comparisons for significant changes.
EOF
```

---

## Managing Commands

### List all available commands:
```bash
ls -la ~/.claude/commands/
ls -la .claude/commands/  # in project root
```

### View a command:
```bash
cat ~/.claude/commands/analyze-feature.md
```

### Delete a command:
```bash
rm ~/.claude/commands/analyze-feature.md
```

### See commands in Claude Code:
Type `/` in Claude Code to see autocomplete with all available commands.

---

## Tips

1. **Start simple** - Create basic commands first, then add complexity
2. **Use argument-hint** - Helps remember what arguments are needed
3. **Project vs Personal** - Use project commands for team-shared workflows
4. **Test incrementally** - Run the command on small features first
5. **Iterate on prompts** - Refine the command based on output quality
