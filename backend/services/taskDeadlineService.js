const { Op } = require("sequelize");
const { task } = require("../models");
const { sendNotification } = require("./notificationService"); // Assumes you already have this

const notifyUpcomingDeadlines = async () => {
  try {
    const now = new Date();

    const timeFrames = [
      { label: "in 1 day", ms: 24 * 60 * 60 * 1000 },
      { label: "in 12 hours", ms: 12 * 60 * 60 * 1000 },
      { label: "in 6 hours", ms: 6 * 60 * 60 * 1000 },
      { label: "in 1 hour", ms: 60 * 60 * 1000 },
      { label: "in 30 minutes", ms: 30 * 60 * 1000 },
      { label: "in 10 minutes", ms: 10 * 60 * 1000 },
    ];

    for (const frame of timeFrames) {
      const targetTime = new Date(now.getTime() + frame.ms);

      const tasksDue = await task.findAll({
        where: {
          due_date: {
            [Op.between]: [
              new Date(targetTime.getTime() - 2.5 * 60 * 1000),
              new Date(targetTime.getTime() + 2.5 * 60 * 1000),
            ],
          },
          is_archived: false,
          status: { [Op.not]: "done" },
        },
      });

      for (const t of tasksDue) {
        if (t.assigned_to) {
          await sendNotification({
            message: `Reminder: Task "${t.title}" is due ${frame.label}.`,
            type: "warning",
            receiver_id: t.assigned_to,
            sender_id: null,
            action: { taskId: t.id },
          });
        }
      }
    }

    console.log("✅ Deadline notifications checked and sent.");
  } catch (error) {
    console.error("❌ Error in notifyUpcomingDeadlines:", error.message);
  }
};

module.exports = { notifyUpcomingDeadlines };
