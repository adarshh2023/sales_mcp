import axios from "axios";
import redisClient from "./redis.js";
import dotenv from "dotenv";

dotenv.config();

const MAX_RETRIES = parseInt(process.env.MAX_RETRIES) || 3;
const RETRY_DELAY = parseInt(process.env.RETRY_DELAY) || 1000;
const CACHE_TTL = parseInt(process.env.CACHE_TTL) || 300;
const CACHE_ENABLED = process.env.CACHE_ENABLED === "true";

class ApiClient {
  constructor() {
    this.baseURL =
      process.env.DEFAULT_ERP_BASE_URL || "https://boothrev.heptanesia.com";
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getCacheKey(url, headers) {
    const userId = headers.userid || "default";
    return `cache:${userId}:${url}`;
  }

  async request(method, endpoint, data = null, headers = {}) {
    const baseURL = headers.baseurl || this.baseURL;
    const token = headers.erptoken || process.env.DEFAULT_ERP_TOKEN;
    const userId = headers.userid || process.env.DEFAULT_USER_ID;
    console.log(`Using baseURL: ${baseURL}`);
    console.log(`Using headers: ${JSON.stringify(headers)}`);

    const url = `${baseURL}${endpoint}`;

    // Check cache for GET requests
    if (CACHE_ENABLED && method === "GET") {
      const cacheKey = this.getCacheKey(url, headers);
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        console.log(`âœ… Cache hit: ${cacheKey}`);
        return {
          data: cached,
          cached: true,
          success: true,
        };
      }
    }

    const config = {
      method,
      url,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        erptoken: token,
        baseurl: baseURL,
        userid: userId,
        ...headers,
      },
      data: data || undefined,
    };

    let lastError = null;
    let attempts = 0;

    while (attempts < MAX_RETRIES) {
      attempts++;

      try {
        console.log(
          `API Request (attempt ${attempts}/${MAX_RETRIES}): ${method} ${url}`,
        );

        const response = await axios(config);

        console.log(`âœ… API Success: ${method} ${url}`);

        // Cache successful GET responses
        if (CACHE_ENABLED && method === "GET" && response.data) {
          const cacheKey = this.getCacheKey(url, headers);
          await redisClient.set(cacheKey, response.data, CACHE_TTL);
          console.log(`ðŸ’¾ Cached response: ${cacheKey}`);
        }

        return {
          data: response.data,
          status: response.status,
          success: true,
          attempts,
        };
      } catch (error) {
        lastError = error;

        const status = error.response?.status;
        const errorMessage = error.response?.data?.message || error.message;

        console.error(
          `âŒ API Error (attempt ${attempts}/${MAX_RETRIES}): ${errorMessage}`,
        );

        // Don't retry on 4xx errors
        if (status >= 400 && status < 500) {
          console.log(`ðŸš« Not retrying - Client error (${status})`);
          break;
        }

        // Retry on 5xx errors or network errors
        if (attempts < MAX_RETRIES) {
          const delay = RETRY_DELAY * Math.pow(2, attempts - 1);
          console.log(`â³ Retrying in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }

    return {
      success: false,
      error: lastError?.response?.data || lastError?.message || "Unknown error",
      status: lastError?.response?.status || 500,
      attempts,
      message: `Failed after ${attempts} attempts: ${
        lastError?.response?.data?.message || lastError?.message
      }`,
    };
  }

  async get(endpoint, headers = {}) {
    return this.request("GET", endpoint, null, headers);
  }

  async post(endpoint, data, headers = {}) {
    return this.request("POST", endpoint, data, headers);
  }

  async put(endpoint, data, headers = {}) {
    return this.request("PUT", endpoint, data, headers);
  }

  async delete(endpoint, headers = {}) {
    return this.request("DELETE", endpoint, null, headers);
  }
}

const apiClient = new ApiClient();
export default apiClient;
