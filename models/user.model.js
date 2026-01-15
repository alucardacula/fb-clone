import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, default: null },
    gender: { type: String, default: null },
    dateOfBirth: { type: Date, default: null },
    profilePicture: { type: String, default: null },
    coverPhoto: { type: String, default: null },
    coverOffsetY: { type: Number, default: 0 },
    avatarScale: { type: Number, default: 1 },
    avatarOffsetX: { type: Number, default: 0 },
    avatarOffsetY: { type: Number, default: 0 },
    friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    sentRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    bio: { type: mongoose.Schema.Types.ObjectId, ref: "Bio" },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
