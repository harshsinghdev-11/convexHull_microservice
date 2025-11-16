import express from 'express';
import { redisPub } from '../redis/redis.js';

const router = express.Router();

router.post('/process-image', async (req, res) => {
  try {
    const { socketId, image } = req.body;
    
    if (!socketId || !image) {
      return res.status(400).json({ error: 'Missing socketId or image' });
    }

    // Publish job to Redis
    await redisPub.publish(
      'image_jobs',
      JSON.stringify({ socketId, image })
    );

    res.json({ success: true, message: 'Image queued for processing' });
  } catch (error) {
    console.error('Error queuing image:', error);
    res.status(500).json({ error: 'Failed to queue image' });
  }
});

export default router;