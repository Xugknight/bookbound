const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookSchema = new Schema(
    {
        owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        workKey: { type: String, required: true, trim: true },
        title: { type: String, required: true, trim: true, maxLength: 180 },
        authors: { type: [String], default: [] },
        coverId: { type: Number, default: null },
        status: { type: String, enum: ['to-read', 'reading', 'done'], default: 'to-read', index: true },
        rating: { type: Number, min: 1, max: 5, default: null },
        notes: { type: String, trim: true, maxLength: 2000 },
        order: { type: Number, default: () => Date.now() }
    },
    { timestamps: true }
);

bookSchema.index({ owner: 1, workKey: 1 }, { unique: true });
bookSchema.index({ owner: 1, status: 1, order: -1, createdAt: -1 });

module.exports = mongoose.model('Book', bookSchema);