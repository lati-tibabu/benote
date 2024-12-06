const { mindmap_item } = require("../models");

// Create
const createMindmapItem = async (req, res) => {
    try {
        const _mindmapItem = await mindmap_item.create(req.body);
        res.status(201).json(_mindmapItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Read all
const readMindmapItems = async (req, res) => {
    try {
        const _mindmapItems = await mindmap_item.findAll();
        res.json(_mindmapItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Read one
const readMindmapItem = async (req, res) => {
    try {
        const _mindmapItem = await mindmap_item.findByPk(req.params.id);
        if (_mindmapItem) {
            res.json(_mindmapItem);
        } else {
            res.status(404).json({ message: "Mindmap item not found!" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update
const updateMindmapItem = async (req, res) => {
    try {
        const _mindmapItem = await mindmap_item.findByPk(req.params.id);
        if (_mindmapItem) {
            await _mindmapItem.update(req.body);
            const updatedMindmapItem = { ..._mindmapItem.get() };
            res.json(updatedMindmapItem);
        } else {
            res.status(404).json({ message: "Mindmap item not found!" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete
const deleteMindmapItem = async (req, res) => {
    try {
        const _mindmapItem = await mindmap_item.findByPk(req.params.id);
        if (_mindmapItem) {
            await _mindmapItem.destroy();
            res.json({ message: "Mindmap item successfully deleted!" });
        } else {
            res.status(404).json({ message: "Mindmap item not found!" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createMindmapItem,
    readMindmapItems,
    readMindmapItem,
    updateMindmapItem,
    deleteMindmapItem,
};
