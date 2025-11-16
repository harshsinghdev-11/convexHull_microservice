import { Jimp } from "jimp";
import sharp from "sharp";
import { intToRGBA, cssColorToHex } from "@jimp/utils";
import { grahamScanSteps } from "../algo/grahamsScan.js";  
import { redisSub, redisPub } from "../redis/redis.js";

redisSub.subscribe("image_jobs", async (message) => {
  const { socketId, image } = JSON.parse(message);

  try {
    const inputBuffer = Buffer.from(image, "base64");

    // Step 1: Resize
    await redisPub.publish(
      `user:${socketId}`,
      JSON.stringify({ type: "meta", step: 1 })
    );

    const colorImage = await Jimp.read(inputBuffer);
    colorImage.resize({ w: 200 });
    
    const step1Buffer = await colorImage.getBuffer("image/png");
    await redisPub.publish(
      `user:${socketId}`,
      JSON.stringify({ 
        type: "image", 
        step: 1,
        data: step1Buffer.toString("base64") 
      })
    );

    // Step 2: Grayscale
    await redisPub.publish(
      `user:${socketId}`,
      JSON.stringify({ type: "meta", step: 2 })
    );

    const grayBuffer = await sharp(inputBuffer)
      .resize(200)
      .grayscale()
      .toBuffer();

    const grayImage = await Jimp.read(grayBuffer);
    const step2Buffer = await grayImage.getBuffer("image/png");
    await redisPub.publish(
      `user:${socketId}`,
      JSON.stringify({ 
        type: "image", 
        step: 2,
        data: step2Buffer.toString("base64") 
      })
    );

    // Step 3: Edge Detection
    await redisPub.publish(
      `user:${socketId}`,
      JSON.stringify({ type: "meta", step: 3 })
    );

    grayImage.convolute([
      [-1, -1, -1],
      [-1, 8, -1],
      [-1, -1, -1],
    ]);

    const step3Buffer = await grayImage.getBuffer("image/png");
    await redisPub.publish(
      `user:${socketId}`,
      JSON.stringify({ 
        type: "image", 
        step: 3,
        data: step3Buffer.toString("base64") 
      })
    );

    // Extract Edge Points
    const width = grayImage.bitmap.width;
    const height = grayImage.bitmap.height;
    const points = [];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const color = intToRGBA(grayImage.getPixelColor(x, y));
        if (color.r > 200) points.push([x, y]);
      }
    }

    await redisPub.publish(
      `user:${socketId}`,
      JSON.stringify({ type: "points", points })
    );

    await redisPub.publish(
      `user:${socketId}`,
      JSON.stringify({ 
        type: "log", 
        text: `Extracted ${points.length} edge points` 
      })
    );

    // Convex Hull
    const { steps, hull } = grahamScanSteps(points);

    await redisPub.publish(
      `user:${socketId}`,
      JSON.stringify({ 
        type: "log", 
        text: `Convex hull steps: ${steps.length}` 
      })
    );

    for (const s of steps) {
      await redisPub.publish(
        `user:${socketId}`,
        JSON.stringify({ type: "hull-step", step: s })
      );
      await new Promise((r) => setTimeout(r, 5));
    }

    // Step 4: Draw Final Hull
    await redisPub.publish(
      `user:${socketId}`,
      JSON.stringify({ type: "meta", step: 4 })
    );

    const red = cssColorToHex("#FF0000");
    for (let i = 0; i < hull.length; i++) {
      const [x0, y0] = hull[i];
      const [x1, y1] = hull[(i + 1) % hull.length];
      drawLine(colorImage, x0, y0, x1, y1, red);
    }

    const finalBuffer = await colorImage.getBuffer("image/png");
    await redisPub.publish(
      `user:${socketId}`,
      JSON.stringify({ 
        type: "image", 
        step: 4,
        data: finalBuffer.toString("base64") 
      })
    );

    await redisPub.publish(
      `user:${socketId}`,
      JSON.stringify({ type: "complete" })
    );

    console.log(`Image processing completed for ${socketId}`);

  } catch (error) {
    console.error("Image processing error:", error);
    await redisPub.publish(
      `user:${socketId}`,
      JSON.stringify({ 
        type: "error", 
        message: error.message 
      })
    );
  }
});

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

console.log("Image processor subscribed to Redis 'image_jobs' channel");