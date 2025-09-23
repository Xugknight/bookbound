const Book = require('../models/book');

module.exports = {
    index,
    create,
    delete: remove,
    update: updateStatus,
};

async function index(req, res) {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(25, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const statusFilter = (req.query.status || '').trim();
    const q = (req.query.q || '').trim();
    const sortKey = (req.query.sort || 'added').trim();

    const filter = { owner: req.user._id };
    if (statusFilter && ['to-read', 'reading', 'done'].includes(statusFilter)) {
        filter.status = statusFilter;
    }
    if (q) {
        filter.$or = [
            { title: { $regex: q, $options: 'i' } },
            { authors: { $elemMatch: { $regex: q, $options: 'i' } } },
            { notes: { $regex: q, $options: 'i' } },
        ];
    }

    let sortSpec;
    switch (sortKey) {
        case 'title':
            sortSpec = { title: 1, order: -1 };
            break;
        case 'author':
            sortSpec = { 'authors.0': 1, order: -1 };
            break;
        case 'status':
            sortSpec = { status: 1, order: -1, createdAt: -1 };
            break;
        case 'added':
        default:
            sortSpec = { order: -1, createdAt: -1 };
            break;
    }

    const total = await Book.countDocuments(filter);
    const pages = Math.max(1, Math.ceil(total / limit));
    const skip = (page - 1) * limit;

    let query = Book.find(filter)
        .sort(sortSpec)
        .skip(skip)
        .limit(limit);

    if (sortKey === 'title' || sortKey === 'author' || sortKey === 'status') {
        query = query.collation({ locale: 'en', strength: 2 });
    }

    const data = await query.exec();
    res.json({ data, total, page, pages });
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

async function remove(req, res) {
    try {
        const deleted = await Book.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
        if (!deleted) return res.status(404).json({ message: 'Not Found' });
        res.json({ ok: true });
    } catch (err) {
        res.status(400).json({ message: err.message || 'Delete Failed' });
    }
}

async function updateStatus(req, res) {
    try {
        const { status } = req.body || {};
        const allowed = ['to-read', 'reading', 'done'];
        if (!allowed.includes(status)) {
            return res.status(400).json({ message: 'Invalid Status' });
        }

        const updated = await Book.findOneAndUpdate(
            { _id: req.params.id, owner: req.user._id },
            { $set: { status } },
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: 'Not Found' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message || 'Update Failed' });
    }
};