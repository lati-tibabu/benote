const express = require('express');
const router = express.Router();

const mindmapItemController = require('../controllers/mindmapItemControllers');

router.post('/', mindmapItemController.createMindmapItem);
router.get('/', mindmapItemController.readMindmapItems);
router.get('/:id', mindmapItemController.readMindmapItem);
router.put('/:id', mindmapItemController.updateMindmapItem);
router.delete('/:id', mindmapItemController.deleteMindmapItem);

module.exports = router;
