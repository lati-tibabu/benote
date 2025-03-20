const express = require("express");
const router = express.Router();

const teamController = require("../controllers/teamControllers");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware.authMiddleware);

router.post("/", teamController.createTeam);
router.get("/", teamController.readTeams);

// assign membership
router.post("/:team_id/members", teamController.giveUserMembership);

//promote admin
router.put("/:team_id/promote", teamController.promoteTeamAdmin);

//demote admin
router.put("/:team_id/demote", teamController.demoteTeamAdmin);

//remove member
router.delete("/:team_id/members/:user_id", teamController.removeUserMember);

router.get("/:id", teamController.readTeam);
router.put("/:id", teamController.updateTeam);
router.delete("/:id", teamController.deleteTeam);

module.exports = router;
