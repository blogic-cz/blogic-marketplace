#!/bin/bash

# Multiplatform notification script for Claude Code approval/action requests
# Detects OS and shows appropriate notification based on message type

# Opt-out: set AGENT_KIT_NOTIFY=0 to silence these notifications entirely
if [ "${AGENT_KIT_NOTIFY:-1}" = "0" ]; then
  exit 0
fi

# Read JSON input from stdin
INPUT=$(cat)

# Extract message from JSON
MESSAGE=$(echo "$INPUT" | grep -o '"message":"[^"]*"' | sed 's/"message":"\(.*\)"/\1/')

# Determine notification type based on message content
if echo "$MESSAGE" | grep -qi "permission"; then
  TITLE="⚠️ Claude Code needs approval"
  BODY="$MESSAGE"
  SOUND="Basso"
elif echo "$MESSAGE" | grep -qi "waiting"; then
  TITLE="⏱️ Claude Code is waiting"
  BODY="$MESSAGE"
  SOUND="Tink"
else
  # Generic notification for other cases
  TITLE="🔔 Claude Code"
  BODY="$MESSAGE"
  SOUND="Default"
fi

OS_TYPE=$(uname -s)

case "$OS_TYPE" in
  Darwin*)
    # macOS: Play sound and show notification
    afplay /System/Library/Sounds/${SOUND}.aiff 2>/dev/null &

    osascript -e "display notification \"$BODY\" with title \"$TITLE\" sound name \"$SOUND\""
    ;;

  MINGW*|MSYS*|CYGWIN*)
    # Windows (Git Bash, MSYS2, Cygwin)
    # Sound only, no dialog: a modal MessageBox stole focus on every
    # permission prompt and blocked the hook until it was dismissed.
    powershell.exe -NoProfile -c "[System.Media.SystemSounds]::Exclamation.Play()" 2>/dev/null

    echo "$TITLE: $BODY"
    ;;

  Linux*)
    # Linux: Use notify-send if available
    if command -v notify-send &> /dev/null; then
      notify-send "$TITLE" "$BODY" --urgency=normal
    fi

    # Try to play sound if available
    if command -v paplay &> /dev/null; then
      paplay /usr/share/sounds/freedesktop/stereo/dialog-information.oga 2>/dev/null &
    fi
    ;;

  *)
    echo "$TITLE: $BODY"
    ;;
esac

# Exit successfully to not block execution
exit 0
