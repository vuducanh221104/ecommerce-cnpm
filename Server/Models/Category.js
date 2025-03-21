const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategorySchema = new Schema(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
    },

    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
        collection: 'category',
    },
);

module.exports = mongoose.model('Category', CategorySchema);
