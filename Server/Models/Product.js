const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slug = require('mongoose-slug-updater');
const mongooseDelete = require('mongoose-delete');

const PriceSchema = new Schema(
    {
        original: { type: Number, required: true },
        discount: { type: Number, required: true },
        discount_quantity: { type: Number, required: true, default: 0 },
        currency: { type: String, required: true, default: '$' },
    },
    {
        _id: false,
        timestamps: false,
    },
);
const CommentSchema = new Schema(
    {
        user_id: { type: Schema.Types.ObjectId, ref: 'User' },
        user_name: { type: String, required: true },
        avatar: { type: String, default: '' },
        content: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        likes: { type: Number, default: 0 },
        likedBy: { type: [String], default: [] },
        status: { type: String, enum: ['approved', 'pending', 'hidden'], default: 'pending' },
        replies: [
            {
                user_id: { type: Schema.Types.ObjectId, ref: 'User' },
                user_name: { type: String, required: true },
                avatar: { type: String, default: '' },
                content: { type: String, required: true },
                created_at: { type: Date, default: Date.now },
            },
        ],
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    },
);

const SizeSchema = new Schema(
    {
        size: { type: String, required: true },
        stock: { type: Number, required: true, default: 0 },
    },
    {
        _id: false,
        timestamps: false,
    },
);

const ColorVariantSchema = new Schema(
    {
        color: { type: String, required: true },
        sizes: { type: [SizeSchema], required: true },
        images: { type: [String], required: true },
    },
    {
        _id: false,
        timestamps: false,
    },
);

const ProductSchema = new Schema(
    {
        name: { type: String, required: true },
        price: { type: PriceSchema, required: true },
        thumb: { type: String, required: true },
        description: { type: String, required: true },
        variants: { type: [ColorVariantSchema], required: true },
        material_id: [{ type: Schema.Types.ObjectId, ref: 'Material' }],
        category_id: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
        slug: { type: String, slug: 'name', unique: true },
        comment: { type: [CommentSchema], required: false },
        total_quantity: {
            type: Number,
            default: function () {
                return this.variants.reduce((total, variant) => {
                    return total + variant.sizes.reduce((sizeTotal, size) => sizeTotal + size.stock, 0);
                }, 0);
            },
        },
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
        collection: 'product',
    },
);

mongoose.plugin(slug);
ProductSchema.plugin(mongooseDelete, { overrideMethods: 'all', deletedAt: true });

module.exports = mongoose.model('Product', ProductSchema);
