const express = require('express');
const router = express.Router();

const teamController = require('../controllers/teamControllers');

router.post('/', teamController.createTeam);
router.get('/', teamController.readTeams);
router.get('/:id', teamController.readTeam);
router.put('/:id', teamController.updateTeam);
router.delete('/:id', teamController.deleteTeam);

module.exports = router;