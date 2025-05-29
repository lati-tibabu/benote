const express = require("express");
const router = express.Router();

const submissionController = require("../controllers/submissionControllers");

const authMiddleware = require("../middlewares/authMiddleware");
router.use(authMiddleware.authMiddleware);

router.post("/", submissionController.createSubmission);
router.get("/", submissionController.readSubmissions);
router.get("/my", submissionController.readMySubmissions); // <-- Add this line for reading my submissions
router.get("/:id", submissionController.readSubmission);
router.put("/my/:id", submissionController.updateMySubmission); // Use the new controller for editing my submission
router.put("/:id", submissionController.updateSubmission);
router.delete("/:id", submissionController.deleteSubmission);

module.exports = router;
