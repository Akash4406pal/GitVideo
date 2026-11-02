import { config } from "../config/env.js";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function callBharatCodeModel(
  messages: ChatMessage[],
  maxRetries = 2
): Promise<string> {
  const baseUrl = config.BHARATCODE_BASE_URL.replace(/\/+$/, "");
  const url = `${baseUrl}/chat/completions`;
  const apiKey = config.BHARATCODE_API_KEY;

  if (!apiKey) {
    throw new Error("Cannot call BharatCode API: BHARATCODE_API_KEY is not set in environment.");
  }

  const payload = {
    model: config.BHARATCODE_MODEL,
    messages,
    temperature: 0.2, // Low temperature for deterministic JSON output
    max_tokens: 3000,
  };

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[BharatCode] Invoking model '${config.BHARATCODE_MODEL}' (Attempt ${attempt}/${maxRetries})...`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60-second timeout

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status} from BharatCode API: ${errorText}`);
      }

      const data = (await response.json()) as any;
      const content = data?.choices?.[0]?.message?.content;

      if (!content || typeof content !== "string") {
        throw new Error("Empty or malformed completion received from BharatCode API");
      }

      return cleanJsonResponse(content);
    } catch (err: any) {
      lastError = err;
      console.warn(`[BharatCode] Attempt ${attempt} failed: ${err.message}`);
      if (attempt < maxRetries) {
        const backoffMs = attempt * 2000;
        console.log(`[BharatCode] Retrying in ${backoffMs / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }
  }

  throw lastError || new Error("Failed to call BharatCode model after retries");
}

/**
 * Extracts and sanitizes valid JSON content from raw LLM output,
 * stripping markdown code fences or conversational text.
 */
function cleanJsonResponse(raw: string): string {
  let cleaned = raw.trim();

  // Strip ```json ... ``` fences
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\r?\n?/i, "");
    cleaned = cleaned.replace(/\r?\n?```$/i, "");
  }

  // If still not starting with {, search for outermost JSON object boundaries
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  return cleaned.trim();
}

