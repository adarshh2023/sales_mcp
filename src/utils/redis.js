import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    if (this.isConnected) {
      return this.client;
    }

    try {
      // Use single connection URL if provided (Render internal or managed Redis)
      if (process.env.REDIS_URL) {
        this.client = createClient({
          url: process.env.REDIS_URL,
        });
      } else {
        this.client = createClient({
          socket: {
            host: process.env.REDIS_HOST || "localhost",
            port: parseInt(process.env.REDIS_PORT) || 6379,
          },
          password: process.env.REDIS_PASSWORD || undefined,
          database: parseInt(process.env.REDIS_DB) || 0,
        });
      }

      this.client.on("error", (err) => {
        console.error("Redis Client Error:", err);
      });

      this.client.on("connect", () => {
        console.log("✅ Redis connected successfully");
      });

      await this.client.connect();
      this.isConnected = true;
      return this.client;
    } catch (error) {
      console.error("❌ Failed to connect to Redis:", error);
      return null;
    }
  }

  async get(key) {
    if (!this.isConnected) {
      await this.connect();
    }
    if (!this.client) return null;

    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error getting key ${key}:`, error);
      return null;
    }
  }

  async set(key, value, ttl = null) {
    if (!this.isConnected) {
      await this.connect();
    }
    if (!this.client) return false;

    try {
      const stringValue = JSON.stringify(value);
      if (ttl) {
        await this.client.setEx(key, ttl, stringValue);
      } else {
        await this.client.set(key, stringValue);
      }
      return true;
    } catch (error) {
      console.error(`Error setting key ${key}:`, error);
      return false;
    }
  }

  async del(key) {
    if (!this.isConnected) {
      await this.connect();
    }
    if (!this.client) return false;

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error(`Error deleting key ${key}:`, error);
      return false;
    }
  }

  async exists(key) {
    if (!this.isConnected) {
      await this.connect();
    }
    if (!this.client) return false;

    try {
      const exists = await this.client.exists(key);
      return exists === 1;
    } catch (error) {
      console.error(`Error checking existence of key ${key}:`, error);
      return false;
    }
  }

  async disconnect() {
    if (this.isConnected && this.client) {
      await this.client.quit();
      this.isConnected = false;
      console.log("Redis disconnected");
    }
  }
}

const redisClient = new RedisClient();
export default redisClient;
