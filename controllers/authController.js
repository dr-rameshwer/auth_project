import UserModelAuth from "../models/userModel.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

// ------------------ SIGNUP ------------------
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exist = await UserModelAuth.findOne({ email });
    if (exist) return res.status(400).json({ msg: "Email already registered" });

    /*
    Salt Rounds and Notes:
    8–10    -> Fast and secure for most applications 
    12–14   -> More secure but slower for high traffic
    >15     -> Very secure but can impact server performance 
    */
    const hashed = await bcrypt.hash(password, 10); // hash password

    const user = new UserModelAuth({ name, email, password: hashed });
    await user.save();

    res.status(201).json({ msg: "UserModelAuth registered successfully" });
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
};

// ------------------ SIGNIN ------------------
export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModelAuth.findOne({ email });
    if (!user) return res.status(400).json({ msg: "UserModelAuth not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ msg: "Login successful", token });
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
};

// ------------------ PROTECTED ROUTE ------------------
export const protectedRoute = (req, res) => {
  res.json({ msg: `Hello ${req.user.email}, you accessed a protected route!` });
};

// ------------------ PUBLIC ROUTE ------------------
export const publicRoute = (req, res) => {
  res.json({ msg: "Anyone can access this public route." });
};
