const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getDashboardStats,
    getTenderAnalytics,
    getPerformanceMetrics,
    getNotifications,
    getRecentActivities
} = require('../controllers/dashboardController');

// All dashboard routes require authentication
router.use(protect);

router.get('/stats', getDashboardStats);
router.get('/tender-analytics', getTenderAnalytics);
router.get('/performance', getPerformanceMetrics);
router.get('/notifications', getNotifications);
router.get('/activities', getRecentActivities);
router.get('/activities', protect, async (req, res) => {
    try {
        // अभी dummy (later dynamic कर सकते हैं)
        res.json({
            success: true,
            data: [
                { message: "New tender added", time: "2 hours ago" },
                { message: "User updated profile", time: "5 hours ago" }
            ]
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


module.exports = router;