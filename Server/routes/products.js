const express = require('express');
const router = express.Router();
const ProductController = require('../Controllers/ProductController');

// Get all products with pagination
router.get('/', ProductController.getAllProducts);

// Get a single product by ID or slug
router.get('/:id', ProductController.getProductById);

// Search products by query
router.get('/search/query', ProductController.searchProducts);

// Search products by query and filters
router.get('/search/filter', ProductController.searchProductByQueryAndFilter);

// Get featured products
router.get('/featured/list', ProductController.getFeaturedProducts);

// Get products by category
router.get('/category/:categorySlug', ProductController.getProductsByCategory);

// Check stock availability for a specific size
router.get('/:productId/size/:size', ProductController.checkSizeStock);

// Create a new product
router.post('/', ProductController.createProduct);

// Update a product
router.put('/:id', ProductController.updateProduct);

// Delete a product
router.delete('/:id', ProductController.deleteProduct);

// Add a comment to a product
router.post('/:id/comment', ProductController.addComment);

// Get comments for a product
router.get('/:id/comments', ProductController.getProductComments);

// Reply to a comment
router.post('/:id/comment/:commentId/reply', ProductController.replyToComment);

// Like a comment
router.post('/:id/comment/:commentId/like', ProductController.likeComment);

// Unlike a comment
router.post('/:id/comment/:commentId/unlike', ProductController.unlikeComment);

// Check user liked comments
router.get('/:id/liked-comments', ProductController.checkUserLikedComments);

// Admin comment management routes
router.get('/comments/all', ProductController.getAllComments);
router.patch('/:id/comment/:commentId/status', ProductController.updateCommentStatus);
router.delete('/:id/comment/:commentId', ProductController.deleteComment);

module.exports = router;
