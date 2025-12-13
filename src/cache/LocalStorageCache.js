/**
 * LocalStorage-based cache implementation
 */
export class LocalStorageCache {
    constructor(prefix = "react_translate_ai") {
        this.prefix = prefix;
    }
    set(key, value, ttl) {
        const cacheKey = this.getKey(key);
        const data = {
            value,
            timestamp: Date.now(),
            ttl,
        };
        try {
            localStorage.setItem(cacheKey, JSON.stringify(data));
        }
        catch (error) {
            console.error("LocalStorage cache set error:", error);
            // If quota exceeded, clear old caches
            this.clearExpired();
        }
    }
    get(key) {
        const cacheKey = this.getKey(key);
        try {
            const item = localStorage.getItem(cacheKey);
            if (!item)
                return null;
            const data = JSON.parse(item);
            // Check if expired
            if (this.isDataExpired(data)) {
                localStorage.removeItem(cacheKey);
                return null;
            }
            return data.value;
        }
        catch (error) {
            console.error("LocalStorage cache get error:", error);
            return null;
        }
    }
    has(key) {
        return this.get(key) !== null;
    }
    clear() {
        try {
            const keys = Object.keys(localStorage);
            for (const key of keys) {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            }
        }
        catch (error) {
            console.error("LocalStorage cache clear error:", error);
        }
    }
    isExpired(key) {
        const cacheKey = this.getKey(key);
        try {
            const item = localStorage.getItem(cacheKey);
            if (!item)
                return true;
            const data = JSON.parse(item);
            return this.isDataExpired(data);
        }
        catch (error) {
            return true;
        }
    }
    /**
     * Clear all expired items from cache
     */
    clearExpired() {
        try {
            const keys = Object.keys(localStorage);
            for (const key of keys) {
                if (key.startsWith(this.prefix)) {
                    const item = localStorage.getItem(key);
                    if (item) {
                        const data = JSON.parse(item);
                        if (this.isDataExpired(data)) {
                            localStorage.removeItem(key);
                        }
                    }
                }
            }
        }
        catch (error) {
            console.error("LocalStorage clear expired error:", error);
        }
    }
    getKey(key) {
        return `${this.prefix}_${key}`;
    }
    isDataExpired(data) {
        const now = Date.now();
        return now - data.timestamp > data.ttl;
    }
}
