const Product = require('../Models/Product');
const Category = require('../Models/Category');
const Material = require('../Models/Material');
const mongoose = require('mongoose');

class ProductController {
    // [GET] Get all products with pagination
    async getAllProducts(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const page = parseInt(req.query.page) || 1;
            const skip = (page - 1) * limit;
            const sortBy = req.query.sort_by || 'created_at';
            const sortOrder = req.query.sort_order || 'desc';

            const sortOptions = {};
            if (sortBy === 'price-asc') {
                sortOptions['price.original'] = 1;
            } else if (sortBy === 'price-desc') {
                sortOptions['price.original'] = -1;
            } else if (sortBy === 'newest') {
                sortOptions['created_at'] = -1;
            } else {
                sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
            }

            const products = await Product.find({})
                .populate('material_id')
                .populate('category_id')
                .sort(sortOptions)
                .skip(skip)
                .limit(limit);

            const totalProducts = await Product.countDocuments({});
            const totalPages = Math.ceil(totalProducts / limit);

            res.status(200).json({
                success: true,
                data: products,
                pagination: {
                    total: totalProducts,
                    page,
                    limit,
                    totalPages,
                },
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    // [GET] Get a single product by ID or slug
    async getProductById(req, res) {
        try {
            const { id } = req.params;
            let product;

            if (mongoose.Types.ObjectId.isValid(id)) {
                product = await Product.findById(id).populate('material_id').populate('category_id');
            } else {
                product = await Product.findOne({ slug: id }).populate('material_id').populate('category_id');
            }

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found',
                });
            }

            res.status(200).json({
                success: true,
                data: product,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    // [GET] Search products by query and filters
    async searchProductByQueryAndFilter(req, res) {
        try {
            const { query, category, material, minPrice, maxPrice, colors, sizes } = req.query;
            const limit = parseInt(req.query.limit) || 10;
            const page = parseInt(req.query.page) || 1;
            const skip = (page - 1) * limit;
            const sortBy = req.query.sort_by || 'created_at';
            const sortOrder = req.query.sort_order || 'desc';

            const filter = {};

            // Search by query
            if (query) {
                filter.name = { $regex: query, $options: 'i' };
            }

            // Filter by category
            if (category) {
                const categoryIds = Array.isArray(category) ? category : [category];
                filter.category_id = { $in: categoryIds };
            }

            // Filter by material
            if (material) {
                const materialIds = Array.isArray(material) ? material : [material];
                filter.material_id = { $in: materialIds };
            }

            // Filter by price range
            if (minPrice || maxPrice) {
                filter.price = {};
                if (minPrice) filter.price.original = { $gte: parseInt(minPrice) };
                if (maxPrice) filter.price.original = { ...filter.price.original, $lte: parseInt(maxPrice) };
            }

            // Filter by colors
            if (colors) {
                const colorArray = Array.isArray(colors) ? colors : [colors];
                filter.colors = { $in: colorArray };
            }

            // Filter by sizes
            if (sizes) {
                const sizeArray = Array.isArray(sizes) ? sizes : [sizes];
                filter['sizes.size'] = { $in: sizeArray };
            }

            const sortOptions = {};
            if (sortBy === 'price-asc') {
                sortOptions['price.original'] = 1;
            } else if (sortBy === 'price-desc') {
                sortOptions['price.original'] = -1;
            } else if (sortBy === 'newest') {
                sortOptions['created_at'] = -1;
            } else {
                sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
            }

            const products = await Product.find(filter)
                .populate('material_id')
                .populate('category_id')
                .sort(sortOptions)
                .skip(skip)
                .limit(limit);

            const totalProducts = await Product.countDocuments(filter);
            const totalPages = Math.ceil(totalProducts / limit);

            res.status(200).json({
                success: true,
                data: products,
                pagination: {
                    total: totalProducts,
                    page,
                    limit,
                    totalPages,
                },
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    // [GET] Get featured products
    async getFeaturedProducts(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 8;

            const products = await Product.find({})
                .sort({ 'price.discount_quantity': -1 })
                .limit(limit)
                .populate('material_id')
                .populate('category_id');

            res.status(200).json({
                success: true,
                data: products,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    // [GET] Get products by category
    async getProductsByCategory(req, res) {
        try {
            const categorySlug = req.params.categorySlug;

            // Find the category by slug
            const category = await Category.findOne({ slug: categorySlug });

            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found',
                });
            }

            // Find products that have this category in their category_id array
            const products = await Product.find({ category_id: category._id })
                .populate({
                    path: 'material_id',
                    select: 'name slug',
                })
                .populate({
                    path: 'category_id',
                    select: 'name slug',
                });

            return res.status(200).json({
                success: true,
                data: {
                    category,
                    products,
                },
            });
        } catch (error) {
            console.error('Error fetching products by category:', error);
            return res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message,
            });
        }
    }

    // [POST] Create a new product
    async createProduct(req, res) {
        try {
            const productData = req.body;

            const newProduct = new Product(productData);
            await newProduct.save();

            res.status(201).json({
                success: true,
                message: 'Product created successfully',
                data: newProduct,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    // [PUT] Update a product
    async updateProduct(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true })
                .populate('material_id')
                .populate('category_id');

            if (!updatedProduct) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found',
                });
            }

            res.status(200).json({
                success: true,
                message: 'Product updated successfully',
                data: updatedProduct,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    // [DELETE] Delete a product
    async deleteProduct(req, res) {
        try {
            const { id } = req.params;

            const deletedProduct = await Product.findByIdAndDelete(id);

            if (!deletedProduct) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found',
                });
            }

            res.status(200).json({
                success: true,
                message: 'Product deleted successfully',
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    // [POST] Add a comment to a product
    async addComment(req, res) {
        try {
            const { id } = req.params;
            const { user_id, content, rating } = req.body;

            const product = await Product.findById(id);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found',
                });
            }

            product.comment.push({
                user_id,
                content,
                rating,
            });

            await product.save();

            res.status(200).json({
                success: true,
                message: 'Comment added successfully',
                data: product,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    // [GET] Check stock availability for a specific size
    async checkSizeStock(req, res) {
        try {
            const { productId, size } = req.params;

            const product = await Product.findById(productId);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found',
                });
            }

            const sizeInfo = product.sizes.find((s) => s.size === size);

            if (!sizeInfo) {
                return res.status(404).json({
                    success: false,
                    message: 'Size not found for this product',
                });
            }

            res.status(200).json({
                success: true,
                data: {
                    product: product.name,
                    size: size,
                    stock: sizeInfo.stock,
                    available: sizeInfo.stock > 0,
                },
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    // [GET] Search products by query and filters
    async searchProducts(req, res) {
        try {
            const { q, limit = 0 } = req.query;

            if (!q) {
                return res.status(400).json({
                    success: false,
                    message: 'Search query is required',
                });
            }

            // Create a case-insensitive regex pattern for the search query
            const searchRegex = new RegExp(q, 'i');

            // Build search query to look in name, description, and category names
            const searchQuery = {
                $or: [{ name: searchRegex }],
            };

            // Find products that match the search query
            let productsQuery = Product.find(searchQuery)
                .populate({
                    path: 'category_id',
                    select: 'name slug',
                })
                .populate({
                    path: 'material_id',
                    select: 'name slug',
                })
                .sort({ created_at: -1 });

            // Apply limit if provided
            if (limit > 0) {
                productsQuery = productsQuery.limit(parseInt(limit));
            }

            const products = await productsQuery.exec();

            // Also search for matching categories
            const categories = await Category.find({ name: searchRegex }).select('name slug').limit(4).exec();

            return res.status(200).json({
                success: true,
                data: {
                    products,
                    categories,
                    totalCount: products.length,
                    query: q,
                },
            });
        } catch (error) {
            console.error('Search products error:', error);
            return res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message,
            });
        }
    }
}

module.exports = new ProductController();
