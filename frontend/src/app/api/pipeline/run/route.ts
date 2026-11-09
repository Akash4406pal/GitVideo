import { NextRequest, NextResponse } from "next/server";
import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/5_shared/auth/authOptions";
import { QuotaAndSecurityService } from "@/5_shared/security/quotaService";

export async function POST(req: NextRequest) {
  // 1. Authentication Check
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json(
      {
        error: "Authentication required",
        message: "Please sign in with your GitHub or Google account to generate a video.",
      },
      { status: 401 }
    );
  }

  const userId = session.user.id || session.user.email || "dev_user";
  const clientIp = req.headers.get("x-forwarded-for") || "127.0.0.1";

  // 2. Sliding-Window Rate Limiting
  const rateLimit = QuotaAndSecurityService.checkRateLimit(clientIp);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "Too many requests",
        message: `Rate limit exceeded. Please wait ${rateLimit.retryAfterSec} seconds before starting another generation.`,
      },
      { status: 429 }
    );
  }

  let body: { repoUrl?: string; skipRender?: boolean } = {};
  try {
    body = await req.json();
  } catch {}

  const rawUrl = body.repoUrl?.trim() || ".";
  
  // Security: Strict validation of repository target to prevent shell/argument injection
  const isGitHubUrl = /^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+(?:\.git)?$/.test(rawUrl);
  const isSafeLocalPath = /^(\.|\.\/|\.\.\/?|[a-zA-Z0-9_\-./\\]+)$/.test(rawUrl) && !/[;&|`$<>]/.test(rawUrl);

  if (!isGitHubUrl && !isSafeLocalPath) {
    return NextResponse.json(
      {
        error: "Invalid repository URL",
        message: "Please provide a valid public GitHub repository URL (e.g., https://github.com/expressjs/express).",
      },
      { status: 400 }
    );
  }

  const repoUrl = rawUrl;
  const skipRender = Boolean(body.skipRender);

  // 3. Daily Quota Check (Fast mode / skip-render uses fewer/free credits)
  if (!skipRender) {
    const quotaCheck = QuotaAndSecurityService.canGenerate(userId);
    if (!quotaCheck.allowed) {
      return NextResponse.json(
        {
          error: "Quota exceeded",
          message: quotaCheck.reason,
        },
        { status: 429 }
      );
    }

    // 4. Concurrency Render Lock (1 active render per user)
    const lockAcquired = QuotaAndSecurityService.acquireRenderLock(userId);
    if (!lockAcquired) {
      return NextResponse.json(
        {
          error: "Job already running",
          message: "A video rendering job is currently active for your account. Please wait for it to finish.",
        },
        { status: 409 }
      );
    }

    // Deduct 1 credit for full render
    QuotaAndSecurityService.consumeCredit(userId);
  }

  const backendDir = path.resolve(process.cwd(), "../backend");
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const sendEvent = (event: string, data: any) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      const cleanup = () => {
        if (!skipRender) {
          QuotaAndSecurityService.releaseRenderLock(userId);
        }
      };

      // Initial connecting event
      sendEvent("start", { repoUrl, skipRender, timestamp: new Date().toISOString() });

      // Build process args - locate compiled dist/index.js or local tsx cli
      const distIndex = path.join(backendDir, "dist", "index.js");
      const tsxCli = path.join(backendDir, "node_modules", "tsx", "dist", "cli.mjs");
      const useCompiled = fs.existsSync(distIndex);

      const command = process.execPath; // Invoking node binary directly is immune to shell injection
      const procArgs = useCompiled
        ? [distIndex, repoUrl, path.join(backendDir, "dist")]
        : [tsxCli, path.join(backendDir, "src", "index.ts"), repoUrl, path.join(backendDir, "dist")];

      if (skipRender) {
        procArgs.push("--skip-render");
      }

      // Whitelist only safe environment variables - never expose NextAuth or OAuth secrets
      const safeEnv: NodeJS.ProcessEnv = {
        PATH: process.env.PATH || "",
        NODE_ENV: process.env.NODE_ENV || "development",
        BHARATCODE_API_KEY: process.env.BHARATCODE_API_KEY || "",
        BHARATCODE_BASE_URL: process.env.BHARATCODE_BASE_URL || "https://bharatcode.ai/api/model/v1",
        BHARATCODE_MODEL: process.env.BHARATCODE_MODEL || "qwen-3.8-27b",
        CACHE_DIR: process.env.CACHE_DIR || path.join(backendDir, ".cache"),
        OUTPUT_DIR: process.env.OUTPUT_DIR || path.join(backendDir, "dist"),
        SYSTEMROOT: process.env.SYSTEMROOT || "",
        COMSPEC: process.env.COMSPEC || "",
        PATHEXT: process.env.PATHEXT || "",
        TEMP: process.env.TEMP || "",
        TMP: process.env.TMP || "",
      };

      const child = spawn(command, procArgs, {
        cwd: backendDir,
        env: safeEnv,
        stdio: ["ignore", "pipe", "pipe"],
      });

      if (child.stdout) {
        child.stdout.on("data", (data: Buffer) => {
          const text = data.toString();
          const lines = text.split(/\r?\n/).filter(Boolean);

          for (const line of lines) {
            sendEvent("log", {
              line,
              timestamp: new Date().toLocaleTimeString(),
            });

            // Detect stage transitions from stdout
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
              sendEvent("complete", {
                videoUrl: skipRender ? null : "/api/video",
                success: true,
              });
            }
          }
        });
      }

      if (child.stderr) {
        child.stderr.on("data", (data: Buffer) => {
          const text = data.toString();
          sendEvent("log", {
            line: `[stderr] ${text}`,
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
        controller.close();
      });

      child.on("error", (err: Error) => {
        cleanup();
        sendEvent("error", { message: err.message });
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
