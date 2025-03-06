const { note, workspace_membership, team_membership, user } = require("../models");

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
        const directMembership = await workspace_membership.findOne({
            where: {
                user_id: userId,
                workspace_id: workspaceId
            }
        });

        const userTeams = await team_membership.findAll({
            where: {
                user_id: userId
            }, 
            attributes: ['team_id']
        });

        const team_membership_array = userTeams.map(team => team.team_id);

        const teamMembership = team_membership_array.length > 0
            ? await workspace_membership.findOne({
                where: {
                    workspace_id: workspaceId,
                    team_id: team_membership_array
                }
            })
            : null; // No team membership if the array is empty

        if (!directMembership && !teamMembership) {
            res.status(403).json('You are not a member of this workspace');
        } else {
            const _notes = await note.findAll({
                where: {
                    workspace_id: workspaceId
                },
                attributes: ['id', 'title', 'createdAt', 'updatedAt'],
                include: [{
                    model: user,
                    attributes: ['name'],
                    as: "user",
                }]
            });
            res.json(_notes);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Read one
const readNote = async (req, res) => {
    const userId = req.user ? req.user.id : null;
    const workspaceId = req.params.workspace_id;

    try {
        // Fetch the note first
        const _note = await note.findByPk(req.params.id);

        if (!_note) {
            return res.status(404).json({ message: "Note not found!" });
        }

        // If the note is public, allow access
        if (_note.public) {
            return res.json(_note);
        }

        // If the note is private, check for workspace membership
        if (!userId) {
            return res.status(403).json("Unauthorized access");
        }

        const directMembership = await workspace_membership.findOne({
            where: {
                user_id: userId,
                workspace_id: workspaceId
            }
        });

        const userTeams = await team_membership.findAll({
            where: {
                user_id: userId
            },
            attributes: ['team_id']
        });

        const team_membership_array = userTeams.map(team => team.team_id);

        const teamMembership = await workspace_membership.findOne({
            where: {
                workspace_id: workspaceId,
                team_id: team_membership_array.length > 0 ? team_membership_array : null
            }
        });

        if (!directMembership && !teamMembership) {
            return res.status(403).json("You are not a member of this workspace");
        }

        res.json(_note);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// read published public notes
const readPublicNote = async (req, res) => {
    try {
        const noteId = req.params.id;

        // Fetch the note by ID
        const _note = await note.findByPk(noteId, {
            attributes: ['id', 'title', 'content', 'public', 'createdAt'],
            include: [
                {
                    model: user, 
                    as: 'user', 
                    attributes: ['id', 'name', 'email']
                }
            ]
        });

        if (!_note || !_note.public) {
            return res.status(404).json({ message: "Public note not found!" });
        }

        res.json(_note);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const publishNote = async (req, res) => {
    const userId = req.user ? req.user.id : null;
    const noteId = req.params.id;
    const workspaceId = req.params.workspace_id;

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized access" });
    }

    try {
        const _note = await note.findByPk(noteId);

        if (!_note) {
            return res.status(404).json({ message: "Note not found!" });
        }

        // Check if the user is a direct workspace member
        const directMembership = await workspace_membership.findOne({
            where: {
                user_id: userId,
                workspace_id: workspaceId
            }
        });

        if (!directMembership) {
            return res.status(403).json({ message: "You are not a member of this workspace" });
        }

        // Check if the user is the creator of the note
        if (_note.owned_by !== userId) {
            return res.status(403).json({ message: "You are not allowed to publish this note" });
        }

        // Update the note to be public
        await _note.update({ public: true });

        res.json({ message: "Note published successfully", note: _note });
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
    publishNote,
    readPublicNote
};
