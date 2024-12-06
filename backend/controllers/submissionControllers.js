const { submission } = require("../models");

// Create
const createSubmission = async (req, res) => {
    try {
        const _submission = await submission.create(req.body);
        res.status(201).json(_submission);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Read all
const readSubmissions = async (req, res) => {
    try {
        const _submissions = await submission.findAll();
        res.json(_submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Read one
const readSubmission = async (req, res) => {
    try {
        const _submission = await submission.findByPk(req.params.id);
        if (_submission) {
            res.json(_submission);
        } else {
            res.status(404).json({ message: "Submission not found!" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update
const updateSubmission = async (req, res) => {
    try {
        const _submission = await submission.findByPk(req.params.id);
        if (_submission) {
            await _submission.update(req.body);
            const updatedSubmission = { ..._submission.get() };
            res.json(updatedSubmission);
        } else {
            res.status(404).json({ message: "Submission not found!" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete
const deleteSubmission = async (req, res) => {
    try {
        const _submission = await submission.findByPk(req.params.id);
        if (_submission) {
            await _submission.destroy();
            res.json({ message: "Submission successfully deleted!" });
        } else {
            res.status(404).json({ message: "Submission not found!" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createSubmission,
    readSubmissions,
    readSubmission,
    updateSubmission,
    deleteSubmission,
};
