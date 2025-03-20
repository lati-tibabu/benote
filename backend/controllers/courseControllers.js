const { course } = require("../models");

// Create
const createCourse = async (req, res) => {
  try {
    const _course = await course.create(req.body);
    res.status(201).json(_course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Read
const readCourses = async (req, res) => {
  try {
    const _courses = await course.findAll();
    res.json(_courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const readCourse = async (req, res) => {
  try {
    const _course = await course.findByPk(req.params.id);
    if (_course) {
      res.json(_course);
    } else {
      res.status(404).json({ message: "course not found!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update

const updateCourse = async (req, res) => {
  try {
    const _course = await course.findByPk(req.params.id);
    if (_course) {
      await _course.update(req.body);
      const updatedcourse = { ..._course.get() };
      res.json(updatedcourse);
    } else {
      res.status(404).json({ message: "course not found1" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete

const deleteCourse = async (req, res) => {
  try {
    const _course = await course.findByPk(req.params.id);
    if (_course) {
      await _course.destroy();
      res.json({ message: "course succesfully deleted" });
    } else {
      res.status(404).json({ message: "course not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCourse,
  readCourses,
  readCourse,
  updateCourse,
  deleteCourse,
};
