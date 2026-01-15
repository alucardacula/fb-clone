import express from "express";
import {
  loginUser,
  logoutUser,
  refreshToken,
  registerUser,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/isAuthenticated.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshToken);
router.get("/logout", logoutUser);

export default router;
