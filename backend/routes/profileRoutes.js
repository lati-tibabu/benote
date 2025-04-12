const express = require("express");
const router = express.Router();

const profileControllers = require("../controllers/profileControllers");

const authMiddleWare = require("../middlewares/authMiddleware");

router.use(authMiddleWare.authMiddleware);

router.post("/", profileControllers.createProfile);
router.get("/", profileControllers.getAllProfiles);
// router.get("/", profileControllers.getProfileForUser);
router.get("/:id", profileControllers.getProfileById);
router.put("/:id", profileControllers.updateProfile);
router.delete("/:id", profileControllers.deleteProfile);

module.exports = router;
