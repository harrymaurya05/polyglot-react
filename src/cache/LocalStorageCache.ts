import type { CacheInterface, CachedData } from "../types";

/**
 * LocalStorage-based cache implementation
 */
export class LocalStorageCache implements CacheInterface {
  private prefix: string;

  constructor(prefix: string = "react_translate_ai") {
    this.prefix = prefix;
  }

  set(key: string, value: any, ttl: number): void {
    const cacheKey = this.getKey(key);
    const data: CachedData = {
      value,
      timestamp: Date.now(),
      ttl,
    };

    try {
      localStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (error) {
      console.error("LocalStorage cache set error:", error);
      // If quota exceeded, clear old caches
      this.clearExpired();
    }
  }

  get(key: string): any | null {
    const cacheKey = this.getKey(key);

    try {
      const item = localStorage.getItem(cacheKey);
      if (!item) return null;

      const data: CachedData = JSON.parse(item);

      // Check if expired
      if (this.isDataExpired(data)) {
        localStorage.removeItem(cacheKey);
        return null;
      }

      return data.value;
    } catch (error) {
      console.error("LocalStorage cache get error:", error);
      return null;
    }
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error("LocalStorage cache clear error:", error);
    }
  }

  isExpired(key: string): boolean {
    const cacheKey = this.getKey(key);

    try {
      const item = localStorage.getItem(cacheKey);
      if (!item) return true;

      const data: CachedData = JSON.parse(item);
      return this.isDataExpired(data);
    } catch (error) {
      return true;
    }
  }

  /**
   * Clear all expired items from cache
   */
  clearExpired(): void {
    try {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith(this.prefix)) {
          const item = localStorage.getItem(key);
          if (item) {
            const data: CachedData = JSON.parse(item);
            if (this.isDataExpired(data)) {
              localStorage.removeItem(key);
            }
          }
        }
      }
    } catch (error) {
      console.error("LocalStorage clear expired error:", error);
    }
  }

  private getKey(key: string): string {
    return `${this.prefix}_${key}`;
  }

  private isDataExpired(data: CachedData): boolean {
    const now = Date.now();
    return now - data.timestamp > data.ttl;
  }
}
