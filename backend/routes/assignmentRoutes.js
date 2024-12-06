const express = require('express');
const router = express.Router();

const assignmentController = require('../controllers/assignmentControllers');

router.post('/', assignmentController.createAssignment);
router.get('/', assignmentController.readAssignments);
router.get('/:id', assignmentController.readAssignment);
router.put('/:id', assignmentController.updateAssignment);
router.delete('/:id', assignmentController.deleteAssignment);

module.exports = router;