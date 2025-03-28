const express = require("express");
const router = express.Router();

const taskController = require("../controllers/taskControllers");

const authMiddleWare = require("../middlewares/authMiddleware");

router.use(authMiddleWare.authMiddleware);

// Create a task
router.post("/", taskController.createTask);

// Read all tasks in a workspace (not archived)
router.get("/workspace/:id", taskController.readTasks);

router.get("/", taskController.readTasks);

// Read all tasks assigned to a user
router.get("/user/:id", taskController.readTasksAssignedToUser);

// Read a single task by ID
router.get("/:id", taskController.readTask);

// Read archived tasks in a workspace
router.get(
  "/workspace/:workspace_id/archived",
  taskController.readArchivedTasks
);

// Update a task
router.put("/:id", taskController.updateTask);

// Archive a task
router.put("/:id/archive", taskController.archiveTask);

// Unarchive a task
router.put("/:id/unarchive", taskController.unarchiveTask);

// Delete a task
router.delete("/:id", taskController.deleteTask);

module.exports = router;
