/**
 * Checks all workspace package.json files for outdated npm packages.
 * Skips: node_modules, opensrc, .agents, workspace:*, catalog:*, file:*, link:*
 *
 * Usage:
 *   bun run .agents/skills/update-packages/references/check-outdated.ts
 *   bun run .agents/skills/update-packages/references/check-outdated.ts --json
 *   bun run .agents/skills/update-packages/references/check-outdated.ts --changelog
 *   bun run .agents/skills/update-packages/references/check-outdated.ts --changelog --json
 *
 * Flags:
 *   --json        Output as JSON instead of human-readable text
 *   --changelog   Fetch GitHub release notes for each minor/major update.
 *                 Also detects config files associated with each package.
 *                 Implies --json output format.
 */

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";

const SKIP_DIRS = new Set([
  "node_modules",
  "opensrc",
  ".agents",
  ".git",
  ".cache",
]);

const CHANGELOG_MODE = process.argv.includes("--changelog");
const JSON_OUTPUT =
  process.argv.includes("--json") || CHANGELOG_MODE;

const REFERENCES_DIR = dirname(
  new URL(import.meta.url).pathname
);

function saveReport(
  filename: string,
  data: unknown
): string {
  const outPath = join(REFERENCES_DIR, filename);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(
    outPath,
    JSON.stringify(data, null, 2) + "\n"
  );
  return outPath;
}

// --- Types ---

type PackageJson = {
  name?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  catalog?: Record<string, string>;
  catalogs?: Record<string, Record<string, string>>;
};

type UpdateType = "major" | "minor" | "patch";

type OutdatedEntry = {
  file: string;
  package: string;
  current: string;
  latest: string;
  updateType: UpdateType;
};

type ReleaseNote = {
  tag: string;
  version: string;
  url: string;
  body: string;
};

type ChangelogEntry = OutdatedEntry & {
  repoUrl: string | null;
  configFiles: string[];
  releases: ReleaseNote[];
};

// --- Config file detection ---

/** Known package → config file mapping. Checked relative to cwd. */
const CONFIG_FILE_MAP: Record<string, string[]> = {
  vitest: [
    "vitest.config.ts",
    "vitest.config.js",
    "vitest.config.mts",
  ],
  vite: [
    "vite.config.ts",
    "vite.config.js",
    "vite.config.mts",
  ],
  "drizzle-orm": ["drizzle.config.ts", "drizzle.config.js"],
  "drizzle-kit": ["drizzle.config.ts", "drizzle.config.js"],
  typescript: ["tsconfig.json", "tsconfig.base.json"],
  tailwindcss: [
    "tailwind.config.ts",
    "tailwind.config.js",
    "postcss.config.ts",
  ],
  oxlint: [".oxlintrc.json"],
  eslint: [
    "eslint.config.ts",
    "eslint.config.js",
    "eslint.config.mjs",
    ".eslintrc.json",
  ],
  prettier: [
    ".prettierrc",
    ".prettierrc.json",
    "prettier.config.js",
  ],
  "@playwright/test": [
    "playwright.config.ts",
    "playwright.config.js",
  ],
  playwright: [
    "playwright.config.ts",
    "playwright.config.js",
  ],
  "better-auth": [],
  lefthook: ["lefthook.yml"],
  "drizzle-zod": [],
};

function detectConfigFiles(
  pkg: string,
  cwd: string
): string[] {
  // Check known mapping first
  const candidates = CONFIG_FILE_MAP[pkg];
  if (candidates !== undefined) {
    return candidates.filter((f) =>
      existsSync(join(cwd, f))
    );
  }

  // Fallback: check for <pkg-basename>.config.{ts,js,mjs}
  const basename = pkg.startsWith("@")
    ? (pkg.split("/")[1] ?? pkg)
    : pkg;
  const fallbackCandidates = [
    `${basename}.config.ts`,
    `${basename}.config.js`,
    `${basename}.config.mjs`,
  ];
  return fallbackCandidates.filter((f) =>
    existsSync(join(cwd, f))
  );
}

// --- Version helpers ---

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
  return (
    version.replace(/^[~^>=<]+/, "").split(" ")[0] ?? ""
  );
}

function classifyUpdate(
  current: string,
  latest: string
): UpdateType {
  const curMajor = parseInt(
    current.split(".")[0] ?? "0",
    10
  );
  const latMajor = parseInt(
    latest.split(".")[0] ?? "0",
    10
  );
  if (latMajor > curMajor) return "major";

  const curMinor = parseInt(
    current.split(".")[1] ?? "0",
    10
  );
  const latMinor = parseInt(
    latest.split(".")[1] ?? "0",
    10
  );
  if (latMinor > curMinor) return "minor";

  return "patch";
}

/**
 * Parse a semver-like string from a git tag.
 * Handles: v4.1.0, 4.1.0, vitest@4.1.0, @scope/pkg@4.1.0, effect@3.19.0
 */
function parseVersionFromTag(tag: string): string | null {
  // Try: v4.1.0 or 4.1.0 (simple tags)
  const simple = tag.match(
    /^v?(\d+\.\d+\.\d+(?:-[a-zA-Z0-9.]+)?)$/
  );
  if (simple?.[1]) return simple[1];

  // Try: pkg@4.1.0 or @scope/pkg@4.1.0 (monorepo tags)
  const scoped = tag.match(
    /@(\d+\.\d+\.\d+(?:-[a-zA-Z0-9.]+)?)$/
  );
  if (scoped?.[1]) return scoped[1];

  return null;
}

/**
 * Compare two semver strings. Returns:
 *  -1 if a < b, 0 if a == b, 1 if a > b
 */
function compareSemver(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    const va = pa[i] ?? 0;
    const vb = pb[i] ?? 0;
    if (va < vb) return -1;
    if (va > vb) return 1;
  }
  return 0;
}

// --- File discovery ---

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

// --- npm registry ---

type NpmRegistryResponse = {
  version?: string;
  repository?: { url?: string } | string;
};

async function fetchPackageInfo(pkg: string): Promise<{
  latest: string | null;
  repoUrl: string | null;
}> {
  try {
    const res = await fetch(
      `https://registry.npmjs.org/${pkg}/latest`,
      {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) return { latest: null, repoUrl: null };
    const json: NpmRegistryResponse = await res.json();

    let repoUrl: string | null = null;
    if (typeof json.repository === "string") {
      repoUrl = json.repository;
    } else if (json.repository?.url) {
      repoUrl = json.repository.url;
    }

    return {
      latest: json.version ?? null,
      repoUrl,
    };
  } catch {
    return { latest: null, repoUrl: null };
  }
}

/**
 * Extract GitHub owner/repo from various repository URL formats:
 *   https://github.com/owner/repo
 *   https://github.com/owner/repo.git
 *   git+https://github.com/owner/repo.git
 *   git://github.com/owner/repo.git
 *   git+ssh://git@github.com/owner/repo.git
 *   github:owner/repo
 */
function parseGitHubRepo(
  url: string
): { owner: string; repo: string } | null {
  // github:owner/repo shorthand
  const shortMatch = url.match(/^github:([^/]+)\/([^/]+)$/);
  if (shortMatch?.[1] && shortMatch[2]) {
    return {
      owner: shortMatch[1],
      repo: shortMatch[2].replace(/\.git$/, ""),
    };
  }

  // Full URL patterns
  const fullMatch = url.match(
    /github\.com[/:]([^/]+)\/([^/\s#]+)/
  );
  if (fullMatch?.[1] && fullMatch[2]) {
    return {
      owner: fullMatch[1],
      repo: fullMatch[2].replace(/\.git$/, ""),
    };
  }

  return null;
}

// --- GitHub release notes ---

type GitHubRelease = {
  tag_name: string;
  html_url: string;
  body: string | null;
  prerelease: boolean;
  draft: boolean;
};

/**
 * Fetch GitHub releases between `current` (exclusive) and `latest` (inclusive).
 * Uses GITHUB_TOKEN/GH_TOKEN if available (5000 req/hour), otherwise unauthenticated (60 req/hour).
 * Fetches up to 100 releases and filters by version range.
 *
 * For monorepo packages (e.g. @tanstack/react-router), pass `tagPrefix`
 * to filter releases whose tag starts with the package name.
 */
async function fetchReleaseNotes(
  owner: string,
  repo: string,
  current: string,
  latest: string,
  tagPrefix?: string
): Promise<ReleaseNote[]> {
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "check-outdated-script",
    };
    const token =
      process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/releases?per_page=100`,
      {
        headers,
        signal: AbortSignal.timeout(10_000),
      }
    );
    if (!res.ok) return [];
    const releases: GitHubRelease[] = await res.json();

    const notes: ReleaseNote[] = [];
    for (const release of releases) {
      if (release.draft || release.prerelease) continue;

      if (
        tagPrefix &&
        !release.tag_name.startsWith(tagPrefix)
      ) {
        continue;
      }

      const version = parseVersionFromTag(release.tag_name);
      if (!version) continue;

      // Include releases where: current < version <= latest
      if (
        compareSemver(version, current) > 0 &&
        compareSemver(version, latest) <= 0
      ) {
        notes.push({
          tag: release.tag_name,
          version,
          url: release.html_url,
          body: (release.body ?? "").trim(),
        });
      }
    }

    // Sort oldest → newest
    notes.sort((a, b) =>
      compareSemver(a.version, b.version)
    );
    return notes;
  } catch {
    return [];
  }
}

// --- Dependency collection ---

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
const allPackages = new Map<string, string>();
const fileMap = new Map<string, Map<string, string>>();

for (const file of pkgFiles) {
  let pkg: PackageJson;
  try {
    const raw = readFileSync(file, "utf8");
    const parsed: PackageJson = JSON.parse(raw);
    pkg = parsed;
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
  if (JSON_OUTPUT) {
    console.log("[]");
  } else {
    console.log("No packages to check.");
  }
  process.exit(0);
}

if (!JSON_OUTPUT) {
  console.log(
    `Checking ${allPackages.size} unique packages across ${fileMap.size} files...\n`
  );
}

// Fetch latest versions (+ repo URLs in changelog mode) in parallel
const names = [...allPackages.keys()];
const packageInfoResults = await Promise.all(
  names.map(async (name) => {
    if (CHANGELOG_MODE) {
      const info = await fetchPackageInfo(name);
      return {
        name,
        latest: info.latest,
        repoUrl: info.repoUrl,
      };
    }
    // Non-changelog mode: lightweight fetch (just version)
    const res = await fetch(
      `https://registry.npmjs.org/${name}/latest`,
      {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(8000),
      }
    ).catch(() => null);
    const json: { version?: string } =
      res && res.ok ? await res.json() : {};
    return {
      name,
      latest: json.version ?? null,
      repoUrl: null,
    };
  })
);

const latestMap = new Map<string, string>();
const repoUrlMap = new Map<string, string | null>();
for (const {
  name,
  latest,
  repoUrl,
} of packageInfoResults) {
  if (latest) latestMap.set(name, latest);
  if (CHANGELOG_MODE) repoUrlMap.set(name, repoUrl);
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
        updateType: classifyUpdate(current, latest),
      });
    }
  }
}

// --- Changelog mode: enrich with release notes ---

if (CHANGELOG_MODE) {
  // Deduplicate packages (same package may appear in multiple files)
  const uniquePackages = new Map<
    string,
    { current: string; latest: string }
  >();
  for (const entry of outdated) {
    if (!uniquePackages.has(entry.package)) {
      uniquePackages.set(entry.package, {
        current: entry.current,
        latest: entry.latest,
      });
    }
  }

  // Fetch release notes in parallel (only for minor/major)
  const releaseNoteResults = new Map<
    string,
    ReleaseNote[]
  >();
  const fetchPromises: Array<Promise<void>> = [];

  for (const [pkg, { current, latest }] of uniquePackages) {
    const type = classifyUpdate(current, latest);
    if (type === "patch") {
      releaseNoteResults.set(pkg, []);
      continue;
    }

    const repoUrl = repoUrlMap.get(pkg);
    if (!repoUrl) {
      releaseNoteResults.set(pkg, []);
      continue;
    }

    const gh = parseGitHubRepo(repoUrl);
    if (!gh) {
      releaseNoteResults.set(pkg, []);
      continue;
    }

    const tagPrefix = pkg.startsWith("@")
      ? `${pkg}@`
      : undefined;
    fetchPromises.push(
      fetchReleaseNotes(
        gh.owner,
        gh.repo,
        current,
        latest,
        tagPrefix
      ).then((notes) => {
        releaseNoteResults.set(pkg, notes);
      })
    );
  }

  if (!JSON_OUTPUT) {
    // This shouldn't happen (CHANGELOG_MODE implies JSON), but safety net
    console.log("Fetching release notes...");
  }

  await Promise.all(fetchPromises);

  const changelog: ChangelogEntry[] = outdated.map(
    (entry) => ({
      ...entry,
      repoUrl: repoUrlMap.get(entry.package) ?? null,
      configFiles: detectConfigFiles(entry.package, cwd),
      releases: releaseNoteResults.get(entry.package) ?? [],
    })
  );

  const savedPath = saveReport(
    "outdated-changelog.json",
    changelog
  );
  console.log(JSON.stringify(changelog, null, 2));
  console.error(`\nSaved to ${savedPath}`);
  process.exit(0);
}

// --- Standard output (non-changelog) ---

if (JSON_OUTPUT) {
  const savedPath = saveReport("outdated.json", outdated);
  console.log(JSON.stringify(outdated, null, 2));
  console.error(`\nSaved to ${savedPath}`);
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
  for (const {
    package: pkg,
    current,
    latest,
    updateType,
  } of entries) {
    const tag =
      updateType === "major"
        ? " [MAJOR]"
        : updateType === "minor"
          ? " [minor]"
          : "";
    console.log(`  ${pkg}: ${current} → ${latest}${tag}`);
  }
}

console.log(
  `\n${outdated.length} outdated package(s) found.`
);
