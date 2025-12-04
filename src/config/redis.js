const Redis = require("ioredis");
const env = require("../utils/env");

class InitRedis {
  constructor(host, port, password, db) {
    this.host = host;
    this.port = port;
    this.password = password;
    this.db = db;
    this.redis = null;
    this.init(); 
  }

  init() {
    this.redis = new Redis({
      host: this.host,
      port: this.port,
      password: this.password,
      db: this.db,
      retryStrategy(times) {
        return Math.min(times * 50, 5000);
      },
    });

    this.redis.on("connect", () => {
      console.log(`Redis connected to DB${this.db}`);
    });

    this.redis.on("error", (err) => {
      console.error(`Redis error DB${this.db}:`, err);
    });
  }

  getInstance() {
    return this.redis;
  }
}

const cacheRedis = new InitRedis(
  env.REDIS.HOST,
  env.REDIS.PORT,
  env.REDIS.PASSWORD,
  0
).getInstance();

const sessionRedis = new InitRedis(
  env.REDIS.HOST,
  env.REDIS.PORT,
  env.REDIS.PASSWORD,
  1
).getInstance();

module.exports = { cacheRedis, sessionRedis };
