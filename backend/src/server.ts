import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pipelineRouter } from "./routes/pipelineRoutes.js";
import { userRouter } from "./routes/userRoutes.js";
import { videoRouter } from "./routes/videoRoutes.js";
import { repoRouter } from "./routes/repoRoutes.js";
import { QuotaService } from "./services/quotaService.js";
import { config } from "./config/env.js";

dotenv.config();

const app = express();
const PORT = config.PORT || 5001;

// Global Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-user-id", "Range"],
    exposedHeaders: ["Content-Range", "Accept-Ranges", "Content-Length"],
  })
);
app.use(express.json({ limit: "10mb" }));

// Health Check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "gitvideo-backend",
    nodeEnv: config.NODE_ENV,
  });
});

// Mount Routes
app.use("/api/pipeline", pipelineRouter);
app.use("/api/user", userRouter);
app.use("/api/video", videoRouter);
app.use("/api/repo", repoRouter);

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[ServerError]", err);
  if (res.headersSent) return;
  res.status(err.status || 500).json({
    error: err.name || "InternalServerError",
    message: err.message || "An unexpected error occurred",
  });
});

// Start Server
const server = app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 GitVideo Backend API Server running on port ${PORT}`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🩺 Health: http://localhost:${PORT}/api/health`);
  console.log(`======================================================\n`);
});

// Graceful Shutdown
const cleanup = () => {
  console.log("\n🛑 Gracefully shutting down GitVideo API server...");
  QuotaService.releaseAllRenderLocks();
  server.close(() => {
    console.log("✔ Server closed cleanly.");
    process.exit(0);
  });
  setTimeout(() => process.exit(0), 3000);
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
