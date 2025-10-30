#!/bin/bash
# Install script for agent-kit plugin

SETTINGS_FILE=".claude/settings.json"

# Create .claude directory if needed
mkdir -p .claude

# Check if settings.json already exists
if [ -f "$SETTINGS_FILE" ]; then
  echo "⚠️  $SETTINGS_FILE already exists!"
  echo ""
  echo "Current content:"
  cat "$SETTINGS_FILE"
  echo ""
  echo "Choose action:"
  echo "  1) Overwrite (⚠️  will delete existing config)"
  echo "  2) Show merge instructions and exit"
  echo "  3) Cancel"
  read -p "Enter choice [1-3]: " choice

  case $choice in
    1)
      echo "Overwriting $SETTINGS_FILE..."
      ;;
    2)
      echo ""
      echo "Manual merge required. Add this to your existing $SETTINGS_FILE:"
      echo ""
      echo "In 'extraKnownMarketplaces' add:"
      echo '  "blogic-marketplace": {'
      echo '    "source": {'
      echo '      "source": "github",'
      echo '      "repo": "blogic-cz/blogic-marketplace"'
      echo '    }'
      echo '  }'
      echo ""
      echo "In 'enabledPlugins' add:"
      echo '  "agent-kit@blogic-marketplace": true'
      echo ""
      exit 0
      ;;
    *)
      echo "Installation cancelled."
      exit 0
      ;;
  esac
fi

# Create/overwrite settings.json
cat > "$SETTINGS_FILE" << 'EOF'
{
  "extraKnownMarketplaces": {
    "blogic-marketplace": {
      "source": {
        "source": "github",
        "repo": "blogic-cz/blogic-marketplace"
      }
    }
  },
  "enabledPlugins": {
    "agent-kit@blogic-marketplace": true
  }
}
EOF

echo "✓ Agent-kit configured in .claude/settings.json"
echo ""

# Create hook templates
echo "Initializing agent-kit hook templates..."

AFTER_EDIT_SCRIPT=".claude/check-after-edit.sh"
AFTER_STOP_SCRIPT=".claude/check-after-stop.sh"

# Create after-edit template if it doesn't exist
if [ ! -f "$AFTER_EDIT_SCRIPT" ]; then
  cat > "$AFTER_EDIT_SCRIPT" << 'EOFTEMPLATE'
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
EOFTEMPLATE

  chmod +x "$AFTER_EDIT_SCRIPT"
  echo "✓ Created template: $AFTER_EDIT_SCRIPT"
else
  echo "⚠️  Template already exists: $AFTER_EDIT_SCRIPT (skipping)"
fi

# Create after-stop template if it doesn't exist
if [ ! -f "$AFTER_STOP_SCRIPT" ]; then
  cat > "$AFTER_STOP_SCRIPT" << 'EOFTEMPLATE'
#!/bin/bash
# Runs on Stop - quality gate with JSON output

# Source the helper script from plugin
source "${CLAUDE_PLUGIN_ROOT}/scripts/check-runner.sh"

# === JS/TS (define "check" in package.json) ===
# run_check_hook "bun run check" "Stop" "Linting failed"

# === .NET ===
# run_check_hook "dotnet build" "Stop" "Build failed"

# === Custom ===
# run_check_hook "your-command-here" "Stop" "Custom check failed"
EOFTEMPLATE

  chmod +x "$AFTER_STOP_SCRIPT"
  echo "✓ Created template: $AFTER_STOP_SCRIPT"
else
  echo "⚠️  Template already exists: $AFTER_STOP_SCRIPT (skipping)"
fi

echo ""
echo "Next steps:"
echo "  1. Configure hooks in $AFTER_EDIT_SCRIPT and $AFTER_STOP_SCRIPT"
echo "  2. git add .claude/"
echo "  3. git commit -m 'Add agent-kit plugin'"
echo "  4. git push"
