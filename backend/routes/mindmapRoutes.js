const express = require("express");
const router = express.Router();

const mindmapController = require("../controllers/mindmapControllers");

router.post("/", mindmapController.createMindmap);
router.get("/", mindmapController.readMindmaps);
router.get("/:id", mindmapController.readMindmap);
router.put("/:id", mindmapController.updateMindmap);
router.delete("/:id", mindmapController.deleteMindmap);

module.exports = router;
