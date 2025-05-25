const { user } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const emailService = require("../services/emailService");
require("dotenv").config();

const SECRET_KEY = process.env.JWT_SECRET_KEY;

const loginUser = async (req, res) => {
  try {
    const _user = await user.findOne({ where: { email: req.body.email } });
    if (!_user) {
      return res.status(404).json({ message: "Invalid credentials" });
    }
    const password_valid = await bcrypt.compare(
      req.body.password,
      _user.password_hash
    );
    if (password_valid) {
      const token = jwt.sign(
        {
          id: _user.id,
          email: _user.email,
          name: _user.name,
        },
        SECRET_KEY,
        { expiresIn: "30d" }
      );
      res
        .status(200)
        .json({ token, user: _user.id, is_verified: _user.is_verified });
      // res.status(200).json({message: 'User authenticated'});
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// send forgot password email
const sendForgotPasswordEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const _user = await user.findOne({ where: { email } });
    if (!_user) {
      return res.status(404).json({ message: "User not found" });
    }
    const forgotPasswordToken = Math.floor(Math.random() * 1000000);
    const forgotPasswordExpiry = new Date();
    forgotPasswordExpiry.setHours(forgotPasswordExpiry.getHours() + 1);
    await _user.update({
      forgot_password_token: forgotPasswordToken,
      forgot_password_token_expiry: forgotPasswordExpiry,
    });
    const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${forgotPasswordToken}&userId=${_user.id}`;
    const subject = "Reset Your Password";
    const text = `Please click on the following link to reset your password: ${resetLink}`;
    await emailService.sendEmail(_user.email, subject, text);
    res.json({ message: "Forgot password email sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, userId, newPassword, confirmPassword } = req.body;
    const salt = await bcrypt.genSalt(10);

    const _user = await user.findByPk(userId);

    if (!_user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (token != _user.forgot_password_token) {
      return res.status(400).json({ message: "Invalid token" });
    }
    if (new Date() > _user.forgot_password_token_expiry) {
      return res.status(400).json({ message: "Token expired" });
    }
    if (newPassword != confirmPassword) {
      return res.status(500).json({ message: "Password mismatched" });
    }
    const password_hash = await bcrypt.hash(newPassword, salt);

    await _user.update({
      password_hash,
      forgot_password_token: null,
      forgot_password_token_expiry: null,
    });
    res.json({
      message: "Password reset successfully",
      // user: { id: _user.id, email: _user.email, name: _user.name },
    });
  } catch (e) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  loginUser,
  sendForgotPasswordEmail,
  resetPassword,
};
