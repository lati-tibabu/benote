const { time_block } = require("../models");

// Create
const createTimeBlock = async (req, res) => {
    try {
        const _timeBlock = await time_block.create(req.body);
        res.status(201).json(_timeBlock);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Read all
const readTimeBlocks = async (req, res) => {
    try {
        const _timeBlocks = await time_block.findAll();
        res.json(_timeBlocks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Read one
const readTimeBlock = async (req, res) => {
    try {
        const _timeBlock = await time_block.findByPk(req.params.id);
        if (_timeBlock) {
            res.json(_timeBlock);
        } else {
            res.status(404).json({ message: "Time block not found!" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update
const updateTimeBlock = async (req, res) => {
    try {
        const _timeBlock = await time_block.findByPk(req.params.id);
        if (_timeBlock) {
            await _timeBlock.update(req.body);
            const updatedTimeBlock = { ..._timeBlock.get() };
            res.json(updatedTimeBlock);
        } else {
            res.status(404).json({ message: "Time block not found!" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete
const deleteTimeBlock = async (req, res) => {
    try {
        const _timeBlock = await time_block.findByPk(req.params.id);
        if (_timeBlock) {
            await _timeBlock.destroy();
            res.json({ message: "Time block successfully deleted!" });
        } else {
            res.status(404).json({ message: "Time block not found!" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createTimeBlock,
    readTimeBlocks,
    readTimeBlock,
    updateTimeBlock,
    deleteTimeBlock,
};
