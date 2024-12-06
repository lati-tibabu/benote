const express = require('express');
const router = express.Router();

const roadmapItemController = require('../controllers/roadmapItemControllers');

router.post('/', roadmapItemController.createRoadmapItem);
router.get('/', roadmapItemController.readRoadmapItems);
router.get('/:id', roadmapItemController.readRoadmapItem);
router.put('/:id', roadmapItemController.updateRoadmapItem);
router.delete('/:id', roadmapItemController.deleteRoadmapItem);

module.exports = router;
