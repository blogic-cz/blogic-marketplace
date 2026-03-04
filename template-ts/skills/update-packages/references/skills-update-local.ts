/**
 * Reads skills-lock.json, groups skills by source, and runs `skills add` per source.
 * Workaround for skills CLI limitations (experimental_install strips subpaths, --all ignores lock).
 * Lives in the skill until the CLI stabilizes.
 *
 * Usage:
 *   bun run .agents/skills/update-packages/references/skills-update-local.ts
 *   bun run .agents/skills/update-packages/references/skills-update-local.ts --dry-run
 */

type SkillEntry = { source: string; sourceType: string };
type SkillsLock = { version: number; skills: Record<string, SkillEntry> };

const dryRun = process.argv.includes("--dry-run");

const lock: SkillsLock = await Bun.file("skills-lock.json").json();

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

console.log(`Sources: ${groups.size}, Skills: ${Object.keys(lock.skills).length}`);

let failed = 0;
for (const [source, skills] of groups) {
  const args = ["-y", "skills@latest", "add", source, "--full-depth", ...skills.flatMap((s) => ["--skill", s]), "-y"];
  const display = `bunx ${args.join(" ")}`;
  console.log(`\n→ ${display}`);

  if (dryRun) continue;

  const proc = Bun.spawn(["bunx", ...args], { stdout: "inherit", stderr: "inherit" });
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
