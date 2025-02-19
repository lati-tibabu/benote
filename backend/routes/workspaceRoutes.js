const express = require('express');
const router = express.Router();

const workspaceController = require('../controllers/workspaceControllers');
const authMiddleWare = require('../middlewares/authMiddleware');

router.use(authMiddleWare.authMiddleware);

router.post('/',  workspaceController.createWorkspace);
router.get('/', workspaceController.readWorkspaces);
// assign membership
router.post('/:id/members', workspaceController.giveUserMembership);
router.get('/:id', workspaceController.readWorkspace);
router.put('/:id', workspaceController.updateWorkspace);
router.delete('/:id', workspaceController.deleteWorkspace);

module.exports = router;