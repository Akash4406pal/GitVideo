import { Router, type Request, type Response } from "express";
import { QuotaService } from "../services/quotaService.js";

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

