import {createClient} from "redis";
import dotenv from "dotenv";
dotenv.config();

// Get Redis configuration from environment variables
const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
const redisUsername = process.env.REDIS_USERNAME;
const redisPassword = process.env.REDIS_PASSWORD; 

// Build Redis client configuration
const redisConfig = {
    socket: {
        host: redisHost,
        port: redisPort
    }
};

// Only add authentication if credentials are provided
if (redisUsername) {
    redisConfig.username = redisUsername;
}
if (redisPassword) {
    redisConfig.password = redisPassword;
}

// Create Redis clients for pub/sub
export const redisPub = createClient(redisConfig);
export const redisSub = createClient(redisConfig);

redisPub.on("error", err => console.error("Redis pub error: ", err));
redisSub.on("error", err => console.error("Redis sub error: ", err));


await redisPub.connect();
await redisSub.connect();

console.log(`Connected to Redis at ${redisHost}:${redisPort}`);

