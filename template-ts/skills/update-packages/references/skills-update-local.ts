import { existsSync } from "node:fs";

type SkillLockEntry = {
  source: string;
  sourceType: string;
};

type SkillsLock = {
  version: number;
  skills: Record<string, SkillLockEntry>;
};

type CliOptions = {
  agents: string[];
  concurrency: number;
  dryRun: boolean;
  sourceFilter: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readStringProp(
  record: Record<string, unknown>,
  key: string
): string | null {
  const value = record[key];
  return typeof value === "string" ? value : null;
}

function parseOptions(argv: string[]): CliOptions {
  const agents: string[] = [];
  let concurrency = 4;
  let dryRun = false;
  let sourceFilter: string | null = null;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--dry-run") {
      dryRun = true;
      continue;
    }

    if (arg === "--agent") {
      const value = argv[i + 1];
      if (!value) {
        throw new Error("Missing value for --agent");
      }
      agents.push(...value.split(",").map((a) => a.trim()).filter(Boolean));
      i += 1;
      continue;
    }

    if (arg === "--concurrency") {
      const value = argv[i + 1];
      if (!value) {
        throw new Error("Missing value for --concurrency");
      }
      const parsed = Number(value);
      if (!Number.isInteger(parsed) || parsed < 1) {
        throw new Error("--concurrency must be an integer >= 1");
      }
      concurrency = parsed;
      i += 1;
      continue;
    }

    if (arg === "--source") {
      const value = argv[i + 1];
      if (!value) {
        throw new Error("Missing value for --source");
      }
      sourceFilter = value.trim();
      i += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return {
    agents: agents.length > 0 ? [...new Set(agents)] : ["codex", "opencode"],
    concurrency,
    dryRun,
    sourceFilter,
  };
}

async function loadSkillsLock(cwd: string): Promise<SkillsLock> {
  const lockPath = `${cwd}/skills-lock.json`;
  if (!existsSync(lockPath)) {
    throw new Error(`skills-lock.json not found at ${lockPath}`);
  }

  const parsed: unknown = JSON.parse(await Bun.file(lockPath).text());
  if (!isRecord(parsed)) {
    throw new Error("skills-lock.json has invalid shape");
  }

  const maybeVersion = parsed["version"];
  const maybeSkills = parsed["skills"];
  if (typeof maybeVersion !== "number" || !isRecord(maybeSkills)) {
    throw new Error("skills-lock.json has invalid shape");
  }

  const skills: Record<string, SkillLockEntry> = {};
  for (const [skillName, value] of Object.entries(maybeSkills)) {
    if (!isRecord(value)) {
      continue;
    }

    const source = readStringProp(value, "source");
    const sourceType = readStringProp(value, "sourceType");
    if (source && sourceType) {
      skills[skillName] = { source, sourceType };
    }
  }

  return { version: maybeVersion, skills };
}

type Job = {
  skillName: string;
  source: string;
};

function buildJobs(lock: SkillsLock, sourceFilter: string | null): Job[] {
  return Object.entries(lock.skills)
    .filter(([, entry]) => entry.sourceType === "github")
    .filter(([, entry]) => (sourceFilter ? entry.source === sourceFilter : true))
    .map(([skillName, entry]) => ({
      skillName,
      source: entry.source,
    }))
    .toSorted((a, b) => a.source.localeCompare(b.source) || a.skillName.localeCompare(b.skillName));
}

async function runJob(job: Job, agents: string[], dryRun: boolean): Promise<void> {
  const args = [
    "-y",
    "skills@latest",
    "add",
    job.source,
    "--skill",
    job.skillName,
    "--agent",
    ...agents,
    "-y",
  ];

  const display = `bunx ${args.join(" ")}`;
  console.log(`\n[${job.skillName}] ${display}`);

  if (dryRun) {
    return;
  }

  const proc = Bun.spawn(["bunx", ...args], {
    stdout: "inherit",
    stderr: "inherit",
  });

  const code = await proc.exited;
  if (code !== 0) {
    throw new Error(`Command failed with exit code ${code}`);
  }
}

async function runWithConcurrency(
  jobs: Job[],
  agents: string[],
  dryRun: boolean,
  concurrency: number
): Promise<void> {
  let index = 0;
  const errors: string[] = [];

  const worker = async (): Promise<void> => {
    const current = jobs[index];
    index += 1;
    if (!current) {
      return;
    }

    try {
      await runJob(current, agents, dryRun);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${current.skillName}: ${message}`);
    }

    await worker();
  };

  await Promise.all(Array.from({ length: Math.min(concurrency, jobs.length) }, () => worker()));

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(`✗ ${error}`);
    }
    throw new Error(`Failed jobs: ${errors.length}`);
  }
}

async function main(): Promise<void> {
  const options = parseOptions(process.argv.slice(2));
  const lock = await loadSkillsLock(process.cwd());
  const jobs = buildJobs(lock, options.sourceFilter);

  if (jobs.length === 0) {
    console.log("No matching github skills found in skills-lock.json");
    return;
  }

  console.log(`Agents: ${options.agents.join(", ")}`);
  console.log(`Jobs: ${jobs.length}`);
  console.log(`Concurrency: ${options.concurrency}`);
  if (options.sourceFilter) {
    console.log(`Source filter: ${options.sourceFilter}`);
  }
  if (options.dryRun) {
    console.log("Mode: dry-run");
  }

  await runWithConcurrency(jobs, options.agents, options.dryRun, options.concurrency);
  console.log("\nDone: local skills update finished");
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
