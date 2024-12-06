const express = require('express');
const router = express.Router();

const todoController = require('../controllers/todoControllers');

router.post('/', todoController.createTodo);
router.get('/', todoController.readTodos);
router.get('/:id', todoController.readTodo);
router.put('/:id', todoController.updateTodo);
router.delete('/:id', todoController.deleteTodo);

module.exports = router;
