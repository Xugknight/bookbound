const Book = require('../models/book');

module.exports = { index, create };

async function index(req, res) {
    const currentPage = Math.max(1, parseInt(req.query.page, 10) || 1);
    const itemsPerPage = Math.min(25, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const statusFilter = (req.query.status || '').trim();
    const searchQuery = (req.query.q || '').trim();

    const filter = { owner: req.user._id };
    if (statusFilter && ['to-read', 'reading', 'done'].includes(statusFilter)) filter.status = statusFilter;
    if (searchQuery) {
        filter.$or = [
            { title: { $regex: searchQuery, $options: 'i' } },
            { authors: { $elemMatch: { $regex: searchQuery, $options: 'i' } } },
            { notes: { $regex: searchQuery, $options: 'i' } },
        ];
    }

    const totalCount = await Book.countDocuments(filter);
    const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));
    const skipCount = (currentPage - 1) * itemsPerPage;

    const pageData = await Book.find(filter)
        .sort({ order: -1, createdAt: -1 })
        .skip(skipCount)
        .limit(itemsPerPage);

    res.json({ data: pageData, total: totalCount, page: currentPage, pages: totalPages });
}

async function create(req, res) {
    const { workKey, title, authors = [], coverId = null } = req.body || {};
    if (!workKey || !title) return res.status(400).json({ message: 'workKey and title are required' });

    try {
        const book = await Book.findOneAndUpdate(
            { owner: req.user._id, workKey },
            { $setOnInsert: { owner: req.user._id, workKey, title, authors, coverId, status: 'to-read', order: Date.now() } },
            { new: true, upsert: true }
        );
        res.status(201).json(book);
    } catch (err) {
        res.status(400).json({ message: err.message || 'Failed to Add Book' });
    }
}