const express = require("express");
const router = express.Router();
const resourceController = require("../controllers/classroomMaterialsControllers");
const upload = require("../middlewares/supabaseUpload");

const authMiddleWare = require("../middlewares/authMiddleware");
router.use(authMiddleWare.authMiddleware);

router.post("/", upload.single("file"), resourceController.createMaterial);
router.get("/", resourceController.getAllMaterials);
router.delete("/:id", resourceController.deleteMaterial);

module.exports = router;
