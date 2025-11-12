import rateLimit from "express-rate-limit";
import { getEnv } from "./env";

export const limiter = rateLimit({
  windowMs: 60 * 1000,

  limit: getEnv("NODE_ENV") === "production" ? 5 : 100,
  message: { error: "Has alcanzado el limite de peticiones" },
});
