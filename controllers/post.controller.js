import sharp from "sharp";
import cloudinary from "../config/cloudinary.js";
import { Post } from "../models/post.model.js";

//đếm reaction
const countReactions = (reactions) => {
  const result = {
    like: 0,
    love: 0,
    care: 0,
    haha: 0,
    wow: 0,
    sad: 0,
    angry: 0,
  };

  reactions.forEach((r) => {
    if (result[r.type] !== undefined) {
      result[r.type]++;
    }
  });

  return result;
};

//CREATE POST
export const createPost = async (req, res) => {
  try {
    const userId = req.user.id; // từ middleware auth
    const { content } = req.body;
    const files = req.files || [];

    // Đếm số video
    const videoCount = files.filter((file) =>
      file.mimetype.startsWith("video")
    ).length;

    if (videoCount > 1) {
      return res.status(400).json({
        success: false,
        message: "Mỗi bài đăng chỉ được tối đa 1 video",
      });
    }

    let media = [];

    for (const file of files) {
      // ẢNH
      if (file.mimetype.startsWith("image")) {
        const buffer = await sharp(file.buffer)
          .resize({ width: 1200 })
          .jpeg({ quality: 80 })
          .toBuffer();

        const result = await cloudinary.uploader.upload(
          `data:image/jpeg;base64,${buffer.toString("base64")}`
        );

        media.push({
          url: result.secure_url,
          type: "image",
        });
      }

      // VIDEO
      if (file.mimetype.startsWith("video")) {
        const result = await cloudinary.uploader.upload(
          `data:video/mp4;base64,${file.buffer.toString("base64")}`,
          { resource_type: "video" }
        );

        media.push({
          url: result.secure_url,
          type: "video",
        });
      }
    }

    // Xác định loại post
    let postType = "text";
    if (media.length === 1 && media[0].type === "image") postType = "image";
    else if (media.length === 1 && media[0].type === "video")
      postType = "video";
    else if (media.length > 1) postType = "mixed";

    const post = await Post.create({
      user: userId,
      content,
      media,
      postType,
    });

    const populatedPost = await post.populate(
      "user",
      "firstName lastName profilePicture avatarOffsetX avatarOffsetY avatarScale"
    );

    res.status(201).json({
      success: true,
      post: populatedPost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//GET ALL POST
export const getAllPost = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate(
        "user",
        "firstName lastName profilePicture avatarOffsetX avatarOffsetY avatarScale"
      );

    const postsWithReactionCount = posts.map((post) => {
      const postObj = post.toObject();

      return {
        ...postObj,
        reactionCount: countReactions(postObj.reactions),
      };
    });

    res.status(200).json({
      success: true,
      count: postsWithReactionCount.length,
      posts: postsWithReactionCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get posts",
    });
  }
};

//Reaction
export const reactPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;
    const { type } = req.body; // like | love | haha | ...

    if (!type) {
      return res.status(400).json({
        success: false,
        message: "Reaction type is required",
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Kiểm tra user đã react chưa
    const existingReactionIndex = post.reactions.findIndex(
      (reaction) => reaction.user.toString() === userId
    );

    if (existingReactionIndex !== -1) {
      const existingReaction = post.reactions[existingReactionIndex];

      if (existingReaction.type === type) {
        // Click lại cùng type -> bỏ reaction
        post.reactions.splice(existingReactionIndex, 1);
      } else {
        // Click type khác -> cập nhật type
        post.reactions[existingReactionIndex].type = type;
      }
    } else {
      // Chưa react -> thêm mới
      post.reactions.push({
        user: userId,
        type,
      });
    }

    const newPost = await post.save();
    console.log(newPost);

    return res.status(200).json({
      success: true,
      message: "React successfully",
      reactions: post.reactions,
      reactionCount: countReactions(post.reactions),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//  GET POSTS BY USER ID
export const getPostsByUserId = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    if (!userId)
      return res
        .status(400)
        .json({ success: false, message: "UserId required" });

    const posts = await Post.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate(
        "user",
        "firstName lastName profilePicture avatarOffsetX avatarOffsetY avatarScale"
      )
      .populate(
        "reactions.user",
        "firstName lastName profilePicture avatarOffsetX avatarOffsetY avatarScale"
      );

    const postsWithReactionCount = posts.map((post) => {
      return {
        ...post.toObject(),
        reactionCount: countReactions(post.reactions),
      };
    });

    res.status(200).json({
      success: true,
      count: posts.length,
      posts: postsWithReactionCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
