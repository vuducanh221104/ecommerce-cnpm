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

module.exports = router;
