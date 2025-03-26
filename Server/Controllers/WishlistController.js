const User = require('../Models/User');
const mongoose = require('mongoose');

class WishlistController {
    // [GET] ~ GET USER WISHLIST
    async getUserWishlist(req, res) {
        try {
            const { userId } = req.params;

            // Find the user
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            return res.status(200).json({
                success: true,
                wishlist: user.wishlist || [],
            });
        } catch (error) {
            console.error('Error getting user wishlist:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message,
            });
        }
    }

    // [POST] ~ ADD ITEM TO WISHLIST
    async addToWishlist(req, res) {
        try {
            const { userId } = req.params;
            const wishlistItem = req.body;

            // Validate required fields
            if (
                !wishlistItem.product_id ||
                !wishlistItem.name ||
                !wishlistItem.thumb ||
                !wishlistItem.price ||
                !wishlistItem.price.original
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields for wishlist item',
                });
            }

            // Find the user
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            // Check if item already exists in wishlist
            const existingItemIndex = user.wishlist.findIndex(
                (item) => item.product_id.toString() === wishlistItem.product_id.toString(),
            );

            if (existingItemIndex !== -1) {
                return res.status(400).json({
                    success: false,
                    message: 'Product already in wishlist',
                });
            }

            // Convert product_id to ObjectId if it's a string
            if (typeof wishlistItem.product_id === 'string') {
                wishlistItem.product_id = new mongoose.Types.ObjectId(wishlistItem.product_id);
            }

            // Set category_name to "N/A" if it's not provided
            if (!wishlistItem.category_name) {
                wishlistItem.category_name = 'N/A';
            }

            // Set color to "Gray" if it's not provided
            if (!wishlistItem.color) {
                wishlistItem.color = 'Gray';
            }

            // Set current date for addedAt
            wishlistItem.addedAt = new Date();

            // Add item to wishlist
            user.wishlist.push(wishlistItem);
            await user.save();

            return res.status(200).json({
                success: true,
                message: 'Item added to wishlist successfully',
                wishlist: user.wishlist,
            });
        } catch (error) {
            console.error('Error adding item to wishlist:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message,
            });
        }
    }

    // [DELETE] ~ REMOVE ITEM FROM WISHLIST
    async removeFromWishlist(req, res) {
        try {
            const { userId } = req.params;
            const { product_id } = req.body;

            console.log('Removing wishlist item:', { userId, product_id });
            console.log('Product ID type:', typeof product_id);

            if (!product_id) {
                return res.status(400).json({ success: false, message: 'Product ID is required' });
            }

            // Convert product_id to ObjectId if needed
            let productIdObj;
            try {
                productIdObj = typeof product_id === 'string' ? new mongoose.Types.ObjectId(product_id) : product_id;

                console.log('Converted product ID:', productIdObj);
            } catch (error) {
                console.error('Error converting product ID to ObjectId:', error);
                return res.status(400).json({
                    success: false,
                    message: 'Invalid product ID format',
                });
            }

            // Find the user
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            // Get initial wishlist length for verification
            const initialWishlistLength = user.wishlist.length;
            console.log(`Initial wishlist length: ${initialWishlistLength}`);

            // Log wishlist items before removal
            console.log(
                'Wishlist product IDs:',
                user.wishlist.map((item) => ({
                    id: item.product_id.toString(),
                    name: item.name,
                })),
            );

            // Remove item from wishlist - using productIdObj for more accurate comparison
            const productIdStr = productIdObj.toString();
            user.wishlist = user.wishlist.filter((item) => {
                const itemProductId = item.product_id.toString();
                console.log(`Comparing: ${itemProductId} vs ${productIdStr}, equal: ${itemProductId === productIdStr}`);
                return itemProductId !== productIdStr;
            });

            console.log(`New wishlist length: ${user.wishlist.length}`);
            console.log(`Items removed: ${initialWishlistLength - user.wishlist.length}`);

            // If no items were removed, product was not in wishlist
            if (user.wishlist.length === initialWishlistLength) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found in wishlist',
                });
            }

            // Save updated wishlist
            await user.save();

            return res.status(200).json({
                success: true,
                message: 'Item removed from wishlist successfully',
                wishlist: user.wishlist,
            });
        } catch (error) {
            console.error('Error removing item from wishlist:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message,
            });
        }
    }

    // [DELETE] ~ CLEAR WISHLIST
    async clearWishlist(req, res) {
        try {
            const { userId } = req.params;
            console.log('Clearing wishlist for user:', userId);

            // Find the user
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            console.log(`Initial wishlist length before clearing: ${user.wishlist.length}`);

            // Clear wishlist
            user.wishlist = [];

            // Save updated wishlist
            await user.save();

            console.log('Wishlist cleared successfully');

            return res.status(200).json({
                success: true,
                message: 'Wishlist cleared successfully',
                wishlist: user.wishlist,
            });
        } catch (error) {
            console.error('Error clearing wishlist:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message,
            });
        }
    }
}

module.exports = new WishlistController();
