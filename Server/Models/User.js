const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema(
    {
        user_name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        full_name: { type: String },
        type: { type: String, enum: ['WEBSITE', 'GOOGLE', 'FACEBOOK'], default: 'WEBSITE' },
        phone_number: { type: String },
        address: {
            street: { type: String },
            ward: { type: String },
            district: { type: String },
            city: { type: String },
            country: { type: String, default: 'Việt Nam' },
        },
        date_of_birth: { type: String },
        gender: { type: String, enum: ['male', 'female', 'other', ''] },
        avatar: { type: String, default: '' },
        role: { type: Number, enum: [0, 1, 2], default: 0 }, // 0: user, 1: admin, 2: other roles
        status: { type: Number, enum: [0, 1], default: 1 }, // 0: inactive, 1: active
        cart: [
            {
                product_id: { type: Schema.Types.ObjectId, ref: 'Product' },
                name: { type: String, required: true },
                slug: { type: String },
                thumb: { type: String },
                price: {
                    original: { type: Number, required: true },
                    discount: { type: Number, default: 0 },
                },
                quantity: { type: Number, required: true, min: 1 },
                color: { type: String, required: true },
                size: { type: String, required: true },
            },
        ],
        wishlist: [
            {
                product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
                name: { type: String, required: true },
                slug: { type: String, required: true },
                thumb: { type: String, required: true },
                price: {
                    original: { type: Number, required: true },
                    discount: { type: Number },
                },
                category_id: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
                category_name: { type: String },
                color: { type: String, default: 'Gray' },
                addedAt: { type: Date, default: Date.now },
            },
        ],
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
        collection: 'user',
    },
);

module.exports = mongoose.model('User', UserSchema);
