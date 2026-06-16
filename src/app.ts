import express from "express";
import cors from "cors";
import { corsOptions } from "./config/cors";
import { helmetConfig } from "./config/helmet";
import { requestLogger } from "./config/morgan";
import { apiRoutes } from "./routes";
import { healthRoutes } from "./routes/health.routes";
import { razorpayWebhook } from "./controller/membership.controller";
import { errorHandler } from "./middleware/error";

export const app = express();

// Security + logging
app.use(helmetConfig);
app.use(cors(corsOptions));
app.use(requestLogger);

// Razorpay webhook — JSON parser se PEHLE (raw body chahiye signature verify ke liye).
app.post(
  "/api/membership/webhook",
  express.raw({ type: "application/json" }),
  razorpayWebhook
);

// Normal JSON parsing (webhook ke baad).
app.use(express.json({ limit: "1mb" }));

// Health check (no auth)
app.use("/health", healthRoutes);

// Saare API routes
app.use("/api", apiRoutes);

// 404 — koi route match nahi hua
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Central error handler — sabse aakhir me.
app.use(errorHandler);
