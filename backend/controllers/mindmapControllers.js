const { mindmap } = require("../models");

// Create
const createMindmap = async (req, res) => {
    try {
        const _mindmap = await mindmap.create(req.body);
        res.status(201).json(_mindmap);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Read all
const readMindmaps = async (req, res) => {
    try {
        const _mindmaps = await mindmap.findAll();
        res.json(_mindmaps);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Read one
const readMindmap = async (req, res) => {
    try {
        const _mindmap = await mindmap.findByPk(req.params.id);
        if (_mindmap) {
            res.json(_mindmap);
        } else {
            res.status(404).json({ message: "Mindmap not found!" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update
const updateMindmap = async (req, res) => {
    try {
        const _mindmap = await mindmap.findByPk(req.params.id);
        if (_mindmap) {
            await _mindmap.update(req.body);
            const updatedMindmap = { ..._mindmap.get() };
            res.json(updatedMindmap);
        } else {
            res.status(404).json({ message: "Mindmap not found!" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete
const deleteMindmap = async (req, res) => {
    try {
        const _mindmap = await mindmap.findByPk(req.params.id);
        if (_mindmap) {
            await _mindmap.destroy();
            res.json({ message: "Mindmap successfully deleted!" });
        } else {
            res.status(404).json({ message: "Mindmap not found!" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createMindmap,
    readMindmaps,
    readMindmap,
    updateMindmap,
    deleteMindmap,
};
