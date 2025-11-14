// Use "type": "module" in your package.json
// {
//   "type": "module",
//   ...
// }

import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import imageRoutes from "./routes/imageAccept.js";
// import hullRoutes from "./algo/grahamsScan.js";

dotenv.config();

const app = express();

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
// app.use("/api", hullRoutes);
app.use("/api", imageRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
