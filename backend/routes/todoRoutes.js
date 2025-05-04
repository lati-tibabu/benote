const express = require("express");
const router = express.Router();

const todoController = require("../controllers/todoControllers");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware.authMiddleware);

router.post("/", todoController.createTodo);
router.get("/:workspace_id", todoController.readTodos);
router.get("/:id", todoController.readTodo);
router.get("/", todoController.readTodosS);
router.put("/:id", todoController.updateTodo);
router.delete("/:id", todoController.deleteTodo);

module.exports = router;
