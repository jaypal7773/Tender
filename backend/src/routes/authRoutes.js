const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const User = require('../models/User');

const {
    login,
    getMe,
    register,
    adminGetAllUsers,
    adminUpdateUserRole,
    adminUpdateUserStatus,
    adminDeleteUser
} = require('../controllers/authController');

// Public
router.post('/login', login);
router.post('/register', register);

// Protected
router.use(protect);
router.get('/me', getMe);

// ✅ PROFILE UPDATE
router.put('/profile', async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            {
                name: req.body.name,
                mobileNumber: req.body.mobileNumber
            },
            { new: true }
        );

        res.json({
            success: true,
            data: updatedUser
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

router.put('/change-password', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const { currentPassword, newPassword } = req.body;

        const isMatch = await user.comparePassword(currentPassword);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Current password incorrect"
            });
        }

        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: "Password updated successfully"
        });

    } catch (error) {
        console.log("PASSWORD ERROR:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Admin
router.get('/admin/users', adminGetAllUsers);
router.put('/admin/users/:userId/role', adminUpdateUserRole);
router.put('/admin/users/:userId/status', adminUpdateUserStatus);
router.delete('/admin/users/:userId', adminDeleteUser);

module.exports = router;