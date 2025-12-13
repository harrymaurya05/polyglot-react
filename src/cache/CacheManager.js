import { LocalStorageCache } from "./LocalStorageCache";
import { IndexedDBCache } from "./IndexedDBCache";
/**
 * Cache manager factory
 * Creates appropriate cache instance based on config
 */
export class CacheManager {
    constructor(config) {
        this.config = config;
        this.cache = this.createCache();
    }
    createCache() {
        if (!this.config.enabled) {
            return new NoOpCache();
        }
        switch (this.config.storage) {
            case "localStorage":
                return new LocalStorageCache();
            case "indexedDB":
                return new IndexedDBCache();
            default:
                console.warn(`Unknown cache storage type: ${this.config.storage}, using localStorage`);
                return new LocalStorageCache();
        }
    }
    async set(key, value) {
        const result = this.cache.set(key, value, this.config.ttl);
        if (result instanceof Promise) {
            await result;
        }
    }
    async get(key) {
        const result = this.cache.get(key);
        return result instanceof Promise ? await result : result;
    }
    async has(key) {
        const result = this.cache.has(key);
        return result instanceof Promise ? await result : result;
    }
    async clear() {
        const result = this.cache.clear();
        if (result instanceof Promise) {
            await result;
        }
    }
    async isExpired(key) {
        const result = this.cache.isExpired(key);
        return result instanceof Promise ? await result : result;
    }
}
/**
 * No-op cache for when caching is disabled
 */
class NoOpCache {
    set() {
        // Do nothing
    }
    get() {
        return null;
    }
    has() {
        return false;
    }
    clear() {
        // Do nothing
    }
    isExpired() {
        return true;
    }
}
