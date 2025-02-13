const { note, workspace_membership } = require("../models");

// Create
const createNote = async (req, res) => {
    try {
        const _note = await note.create(req.body);
        res.status(201).json(_note);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Read all
const readNotes = async (req, res) => {
    const userId = req.user.id;
    const workspaceId = req.params.workspace_id;

    try {
        const is_member = await workspace_membership.findOne({
            where: {
                user_id: userId,
                workspace_id: workspaceId
            }});
        if (!is_member) {
            res.status(403).json('You are not a member of this workspace')
        } else{
            const _notes = await note.findAll(
                {
                    where: {
                        workspace_id: workspaceId
                    },
                    attributes:['id', 'title']
                }
            );
            res.json(_notes);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const readNotesS = async (req, res) => {
    try {
        const _notes = await note.findAll(
            {
                where: {
                    workspace_id: req.params.workspace_id
                }
            }
        );
        res.json(_notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Read one
const readNote = async (req, res) => {
    const userId = req.user.id;
    const workspaceId = req.params.workspace_id;

    try {
        const is_member = await workspace_membership.findOne({
            where: {
                user_id: userId,
                workspace_id: workspaceId
            }
        });
        
        if(!is_member){
            res.status(403).json('You are not a member of this workspace');
        } else{
            const _note = await note.findByPk(req.params.id);
            if (_note) {
                res.json(_note);
            } else {
                res.status(404).json({ message: "note not found!" });
            }
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update
const updateNote = async (req, res) => {
    try {
        const _note = await note.findByPk(req.params.id);
        if (_note) {
            await _note.update(req.body);
            const updatednote = { ..._note.get() };
            res.json(updatednote);
        } else {
            res.status(404).json({ message: "note not found!" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete
const deleteNote = async (req, res) => {
    try {
        const _note = await note.findByPk(req.params.id);
        if (_note) {
            await _note.destroy();
            res.json({ message: "note successfully deleted!" });
        } else {
            res.status(404).json({ message: "note not found!" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createNote,
    readNotes,
    readNote,
    updateNote,
    deleteNote,
};
