const { roadmap } = require("../models");

// Create
const createRoadmap = async (req, res) => {
    try {
        const _roadmap = await roadmap.create(req.body);
        res.status(201).json(_roadmap);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Read all
const readRoadmaps = async (req, res) => {
    try {
        const _roadmaps = await roadmap.findAll();
        res.json(_roadmaps);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Read one
const readRoadmap = async (req, res) => {
    try {
        const _roadmap = await roadmap.findByPk(req.params.id);
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
