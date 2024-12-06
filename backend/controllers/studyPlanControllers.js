const { study_plan } = require("../models");

// Create
const createStudyPlan = async (req, res) => {
    try {
        const _studyPlan = await study_plan.create(req.body);
        res.status(201).json(_studyPlan);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Read all
const readStudyPlans = async (req, res) => {
    try {
        const _studyPlans = await study_plan.findAll();
        res.json(_studyPlans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Read one
const readStudyPlan = async (req, res) => {
    try {
        const _studyPlan = await study_plan.findByPk(req.params.id);
        if (_studyPlan) {
            res.json(_studyPlan);
        } else {
            res.status(404).json({ message: "Study plan not found!" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update
const updateStudyPlan = async (req, res) => {
    try {
        const _studyPlan = await study_plan.findByPk(req.params.id);
        if (_studyPlan) {
            await _studyPlan.update(req.body);
            const updatedStudyPlan = { ..._studyPlan.get() };
            res.json(updatedStudyPlan);
        } else {
            res.status(404).json({ message: "Study plan not found!" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete
const deleteStudyPlan = async (req, res) => {
    try {
        const _studyPlan = await study_plan.findByPk(req.params.id);
        if (_studyPlan) {
            await _studyPlan.destroy();
            res.json({ message: "Study plan successfully deleted!" });
        } else {
            res.status(404).json({ message: "Study plan not found!" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createStudyPlan,
    readStudyPlans,
    readStudyPlan,
    updateStudyPlan,
    deleteStudyPlan,
};
