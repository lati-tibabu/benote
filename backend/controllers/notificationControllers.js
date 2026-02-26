const { notification } = require("../models");

// Create
const createNotification = async (req, res) => {
  try {
    const _notification = await notification.create(req.body);
    res.status(201).json(_notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Read
// const readNotifications = async (req, res) => {
//   try {
//     const receiver_id = req.user.id;
//     const _notifications = await notification.findAll({
//       attributes: ["id", "message", "type", "action", "createdAt"],
//       order: [["createdAt", "DESC"]],
//       where: { receiver_id: receiver_id },
//     });
//     res.json(_notifications);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

const readNotifications = async (req, res) => {
  const { latest } = req.query; // Check if 'latest' query parameter is present
  if (latest) {
    return readLatestNotification(req, res); // Call the function to get the latest notification
  }
  try {
    const receiver_id = req.user.id;
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const offset = (page - 1) * limit;

    // Fetch notifications with pagination
    const { count, rows: notifications } = await notification.findAndCountAll({
      attributes: ["id", "message", "type", "action", "createdAt", "is_read"],
      order: [["createdAt", "DESC"]],
      where: { receiver_id },
      limit,
      offset,
    });

    res.json({
      total: count,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(count / limit)),
      notifications,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const readLatestNotification = async (req, res) => {
  try {
    const receiver_id = req.user.id;

    const latestNotification = await notification.findOne({
      where: { receiver_id, is_read: false },
      attributes: ["id", "message", "type", "action", "createdAt", "is_read"],
      order: [["createdAt", "DESC"]],
    });

    if (!latestNotification) {
      // Avoid sending unnecessary responses when no notifications exist
      return res.status(204).send(); // 204 No Content
    }

    res.json(latestNotification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUnreadNotificationCount = async (req, res) => {
  try {
    const receiver_id = req.user.id;

    const count = await notification.count({
      where: {
        receiver_id,
        is_read: false,
      },
    });

    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const readNotification = async (req, res) => {
  try {
    const _notification = await notification.findOne({
      where: {
        id: req.params.id,
        receiver_id: req.user.id,
      },
    });
    if (_notification) {
      res.json(_notification);
    } else {
      res.status(404).json({ message: "notification not found!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update

const updateNotification = async (req, res) => {
  try {
    const _notification = await notification.findOne({
      where: {
        id: req.params.id,
        receiver_id: req.user.id,
      },
    });
    if (_notification) {
      await _notification.update(req.body);
      const updatednotification = { ..._notification.get() };
      res.json(updatednotification);
    } else {
      res.status(404).json({ message: "notification not found1" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete

const deleteNotification = async (req, res) => {
  try {
    const _notification = await notification.findOne({
      where: {
        id: req.params.id,
        receiver_id: req.user.id,
      },
    });
    if (_notification) {
      await _notification.destroy();
      res.json({ message: "notification succesfully deleted" });
    } else {
      res.status(404).json({ message: "notification not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const receiver_id = req.user.id;
    const _notification = await notification.findOne({
      where: {
        id: req.params.id,
        receiver_id,
      },
    });
    if (!_notification) {
      return res.status(404).json({ message: "notification not found!" });
    }

    await _notification.update({ is_read: true });
    res.json({ message: "Notification marked as read", id: _notification.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markAllNotificationsAsRead = async (req, res) => {
  try {
    const receiver_id = req.user.id;
    const [updatedCount] = await notification.update(
      { is_read: true },
      {
        where: {
          receiver_id,
          is_read: false,
        },
      }
    );
    res.json({
      message: "All notifications marked as read",
      updatedCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createNotification,
  readNotifications,
  readNotification,
  updateNotification,
  deleteNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
  // readLatestNotification,
};
