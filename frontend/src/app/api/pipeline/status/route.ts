import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export async function GET() {
  const distDir = path.resolve(process.cwd(), "../backend/dist");
  const skeletonPath = path.join(distDir, "skeleton.json");
  const storyboardPath = path.join(distDir, "storyboard.json");
  const videoPath = path.join(distDir, "walkthrough.mp4");

  let skeleton = null;
  let storyboard = null;
  let hasVideo = false;
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

  if (fs.existsSync(videoPath)) {
    hasVideo = true;
    try {
      const stats = fs.statSync(videoPath);
      videoStats = {
        sizeMb: (stats.size / (1024 * 1024)).toFixed(2),
        durationSec: storyboard?.estimatedDurationSec || 56.94,
      };
    } catch {}
  }

  return NextResponse.json({
    status: hasVideo ? "completed" : skeleton ? "analyzed" : "idle",
    hasVideo,
    videoUrl: hasVideo ? "/api/video" : null,
    videoStats,
    skeleton,
    storyboard,
  });
}

