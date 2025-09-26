const BASE_URL = 'https://openlibrary.org/search.json';

const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;
function getCache(key) {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.t > CACHE_TTL) { cache.delete(key); return null; }
    return entry.v;
}
function setCache(key, value) {
    cache.set(key, { v: value, t: Date.now() });
    if (cache.size > 500) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
    }
}

module.exports = {
    search
};

async function search(req, res) {
    const rawQuery = (req.query.q || '').trim();
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    if (!rawQuery) return res.status(400).json({ message: 'Missing Query Param: q' });
    if (rawQuery.length > 100) return res.status(400).json({ message: 'Query Too Long' });

    const cacheKey = `${rawQuery.toLowerCase()}::${page}::${limit}`;
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    const url =
        `${BASE_URL}?q=${encodeURIComponent(rawQuery)}&page=${page}` +
        `&fields=key,title,author_name,cover_i,first_publish_year` +
        `&limit=${limit}`;

    try {
        const data = await fetchWithTimeoutAndRetry(url, { retries: 1, timeoutMs: 6000 });
        const results = (data.docs || []).slice(0, limit).map((doc) => ({
            workKey: doc.key,
            title: doc.title,
            authors: doc.author_name || [],
            coverId: doc.cover_i || null,
            firstPublishYear: doc.first_publish_year || null,
        }));

        res.json({
            results,
            numFound: data.numFound || results.length,
            page,
            limit,
        });
    } catch (err) {
        console.error('Open Library Search Failed:', err.message);
        const status = err.name === 'AbortError' ? 504 : 502;
        res.status(status).json({ message: 'Failed to Fetch From Open Library' });
    }
}

async function fetchWithTimeoutAndRetry(url, { retries = 0, timeoutMs = 6000 } = {}) {
    let lastErr;
    for (let attempt = 0; attempt <= retries; attempt += 1) {
        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), timeoutMs);

            const resp = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Bookbound/1.0 (dev; no-email)',
                    'Accept': 'application/json'
                }
            });

            clearTimeout(timer);

            if (!resp.ok) {
                if (resp.status === 503 && attempt < retries) {
                    await sleep(300 * (attempt + 1));
                    continue;
                }
                throw new Error(`Open Library Responded ${resp.status}`);
            }

            return resp.json();
        } catch (err) {
            lastErr = err;
            if (attempt < retries) {
                await sleep(300 * (attempt + 1));
                continue;
            }
            throw err;
        }
    }
    throw lastErr || new Error('Unknown Fetch Error');
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }