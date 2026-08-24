#!/bin/bash
# Edit tracking functions for agent-kit hooks
# Tracks whether edits were made during a conversation session

# Mark that an edit was made in this session
mark_edit_made() {
  local tracker_file="${CLAUDE_PROJECT_DIR}/.claude/.edit-tracker"
  mkdir -p "$(dirname "$tracker_file")"
  touch "$tracker_file"
}

# Check if any edits were made in this session
has_edits() {
  local tracker_file="${CLAUDE_PROJECT_DIR}/.claude/.edit-tracker"
  [ -f "$tracker_file" ]
}

# Clear edit tracking (call after successful stop hook execution)
clear_edit_tracking() {
  local tracker_file="${CLAUDE_PROJECT_DIR}/.claude/.edit-tracker"
  rm -f "$tracker_file"
}
