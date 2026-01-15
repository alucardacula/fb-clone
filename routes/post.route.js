import express from "express";
import {
  createPost,
  getAllPost,
  getPostsByUserId,
  reactPost,
} from "../controllers/post.controller.js";
import { upload } from "../middleware/multer.js";
import { authMiddleware } from "../middleware/isAuthenticated.js";

const router = express.Router();

router.post("/create", authMiddleware, upload.array("media", 10), createPost);
router.get("/", authMiddleware, getAllPost);
router.post("/react/:postId", authMiddleware, reactPost);

router.get("/me", authMiddleware, getPostsByUserId); // chính user
router.get("/user/:userId", authMiddleware, getPostsByUserId); // user khác

export default router;
