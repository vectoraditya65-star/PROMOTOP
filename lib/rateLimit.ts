import "server-only";

// Production: distributed, persistent rate limiting via Upstash Redis, so
// limits hold even across multiple serverless instances.
// Local dev without Redis configured: falls back to an in-memory limiter so
// `npm run dev` still works out of the box, but this is NOT safe for a real
// deployment with more than one server process.

type LimitResult = { success: boolean; remaining: number };

const memoryStore = new Map<string, { count: number; resetAt: number }>();

function memoryLimit(key: string, max: number, windowMs: number): LimitResult {
  const now = Date.now();
  const entry = memoryStore.get(key);
  if (!entry || entry.resetAt < now) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: max - 1 };
  }
  entry.count += 1;
  const success = entry.count <= max;
  return { success, remaining: Math.max(0, max - entry.count) };
}

let upstash: { limit: (key: string) => Promise<LimitResult> } | null = null;

async function getUpstash() {
  if (upstash) return upstash;
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  const { Ratelimit } = await import("@upstash/ratelimit");
  const { Redis } = await import("@upstash/redis");
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "60 s"),
  });
  upstash = {
    limit: async (key: string) => {
      const r = await limiter.limit(key);
      return { success: r.success, remaining: r.remaining };
    },
  };
  return upstash;
}

/**
 * Rate-limit a request by an identifying key (usually IP + route name).
 * Used on every write-capable API route (checkout, product creation, admin
 * login) to blunt brute-force and payment-spam abuse.
 */
export async function rateLimit(
  key: string,
  max = 10,
  windowMs = 60_000
): Promise<LimitResult> {
  const client = await getUpstash();
  if (client) return client.limit(key);
  return memoryLimit(key, max, windowMs);
}

export function clientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
