import dotenv from "dotenv";
import { z } from "zod";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// backend directory is always two levels up from src/config or dist/config
export const BACKEND_DIR = path.resolve(__dirname, "../..");

// Look for .env in current directory, backend directory, or relative to this source file
const envCandidates = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "backend", ".env"),
  path.resolve(BACKEND_DIR, ".env"),
  path.resolve(BACKEND_DIR, "..", ".env"),
];

for (const candidate of envCandidates) {
  if (fs.existsSync(candidate)) {
    dotenv.config({ path: candidate });
    break;
  }
}

const EnvSchema = z.object({
  PORT: z.coerce.number().default(5001),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  BHARATCODE_API_KEY: z.string().default(""),
  BHARATCODE_BASE_URL: z.string().url().default("https://bharatcode.ai/api/model/v1"),
  BHARATCODE_MODEL: z.string().default("qwen-3.8-27b"),
  DATABASE_URL: z.string().optional().default(""),
  TTS_VOICE: z.string().default("en-US-ChristopherNeural"),
  CACHE_DIR: z.string().default(path.join(BACKEND_DIR, ".cache")),
  OUTPUT_DIR: z.string().default(path.join(BACKEND_DIR, "dist")),
});

function loadConfig() {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    console.warn("⚠️ Environment configuration warning:");
    for (const issue of parsed.error.issues) {
      console.warn(`  - ${issue.path.join(".")}: ${issue.message}`);
    }
  }

  const raw = parsed.success ? parsed.data : {
    PORT: Number(process.env.PORT) || 5001,
    NODE_ENV: (process.env.NODE_ENV as any) || "development",
    BHARATCODE_API_KEY: process.env.BHARATCODE_API_KEY || "",
    BHARATCODE_BASE_URL: process.env.BHARATCODE_BASE_URL || "https://bharatcode.ai/api/model/v1",
    BHARATCODE_MODEL: process.env.BHARATCODE_MODEL || "qwen-3.8-27b",
    DATABASE_URL: process.env.DATABASE_URL || "",
    TTS_VOICE: process.env.TTS_VOICE || "en-US-ChristopherNeural",
    CACHE_DIR: process.env.CACHE_DIR || path.join(BACKEND_DIR, ".cache"),
    OUTPUT_DIR: process.env.OUTPUT_DIR || path.join(BACKEND_DIR, "dist"),
  };

  // Ensure CACHE_DIR and OUTPUT_DIR are resolved to absolute paths
  const resolvedCache = path.isAbsolute(raw.CACHE_DIR)
    ? raw.CACHE_DIR
    : path.resolve(BACKEND_DIR, raw.CACHE_DIR);
  const resolvedOutput = path.isAbsolute(raw.OUTPUT_DIR)
    ? raw.OUTPUT_DIR
    : path.resolve(BACKEND_DIR, raw.OUTPUT_DIR);

  return {
    ...raw,
    CACHE_DIR: resolvedCache,
    OUTPUT_DIR: resolvedOutput,
  };
}

export const config = loadConfig();
export const DIST_DIR = config.OUTPUT_DIR;
export const CACHE_DIR = config.CACHE_DIR;
