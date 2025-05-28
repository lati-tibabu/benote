const express = require("express");
const router = express.Router();
const { searchUserData } = require("../controllers/searchController");

const authMiddleware = require("../middlewares/authMiddleware");
router.use(authMiddleware.authMiddleware);

// GET /api/search?query=...&type=...&page=...&pageSize=...
router.get("/", searchUserData);

module.exports = router;
