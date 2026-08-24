#!/bin/bash

# Multiplatform celebration script for Claude Code completion
# Detects OS and shows appropriate notification

OS_TYPE=$(uname -s)

case "$OS_TYPE" in
  Darwin*)
    # macOS: Play sound
    afplay /System/Library/Sounds/Glass.aiff 2>/dev/null &

    # Try Raycast confetti first
    if open 'raycast://extensions/raycast/raycast/confetti' 2>/dev/null; then
      : # Raycast handled it
    # Fallback to terminal-notifier (more reliable than osascript)
    elif command -v terminal-notifier &> /dev/null; then
      terminal-notifier -title "🎉 Claude Code" -message "Práce dokončena!" -sound Glass
    # Last resort: osascript (may fail if terminal lacks notification permissions)
    else
      # Try osascript, but it often fails due to missing terminal notification permissions
      if ! osascript -e 'display notification "Práce dokončena!" with title "🎉 Claude Code" sound name "Glass"' 2>/dev/null; then
        echo "💡 Tip: Pro spolehlivé notifikace nainstaluj: brew install terminal-notifier"
      fi
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
