import UserModelAuth from "../models/userModel.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { sendEmail } from "../util/sendMail.js";
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

    const html = `
      <h2>Welcome, ${name}!</h2>
      <p>Thank you for registering with us </p>
    `;
    await sendEmail(email, "Welcome to Our App!", html);

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

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await UserModelAuth.findOne({ email });

  if (!user) return res.status(404).json({ msg: "UserModelAuth not found" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  user.resetToken = token;
  await user.save();

  const resetLink = `http://localhost:3000/api/users/reset-password/${token}`;
  const html = `
    <p>Hello ${user.name},</p>
    <p>Click below to reset your password:</p>
    <a href="${resetLink}">${resetLink}</a>
  `;

  await sendEmail(user.email, "Password Reset Request", html);

  res.json({ msg: "Password reset email sent" });
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModelAuth.findById(decoded.id); //099fhfhf

    if (!user) return res.status(400).json({ msg: "Invalid token" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = null;
    await user.save();

    res.json({ msg: "Password reset successful" });
  } catch (err) {
    res.status(400).json({ msg: "Invalid or expired token" });
  }
};
