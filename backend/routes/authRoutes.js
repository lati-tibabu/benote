const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const authRateLimiter = require('../middlewares/authRateLimiter');

router.use(authRateLimiter.authRateLimiter);

router.post('/', authController.loginUser);

module.exports = router;
