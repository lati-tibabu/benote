const { classroom, user } = require("../models");
const { sendNotification } = require("../services/notificationService");

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
            include: [
              {
                model: user,
                as: "teacher",
                attributes: ["id", "name", "email"],
              },
            ],
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
        // {
        //   model: user,
        //   as: "students",
        //   attributes: ["id", "name", "email"],
        // },
      ],
    });

    res.json(classrooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const readClassroom = async (req, res) => {
  try {
    const userId = req.user.id;
    let isTeacher = false;

    const _classroom = await classroom.findByPk(req.params.id, {
      include: [
        {
          model: user,
          as: "teacher",
          attributes: ["id", "name", "email"],
        },
        {
          model: user,
          as: "students",
          attributes: ["id", "name", "email"],
        },
      ],
    });
    if (_classroom) {
      res.json({
        ..._classroom.toJSON(),
        isTeacher: _classroom.teacher_id === userId,
      });
      // res.json(_classroom);
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

const addStudentToClassroom = async (req, res) => {
  const { email } = req.body;
  const classroomId = req.params.id;

  // Find the student by email
  const student = await user.findOne({ where: { email } });
  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  const studentId = student.id; // Get the student ID

  // Find the classroom
  try {
    const userId = req.user.id;
    const _student = await user.findByPk(studentId);
    const _classroom = await classroom.findByPk(classroomId);

    // Check if the user is a teacher of the classroom

    if (_classroom.teacher_id !== userId) {
      return res.status(403).json({
        message: "You are not authorized to add students to this classroom",
      });
    }

    if (_classroom.teacher_id === studentId) {
      return res.status(400).json({
        message: `${email}(${_student.name}) is the teacher of Classroom ${_classroom.name}. You cannot add yourself as a student.`,
      });
    }

    // Check if the student is already member of classroom
    const enrolledClassrooms = await _student.getEnrolledClassrooms({
      where: { id: classroomId },
    });

    if (enrolledClassrooms.length > 0) {
      return res.status(400).json({
        message: `Student ${studentId} is already enrolled in Classroom ${classroomId}`,
      });
    }

    if (!_student || !_classroom) {
      return res
        .status(404)
        .json({ message: "Student or Classroom not found" });
    }

    // await sequelize.transaction(async (t) => {});
    await _student.addEnrolledClassrooms(_classroom);

    await sendNotification({
      message: `You have been added to Classroom "${_classroom.name}"`,
      type: "info",
      receiver_id: _student.id,
      sender_id: null,
      action: { taskId: _classroom.id },
    });

    res.json({
      message: `Student ${studentId} enrolled in Classroom ${classroomId}`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeStudentFromClassroom = async (req, res) => {
  const { email } = req.body;
  const classroomId = req.params.id;

  // Find the student by email
  const student = await user.findOne({ where: { email } });
  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  const studentId = student.id; // Get the student ID

  // Find the classroom
  try {
    const userId = req.user.id;
    const _student = await user.findByPk(studentId);
    const _classroom = await classroom.findByPk(classroomId);

    // Check if the user is a teacher of the classroom
    if (_classroom.teacher_id !== userId) {
      return res.status(403).json({
        message:
          "You are not authorized to remove students from this classroom",
      });
    }

    if (!_student || !_classroom) {
      return res
        .status(404)
        .json({ message: "Student or Classroom not found" });
    }

    await _student.removeEnrolledClassrooms(_classroom); // Uses alias "studentClassroomss"

    await sendNotification({
      message: `You have been removed from Classroom "${_classroom.name}"`,
      type: "info",
      receiver_id: _student.id,
      sender_id: null,
      action: { taskId: _classroom.id },
    });
    res.json({
      message: `Student ${studentId} removed from Classroom ${classroomId}`,
    });
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
  addStudentToClassroom,
  removeStudentFromClassroom,
};

// const addStudentToClassroom = async (studentId, classroomId) => {
//   const student = await user.findByPk(studentId);
//   const classroom = await classroom.findByPk(classroomId);

//   if (!student || !classroom) {
//     throw new Error("Student or Classroom not found");
//   }

//   await student.addEnrolledClassroom(classroom); // Uses alias "enrolledClassrooms"
//   console.log(`Student ${studentId} enrolled in Classroom ${classroomId}`);
// };
