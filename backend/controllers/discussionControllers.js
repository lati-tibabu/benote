const { discussion } = require("../models");

// Create
const createDiscussion = async (req, res) => {
  try {
    const _discussion = await discussion.create(req.body);
    res.status(201).json(_discussion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Read all
const readDiscussions = async (req, res) => {
  try {
    const _discussions = await discussion.findAll();
    res.json(_discussions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Read one
const readDiscussion = async (req, res) => {
  try {
    const _discussion = await discussion.findByPk(req.params.id);
    if (_discussion) {
      res.json(_discussion);
    } else {
      res.status(404).json({ message: "Discussion not found!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update
const updateDiscussion = async (req, res) => {
  try {
    const _discussion = await discussion.findByPk(req.params.id);
    if (_discussion) {
      await _discussion.update(req.body);
      const updatedDiscussion = { ..._discussion.get() };
      res.json(updatedDiscussion);
    } else {
      res.status(404).json({ message: "Discussion not found!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete
const deleteDiscussion = async (req, res) => {
  try {
    const _discussion = await discussion.findByPk(req.params.id);
    if (_discussion) {
      await _discussion.destroy();
      res.json({ message: "Discussion successfully deleted!" });
    } else {
      res.status(404).json({ message: "Discussion not found!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createDiscussion,
  readDiscussions,
  readDiscussion,
  updateDiscussion,
  deleteDiscussion,
};
