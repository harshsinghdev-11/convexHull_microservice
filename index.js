// Use "type": "module" in your package.json
// {
//   "type": "module",
//   ...
// }

import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import http from "http"
import imageRoutes from "./routes/imageAccept.js";
// import hullRoutes from "./algo/grahamsScan.js";
import { WebSocketServer } from "ws";
import { setupWebSocket } from "./ws/imageProcessingHandler.js";

dotenv.config();
const app = express();
const server = http.createServer(app)



// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
// app.use("/api", hullRoutes);
app.use("/api", imageRoutes);
app.get("/",(req,res)=>{
  res.render("index");
})

const PORT = process.env.PORT || 3000;
setupWebSocket(server);

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});