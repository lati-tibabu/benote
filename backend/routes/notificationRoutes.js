const express = require("express");
const router = express.Router();

const notificationController = require("../controllers/notificationControllers");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware.authMiddleware);

router.post("/", notificationController.createNotification);
router.get("/", notificationController.readNotifications);
router.get("/unread-count", notificationController.getUnreadNotificationCount);
router.put("/read-all", notificationController.markAllNotificationsAsRead);
router.put("/:id/read", notificationController.markNotificationAsRead);
router.get("/:id", notificationController.readNotification);
router.put("/:id", notificationController.updateNotification);
router.delete("/:id", notificationController.deleteNotification);

module.exports = router;
