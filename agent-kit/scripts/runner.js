#!/usr/bin/env node
// runner.js - Cross-platform hook runner for agent-kit
// Solves Windows path issue where bash mangles backslashes in ${CLAUDE_PLUGIN_ROOT}
//
// Usage: Set _AGENT_KIT_SCRIPT env var to the script basename (without .sh),
//        then require() this module. The module runs bash with correct paths.

const path = require('path');
const { execFileSync } = require('child_process');
const os = require('os');

const scriptName = process.env._AGENT_KIT_SCRIPT;
if (!scriptName) {
  process.exit(0);
}

const isWindows = os.platform() === 'win32';
const pluginRoot = path.resolve(__dirname, '..');
const scriptPath = path.join(__dirname, scriptName + '.sh');

function toUnixPath(p) {
  return p.replace(/\\/g, '/');
}

// Build env with forward-slash paths so bash scripts work on Windows (Git Bash)
const env = { ...process.env };
delete env._AGENT_KIT_SCRIPT;

if (isWindows) {
  env.CLAUDE_PLUGIN_ROOT = toUnixPath(env.CLAUDE_PLUGIN_ROOT || pluginRoot);
  if (env.CLAUDE_PROJECT_DIR) {
    env.CLAUDE_PROJECT_DIR = toUnixPath(env.CLAUDE_PROJECT_DIR);
  }
}

const bashScriptPath = isWindows ? toUnixPath(scriptPath) : scriptPath;

try {
  execFileSync('bash', [bashScriptPath], { stdio: 'inherit', env });
} catch (err) {
  if (err.code === 'ENOENT') {
    console.error(
      'Error: bash not found. On Windows, install Git for Windows (https://git-scm.com).'
    );
    process.exit(1);
  }
  // Pass through the exit code from the bash script
  process.exit(err.status != null ? err.status : 1);
}
