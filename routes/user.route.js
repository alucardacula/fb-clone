import express from "express";
import { upload } from "../middleware/multer.js";

import {
  uploadProfilePicture,
  uploadCoverPhoto,
  getProfile,
  updateIntro,
  saveCoverReposition,
  saveAvatarPosition,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/isAuthenticated.js";
import { getPostsByUserId } from "../controllers/post.controller.js";

const router = express.Router();

router.get("/profile/:id", getProfile);
router.put(
  "/avatar",
  authMiddleware,
  upload.single("avatar"),
  uploadProfilePicture
);
router.put("/cover", authMiddleware, upload.single("cover"), uploadCoverPhoto);
router.put("/bio", authMiddleware, updateIntro);
router.put("/cover/reposition", authMiddleware, saveCoverReposition);
router.put("/avatar/reposition", authMiddleware, saveAvatarPosition);

export default router;
