import { StoryboardSchema, type Storyboard } from "../types/storyboard.js";
import type { Skeleton } from "../types/skeleton.js";

export interface ValidationResult {
  isValid: boolean;
  storyboard?: Storyboard;
  errors: string[];
  warnings: string[];
}

export function validateStoryboard(rawJson: unknown, skeleton: Skeleton): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Zod Schema Validation
  const zodResult = StoryboardSchema.safeParse(rawJson);
  if (!zodResult.success) {
    for (const issue of zodResult.error.issues) {
      errors.push(`Schema Error [${issue.path.join(".")}] ${issue.message}`);
    }
    return { isValid: false, errors, warnings };
  }

  const storyboard = zodResult.data;

  // Build lookup sets from skeleton
  const validFileIds = new Set(skeleton.files.map((f) => f.id));
  const validSnippetIds = new Set(skeleton.snippets.map((s) => s.id));
  const fallbackFileId = skeleton.files[0]?.id;
  const fallbackSnippetId = skeleton.snippets[0]?.id;

  // 2. Grounding Verification & Auto-Healing
  let computedWords = 0;

  for (const scene of storyboard.scenes) {
    for (const segment of scene.segments) {
      // Count words
      const words = segment.text.trim().split(/\s+/).filter(Boolean).length;
      computedWords += words;

      // Auto-heal fileId if LLM hallucinated an invalid ID
      if (segment.focus.fileId && !validFileIds.has(segment.focus.fileId)) {
        warnings.push(`Auto-healing unknown fileId '${segment.focus.fileId}' to '${fallbackFileId || "none"}' in scene '${scene.id}'`);
        segment.focus.fileId = fallbackFileId;
      }

      // Auto-heal snippetId if LLM hallucinated an invalid ID
      if (segment.focus.snippetId && !validSnippetIds.has(segment.focus.snippetId)) {
        warnings.push(`Auto-healing unknown snippetId '${segment.focus.snippetId}' to '${fallbackSnippetId || "none"}' in scene '${scene.id}'`);
        segment.focus.snippetId = fallbackSnippetId;
      }
    }
  }

  // Recalculate duration & word stats
  storyboard.totalWordCount = computedWords;
  storyboard.estimatedDurationSec = Math.max(30, Math.round(computedWords / 2.3));

  if (computedWords < 35) {
    errors.push(`Pacing Error: Storyboard is critically short (${computedWords} words). Minimum viable script is 35 words.`);
  } else if (computedWords < 70) {
    warnings.push(`Pacing Notice: Storyboard is on the punchy side (${computedWords} words). Target range is 70-110 words.`);
  }

  return {
    isValid: errors.length === 0,
    storyboard: errors.length === 0 ? storyboard : undefined,
    errors,
    warnings,
  };
}
