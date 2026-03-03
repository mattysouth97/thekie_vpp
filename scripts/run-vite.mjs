import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const defaultArgs = ["--host", "0.0.0.0", "--port", "5173"];
const args = process.argv.slice(2).length ? process.argv.slice(2) : defaultArgs;

const viteBin = join(root, "node_modules", "vite", "bin", "vite.js");
const useNode = existsSync(viteBin);

const child = useNode
  ? spawn(process.execPath, [viteBin, ...args], { stdio: "inherit", cwd: root })
  : spawn("npx", ["vite", ...args], { stdio: "inherit", cwd: root, shell: true });

child.on("exit", (code) => process.exit(code ?? 0));
