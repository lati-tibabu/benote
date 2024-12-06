const { workspace } = require("../models");

// Create
const createWorkspace = async (req, res) => {
    try {
        const _workspace = await workspace.create(req.body);
        res.status(201).json(_workspace);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

// Read
const readWorkspaces = async (req, res) => {
    try {
        const _workspaces = await workspace.findAll();
        res.json(_workspaces);
    } catch (error) {
        res.status(500).json({message: error.message});        
    }
}

const readWorkspace = async (req, res) => {
    try {
        const _workspace = await workspace.findByPk(req.params.id);
        if (_workspace){
            res.json(_workspace);
        } else{
        res.status(404).json({message: 'Workspace not found!'});
        }
    } catch (error) {
        res.status(500).json({message: error.message}); 
    }
}

// Update

const updateWorkspace = async (req, res) => {
    try {
        const _workspace = await workspace.findByPk(req.params.id);
        if (_workspace){
            await _workspace.update(req.body)
            const updatedWorkspace = {..._workspace.get()}
            res.json(updatedWorkspace)
        } else {
            res.status(404).json({message: 'Workspace not found1'});
        }
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

// Delete

const deleteWorkspace = async (req, res) => {
    try {
        const _workspace = await workspace.findByPk(req.params.id);
        if(_workspace){
            await _workspace.destroy();
            res.json({message: 'Workspace succesfully deleted'});
        } else {
            res.status(404).json({message: 'Workspace not found'});
        }
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

module.exports = {
    createWorkspace,
    readWorkspaces,
    readWorkspace,
    updateWorkspace,
    deleteWorkspace
}