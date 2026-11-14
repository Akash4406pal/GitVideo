import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { config } from "../config/env.js";

declare global {
  // eslint-disable-next-line no-var
  var globalPrisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var globalPgPool: Pool | undefined;
}

export const isDatabaseConfigured = (): boolean => {
  const url = config.DATABASE_URL || process.env.DATABASE_URL;
  return Boolean(url && url.trim() !== "" && !url.includes("placeholder"));
};

let cachedClient: PrismaClient | null = null;
let cachedPool: Pool | null = null;

function getPrismaClient(): PrismaClient | null {
  if (!isDatabaseConfigured()) {
    return null;
  }

  if (global.globalPrisma) {
    return global.globalPrisma;
  }

  if (!cachedClient) {
    try {
      const connectionString = config.DATABASE_URL || process.env.DATABASE_URL;
      cachedPool = new Pool({
        connectionString,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });

      const adapter = new PrismaPg(cachedPool);

      cachedClient = new PrismaClient({
        adapter,
        log: config.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
      });

      console.log("✔ [Prisma] Connected to PostgreSQL database via PrismaPg adapter.");
    } catch (err) {
      console.warn("[Prisma Backend] Client initialization failed:", err);
      return null;
    }

    if (config.NODE_ENV !== "production") {
      global.globalPrisma = cachedClient;
      global.globalPgPool = cachedPool;
    }
  }

  return cachedClient;
}

/**
 * Safe Prisma proxy: If DATABASE_URL is not set, queries safely resolve to null
 * rather than crashing the backend server.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop: string | symbol) {
    const client = getPrismaClient();
    if (!client) {
      return new Proxy(() => Promise.resolve(null), {
        get() {
          return () => Promise.resolve(null);
        },
        apply() {
          return Promise.resolve(null);
        },
      });
    }
    return (client as any)[prop];
  },
});
