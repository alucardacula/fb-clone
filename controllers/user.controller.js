import { User } from "../models/user.model.js";
import { Photo } from "../models/photo.model.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import { Bio } from "../models/bio.model.js";

//GET PROFILE

export const getProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).populate({ path: "bio" });
    return res.status(200).json({ user, success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
    });
  }
};

//UPDATE PROFILE PICTURE

export const uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;
    const file = req.file;

    if (!file) return res.status(400).json({ message: "No file uploaded" });

    if (!file.mimetype.startsWith("image/"))
      return res.status(400).json({ message: "File must be image" });

    //  Upload Cloudinary
    const result = await uploadToCloudinary(file.buffer, "users/avatars");

    //  Lưu lịch sử ảnh
    await Photo.create({
      user: userId,
      url: result.secure_url,
      type: "avatar",
    });

    //  Update ảnh hiện tại
    await User.findByIdAndUpdate(userId, {
      profilePicture: result.secure_url,
    });

    res.json({
      message: "Upload avatar success",
      profilePicture: result.secure_url,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//UPLOAD COVER PHOTO
export const uploadCoverPhoto = async (req, res) => {
  try {
    const userId = req.user.id;
    const file = req.file;

    if (!file) return res.status(400).json({ message: "No file uploaded" });

    if (!file.mimetype.startsWith("image/"))
      return res.status(400).json({ message: "File must be image" });

    const result = await uploadToCloudinary(file.buffer, "users/covers");

    await Photo.create({
      user: userId,
      url: result.secure_url,
      type: "cover",
    });

    await User.findByIdAndUpdate(userId, {
      coverPhoto: result.secure_url,
    });

    res.json({
      message: "Upload cover success",
      coverPhoto: result.secure_url,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//updateBio

export const updateIntro = async (req, res) => {
  try {
    const userId = req.user.id; // assuming authentication middleware sets req.user
    const { bioText, liveIn, relationship, workplace, education, phone } =
      req.body;

    // Find the existing bio or create a new one
    let bio = await Bio.findOne({ user: userId });

    if (!bio) {
      bio = new Bio({ user: userId });
    }

    // Update only provided fields
    if (bioText !== undefined) bio.bioText = bioText;
    if (liveIn !== undefined) bio.liveIn = liveIn;
    if (relationship !== undefined) bio.relationship = relationship;
    if (workplace !== undefined) bio.workplace = workplace;
    if (education !== undefined) bio.education = education;
    if (phone !== undefined) bio.phone = phone;

    await bio.save();

    // Update the user's reference to this bio (if not already set)
    const user = await User.findById(userId);
    if (!user.bio || user.bio.toString() !== bio._id.toString()) {
      user.bio = bio._id;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "Bio updated successfully",
      bio,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating bio",
      error: error.message,
    });
  }
};

// SAVE COVER REPOSITION
export const saveCoverReposition = async (req, res) => {
  try {
    const userId = req.user.id;
    const { offsetY } = req.body;

    // Validate
    if (typeof offsetY !== "number") {
      return res.status(400).json({
        success: false,
        message: "offsetY must be a number",
      });
    }

    await User.findByIdAndUpdate(userId, {
      coverOffsetY: offsetY,
    });

    return res.status(200).json({
      success: true,
      message: "Cover position saved",
      offsetY,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to save cover position",
    });
  }
};

// Save avatar position
export const saveAvatarPosition = async (req, res) => {
  try {
    const userId = req.user.id;
    const { avatarScale, avatarOffsetX, avatarOffsetY } = req.body;

    await User.findByIdAndUpdate(userId, {
      avatarScale,
      avatarOffsetX,
      avatarOffsetY,
    });

    res.json({
      success: true,
      message: "Avatar position saved",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Save avatar position failed",
    });
  }
};
