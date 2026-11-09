import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import type { Skeleton } from "../types/skeleton.js";
import type { Storyboard } from "../types/storyboard.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function findLocalBrowserExecutable(): string | undefined {
  const candidates = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return undefined;
}

/**
 * Converts audio file references into self-contained base64 data URIs
 * so Chromium can play them without file-system/CORS restrictions.
 */
function embedAudioDataUris(storyboard: Storyboard): Storyboard {
  const cloned = JSON.parse(JSON.stringify(storyboard)) as Storyboard;
  for (const scene of cloned.scenes) {
    for (const segment of scene.segments) {
      if (segment.audioPath && fs.existsSync(segment.audioPath)) {
        try {
          const isWav = segment.audioPath.toLowerCase().endsWith(".wav");
          const mime = isWav ? "audio/wav" : "audio/mp3";
          const base64 = fs.readFileSync(segment.audioPath).toString("base64");
          segment.audioPath = `data:${mime};base64,${base64}`;
        } catch {
          // keep original if read fails
        }
      }
    }
  }
  return cloned;
}

export interface RenderOptions {
  outputVideoPath?: string;
  previewOnly?: boolean; // Renders the first ~10s chunk for rapid preview
  compositionId?: "GitVideoWalkthrough" | "GitVideoShorts";
  onProgress?: (percent: number) => void;
}

export async function renderWalkthroughVideo(
  skeleton: Skeleton,
  storyboard: Storyboard,
  options: RenderOptions = {}
): Promise<string> {
  const outputPath = path.resolve(options.outputVideoPath || "./dist/walkthrough.mp4");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  // On Windows, unlink pre-existing output file so Remotion rename doesn't collide
  try {
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
  } catch {}

  const indexPath = path.resolve(__dirname, "index.js");
  const entryPoint = fs.existsSync(indexPath) ? indexPath : path.resolve(__dirname, "index.ts");

  console.log(`\n----------------------------------------------`);
  console.log(`  Step 4: Remotion Video Rendering Engine`);
  console.log(`----------------------------------------------`);
  console.log(`[Entrypoint]  ${entryPoint}`);
  console.log(`[Output MP4]  ${outputPath}`);

  const browserExecutable = findLocalBrowserExecutable();
  if (browserExecutable) {
    console.log(`[Chromium]    ${browserExecutable}`);
  }

  // Optimize concurrency for multi-core hardware
  const numCores = os.cpus().length || 4;
  const renderConcurrency = Math.min(8, Math.max(2, Math.floor(numCores / 2)));
  console.log(`[Concurrency] ${renderConcurrency} parallel threads (detected ${numCores} CPU cores)`);

  console.log(`\n📦 Bundling Remotion compositions...`);
  const bundleLocation = await bundle({
    entryPoint,
    webpackOverride: (currentConfig) => ({
      ...currentConfig,
      resolve: {
        ...currentConfig.resolve,
        extensionAlias: {
          ".js": [".ts", ".tsx", ".js"],
          ".jsx": [".tsx", ".jsx"],
        },
      },
    }),
    onProgress: (percent) => {
      if (percent % 25 === 0 || percent === 100) {
        process.stdout.write(`\r   Bundling: ${percent}%`);
      }
    },
  });
  console.log(`\n✔ Composition bundled successfully.`);

  const embeddedStoryboard = embedAudioDataUris(storyboard);
  const inputProps = { skeleton, storyboard: embeddedStoryboard };

  const remotionPort = 8555;

  const compositionId = options.compositionId || "GitVideoWalkthrough";
  console.log(`🔍 Selecting composition '${compositionId}'...`);
  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: compositionId,
    inputProps,
    browserExecutable,
    port: remotionPort,
  });

  const durationSec = (composition.durationInFrames / composition.fps).toFixed(2);
  console.log(`✔ Composition configured:`);
  console.log(`   - Dimensions: ${composition.width}x${composition.height} @ ${composition.fps}fps`);
  console.log(`   - Duration:   ${composition.durationInFrames} frames (~${durationSec}s)`);

  const frameRange: [number, number] | undefined = options.previewOnly
    ? [0, Math.min(300, composition.durationInFrames - 1)]
    : undefined;

  if (frameRange) {
    console.log(`⚡ Quick Preview Mode: rendering frames [${frameRange[0]} to ${frameRange[1]}] (~10s)`);
  }

  console.log(`\n🎬 Rendering frames to MP4 in parallel...`);
  let lastLoggedPercent = -1;

  try {
    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: "h264",
      outputLocation: outputPath,
      inputProps,
      browserExecutable,
      concurrency: renderConcurrency,
      x264Preset: "veryfast",
      crf: 22,
      port: remotionPort,
      frameRange,
      onProgress: ({ renderedFrames, progress }) => {
        const percent = Math.floor(progress * 100);
        if (percent !== lastLoggedPercent && percent % 10 === 0) {
          lastLoggedPercent = percent;
          process.stdout.write(`\r   Rendering: ${percent}% (${renderedFrames} frames rendered)`);
          if (options.onProgress) {
            options.onProgress(percent);
          }
        }
      },
    });
  } catch (renderErr: any) {
    // Windows file-lock recovery: if rename failed, pick up the rendered in-progress file
    const dir = path.dirname(outputPath);
    const inProgressFiles = fs.readdirSync(dir).filter((f) => f.includes(".remotion-in-progress"));
    if (inProgressFiles.length > 0) {
      const inProgressPath = path.join(dir, inProgressFiles[0]);
      try {
        if (fs.existsSync(outputPath)) {
          fs.unlinkSync(outputPath);
        }
        fs.renameSync(inProgressPath, outputPath);
      } catch {
        // keep rendered in progress if rename still locked
      }
    } else {
      throw renderErr;
    }
  }

  console.log(`\n\n✔ Video rendering complete!`);
  console.log(`   - File: ${outputPath}`);
  if (fs.existsSync(outputPath)) {
    const stats = fs.statSync(outputPath);
    const mb = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`   - Size: ${mb} MB`);
  }

  return outputPath;
}
