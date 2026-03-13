/// <reference types="bun" />
/// <reference types="node" />

type StepResult = {
  name: string;
  success: boolean;
  duration: number;
  output?: string;
};

type RunResult = {
  exitCode: number;
  stdout: string;
  stderr: string;
};

async function run(cmd: string[]): Promise<RunResult> {
  const proc = Bun.spawn(cmd, {
    stdout: "pipe",
    stderr: "pipe",
  });

  const exitCode = await proc.exited;
  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();

  return { exitCode, stdout, stderr };
}

async function runStep(
  name: string,
  fn: () => Promise<{ success: boolean; output?: string }>,
): Promise<StepResult> {
  const start = performance.now();
  const { success, output } = await fn();
  const duration = (performance.now() - start) / 1000;

  return { name, success, duration, output };
}

function formatDuration(seconds: number): string {
  return seconds >= 1 ? `${seconds.toFixed(1)}s` : `${(seconds * 1000).toFixed(0)}ms`;
}

function printResult(result: StepResult): void {
  const icon = result.success ? "\x1b[32m✓\x1b[0m" : "\x1b[31m✗\x1b[0m";

  console.log(`${icon} ${result.name} (${formatDuration(result.duration)})`);

  if (!result.success && result.output) {
    console.log();
    console.log(result.output);
  }
}

async function typecheck(): Promise<{
  success: boolean;
  output?: string;
}> {
  const result = await run(["bunx", "tsc", "--noEmit"]);

  return {
    success: result.exitCode === 0,
    output: result.exitCode === 0 ? undefined : result.stderr || result.stdout,
  };
}

async function formatCheck(): Promise<{ success: boolean; output?: string }> {
  const result = await run(["bun", "run", "format:check"]);

  return {
    success: result.exitCode === 0,
    output: result.exitCode === 0 ? undefined : result.stderr || result.stdout,
  };
}

async function lint(): Promise<{ success: boolean; output?: string }> {
  const result = await run(["bun", "run", "lint"]);

  return {
    success: result.exitCode === 0,
    output: result.exitCode === 0 ? undefined : result.stderr || result.stdout,
  };
}

export async function main(): Promise<void> {
  const results = await Promise.all([
    runStep("format", formatCheck),
    runStep("lint", lint),
    runStep("typecheck", typecheck),
  ]);

  let hasFailures = false;

  for (const result of results) {
    printResult(result);
    hasFailures ||= !result.success;
  }

  if (hasFailures) {
    process.exit(1);
  }
}

await main();
