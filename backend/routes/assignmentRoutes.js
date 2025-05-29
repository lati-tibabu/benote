const express = require("express");
const router = express.Router();

const assignmentController = require("../controllers/assignmentControllers");

const authMiddleware = require("../middlewares/authMiddleware");
router.use(authMiddleware.authMiddleware);

router.post("/", assignmentController.createAssignment);
router.get("/", /*authMiddleware,*/ assignmentController.readAssignments);
router.get("/:id", assignmentController.readAssignment);
router.put("/:id", assignmentController.updateAssignment);
router.delete("/:id", assignmentController.deleteAssignment);
router.get(
  "/classroom/all",
  assignmentController.readAllAssignmentsInClassroom
);

module.exports = router;
