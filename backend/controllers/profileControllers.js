const { profile, user } = require("../models");

// Create a new profile
const createProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const existingProfile = await profile.findOne({
      where: { userId: userId },
    });

    if (existingProfile) {
      return res.status(400).json({ error: "User already has a profile" });
    }

    const _profile = await profile.create({ ...req.body, userId: userId });
    res.status(201).json(_profile);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Read (get) a single profile by ID
const getProfileById = async (req, res) => {
  try {
    const userId = req.user.id;
    const _profile = await profile.findByPk(req.params.id);
    if (!_profile) return res.status(404).json({ error: "Profile not found" });
    res.json(_profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Read (get) a single profile for current user
const getProfileForUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const _profile = await profile.findOne({
      where: { userId: userId },
      include: [
        {
          model: user,
          as: "user",
          attributes: ["name", "email"],
        },
      ],
    });
    if (!_profile) return res.status(404).json({ error: "Profile not found" });
    res.json(_profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Read all profiles
const getAllProfiles = async (req, res) => {
  const requestType = req.query.type || "";
  if (requestType === "me") {
    return getProfileForUser(req, res);
  }
  try {
    const _profiles = await profile.findAll();
    res.json(_profiles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a profile by ID
const updateProfile = async (req, res) => {
  try {
    const [updated] = await profile.update(req.body, {
      where: { id: req.params.id },
    });

    if (updated) {
      const updatedProfile = await profile.findByPk(req.params.id);
      res.json(updatedProfile);
    } else {
      res.status(404).json({ error: "Profile not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a profile by ID
const deleteProfile = async (req, res) => {
  try {
    const deleted = await profile.destroy({ where: { id: req.params.id } });
    if (deleted) {
      res.json({ message: "Profile deleted successfully" });
    } else {
      res.status(404).json({ error: "Profile not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createProfile,
  getProfileById,
  getAllProfiles,
  updateProfile,
  deleteProfile,
};
