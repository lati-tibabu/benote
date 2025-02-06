const { task, workspace, user } = require("../models");
const allowedUpdates = ["title", "description", "status", "due_date", "assigned_to", "workspace_id", "is_archived"];

// Create
const createTask = async (req, res) => {
    try {
        if(req.body) {
            const _task = await task.create(req.body);
            res.status(201).json(_task);
        } else {
            res.status(400).json({ message: "Invalid task details!" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Read all
const readTasks = async (req, res) => {
    try {
        const _tasks = await task.findAll({
            where: {
                is_archived: false,
                workspace_id: req.params.id
            },
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

        if(!_tasks) {
            return res.status(404).json({ message: "No tasks found!" });
        }   
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

// Read all tasks assigned to a user
const readTasksAssignedToUser = async (req, res) => {
    try {
        const _tasks = await task.findAll({
            where: {
                assigned_to: req.params.id
            },
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

// Read all tasks assigned to a workspace
const readTasksAssignedToWorkspace = async (req, res) => {
    try {
        const _tasks = await task.findAll({
            where: {
                workspace_id: req.params.id
            },
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
    }catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Read archived tasks
const readArchivedTasks = async (req, res) => {
    try {
        const _tasks = await task.findAll({
            where: {
                is_archived: true,
                workspace_id: req.params.workspace_id
            },
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

// Archive task
const archiveTask = async (req, res) => {
    try {
        const _task = await task.findByPk(req.params.id);
        if(_task){
            await _task.update({ is_archived: true });
            res.json({ message: "Task successfully archived!" });
        } else {
            res.status(404).json({ message: "Task not found!" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Unarchive task 
const unarchiveTask = async (req, res) => {
    try {
        const _task = await task.findByPk(req.params.id);
        if(_task){
            await _task.update({ is_archived: false });
            res.json({ message: "Task successfully unarchived!" });
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
            await _task.update(req.body, { fields: allowedUpdates });
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
    readTasksAssignedToUser,
    readTasksAssignedToWorkspace,
    readArchivedTasks,
    archiveTask,
    unarchiveTask,
    updateTask,
    deleteTask,
};
