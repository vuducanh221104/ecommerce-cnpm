const jwt = require('jsonwebtoken');
const User = require('../Models/User');

// Middleware xác thực token
const authMiddleware = async (req, res, next) => {
    try {
        // Lấy token từ header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Không tìm thấy token xác thực',
            });
        }

        const token = authHeader.split(' ')[1];

        // Xác thực token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Kiểm tra user tồn tại
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Người dùng không tồn tại',
            });
        }

        // Kiểm tra tài khoản bị khóa
        if (user.status === 0) {
            return res.status(403).json({
                success: false,
                message: 'Tài khoản của bạn đã bị khóa',
            });
        }

        // Gắn thông tin user vào request
        req.user = {
            userId: user._id.toString(),
            role: user.role,
        };

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token không hợp lệ',
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token đã hết hạn',
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Lỗi xác thực',
            error: error.message,
        });
    }
};

module.exports = authMiddleware;
