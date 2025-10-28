// const redis = require('redis');

// let redisClient = null;
// const useRedis = process.env.USE_REDIS !== 'false';

// async function initRedis() {
//   if (useRedis) {
//     redisClient = redis.createClient({
//       url: process.env.REDIS_URL || 'redis://localhost:6379'
//     });

//     try {
//       await redisClient.connect();
//       console.log('✅ Redis connected successfully');
//     } catch (err) {
//       console.log('⚠️  Redis not available - running without cache');
//       console.log('   To enable caching, install and run Redis');
//       redisClient = null;
//     }
//   }
// }

// module.exports = { redisClient, initRedis };




const redis = require("redis")

let redisClient = null
const useRedis = process.env.USE_REDIS !== "false" && process.env.REDIS_URL

async function initRedis() {
  if (!useRedis) {
    console.log("⚠️  Redis not configured - running without cache")
    return
  }

  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL,
      socket: {
        connectTimeout: 5000,
        keepAlive: false,
      },
    })

    await redisClient.connect()
    console.log("✅ Redis connected successfully")
  } catch (err) {
    console.log("⚠️  Redis not available - running without cache")
    console.log("   Error:", err.message)
    redisClient = null
  }
}

async function getRedisClient() {
  if (!useRedis) return null

  if (!redisClient || !redisClient.isOpen) {
    await initRedis()
  }

  return redisClient
}

module.exports = { redisClient, initRedis, getRedisClient }
