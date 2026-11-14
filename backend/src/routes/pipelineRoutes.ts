import { Router, type Request, type Response } from "express";
import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import { checkRepositoryCache } from "../services/cacheService.js";
import { QuotaService } from "../services/quotaService.js";
import { BACKEND_DIR, DIST_DIR, config } from "../config/env.js";

export const pipelineRouter = Router();

/**
 * Sub-300ms Content-Addressed Cache Inspection
 */
pipelineRouter.post("/check-cache", async (req: Request, res: Response) => {
  try {
    const repoUrl = req.body.repoUrl?.trim();
    if (!repoUrl) {
      return res.status(400).json({ error: "Missing repoUrl parameter" });
    }

    const result = await checkRepositoryCache(repoUrl);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ isCacheHit: false, error: error.message });
  }
});

/**
 * Pipeline Status Check
 */
pipelineRouter.get("/status", (_req: Request, res: Response) => {
  const distDir = DIST_DIR;
  const skeletonPath = path.join(distDir, "skeleton.json");
  const storyboardPath = path.join(distDir, "storyboard.json");
  const landscapeVideoPath = path.join(distDir, "walkthrough.mp4");
  const shortsVideoPath = path.join(distDir, "walkthrough_shorts.mp4");

  const videoPath = fs.existsSync(landscapeVideoPath)
    ? landscapeVideoPath
    : fs.existsSync(shortsVideoPath)
    ? shortsVideoPath
    : null;

  let skeleton = null;
  let storyboard = null;
  let hasVideo = Boolean(videoPath);
  let videoStats = null;

  if (fs.existsSync(skeletonPath)) {
    try {
      skeleton = JSON.parse(fs.readFileSync(skeletonPath, "utf-8"));
    } catch {}
  }

  if (fs.existsSync(storyboardPath)) {
    try {
      storyboard = JSON.parse(fs.readFileSync(storyboardPath, "utf-8"));
    } catch {}
  }

  if (videoPath) {
    try {
      const stats = fs.statSync(videoPath);
      videoStats = {
        sizeMb: (stats.size / (1024 * 1024)).toFixed(2),
        durationSec: storyboard?.estimatedDurationSec || 56.94,
        isShorts: videoPath.endsWith("walkthrough_shorts.mp4"),
      };
    } catch {}
  }

  return res.json({
    status: hasVideo ? "completed" : skeleton ? "analyzed" : "idle",
    hasVideo,
    videoUrl: hasVideo ? "/api/video" : null,
    videoStats,
    skeleton,
    storyboard,
  });
});

/**
 * Pipeline Run with Server-Sent Events (SSE) Streaming
 */
pipelineRouter.post("/run", async (req: Request, res: Response) => {
  const clientIp = req.headers["x-forwarded-for"]?.toString() || req.socket.remoteAddress || "127.0.0.1";
  const userId = req.headers["x-user-id"]?.toString() || "dev_user";

  // Rate Limiting
  const rateLimit = QuotaService.checkRateLimit(clientIp);
  if (!rateLimit.allowed) {
    return res.status(429).json({
      error: "Too many requests",
      message: `Rate limit exceeded. Please wait ${rateLimit.retryAfterSec}s.`,
    });
  }

  const rawInputUrl = req.body.repoUrl?.trim() || ".";
  const skipRender = Boolean(req.body.skipRender);
  const isShorts = Boolean(req.body.isShorts || req.body.aspectRatio === "9:16");

  // Normalize by stripping trailing slashes for GitHub URLs
  const cleanUrl = rawInputUrl.replace(/\/+$/, "");

  const isGitHubUrl = /^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+(?:\.git)?$/i.test(cleanUrl);
  const isSafeLocalPath = /^(\.|\.\/|\.\.\/?|[a-zA-Z0-9_\-./\\]+)$/.test(rawInputUrl) && !/[;&|`$<>]/.test(rawInputUrl);

  if (!isGitHubUrl && !isSafeLocalPath) {
    return res.status(400).json({
      error: "Invalid repository URL",
      message: "Please provide a valid public GitHub repository URL.",
    });
  }

  const normalizedUrl = isGitHubUrl ? cleanUrl : rawInputUrl;

  // Quota & Concurrency Checks
  if (!skipRender) {
    const quotaCheck = await QuotaService.canGenerateFresh(userId);
    if (!quotaCheck.allowed) {
      return res.status(429).json({
        error: "Quota exceeded",
        message: quotaCheck.reason,
      });
    }

    const lockAcquired = QuotaService.acquireRenderLock(userId);
    if (!lockAcquired) {
      return res.status(409).json({
        error: "Job already running",
        message: "A video rendering job is currently active for your account. Please wait for it to finish.",
      });
    }

    await QuotaService.consumeFreshCredit(userId);
  }

  // Set SSE Headers
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  });

  const sendEvent = (event: string, data: any) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const cleanup = () => {
    if (!skipRender) {
      QuotaService.releaseRenderLock(userId);
    }
  };

  sendEvent("start", { repoUrl: normalizedUrl, skipRender, isShorts, timestamp: new Date().toISOString() });

  const distIndex = path.join(DIST_DIR, "index.js");
  const useCompiled = fs.existsSync(distIndex);

  const command = process.execPath;
  const procArgs = useCompiled
    ? [distIndex, normalizedUrl, DIST_DIR]
    : [
        path.join(BACKEND_DIR, "node_modules", "tsx", "dist", "cli.mjs"),
        path.join(BACKEND_DIR, "src", "index.ts"),
        normalizedUrl,
        DIST_DIR,
      ];

  if (skipRender) {
    procArgs.push("--skip-render");
  }

  if (isShorts) {
    procArgs.push("--shorts");
  }

  const safeEnv: NodeJS.ProcessEnv = {
    PATH: process.env.PATH || "",
    NODE_ENV: config.NODE_ENV,
    BHARATCODE_API_KEY: config.BHARATCODE_API_KEY,
    BHARATCODE_BASE_URL: config.BHARATCODE_BASE_URL,
    BHARATCODE_MODEL: config.BHARATCODE_MODEL,
    CACHE_DIR: config.CACHE_DIR,
    OUTPUT_DIR: config.OUTPUT_DIR,
    DATABASE_URL: config.DATABASE_URL,
    TTS_VOICE: config.TTS_VOICE,
  };

  const child = spawn(command, procArgs, {
    cwd: BACKEND_DIR,
    env: safeEnv,
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (child.stdout) {
    child.stdout.on("data", (data: Buffer) => {
      const text = data.toString();
      const lines = text.split(/\r?\n/).filter(Boolean);

      for (const line of lines) {
        sendEvent("log", { line, timestamp: new Date().toLocaleTimeString() });

        if (line.includes("Ingesting repository")) {
          sendEvent("stage", { stageIndex: 1, name: "ingest", percent: 15 });
        } else if (line.includes("Analyzing AST")) {
          sendEvent("stage", { stageIndex: 2, name: "analyze", percent: 35 });
        } else if (line.includes("Step 2:") || line.includes("Storyboard Generation")) {
          sendEvent("stage", { stageIndex: 3, name: "storyboard", percent: 55 });
        } else if (line.includes("Step 3:") || line.includes("Voiceover & Audio Synthesis")) {
          sendEvent("stage", { stageIndex: 4, name: "tts", percent: 75 });
        } else if (line.includes("Step 4:") || line.includes("Remotion Video Rendering")) {
          sendEvent("stage", { stageIndex: 5, name: "render", percent: 85 });
        } else if (line.includes("Rendering:") && line.includes("%")) {
          const match = line.match(/Rendering:\s*(\d+)%/);
          if (match) {
            const renderPercent = parseInt(match[1], 10);
            const overallPercent = Math.min(99, 85 + Math.floor(renderPercent * 0.14));
            sendEvent("stage", { stageIndex: 5, name: "render", percent: overallPercent });
          }
        } else if (line.includes("Completed Successfully")) {
          sendEvent("stage", { stageIndex: 5, name: "complete", percent: 100 });
          sendEvent("complete", { videoUrl: skipRender ? null : "/api/video", success: true });
        }
      }
    });
  }

  if (child.stderr) {
    child.stderr.on("data", (data: Buffer) => {
      sendEvent("log", {
        line: `[stderr] ${data.toString()}`,
        timestamp: new Date().toLocaleTimeString(),
        isError: true,
      });
    });
  }

  child.on("close", (code: number | null) => {
    cleanup();
    if (code !== 0) {
      sendEvent("error", { code, message: `Pipeline process exited with code ${code}` });
    }
    sendEvent("done", { code });
    res.end();
  });

  req.on("close", () => {
    cleanup();
    try {
      child.kill("SIGTERM");
    } catch {}
  });
});
