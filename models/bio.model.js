import mongoose from "mongoose";

const bioSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    liveIn: { type: String, default: null },
    relationship: { type: String, default: null },
    workplace: { type: String, default: null },
    education: { type: String, default: null },
    phone: { type: String, default: null },
  },
  { timestamps: true }
);

export const Bio = mongoose.model("Bio", bioSchema);
