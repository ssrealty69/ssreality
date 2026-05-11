import { Redis } from '@upstash/redis';

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.REDIS_URL;
  if (!url) return null;
  try {
    // Parse rediss://default:<token>@<host>:<port>
    const match = url.match(/rediss?:\/\/[^:]+:([^@]+)@([^:]+):(\d+)/);
    if (!match) return null;
    const [, token, host, port] = match;
    redis = new Redis({
      url: `https://${host}`,
      token,
    });
    return redis;
  } catch {
    return null;
  }
}

export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const r = getRedis();
    if (!r) return null;
    return await r.get<T>(key);
  } catch { return null; }
}

export async function setCached<T>(key: string, value: T, ttlSeconds = 3600): Promise<void> {
  try {
    const r = getRedis();
    if (!r) return;
    await r.set(key, value, { ex: ttlSeconds });
  } catch { /* silent */ }
}

export async function invalidateCache(pattern: string): Promise<void> {
  try {
    const r = getRedis();
    if (!r) return;
    const keys = await r.keys(pattern);
    if (keys.length > 0) await r.del(...keys);
  } catch { /* silent */ }
}
