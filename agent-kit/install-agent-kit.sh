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
echo "Next steps:"
echo "  git add .claude/settings.json"
echo "  git commit -m 'Add agent-kit plugin'"
echo "  git push"
