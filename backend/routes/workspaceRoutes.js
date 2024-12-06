const express = require('express');
const router = express.Router();

const workspaceController = require('../controllers/workspaceControllers');

router.post('/', workspaceController.createWorkspace);
router.get('/', workspaceController.readWorkspaces);
router.get('/:id', workspaceController.readWorkspace);
router.put('/:id', workspaceController.updateWorkspace);
router.delete('/:id', workspaceController.deleteWorkspace);

module.exports = router;