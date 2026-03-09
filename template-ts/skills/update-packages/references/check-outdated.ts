/**
 * Checks all workspace package.json files for outdated npm packages.
 * Skips: node_modules, opensrc, .agents, workspace:*, catalog:*, file:*, link:*
 *
 * Usage:
 *   bun run .agents/skills/update-packages/references/check-outdated.ts
 *   bun run .agents/skills/update-packages/references/check-outdated.ts --json
 */

import {
  readdirSync,
  readFileSync,
  statSync,
} from "node:fs";
import { join } from "node:path";

const SKIP_DIRS = new Set([
  "node_modules",
  "opensrc",
  ".agents",
  ".git",
  ".cache",
]);

const JSON_OUTPUT = process.argv.includes("--json");

type PackageJson = {
  name?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  catalog?: Record<string, string>;
  catalogs?: Record<string, Record<string, string>>;
};

type OutdatedEntry = {
  file: string;
  package: string;
  current: string;
  latest: string;
};

function isSkippedVersion(version: string): boolean {
  return (
    version.startsWith("workspace:") ||
    version.startsWith("catalog:") ||
    version.startsWith("file:") ||
    version.startsWith("link:") ||
    version.startsWith("git+") ||
    version.startsWith("github:") ||
    version.startsWith("http")
  );
}

function cleanVersion(version: string): string {
  return version.replace(/^[~^>=<]+/, "").split(" ")[0] ?? "";
}

function findPackageJsonFiles(dir: string): string[] {
  const results: string[] = [];
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return results;
  }

  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue;
    const fullPath = join(dir, entry);
    try {
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        results.push(...findPackageJsonFiles(fullPath));
      } else if (entry === "package.json") {
        results.push(fullPath);
      }
    } catch {
      // skip unreadable entries
    }
  }

  return results;
}

async function fetchLatest(
  pkg: string
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://registry.npmjs.org/${pkg}/latest`,
      {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { version: string };
    return json.version ?? null;
  } catch {
    return null;
  }
}

function collectDeps(
  pkg: PackageJson
): Record<string, string> {
  const deps: Record<string, string> = {};
  for (const source of [
    pkg.dependencies,
    pkg.devDependencies,
    pkg.catalog,
    ...(pkg.catalogs ? Object.values(pkg.catalogs) : []),
  ]) {
    if (!source) continue;
    for (const [name, version] of Object.entries(source)) {
      if (!isSkippedVersion(version)) deps[name] = version;
    }
  }
  return deps;
}

// --- Main ---

const cwd = process.cwd();
const pkgFiles = findPackageJsonFiles(cwd);
const outdated: OutdatedEntry[] = [];

// Collect all unique packages across all files
const allPackages = new Map<string, string>(); // name -> first seen version (for dedup fetch)
const fileMap = new Map<string, Map<string, string>>(); // file -> { name -> current }

for (const file of pkgFiles) {
  let pkg: PackageJson;
  try {
    pkg = JSON.parse(
      readFileSync(file, "utf8")
    ) as PackageJson;
  } catch {
    continue;
  }

  const deps = collectDeps(pkg);
  if (Object.keys(deps).length === 0) continue;

  const relFile = file.replace(cwd + "/", "");
  fileMap.set(relFile, new Map(Object.entries(deps)));

  for (const [name, version] of Object.entries(deps)) {
    if (!allPackages.has(name)) {
      allPackages.set(name, cleanVersion(version));
    }
  }
}

if (allPackages.size === 0) {
  console.log("No packages to check.");
  process.exit(0);
}

if (!JSON_OUTPUT) {
  console.log(
    `Checking ${allPackages.size} unique packages across ${fileMap.size} files...\n`
  );
}

// Fetch latest in parallel
const names = [...allPackages.keys()];
const latestResults = await Promise.all(
  names.map(async (name) => ({
    name,
    latest: await fetchLatest(name),
  }))
);
const latestMap = new Map<string, string>();
for (const { name, latest } of latestResults) {
  if (latest) latestMap.set(name, latest);
}

// Compare
for (const [relFile, deps] of fileMap) {
  for (const [name, rawVersion] of deps) {
    const current = cleanVersion(rawVersion);
    const latest = latestMap.get(name);
    if (latest && latest !== current) {
      outdated.push({
        file: relFile,
        package: name,
        current,
        latest,
      });
    }
  }
}

// Output
if (JSON_OUTPUT) {
  console.log(JSON.stringify(outdated, null, 2));
  process.exit(0);
}

if (outdated.length === 0) {
  console.log("✓ All packages are up to date.");
  process.exit(0);
}

// Group by file for readable output
const byFile = new Map<string, OutdatedEntry[]>();
for (const entry of outdated) {
  const list = byFile.get(entry.file) ?? [];
  list.push(entry);
  byFile.set(entry.file, list);
}

for (const [file, entries] of byFile) {
  console.log(`\n${file}`);
  for (const { package: pkg, current, latest } of entries) {
    const isMajor =
      parseInt(latest.split(".")[0] ?? "0", 10) >
      parseInt(current.split(".")[0] ?? "0", 10);
    const isMinor =
      !isMajor &&
      parseInt(latest.split(".")[1] ?? "0", 10) >
        parseInt(current.split(".")[1] ?? "0", 10);
    const tag = isMajor
      ? " [MAJOR]"
      : isMinor
        ? " [minor]"
        : "";
    console.log(`  ${pkg}: ${current} → ${latest}${tag}`);
  }
}

console.log(
  `\n${outdated.length} outdated package(s) found.`
);
