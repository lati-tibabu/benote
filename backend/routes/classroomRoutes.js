const express = require("express");
const router = express.Router();

const classroomControllers = require("../controllers/classroomControllers");

const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware.authMiddleware);

router.post("/", classroomControllers.createClassroom);
router.get("/", classroomControllers.readClassrooms);
router.get("/:id", classroomControllers.readClassroom);
router.put("/:id", classroomControllers.updateClassroom);
router.delete("/:id", classroomControllers.deleteClassroom);

module.exports = router;
