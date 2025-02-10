const express = require('express');
const router = express.Router();

const todoItemController = require('../controllers/todoItemControllers');

router.post('/', todoItemController.createTodoItem);
router.get('/:todo_id', todoItemController.readTodoItems);
router.get('/:id', todoItemController.readTodoItem);
router.put('/:id', todoItemController.updateTodoItem);
router.patch('/:id', todoItemController.checkUncheckTodoItem);
router.delete('/:id', todoItemController.deleteTodoItem);

module.exports = router;
