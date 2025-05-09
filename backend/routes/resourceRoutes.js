const express = require("express");
const router = express.Router();
const resourceController = require("../controllers/resourceControllers");

const authMiddleWare = require("../middlewares/authMiddleware");
router.use(authMiddleWare.authMiddleware);

router.post(
  "/",
  resourceController.uploadFile,
  resourceController.createResource
);
router.get("/", resourceController.getAllResources);
router.get("/:id", resourceController.getResource);
router.put("/:id", resourceController.updateResource);
router.delete("/:id", resourceController.deleteResource);

module.exports = router;
