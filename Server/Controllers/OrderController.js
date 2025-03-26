const Order = require('../Models/Order');
const User = require('../Models/User');
const Product = require('../Models/Product');

class OrderController {
    // Create a new order
    async createOrder(req, res) {
        try {
            const { products, shipping_address, payment_method, total_amount, notes } = req.body;
            const user_id = req.body.user_id;

            // Check if user exists
            const user = await User.findById(user_id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
            }

            // Validate products
            if (!products || products.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No products in order',
                });
            }

            // Create new order
            const newOrder = new Order({
                user_id,
                customer_email: user.email,
                products,
                shipping_address,
                payment_method: payment_method || 'COD',
                total_amount,
                notes,
            });

            // Save order to database
            await newOrder.save();

            // Clear user's cart after successful order
            user.cart = [];
            await user.save();

            return res.status(201).json({
                success: true,
                message: 'Order created successfully',
                order: newOrder,
            });
        } catch (error) {
            console.error('Create order error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to create order',
                error: error.message,
            });
        }
    }

    // Get all orders for a user
    async getUserOrders(req, res) {
        try {
            const user_id = req.params.user_id;

            // Kiểm tra xem user có tồn tại không
            const user = await User.findById(user_id).select('email');
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
            }

            // Tìm tất cả đơn hàng của user
            const orders = await Order.find({ user_id }).sort({ created_at: -1 });

            // Đảm bảo tất cả đơn hàng đều có email
            if (orders.length > 0) {
                for (const order of orders) {
                    // Nếu đơn hàng chưa có email, cập nhật email từ user
                    if (!order.customer_email) {
                        order.customer_email = user.email;
                        await order.save();
                    }
                }
            }

            return res.status(200).json({
                success: true,
                orders,
                user_email: user.email, // Thêm email vào response
            });
        } catch (error) {
            console.error('Get user orders error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to get user orders',
                error: error.message,
            });
        }
    }

    // Get order details by ID
    async getOrderById(req, res) {
        try {
            const orderId = req.params.id;

            const order = await Order.findById(orderId);
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found',
                });
            }

            return res.status(200).json({
                success: true,
                order,
            });
        } catch (error) {
            console.error('Get order details error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to get order details',
                error: error.message,
            });
        }
    }

    // Update order status
    async updateOrderStatus(req, res) {
        try {
            const orderId = req.params.id;
            const { status } = req.body;

            const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status',
                });
            }

            const updatedOrder = await Order.findByIdAndUpdate(orderId, { status }, { new: true });

            if (!updatedOrder) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found',
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Order status updated successfully',
                order: updatedOrder,
            });
        } catch (error) {
            console.error('Update order status error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to update order status',
                error: error.message,
            });
        }
    }

    // Cancel order
    async cancelOrder(req, res) {
        try {
            const orderId = req.params.id;
            const userId = req.body.user_id;

            const order = await Order.findById(orderId);

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found',
                });
            }

            // Check if user owns this order
            if (order.user_id.toString() !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized to cancel this order',
                });
            }

            // Check if order can be cancelled (only pending or processing orders)
            if (!['pending', 'processing'].includes(order.status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Order cannot be cancelled at current status',
                });
            }

            // Update order status to cancelled
            order.status = 'cancelled';
            await order.save();

            return res.status(200).json({
                success: true,
                message: 'Order cancelled successfully',
                order,
            });
        } catch (error) {
            console.error('Cancel order error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to cancel order',
                error: error.message,
            });
        }
    }

    // Admin: Get all orders with pagination and filters
    async getAllOrders(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            // Build query based on filters
            let query = {};

            // Status filter
            if (req.query.status) {
                query.status = req.query.status;
            }

            // Date range filter
            if (req.query.startDate && req.query.endDate) {
                query.created_at = {
                    $gte: new Date(req.query.startDate),
                    $lte: new Date(req.query.endDate),
                };
            }

            // Search by order ID, customer name, or email
            if (req.query.search) {
                const searchRegex = new RegExp(req.query.search, 'i');
                query.$or = [
                    { _id: req.query.search.length === 24 ? req.query.search : null },
                    { 'shipping_address.full_name': searchRegex },
                    { customer_email: searchRegex },
                ];
            }

            // Count total orders matching the query
            const total = await Order.countDocuments(query);

            // Fetch orders with pagination
            let orders = await Order.find(query).sort({ created_at: -1 }).skip(skip).limit(limit);

            // Đảm bảo tất cả đơn hàng đều có email
            for (const order of orders) {
                if (!order.customer_email) {
                    const user = await User.findById(order.user_id).select('email');
                    if (user) {
                        order.customer_email = user.email;
                        await order.save();
                    }
                }
            }

            return res.status(200).json({
                success: true,
                orders,
                pagination: {
                    total,
                    page,
                    pages: Math.ceil(total / limit),
                    limit,
                },
            });
        } catch (error) {
            console.error('Get all orders error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to get orders',
                error: error.message,
            });
        }
    }

    // Admin: Update order by admin
    async updateOrderByAdmin(req, res) {
        try {
            const orderId = req.params.id;
            const updateData = req.body;

            // Validate status if provided
            if (updateData.status) {
                const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
                if (!validStatuses.includes(updateData.status)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid status',
                    });
                }
            }

            // Find and update the order
            const updatedOrder = await Order.findByIdAndUpdate(
                orderId,
                {
                    ...updateData,
                    $set: { updated_at: new Date() },
                },
                { new: true },
            );

            if (!updatedOrder) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found',
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Order updated successfully',
                order: updatedOrder,
            });
        } catch (error) {
            console.error('Update order by admin error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to update order',
                error: error.message,
            });
        }
    }
}

module.exports = new OrderController();
