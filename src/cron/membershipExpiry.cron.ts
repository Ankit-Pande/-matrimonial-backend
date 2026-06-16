import cron from "node-cron";
import { prisma } from "../config/db";
import { logger } from "../config/winston";

// Roz raat 12:00 baje (server timezone) — jin users ka premium expire ho gaya
// unka isPremium false. authCheck me bhi safety check hai, ye bulk cleanup hai.
//
// IST chahiye to server TZ=Asia/Kolkata set karein (deploy env me),
// ya yahan timezone option de sakte hain.
export const startMembershipExpiryCron = () => {
  cron.schedule(
    "0 0 * * *",
    async () => {
      try {
        const result = await prisma.user.updateMany({
          where: {
            isPremium: true,
            subscriptionExpiresAt: { lt: new Date() },
          },
          data: { isPremium: false },
        });
        if (result.count > 0) {
          logger.info(`Membership expiry cron: ${result.count} downgraded`);
        }
      } catch (error) {
        logger.error("Membership expiry cron failed", { error });
      }
    },
    { timezone: "Asia/Kolkata" }
  );

  logger.info("Membership expiry cron scheduled (daily 00:00 IST)");
};
