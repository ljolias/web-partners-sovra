/**
 * SovraID Storage Adapters
 * Storage adapter implementations for persisting credential status
 */
/**
 * Upstash Redis storage adapter
 * Usage: createRedisAdapter({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN })
 */
export function createRedisAdapter(redisClient) {
    return {
        async get(key) {
            return redisClient.get(key);
        },
        async set(key, value, options) {
            await redisClient.set(key, value, options);
        },
        async delete(key) {
            await redisClient.del(key);
        },
    };
}
/**
 * In-memory storage adapter (for development/testing)
 * Note: Data is lost when the process restarts
 */
export function createMemoryAdapter() {
    const store = new Map();
    // Cleanup expired entries periodically
    const cleanup = () => {
        const now = Date.now();
        for (const [key, entry] of store.entries()) {
            if (entry.expiresAt && entry.expiresAt < now) {
                store.delete(key);
            }
        }
    };
    // Run cleanup every minute
    const cleanupInterval = setInterval(cleanup, 60000);
    // Don't prevent process exit
    if (cleanupInterval.unref) {
        cleanupInterval.unref();
    }
    return {
        async get(key) {
            const entry = store.get(key);
            if (!entry)
                return null;
            // Check expiration
            if (entry.expiresAt && entry.expiresAt < Date.now()) {
                store.delete(key);
                return null;
            }
            return entry.value;
        },
        async set(key, value, options) {
            const expiresAt = options?.ex ? Date.now() + options.ex * 1000 : undefined;
            store.set(key, { value, expiresAt });
        },
        async delete(key) {
            store.delete(key);
        },
    };
}
/**
 * Vercel KV storage adapter (uses @vercel/kv)
 * Usage: createVercelKVAdapter(kv)
 */
export function createVercelKVAdapter(kvClient) {
    return createRedisAdapter(kvClient);
}
//# sourceMappingURL=index.js.map