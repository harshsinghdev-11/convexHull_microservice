import { WebSocketServer } from "ws";
import {Jimp} from "jimp";
import sharp from "sharp";
import { intToRGBA } from "@jimp/utils";
import { cssColorToHex } from "@jimp/utils";
import { grahamScanSteps } from "../algo/grahamsScan.js";  
export function setupWebSocket(server) {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req, socket, head) => {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  });

  wss.on("connection", (ws) => {


    ws.on("message", async (data) => {
      try {
        const inputBuffer = Buffer.from(data);

        // ---------------- STEP 1: RESIZE -----------------
        const colorImage = await Jimp.read(inputBuffer);
        colorImage.resize({ w: 200 });

        const step1Buffer = await colorImage.getBuffer("image/png");
        ws.send(JSON.stringify({ type: "meta", step: 1 }));
        ws.send(step1Buffer);

        // ---------------- STEP 2: GRAY -------------------
        const grayBuffer = await sharp(inputBuffer)
          .resize(200)
          .grayscale()
          .toBuffer();

        const grayImage = await Jimp.read(grayBuffer);

        const step2Buffer = await grayImage.getBuffer("image/png");
        ws.send(JSON.stringify({ type: "meta", step: 2 }));
        ws.send(step2Buffer);

        // ---------------- STEP 3: EDGE DETECTION -------------------
        grayImage.convolute([
          [-1, -1, -1],
          [-1, 8, -1],
          [-1, -1, -1],
        ]);

        const step3Buffer = await grayImage.getBuffer("image/png");
        ws.send(JSON.stringify({ type: "meta", step: 3 }));
        ws.send(step3Buffer);

        // ---------------- EXTRACT EDGE POINTS -------------------
        const width = grayImage.bitmap.width;
        const height = grayImage.bitmap.height;

        const points = [];
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const color = intToRGBA(grayImage.getPixelColor(x, y));
            if (color.r > 200) points.push([x, y]);
          }
        }

        // Send edge points to front-end
        ws.send(
          JSON.stringify({
            type: "points",
            points,
          })
        );

        ws.send(
          JSON.stringify({
            type: "log",
            text: `Extracted ${points.length} edge points`,
          })
        );

        // ---------------- CONVEX HULL STEPS -------------------
        const { steps, hull } = grahamScanSteps(points); // NEW

        ws.send(
          JSON.stringify({
            type: "log",
            text: `Convex hull steps: ${steps.length}`,
          })
        );

        // Stream each step to frontend
        for (const s of steps) {
          ws.send(
            JSON.stringify({
              type: "hull-step",
              step: s,
            })
          );

          // optional delay makes animation smooth
          await new Promise((r) => setTimeout(r, 5));
        }

        // ---------------- DRAW FINAL HULL -------------------
        const red = cssColorToHex("#FF0000");

        for (let i = 0; i < hull.length; i++) {
          const [x0, y0] = hull[i];
          const [x1, y1] = hull[(i + 1) % hull.length];
          drawLine(colorImage, x0, y0, x1, y1, red);
        }

        const finalBuffer = await colorImage.getBuffer("image/png");

        ws.send(JSON.stringify({ type: "meta", step: 4 }));
        ws.send(finalBuffer);
      } catch (error) {
        console.error(error);
        ws.send(JSON.stringify({ error: "Image processing failed" }));
      }
    });
  });
}

// ---------------------- DRAW LINE ----------------------
function drawLine(image, x0, y0, x1, y1, color) {
  let dx = Math.abs(x1 - x0);
  let dy = -Math.abs(y1 - y0);
  let sx = x0 < x1 ? 1 : -1;
  let sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;

  while (true) {
    image.setPixelColor(color, x0, y0);
    if (x0 === x1 && y0 === y1) break;

    let e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
}
