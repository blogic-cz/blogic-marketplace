import {
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "fs";
import { dirname, join, relative } from "path";

const JSON_OUTPUT = Bun.argv.includes("--json");

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

const SKIP_DIRS = new Set([
  ".git",
  ".idea",
  ".next",
  ".turbo",
  ".agents",
  ".cache",
  ".sisyphus",
  "coverage",
  "dist",
  "build",
  "node_modules",
  "opensrc",
  "tmp",
]);

const TEXT_FILE_NAMES = new Set([
  "Dockerfile",
  "package.json",
  "bunfig.toml",
  "dev.sh",
]);

const TEXT_FILE_EXTENSIONS = new Set([
  ".json",
  ".sh",
  ".toml",
  ".yaml",
  ".yml",
]);

type PinKind =
  | "packageManager"
  | "typesBun"
  | "bunVersion"
  | "dockerArgBunVersion"
  | "dockerFromBun"
  | "playwrightPackage"
  | "playwrightImage"
  | "nodeVersion";

type PinEntry = {
  file: string;
  kind: PinKind;
  value: string;
  raw: string;
  line: number;
};

type DriftEntry = PinEntry & {
  expected?: string;
  status: "ok" | "drift" | "info";
  reason: string;
};

type PackageJson = {
  packageManager?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  catalog?: Record<string, string>;
  catalogs?: Record<string, Record<string, string>>;
};

type Expectations = {
  bun?: string;
  playwright?: string;
};

function cleanVersion(value: string): string {
  return value.replace(/^[~^>=<]+/, "").split(" ")[0] ?? "";
}

function shouldReadFile(path: string): boolean {
  const fileName = path.split("/").pop() ?? "";
  if (TEXT_FILE_NAMES.has(fileName)) {
    return true;
  }

  for (const ext of TEXT_FILE_EXTENSIONS) {
    if (fileName.endsWith(ext)) {
      return true;
    }
  }

  return false;
}

function findFiles(dir: string): string[] {
  const results: string[] = [];
  let entries: string[];

  try {
    entries = readdirSync(dir);
  } catch {
    return results;
  }

  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) {
      continue;
    }

    const fullPath = join(dir, entry);

    try {
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        results.push(...findFiles(fullPath));
        continue;
      }

      if (shouldReadFile(fullPath)) {
        results.push(fullPath);
      }
    } catch {
      continue;
    }
  }

  return results;
}

function lineNumberAt(
  content: string,
  index: number
): number {
  return content.slice(0, index).split("\n").length;
}

function pushMatches(
  entries: PinEntry[],
  file: string,
  content: string,
  kind: PinKind,
  regex: RegExp,
  extractor: (match: RegExpExecArray) => string
): void {
  regex.lastIndex = 0;

  let match = regex.exec(content);
  while (match !== null) {
    const value = extractor(match);
    if (value.length > 0) {
      entries.push({
        file,
        kind,
        value: cleanVersion(value),
        raw: match[0],
        line: lineNumberAt(content, match.index),
      });
    }

    match = regex.exec(content);
  }
}

function collectPackageFields(
  file: string,
  content: string,
  entries: PinEntry[]
): void {
  let parsed: PackageJson;

  try {
    parsed = JSON.parse(content) as PackageJson;
  } catch {
    return;
  }

  if (typeof parsed.packageManager === "string") {
    const match = parsed.packageManager.match(/^bun@(.+)$/);
    if (match?.[1]) {
      const needle = `"packageManager": "${parsed.packageManager}"`;
      const index = content.indexOf(needle);
      entries.push({
        file,
        kind: "packageManager",
        value: cleanVersion(match[1]),
        raw: parsed.packageManager,
        line: index >= 0 ? lineNumberAt(content, index) : 1,
      });
    }
  }

  const sources = [
    parsed.dependencies,
    parsed.devDependencies,
    parsed.catalog,
    ...(parsed.catalogs
      ? Object.values(parsed.catalogs)
      : []),
  ];

  for (const source of sources) {
    if (!source) {
      continue;
    }

    for (const [name, rawVersion] of Object.entries(
      source
    )) {
      const value = cleanVersion(rawVersion);
      const needle = `"${name}": "${rawVersion}"`;
      const index = content.indexOf(needle);
      const baseEntry = {
        file,
        value,
        raw: rawVersion,
        line: index >= 0 ? lineNumberAt(content, index) : 1,
      };

      if (name === "@types/bun") {
        entries.push({
          ...baseEntry,
          kind: "typesBun",
        });
      }

      if (
        name === "@playwright/test" ||
        name === "playwright"
      ) {
        entries.push({
          ...baseEntry,
          kind: "playwrightPackage",
        });
      }
    }
  }
}

function collectPins(cwd: string): PinEntry[] {
  const files = findFiles(cwd);
  const entries: PinEntry[] = [];

  for (const fullPath of files) {
    let content: string;

    try {
      content = readFileSync(fullPath, "utf8");
    } catch {
      continue;
    }

    const file = relative(cwd, fullPath);

    if (fullPath.endsWith("package.json")) {
      collectPackageFields(file, content, entries);
    }

    pushMatches(
      entries,
      file,
      content,
      "bunVersion",
      /\bbun-version:\s*["']?([^"'\s#]+)/g,
      (match) => match[1] ?? ""
    );
    pushMatches(
      entries,
      file,
      content,
      "nodeVersion",
      /\bnode-version:\s*["']?([^"'\s#]+)/g,
      (match) => match[1] ?? ""
    );
    pushMatches(
      entries,
      file,
      content,
      "dockerArgBunVersion",
      /\bARG\s+BUN_VERSION\s*=\s*["']?([^"'\s]+)/g,
      (match) => match[1] ?? ""
    );
    pushMatches(
      entries,
      file,
      content,
      "bunVersion",
      /(?<!ARG\s)\bBUN_VERSION\s*=\s*["']?([^"'\s]+)/g,
      (match) => match[1] ?? ""
    );
    pushMatches(
      entries,
      file,
      content,
      "dockerFromBun",
      /\bFROM\s+oven\/bun:([^\s]+)/g,
      (match) => (match[1] ?? "").split("-")[0] ?? ""
    );
    pushMatches(
      entries,
      file,
      content,
      "playwrightImage",
      /mcr\.microsoft\.com\/playwright:v([^\-\s"']+)(?:-[^\s"']+)?/g,
      (match) => match[1] ?? ""
    );
  }

  return entries;
}

function parseRootExpectations(cwd: string): Expectations {
  try {
    const content = readFileSync(
      join(cwd, "package.json"),
      "utf8"
    );
    const parsed = JSON.parse(content) as PackageJson;

    const sources = [
      parsed.dependencies,
      parsed.devDependencies,
      parsed.catalog,
      ...(parsed.catalogs
        ? Object.values(parsed.catalogs)
        : []),
    ];

    let playwright: string | undefined;
    for (const source of sources) {
      if (!source) {
        continue;
      }

      const playwrightVersion =
        source["@playwright/test"] ?? source.playwright;
      if (playwrightVersion) {
        playwright = cleanVersion(playwrightVersion);
        break;
      }
    }

    return {
      bun: parsed.packageManager?.replace(/^bun@/, ""),
      playwright,
    };
  } catch {
    return {};
  }
}

function classifyEntries(
  entries: PinEntry[],
  expectations: Expectations
): DriftEntry[] {
  const expectedBun = expectations.bun;
  const expectedPlaywright = expectations.playwright;

  const nodeValues = new Set(
    entries
      .filter((entry) => entry.kind === "nodeVersion")
      .map((entry) => entry.value)
  );

  return entries.map((entry) => {
    if (entry.kind === "nodeVersion") {
      return {
        ...entry,
        status: nodeValues.size > 1 ? "drift" : "ok",
        reason:
          nodeValues.size > 1
            ? "Multiple node-version values found"
            : "Node version is consistent",
      };
    }

    if (entry.kind === "playwrightPackage") {
      const isCatalogRef = entry.raw.startsWith("catalog:");
      return {
        ...entry,
        expected: expectedPlaywright,
        status: isCatalogRef ? "info" : "ok",
        reason: isCatalogRef
          ? "Playwright package uses root catalog version"
          : "Playwright package version source",
      };
    }

    if (entry.kind === "playwrightImage") {
      const status =
        expectedPlaywright !== undefined &&
        entry.value !== expectedPlaywright
          ? "drift"
          : "ok";
      return {
        ...entry,
        expected: expectedPlaywright,
        status,
        reason:
          expectedPlaywright === undefined
            ? "No Playwright package version found"
            : status === "drift"
              ? "Playwright image version differs from Playwright package version"
              : "Playwright image matches package version",
      };
    }

    if (entry.kind === "typesBun") {
      const isCatalogRef = entry.raw.startsWith("catalog:");
      const status = isCatalogRef
        ? "info"
        : expectedBun !== undefined &&
            entry.value !== expectedBun
          ? "drift"
          : "ok";
      return {
        ...entry,
        expected: expectedBun,
        status,
        reason: isCatalogRef
          ? "@types/bun uses root catalog version"
          : expectedBun === undefined
            ? "No root packageManager Bun version found"
            : status === "drift"
              ? "@types/bun differs from root packageManager Bun version"
              : "@types/bun matches root packageManager Bun version",
      };
    }

    if (
      entry.kind === "bunVersion" ||
      entry.kind === "dockerArgBunVersion" ||
      entry.kind === "dockerFromBun" ||
      entry.kind === "packageManager"
    ) {
      const status =
        expectedBun !== undefined &&
        entry.value !== expectedBun
          ? "drift"
          : "ok";
      return {
        ...entry,
        expected: expectedBun,
        status,
        reason:
          expectedBun === undefined
            ? "No root packageManager Bun version found"
            : status === "drift"
              ? "Bun runtime pin differs from root packageManager Bun version"
              : "Bun runtime pin matches root packageManager Bun version",
      };
    }

    return {
      ...entry,
      status: "info",
      reason: "Informational entry",
    };
  });
}

function printHuman(entries: DriftEntry[]): void {
  const expectedBun = entries.find(
    (entry) => entry.kind === "packageManager"
  )?.value;
  const expectedPlaywright = entries.find(
    (entry) => entry.kind === "playwrightPackage"
  )?.value;

  console.log("Runtime Expectations");
  console.log(`  Bun: ${expectedBun ?? "not found"}`);
  console.log(
    `  Playwright: ${expectedPlaywright ?? "not found"}`
  );

  const groups: Array<{ title: string; kinds: PinKind[] }> =
    [
      {
        title: "Bun Runtime Pins",
        kinds: [
          "packageManager",
          "typesBun",
          "bunVersion",
          "dockerArgBunVersion",
          "dockerFromBun",
        ],
      },
      {
        title: "Playwright Pins",
        kinds: ["playwrightPackage", "playwrightImage"],
      },
      {
        title: "Node Pins",
        kinds: ["nodeVersion"],
      },
    ];

  for (const group of groups) {
    const groupEntries = entries.filter((entry) =>
      group.kinds.includes(entry.kind)
    );
    if (groupEntries.length === 0) {
      continue;
    }

    console.log(`\n${group.title}`);
    for (const entry of groupEntries.toSorted(
      (a: DriftEntry, b: DriftEntry) =>
        a.file.localeCompare(b.file)
    )) {
      const driftTag =
        entry.status === "drift" ? " [DRIFT]" : "";
      const expected = entry.expected
        ? ` | expected ${entry.expected}`
        : "";
      console.log(
        `  ${entry.file}:${entry.line} | ${entry.kind} = ${entry.value}${expected}${driftTag}`
      );
    }
  }

  const driftCount = entries.filter(
    (entry) => entry.status === "drift"
  ).length;
  console.log(`\n${driftCount} drift item(s) found.`);
}

const cwd = process.cwd();
const entries = classifyEntries(
  collectPins(cwd),
  parseRootExpectations(cwd)
);

if (JSON_OUTPUT) {
  const savedPath = saveReport(
    "runtime-report.json",
    entries
  );
  console.log(JSON.stringify(entries, null, 2));
  console.error(`\nSaved to ${savedPath}`);
} else if (entries.length === 0) {
  console.log("No runtime pins found.");
} else {
  printHuman(entries);
}
