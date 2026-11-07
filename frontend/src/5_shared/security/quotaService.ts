import fs from "node:fs";
import path from "node:path";

interface UserQuotaRecord {
  userId: string;
  generationsCount: number;
  lastResetDate: string; // YYYY-MM-DD
}

const DAILY_LIMIT = 3;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const MAX_REQUESTS_PER_WINDOW = 5;

// In-memory runtime tracking
const activeRenderLocks = new Set<string>();
const rateLimitMap = new Map<string, number[]>(); // key -> array of timestamps

const CACHE_FILE = path.resolve(process.cwd(), ".cache", "users_quota.json");

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

function loadQuotas(): Record<string, UserQuotaRecord> {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const raw = fs.readFileSync(CACHE_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch {}
  return {};
}

function saveQuotas(data: Record<string, UserQuotaRecord>): void {
  try {
    const dir = path.dirname(CACHE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch {}
}

export class QuotaAndSecurityService {
  /**
   * Get quota details for a user.
   */
  static getQuota(userId: string): { remaining: number; total: number; resetDate: string } {
    const today = getTodayString();
    const quotas = loadQuotas();
    const record = quotas[userId];

    if (!record || record.lastResetDate !== today) {
      return {
        remaining: DAILY_LIMIT,
        total: DAILY_LIMIT,
        resetDate: today,
      };
    }

    const remaining = Math.max(0, DAILY_LIMIT - record.generationsCount);
    return {
      remaining,
      total: DAILY_LIMIT,
      resetDate: record.lastResetDate,
    };
  }

  /**
   * Check if a user has sufficient credits to generate a video.
   */
  static canGenerate(userId: string): { allowed: boolean; remaining: number; reason?: string } {
    const quota = this.getQuota(userId);
    if (quota.remaining <= 0) {
      return {
        allowed: false,
        remaining: 0,
        reason: `Daily quota of ${DAILY_LIMIT} video generations reached. Limit resets at 00:00 UTC.`,
      };
    }
    return { allowed: true, remaining: quota.remaining };
  }

  /**
   * Consume 1 generation credit for a user.
   */
  static consumeCredit(userId: string): { success: boolean; remaining: number } {
    const today = getTodayString();
    const quotas = loadQuotas();

    const record = quotas[userId] || {
      userId,
      generationsCount: 0,
      lastResetDate: today,
    };

    if (record.lastResetDate !== today) {
      record.generationsCount = 0;
      record.lastResetDate = today;
    }

    if (record.generationsCount >= DAILY_LIMIT) {
      return { success: false, remaining: 0 };
    }

    record.generationsCount += 1;
    quotas[userId] = record;
    saveQuotas(quotas);

    return {
      success: true,
      remaining: Math.max(0, DAILY_LIMIT - record.generationsCount),
    };
  }

  /**
   * Concurrency Lock: Prevents a user from running 2 heavy Remotion renders simultaneously.
   */
  static acquireRenderLock(userId: string): boolean {
    if (activeRenderLocks.has(userId)) {
      return false;
    }
    activeRenderLocks.add(userId);
    return true;
  }

  static releaseRenderLock(userId: string): void {
    activeRenderLocks.delete(userId);
  }

  /**
   * Sliding window rate limiter (max 5 requests per 5 minutes).
   */
  static checkRateLimit(key: string): { allowed: boolean; retryAfterSec?: number } {
    const now = Date.now();
    const timestamps = rateLimitMap.get(key) || [];

    // Filter out timestamps outside the sliding window
    const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

    if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
      const oldest = recent[0];
      const retryAfterSec = Math.ceil((oldest + RATE_LIMIT_WINDOW_MS - now) / 1000);
      return { allowed: false, retryAfterSec };
    }

    recent.push(now);
    rateLimitMap.set(key, recent);
    return { allowed: true };
  }
}

