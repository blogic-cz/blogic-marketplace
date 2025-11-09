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
    # Count lines and truncate if too long
    LINE_COUNT=$(echo "$OUTPUT" | wc -l | tr -d ' ')
    MAX_LINES=20

    if [ "$LINE_COUNT" -gt "$MAX_LINES" ]; then
      TRUNCATED_OUTPUT=$(echo "$OUTPUT" | tail -n "$MAX_LINES")
      ERROR_MESSAGE=$(cat <<EOF
$failure_msg

Command: $cmd

[Output truncated - showing last $MAX_LINES of $LINE_COUNT lines]

$TRUNCATED_OUTPUT

To see full output, run: $cmd
EOF
)
    else
      ERROR_MESSAGE=$(cat <<EOF
$failure_msg

Command: $cmd

$OUTPUT
EOF
)
    fi

    REASON=$(echo "$ERROR_MESSAGE" | jq -Rs .)

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
