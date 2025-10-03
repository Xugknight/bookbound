export async function searchOpenLibrary({ query, page = 1, limit = 10 }) {
    if (!query?.trim()) return { results: [], numFound: 0, page: 1 };

    const params = new URLSearchParams({
        q: query.trim(),
        page: String(page),
        limit: String(limit),
    });

    let res;
    try {
        res = await fetch(`/api/ol/search?${params.toString()}`);
    } catch {
        throw new Error('Network error. Please check your connection and try again.');
    }

    if (res.status === 429) {
        const secs = res.headers.get('retry-after');
        throw new Error(secs ? `Too many requests. Try again in ${secs}s.` : 'Too many requests. Try again soon.');
    }

    if (!res.ok) {
        const err = await safeJson(res);
        if (res.status === 504) {
            throw new Error('Open Library API is having trouble completing this search right now. Please try again in a moment.');
        }
        if (res.status === 503) {
            throw new Error('Open Library API is temporarily unavailable. Please try again shortly.');
        }
        if (res.status === 502) {
            throw new Error('Open Library API returned an error. Please try again soon.');
        }
        throw new Error(err?.message || `Search Failed (${res.status})`);
    }
    return res.json();
}

async function safeJson(res) {
    try { return await res.json(); } catch { return null; }
}

export function coverUrl(coverId, size = 'M') {
    return coverId ? `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg` : null;
}