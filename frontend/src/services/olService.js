export async function searchOpenLibrary({ query, page = 1 }) {
    if (!query?.trim()) return { results: [], numFound: 0, page: 1 };
    const params = new URLSearchParams({ q: query.trim(), page: String(page) });
    const res = await fetch(`/api/ol/search?${params.toString()}`);
    if (!res.ok) {
        const err = await safeJson(res);
        throw new Error(err?.message || `Search Failed (${res.status})`);
    }
    return res.json();
}

async function safeJson(res) {
    try { return await res.json(); } catch { return null; }
}

// helper to build cover images (S|M|L); returns null if none
export function coverUrl(coverId, size = 'M') {
    return coverId ? `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg` : null;
}