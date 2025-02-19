const express = require('express');
const router = express.Router();

const teamController = require('../controllers/teamControllers');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware.authMiddleware);

router.post('/', teamController.createTeam);
router.get('/', teamController.readTeams);
// assign membership
router.post('/:id/members', teamController.giveUserMembership);

router.get('/:id', teamController.readTeam);
router.put('/:id', teamController.updateTeam);
router.delete('/:id', teamController.deleteTeam);

module.exports = router;