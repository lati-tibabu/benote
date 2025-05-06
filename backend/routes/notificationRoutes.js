const express = require("express");
const router = express.Router();

const notificationController = require("../controllers/notificationControllers");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware.authMiddleware);

router.post("/", notificationController.createNotification);
router.get("/", notificationController.readNotifications);
router.get("/unread-count", notificationController.getUnreadNotificationCount); // ✅ added route
router.get("/:id", notificationController.readNotification);
router.put("/:id", notificationController.updateNotification);
router.delete("/:id", notificationController.deleteNotification);
// router.get("/unread", notificationController.readLatestNotification);

module.exports = router;
