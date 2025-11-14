import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { Image } from "image-js";
import  {Jimp}  from "jimp";
import sharp from "sharp";
import { intToRGBA, rgbaToInt } from "@jimp/utils";
import { cssColorToHex } from "@jimp/utils";
import {findConvexHull} from "../algo/grahamsScan.js"
import { distance } from "mathjs";



const router = express.Router();


// ESM replacement for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// setup multer for uploads
const upload = multer({ storage:multer.memoryStorage()});


function drawLine(image,x0,y0,x1,y1,color){
  let dx = Math.abs(x1-x0);
  let dy = -Math.abs(y1-y0)
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


router.post("/uploadImage", upload.single("image"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
  

    const colorImage = await Jimp.read(req.file.buffer);
    colorImage.resize({ w: 200});


    const buffer = await sharp(req.file.buffer).resize(200).grayscale().toBuffer();
    const image = await Jimp.read(buffer);

    // Laplacian filter, which detects edges (sharp intensity changes).
    image.convolute([
       [-1, -1, -1],
      [-1, 8, -1],
      [-1, -1, -1]
    ])

    const width = image.bitmap.width;
    const height = image.bitmap.height;
    const points = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const color = intToRGBA(image.getPixelColor(x, y));
        // Bright pixels → edge
        if (color.r > 200) points.push([ x, y ]);
      }
    }

    const hullPoints = findConvexHull(points);
    const red = cssColorToHex("#FF0000");

    for(let i=0;i<hullPoints.length;i++){
      const [x0,y0]=hullPoints[i];
      const [x1, y1] = hullPoints[(i + 1) % hullPoints.length];
      drawLine(colorImage,x0,y0,x1,y1,red);

    }

    const outputBuffer = await colorImage.getBuffer("image/png");
    console.log(outputBuffer);
    await  colorImage.write(path.join(__dirname,"finalImage.png"));
    res.set("Content-Type", "image/png");
    res.send(outputBuffer);
   
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Image processing failed" });
  }
});

export default router;
