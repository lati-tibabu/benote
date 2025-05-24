const express = require("express");
const router = express.Router();

const userControllers = require("../controllers/userControllers");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/", userControllers.createUser);
router.get("/", /*authMiddleware,*/ userControllers.readUsers);
router.post("/email", userControllers.readUserByEmail);
router.get("/:id", userControllers.readUser);
router.put("/", authMiddleware.authMiddleware, userControllers.updateUser);
router.delete("/", authMiddleware.authMiddleware, userControllers.deleteUser);
router.get(
  "/overview/fetch",
  authMiddleware.authMiddleware,
  userControllers.getUserOverview
);

module.exports = router;
