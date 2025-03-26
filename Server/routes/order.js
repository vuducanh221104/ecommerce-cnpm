const express = require('express');
const router = express.Router();
const orderController = require('../Controllers/OrderController');

// Create new order
router.post('/create', orderController.createOrder);

// Get all orders for a user
router.get('/user/:user_id', orderController.getUserOrders);

// Admin routes - phải được đặt trước các routes có params động như /:id
// Get all orders with pagination and filters
router.get('/admin', orderController.getAllOrders);

// Update order by admin
router.patch('/admin/:id', orderController.updateOrderByAdmin);

// Get order details by ID
router.get('/:id', orderController.getOrderById);

// Update order status
router.patch('/status/:id', orderController.updateOrderStatus);

// Cancel order
router.patch('/cancel/:id', orderController.cancelOrder);

module.exports = router;
