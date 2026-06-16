import { app } from "./app";
import { env } from "./config/env";
import { connectDB, disconnectDB } from "./config/db";
import { disconnectRedis } from "./config/redis";
import { logger } from "./config/winston";
import { startMembershipExpiryCron } from "./cron/membershipExpiry.cron";

const start = async () => {
  // DB connect pehle — fail ho to abhi pata chale.
  await connectDB();

  // Midnight membership expiry cron.
  startMembershipExpiryCron();

  const server = app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
  });

  // Graceful shutdown — connections clean band karo.
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received, shutting down...`);
    server.close(async () => {
      await disconnectDB();
      await disconnectRedis();
      logger.info("Shutdown complete");
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};

start().catch((error) => {
  console.error("START ERROR:", error);
  process.exit(1);
});
