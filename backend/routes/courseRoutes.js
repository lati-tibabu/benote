const express = require("express");
const router = express.Router();

const courseController = require("../controllers/courseControllers");

router.post("/", courseController.createCourse);
router.get("/", courseController.readCourses);
router.get("/:id", courseController.readCourse);
router.put("/:id", courseController.updateCourse);
router.delete("/:id", courseController.deleteCourse);

module.exports = router;
