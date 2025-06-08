const {
  note,
  workspace_membership,
  team_membership,
  user,
} = require("../models");
const { Op } = require("sequelize"); // Import Op for Sequelize operators

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
        workspace_id: workspaceId,
      },
    });

    const userTeams = await team_membership.findAll({
      where: {
        user_id: userId,
      },
      attributes: ["team_id"],
    });

    const team_membership_array = userTeams.map((team) => team.team_id);

    const teamMembership =
      team_membership_array.length > 0
        ? await workspace_membership.findOne({
            where: {
              workspace_id: workspaceId,
              team_id: team_membership_array,
            },
          })
        : null; // No team membership if the array is empty

    if (!directMembership && !teamMembership) {
      res.status(403).json("You are not a member of this workspace");
    } else {
      const page = parseInt(req.query.page, 10) || 1;
      const pageSize = parseInt(req.query.pageSize, 10) || 10;
      const offset = (page - 1) * pageSize;

      const { count, rows: _notes } = await note.findAndCountAll({
        where: {
          workspace_id: workspaceId,
        },
        attributes: ["id", "title", "createdAt", "updatedAt"],
        include: [
          {
            model: user,
            attributes: ["name"],
            as: "user",
          },
        ],
        order: [["updatedAt", "DESC"]],
        limit: pageSize,
        offset: offset,
      });

      res.json({
        totalItems: count,
        totalPages: Math.ceil(count / pageSize),
        currentPage: page,
        pageSize: pageSize,
        notes: _notes,
      });
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
        workspace_id: workspaceId,
      },
    });

    const userTeams = await team_membership.findAll({
      where: {
        user_id: userId,
      },
      attributes: ["team_id"],
    });

    const team_membership_array = userTeams.map((team) => team.team_id);

    const teamMembership = await workspace_membership.findOne({
      where: {
        workspace_id: workspaceId,
        team_id:
          team_membership_array.length > 0 ? team_membership_array : null,
      },
    });

    if (!directMembership && !teamMembership) {
      return res.status(403).json("You are not a member of this workspace");
    }

    res.json(_note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchPublicNotes = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;
    const offset = (page - 1) * pageSize;
    const searchTerm = req.query.search || ""; // Get the search term from query parameters

    let whereCondition = {
      public: true, // Only retrieve public notes
    };

    // Add search condition if searchTerm is provided
    if (searchTerm) {
      whereCondition = {
        ...whereCondition, // Keep the public: true condition
        [Op.or]: [
          // Use OR operator to search in title or content
          { title: { [Op.iLike]: `%${searchTerm}%` } }, // Case-insensitive search for title
          { content: { [Op.iLike]: `%${searchTerm}%` } }, // Case-insensitive search for content
        ],
      };
    }

    const { count, rows: _notes } = await note.findAndCountAll({
      where: whereCondition, // Apply the constructed where condition
      attributes: ["id", "title", "content", "createdAt"],
      include: [
        {
          model: user,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
      limit: pageSize,
      offset: offset,
      order: [["updatedAt", "DESC"]], // Order by last updated
    });

    res.json({
      totalItems: count,
      totalPages: Math.ceil(count / pageSize),
      currentPage: page,
      pageSize: pageSize,
      notes: _notes,
    });
  } catch (error) {
    console.error("Error searching public notes:", error); // Log the error for debugging
    res.status(500).json({
      message: "Failed to search public notes.",
      error: error.message,
    });
  }
};

const readPublicNotes = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;
    const offset = (page - 1) * pageSize;

    const { count, rows: _notes } = await note.findAndCountAll({
      where: {
        public: true,
      },
      attributes: ["id", "title", "content", "createdAt"],
      include: [
        {
          model: user,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
      limit: pageSize,
      offset: offset,
      order: [["updatedAt", "DESC"]],
    });

    res.json({
      totalItems: count,
      totalPages: Math.ceil(count / pageSize),
      currentPage: page,
      pageSize: pageSize,
      notes: _notes,
    });
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
      attributes: ["id", "title", "content", "public", "createdAt"],
      include: [
        {
          model: user,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
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
        workspace_id: workspaceId,
      },
    });

    if (!directMembership) {
      return res
        .status(403)
        .json({ message: "You are not a member of this workspace" });
    }

    // Check if the user is the creator of the note
    if (_note.owned_by !== userId) {
      return res
        .status(403)
        .json({ message: "You are not allowed to publish this note" });
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
  readPublicNotes,
  readPublicNote,
  searchPublicNotes,
};
