import mongoose from "mongoose";

/**
 * Reaction của user
 */
const reactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["like", "love", "care", "haha", "wow", "sad", "angry"],
      required: true,
    },
  },
  { _id: false }
);

/**
 * Media: ảnh hoặc video
 */
const mediaSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },
  },
  { _id: false }
);

/**
 * Post
 */
const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: {
      type: String,
    },

    media: {
      type: [mediaSchema],
      validate: [
        (arr) => arr.length <= 10,
        "Chỉ được upload tối đa 10 ảnh/video",
      ],
    },

    reactions: [reactionSchema],

    postType: {
      type: String,
      enum: ["text", "image", "video", "mixed"],
      default: "text",
    },
  },
  { timestamps: true }
);

export const Post = mongoose.model("Post", postSchema);
