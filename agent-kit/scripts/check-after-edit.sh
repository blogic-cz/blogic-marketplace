#!/bin/bash

# Wrapper script that checks for user's custom after-edit script
# If it doesn't exist, creates a template with examples

# Use CLAUDE_PROJECT_DIR if available, fallback to current directory
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"
USER_SCRIPT="$PROJECT_DIR/.claude/check-after-edit.sh"

# Check if user script exists
if [ ! -f "$USER_SCRIPT" ]; then
  echo "Creating template: $USER_SCRIPT"

  # Create .claude directory if it doesn't exist
  mkdir -p "$PROJECT_DIR/.claude"

  # Create template with examples
  cat > "$USER_SCRIPT" << 'EOF'
#!/bin/bash
# Runs after Edit/Write - auto-fix and show warnings with JSON output

# Source the helper script from plugin
source "${CLAUDE_PLUGIN_ROOT}/scripts/check-runner.sh"

# === JS/TS (define "check" in package.json) ===
# run_check_hook "bun run check" "PostToolUse" "Linting failed"

# === .NET ===
# run_check_hook "dotnet format --verify-no-changes" "PostToolUse" "Format check failed"

# === Custom ===
# run_check_hook "your-command-here" "PostToolUse" "Custom check failed"
EOF

  chmod +x "$USER_SCRIPT"
  echo ""
  echo "⚠️  POST-EDIT HOOK NOT CONFIGURED!"
  echo "Template created at: $USER_SCRIPT"
  echo "Please uncomment or add commands to configure your post-edit workflow."
  echo ""
  exit 2
fi

# Check if script has any active (non-commented) commands
# Ignore shebang, empty lines, and comment lines
ACTIVE_LINES=$(grep -v '^#' "$USER_SCRIPT" | grep -v '^[[:space:]]*$' | wc -l)

if [ "$ACTIVE_LINES" -eq 0 ]; then
  echo ""
  echo "⚠️  POST-EDIT HOOK NOT CONFIGURED!"
  echo "File exists but contains no active commands: $USER_SCRIPT"
  echo "Please uncomment or add commands to configure your post-edit workflow."
  echo ""
  exit 2
fi

# Execute user's script
bash "$USER_SCRIPT"
