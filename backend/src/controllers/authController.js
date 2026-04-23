// backend/src/controllers/authController.js
const mongoose = require('mongoose');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Import models for stats
const CompanyProfile = require('../models/CompanyProfile');
const Tender = require('../models/Tender');
const BidWorkflow = require('../models/BidWorkflow');

// ==================== PUBLIC FUNCTIONS ====================

exports.register = async (req, res) => {
    try {
        console.log('========== REGISTER USER ==========');
        console.log('Request body:', req.body);
        
        const { email, password, name, mobileNumber, companyId, role } = req.body;
        
        if (!email || !password || !name || !mobileNumber) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }
        
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters'
            });
        }
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }
        
        const user = new User({
            email,
            password,
            name,
            mobileNumber,
            companyId: companyId || new mongoose.Types.ObjectId(),
            role: role || 'analyst',
            status: 'active',
            isEmailVerified: true
        });
        
        await user.save();
        
        console.log('✅ User created:', user.email);
        
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );
        
        user.password = undefined;
        
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    mobileNumber: user.mobileNumber
                },
                token
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// backend/src/controllers/authController.js
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('========== LOGIN ATTEMPT ==========');
        console.log('Email:', email);
        
        // Find user
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            console.log('❌ User not found');
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }
        
        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            console.log('❌ Password mismatch');
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }
        
        // Check if user is active
        if (user.status !== 'active') {
            return res.status(401).json({
                success: false,
                message: 'Account is not active'
            });
        }
        
        // Generate token
        const token = jwt.sign(
            { 
                id: user._id, 
                email: user.email, 
                role: user.role 
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );
        
        console.log('✅ Login successful for:', user.email);
        console.log('Token generated:', token.substring(0, 50) + '...');
        
        // Remove password from output
        user.password = undefined;
        
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isAdmin: user.isAdmin,
                    status: user.status
                },
                token,
                expiresIn: 604800 // 7 days in seconds
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({ success: true, data: { user } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({ success: true, data: { user } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== PROFILE FUNCTIONS ====================

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({ success: true, data: { user } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, mobileNumber } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, mobileNumber },
            { new: true }
        ).select('-password');
        
        res.json({ success: true, message: 'Profile updated', data: { user } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'All fields required' });
        }
        
        if (newPassword.length < 8) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
        }
        
        const user = await User.findById(req.user.id).select('+password');
        
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }
        
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        
        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        const { password } = req.body;
        
        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Password is required to delete account'
            });
        }
        
        const user = await User.findById(req.user.id).select('+password');
        
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Password is incorrect'
            });
        }
        
        await User.findByIdAndDelete(req.user.id);
        
        res.status(200).json({
            success: true,
            message: 'Account deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== ADMIN FUNCTIONS ====================

exports.adminCreateUser = async (req, res) => {
    try {
        console.log('========== CREATE ADMIN ==========');
        console.log('Request Body:', req.body);
        
        if (req.user.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only Super Admin can create admin users.'
            });
        }

        const { name, email, password, mobileNumber, role } = req.body;
        
        if (!name || !email || !password || !mobileNumber) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }
        
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters'
            });
        }
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        const adminUser = new User({
            name,
            email,
            password,
            mobileNumber,
            companyId: req.user.companyId || new mongoose.Types.ObjectId(),
            role: role || 'admin',
            isAdmin: true,
            status: 'active',
            isEmailVerified: true
        });

        await adminUser.save();
        
        console.log('✅ Admin created successfully:', adminUser.email);

        res.status(201).json({
            success: true,
            message: 'Admin user created successfully',
            data: {
                user: {
                    id: adminUser._id,
                    name: adminUser.name,
                    email: adminUser.email,
                    role: adminUser.role,
                    mobileNumber: adminUser.mobileNumber
                }
            }
        });
    } catch (error) {
        console.error('❌ Create admin error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create admin user'
        });
    }
};

exports.adminGetAllUsers = async (req, res) => {
    try {
        console.log('========== GET ALL USERS ==========');
        
        // Check if user is admin
        if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const users = await User.find({})
            .select('-password')
            .sort({ createdAt: -1 });
        
        console.log(`Found ${users.length} users`);
        
        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.adminGetUserById = async (req, res) => {
    try {
        if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }
        
        const user = await User.findById(req.params.userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.adminUpdateUserRole = async (req, res) => {
    try {
        console.log('========== UPDATE USER ROLE ==========');
        console.log('User ID:', req.params.userId);
        console.log('New Role:', req.body.role);
        
        const { userId } = req.params;
        const { role } = req.body;
        
        if (!role) {
            return res.status(400).json({
                success: false,
                message: 'Role is required'
            });
        }
        
        // Check if user is admin
        if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }
        
        // Validate role
        const validRoles = ['super_admin', 'admin', 'procurement_manager', 'bid_manager', 'analyst', 'viewer'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role'
            });
        }
        
        // Find and update user
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Update role
        user.role = role;
        user.isAdmin = (role === 'admin' || role === 'super_admin');
        await user.save();
        
        console.log('✅ User updated:', user.email, 'New role:', role);
        
        res.status(200).json({
            success: true,
            message: 'Role updated successfully',
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.adminUpdateUserStatus = async (req, res) => {
    try {
        console.log('========== UPDATE USER STATUS ==========');
        console.log('User ID:', req.params.userId);
        console.log('New Status:', req.body.status);
        
        const { userId } = req.params;
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }
        
        if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }
        
        const validStatuses = ['active', 'inactive', 'suspended'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }
        
        const user = await User.findByIdAndUpdate(
            userId,
            { status: status },
            { new: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        console.log('✅ Status updated:', user.email, '->', status);
        
        res.status(200).json({
            success: true,
            message: `User ${status === 'active' ? 'activated' : 'deactivated'}`,
            data: user
        });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.adminDeleteUser = async (req, res) => {
    try {
        console.log('========== DELETE USER ==========');
        console.log('User ID:', req.params.userId);
        
        const { userId } = req.params;
        
        if (req.user.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Super Admin privileges required.'
            });
        }
        
        if (userId === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own account'
            });
        }
        
        const user = await User.findByIdAndDelete(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        console.log('✅ User deleted:', user.email);
        
        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// FIXED: Get admin stats
exports.adminGetStats = async (req, res) => {
    try {
        console.log('=== ADMIN STATS API CALLED ===');
        
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ status: 'active' });
        const adminUsers = await User.countDocuments({ role: { $in: ['admin', 'super_admin'] } });
        
        let totalCompanies = 0;
        let totalTenders = 0;
        let totalWorkflows = 0;
        let activeTenders = 0;
        let pendingTenders = 0;
        let completedTenders = 0;
        
        try {
            totalCompanies = await CompanyProfile.countDocuments();
            totalTenders = await Tender.countDocuments();
            totalWorkflows = await BidWorkflow.countDocuments();
            activeTenders = await Tender.countDocuments({ status: 'active' });
            pendingTenders = await Tender.countDocuments({ status: 'pending' });
            completedTenders = await Tender.countDocuments({ status: 'completed' });
        } catch (err) {
            console.log('Stats error:', err.message);
        }
        
        const newUsers = await User.countDocuments({
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        });
        
        const responseData = {
            totalUsers: totalUsers || 0,
            activeUsers: activeUsers || 0,
            adminUsers: adminUsers || 0,
            totalCompanies: totalCompanies || 0,
            totalTenders: totalTenders || 0,
            totalWorkflows: totalWorkflows || 0,
            activeTenders: activeTenders || 0,
            pendingTenders: pendingTenders || 0,
            completedTenders: completedTenders || 0,
            newUsers: newUsers || 0,
            inactiveUsers: (totalUsers - activeUsers) || 0
        };
        
        console.log('Stats response:', responseData);
        
        res.status(200).json({
            success: true,
            data: responseData
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ==================== OTHER FUNCTIONS ====================

exports.logout = async (req, res) => {
    try {
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.verifyToken = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.status(200).json({ success: true, message: 'Token is valid', data: { user } });
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

exports.refreshToken = async (req, res) => {
    try {
        const newToken = jwt.sign(
            { id: req.user.id, email: req.user.email, role: req.user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );
        res.status(200).json({ success: true, data: { token: newToken, expiresIn: 604800 } });
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }
};

exports.forgotPassword = async (req, res) => {
    res.status(200).json({ success: true, message: 'Password reset email sent' });
};

exports.resetPassword = async (req, res) => {
    res.status(200).json({ success: true, message: 'Password reset successful' });
};

exports.getPermissions = async (req, res) => {
    try {
        const rolePermissions = {
            super_admin: ['all'],
            admin: ['manage_users', 'manage_tenders', 'view_reports'],
            procurement_manager: ['create_tender', 'edit_tender', 'view_tender'],
            bid_manager: ['create_bid', 'submit_bid', 'view_tender'],
            analyst: ['view_tender', 'view_reports', 'analyze_tender'],
            viewer: ['view_tender']
        };
        
        res.status(200).json({
            success: true,
            data: { role: req.user.role, permissions: rolePermissions[req.user.role] || [] }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getSecuritySettings = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({
            success: true,
            data: {
                isTwoFactorEnabled: user.isTwoFactorEnabled || false,
                lastPasswordChangeAt: user.lastPasswordChangeAt,
                isEmailVerified: user.isEmailVerified
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAuditLogs = async (req, res) => {
    try {
        res.status(200).json({ success: true, data: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.enable2FA = async (req, res) => {
    res.status(200).json({ success: true, message: '2FA enabled', data: { secret: 'DEMO_SECRET' } });
};

exports.verify2FA = async (req, res) => {
    res.status(200).json({ success: true, message: '2FA verified' });
};

exports.disable2FA = async (req, res) => {
    res.status(200).json({ success: true, message: '2FA disabled' });
};

exports.logoutAll = async (req, res) => {
    res.status(200).json({ success: true, message: 'Logged out from all devices' });
};

exports.getSessions = async (req, res) => {
    res.status(200).json({ success: true, data: { sessions: [], totalCount: 0 } });
};

exports.revokeSession = async (req, res) => {
    res.status(200).json({ success: true, message: 'Session revoked' });
};

exports.resendVerificationEmail = async (req, res) => {
    res.status(200).json({ success: true, message: 'Verification email sent' });
};

exports.verifyEmail = async (req, res) => {
    res.status(200).json({ success: true, message: 'Email verified' });
};

exports.adminCreateAdmin = exports.adminCreateUser;