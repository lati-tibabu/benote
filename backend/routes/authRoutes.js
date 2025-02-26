const express = require('express');
const router = express.Router();
const passport = require('passport'); // Ensure passport is required
const authController = require('../controllers/authController');
const authRateLimiter = require('../middlewares/authRateLimiter');

router.use(authRateLimiter.authRateLimiter);
router.post('/', authController.loginUser);

// Google OAuth login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), // Add failureRedirect
    (req, res) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication failed' });
        }

        // Send token to frontend
        // res.redirect(`/?token=${req.user.token}`); // or res.status(200).json({ token: req.user.token });
        const clientURL = process.env.NODE_ENV === 'prod' ? process.env.PROD_CLIENT_URL : process.env.DEV_CLIENT_URL;
        res.redirect(`${clientURL}/auth/loading?token=${req.user.token}`); // Redirect to loading route

    }
);

module.exports = router;