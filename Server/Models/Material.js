const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MaterialSchema = new Schema(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
    },

    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
        collection: 'material',
    },
);

module.exports = mongoose.model('Material', MaterialSchema);
