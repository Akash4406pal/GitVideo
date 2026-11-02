import dotenv from "dotenv";
import { z } from "zod";

// Load .env
dotenv.config();

const EnvSchema = z.object({
  BHARATCODE_API_KEY: z.string().min(1, "BHARATCODE_API_KEY is required in .env"),
  BHARATCODE_BASE_URL: z.string().url().default("https://bharatcode.ai/api/model/v1"),
  BHARATCODE_MODEL: z.string().default("qwen-3.8-27b"),
  CACHE_DIR: z.string().default("./.cache"),
  OUTPUT_DIR: z.string().default("./dist"),
});

function loadConfig() {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    console.warn("⚠️ Environment configuration warning:");
    for (const issue of parsed.error.issues) {
      console.warn(`  - ${issue.path.join(".")}: ${issue.message}`);
    }
    return {
      BHARATCODE_API_KEY: process.env.BHARATCODE_API_KEY || "",
      BHARATCODE_BASE_URL: process.env.BHARATCODE_BASE_URL || "https://bharatcode.ai/api/model/v1",
      BHARATCODE_MODEL: process.env.BHARATCODE_MODEL || "qwen-3.8-27b",
      CACHE_DIR: process.env.CACHE_DIR || "./.cache",
      OUTPUT_DIR: process.env.OUTPUT_DIR || "./dist",
    };
  }
  return parsed.data;
}

export const config = loadConfig();

