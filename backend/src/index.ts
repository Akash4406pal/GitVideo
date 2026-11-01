import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { ingestRepository } from "./ingest/cloner.js";
import { buildSkeleton } from "./analyzer/skeletonBuilder.js";

dotenv.config();

async function main() {
  const args = process.argv.slice(2);
  const targetSource = args[0] || ".";
  const outputDir = path.resolve(args[1] || "./dist");

  console.log(`\n==============================================`);
  console.log(`  GitVideo Pipeline - Ingestion & Analyzer`);
  console.log(`==============================================`);
  console.log(`[Target] ${targetSource}`);
  console.log(`[Output] ${outputDir}\n`);

  const startTime = Date.now();

  try {
    // 1. Ingest repository (clone or local read)
    console.log(`Step 1/2: Ingesting repository...`);
    const ingest = await ingestRepository(targetSource);
    console.log(`✔ Ingested: ${ingest.repoName} (Branch: ${ingest.branch}, Commit: ${ingest.commitSha})`);

    // 2. Build and validate skeleton
    console.log(`\nStep 2/2: Analyzing AST, imports, entrypoints, and snippets...`);
    const skeleton = await buildSkeleton(ingest, targetSource);
    console.log(`✔ Scanned ${skeleton.files.length} source files (${skeleton.repo.totalLinesOfCode} LOC)`);
    console.log(`✔ Languages: ${skeleton.repo.detectedLanguages.join(", ") || "Unknown"}`);
    console.log(`✔ Frameworks: ${skeleton.repo.detectedFrameworks.join(", ") || "None detected"}`);
    console.log(`✔ Entry points identified: ${skeleton.entryPoints.join(", ") || "None"}`);
    console.log(`✔ Snippets extracted: ${skeleton.snippets.length}`);

    // Ensure output dir exists
    fs.mkdirSync(outputDir, { recursive: true });
    const skeletonPath = path.join(outputDir, "skeleton.json");
    fs.writeFileSync(skeletonPath, JSON.stringify(skeleton, null, 2), "utf-8");
    console.log(`\n✔ Skeleton written to: ${skeletonPath}`);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✨ Completed successfully in ${elapsed}s\n`);
  } catch (error) {
    console.error(`\n❌ Ingestion & Analysis failed:`, error);
    process.exit(1);
  }
}

main();

