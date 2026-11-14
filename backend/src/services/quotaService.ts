import fs from "node:fs";
import path from "node:path";
import { prisma, isDatabaseConfigured } from "../db/prisma.js";
import { CACHE_DIR } from "../config/env.js";

export interface DualQuotaDetails {
  freshRemaining: number;
  freshTotal: number;
  cachedRemaining: number;
  cachedTotal: number;
  resetDate: string;
}

interface UserQuotaRecord {
  userId: string;
  generationsCount: number;
  cachedViewsCount?: number;
  lastResetDate: string;
}

const DAILY_FRESH_LIMIT = 3;
const DAILY_CACHED_LIMIT = 10;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const MAX_REQUESTS_PER_WINDOW = 10;

const activeRenderLocks = new Set<string>();
const rateLimitMap = new Map<string, number[]>();

const CACHE_FILE = path.join(CACHE_DIR, "users_quota.json");

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

function loadQuotas(): Record<string, UserQuotaRecord> {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      return JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
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

/**
 * Ensures parent User record exists in PostgreSQL to satisfy Foreign Key constraints.
 */
async function ensureDbUser(userId: string): Promise<void> {
  if (!isDatabaseConfigured()) return;
  try {
    await prisma.user.upsert({
      where: { id: userId },
      create: { id: userId, name: userId },
      update: {},
    });
  } catch (err) {
    console.warn("[QuotaService] Failed to ensure DB User record:", err);
  }
}

export class QuotaService {
  static async getQuota(userId: string): Promise<DualQuotaDetails> {
    const today = getTodayString();

    if (isDatabaseConfigured()) {
      try {
        await ensureDbUser(userId);

        let record = await prisma.userQuota.findUnique({
          where: { userId },
        });

        if (!record || record.lastResetDate !== today) {
          record = await prisma.userQuota.upsert({
            where: { userId },
            create: {
              userId,
              dailyFreshLimit: DAILY_FRESH_LIMIT,
              usedFreshCount: 0,
              dailyCachedLimit: DAILY_CACHED_LIMIT,
              usedCachedCount: 0,
              lastResetDate: today,
            },
            update: {
              usedFreshCount: 0,
              usedCachedCount: 0,
              lastResetDate: today,
            },
          });
        }

        return {
          freshRemaining: Math.max(0, record.dailyFreshLimit - record.usedFreshCount),
          freshTotal: record.dailyFreshLimit,
          cachedRemaining: Math.max(0, record.dailyCachedLimit - record.usedCachedCount),
          cachedTotal: record.dailyCachedLimit,
          resetDate: record.lastResetDate,
        };
      } catch (err) {
        console.warn("[QuotaService] DB read failed, using fallback:", err);
      }
    }

    // Fallback: Local file storage
    const quotas = loadQuotas();
    const record = quotas[userId];

    if (!record || record.lastResetDate !== today) {
      return {
        freshRemaining: DAILY_FRESH_LIMIT,
        freshTotal: DAILY_FRESH_LIMIT,
        cachedRemaining: DAILY_CACHED_LIMIT,
        cachedTotal: DAILY_CACHED_LIMIT,
        resetDate: today,
      };
    }

    const freshUsed = record.generationsCount || 0;
    const cachedUsed = record.cachedViewsCount || 0;

    return {
      freshRemaining: Math.max(0, DAILY_FRESH_LIMIT - freshUsed),
      freshTotal: DAILY_FRESH_LIMIT,
      cachedRemaining: Math.max(0, DAILY_CACHED_LIMIT - cachedUsed),
      cachedTotal: DAILY_CACHED_LIMIT,
      resetDate: record.lastResetDate,
    };
  }

  static async canGenerateFresh(userId: string): Promise<{ allowed: boolean; remaining: number; reason?: string }> {
    const quota = await this.getQuota(userId);
    if (quota.freshRemaining <= 0) {
      return {
        allowed: false,
        remaining: 0,
        reason: `Daily Studio Generation limit of ${DAILY_FRESH_LIMIT} fresh videos reached. (You can still watch up to ${quota.cachedRemaining} Instant Verified Walkthroughs!)`,
      };
    }
    return { allowed: true, remaining: quota.freshRemaining };
  }

  static async canConsumeCached(userId: string): Promise<{ allowed: boolean; remaining: number; reason?: string }> {
    const quota = await this.getQuota(userId);
    if (quota.cachedRemaining <= 0) {
      return {
        allowed: false,
        remaining: 0,
        reason: `Daily Instant Walkthroughs limit of ${DAILY_CACHED_LIMIT} reached.`,
      };
    }
    return { allowed: true, remaining: quota.cachedRemaining };
  }

  static async consumeFreshCredit(userId: string): Promise<{ success: boolean; remaining: number }> {
    const today = getTodayString();

    if (isDatabaseConfigured()) {
      try {
        await ensureDbUser(userId);
        const updated = await prisma.userQuota.upsert({
          where: { userId },
          create: {
            userId,
            dailyFreshLimit: DAILY_FRESH_LIMIT,
            usedFreshCount: 1,
            dailyCachedLimit: DAILY_CACHED_LIMIT,
            usedCachedCount: 0,
            lastResetDate: today,
          },
          update: {
            usedFreshCount: { increment: 1 },
          },
        });
        return {
          success: true,
          remaining: Math.max(0, updated.dailyFreshLimit - updated.usedFreshCount),
        };
      } catch (err) {
        console.warn("[QuotaService] DB update failed, falling back:", err);
      }
    }

    const quotas = loadQuotas();
    const record = quotas[userId] || {
      userId,
      generationsCount: 0,
      cachedViewsCount: 0,
      lastResetDate: today,
    };

    if (record.lastResetDate !== today) {
      record.generationsCount = 0;
      record.cachedViewsCount = 0;
      record.lastResetDate = today;
    }

    record.generationsCount += 1;
    quotas[userId] = record;
    saveQuotas(quotas);

    return {
      success: true,
      remaining: Math.max(0, DAILY_FRESH_LIMIT - record.generationsCount),
    };
  }

  static async consumeCachedCredit(userId: string): Promise<{ success: boolean; remaining: number }> {
    const today = getTodayString();

    if (isDatabaseConfigured()) {
      try {
        await ensureDbUser(userId);
        const updated = await prisma.userQuota.upsert({
          where: { userId },
          create: {
            userId,
            dailyFreshLimit: DAILY_FRESH_LIMIT,
            usedFreshCount: 0,
            dailyCachedLimit: DAILY_CACHED_LIMIT,
            usedCachedCount: 1,
            lastResetDate: today,
          },
          update: {
            usedCachedCount: { increment: 1 },
          },
        });
        return {
          success: true,
          remaining: Math.max(0, updated.dailyCachedLimit - updated.usedCachedCount),
        };
      } catch (err) {
        console.warn("[QuotaService] DB update failed, falling back:", err);
      }
    }

    const quotas = loadQuotas();
    const record = quotas[userId] || {
      userId,
      generationsCount: 0,
      cachedViewsCount: 0,
      lastResetDate: today,
    };

    if (record.lastResetDate !== today) {
      record.generationsCount = 0;
      record.cachedViewsCount = 0;
      record.lastResetDate = today;
    }

    record.cachedViewsCount = (record.cachedViewsCount || 0) + 1;
    quotas[userId] = record;
    saveQuotas(quotas);

    return {
      success: true,
      remaining: Math.max(0, DAILY_CACHED_LIMIT - record.cachedViewsCount),
    };
  }

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

  static releaseAllRenderLocks(): void {
    activeRenderLocks.clear();
  }

  static checkRateLimit(key: string): { allowed: boolean; retryAfterSec?: number } {
    const now = Date.now();

    // Occasional cleanup sweep if rateLimitMap grows large
    if (rateLimitMap.size > 200) {
      for (const [k, timestamps] of rateLimitMap.entries()) {
        const valid = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
        if (valid.length === 0) {
          rateLimitMap.delete(k);
        } else {
          rateLimitMap.set(k, valid);
        }
      }
    }

    const timestamps = rateLimitMap.get(key) || [];
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
