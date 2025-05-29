const { assignment, user, classroom } = require("../models");
const { sendNotification } = require("../services/notificationService");

// Create
const createAssignment = async (req, res) => {
  const userId = req.user.id;
  const classroomId = req.body.classroom_id;

  try {
    const _assignment = await assignment.create({
      ...req.body,
      created_by: userId,
    });

    const classroomExists = await classroom.findByPk(classroomId);
    if (!classroomExists) {
      return res.status(404).json({ message: "Classroom not found" });
    }
    const studentsInClassroom = await classroom.findByPk(classroomId, {
      attributes: ["name"],
      include: [{ model: user, as: "students", attributes: ["id"] }],
    });

    const userIdsSet = new Set();

    for (const student of studentsInClassroom.students) {
      userIdsSet.add(student.id);
    }

    const message = `Assignment has been added in the classroom ${studentsInClassroom.name}. Please check it out`;
    for (const receiver_id of userIdsSet) {
      await sendNotification({
        message,
        type: "info",
        receiver_id,
        sender_id: null,
        action: { assignmentId: _assignment.id, classroom: classroomId },
      });
    }

    res.status(201).json(_assignment);
  } catch (error) {
    res.status(500).json({ message: "shitty error", error: error.message });
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

// read all assignments in a classroom user is student animationTimingFunction:
const readAllAssignmentsInClassroom = async (req, res) => {
  const userId = req.user.id;

  try {
    const data = await user.findByPk(userId, {
      attributes: [],
      include: [
        {
          model: classroom,
          as: "enrolledClassrooms",
          attributes: ["id", "name"],
          include: [
            {
              model: assignment,
              as: "assignments",
              attributes: [
                "id",
                "title",
                "description",
                "due_date",
                "classroom_id",
              ],
            },
          ],
          // raw: true,
        },
      ],
    });
    res.json(data);
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
  readAllAssignmentsInClassroom,
};
