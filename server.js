import express from "express";
import dotenv from "dotenv";
import routes from "./routes/index.js";
import connectDB from "./database/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

//middleware
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

//route
app.use("/api/v1", routes);
app.use(express.static("public"));

app.get(/.*/, (req, res) => {
  res.sendFile(path.resolve("public/index.html"));
});

app.listen(PORT, () => {
  console.log(`server listen at port ${PORT}`);
  connectDB();
});
