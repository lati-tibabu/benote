
const { task, workspace, user } = require("../models");

// Create
const createTask = async (req, res) => {
    try {
        const _task = await task.create(req.body);
        res.status(201).json(_task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Read all
const readTasks = async (req, res) => {
    try {
        const _tasks = await task.findAll({
            include: [
                {
                    model: workspace, 
                    as: 'workspace',
                    required: false,
                    attributes: ['id', 'name']
                },
                {
                    model: user,
                    as: 'user',
                    required: false,
                    attributes: ['id', 'name', 'email']
                }
            ]
        });
        res.json(_tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Read one
const readTask = async (req, res) => {
    try {
        const _task = await task.findByPk(req.params.id, {
            include: [
                {
                    model: workspace, 
                    as: 'workspace',
                    required: false,
                    attributes: ['id', 'name']
                },
                {
                    model: user,
                    as: 'user',
                    required: false,
                    attributes: ['id', 'name', 'email']
                }
            ]
        });
        if (_task) {
            res.json(_task);
        } else {
            res.status(404).json({ message: "Task not found!" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update
const updateTask = async (req, res) => {
    try {
        const _task = await task.findByPk(req.params.id);
        if (_task) {
            await _task.update(req.body);
            const updatedTask = { ..._task.get() };
            res.json(updatedTask);
        } else {
            res.status(404).json({ message: "Task not found!" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete
const deleteTask = async (req, res) => {
    try {
        const _task = await task.findByPk(req.params.id);
        if (_task) {
            await _task.destroy();
            res.json({ message: "Task successfully deleted!" });
        } else {
            res.status(404).json({ message: "Task not found!" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createTask,
    readTasks,
    readTask,
    updateTask,
    deleteTask,
};
