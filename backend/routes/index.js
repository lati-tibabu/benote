const express = require("express");
const userRouters = require('./userRoutes');

const router = express.Router();

router.use('/users', userRouters);

module.exports = router;