const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { user } = require("../models");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const SECRET_KEY = process.env.JWT_SECRET_KEY;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.NODE_ENV === "prod"
          ? process.env.PROD_GOOGLE_CALLBACK_URL
          : process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: false,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Find or create user in the database
        let _user = await user.findOne({
          where: { email: profile.emails[0].value },
        });

        if (!_user) {
          _user = await user.create({
            // id: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            password_hash: null, // Not required for Google login
            role: "user",
          });
        }

        // Generate JWT token
        const token = jwt.sign(
          {
            id: _user.id,
            email: _user.email,
            name: _user.name,
          },
          SECRET_KEY,
          { expiresIn: "30d" },
        );

        return done(null, { token });
      } catch (error) {
        console.error("Google OAuth Error:", error); // Log the error!
        return done(error, null);
      }
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = passport;
