import { Photo } from "../models/photo.model.js";

export const getUserPhotos = async (req, res) => {
  try {
    const userId = req.params.userId;

    const photos = await Photo.find({ user: userId })
      .sort({ createdAt: -1 });

    res.json(photos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};