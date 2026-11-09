import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { ingestRepository } from "./ingest/cloner.js";
import { buildSkeleton } from "./analyzer/skeletonBuilder.js";
import { generateStoryboard } from "./storyboard/storyboardGenerator.js";
import { synthesizeStoryboardAudio } from "./tts/audioSynthesizer.js";
import { renderWalkthroughVideo } from "./remotion/renderVideo.js";
import { generateArchitectureDoc } from "./analyzer/architectureDoc.js";
import { config } from "./config/env.js";

dotenv.config();

async function main() {
  const args = process.argv.slice(2);
  const skipRender = args.includes("--skip-render");
  const previewOnly = args.includes("--preview");
  const isShorts = args.includes("--shorts");
  const filteredArgs = args.filter((a) => !a.startsWith("--"));

  const targetSource = filteredArgs[0] || ".";
  const outputDir = path.resolve(filteredArgs[1] || config.OUTPUT_DIR || "./dist");
  const audioOutputDir = path.join(outputDir, "audio");

  console.log(`\n==============================================`);
  console.log(`  GitVideo Pipeline: Ingest -> Story -> Voice -> Video`);
  console.log(`==============================================`);
  console.log(`[Target Source] ${targetSource}`);
  console.log(`[Output Dir]    ${outputDir}`);
  console.log(`[Audio Dir]     ${audioOutputDir}\n`);

  const startTime = Date.now();

  try {
    // ----------------------------------------------------
    // Step 1: Ingest & Static Code Analysis
    // ----------------------------------------------------
    console.log(`Step 1/4: Ingesting repository...`);
    const ingest = await ingestRepository(targetSource, path.join(config.CACHE_DIR, "repos"));
    console.log(`✔ Ingested: ${ingest.repoName} (Branch: ${ingest.branch}, Commit: ${ingest.commitSha})`);

    console.log(`\nAnalyzing AST, entrypoints, and snippets...`);
    const skeleton = await buildSkeleton(ingest, targetSource);
    console.log(`✔ Scanned ${skeleton.files.length} source files (${skeleton.repo.totalLinesOfCode} LOC)`);
    console.log(`✔ Languages: ${skeleton.repo.detectedLanguages.join(", ") || "Unknown"}`);
    console.log(`✔ Frameworks: ${skeleton.repo.detectedFrameworks.join(", ") || "None detected"}`);
    console.log(`✔ Entry points: ${skeleton.entryPoints.join(", ") || "None"}`);
    console.log(`✔ Snippets extracted: ${skeleton.snippets.length}`);

    fs.mkdirSync(outputDir, { recursive: true });
    const skeletonPath = path.join(outputDir, "skeleton.json");
    fs.writeFileSync(skeletonPath, JSON.stringify(skeleton, null, 2), "utf-8");
    console.log(`✔ Skeleton saved to: ${skeletonPath}`);

    // ----------------------------------------------------
    // Step 2: Storyboard Generation with BharatCode LLM
    // ----------------------------------------------------
    console.log(`\nStep 2/4: Storyboard Script Generation...`);
    const initialStoryboard = await generateStoryboard(skeleton);

    // ----------------------------------------------------
    // Step 3: Voiceover & Audio Timing Synthesis
    // ----------------------------------------------------
    console.log(`\nStep 3/4: Voiceover & Audio Synthesis...`);
    const { storyboard, totalAudioDurationSec, totalClipsGenerated } = await synthesizeStoryboardAudio(
      initialStoryboard,
      audioOutputDir
    );

    // Save final storyboard enriched with audio timing and paths
    const storyboardPath = path.join(outputDir, "storyboard.json");
    fs.writeFileSync(storyboardPath, JSON.stringify(storyboard, null, 2), "utf-8");
    console.log(`✔ Enriched Storyboard saved to: ${storyboardPath}`);

    // Generate executive ARCHITECTURE.md blueprint
    const architectureDocPath = path.join(outputDir, "ARCHITECTURE.md");
    const architectureDoc = generateArchitectureDoc(skeleton, storyboard);
    fs.writeFileSync(architectureDocPath, architectureDoc, "utf-8");
    console.log(`✔ Architecture Blueprint saved to: ${architectureDocPath}`);

    // ----------------------------------------------------
    // Step 4: Remotion Video Composition & Rendering
    // ----------------------------------------------------
    let videoPath: string | null = null;
    if (!skipRender) {
      console.log(`\nStep 4/4: Remotion Video Rendering (${isShorts ? "9:16 Shorts 720x1280" : "16:9 Landscape 1280x720"} 30fps)...`);
      videoPath = await renderWalkthroughVideo(skeleton, storyboard, {
        outputVideoPath: path.join(outputDir, isShorts ? "walkthrough_shorts.mp4" : "walkthrough.mp4"),
        previewOnly,
        compositionId: isShorts ? "GitVideoShorts" : "GitVideoWalkthrough",
      });
    } else {
      console.log(`\nStep 4/4: Video rendering skipped via --skip-render`);
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n==============================================`);
    console.log(`✨ Pipeline Completed Successfully in ${elapsed}s!`);
    console.log(`   - Skeleton:     ${skeletonPath}`);
    console.log(`   - Storyboard:   ${storyboardPath}`);
    console.log(`   - Audio Clips:  ${totalClipsGenerated} clips in ${audioOutputDir}`);
    console.log(`   - Video Length: ~${totalAudioDurationSec}s`);
    if (videoPath) {
      console.log(`   - Video File:   ${videoPath}`);
    }
    console.log(`==============================================\n`);
  } catch (error) {
    console.error(`\n❌ Pipeline failed:`, error);
    process.exit(1);
  }
}

main();
