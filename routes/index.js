import express from "express";
import authRoute from "./auth.route.js";
import userRoute from "./user.route.js";
import photoRoute from "./photo.route.js";
import postRoute from "./post.route.js";

const router = express.Router();

router.use("/auth", authRoute);
router.use("/users", userRoute);
router.use("/photo", photoRoute);
router.use("/post", postRoute);

export default router;
