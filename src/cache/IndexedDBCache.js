import { openDB } from "idb";
const DB_NAME = "react_translate_ai_db";
const STORE_NAME = "translations";
const DB_VERSION = 1;
/**
 * IndexedDB-based cache implementation
 * Better for larger datasets and async operations
 */
export class IndexedDBCache {
    constructor() {
        this.dbPromise = this.initDB();
    }
    async initDB() {
        return openDB(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
            },
        });
    }
    async set(key, value, ttl) {
        const data = {
            value,
            timestamp: Date.now(),
            ttl,
        };
        try {
            const db = await this.dbPromise;
            await db.put(STORE_NAME, data, key);
        }
        catch (error) {
            console.error("IndexedDB cache set error:", error);
        }
    }
    async get(key) {
        try {
            const db = await this.dbPromise;
            const data = await db.get(STORE_NAME, key);
            if (!data)
                return null;
            // Check if expired
            if (this.isDataExpired(data)) {
                await db.delete(STORE_NAME, key);
                return null;
            }
            return data.value;
        }
        catch (error) {
            console.error("IndexedDB cache get error:", error);
            return null;
        }
    }
    async has(key) {
        const value = await this.get(key);
        return value !== null;
    }
    async clear() {
        try {
            const db = await this.dbPromise;
            await db.clear(STORE_NAME);
        }
        catch (error) {
            console.error("IndexedDB cache clear error:", error);
        }
    }
    async isExpired(key) {
        try {
            const db = await this.dbPromise;
            const data = await db.get(STORE_NAME, key);
            if (!data)
                return true;
            return this.isDataExpired(data);
        }
        catch (error) {
            return true;
        }
    }
    /**
     * Clear all expired items from cache
     */
    async clearExpired() {
        try {
            const db = await this.dbPromise;
            const tx = db.transaction(STORE_NAME, "readwrite");
            const store = tx.objectStore(STORE_NAME);
            const keys = await store.getAllKeys();
            for (const key of keys) {
                const data = await store.get(key);
                if (data && this.isDataExpired(data)) {
                    await store.delete(key);
                }
            }
            await tx.done;
        }
        catch (error) {
            console.error("IndexedDB clear expired error:", error);
        }
    }
    isDataExpired(data) {
        const now = Date.now();
        return now - data.timestamp > data.ttl;
    }
}
