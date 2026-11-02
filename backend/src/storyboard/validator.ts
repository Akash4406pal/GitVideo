import { StoryboardSchema, type Storyboard } from "../types/storyboard.js";
import type { Skeleton } from "../types/skeleton.js";

export interface ValidationResult {
  isValid: boolean;
  storyboard?: Storyboard;
  errors: string[];
}

export function validateStoryboard(rawJson: unknown, skeleton: Skeleton): ValidationResult {
  const errors: string[] = [];

  // 1. Zod Schema Validation
  const zodResult = StoryboardSchema.safeParse(rawJson);
  if (!zodResult.success) {
    for (const issue of zodResult.error.issues) {
      errors.push(`Schema Error [${issue.path.join(".")}] ${issue.message}`);
    }
    return { isValid: false, errors };
  }

  const storyboard = zodResult.data;

  // Build lookup sets from skeleton
  const validFileIds = new Set(skeleton.files.map((f) => f.id));
  const validSnippetIds = new Set(skeleton.snippets.map((s) => s.id));

  // 2. Grounding Verification
  let computedWords = 0;

  for (const scene of storyboard.scenes) {
    for (const segment of scene.segments) {
      // Count words
      const words = segment.text.trim().split(/\s+/).filter(Boolean).length;
      computedWords += words;

      // Verify fileId if provided
      if (segment.focus.fileId && !validFileIds.has(segment.focus.fileId)) {
        errors.push(`Grounding Error: Scene '${scene.id}' references unknown fileId '${segment.focus.fileId}'`);
      }

      // Verify snippetId if provided
      if (segment.focus.snippetId && !validSnippetIds.has(segment.focus.snippetId)) {
        errors.push(`Grounding Error: Scene '${scene.id}' references unknown snippetId '${segment.focus.snippetId}'`);
      }
    }
  }

  // Recalculate duration & word stats
  storyboard.totalWordCount = computedWords;
  storyboard.estimatedDurationSec = Math.max(30, Math.round(computedWords / 2.3));

  if (computedWords < 60) {
    errors.push(`Pacing Warning: Storyboard is too short (${computedWords} words). Target is 120-180 words.`);
  }

  return {
    isValid: errors.length === 0,
    storyboard: errors.length === 0 ? storyboard : undefined,
    errors,
  };
}

