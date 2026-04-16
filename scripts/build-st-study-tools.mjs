import { spawnSync } from "node:child_process";
import { cpSync, existsSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const repoRoot = path.resolve(__dirname, "..");
const subAppDir = path.join(repoRoot, "apps", "st-study-tools");
const subAppDistDir = path.join(subAppDir, "dist");
const subAppNodeModulesDir = path.join(subAppDir, "node_modules");
const subAppReactAceModuleDir = path.join(subAppNodeModulesDir, "react-ace");
const subAppLockFile = path.join(subAppDir, "package-lock.json");
const outputDir = path.join(repoRoot, "public", "st-study-tools");

const runNpm = (args, cwd) => {
  const isWindows = process.platform === "win32";
  const command = isWindows ? "cmd.exe" : "npm";
  const commandArgs = isWindows ? ["/d", "/s", "/c", "npm", ...args] : args;

  const result = spawnSync(command, commandArgs, {
    cwd,
    stdio: "inherit",
  });

  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

if (!existsSync(subAppReactAceModuleDir)) {
  const installArgs = existsSync(subAppLockFile)
    ? ["ci", "--production=false", "--no-audit", "--no-fund"]
    : ["install", "--production=false", "--no-audit", "--no-fund"];
  runNpm(installArgs, subAppDir);
}

runNpm(["run", "build"], subAppDir);

if (!existsSync(subAppDistDir)) {
  console.error("Sub-app build completed but dist/ was not found.");
  process.exit(1);
}

rmSync(outputDir, { recursive: true, force: true });
cpSync(subAppDistDir, outputDir, { recursive: true, force: true });

console.log("Synced st-study-tools build output to public/st-study-tools.");
