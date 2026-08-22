type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const DEFAULT_TTL_MS = 30_000;
const cache = new Map<string, CacheEntry<unknown>>();
const inFlight = new Map<string, Promise<unknown>>();

function makeKey(prefix: string, args: unknown[]) {
  return `${prefix}:${args.map((arg) => JSON.stringify(arg)).join('|')}`;
}

export function getCachedValue<T>(key: string, ttlMs = DEFAULT_TTL_MS) {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return undefined;
  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return undefined;
  }
  return entry.value as T;
}

export function setCachedValue<T>(key: string, value: T, ttlMs = DEFAULT_TTL_MS) {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
}

export function getOrSetCachedValueSync<T>(key: string, factory: () => T, ttlMs = DEFAULT_TTL_MS) {
  const cached = getCachedValue<T>(key, ttlMs);
  if (cached !== undefined) {
    return cached;
  }

  const value = factory();
  setCachedValue(key, value, ttlMs);
  return value;
}

export function invalidateCache(key?: string) {
  if (key) {
    cache.delete(key);
    inFlight.delete(key);
    return;
  }
  cache.clear();
  inFlight.clear();
}

export async function getOrSetCachedValue<T>(key: string, factory: () => Promise<T>, ttlMs = DEFAULT_TTL_MS) {
  const cached = getCachedValue<T>(key, ttlMs);
  if (cached !== undefined) {
    return cached;
  }

  const inflight = inFlight.get(key);
  if (inflight) {
    return inflight as Promise<T>;
  }

  const promise = (async () => {
    try {
      const value = await factory();
      setCachedValue(key, value, ttlMs);
      return value;
    } finally {
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, promise);
  return promise;
}
