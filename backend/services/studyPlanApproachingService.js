const { Op } = require("sequelize");
const { time_block } = require("../models");
const { sendNotification } = require("./notificationService"); // Assumes you already have this

const notifyUpcomingStudyPlan = async () => {
  try {
    const now = new Date();

    const timeFrames = [
      //   { label: "in 1 day", ms: 24 * 60 * 60 * 1000 },
      //   { label: "in 12 hours", ms: 12 * 60 * 60 * 1000 },
      //   { label: "in 6 hours", ms: 6 * 60 * 60 * 1000 },
      { label: "in 1 hour", ms: 60 * 60 * 1000 },
      { label: "in 30 minutes", ms: 30 * 60 * 1000 },
      { label: "in 10 minutes", ms: 10 * 60 * 1000 },
      { label: "in 5 minutes", ms: 5 * 60 * 1000 },
    ];

    for (const frame of timeFrames) {
      const targetTime = new Date(now.getTime() + frame.ms);

      const studyPlan = await time_block.findAll({
        where: {
          start_time: {
            [Op.between]: [
              new Date(targetTime.getTime() - 2.5 * 60 * 1000),
              new Date(targetTime.getTime() + 2.5 * 60 * 1000),
            ],
          },
          description: "This is study plan",
        },
      });

      for (const t of studyPlan) {
        if (t.user_id) {
          await sendNotification({
            message: `Reminder: Your plan to study "${t.job}" is to begin ${frame.label}.`,
            type: "study_plan",
            receiver_id: t.user_id,
            sender_id: null,
            action: { planId: t.id },
          });
        }
      }
    }

    console.log("✅ Study plan notifications checked and sent.");
  } catch (error) {
    console.error("❌ Error in notifyUpcomingStudyPlan:", error.message);
  }
};

module.exports = { notifyUpcomingStudyPlan };
