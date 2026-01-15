import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Hàm tạo Access Token
const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1d", // access token thường ngắn hạn
  });
};

// Hàm tạo Refresh Token
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "15d", // refresh token dài hạn hơn
  });
};
//register
export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, gender, dateOfBirth } =
      req.body;

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        message: "Email exists",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      gender,
      dateOfBirth,
    });

    //save to db
    await newUser.save();
    return res.status(201).json({
      success: true,
      message: "User created successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

//login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // gửi refresh token vào  cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 15 * 24 * 60 * 60 * 1000, // 15 ngày
    });

    const { password: _, ...userData } = user._doc;
    return res.status(200).json({
      success: true,
      message: "Login successfully!",
      accessToken,
      user: userData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// REFRESH TOKEN
export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: "No refresh token" });

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err)
        return res.status(403).json({ message: "Invalid refresh token" });
      const newAccessToken = generateAccessToken(decoded.userId);
      res.json({ accessToken: newAccessToken });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGOUT
export const logoutUser = (req, res) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "None",
    });
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Server error while logging out" });
  }
};
