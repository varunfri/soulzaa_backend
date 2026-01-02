import { createClient } from "redis";

// 1. Create client instance
const client = createClient({
    url: process.env.REDIS_URI || 'redis://localhost:6379'
});

// 2. Set up permanent event listeners
client.on('error', (err) => console.error('Redis Client Error:', err));
client.on('connect', () => console.log('Redis client connecting...'));
client.on('ready', () => console.log('Redis client connected and ready'));
client.on('end', () => console.log('Redis connection closed'));

// 3. Connection function
export const connectRedis = async () => {
    try {
        if (!client.isOpen) {
            await client.connect();
        }
    } catch (err) {
        console.error("Failed to connect to Redis:", err);
        throw err;
    }
};

// 4. Graceful Disconnect function
export const disconnectRedis = async () => {
    try {
        if (client.isOpen) {
            // .quit() waits for pending commands to finish
            await client.quit();
        }
    } catch (err) {
        console.error("Error during Redis disconnect:", err);
        // Force disconnect if graceful quit fails
        await client.disconnect();
    }
};

// 5. Automatic Shutdown handling (Production standard for 2025)
const handleShutdown = async (signal) => {
    console.log(`Received ${signal}. Closing Redis...`);
    await disconnectRedis();
    process.exit(0);
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

export default client;
