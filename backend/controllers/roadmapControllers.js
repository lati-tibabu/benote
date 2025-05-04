const { where } = require("sequelize");
const { roadmap, roadmap_item, sequelize } = require("../models");

// Create
const createRoadmap = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized!" });
    }
    const newRoadmap = await roadmap.create(
      {
        ...req.body,
        created_by: userId,
      },
      { transaction: t }
    );

    await roadmap_item.create(
      {
        title: "Start",
        description: "Start Here",
        status: "",
        roadmap_id: newRoadmap.id,
      },
      { transaction: t }
    );

    await t.commit();
    res.status(201).json(newRoadmap);
  } catch (error) {
    await t.rollback();
    return res
      .status(500)
      .json({ message: "Failed to create roadmap.", error: error.message });
  }
};

// Read all
const readRoadmaps = async (req, res) => {
  const userId = req.user.id;
  const { workspaceId } = req.query;
  try {
    const _roadmaps = await roadmap.findAll({
      where: {
        created_by: userId,
        workspace_id: workspaceId,
      },
    });
    res.json(_roadmaps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Read one
const readRoadmap = async (req, res) => {
  try {
    const userId = req.user.id;

    const _roadmap = await roadmap.findByPk(req.params.id, {
      where: {
        created_by: userId,
      },
      include: [
        {
          model: roadmap_item,
          as: "roadmap_items",
        },
      ],
    });

    if (_roadmap) {
      res.json(_roadmap);
    } else {
      res.status(404).json({ message: "Roadmap not found!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update
const updateRoadmap = async (req, res) => {
  try {
    const _roadmap = await roadmap.findByPk(req.params.id);
    if (_roadmap) {
      await _roadmap.update(req.body);
      const updatedRoadmap = { ..._roadmap.get() };
      res.json(updatedRoadmap);
    } else {
      res.status(404).json({ message: "Roadmap not found!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete
const deleteRoadmap = async (req, res) => {
  try {
    const _roadmap = await roadmap.findByPk(req.params.id);
    if (_roadmap) {
      await _roadmap.destroy();
      res.json({ message: "Roadmap successfully deleted!" });
    } else {
      res.status(404).json({ message: "Roadmap not found!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRoadmap,
  readRoadmaps,
  readRoadmap,
  updateRoadmap,
  deleteRoadmap,
};
