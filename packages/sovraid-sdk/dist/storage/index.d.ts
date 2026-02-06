/**
 * SovraID Storage Adapters
 * Storage adapter implementations for persisting credential status
 */
import { StorageAdapter } from "../types";
/**
 * Upstash Redis storage adapter
 * Usage: createRedisAdapter({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN })
 */
export declare function createRedisAdapter(redisClient: {
    get: <T>(key: string) => Promise<T | null>;
    set: <T>(key: string, value: T, options?: {
        ex?: number;
    }) => Promise<unknown>;
    del: (key: string) => Promise<unknown>;
}): StorageAdapter;
/**
 * In-memory storage adapter (for development/testing)
 * Note: Data is lost when the process restarts
 */
export declare function createMemoryAdapter(): StorageAdapter;
/**
 * Vercel KV storage adapter (uses @vercel/kv)
 * Usage: createVercelKVAdapter(kv)
 */
export declare function createVercelKVAdapter(kvClient: {
    get: <T>(key: string) => Promise<T | null>;
    set: <T>(key: string, value: T, options?: {
        ex?: number;
    }) => Promise<unknown>;
    del: (key: string) => Promise<unknown>;
}): StorageAdapter;
//# sourceMappingURL=index.d.ts.map