import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import cors from "cors";
import imageRoutes from "./routes/imageAccept.js";
import "./ws/imageProcessingHandler.js"; // Redis subscriber
import { setupWebSocket } from "./ws/wsGateway.js"; // Import the function

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors());

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", imageRoutes);
app.get("/", (req, res) => {
  res.render("index");
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  
  // Setup WebSocket after server starts
  setupWebSocket(server);
});