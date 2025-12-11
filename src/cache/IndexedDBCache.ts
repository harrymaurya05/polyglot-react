import { openDB, type IDBPDatabase } from "idb";
import type { CacheInterface, CachedData } from "../types";

const DB_NAME = "react_translate_ai_db";
const STORE_NAME = "translations";
const DB_VERSION = 1;

/**
 * IndexedDB-based cache implementation
 * Better for larger datasets and async operations
 */
export class IndexedDBCache implements CacheInterface {
  private dbPromise: Promise<IDBPDatabase>;

  constructor() {
    this.dbPromise = this.initDB();
  }

  private async initDB(): Promise<IDBPDatabase> {
    return openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }

  async set(key: string, value: any, ttl: number): Promise<void> {
    const data: CachedData = {
      value,
      timestamp: Date.now(),
      ttl,
    };

    try {
      const db = await this.dbPromise;
      await db.put(STORE_NAME, data, key);
    } catch (error) {
      console.error("IndexedDB cache set error:", error);
    }
  }

  async get(key: string): Promise<any | null> {
    try {
      const db = await this.dbPromise;
      const data: CachedData | undefined = await db.get(STORE_NAME, key);

      if (!data) return null;

      // Check if expired
      if (this.isDataExpired(data)) {
        await db.delete(STORE_NAME, key);
        return null;
      }

      return data.value;
    } catch (error) {
      console.error("IndexedDB cache get error:", error);
      return null;
    }
  }

  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  async clear(): Promise<void> {
    try {
      const db = await this.dbPromise;
      await db.clear(STORE_NAME);
    } catch (error) {
      console.error("IndexedDB cache clear error:", error);
    }
  }

  async isExpired(key: string): Promise<boolean> {
    try {
      const db = await this.dbPromise;
      const data: CachedData | undefined = await db.get(STORE_NAME, key);

      if (!data) return true;

      return this.isDataExpired(data);
    } catch (error) {
      return true;
    }
  }

  /**
   * Clear all expired items from cache
   */
  async clearExpired(): Promise<void> {
    try {
      const db = await this.dbPromise;
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const keys = await store.getAllKeys();

      for (const key of keys) {
        const data: CachedData | undefined = await store.get(key);
        if (data && this.isDataExpired(data)) {
          await store.delete(key);
        }
      }

      await tx.done;
    } catch (error) {
      console.error("IndexedDB clear expired error:", error);
    }
  }

  private isDataExpired(data: CachedData): boolean {
    const now = Date.now();
    return now - data.timestamp > data.ttl;
  }
}
