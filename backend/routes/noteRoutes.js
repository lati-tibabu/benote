const express = require("express");
const router = express.Router();

const noteController = require("../controllers/noteControllers");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/", noteController.createNote);
router.get(
  "/:workspace_id",
  authMiddleware.authMiddleware,
  noteController.readNotes
);
router.get(
  "/:workspace_id/:id",
  authMiddleware.authMiddleware,
  noteController.readNote
);
router.put("/:id", authMiddleware.authMiddleware, noteController.updateNote);
router.delete("/:id", authMiddleware.authMiddleware, noteController.deleteNote);
router.get("/public/:id/note", noteController.readPublicNote);
router.get("/public/notes/load", noteController.readPublicNotes);
router.patch(
  "/:workspace_id/:id/publish",
  authMiddleware.authMiddleware,
  noteController.publishNote
);
router.get("/public/notes/search", noteController.searchPublicNotes);

module.exports = router;
