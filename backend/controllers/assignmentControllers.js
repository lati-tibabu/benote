const { assignment } = require("../models");

// Create
const createAssignment = async (req, res) => {
  const userId = req.user.id;

  try {
    const _assignment = await assignment.create({
      ...req.body,
      created_by: userId,
    });
    res.status(201).json(_assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Read
readAssignments = async (req, res) => {
  const { classroomId, page = 1, pageSize = 10, search = "" } = req.query;

  try {
    const limit = parseInt(pageSize);
    const offset = (parseInt(page) - 1) * limit;

    const whereClause = {
      classroom_id: classroomId,
    };

    if (search) {
      whereClause.title = { [Op.like]: `%${search}%` };
    }

    const { count, rows: _assignments } = await assignment.findAndCountAll({
      where: whereClause,
      limit: limit,
      offset: offset,
    });

    res.json({
      assignments: _assignments,
      totalItems: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const readAssignment = async (req, res) => {
  try {
    const _assignment = await assignment.findByPk(req.params.id);
    if (_assignment) {
      res.json(_assignment);
    } else {
      res.status(404).json({ message: "assignment not found!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update

const updateAssignment = async (req, res) => {
  try {
    const _assignment = await assignment.findByPk(req.params.id);
    if (_assignment) {
      await _assignment.update(req.body);
      const updatedassignment = { ..._assignment.get() };
      res.json(updatedassignment);
    } else {
      res.status(404).json({ message: "assignment not found1" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete

const deleteAssignment = async (req, res) => {
  try {
    const _assignment = await assignment.findByPk(req.params.id);
    if (_assignment) {
      await _assignment.destroy();
      res.json({ message: "assignment succesfully deleted" });
    } else {
      res.status(404).json({ message: "assignment not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAssignment,
  readAssignments,
  readAssignment,
  updateAssignment,
  deleteAssignment,
};
