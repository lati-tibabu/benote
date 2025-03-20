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
const readNotifications = async (req, res) => {
  try {
    const receiver_id = req.user.id;
    const _notifications = await notification.findAll({
      attributes: ["id", "message", "type", "action", "createdAt"],
      order: [["createdAt", "DESC"]],
      where: { receiver_id: receiver_id },
    });
    res.json(_notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const readNotification = async (req, res) => {
  try {
    const _notification = await notification.findByPk(req.params.id);
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
    const _notification = await notification.findByPk(req.params.id);
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
    const _notification = await notification.findByPk(req.params.id);
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

module.exports = {
  createNotification,
  readNotifications,
  readNotification,
  updateNotification,
  deleteNotification,
};
