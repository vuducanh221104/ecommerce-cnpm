const Product = require('../Models/Product');
const Category = require('../Models/Category');
const Material = require('../Models/Material');
const mongoose = require('mongoose');

class ProductController {
    // [GET] Get all products with pagination
    async getAllProducts(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 30;
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
            const { user_id, user_name, avatar, content, rating } = req.body;

            console.log(`Adding comment to product ${id}:`, { user_id, user_name, content, rating });

            const product = await Product.findById(id);

            if (!product) {
                console.log(`Product not found: ${id}`);
                return res.status(404).json({
                    success: false,
                    message: 'Product not found',
                });
            }

            product.comment.push({
                user_id,
                user_name,
                avatar,
                content,
                rating,
                likes: 0,
                replies: [],
            });

            await product.save();
            console.log(`Comment added successfully to product ${id}`);

            res.status(200).json({
                success: true,
                message: 'Comment added successfully',
                data: product.comment[product.comment.length - 1],
            });
        } catch (error) {
            console.error(`Error adding comment to product ${req.params.id}:`, error);
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    // [GET] Get comments for a product
    async getProductComments(req, res) {
        try {
            const { id } = req.params;
            const { page = 1, limit = 10 } = req.query;

            console.log(`Getting comments for product ${id}, page ${page}, limit ${limit}`);

            const product = await Product.findById(id).populate({
                path: 'comment.user_id',
                select: 'user_name avatar',
            });

            if (!product) {
                console.log(`Product not found: ${id}`);
                return res.status(404).json({
                    success: false,
                    message: 'Product not found',
                });
            }

            // Sort comments by creation date (newest first)
            const comments = product.comment.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            // Apply pagination
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;
            const paginatedComments = comments.slice(startIndex, endIndex);

            console.log(`Found ${comments.length} comments, returning ${paginatedComments.length} for page ${page}`);

            res.status(200).json({
                success: true,
                data: {
                    comments: paginatedComments,
                    totalComments: comments.length,
                    totalPages: Math.ceil(comments.length / limit),
                    currentPage: parseInt(page),
                },
            });
        } catch (error) {
            console.error(`Error getting comments for product ${req.params.id}:`, error);
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    // [POST] Reply to a comment
    async replyToComment(req, res) {
        try {
            const { id, commentId } = req.params;
            const { user_id, user_name, avatar, content } = req.body;

            const product = await Product.findById(id);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found',
                });
            }

            const comment = product.comment.id(commentId);

            if (!comment) {
                return res.status(404).json({
                    success: false,
                    message: 'Comment not found',
                });
            }

            comment.replies.push({
                user_id,
                user_name,
                avatar,
                content,
                created_at: new Date(),
            });

            await product.save();

            res.status(200).json({
                success: true,
                message: 'Reply added successfully',
                data: comment.replies[comment.replies.length - 1],
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    // [POST] Like a comment
    async likeComment(req, res) {
        try {
            const { id, commentId } = req.params;
            const userId = req.body.user_id || 'anonymous';

            console.log(`Liking comment ${commentId} for product ${id} by user ${userId}`);

            const product = await Product.findById(id);

            if (!product) {
                console.log(`Product not found: ${id}`);
                return res.status(404).json({
                    success: false,
                    message: 'Product not found',
                });
            }

            const comment = product.comment.id(commentId);

            if (!comment) {
                console.log(`Comment not found: ${commentId}`);
                return res.status(404).json({
                    success: false,
                    message: 'Comment not found',
                });
            }

            // Kiểm tra xem user đã like comment này chưa
            if (comment.likedBy && comment.likedBy.includes(userId)) {
                console.log(`User ${userId} already liked comment ${commentId}`);
                return res.status(400).json({
                    success: false,
                    message: 'You have already liked this comment',
                });
            }

            // Thêm user_id vào mảng likedBy và tăng số lượng like
            if (!comment.likedBy) {
                comment.likedBy = [];
            }
            comment.likedBy.push(userId);
            comment.likes = comment.likedBy.length;

            await product.save();
            console.log(`Comment ${commentId} now has ${comment.likes} likes`);

            res.status(200).json({
                success: true,
                message: 'Comment liked successfully',
                data: {
                    likes: comment.likes,
                    liked: true,
                },
            });
        } catch (error) {
            console.error(`Error liking comment for product ${req.params.id}:`, error);
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    // [POST] Unlike a comment
    async unlikeComment(req, res) {
        try {
            const { id, commentId } = req.params;
            const userId = req.body.user_id || 'anonymous';

            console.log(`Unliking comment ${commentId} for product ${id} by user ${userId}`);

            const product = await Product.findById(id);

            if (!product) {
                console.log(`Product not found: ${id}`);
                return res.status(404).json({
                    success: false,
                    message: 'Product not found',
                });
            }

            const comment = product.comment.id(commentId);

            if (!comment) {
                console.log(`Comment not found: ${commentId}`);
                return res.status(404).json({
                    success: false,
                    message: 'Comment not found',
                });
            }

            // Kiểm tra xem user có trong danh sách đã like không
            if (!comment.likedBy || !comment.likedBy.includes(userId)) {
                console.log(`User ${userId} has not liked comment ${commentId} yet`);
                return res.status(400).json({
                    success: false,
                    message: 'You have not liked this comment yet',
                });
            }

            // Xóa user_id khỏi mảng likedBy và cập nhật số lượng like
            comment.likedBy = comment.likedBy.filter((id) => id !== userId);
            comment.likes = comment.likedBy.length;

            await product.save();
            console.log(`Comment ${commentId} now has ${comment.likes} likes after unlike`);

            res.status(200).json({
                success: true,
                message: 'Comment unliked successfully',
                data: {
                    likes: comment.likes,
                    liked: false,
                },
            });
        } catch (error) {
            console.error(`Error unliking comment for product ${req.params.id}:`, error);
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

    // [GET] Kiểm tra user đã like comments nào
    async checkUserLikedComments(req, res) {
        try {
            const { id } = req.params;
            const userId = req.query.user_id;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID is required',
                });
            }

            console.log(`Checking liked comments for user ${userId} on product ${id}`);

            const product = await Product.findById(id);

            if (!product) {
                console.log(`Product not found: ${id}`);
                return res.status(404).json({
                    success: false,
                    message: 'Product not found',
                });
            }

            // Lọc ra các comment mà user đã like
            const likedCommentIds = product.comment
                .filter((comment) => comment.likedBy && comment.likedBy.includes(userId))
                .map((comment) => comment._id.toString());

            console.log(`User ${userId} has liked ${likedCommentIds.length} comments on product ${id}`);

            res.status(200).json({
                success: true,
                data: {
                    likedCommentIds,
                },
            });
        } catch (error) {
            console.error(`Error checking liked comments for product ${req.params.id}:`, error);
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    // [GET] Get all comments across all products (for admin)
    async getAllComments(req, res) {
        try {
            const { page = 1, limit = 10, productId, rating, search, fromDate, toDate } = req.query;

            // Build query filters
            const filterConditions = {};

            if (productId) {
                filterConditions._id = productId;
            }

            // Prepare for aggregation pipeline
            const aggregationPipeline = [];

            // Match products based on filters (if any)
            if (Object.keys(filterConditions).length > 0) {
                aggregationPipeline.push({ $match: filterConditions });
            }

            // Unwind the comments array
            aggregationPipeline.push({ $unwind: { path: '$comment', preserveNullAndEmptyArrays: false } });

            // Add product info to each comment
            aggregationPipeline.push({
                $addFields: {
                    'comment.product_id': '$_id',
                    'comment.product_name': '$name',
                },
            });

            // Apply comment filters
            const commentFilters = {};

            if (rating) {
                commentFilters['comment.rating'] = parseInt(rating);
            }

            if (search) {
                const searchRegex = new RegExp(search, 'i');
                commentFilters['$or'] = [
                    { 'comment.user_name': searchRegex },
                    { 'comment.content': searchRegex },
                    { name: searchRegex }, // Product name
                ];
            }

            if (fromDate && toDate) {
                commentFilters['comment.created_at'] = {
                    $gte: new Date(fromDate),
                    $lte: new Date(toDate + 'T23:59:59.999Z'),
                };
            }

            if (Object.keys(commentFilters).length > 0) {
                aggregationPipeline.push({ $match: commentFilters });
            }

            // Sort by date (newest first)
            aggregationPipeline.push({ $sort: { 'comment.created_at': -1 } });

            // Count total documents for pagination
            const countPipeline = [...aggregationPipeline];
            countPipeline.push({ $count: 'total' });

            // Apply pagination
            const skip = (parseInt(page) - 1) * parseInt(limit);
            aggregationPipeline.push({ $skip: skip });
            aggregationPipeline.push({ $limit: parseInt(limit) });

            // Project only the needed fields
            aggregationPipeline.push({
                $project: {
                    _id: 0,
                    comment: 1,
                },
            });

            // Execute aggregation
            const [comments, countResult] = await Promise.all([
                Product.aggregate(aggregationPipeline),
                Product.aggregate(countPipeline),
            ]);

            // Transform the result
            const formattedComments = comments.map((item) => item.comment);
            const total = countResult.length > 0 ? countResult[0].total : 0;

            res.status(200).json({
                success: true,
                comments: formattedComments,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(total / parseInt(limit)),
                },
            });
        } catch (error) {
            console.error('Error getting all comments:', error);
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    // [PATCH] Update comment status
    async updateCommentStatus(req, res) {
        try {
            const { id, commentId } = req.params;
            const { status } = req.body;

            if (!['approved', 'hidden', 'pending'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status. Status must be approved, hidden, or pending',
                });
            }

            const product = await Product.findById(id);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found',
                });
            }

            const comment = product.comment.id(commentId);

            if (!comment) {
                return res.status(404).json({
                    success: false,
                    message: 'Comment not found',
                });
            }

            // Update comment status
            comment.status = status;
            await product.save();

            res.status(200).json({
                success: true,
                message: `Comment status updated to ${status}`,
                comment,
            });
        } catch (error) {
            console.error('Error updating comment status:', error);
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    // [DELETE] Delete a comment
    async deleteComment(req, res) {
        try {
            const { id, commentId } = req.params;

            console.log(`Deleting comment. Product ID: ${id}, Comment ID: ${commentId}`);

            // Kiểm tra ID hợp lệ
            if (!id || !commentId) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing product ID or comment ID',
                });
            }

            // Tìm sản phẩm
            const product = await Product.findById(id);

            if (!product) {
                console.log(`Product not found: ${id}`);
                return res.status(404).json({
                    success: false,
                    message: 'Product not found',
                });
            }

            // Kiểm tra bình luận tồn tại không (hỗ trợ cả ObjectId và String)
            const commentIndex = product.comment.findIndex(
                (comment) => comment._id.toString() === commentId || comment._id === commentId,
            );

            if (commentIndex === -1) {
                console.log(`Comment not found in product ${id}. Comment ID: ${commentId}`);
                return res.status(404).json({
                    success: false,
                    message: 'Comment not found',
                });
            }

            // Log thông tin bình luận trước khi xóa
            console.log(`Found comment at index ${commentIndex}. Removing...`);

            // Xóa bình luận
            product.comment.splice(commentIndex, 1);
            await product.save();

            console.log(`Comment deleted successfully from product ${id}`);
            return res.status(200).json({
                success: true,
                message: 'Comment deleted successfully',
            });
        } catch (error) {
            console.error('Error deleting comment:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to delete comment',
            });
        }
    }
}

module.exports = new ProductController();
