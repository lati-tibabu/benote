const express = require("express");
const router = express.Router();

const discussionController = require("../controllers/discussionControllers");
const authMiddleWare = require("../middlewares/authMiddleware");

router.use(authMiddleWare.authMiddleware);

router.post("/", discussionController.createDiscussion);
router.get("/", discussionController.readDiscussions);
router.get("/:id", discussionController.readDiscussion);
router.put("/:id", discussionController.updateDiscussion);
router.delete("/:id", discussionController.deleteDiscussion);

module.exports = router;
