const { classroom, user } = require("../models");

const createClassroom = async (req, res) => {
  try {
    const _classroom = await classroom.create(req.body);
    res.status(201).json(_classroom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const readClassrooms = async (req, res) => {
  const requestType = req.query.requestType || "created";
  const userId = req.user.id;

  if (requestType === "joined") {
    try {
      const student = await user.findByPk(userId, {
        include: [
          {
            model: classroom,
            as: "enrolledClassrooms",
            attributes: ["id", "name", "description"],
          },
        ],
      });
      if (!student) {
        throw new Error("Student not found");
      }

      return res.json(student.enrolledClassrooms);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  try {
    const classrooms = await classroom.findAll({
      where: {
        teacher_id: userId,
      },
      include: [
        {
          model: user,
          as: "teacher",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    res.json(classrooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const readClassroom = async (req, res) => {
  try {
    const _classroom = await classroom.findByPk(req.params.id);
    if (_classroom) {
      res.json(_classroom);
    } else {
      res.status(404).json({ message: "classroom not found!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateClassroom = async (req, res) => {
  try {
    const _classroom = await classroom.findByPk(req.params.id);
    if (_classroom) {
      await _classroom.update(req.body);
      const updatedclassroom = { ..._classroom.get() };
      res.json(updatedclassroom);
    } else {
      res.status(404).json({ message: "classroom not found!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteClassroom = async (req, res) => {
  try {
    const _classroom = await classroom.findByPk(req.params.id);
    if (!_classroom) {
      res.status(404).json({ message: "classroom not found!" });
    } else {
      await _classroom.destroy();
      res.json({ message: "classroom deleted" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createClassroom,
  readClassrooms,
  readClassroom,
  updateClassroom,
  deleteClassroom,
};

const addStudentToClassroom = async (studentId, classroomId) => {
  const student = await user.findByPk(studentId);
  const classroom = await classroom.findByPk(classroomId);

  if (!student || !classroom) {
    throw new Error("Student or Classroom not found");
  }

  await student.addEnrolledClassroom(classroom); // Uses alias "enrolledClassrooms"
  console.log(`Student ${studentId} enrolled in Classroom ${classroomId}`);
};
