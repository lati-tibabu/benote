const express = require("express");
const router = express.Router();

const classroomControllers = require("../controllers/classroomControllers");

router.post("/", classroomControllers.createClassroom);
router.get("/", classroomControllers.readClassrooms);
router.get("/:id", classroomControllers.readClassroom);
router.put("/:id", classroomControllers.updateClassroom);
router.delete("/:id", classroomControllers.deleteClassroom);

module.exports = router;
