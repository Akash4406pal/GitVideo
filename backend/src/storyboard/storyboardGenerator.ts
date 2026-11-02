import type { Skeleton } from "../types/skeleton.js";
import type { Storyboard } from "../types/storyboard.js";
import { buildSystemPrompt, buildUserPrompt } from "./prompts.js";
import { callBharatCodeModel } from "./llmClient.js";
import { validateStoryboard } from "./validator.js";
import { generateFallbackStoryboard } from "./fallbackStoryboard.js";

export async function generateStoryboard(skeleton: Skeleton): Promise<Storyboard> {
  console.log(`\n----------------------------------------------`);
  console.log(`  Step 2: Storyboard Generation (BharatCode LLM)`);
  console.log(`----------------------------------------------`);

  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(skeleton);

  let rawOutput = "";
  try {
    rawOutput = await callBharatCodeModel([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);

    const parsedJson = JSON.parse(rawOutput);
    const validation = validateStoryboard(parsedJson, skeleton);

    if (validation.isValid && validation.storyboard) {
      console.log(`✔ BharatCode Storyboard successfully validated!`);
      console.log(`  - Scenes: ${validation.storyboard.scenes.length}`);
      console.log(`  - Words: ${validation.storyboard.totalWordCount}`);
      console.log(`  - Estimated Duration: ~${validation.storyboard.estimatedDurationSec}s`);
      return validation.storyboard;
    }

    console.warn(`⚠️ BharatCode Storyboard failed grounding/schema validation:`);
    for (const err of validation.errors) {
      console.warn(`  - ${err}`);
    }
  } catch (error: any) {
    console.error(`❌ BharatCode API call failed: ${error.message}`);
  }

  // Graceful deterministic fallback
  console.log(`⚡ Activating Deterministic Fallback Storyboard...`);
  const fallback = generateFallbackStoryboard(skeleton);
  console.log(`✔ Fallback Storyboard generated successfully (${fallback.totalWordCount} words, ~${fallback.estimatedDurationSec}s).`);
  return fallback;
}

