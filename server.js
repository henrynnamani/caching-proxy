import express from "express";
import { Redis } from "@upstash/redis";
import * as dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const app = express();

const startServer = async (options) => {
  if (!options.port) {
    console.error("Port is required");
    return;
  }

  if (!options.origin) {
    console.error("Origin is required");
    return;
  }

  app.use(async (req, res) => {
    try {
      const cacheKey = req.originalUrl;

      const cached = await redis.get(cacheKey);

      if (cached) {
        res.setHeader("X-Cache", "HIT");
        return res.send(cached);
      }

      const targetUrl = `${options.origin}${req.originalUrl}`;

      const response = await axios({
        method: req.method,
        url: targetUrl,
        headers: { ...req.headers, host: undefined },
        validateStatus: () => true,
      });

      const body = response.data;

      await redis.set(cacheKey, JSON.stringify(body), {
        ex: 60,
      });

      res.setHeader("X-Cache", "MISS");

      res
        .send({
          data: response.data,
        })
        .status(200);
    } catch (err) {
      console.error(err);
      res.status(500).send("Proxy error");
    }
  });

  app.listen(options.port, () => {
    console.log(`Server is running on port ${options.port}`);
  });
};

const clearCache = async () => {
  try {
    await redis.flushall();
    console.log("Cache successfully cleared");
  } catch (err) {
    console.error(err);
    res.status(500).send("Proxy error");
  }
};

export { startServer, clearCache };
