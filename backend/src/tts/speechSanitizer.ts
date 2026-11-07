/**
 * Speech Sanitizer for TTS & Subtitles
 * 
 * Transforms technical code tokens, snake_case identifiers, file extensions,
 * and markdown artifacts into natural, articulate spoken English.
 * 
 * Prevents TTS engines from literally saying "underscore", "dot slash", or "backtick".
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

  // 3. Normalize file extensions cleanly into spoken phrases
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

  // 5. Replace snake_case underscores with spaces (e.g. git_video -> git video)
  text = text.replace(/([a-zA-Z0-9])_([a-zA-Z0-9])/g, "$1 $2");
  text = text.replace(/_+/g, " ");

  // 6. Replace dashes in compound names (e.g. customer-trends -> customer trends)
  text = text.replace(/([a-zA-Z0-9])-([a-zA-Z0-9])/g, "$1 $2");

  // 7. Split camelCase identifiers (e.g. purchaseAmount -> purchase Amount)
  text = text.replace(/([a-z])([A-Z])/g, "$1 $2");

  // 8. Expand function parenthesis and common syntax for speech
  // e.g. SUM(purchase amount) -> SUM of purchase amount
  text = text.replace(/\b([A-Z]+)\(([^\)]+)\)/g, "$1 of $2");
  text = text.replace(/\(([^\)]+)\)/g, " $1 ");

  // 9. Expand common code symbols & operators
  text = text.replace(/\bQ(\d)\b/gi, "Query $1");
  text = text.replace(/&/g, " and ");
  text = text.replace(/\s*\/\s*/g, " and ");
  text = text.replace(/->|=>/g, " routes to ");
  text = text.replace(/::/g, " cast to ");

  // 10. Clean up extra punctuation, quotes, and whitespace
  text = text.replace(/['"]+/g, "");
  text = text.replace(/\s+/g, " ");

  return text.trim();
}
