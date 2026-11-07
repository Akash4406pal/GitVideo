/**
 * Speech Sanitizer for TTS & Subtitles
 * 
 * Transforms technical code tokens, snake_case identifiers, file extensions,
 * and markdown artifacts into natural, articulate spoken English.
 * 
 * Strictly eliminates robotic utterances like "underscore", "open paren", or "Q one".
 */

export function sanitizeForSpeech(input: string): string {
  if (!input) return "";

  let text = input;

  // 1. Remove markdown code ticks and formatting symbols
  text = text.replace(/`([^`]+)`/g, "$1");
  text = text.replace(/\*\*([^*]+)\*\*/g, "$1");
  text = text.replace(/\*([^*]+)\*/g, "$1");

  // 2. Remove path prefixes like ./ or ../
  text = text.replace(/\.\/|\.\.\//g, "");

  // 3. Normalize file extensions cleanly into natural spoken phrases
  text = text.replace(/([a-zA-Z0-9_\-]+)\.sql\b/gi, "$1 SQL script");
  text = text.replace(/([a-zA-Z0-9_\-]+)\.tsx\b/gi, "$1 TSX component");
  text = text.replace(/([a-zA-Z0-9_\-]+)\.ts\b/gi, "$1 TypeScript file");
  text = text.replace(/([a-zA-Z0-9_\-]+)\.jsx\b/gi, "$1 JSX component");
  text = text.replace(/([a-zA-Z0-9_\-]+)\.js\b/gi, "$1 JavaScript file");
  text = text.replace(/([a-zA-Z0-9_\-]+)\.py\b/gi, "$1 Python script");
  text = text.replace(/([a-zA-Z0-9_\-]+)\.json\b/gi, "$1 JSON file");
  text = text.replace(/([a-zA-Z0-9_\-]+)\.md\b/gi, "$1 markdown document");

  // 4. Standalone file extension mentions
  text = text.replace(/\.sql\b/gi, " SQL ");
  text = text.replace(/\.tsx?\b/gi, " TypeScript ");
  text = text.replace(/\.jsx?\b/gi, " JavaScript ");
  text = text.replace(/\.py\b/gi, " Python ");

  // 5. Expand Q1, Q2, Q3 into Question 1, Question 2, Question 3
  text = text.replace(/\bQ(\d+)\b/g, "Question $1");
  text = text.replace(/\bq(\d+)\b/g, "question $1");

  // 6. Expand common mathematical & SQL functions into natural phrases
  text = text.replace(/\bSUM\s*\(\s*([^)]+)\s*\)/gi, "sum of $1");
  text = text.replace(/\bAVG\s*\(\s*([^)]+)\s*\)/gi, "average $1");
  text = text.replace(/\bCOUNT\s*\(\s*([^)]+)\s*\)/gi, "count of $1");
  text = text.replace(/\bROUND\s*\(\s*([^,)]+)(?:,[^)]+)?\s*\)/gi, "rounded $1");
  text = text.replace(/\bLIMIT\s+(\d+)\b/gi, "the top $1");

  // 7. Expand SQL / code comparisons into plain spoken words
  text = text.replace(/\s*(?:===|==|=)\s*(['"]?)([^'"\s,]+)\1/g, " equals $2");
  text = text.replace(/\s*(?:!==|!=)\s*(['"]?)([^'"\s,]+)\1/g, " does not equal $2");
  text = text.replace(/\s*>=\s*/g, " greater than or equal to ");
  text = text.replace(/\s*<=\s*/g, " less than or equal to ");
  text = text.replace(/\s*>\s*/g, " greater than ");
  text = text.replace(/\s*<\s*/g, " less than ");

  // 8. Replace ALL underscores everywhere with a clean space (e.g. git_video -> git video)
  text = text.replace(/_+/g, " ");

  // 9. Replace dashes in compound slug names (e.g. customer-trends -> customer trends)
  text = text.replace(/([a-zA-Z0-9])-([a-zA-Z0-9])/g, "$1 $2");

  // 10. Split camelCase identifiers (e.g. purchaseAmount -> purchase Amount)
  text = text.replace(/([a-z])([A-Z])/g, "$1 $2");

  // 11. Clean remaining parentheses, brackets, quotes, and colons
  text = text.replace(/::[a-zA-Z0-9_]+/g, ""); // strip typecasts like ::numeric
  text = text.replace(/[\(\)\[\]\{\}]/g, " ");
  text = text.replace(/['"]+/g, "");

  // 12. Expand symbols
  text = text.replace(/&/g, " and ");
  text = text.replace(/\s*\/\s*/g, " and ");
  text = text.replace(/->|=>/g, " feeds into ");

  // 13. Final whitespace and punctuation cleanup
  text = text.replace(/\s+,/g, ",");
  text = text.replace(/\s+\./g, ".");
  text = text.replace(/\s+/g, " ");

  return text.trim();
}
