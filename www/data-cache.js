// ── Big Cookies — Shared Data Cache ──────────
// Single fetchJSON with in-memory cache, in-flight dedup, and graceful fallback.
// Used by data-loader, quiz, atlas, easter eggs, and dynamic counters.
// Attached to window.BigCookiesData so no module loader is needed.
(function() {
    var cache = {};       // url → parsed JSON
    var inflight = {};    // url → Promise (for dedup)

    /**
     * Fetch JSON from a URL. Returns a Promise.
     * - Uses default browser cache (not "no-cache") unless forceRefresh is true.
     * - Deduplicates in-flight requests: if the same URL is already loading,
     *   the existing Promise is returned.
     * - Caches parsed JSON in memory for the lifetime of the page.
     * - Falls back gracefully: rejected Promise on network error (never throws).
     *
     * @param {string}  url
     * @param {{ forceRefresh?: boolean, signal?: AbortSignal }} [options]
     * @returns {Promise<object|null>}
     */
    function fetchJSON(url, options) {
        options = options || {};
        var forceRefresh = !!options.forceRefresh;
        var signal = options.signal;

        // 1. In-memory cache hit (skip if forceRefresh)
        if (!forceRefresh && cache.hasOwnProperty(url)) {
            return Promise.resolve(cache[url]);
        }

        // 2. In-flight dedup: return the existing promise
        if (!forceRefresh && inflight.hasOwnProperty(url)) {
            return inflight[url];
        }

        // 3. Fresh fetch
        var promise = fetch(url, { signal: signal })
            .then(function(res) {
                if (!res.ok) throw new Error('HTTP ' + res.status + ' for ' + url);
                return res.json();
            })
            .then(function(data) {
                cache[url] = data;
                delete inflight[url];
                return data;
            })
            .catch(function(err) {
                delete inflight[url];
                // Re-throw so callers can handle gracefully
                throw err;
            });

        inflight[url] = promise;
        return promise;
    }

    /** Synchronous cache read — returns null if not cached. */
    function getCached(url) {
        return cache.hasOwnProperty(url) ? cache[url] : null;
    }

    /** Pre-warm the cache with already-fetched data (e.g. from data-loader). */
    function setCache(url, data) {
        cache[url] = data;
    }

    /** Clear all cached data (useful for testing / hard refresh). */
    function clearCache() {
        cache = {};
        inflight = {};
    }

    window.BigCookiesData = {
        fetchJSON: fetchJSON,
        getCached: getCached,
        setCache: setCache,
        clearCache: clearCache
    };
})();
