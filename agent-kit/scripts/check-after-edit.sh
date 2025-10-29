#!/bin/bash

# Wrapper script that checks for user's custom after-edit script
# If it doesn't exist, creates a template with examples

# Use CLAUDE_PROJECT_DIR if available, fallback to current directory
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"
USER_SCRIPT="$PROJECT_DIR/.claude/agent-after-edit.sh"

# Check if user script exists
if [ ! -f "$USER_SCRIPT" ]; then
  echo "Creating template: $USER_SCRIPT"

  # Create .claude directory if it doesn't exist
  mkdir -p "$PROJECT_DIR/.claude"

  # Create template with examples
  cat > "$USER_SCRIPT" << 'EOF'
#!/bin/bash
# Runs after Edit/Write - auto-fix and show warnings

# === JS/TS (define "format" in package.json) ===
# bun run format
# bun run check || echo "⚠️ Issues detected"

# === .NET ===
# dotnet format

# === Custom ===
EOF

  chmod +x "$USER_SCRIPT"

  # Use JSON output to block with detailed feedback
  REASON=$(printf "⚠️  POST-EDIT HOOK NOT CONFIGURED!\n\nTemplate created at: %s\nPlease uncomment or add commands to configure your post-edit workflow." "$USER_SCRIPT" | jq -Rs .)

  cat <<EOF
{
  "decision": "block",
  "reason": $REASON,
  "hookSpecificOutput": {
    "hookEventName": "PostToolUse",
    "additionalContext": "Template script created but needs configuration."
  }
}
EOF
  exit 0
fi

# Check if script has any active (non-commented) commands
# Ignore shebang, empty lines, and comment lines
ACTIVE_LINES=$(grep -v '^#' "$USER_SCRIPT" | grep -v '^[[:space:]]*$' | wc -l)

if [ "$ACTIVE_LINES" -eq 0 ]; then
  # Use JSON output to block with detailed feedback
  REASON=$(printf "⚠️  POST-EDIT HOOK NOT CONFIGURED!\n\nFile exists but contains no active commands: %s\nPlease uncomment or add commands to configure your post-edit workflow." "$USER_SCRIPT" | jq -Rs .)

  cat <<EOF
{
  "decision": "block",
  "reason": $REASON,
  "hookSpecificOutput": {
    "hookEventName": "PostToolUse",
    "additionalContext": "Script file exists but has no active commands."
  }
}
EOF
  exit 0
fi

# Execute user's script
bash "$USER_SCRIPT"
