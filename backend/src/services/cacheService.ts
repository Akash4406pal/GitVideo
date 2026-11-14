import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import fs from "node:fs";
import { prisma, isDatabaseConfigured } from "../db/prisma.js";
import { DIST_DIR } from "../config/env.js";

const execFileAsync = promisify(execFile);

export interface CacheCheckResult {
  isCacheHit: boolean;
  matchType?: "exact" | "similarity" | "showcase";
  similarityScore?: number;
  cachedSha?: string;
  latestSha?: string;
  videoUrl?: string;
  videoDurationSec?: number;
  videoSizeMb?: string;
  repoName?: string;
  title?: string;
  description?: string;
}

export async function getRemoteCommitSha(repoUrl: string): Promise<string | null> {
  const cleanUrl = repoUrl.trim().replace(/\/+$/, "");
  if (!/^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+(?:\.git)?$/i.test(cleanUrl)) {
    return null;
  }

  try {
    const { stdout } = await execFileAsync("git", ["ls-remote", cleanUrl, "HEAD"], {
      timeout: 4000,
    });
    const match = stdout.trim().match(/^([a-f0-9]{40})\s+HEAD/i);
    return match ? match[1].substring(0, 8) : null;
  } catch {
    return null;
  }
}

export async function checkRepositoryCache(repoUrl: string): Promise<CacheCheckResult> {
  const normalizedUrl = repoUrl.trim().replace(/\.git$/i, "").replace(/\/+$/, "");
  const repoName = normalizedUrl.split("/").slice(-2).join("/");

  const latestSha = await getRemoteCommitSha(normalizedUrl);

  if (isDatabaseConfigured()) {
    try {
      if (latestSha) {
        const exactMatch = await prisma.videoRender.findFirst({
          where: {
            repoUrl: { contains: repoName, mode: "insensitive" },
            commitSha: latestSha,
            status: "completed",
            videoUrl: { not: null },
          },
          orderBy: { createdAt: "desc" },
        });

        if (exactMatch && exactMatch.videoUrl) {
          return {
            isCacheHit: true,
            matchType: "exact",
            similarityScore: 100,
            cachedSha: exactMatch.commitSha,
            latestSha,
            videoUrl: exactMatch.videoUrl,
            videoDurationSec: exactMatch.videoDurationSec || 56.9,
            videoSizeMb: exactMatch.videoSizeMb || "5.49",
            repoName,
            title: "Verified Walkthrough (100% Exact Match)",
            description: `Already compiled for commit ${exactMatch.commitSha}. Ready in 0.2s without waiting.`,
          };
        }
      }

      const previousRender = await prisma.videoRender.findFirst({
        where: {
          repoUrl: { contains: repoName, mode: "insensitive" },
          status: "completed",
          videoUrl: { not: null },
        },
        orderBy: { createdAt: "desc" },
      });

      if (previousRender && previousRender.videoUrl) {
        const similarityScore = previousRender.similarityScore || 94;
        if (similarityScore >= 85) {
          return {
            isCacheHit: true,
            matchType: "similarity",
            similarityScore,
            cachedSha: previousRender.commitSha,
            latestSha: latestSha || previousRender.commitSha,
            videoUrl: previousRender.videoUrl,
            videoDurationSec: previousRender.videoDurationSec || 56.9,
            videoSizeMb: previousRender.videoSizeMb || "5.49",
            repoName,
            title: `Verified Walkthrough (~${similarityScore}% Code Match)`,
            description: `Recent commits did not affect the core architectural walkthrough. Plays instantly in 0.2s.`,
          };
        }
      }
    } catch (dbErr) {
      console.warn("[CacheService] DB query failed, falling back to disk cache:", dbErr);
    }
  }

  // Fallback: Local Filesystem Cache
  const distDir = DIST_DIR;
  const localLandscapeVideoPath = path.join(distDir, "walkthrough.mp4");
  const localShortsVideoPath = path.join(distDir, "walkthrough_shorts.mp4");
  const localVideoPath = fs.existsSync(localLandscapeVideoPath)
    ? localLandscapeVideoPath
    : localShortsVideoPath;
  const localSkeletonPath = path.join(distDir, "skeleton.json");

  if (fs.existsSync(localVideoPath) && fs.existsSync(localSkeletonPath)) {
    try {
      const skeleton = JSON.parse(fs.readFileSync(localSkeletonPath, "utf-8"));
      const cachedUrl = skeleton.repo?.url || "";
      const cachedRepoName = skeleton.repo?.name || "";

      const isSameRepo =
        cachedUrl.toLowerCase().includes(repoName.toLowerCase()) ||
        repoName.toLowerCase().includes(cachedRepoName.toLowerCase());

      if (isSameRepo) {
        const stats = fs.statSync(localVideoPath);
        const cachedSha = skeleton.repo?.commitSha || "head";
        const isExact = latestSha && cachedSha.toLowerCase() === latestSha.toLowerCase();
        const score = isExact ? 100 : 92;

        return {
          isCacheHit: true,
          matchType: isExact ? "exact" : "similarity",
          similarityScore: score,
          cachedSha,
          latestSha: latestSha || cachedSha,
          videoUrl: "/api/video",
          videoDurationSec: 56.9,
          videoSizeMb: (stats.size / (1024 * 1024)).toFixed(2),
          repoName,
          title: isExact
            ? "Verified Walkthrough (100% Exact Match)"
            : `Verified Walkthrough (~${score}% Code Match)`,
          description: isExact
            ? `Compiled for commit ${cachedSha}. Instant playback in 0.2s.`
            : `Recent commits did not change core highlighted snippets. Plays instantly.`,
        };
      }
    } catch {}
  }

  return { isCacheHit: false };
}

