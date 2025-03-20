const { roadmap_item } = require("../models");

// Create
const createRoadmapItem = async (req, res) => {
  try {
    const _roadmapItem = await roadmap_item.create(req.body);
    res.status(201).json(_roadmapItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Read all
const readRoadmapItems = async (req, res) => {
  try {
    const _roadmapItems = await roadmap_item.findAll();
    res.json(_roadmapItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Read one
const readRoadmapItem = async (req, res) => {
  try {
    const _roadmapItem = await roadmap_item.findByPk(req.params.id);
    if (_roadmapItem) {
      res.json(_roadmapItem);
    } else {
      res.status(404).json({ message: "Roadmap item not found!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update
const updateRoadmapItem = async (req, res) => {
  try {
    const _roadmapItem = await roadmap_item.findByPk(req.params.id);
    if (_roadmapItem) {
      await _roadmapItem.update(req.body);
      const updatedRoadmapItem = { ..._roadmapItem.get() };
      res.json(updatedRoadmapItem);
    } else {
      res.status(404).json({ message: "Roadmap item not found!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete
const deleteRoadmapItem = async (req, res) => {
  try {
    const _roadmapItem = await roadmap_item.findByPk(req.params.id);
    if (_roadmapItem) {
      await _roadmapItem.destroy();
      res.json({ message: "Roadmap item successfully deleted!" });
    } else {
      res.status(404).json({ message: "Roadmap item not found!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRoadmapItem,
  readRoadmapItems,
  readRoadmapItem,
  updateRoadmapItem,
  deleteRoadmapItem,
};
