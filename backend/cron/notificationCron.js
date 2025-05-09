const cron = require("node-cron");
const { notifyUpcomingDeadlines } = require("../services/taskDeadlineService");
const {
  notifyUpcomingStudyPlan,
} = require("../services/studyPlanApproachingService");

// the following cron job runs every 5 minutes
cron.schedule("*/5 * * * *", async () => {
  console.log("🔔 Running scheduled deadline check...");
  try {
    await notifyUpcomingDeadlines();
    await notifyUpcomingStudyPlan();
  } catch (error) {
    console.error("Cron job failed:", error.message);
  }
});
