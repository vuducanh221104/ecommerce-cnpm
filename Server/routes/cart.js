const express = require('express');
const router = express.Router();
const CartController = require('../Controllers/CartController');

// [GET] ~ GET USER CART
router.get('/:userId', CartController.getUserCart);

// [POST] ~ ADD ITEM TO CART
router.post('/:userId', CartController.addToCart);

// [PUT] ~ UPDATE CART ITEM QUANTITY
router.put('/:userId/item', CartController.updateCartItemQuantity);

// [DELETE] ~ REMOVE ITEM FROM CART
router.delete('/:userId/item', CartController.removeFromCart);

// [DELETE] ~ CLEAR CART
router.delete('/:userId/clear', CartController.clearCart);

module.exports = router;
