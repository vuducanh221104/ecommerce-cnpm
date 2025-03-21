const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema(
    {
        user_name: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: false },
        full_name: { type: String, required: false },
        type: { type: String, required: true, enum: ['WEBSITE', 'GOOGLE'], default: 'WEBSITE' },
        role: { type: Number, required: true, enum: [0, 1, 2], default: 0 }, // Role (0) User , (1) Manager (2) Admin
        gender: { type: String, enum: ['male', 'female', 'other', ''], default: '', required: false },
        phone_number: { type: String, required: false },
        address: {
            street: { type: String, default: '' },
            ward: { type: String, default: '' },
            district: { type: String, default: '' },
            city: { type: String, default: '' },
            country: { type: String, default: '' },
        },
        avatar: { type: String, required: false },
        date_of_birth: { type: String, required: false },
        status: { type: Number, required: true, enum: [0, 1], default: 0 }, // Trạng thái (1: active, 0: inactive)
        cart: [
            {
                product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
                name: { type: String, required: true },
                slug: { type: String, required: true },
                thumb: { type: String, required: true },
                price: {
                    original: { type: Number, required: true },
                    discount: { type: Number },
                },
                color: { type: String, required: true },
                size: { type: String, required: true },
                quantity: { type: Number, required: true, min: 1 },
                addedAt: { type: Date, default: Date.now },
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
