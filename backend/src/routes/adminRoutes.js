// backend/src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const mongoose = require('mongoose');
const Tender = require('../models/Tender');
const BidWorkflow = require('../models/BidWorkflow');
const CompanyProfile = require('../models/CompanyProfile');

// IMPORTANT: Don't use isAdmin middleware here - check in controller instead
router.use(protect);

// Get all users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update user role
router.put('/users/:userId/role', async (req, res) => {
    try {
        console.log('========== UPDATE ROLE ==========');
        console.log('User ID:', req.params.userId);
        console.log('New Role:', req.body.role);
        
        if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }
        
        const { role } = req.body;
        const validRoles = ['super_admin', 'admin', 'procurement_manager', 'bid_manager', 'analyst', 'viewer'];
        
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role'
            });
        }
        
        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { role, isAdmin: role === 'admin' || role === 'super_admin' },
            { new: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        console.log('✅ Role updated for:', user.email);
        
        res.status(200).json({
            success: true,
            message: 'Role updated successfully',
            data: user
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Update user status
router.put('/users/:userId/status', async (req, res) => {
    try {
        console.log('========== UPDATE STATUS ==========');
        console.log('User ID:', req.params.userId);
        console.log('New Status:', req.body.status);
        
        if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }
        
        const { status } = req.body;
        const validStatuses = ['active', 'inactive', 'suspended'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }
        
        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { status },
            { new: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        console.log('✅ Status updated for:', user.email);
        
        res.status(200).json({
            success: true,
            message: `User ${status === 'active' ? 'activated' : 'deactivated'}`,
            data: user
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Delete user
router.delete('/users/:userId', async (req, res) => {
    try {
        console.log('========== DELETE USER ==========');
        console.log('User ID:', req.params.userId);
        
        if (req.user.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Super Admin privileges required.'
            });
        }
        
        const user = await User.findByIdAndDelete(req.params.userId);
        
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
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});



// Get stats
router.get('/stats', async (req, res) => {
    try {
        console.log('========== GET DASHBOARD STATS ==========');

        const totalUsers = await User.countDocuments();
        const totalCompanies = await CompanyProfile.countDocuments();
        const totalTenders = await Tender.countDocuments();
        const totalWorkflows = await BidWorkflow.countDocuments();

        const activeTenders = await Tender.countDocuments({ status: 'active' });

        const submittedWorkflows = await BidWorkflow.countDocuments({ status: 'submitted' });
        const awardedWorkflows = await BidWorkflow.countDocuments({ status: 'awarded' });

        // ✅ FIX: number return करो (string नहीं)
        const winRate = submittedWorkflows > 0
            ? Math.round((awardedWorkflows / submittedWorkflows) * 100)
            : 0;

        res.json({
            success: true,
            data: {
                users: {
                    total: totalUsers
                },
                companies: {
                    total: totalCompanies
                },
                tenders: {
                    total: totalTenders,
                    eligible: activeTenders // अभी के लिए ठीक है
                },
                workflows: {
                    total: totalWorkflows,
                    submitted: submittedWorkflows,
                    winRate: winRate
                }
            }
        });

    } catch (error) {
        console.log("❌ STATS ERROR:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create admin
router.post('/create', async (req, res) => {
    try {
        console.log('========== CREATE ADMIN ==========');
        console.log('Request body:', req.body);
        
        if (req.user.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Super Admin privileges required.'
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
        
        const newAdmin = new User({
            name,
            email,
            password,
            mobileNumber,
            companyId: new mongoose.Types.ObjectId(),
            role: role || 'admin',
            isAdmin: true,
            status: 'active',
            isEmailVerified: true
        });
        
        await newAdmin.save();
        
        console.log('✅ Admin created:', email);
        
        res.status(201).json({
            success: true,
            message: 'Admin created successfully',
            data: {
                user: {
                    id: newAdmin._id,
                    name: newAdmin.name,
                    email: newAdmin.email,
                    role: newAdmin.role,
                    mobileNumber: newAdmin.mobileNumber
                }
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;