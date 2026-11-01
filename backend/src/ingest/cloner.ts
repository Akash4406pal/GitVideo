import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import path from "node:path";

const execFileAsync = promisify(execFile);

export interface IngestResult {
  repoPath: string;
  repoName: string;
  commitSha: string;
  branch: string;
  isEphemeral: boolean;
}

export async function ingestRepository(source: string, cacheDir = ".cache/repos"): Promise<IngestResult> {
  // Check if source is a local filesystem path
  if (fs.existsSync(source) && fs.statSync(source).isDirectory()) {
    const absPath = path.resolve(source);
    const repoName = path.basename(absPath);
    let commitSha = "local-dev";
    let branch = "main";

    try {
      const { stdout: revStdout } = await execFileAsync("git", ["rev-parse", "HEAD"], { cwd: absPath });
      commitSha = revStdout.trim().substring(0, 8);
      const { stdout: branchStdout } = await execFileAsync("git", ["rev-parse", "--abbrev-ref", "HEAD"], { cwd: absPath });
      branch = branchStdout.trim();
    } catch {
      // not a git repo or git missing
    }

    return {
      repoPath: absPath,
      repoName,
      commitSha,
      branch,
      isEphemeral: false,
    };
  }

  // Treat as Git URL (HTTPS or SSH)
  const sanitizedName = source
    .replace(/^https?:\/\/github\.com\//i, "")
    .replace(/\.git$/i, "")
    .replace(/[^a-zA-Z0-9_\-]/g, "_");

  const targetDir = path.resolve(cacheDir, sanitizedName);

  if (fs.existsSync(targetDir)) {
    // If already cloned, remove or reuse
    fs.rmSync(targetDir, { recursive: true, force: true });
  }

  fs.mkdirSync(path.dirname(targetDir), { recursive: true });

  console.log(`[Ingest] Cloning ${source} (shallow depth 1) to ${targetDir}...`);
  await execFileAsync("git", ["clone", "--depth", "1", source, targetDir]);

  let commitSha = "unknown";
  let branch = "main";
  try {
    const { stdout: shaOut } = await execFileAsync("git", ["rev-parse", "HEAD"], { cwd: targetDir });
    commitSha = shaOut.trim().substring(0, 8);
    const { stdout: branchOut } = await execFileAsync("git", ["rev-parse", "--abbrev-ref", "HEAD"], { cwd: targetDir });
    branch = branchOut.trim();
  } catch {
    // ignore
  }

  return {
    repoPath: targetDir,
    repoName: sanitizedName,
    commitSha,
    branch,
    isEphemeral: true,
  };
}

