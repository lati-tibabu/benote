// services/notificationService.js

const { notification } = require("../models");
// const { io, users } = require("../server"); // from server.js

async function sendNotification({
  message,
  type,
  receiver_id,
  sender_id,
  action,
}) {
  try {
    // Save to DB
    const notif = await notification.create({
      message: message,
      type: type,
      receiver_id: receiver_id,
      sender_id: sender_id,
      action: action,
    });

    // Emit via socket
    // const receiverSocketId = users.get(receiver_id);
    // if (receiverSocketId) {
    //   io.to(receiverSocketId).emit("notification", {
    //     id: notif.id,
    //     message: notif.message,
    //     type: notif.type,
    //     action: notif.action,
    //     createdAt: notif.createdAt,
    //     sender_id,
    //   });
    // }

    return notif;
  } catch (err) {
    console.error("Error sending notification:", err);
    throw err;
  }
}

module.exports = { sendNotification };
