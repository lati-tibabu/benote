const bcrypt = require("bcryptjs");
const { user, workspace, workspace_membership } = require("../models");

// Create
const createUser = async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const userData = {
      name: req.body.name,
      email: req.body.email,
      password_hash: await bcrypt.hash(req.body.password, salt),
      role: "user",
    };
    // const _user = await user.create(req.body);
    const _user = await user.create(userData);
    res.status(201).json(_user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Read
const readUsers = async (req, res) => {
  try {
    const users = await user.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const readUser = async (req, res) => {
  try {
    const _user = await user.findByPk(req.params.id);
    if (_user) {
      res.json(_user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//read user by email
const readUserByEmail = async (req, res) => {
  try {
    const _user = await user.findOne({
      where: { email: req.body.email },
      attributes: ["id", "name", "email"],
    });
    if (_user) {
      res.json(_user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update
const updateUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const _user = await user.findByPk(userId);

    if (!_user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const updatePassword = req.query.updatePassword;

    if (updatePassword) {
      if (_user.password_hash === null) {
        return res.status(403).json({
          message: "Password not set, most probably auth by Google",
        });
      }
      const passwordData = req.body;

      if (!passwordData) {
        return res
          .status(400)
          .json({ message: "Password data is haha required" });
      }

      const isValidPassword = await bcrypt.compare(
        passwordData.currentPassword,
        _user.password_hash
      );
      if (!isValidPassword) {
        return res
          .status(403)
          .json({ message: "Current password is incorrect" });
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        return res.status(403).json({ message: "Passwords do not match" });
      }

      const salt = await bcrypt.genSalt(10);
      const newPassword = await bcrypt.hash(passwordData.newPassword, salt);
      await _user.update({ password_hash: newPassword });
      return res.json({ message: "Password updated successfully" });
    }

    await _user.update(req.body);
    const updatedUser = { ..._user.get() }; // Use `.get()` to get raw data excluding Sequelize methods
    res.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete
const deleteUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const _user = await user.findByPk(userId);
    if (!_user) {
      return res.status(404).json({ message: "User not found!" });
    }

    try {
      await _user.destroy();
    } catch (destroyError) {
      return res.status(500).json({ message: destroyError.message });
    }

    try {
      await workspace_membership.destroy({ where: { user_id: userId } });
    } catch (membershipError) {
      console.error("Error destroying workspace memberships:", membershipError);
      return res
        .status(500)
        .json({ message: "Failed to delete workspace memberships." });
    }
    res.status(200).json({ message: "User deleted!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fetch all minimal related data for the current user
const getUserOverview = async (req, res) => {
  try {
    const userId = req.user.id;
    // Dynamically require all models to avoid circular dependencies
    const models = require("../models");
    const _user = await user.findByPk(userId, {
      attributes: [],
      include: [
        {
          model: models.workspace,
          as: "workspace",
          attributes: ["id", "name", "description"],
        },

        {
          model: models.team,
          as: "teams",
          attributes: ["id", "name"],
          through: { attributes: [] },
        },
        {
          model: models.notification,
          as: "receivedNotifications",
          attributes: ["id", "message", "type", "createdAt"],
        },
        { model: models.roadmap, as: "roadmaps", attributes: ["id", "title"] },
        {
          model: models.classroom,
          as: "classrooms",
          attributes: ["id", "name"],
        },
        {
          model: models.study_plan,
          as: "study_plans",
          attributes: ["id", "title"],
        },
        {
          model: models.task,
          as: "tasks",
          attributes: ["id", "title", "status"],
        },
      ],
    });
    if (!_user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(_user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// getting other models for the user
const getWorkspaces = async (req, res) => {
  try {
    const _workspaces = await findByPk(req.params.id, {
      include: [
        {
          model: workspace,
          as: "workspace",
          attributes: ["name, description"],
        },
      ],
    });
  } catch (error) {}
};

module.exports = {
  createUser,
  readUsers,
  readUserByEmail,
  readUser,
  updateUser,
  deleteUser,
  getUserOverview,
};
