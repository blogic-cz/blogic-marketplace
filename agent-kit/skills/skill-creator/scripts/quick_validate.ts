#!/usr/bin/env npx tsx
/**
 * Quick validation script for skills - minimal version
 */

import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

function validateSkill(skillPath: string): [boolean, string] {
  const resolvedPath = resolve(skillPath);

  // Check SKILL.md exists
  const skillMdPath = join(resolvedPath, "SKILL.md");
  if (!existsSync(skillMdPath)) {
    return [false, "SKILL.md not found"];
  }

  // Read and validate frontmatter
  const content = readFileSync(skillMdPath, "utf-8");
  if (!content.startsWith("---")) {
    return [false, "No YAML frontmatter found"];
  }

  // Extract frontmatter
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    return [false, "Invalid frontmatter format"];
  }

  const frontmatter = match[1];

  // Check required fields
  if (!frontmatter.includes("name:")) {
    return [false, "Missing 'name' in frontmatter"];
  }
  if (!frontmatter.includes("description:")) {
    return [false, "Missing 'description' in frontmatter"];
  }

  // Extract name for validation
  const nameMatch = frontmatter.match(/name:\s*(.+)/);
  if (nameMatch) {
    const name = nameMatch[1].trim();
    // Check naming convention (hyphen-case: lowercase with hyphens)
    if (!/^[a-z0-9-]+$/.test(name)) {
      return [
        false,
        `Name '${name}' should be hyphen-case (lowercase letters, digits, and hyphens only)`,
      ];
    }
    if (name.startsWith("-") || name.endsWith("-") || name.includes("--")) {
      return [
        false,
        `Name '${name}' cannot start/end with hyphen or contain consecutive hyphens`,
      ];
    }
  }

  // Extract and validate description
  const descMatch = frontmatter.match(/description:\s*(.+)/);
  if (descMatch) {
    const description = descMatch[1].trim();
    // Check for angle brackets
    if (description.includes("<") || description.includes(">")) {
      return [false, "Description cannot contain angle brackets (< or >)"];
    }
  }

  return [true, "Skill is valid!"];
}

// CLI entry point
const args = process.argv.slice(2);
if (args.length !== 1) {
  console.log("Usage: npx tsx quick_validate.ts <skill_directory>");
  process.exit(1);
}

const [valid, message] = validateSkill(args[0]);
console.log(message);
process.exit(valid ? 0 : 1);
