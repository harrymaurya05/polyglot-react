import type { CacheInterface, CacheConfig } from "../types";
import { LocalStorageCache } from "./LocalStorageCache";
import { IndexedDBCache } from "./IndexedDBCache";

/**
 * Cache manager factory
 * Creates appropriate cache instance based on config
 */
export class CacheManager {
  private cache: CacheInterface;
  private config: CacheConfig;

  constructor(config: CacheConfig) {
    this.config = config;
    this.cache = this.createCache();
  }

  private createCache(): CacheInterface {
    if (!this.config.enabled) {
      return new NoOpCache();
    }

    switch (this.config.storage) {
      case "localStorage":
        return new LocalStorageCache();
      case "indexedDB":
        return new IndexedDBCache();
      default:
        console.warn(
          `Unknown cache storage type: ${this.config.storage}, using localStorage`
        );
        return new LocalStorageCache();
    }
  }

  async set(key: string, value: any): Promise<void> {
    const result = this.cache.set(key, value, this.config.ttl);
    if (result instanceof Promise) {
      await result;
    }
  }

  async get(key: string): Promise<any | null> {
    const result = this.cache.get(key);
    return result instanceof Promise ? await result : result;
  }

  async has(key: string): Promise<boolean> {
    const result = this.cache.has(key);
    return result instanceof Promise ? await result : result;
  }

  async clear(): Promise<void> {
    const result = this.cache.clear();
    if (result instanceof Promise) {
      await result;
    }
  }

  async isExpired(key: string): Promise<boolean> {
    const result = this.cache.isExpired(key);
    return result instanceof Promise ? await result : result;
  }
}

/**
 * No-op cache for when caching is disabled
 */
class NoOpCache implements CacheInterface {
  set(): void {
    // Do nothing
  }

  get(): null {
    return null;
  }

  has(): boolean {
    return false;
  }

  clear(): void {
    // Do nothing
  }

  isExpired(): boolean {
    return true;
  }
}
