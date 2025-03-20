const express = require("express");
const router = express.Router();

const roadmapController = require("../controllers/roadmapControllers");

router.post("/", roadmapController.createRoadmap);
router.get("/", roadmapController.readRoadmaps);
router.get("/:id", roadmapController.readRoadmap);
router.put("/:id", roadmapController.updateRoadmap);
router.delete("/:id", roadmapController.deleteRoadmap);

module.exports = router;
