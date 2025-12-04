const {cacheRedis , sessionRedis} = require('./../config/redis');

class RedisService {
  constructor(redisInstance, prefix = "") {
    this.redis = redisInstance;
    this.prefix = prefix;
  }

  async set(key, value, ttl = 0) {
    const val = typeof value === "string" ? value : JSON.stringify(value);
    if (ttl > 0) return this.redis.set(`${this.prefix}${key}`, val, "EX", ttl);
    return this.redis.set(`${this.prefix}${key}`, val);
  }

  async get(key) {
    const data = await this.redis.get(`${this.prefix}${key}`);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  }

  async del(key) {
    return this.redis.del(`${this.prefix}${key}`);
  }

  async delPattern(pattern) {
    const keys = await this.redis.keys(`${this.prefix}${pattern}`);
    if (keys.length > 0) await Promise.all(keys.map((k) => this.redis.del(k)));
  }
}


const cacheService = new RedisService(cacheRedis, "cache:");
const sessionService = new RedisService(sessionRedis, "session:");

module.exports = {
  cacheService,
  sessionService,
};
