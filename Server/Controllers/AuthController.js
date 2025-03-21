const User = require('../Models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AuthController {
    // [POST] ~ LOGIN USER
    async loginUser(req, res) {
        try {
            const { usernameOrEmail, password: passwordHashed } = req.body;

            const user = await User.findOne({
                $or: [{ user_name: usernameOrEmail }, { email: usernameOrEmail }],
            });

            if (!user) {
                return res.status(404).json({ success: false, message: 'Wrong username or email' });
            }

            const validPassword = await bcrypt.compare(passwordHashed, user.password);
            if (!validPassword) {
                return res.status(404).json({ success: false, message: 'Wrong password' });
            }

            // Create JWT token
            const accessToken = jwt.sign(
                { _id: user._id, role: user.role },
                process.env.JWT_ACCESS_KEY || 'achats_jwt_secret_key',
                { expiresIn: '1d' },
            );

            // Remove sensitive data before sending back
            const { password, ...userData } = user._doc;

            return res.status(200).json({
                success: true,
                message: 'Login successful',
                user: userData,
                accessToken,
            });
        } catch (error) {
            console.error('Login error:', error);
            return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
        }
    }

    // [POST] ~ LOGOUT USER
    async logoutUser(req, res) {
        try {
            res.clearCookie('refreshToken');
            res.clearCookie('isVerifyEmail');
            return res.status(200).json({ success: true, message: 'Logged out successfully' });
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Error Server', error: error.message });
        }
    }

    //[POST] ~ ADD USER
    async addUser(req, res) {
        try {
            const {
                user_name,
                email,
                password,
                full_name,
                type,
                role,
                gender,
                phone_number,
                address,
                avatar,
                date_of_birth,
                status,
            } = req.body;

            if (!user_name || !email || !password) {
                return res.status(400).json({ success: false, message: 'Missing required fields' });
            }

            // Check if username or email already exists
            const existingUser = await User.findOne({
                $or: [{ user_name }, { email }],
            });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: existingUser.user_name === user_name ? 'Username already exists' : 'Email already exists',
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            // Create new user
            const newUser = new User({
                user_name,
                email,
                password: hashedPassword,
                full_name: full_name || '',
                type: type || 'WEBSITE',
                role: role || 0,
                gender: gender || '',
                phone_number: phone_number || '',
                address: address || {
                    street: '',
                    ward: '',
                    district: '',
                    city: '',
                    country: '',
                },
                avatar: avatar || '',
                date_of_birth: date_of_birth || '',
                status: status || 1,
                cart: [],
                wishlist: [],
            });

            // Save user to database
            const savedUser = await newUser.save();

            // Remove password from response
            const { password: pwd, ...userData } = savedUser._doc;

            return res.status(201).json({
                success: true,
                message: 'User registered successfully!',
                user: userData,
            });
        } catch (error) {
            console.error('Error adding user:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message,
            });
        }
    }

    // [POST] ~ UPDATE USER
    async updateUser(req, res) {
        try {
            const { _id, full_name, email, phone_number, current_password, avatar, gender, date_of_birth } = req.body;

            // Find the user
            const user = await User.findById(_id);
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            // If updating email, verify current password
            if (email && email !== user.email) {
                if (!current_password) {
                    return res
                        .status(400)
                        .json({ success: false, message: 'Current password is required to update email' });
                }

                const validPassword = await bcrypt.compare(current_password, user.password);
                if (!validPassword) {
                    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
                }

                // Check if email is already in use by another user
                const existingEmail = await User.findOne({ email, _id: { $ne: _id } });
                if (existingEmail) {
                    return res.status(400).json({ success: false, message: 'Email is already in use' });
                }
            }

            // Update user fields
            const updateData = {};
            if (full_name) updateData.full_name = full_name;
            if (email) updateData.email = email;
            if (phone_number) updateData.phone_number = phone_number;
            if (avatar) updateData.avatar = avatar;
            if (gender) updateData.gender = gender;
            if (date_of_birth) updateData.date_of_birth = date_of_birth;

            // Update user
            const updatedUser = await User.findByIdAndUpdate(_id, updateData, { new: true });

            // Remove password before sending response
            const { password, ...userData } = updatedUser._doc;

            return res.status(200).json({
                success: true,
                message: 'User information updated successfully',
                user: userData,
            });
        } catch (error) {
            console.error('Error updating user:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message,
            });
        }
    }

    // [POST] ~ CHANGE PASSWORD
    async changePassword(req, res) {
        try {
            const { _id, current_password, new_password } = req.body;

            if (!current_password || !new_password) {
                return res.status(400).json({ success: false, message: 'Missing required fields' });
            }

            // Find the user
            const user = await User.findById(_id);
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            // Verify current password
            const validPassword = await bcrypt.compare(current_password, user.password);
            if (!validPassword) {
                return res.status(400).json({ success: false, message: 'Current password is incorrect' });
            }

            // Hash new password
            const hashedNewPassword = await bcrypt.hash(new_password, 10);

            // Update password
            await User.findByIdAndUpdate(_id, { password: hashedNewPassword });

            return res.status(200).json({
                success: true,
                message: 'Password changed successfully',
            });
        } catch (error) {
            console.error('Error changing password:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message,
            });
        }
    }

    // [POST] ~ ADD ADDRESS
    async addAddress(req, res) {
        try {
            const { user_id, name, address, is_default, tag } = req.body;

            if (!user_id || !address || !address.street || !address.city || !address.country) {
                return res.status(400).json({ success: false, message: 'Missing required address fields' });
            }

            // Find the user
            const user = await User.findById(user_id);
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            // Update user's address if it's the default or there's no existing address
            if (is_default || !user.address.street) {
                user.address = address;
                user.full_name = name || user.full_name; // Update name if provided

                await user.save();
            }

            // In a real app, you might store multiple addresses in a separate collection
            // For now, we'll just use the single address field in the User model

            // Remove password before sending response
            const { password, ...userData } = user._doc;

            return res.status(200).json({
                success: true,
                message: 'Address added successfully',
                user: userData,
            });
        } catch (error) {
            console.error('Error adding address:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message,
            });
        }
    }

    // [PUT] ~ UPDATE ADDRESS
    async updateAddress(req, res) {
        try {
            const { user_id, name, address, is_default, tag } = req.body;
            const { id } = req.params; // Address ID

            if (!user_id || !address || !address.street || !address.city || !address.country) {
                return res.status(400).json({ success: false, message: 'Missing required address fields' });
            }

            // Find the user
            const user = await User.findById(user_id);
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            // Since we're only storing one address in the User model for now,
            // we'll just update it if it's the default address
            if (is_default) {
                user.address = address;
                user.full_name = name || user.full_name; // Update name if provided

                await user.save();
            }

            // Remove password before sending response
            const { password, ...userData } = user._doc;

            return res.status(200).json({
                success: true,
                message: 'Address updated successfully',
                user: userData,
            });
        } catch (error) {
            console.error('Error updating address:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message,
            });
        }
    }

    // [DELETE] ~ REMOVE ADDRESS
    async removeAddress(req, res) {
        try {
            const { id } = req.params; // Address ID
            const { user_id } = req.query;

            // Find the user
            const user = await User.findById(user_id);
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            // Since we're only storing one address in the User model for now,
            // we'll just clear it
            user.address = {
                street: '',
                ward: '',
                district: '',
                city: '',
                country: '',
            };

            await user.save();

            // Remove password before sending response
            const { password, ...userData } = user._doc;

            return res.status(200).json({
                success: true,
                message: 'Address removed successfully',
                user: userData,
            });
        } catch (error) {
            console.error('Error removing address:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message,
            });
        }
    }

    // [GET] ~ GET USER ADDRESSES
    async getUserAddresses(req, res) {
        try {
            const { user_id } = req.query;

            // Find the user
            const user = await User.findById(user_id);
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            // Since we're only storing one address in the User model for now,
            // we'll just return it as an array with one element
            let addresses = [];

            if (user.address && user.address.street) {
                // Format the address for display
                const formattedAddress = `${user.address.street}${
                    user.address.ward ? `, ${user.address.ward}` : ''
                }${user.address.district ? `, ${user.address.district}` : ''}${
                    user.address.city ? `, ${user.address.city}` : ''
                }${user.address.country ? `, ${user.address.country}` : ''}`;

                addresses = [
                    {
                        _id: 'default_address',
                        name: user.full_name || user.user_name,
                        // Store both formatted address for display and original address object
                        address: formattedAddress,
                        addressObj: user.address,
                        is_default: true,
                        tag: 'Home',
                        // Always include tags array for frontend
                        tags: ['Home', 'Default billing address'],
                    },
                ];
            }

            return res.status(200).json({
                success: true,
                addresses,
            });
        } catch (error) {
            console.error('Error getting user addresses:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message,
            });
        }
    }
}

module.exports = new AuthController();
