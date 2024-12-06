const express = require('express');
const router = express.Router();

const todoItemController = require('../controllers/todoItemControllers');

router.post('/', todoItemController.createTodoItem);
router.get('/', todoItemController.readTodoItems);
router.get('/:id', todoItemController.readTodoItem);
router.put('/:id', todoItemController.updateTodoItem);
router.delete('/:id', todoItemController.deleteTodoItem);

module.exports = router;
