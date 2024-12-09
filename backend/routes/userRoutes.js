const express = require("express");
const router = express.Router();

const userControllers = require("../controllers/userControllers");
const { authMiddleware } = require("../middlewares/authMiddleware");

router.post('/', userControllers.createUser);
router.get('/', /*authMiddleware,*/ userControllers.readUsers);
router.get('/:id', userControllers.readUser);
router.put('/:id', userControllers.updateUser);
router.delete('/:id', userControllers.deleteUser);

module.exports = router;