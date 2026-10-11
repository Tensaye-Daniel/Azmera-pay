#!/usr/bin/env node
// Dev launcher: runs the Django backend and the Vite frontend together.
// Usage: node scripts/start.mjs [--backend-only | --frontend-only]
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const isWin = process.platform === "win32";

function resolvePython() {
  const candidates = isWin
    ? [join(repoRoot, "backend", ".venv", "Scripts", "python.exe")]
    : [join(repoRoot, "backend", ".venv", "bin", "python")];
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  return isWin ? "python" : "python3";
}

const colors = { backend: "\x1b[36m", frontend: "\x1b[35m", reset: "\x1b[0m" };
const children = [];
let shuttingDown = false;

function killTree(child) {
  if (!child || child.exitCode !== null) return;
  if (isWin) {
    try {
      spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
    } catch {
      /* ignore */
    }
  } else {
    try {
      process.kill(-child.pid, "SIGTERM");
    } catch {
      child.kill("SIGTERM");
    }
  }
}

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) killTree(child);
  setTimeout(() => process.exit(code), 300);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

function run(name, commandLine, cwd) {
  const child = spawn(commandLine, {
    cwd,
    shell: true,
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  const prefix = `${colors[name] ?? ""}[${name}]${colors.reset}`;
  const pipe = (stream) => {
    let buffer = "";
    stream.on("data", (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop();
      for (const line of lines) console.log(`${prefix} ${line}`);
    });
  };
  pipe(child.stdout);
  pipe(child.stderr);
  child.on("exit", (code, signal) => {
    console.log(`${prefix} exited (code=${code ?? "null"}, signal=${signal ?? "none"})`);
    shutdown(code ?? 0);
  });
  children.push(child);
  return child;
}

const only = process.argv.slice(2);
const python = resolvePython();
console.log(`Azmera dev launcher (python: ${python})`);

if (!only.includes("--frontend-only")) {
  run("backend", `"${python}" manage.py runserver 0.0.0.0:8000`, join(repoRoot, "backend"));
}
if (!only.includes("--backend-only")) {
  const viteBin = join(repoRoot, "frontend", "node_modules", "vite", "bin", "vite.js");
  if (existsSync(viteBin)) {
    run("frontend", `"${process.execPath}" "${viteBin}"`, join(repoRoot, "frontend"));
  } else {
    run("frontend", "pnpm --dir frontend dev", repoRoot);
  }
}
