const { assignment } = require("../models");

// Create
const createAssignment = async (req, res) => {
    try {
        const _assignment = await assignment.create(req.body);
        res.status(201).json(_assignment);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

// Read
const readAssignments = async (req, res) => {
    try {
        const _assignments = await assignment.findAll();
        res.json(_assignments);
    } catch (error) {
        res.status(500).json({message: error.message});        
    }
}

const readAssignment = async (req, res) => {
    try {
        const _assignment = await assignment.findByPk(req.params.id);
        if (_assignment){
            res.json(_assignment);
        } else{
        res.status(404).json({message: 'assignment not found!'});
        }
    } catch (error) {
        res.status(500).json({message: error.message}); 
    }
}

// Update

const updateAssignment = async (req, res) => {
    try {
        const _assignment = await assignment.findByPk(req.params.id);
        if (_assignment){
            await _assignment.update(req.body)
            const updatedassignment = {..._assignment.get()}
            res.json(updatedassignment)
        } else {
            res.status(404).json({message: 'assignment not found1'});
        }
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

// Delete

const deleteAssignment = async (req, res) => {
    try {
        const _assignment = await assignment.findByPk(req.params.id);
        if(_assignment){
            await _assignment.destroy();
            res.json({message: 'assignment succesfully deleted'});
        } else {
            res.status(404).json({message: 'assignment not found'});
        }
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

module.exports = {
    createAssignment,
    readAssignments,
    readAssignment,
    updateAssignment,
    deleteAssignment
}