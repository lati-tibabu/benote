const express = require("express");
const router = express.Router();
const resourceController = require("../controllers/resourceControllers");
const upload = require("../middlewares/supabaseUpload");

const authMiddleWare = require("../middlewares/authMiddleware");
router.use(authMiddleWare.authMiddleware);

router.post("/", upload.single("file"), resourceController.createResource);
router.get("/", resourceController.getAllResources);
router.get("/:id", resourceController.getResource);
router.put("/:id", resourceController.updateResource);
router.delete("/:id", resourceController.deleteResource);
router.get("/signed-url/:fileName", resourceController.generateSignedUrl);

module.exports = router;
