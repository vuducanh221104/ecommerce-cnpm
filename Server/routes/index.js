const categoryRoutes = require('./category');
const productRoutes = require('./products');
const materialRoutes = require('./material');
const authRoutes = require('./auth');
const cartRouctes = require('./cart');
const wishlistRoutes = require('./wishlist');
const orderRoutes = require('./order');
const userRoutes = require('./user');
const uploadRoutes = require('../Upload/uploadCloudinary');
// const homeRoutes = require('./home');
// const newsRoutes = require('./news');

function routes(app) {
    app.use('/api/v1/product', productRoutes);
    app.use('/api/v1/material', materialRoutes);
    app.use('/api/v1/category', categoryRoutes);
    app.use('/api/v1/auth', authRoutes);
    app.use('/api/v1/cart', cartRouctes);
    app.use('/api/v1/wishlist', wishlistRoutes);
    app.use('/api/v1/order', orderRoutes);
    app.use('/api/v1/user', userRoutes);
    app.use('/api/v1/upload', uploadRoutes);
    // app.use('/api/v1/home', homeRoutes);
    // app.use('/api/v1/news', newsRoutes);
}

module.exports = routes;
