#!/bin/bash
# Runs after Edit/Write - validate JSON and shell syntax

# Source the helper script from plugin
source "${CLAUDE_PLUGIN_ROOT}/scripts/check-runner.sh"

# Validate all JSON files in the project
validate_json() {
  local failed=0
  for file in $(find "${CLAUDE_PROJECT_DIR}" -name "*.json" -not -path "*/node_modules/*" 2>/dev/null); do
    if ! jq empty "$file" 2>/dev/null; then
      echo "Invalid JSON: $file"
      failed=1
    fi
  done
  return $failed
}

# Bash syntax check for shell scripts
validate_bash() {
  local failed=0
  for file in $(find "${CLAUDE_PROJECT_DIR}" -name "*.sh" 2>/dev/null); do
    if ! bash -n "$file" 2>/dev/null; then
      echo "Bash syntax error: $file"
      failed=1
    fi
  done
  return $failed
}

# Run checks - export functions so they work in subshell
export -f validate_json validate_bash
export CLAUDE_PROJECT_DIR

run_check_hook "validate_json" "PostToolUse" "JSON validation failed"
run_check_hook "validate_bash" "PostToolUse" "Bash syntax check failed"
