#!/usr/bin/env bash
set -euo pipefail

# list-skills.sh
# Dynamically scans plugin and project skills directories
# Outputs JSON context injection for Claude

# Determine plugin root (script location)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Plugin skills location
PLUGIN_SKILLS_DIR="${PLUGIN_ROOT}/skills"

# Project skills location (if available)
PROJECT_SKILLS_DIR="${CLAUDE_PROJECT_DIR:-.}/.claude/skills"

# Function to parse SKILL.md frontmatter
parse_skill() {
    local skill_file="$1"
    local skill_name=""
    local skill_desc=""

    # Extract YAML frontmatter between --- delimiters
    if [[ -f "$skill_file" ]]; then
        # Read frontmatter (between first two ---)
        in_frontmatter=false
        while IFS= read -r line; do
            if [[ "$line" == "---" ]]; then
                if [[ "$in_frontmatter" == "false" ]]; then
                    in_frontmatter=true
                    continue
                else
                    break
                fi
            fi

            if [[ "$in_frontmatter" == "true" ]]; then
                # Parse name field
                if [[ "$line" =~ ^name:[[:space:]]*(.+)$ ]]; then
                    skill_name="${BASH_REMATCH[1]}"
                    skill_name="${skill_name//\"/}"  # Remove quotes
                fi

                # Parse description field (may be multi-line)
                if [[ "$line" =~ ^description:[[:space:]]*(.+)$ ]]; then
                    skill_desc="${BASH_REMATCH[1]}"
                    skill_desc="${skill_desc//\"/}"  # Remove quotes
                fi
            fi
        done < "$skill_file"
    fi

    # Output in format: name|description
    if [[ -n "$skill_name" ]]; then
        echo "${skill_name}|${skill_desc}"
    fi
}

# Scan plugin skills
plugin_skills=()
if [[ -d "$PLUGIN_SKILLS_DIR" ]]; then
    while IFS= read -r -d '' skill_dir; do
        skill_file="${skill_dir}/SKILL.md"
        if [[ -f "$skill_file" ]]; then
            skill_info=$(parse_skill "$skill_file")
            if [[ -n "$skill_info" ]]; then
                plugin_skills+=("$skill_info")
            fi
        fi
    done < <(find "$PLUGIN_SKILLS_DIR" -mindepth 1 -maxdepth 1 -type d -print0)
fi

# Scan project skills
project_skills=()
if [[ -d "$PROJECT_SKILLS_DIR" ]]; then
    while IFS= read -r -d '' skill_dir; do
        skill_file="${skill_dir}/SKILL.md"
        if [[ -f "$skill_file" ]]; then
            skill_info=$(parse_skill "$skill_file")
            if [[ -n "$skill_info" ]]; then
                project_skills+=("$skill_info")
            fi
        fi
    done < <(find "$PROJECT_SKILLS_DIR" -mindepth 1 -maxdepth 1 -type d -print0)
fi

# Build context message
context_message="⚡ Available Skills\n\n"
context_message+="You have access to these skills. Use Skill tool when relevant:\n\n"

# Add plugin skills
if [[ ${#plugin_skills[@]} -gt 0 ]]; then
    context_message+="📦 Plugin Skills (${#plugin_skills[@]}):\n"
    for skill_info in "${plugin_skills[@]}"; do
        IFS='|' read -r name desc <<< "$skill_info"
        # Truncate description if too long
        if [[ ${#desc} -gt 80 ]]; then
            desc="${desc:0:77}..."
        fi
        context_message+="  • ${name} - ${desc}\n"
    done
    context_message+="\n"
fi

# Add project skills
if [[ ${#project_skills[@]} -gt 0 ]]; then
    context_message+="📁 Project Skills (${#project_skills[@]}):\n"
    for skill_info in "${project_skills[@]}"; do
        IFS='|' read -r name desc <<< "$skill_info"
        # Truncate description if too long
        if [[ ${#desc} -gt 80 ]]; then
            desc="${desc:0:77}..."
        fi
        context_message+="  • ${name} - ${desc}\n"
    done
    context_message+="\n"
fi

# Add reminder if no skills found
if [[ ${#plugin_skills[@]} -eq 0 ]] && [[ ${#project_skills[@]} -eq 0 ]]; then
    context_message+="ℹ️  No skills found in plugin or project directories.\n\n"
fi

# Add critical reminder
context_message+="🔴 CRITICAL: Check for relevant skills BEFORE coding!\n"
context_message+="✅ Use Skill tool to load them when applicable.\n"
context_message+="💡 Type /skill-scan to refresh this list."

# Output JSON context injection
cat <<EOF
{
  "context": "$(echo -e "$context_message")"
}
EOF
