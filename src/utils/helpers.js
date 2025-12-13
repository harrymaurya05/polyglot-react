/**
 * Generate a hash from a string
 */
export function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
}
/**
 * Generate cache key for translations
 */
export function getCacheKey(targetLang, textsHash, version) {
    return `translate_${targetLang}_${textsHash}${version ? `_v${version}` : ""}`;
}
/**
 * Split array into chunks
 */
export function chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}
/**
 * Sleep for specified milliseconds
 */
export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            if (i < maxRetries - 1) {
                const delay = baseDelay * Math.pow(2, i);
                await sleep(delay);
            }
        }
    }
    throw lastError || new Error("Max retries exceeded");
}
/**
 * Check if code is running in browser environment
 */
export function isBrowser() {
    return (typeof window !== "undefined" && typeof window.document !== "undefined");
}
/**
 * Get app version from package.json or environment
 */
export function getAppVersion() {
    if (isBrowser()) {
        return window.__APP_VERSION__ || "1.0.0";
    }
    return "1.0.0";
}
/**
 * Validate language code format (ISO 639-1)
 */
export function isValidLanguageCode(code) {
    return /^[a-z]{2}(-[A-Z]{2})?$/.test(code);
}
/**
 * Normalize language code
 */
export function normalizeLanguageCode(code) {
    return code.toLowerCase().split("-")[0];
}
