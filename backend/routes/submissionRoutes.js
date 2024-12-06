const express = require('express');
const router = express.Router();

const submissionController = require('../controllers/submissionControllers');

router.post('/', submissionController.createSubmission);
router.get('/', submissionController.readSubmission);
router.get('/:id', submissionController.readSubmissions);
router.put('/:id', submissionController.updateSubmission);
router.delete('/:id', submissionController.deleteSubmission);

module.exports = router;