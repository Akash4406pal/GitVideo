import { spawn } from "node:child_process";

console.log("\n=======================================================");
console.log("🚀 Starting GitVideo (Classic Frontend/Backend Architecture)");
console.log("   • Backend API Server:  http://localhost:5001");
console.log("   • Frontend UI Studio:  http://localhost:3000");
console.log("=======================================================\n");

const isWin = process.platform === "win32";
const npmCmd = isWin ? "npm.cmd" : "npm";

const backend = spawn(npmCmd, ["--prefix", "backend", "run", "dev"], {
  stdio: "inherit",
  shell: true,
});

const frontend = spawn(npmCmd, ["--prefix", "frontend", "run", "dev"], {
  stdio: "inherit",
  shell: true,
});

const cleanup = () => {
  try {
    backend.kill();
  } catch {}
  try {
    frontend.kill();
  } catch {}
  process.exit(0);
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

