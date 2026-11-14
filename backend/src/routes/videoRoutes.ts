import { Router, type Request, type Response } from "express";
import fs from "node:fs";
import path from "node:path";
import { DIST_DIR } from "../config/env.js";

export const videoRouter = Router();

videoRouter.get("/", (req: Request, res: Response) => {
  const preferShorts = req.query.format === "shorts";
  const landscapePath = path.join(DIST_DIR, "walkthrough.mp4");
  const shortsPath = path.join(DIST_DIR, "walkthrough_shorts.mp4");

  let videoPath = preferShorts ? shortsPath : landscapePath;
  if (!fs.existsSync(videoPath)) {
    videoPath = fs.existsSync(landscapePath) ? landscapePath : shortsPath;
  }

  if (!fs.existsSync(videoPath)) {
    return res.status(404).json({ error: "Video walkthrough has not been generated yet." });
  }

  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    // Validate range bounds
    if (isNaN(start) || start >= fileSize || start > end || end >= fileSize) {
      res.writeHead(416, {
        "Content-Range": `bytes */${fileSize}`,
        "Content-Type": "video/mp4",
      });
      return res.end();
    }

    const chunksize = end - start + 1;
    const fileStream = fs.createReadStream(videoPath, { start, end });

    fileStream.on("error", (streamErr) => {
      console.warn("[VideoRouter] Stream error:", streamErr);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to stream video" });
      }
    });

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "video/mp4",
      "Access-Control-Expose-Headers": "Content-Range, Accept-Ranges, Content-Length",
    });

    return fileStream.pipe(res);
  }

  res.writeHead(200, {
    "Content-Length": fileSize,
    "Content-Type": "video/mp4",
    "Accept-Ranges": "bytes",
    "Access-Control-Expose-Headers": "Content-Range, Accept-Ranges, Content-Length",
  });

  const fullStream = fs.createReadStream(videoPath);
  fullStream.on("error", (err) => {
    console.warn("[VideoRouter] Full stream error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to read video" });
    }
  });

  fullStream.pipe(res);
});

/**
 * Preview individual voiceover audio clips
 */
videoRouter.get("/audio/:clipName", (req: Request, res: Response) => {
  const rawClip = Array.isArray(req.params.clipName) ? req.params.clipName[0] : req.params.clipName;
  const clipName = path.basename(String(rawClip || ""));
  const audioPath = path.join(DIST_DIR, "audio", clipName);

  if (!fs.existsSync(audioPath)) {
    return res.status(404).json({ error: `Audio clip '${clipName}' not found.` });
  }

  const isWav = clipName.toLowerCase().endsWith(".wav");
  const contentType = isWav ? "audio/wav" : "audio/mpeg";

  const stat = fs.statSync(audioPath);
  res.writeHead(200, {
    "Content-Length": stat.size,
    "Content-Type": contentType,
    "Accept-Ranges": "bytes",
  });

  fs.createReadStream(audioPath).pipe(res);
});
