#!/bin/bash
# Runs on Stop - full validation of all JSON and shell scripts
# NOTE: This hook only runs if edits were made during the conversation.

# Source the helper script from plugin
source "${CLAUDE_PLUGIN_ROOT}/scripts/check-runner.sh"

# Validate all JSON files
validate_all_json() {
  local failed=0
  local count=0
  for file in $(find "${CLAUDE_PROJECT_DIR}" -name "*.json" -not -path "*/node_modules/*" 2>/dev/null); do
    if ! jq empty "$file" 2>&1; then
      echo "Invalid JSON: $file"
      failed=1
    fi
    ((count++))
  done

  if [[ $failed -eq 0 ]]; then
    echo "All $count JSON files valid"
  fi
  return $failed
}

# Full bash syntax check
validate_all_bash() {
  local failed=0
  local count=0
  for file in $(find "${CLAUDE_PROJECT_DIR}" -name "*.sh" 2>/dev/null); do
    if ! bash -n "$file" 2>&1; then
      echo "Bash syntax error: $file"
      failed=1
    fi
    ((count++))
  done

  if [[ $failed -eq 0 ]]; then
    echo "All $count shell scripts valid"
  fi
  return $failed
}

# Shellcheck if available (optional)
run_shellcheck() {
  if ! command -v shellcheck &> /dev/null; then
    echo "Shellcheck not installed (optional: brew install shellcheck)"
    return 0
  fi

  local failed=0
  for file in $(find "${CLAUDE_PROJECT_DIR}" -name "*.sh" 2>/dev/null); do
    if ! shellcheck -S warning "$file" 2>&1; then
      failed=1
    fi
  done
  return $failed
}

# Export functions for run_check_hook (uses eval)
export -f validate_all_json validate_all_bash run_shellcheck
export CLAUDE_PROJECT_DIR

run_check_hook "validate_all_json" "Stop" "JSON validation failed"
run_check_hook "validate_all_bash" "Stop" "Bash syntax check failed"
run_check_hook "run_shellcheck" "Stop" "Shellcheck found issues"
