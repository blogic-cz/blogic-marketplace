#!/usr/bin/env bash
set -euo pipefail

# session-start-dynamic.sh
# SessionStart hook wrapper that invokes list-skills.sh
# Automatically injects available skills into Claude's context at session start

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Call the list-skills script
"${SCRIPT_DIR}/list-skills.sh"
