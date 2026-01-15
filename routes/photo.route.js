import express from "express";
import { getUserPhotos } from "../controllers/photo.controller.js";

const router = express.Router();

router.get("/user/:userId", getUserPhotos);

export default router;
