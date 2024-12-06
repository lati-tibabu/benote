const express = require('express');
const router = express.Router();

const timeBlockController = require('../controllers/timeBlockControllers');

router.post('/', timeBlockController.createTimeBlock);
router.get('/', timeBlockController.readTimeBlocks);
router.get('/:id', timeBlockController.readTimeBlock);
router.put('/:id', timeBlockController.updateTimeBlock);
router.delete('/:id', timeBlockController.deleteTimeBlock);

module.exports = router;
