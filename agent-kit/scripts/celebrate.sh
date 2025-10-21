#!/bin/bash

# Multiplatform celebration script for Claude Code completion
# Detects OS and shows appropriate notification

OS_TYPE=$(uname -s)

case "$OS_TYPE" in
  Darwin*)
    # macOS: Play sound
    afplay /System/Library/Sounds/Glass.aiff 2>/dev/null &

    # Try Raycast confetti first, fallback to AppleScript notification
    if ! open 'raycast://extensions/raycast/raycast/confetti' 2>/dev/null; then
      osascript -e 'display notification "Práce dokončena!" with title "🎉 Claude Code" sound name "Glass"'
    fi
    ;;

  MINGW*|MSYS*|CYGWIN*)
    # Windows (Git Bash, MSYS2, Cygwin)
    powershell.exe -c "[System.Media.SystemSounds]::Exclamation.Play()" 2>/dev/null
    powershell.exe -c "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.MessageBox]::Show('🎉 Claude Code dokončil práci!', 'Hotovo!', 'OK', 'Information')" 2>/dev/null
    ;;

  Linux*)
    # Linux: Use notify-send if available
    if command -v notify-send &> /dev/null; then
      notify-send "🎉 Claude Code" "Práce dokončena!" --urgency=normal
    fi
    # Try to play sound if available
    if command -v paplay &> /dev/null; then
      paplay /usr/share/sounds/freedesktop/stereo/complete.oga &
    fi
    ;;

  *)
    echo "🎉 Claude Code finished!"
    ;;
esac
