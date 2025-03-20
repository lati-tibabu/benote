const { user } = require("../models");
// import { user } from "../models";
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
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
      _user.password_hash,
    );
    if (password_valid) {
      const token = jwt.sign(
        {
          id: _user.id,
          email: _user.email,
          name: _user.name,
        },
        SECRET_KEY,
        { expiresIn: "30d" },
      );
      res.status(200).json({ token });
      // res.status(200).json({message: 'User authenticated'});
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// const logoutUset = async(req, res) => {
// }

module.exports = {
  loginUser,
};
