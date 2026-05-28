/**
 * Lightweight in-memory rate limiter for Next.js API routes.
 * Uses a Map to track requests per IP. Works in serverless environments
 * on a per-instance basis (sufficient for most abuse prevention).
 *
 * Usage:
 *   const limiter = rateLimit({ limit: 5, windowMs: 10 * 60 * 1000 });
 *   const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
 *   const { success } = limiter.check(ip);
 *   if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitOptions {
  /** Max allowed requests in the window */
  limit: number;
  /** Time window in milliseconds */
  windowMs: number;
}

interface RateLimitResult {
  success: boolean;
  /** Remaining requests in current window */
  remaining: number;
  /** Milliseconds until window resets */
  retryAfter: number;
}

export function rateLimit(options: RateLimitOptions) {
  const store = new Map<string, RateLimitEntry>();

  // Clean up expired entries every 5 minutes to prevent memory leak
  if (typeof setInterval !== 'undefined') {
    setInterval(() => {
      const now = Date.now();
      store.forEach((entry, key) => {
        if (now > entry.resetAt) store.delete(key);
      });
    }, 5 * 60 * 1000);
  }

  return {
    check(identifier: string): RateLimitResult {
      const now = Date.now();
      const entry = store.get(identifier);

      if (!entry || now > entry.resetAt) {
        // New window
        store.set(identifier, { count: 1, resetAt: now + options.windowMs });
        return { success: true, remaining: options.limit - 1, retryAfter: 0 };
      }

      if (entry.count >= options.limit) {
        return {
          success: false,
          remaining: 0,
          retryAfter: Math.ceil((entry.resetAt - now) / 1000),
        };
      }

      entry.count += 1;
      return {
        success: true,
        remaining: options.limit - entry.count,
        retryAfter: 0,
      };
    },
  };
}

/** Helper: extract the real client IP from Next.js request headers */
export function getClientIp(req: { headers: { get(name: string): string | null } }): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}

// Pre-created limiters for each endpoint type
/** 5 submissions per 10 minutes — for contact/enquiry/careers forms */
export const formLimiter = rateLimit({ limit: 5, windowMs: 10 * 60 * 1000 });

/** 5 login attempts per 15 minutes — for admin login */
export const loginLimiter = rateLimit({ limit: 5, windowMs: 15 * 60 * 1000 });
