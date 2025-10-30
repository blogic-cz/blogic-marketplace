#!/bin/bash
# Helper to reduce boilerplate in user hook scripts
# Provides run_check_hook function for standardized JSON output

run_check_hook() {
  local cmd="$1"
  local hook_type="$2"  # "PostToolUse" or "Stop"
  local failure_msg="${3:-Check failed}"

  OUTPUT=$(eval "$cmd" 2>&1)
  EXIT_CODE=$?

  if [ $EXIT_CODE -ne 0 ]; then
    REASON=$(printf "%s:\n\n%s" "$failure_msg" "$OUTPUT" | jq -Rs .)

    if [ "$hook_type" = "PostToolUse" ]; then
      cat <<EOJSON
{
  "decision": "block",
  "reason": $REASON,
  "hookSpecificOutput": {
    "hookEventName": "PostToolUse",
    "additionalContext": "The file was written but the check failed."
  }
}
EOJSON
    else
      cat <<EOJSON
{
  "decision": "block",
  "reason": $REASON
}
EOJSON
    fi
    exit 0
  fi
}
