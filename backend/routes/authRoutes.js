const express = require("express");
const router = express.Router();
const passport = require("passport"); // Ensure passport is required
const authController = require("../controllers/authController");
const authRateLimiter = require("../middlewares/authRateLimiter");
const ssoService = require('@benote/sso-backend');
const authMiddleware = require("../middlewares/authMiddleware");

// router.use(authRateLimiter.authRateLimiter);
router.post("/", authController.loginUser);

// Google OAuth login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }), // Add failureRedirect
  (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    // Send token to frontend
    // res.redirect(`/?token=${req.user.token}`); // or res.status(200).json({ token: req.user.token });
    const clientURL =
      process.env.NODE_ENV === "prod"
        ? process.env.PROD_CLIENT_URL
        : process.env.DEV_CLIENT_URL;
    res.redirect(`${clientURL}/auth/loading?token=${req.user.token}`); // Redirect to loading route
  }
);

router.post("/forgot-password", authController.sendForgotPasswordEmail);
router.put("/reset-password", authController.resetPassword);


// benote SSO login
router.post('/sso/odoo', authMiddleware.authMiddleware, async (req, res) => {
  console.log("SSO Odoo request received for user:", req.user?.id);
  const user = req.user; // Extracted from authMiddleware
  const secret = process.env.ODOO_JWT_SECRET;
  const audience = 'odoo';

  const token = ssoService.generateToken(user, [], audience, secret);
  res.json({ token });
})
module.exports = router;
