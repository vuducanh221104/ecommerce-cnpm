const express = require('express');
const router = express.Router();
const userController = require('../Controllers/UserController');
const authMiddleware = require('../Middlewares/authMiddleware');
const adminMiddleware = require('../Middlewares/adminMiddleware');

// Routes công khai
router.patch('/admin/:id', userController.updateUserByAdmin); // Admin cập nhật user
router.patch('/:id/password', userController.changePassword); // Đổi mật khẩu
router.get('/admin', userController.getAllUsers); // Lấy danh sách tất cả users
router.post('/admin', userController.createUserByAdmin);
router.post('/login', userController.loginUser); // Đăng nhập
router.post('/register', userController.registerUser); // Đăng ký
router.get('/:id', userController.getUserInfo); // Lấy thông tin user
router.patch('/:id', userController.updateUserInfo); // Cập nhật thông tin user

// Routes yêu cầu xác thực

// Routes dành cho admin
router.patch('/admin/:id/status', userController.changeUserStatus); // Khóa/mở khóa tài khoản

module.exports = router;
