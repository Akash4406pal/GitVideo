import type { Skeleton } from "../types/skeleton.js";
import type { Storyboard } from "../types/storyboard.js";
import { buildSystemPrompt, buildUserPrompt } from "./prompts.js";
import { callBharatCodeModel } from "./llmClient.js";
import { validateStoryboard } from "./validator.js";
import { generateFallbackStoryboard } from "./fallbackStoryboard.js";
import { repairAndParseJson } from "./jsonRepair.js";

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

    let parsedJson: any;
    try {
      parsedJson = repairAndParseJson(rawOutput);
    } catch (parseErr: any) {
      console.warn(`[BharatCode] JSON parse & repair error: ${parseErr.message}`);
      console.warn(`[BharatCode] Raw LLM response snippet (last 300 chars):\n${rawOutput.slice(-300)}`);
      throw parseErr;
    }
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

