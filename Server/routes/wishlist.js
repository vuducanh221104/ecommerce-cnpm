const express = require('express');
const router = express.Router();
const WishlistController = require('../Controllers/WishlistController');

// [GET] ~ GET USER WISHLIST
router.get('/:userId', WishlistController.getUserWishlist);

// [POST] ~ ADD ITEM TO WISHLIST
router.post('/:userId', WishlistController.addToWishlist);

// [DELETE] ~ REMOVE ITEM FROM WISHLIST
router.delete('/:userId/item', WishlistController.removeFromWishlist);

// [DELETE] ~ CLEAR WISHLIST
router.delete('/:userId/clear', WishlistController.clearWishlist);

module.exports = router;
