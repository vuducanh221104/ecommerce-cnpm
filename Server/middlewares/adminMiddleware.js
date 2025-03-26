// Middleware kiểm tra quyền Admin
const adminMiddleware = (req, res, next) => {
    try {
        if (req.user && req.user.role === 1) {
            next();
        } else {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền truy cập tính năng này',
            });
        }
    } catch (error) {
        console.error('Admin middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi xác thực admin',
            error: error.message,
        });
    }
};

module.exports = adminMiddleware;
