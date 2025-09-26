export async function searchOpenLibrary({ query, page = 1, limit = 10 }) {
    if (!query?.trim()) return { results: [], numFound: 0, page: 1 };

    const params = new URLSearchParams({
        q: query.trim(),
        page: String(page),
        limit: String(limit),
    });
    const res = await fetch(`/api/ol/search?${params.toString()}`);

    if (res.status === 429) {
        const secs = res.headers.get('retry-after');
        throw new Error(secs ? `Too many requests. Try again in ${secs}s.` : 'Too many requests. Try again soon.');
    }

    if (!res.ok) {
        const err = await safeJson(res);
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