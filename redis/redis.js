import {createClient} from "redis";
import dotenv from "dotenv";
dotenv.config();

// Get Redis configuration from environment variables
const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
const redisUsername = process.env.redisUsername;
const redisPassword = process.env.redisPassword; 




// Create Redis clients for pub/sub
export const redisPub = createClient({
    username: process.env.redisUsername,
    password: process.env.redisPassword,
    socket: {
        host: process.env.host,
        port: Number(process.env.redis_port)
    }
});
export const redisSub =createClient({
    username: process.env.redisUsername,
    password: process.env.redisPassword,
    socket: {
        host: process.env.host,
        port: Number(process.env.redis_port)
    }
});

redisPub.on("error", err => console.error("Redis pub error: ", err));
redisSub.on("error", err => console.error("Redis sub error: ", err));


await redisPub.connect();
await redisSub.connect();

console.log(`Connected to Redis at ${redisHost}:${redisPort}`);

