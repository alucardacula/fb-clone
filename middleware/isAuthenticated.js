import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const authMiddleware = async (req, res, next) => {
  try {
    // 1. Lấy Authorization header
    const authHeader = req.headers.authorization;

    // 2. Kiểm tra có token không
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // 3. Tách token ra khỏi "Bearer <token>"
    const token = authHeader.split(" ")[1];

    // 4. Verify access token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    req.user = await User.findById(decoded.userId).select("-password");

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    //cho phép đi tiếp
    next();
  } catch (error) {
    // Token hết hạn hoặc không hợp lệ
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};
