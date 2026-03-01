import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";
import { logger } from "./logger";

interface RateLimitResult {
  success: boolean;
  remaining: number;
}

// Only create Redis client if env vars are present
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// Default: 10 req / 10s per IP
const defaultLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, "10 s") })
  : null;

// Auth: 5 req / 60s per IP
const authLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "60 s") })
  : null;

// Checkout: 3 req / 60s per IP
const checkoutLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(3, "60 s") })
  : null;

const limiters = {
  default: defaultLimiter,
  auth: authLimiter,
  checkout: checkoutLimiter,
} as const;

type LimiterPreset = keyof typeof limiters;

/**
 * Rate limit a request by identifier (usually IP).
 * Falls back to noop (always allows) when Redis is not configured.
 */
export async function rateLimit(
  identifier: string,
  opts?: { preset?: LimiterPreset }
): Promise<RateLimitResult> {
  const preset = opts?.preset ?? "default";
  const limiter = limiters[preset];

  if (!limiter) {
    // No Redis configured — allow all (dev mode)
    return { success: true, remaining: -1 };
  }

  try {
    const result = await limiter.limit(identifier);
    return { success: result.success, remaining: result.remaining };
  } catch (err) {
    logger.error("Rate limit error", {
      error: err instanceof Error ? err.message : "Unknown",
    });
    // On error, allow the request (fail open)
    return { success: true, remaining: -1 };
  }
}

/**
 * Rate limit by client IP with safe headers() extraction.
 * Never throws — fails open on any error (headers unavailable, Redis down, etc.).
 */
export async function rateLimitByIp(
  prefix: string,
  preset: LimiterPreset = "default"
): Promise<RateLimitResult> {
  try {
    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    return await rateLimit(`${prefix}:${ip}`, { preset });
  } catch {
    // headers() unavailable (e.g. test environment) — allow
    return { success: true, remaining: -1 };
  }
}
