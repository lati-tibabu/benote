const express = require("express");
const router = express.Router();

const userTeamController = require("../controllers/userTeamControllers");

router.post("/", userTeamController.assignUserToTeam);
router.get("/:user_id/teams", userTeamController.getUserTeam);
router.get("/:team_id/users", userTeamController.getTeamUser);
router.delete("/", userTeamController.removeUserTeam);

module.exports = router;
