const express = require("express");
const router = express.Router();

const submissionController = require("../controllers/submissionControllers");

const authMiddleware = require("../middlewares/authMiddleware");
router.use(authMiddleware.authMiddleware);

router.post("/", submissionController.createSubmission);
router.get("/", submissionController.readSubmissions);
router.get("/:id", submissionController.readSubmission);
router.put("/:id", submissionController.updateSubmission);
router.delete("/:id", submissionController.deleteSubmission);

module.exports = router;
