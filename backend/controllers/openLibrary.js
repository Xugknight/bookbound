const BASE_URL = 'https://openlibrary.org/search.json';

module.exports = {
    search
};

async function search(req, res) {
    const query = (req.query.q || '').trim();
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    if (!query) return res.status(400).json({ message: 'Missing Query Param: q' });

    try {
        const url = `${BASE_URL}?q=${encodeURIComponent(query)}&page=${page}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Open Library Responded ${response.status}`);
        const data = await response.json();

        const results = (data.docs || []).slice(0, 20).map((doc) => ({
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
        });
    } catch (err) {
        console.error('Open Library Search Failed:', err.message);
        res.status(502).json({ message: 'Failed to Fetch From Open Library' });
    }
}