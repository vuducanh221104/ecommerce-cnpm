const User = require('../Models/User');

class CartController {
    // [GET] ~ GET USER CART
    async getUserCart(req, res) {
        try {
            const { userId } = req.params;

            // Find the user
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            return res.status(200).json({
                success: true,
                cart: user.cart || [],
            });
        } catch (error) {
            console.error('Error getting user cart:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message,
            });
        }
    }

    // [POST] ~ ADD ITEM TO CART
    async addToCart(req, res) {
        try {
            const { userId } = req.params;
            const cartItem = req.body;

            // Find the user
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            // Initialize cart if it doesn't exist
            if (!user.cart) {
                user.cart = [];
            }

            // Check if item already exists in cart - convert ObjectId to string for comparison
            const existingItemIndex = user.cart.findIndex((item) => {
                const itemProductId = item.product_id.toString();
                const newProductId = cartItem.product_id.toString();
                return itemProductId === newProductId && item.color === cartItem.color && item.size === cartItem.size;
            });

            if (existingItemIndex !== -1) {
                // Update quantity if item exists
                user.cart[existingItemIndex].quantity += cartItem.quantity;
            } else {
                // Add new item if it doesn't exist
                user.cart.push(cartItem);
            }

            // Save updated cart
            await user.save();

            return res.status(200).json({
                success: true,
                message: 'Item added to cart successfully',
                cart: user.cart,
            });
        } catch (error) {
            console.error('Error adding item to cart:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message,
            });
        }
    }

    // [PUT] ~ UPDATE CART ITEM QUANTITY
    async updateCartItemQuantity(req, res) {
        try {
            const { userId } = req.params;
            const { product_id, color, size, quantity } = req.body;

            // Find the user
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            // Find the item in cart
            const itemIndex = user.cart.findIndex(
                (item) => item.product_id === product_id && item.color === color && item.size === size,
            );

            if (itemIndex === -1) {
                return res.status(404).json({ success: false, message: 'Item not found in cart' });
            }

            // Update quantity
            user.cart[itemIndex].quantity = quantity;

            // Save updated cart
            await user.save();

            return res.status(200).json({
                success: true,
                message: 'Cart updated successfully',
                cart: user.cart,
            });
        } catch (error) {
            console.error('Error updating cart:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message,
            });
        }
    }

    // [DELETE] ~ REMOVE ITEM FROM CART
    async removeFromCart(req, res) {
        try {
            const { userId } = req.params;
            const { product_id, color, size } = req.body;

            console.log('Removing cart item:', { userId, product_id, color, size });

            // Find the user
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            // Get initial cart length for verification
            const initialCartLength = user.cart.length;
            console.log(`Initial cart length: ${initialCartLength}`);

            // Remove item from cart - convert ObjectId to string for comparison
            user.cart = user.cart.filter((item) => {
                const itemProductId = item.product_id.toString();
                const requestProductId = product_id.toString();
                return !(itemProductId === requestProductId && item.color === color && item.size === size);
            });

            console.log(`New cart length: ${user.cart.length}`);
            console.log(`Items removed: ${initialCartLength - user.cart.length}`);

            // Save updated cart
            await user.save();

            return res.status(200).json({
                success: true,
                message: 'Item removed from cart successfully',
                cart: user.cart,
            });
        } catch (error) {
            console.error('Error removing item from cart:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message,
            });
        }
    }

    // [DELETE] ~ CLEAR CART
    async clearCart(req, res) {
        try {
            const { userId } = req.params;
            console.log('Clearing cart for user:', userId);

            // Find the user
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            console.log(`Initial cart length before clearing: ${user.cart.length}`);

            // Clear cart
            user.cart = [];

            // Save updated cart
            await user.save();

            console.log('Cart cleared successfully');

            return res.status(200).json({
                success: true,
                message: 'Cart cleared successfully',
                cart: user.cart,
            });
        } catch (error) {
            console.error('Error clearing cart:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message,
            });
        }
    }
}

module.exports = new CartController();
