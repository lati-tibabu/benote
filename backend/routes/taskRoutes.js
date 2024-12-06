const express = require('express');
const router = express.Router();

const taskController = require('../controllers/taskControllers');

router.post('/', taskController.createTask);
router.get('/', taskController.readTasks);
router.get('/:id', taskController.readTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
