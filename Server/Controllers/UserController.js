const User = require('../Models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

class UserController {
    // Đăng ký tài khoản mới
    async registerUser(req, res) {
        try {
            const { user_name, email, password, full_name } = req.body;

            // Kiểm tra email đã được sử dụng chưa
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email đã được sử dụng',
                });
            }

            // Mã hóa mật khẩu
            const hashedPassword = await bcrypt.hash(password, 10);

            // Tạo user mới
            const newUser = new User({
                user_name,
                email,
                password: hashedPassword,
                full_name: full_name || '',
                type: 'WEBSITE',
                role: 0,
                gender: '',
                status: 1,
            });

            // Lưu vào database
            await newUser.save();

            return res.status(201).json({
                success: true,
                message: 'Đăng ký tài khoản thành công',
                user: {
                    _id: newUser._id,
                    user_name: newUser.user_name,
                    email: newUser.email,
                },
            });
        } catch (error) {
            console.error('Register error:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi đăng ký tài khoản',
                error: error.message,
            });
        }
    }

    // Đăng nhập
    async loginUser(req, res) {
        try {
            const { email, password } = req.body;

            // Tìm user theo email
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Email hoặc mật khẩu không đúng',
                });
            }

            // Kiểm tra mật khẩu
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Email hoặc mật khẩu không đúng',
                });
            }

            // Kiểm tra tài khoản bị khóa
            if (user.status === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'Tài khoản của bạn đã bị khóa',
                });
            }

            // Tạo token
            const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

            return res.status(200).json({
                success: true,
                message: 'Đăng nhập thành công',
                user: {
                    _id: user._id,
                    user_name: user.user_name,
                    full_name: user.full_name,
                    email: user.email,
                    role: user.role,
                    phone_number: user.phone_number,
                    avatar: user.avatar,
                },
                token,
            });
        } catch (error) {
            console.error('Login error:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi đăng nhập',
                error: error.message,
            });
        }
    }

    // Lấy thông tin chi tiết của user
    async getUserInfo(req, res) {
        try {
            const userId = req.params.id;

            const user = await User.findById(userId).select('-password');

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy người dùng',
                });
            }

            return res.status(200).json({
                success: true,
                user,
            });
        } catch (error) {
            console.error('Get user info error:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy thông tin người dùng',
                error: error.message,
            });
        }
    }

    // Cập nhật thông tin người dùng
    async updateUserInfo(req, res) {
        try {
            const userId = req.params.id;
            const { full_name, phone_number, gender, address, date_of_birth, avatar } = req.body;

            // Chuẩn bị dữ liệu cập nhật
            const updateData = {};

            if (full_name) updateData.full_name = full_name;
            if (phone_number) updateData.phone_number = phone_number;
            if (gender !== undefined) updateData.gender = gender;
            if (date_of_birth) updateData.date_of_birth = date_of_birth;
            if (avatar) updateData.avatar = avatar;

            // Cập nhật địa chỉ nếu có
            if (address) {
                updateData.address = {};
                if (address.street) updateData.address.street = address.street;
                if (address.ward) updateData.address.ward = address.ward;
                if (address.district) updateData.address.district = address.district;
                if (address.city) updateData.address.city = address.city;
                if (address.country) updateData.address.country = address.country;
            }

            const updatedUser = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true }).select(
                '-password',
            );

            if (!updatedUser) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy người dùng',
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Cập nhật thông tin thành công',
                user: updatedUser,
            });
        } catch (error) {
            console.error('Update user info error:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi khi cập nhật thông tin người dùng',
                error: error.message,
            });
        }
    }

    // Đổi mật khẩu
    async changePassword(req, res) {
        try {
            const userId = req.params.id;
            const { currentPassword, newPassword } = req.body;
            const currentUserId = req.user?.userId;

            // Kiểm tra quyền truy cập
            if (userId !== currentUserId && req.user?.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Không có quyền đổi mật khẩu user này',
                });
            }

            // Tìm user
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy user',
                });
            }

            // Kiểm tra mật khẩu hiện tại
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({
                    success: false,
                    message: 'Mật khẩu hiện tại không đúng',
                });
            }

            // Mã hóa mật khẩu mới
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Cập nhật mật khẩu
            user.password = hashedPassword;
            await user.save();

            return res.status(200).json({
                success: true,
                message: 'Đổi mật khẩu thành công',
            });
        } catch (error) {
            console.error('Change password error:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi đổi mật khẩu',
                error: error.message,
            });
        }
    }

    // Lấy danh sách tất cả user (dành cho Admin)
    async getAllUsers(req, res) {
        try {
            // Xây dựng điều kiện lọc
            const filterConditions = {};

            // Lọc theo role
            if (req.query.role) {
                filterConditions.role = req.query.role === 'admin' ? 1 : 0;
            }

            // Lọc theo trạng thái
            if (req.query.status) {
                filterConditions.status = req.query.status === 'active' ? 1 : 0;
            }

            // Tìm kiếm theo tên, email hoặc số điện thoại
            if (req.query.search) {
                const searchRegex = new RegExp(req.query.search, 'i');
                filterConditions.$or = [
                    { user_name: searchRegex },
                    { email: searchRegex },
                    { phone_number: searchRegex },
                    { full_name: searchRegex },
                ];
            }

            // Phân trang
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            // Thực hiện truy vấn
            const users = await User.find(filterConditions)
                .select('-password')
                .skip(skip)
                .limit(limit)
                .sort({ created_at: -1 });

            const total = await User.countDocuments(filterConditions);
            return res.status(200).json({
                success: true,
                users,
                pagination: {
                    total,
                    page,
                    pages: Math.ceil(total / limit),
                },
            });
        } catch (error) {
            console.error('Get all users error:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy danh sách người dùng',
                error: error.message,
            });
        }
    }

    // Admin cập nhật thông tin user
    async updateUserByAdmin(req, res) {
        try {
            const userId = req.params.id;
            const { user_name, email, full_name, phone_number, role, gender, address, date_of_birth, status } =
                req.body;

            // Kiểm tra email đã tồn tại
            if (email) {
                const existingUser = await User.findOne({ email, _id: { $ne: userId } });
                if (existingUser) {
                    return res.status(400).json({
                        success: false,
                        message: 'Email đã được sử dụng bởi người dùng khác',
                    });
                }
            }

            // Chuẩn bị dữ liệu cập nhật
            const updateData = {};

            if (user_name) updateData.user_name = user_name;
            if (email) updateData.email = email;
            if (full_name) updateData.full_name = full_name;
            if (phone_number) updateData.phone_number = phone_number;
            if (role !== undefined) updateData.role = role;
            if (gender !== undefined) updateData.gender = gender;
            if (date_of_birth) updateData.date_of_birth = date_of_birth;
            if (status !== undefined) updateData.status = status;

            // Cập nhật địa chỉ nếu có
            if (address) {
                updateData.address = {};
                if (address.street) updateData.address.street = address.street;
                if (address.ward) updateData.address.ward = address.ward;
                if (address.district) updateData.address.district = address.district;
                if (address.city) updateData.address.city = address.city;
                if (address.country) updateData.address.country = address.country;
            }

            const updatedUser = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true }).select(
                '-password',
            );

            if (!updatedUser) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy người dùng',
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Cập nhật thông tin người dùng thành công',
                user: updatedUser,
            });
        } catch (error) {
            console.error('Admin update user error:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi khi cập nhật thông tin người dùng',
                error: error.message,
            });
        }
    }

    // Admin thay đổi trạng thái khóa/mở khóa tài khoản
    async changeUserStatus(req, res) {
        try {
            const userId = req.params.id;
            const { status } = req.body;

            if (status === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng cung cấp trạng thái (status)',
                });
            }

            // Kiểm tra tài khoản tồn tại
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy người dùng',
                });
            }

            // Kiểm tra không thể khóa tài khoản admin
            if (user.role === 1 && status === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'Không thể khóa tài khoản admin',
                });
            }

            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { $set: { status: status } },
                { new: true },
            ).select('-password');

            return res.status(200).json({
                success: true,
                message: status === 1 ? 'Mở khóa tài khoản thành công' : 'Khóa tài khoản thành công',
                user: updatedUser,
            });
        } catch (error) {
            console.error('Change user status error:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi khi thay đổi trạng thái tài khoản',
                error: error.message,
            });
        }
    }

    // Admin tạo tài khoản mới
    async createUserByAdmin(req, res) {
        try {
            const { user_name, email, password, full_name, phone_number, role, status } = req.body;

            // Kiểm tra dữ liệu đầu vào
            if (!user_name || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng cung cấp đầy đủ thông tin user_name, email và password',
                });
            }

            // Kiểm tra định dạng email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Email không hợp lệ',
                });
            }

            // Kiểm tra mật khẩu
            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'Mật khẩu phải có ít nhất 6 ký tự',
                });
            }

            // Kiểm tra user_name và email đã tồn tại chưa
            const existingUser = await User.findOne({
                $or: [{ user_name }, { email }],
            });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: existingUser.user_name === user_name ? 'Tên đăng nhập đã tồn tại' : 'Email đã tồn tại',
                });
            }

            // Tạo user mới
            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = await User.create({
                user_name,
                email,
                password: hashedPassword,
                full_name: full_name || user_name,
                phone_number: phone_number || '',
                role: role !== undefined ? role : 0, // Mặc định là user thường (0)
                status: status !== undefined ? (status === 'active' ? 1 : 0) : 1, // Mặc định là hoạt động (1)
            });

            // Trả về thông tin user (loại bỏ password)
            const userToReturn = newUser.toObject();
            delete userToReturn.password;

            return res.status(201).json({
                success: true,
                message: 'Tạo tài khoản mới thành công',
                user: userToReturn,
            });
        } catch (error) {
            console.error('Create user by admin error:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi khi tạo tài khoản mới',
                error: error.message,
            });
        }
    }
}

module.exports = new UserController();
