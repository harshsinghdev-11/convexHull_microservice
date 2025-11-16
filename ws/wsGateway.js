import { WebSocketServer } from "ws";
import { v4 as uuid } from "uuid";
import { redisPub,redisSub } from "../redis/redis.js";
import { createClient } from "redis";


const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || 6379;

export function setupWebSocket(server) {
  const wss = new WebSocketServer({ noServer: true });


  const clients = new Map();

  server.on("upgrade", (req, socket, head) => {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  });

  wss.on("connection", (ws) => {
    const socketId = uuid();
    clients.set(socketId, ws);

    console.log("Client connected:", socketId);
    ws.send(JSON.stringify({ type: "welcome", socketId }));

    redisSub.subscribe(`user:${socketId}`, (message) => {
      if (ws.readyState === ws.OPEN) {
        ws.send(message);
      }
    });

    ws.on("message", async (data) => {
      redisPub.publish(
        "image_jobs",
        JSON.stringify({
          socketId,
          image: Buffer.from(data).toString("base64"),
        })
      );
    });

    ws.on("close", () => {
      clients.delete(socketId);
      redisSub.unsubscribe(`user:${socketId}`);
    });
  });
}
