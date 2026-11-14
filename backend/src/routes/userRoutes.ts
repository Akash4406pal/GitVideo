import { Router, type Request, type Response } from "express";
import { QuotaService } from "../services/quotaService.js";
import { prisma, isDatabaseConfigured } from "../db/prisma.js";

export const userRouter = Router();

userRouter.get("/quota", async (req: Request, res: Response) => {
  const userId = req.headers["x-user-id"]?.toString() || "dev_user";
  const quota = await QuotaService.getQuota(userId);

  return res.json({
    authenticated: true,
    ...quota,
    remaining: quota.freshRemaining,
    total: quota.freshTotal,
  });
});

userRouter.post("/sync", async (req: Request, res: Response) => {
  const { id, name, email, image, provider } = req.body;
  const effectiveId = id || req.headers["x-user-id"]?.toString();

  if (!effectiveId) {
    return res.status(400).json({ error: "Missing user ID" });
  }

  if (isDatabaseConfigured()) {
    try {
      await prisma.user.upsert({
        where: { id: effectiveId },
        update: {
          name: name || undefined,
          email: email || undefined,
          image: image || undefined,
          provider: provider || undefined,
        },
        create: {
          id: effectiveId,
          name: name || null,
          email: email || null,
          image: image || null,
          provider: provider || null,
        },
      });
    } catch (err) {
      console.warn(`[UserRoutes] Failed to sync user ${effectiveId}:`, err);
    }
  }

  const quota = await QuotaService.getQuota(effectiveId);
  return res.json({
    status: "ok",
    userId: effectiveId,
    quota,
  });
});


