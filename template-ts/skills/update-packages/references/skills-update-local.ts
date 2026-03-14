/**
 * Reads skills-lock.json, groups skills by source, and runs `skills add` per source.
 * Auto-detects target agents from project structure (.claude/, .opencode/, .codex/).
 * Workaround for skills CLI limitations (experimental_install strips subpaths, --all ignores lock).
 * Lives in the skill until the CLI stabilizes.
 *
 * Usage:
 *   bun run .agents/skills/update-packages/references/skills-update-local.ts
 *   bun run .agents/skills/update-packages/references/skills-update-local.ts --dry-run
 */

import { existsSync } from "node:fs";

type SkillEntry = { source: string; sourceType: string };
type SkillsLock = {
  version: number;
  skills: Record<string, SkillEntry>;
};

const agentMapping: Array<{ dir: string; agent: string }> =
  [
    { dir: ".claude", agent: "claude-code" },
    { dir: ".opencode", agent: "opencode" },
    { dir: ".codex", agent: "codex" },
  ];

const cwd = process.cwd();
const detected = agentMapping
  .filter(({ dir }) => existsSync(`${cwd}/${dir}`))
  .map(({ agent }) => agent);
const agents =
  detected.length > 0
    ? detected
    : ["claude-code", "opencode"];

const dryRun = process.argv.includes("--dry-run");

const lock: SkillsLock = await Bun.file(
  "skills-lock.json"
).json();

const groups = new Map<string, string[]>();
for (const [name, entry] of Object.entries(lock.skills)) {
  if (entry.sourceType !== "github") continue;
  const skills = groups.get(entry.source) ?? [];
  skills.push(name);
  groups.set(entry.source, skills);
}

if (groups.size === 0) {
  console.log("No github skills found in skills-lock.json");
  process.exit(0);
}

console.log(
  `Sources: ${groups.size}, Skills: ${Object.keys(lock.skills).length}, Agents: ${agents.join(", ")}`
);

let failed = 0;
for (const [source, skills] of groups) {
  const args = [
    "-y",
    "skills@latest",
    "add",
    source,
    "--full-depth",
    "--agent",
    ...agents,
    ...skills.flatMap((s) => ["--skill", s]),
    "-y",
  ];
  const display = `bunx ${args.join(" ")}`;
  console.log(`\n→ ${display}`);

  if (dryRun) continue;

  const proc = Bun.spawn(["bunx", ...args], {
    stdout: "inherit",
    stderr: "inherit",
  });
  // eslint-disable-next-line no-await-in-loop -- sequential execution required: each skill update must complete before the next
  const code = await proc.exited;
  if (code !== 0) {
    console.error(`✗ Failed (exit ${code}): ${source}`);
    failed += 1;
  }
}

if (dryRun) {
  console.log("\nDry run complete");
} else if (failed > 0) {
  console.error(`\n✗ ${failed} source(s) failed`);
  process.exit(1);
} else {
  console.log("\n✓ All skills updated");
}
