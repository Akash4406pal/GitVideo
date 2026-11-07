/**
 * Robust JSON repair utility for LLM responses.
 * Handles common LLM JSON syntax issues:
 * 1. Markdown code fences (```json ... ```)
 * 2. Unbalanced brackets (e.g. LLM closing array with '}' instead of ']}')
 * 3. Trailing commas before '}' or ']'
 * 4. Unescaped control characters in string literals
 * 5. Premature truncation (auto-closing open structures)
 */

export function repairAndParseJson<T = any>(raw: string): T {
  let text = raw.trim();

  // 1. Strip markdown fences if present
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\r?\n?/i, "");
    text = text.replace(/\r?\n?```$/i, "");
  }

  // 2. Try direct parse first (fast path)
  try {
    return JSON.parse(text);
  } catch {
    // Proceed to repair
  }

  // 3. Extract JSON object boundaries if wrapped in conversational text
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    text = text.substring(firstBrace, lastBrace + 1);
  }

  // Fast path check again
  try {
    return JSON.parse(text);
  } catch {
    // Proceed to deeper structural repair
  }

  // 4. Tokenize and repair structural issues (mismatched brackets, trailing commas)
  const repaired = repairJsonStructure(text);
  try {
    return JSON.parse(repaired);
  } catch (err: any) {
    // One last attempt: strip trailing commas with regex
    const cleanedCommas = repaired.replace(/,\s*([}\]])/g, "$1");
    return JSON.parse(cleanedCommas);
  }
}

function repairJsonStructure(input: string): string {
  let output = "";
  const stack: ("{" | "[")[] = [];
  let inString = false;
  let escapeNext = false;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (inString) {
      if (escapeNext) {
        output += char;
        escapeNext = false;
      } else if (char === "\\") {
        output += char;
        escapeNext = true;
      } else if (char === '"') {
        output += char;
        inString = false;
      } else if (char === "\n") {
        output += "\\n";
      } else if (char === "\r") {
        output += "\\r";
      } else if (char === "\t") {
        output += "\\t";
      } else {
        output += char;
      }
      continue;
    }

    // Outside string
    if (char === '"') {
      inString = true;
      output += char;
    } else if (char === "{" || char === "[") {
      stack.push(char);
      output += char;
    } else if (char === "}") {
      if (stack.length > 0 && stack[stack.length - 1] === "[") {
        // Mismatched: expected ']' but got '}'
        // Insert missing ']' before '}'
        output += "]";
        stack.pop();
      }
      if (stack.length > 0 && stack[stack.length - 1] === "{") {
        stack.pop();
      }
      output += char;
    } else if (char === "]") {
      if (stack.length > 0 && stack[stack.length - 1] === "{") {
        // Mismatched: expected '}' but got ']'
        // Insert missing '}' before ']'
        output += "}";
        stack.pop();
      }
      if (stack.length > 0 && stack[stack.length - 1] === "[") {
        stack.pop();
      }
      output += char;
    } else {
      output += char;
    }
  }

  // Close any remaining unclosed structures at the end
  while (stack.length > 0) {
    const unclosed = stack.pop();
    if (unclosed === "{") {
      output += "}";
    } else if (unclosed === "[") {
      output += "]";
    }
  }

  return output;
}

