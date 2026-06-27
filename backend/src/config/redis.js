const Redis = require('ioredis');

// Connect to Redis using connection string from env or default local instance
const redisClient = new Redis(process.env.REDIS_URI || 'redis://127.0.0.1:6379');

redisClient.on('connect', () => {
    console.log('✅ Redis connected successfully.');
});

redisClient.on('error', (err) => {
    console.error('❌ Redis Connection Error:', err);
});

module.exports = redisClient;
