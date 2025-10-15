import {
  forgotPassword,
  protectedRoute,
  publicRoute,
  resetPassword,
  signin,
  signup,
} from "../controllers/authController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import dotenv from "dotenv";
import express from "express";

dotenv.config();
const router = express.Router();

// Routes
router.post("/signup", signup);
router.post("/signin", signin);
router.get("/protected", authMiddleware, protectedRoute);
router.get("/public", publicRoute);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
export default router;
