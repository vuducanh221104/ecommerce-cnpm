const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema(
    {
        user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        customer_email: { type: String },
        products: [
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
            },
        ],
        shipping_address: {
            full_name: { type: String, required: true },
            phone_number: { type: String, required: true },
            street: { type: String, required: true },
            ward: { type: String, required: true },
            district: { type: String, required: true },
            city: { type: String, required: true },
            country: { type: String, default: 'Vietnam' },
        },
        payment_method: { type: String, required: true, enum: ['COD'], default: 'COD' },
        total_amount: { type: Number, required: true },
        status: {
            type: String,
            required: true,
            enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
            default: 'pending',
        },
        notes: { type: String },

        // Thêm các trường cho admin quản lý
        admin_notes: { type: String },
        delivery_partner: { type: String },
        tracking_code: { type: String },
        estimated_delivery_date: { type: Date },
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
        collection: 'order',
    },
);

module.exports = mongoose.model('Order', OrderSchema);
