const express = require('express');
const router = express.Router();
const AuthController = require('../Controllers/AuthController');

// Auth routes
router.delete('/address/:id', AuthController.removeAddress);
router.post('/register', AuthController.addUser);
router.post('/login', AuthController.loginUser);
router.post('/logout', AuthController.logoutUser);

// User profile routes
router.post('/update', AuthController.updateUser);
router.post('/change-password', AuthController.changePassword);
router.post('/address', AuthController.addAddress);
router.put('/address/:id', AuthController.updateAddress);
router.get('/address', AuthController.getUserAddresses);

//Token
router.post('/refreshToken', AuthController.requestRefreshToken);

module.exports = router;
