const User = require('../models/User');
const Tender = require('../models/Tender');
const BidWorkflow = require('../models/BidWorkflow');
const CompanyProfile = require('../models/CompanyProfile');

// Get dashboard statistics
// exports.getDashboardStats = async (req, res) => {
//     try {
//         const totalTenders = await Tender.countDocuments();

//         const activeTenders = await Tender.countDocuments({
//             status: 'active'
//         });

//         const completedTenders = await Tender.countDocuments({
//             status: 'completed'
//         });

//         const workflows = await BidWorkflow.countDocuments();

//         res.json({
//             success: true,
//             data: {
//                 totalTenders,
//                 activeTenders,
//                 completedTenders,
//                 workflows
//             }
//         });

//     } catch (error) {
//         console.log("DASHBOARD ERROR:", error.message);
//         res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

exports.getRecentActivities = async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 }).limit(3);
        const tenders = await Tender.find().sort({ createdAt: -1 }).limit(3);
        const workflows = await BidWorkflow.find().sort({ createdAt: -1 }).limit(3);

        let activities = [];

        users.forEach(u => {
            activities.push({
                text: `New user registered: ${u.name}`,
                time: u.createdAt,
                type: "user"
            });
        });

        tenders.forEach(t => {
            activities.push({
                text: `New tender posted: ${t.title}`,
                time: t.createdAt,
                type: "tender"
            });
        });

        workflows.forEach(w => {
            activities.push({
                text: `Workflow created`,
                time: w.createdAt,
                type: "workflow"
            });
        });

        // sort latest first
        activities.sort((a, b) => new Date(b.time) - new Date(a.time));

        res.json({
            success: true,
            data: activities.slice(0, 5)
        });

    } catch (err) {
        console.log("ACTIVITY ERROR:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const totalTenders = await Tender.countDocuments();
    const active = await Tender.countDocuments({ status: "active" });
    const expired = await Tender.countDocuments({ status: "expired" });
    const workflows = await BidWorkflow.countDocuments();

    res.json({
      success: true,
      data: {
        totalTenders,
        active,
        expired,
        workflows
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get tender analytics
exports.getTenderAnalytics = async (req, res) => {
    try {
        const { period = 'month' } = req.query;
        
        let dateRange = new Date();
        if (period === 'week') dateRange.setDate(dateRange.getDate() - 7);
        else if (period === 'month') dateRange.setMonth(dateRange.getMonth() - 1);
        else if (period === 'quarter') dateRange.setMonth(dateRange.getMonth() - 3);
        else if (period === 'year') dateRange.setFullYear(dateRange.getFullYear() - 1);
        
        const tendersOverTime = await Tender.aggregate([
            { $match: { createdAt: { $gte: dateRange } } },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    },
                    count: { $sum: 1 },
                    avgScore: { $avg: '$eligibilityScore' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);
        
        const topCategories = await Tender.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);
        
        res.json({
            success: true,
            data: {
                tendersOverTime,
                topCategories,
                period
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get performance metrics
exports.getPerformanceMetrics = async (req, res) => {
    try {
        const company = await CompanyProfile.findOne({ userId: req.user.id });
        let metrics = {
            totalBids: 0,
            submittedBids: 0,
            awardedBids: 0,
            winRate: 0,
            totalBidValue: 0,
            totalAwardedValue: 0
        };
        
        if (company) {
            const workflows = await BidWorkflow.find({ companyId: company._id });
            metrics.totalBids = workflows.length;
            metrics.submittedBids = workflows.filter(w => w.status === 'submitted' || w.status === 'awarded').length;
            metrics.awardedBids = workflows.filter(w => w.status === 'awarded').length;
            metrics.winRate = metrics.submittedBids > 0 
                ? ((metrics.awardedBids / metrics.submittedBids) * 100).toFixed(2) 
                : 0;
        }
        
        res.json({ success: true, data: metrics });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get notifications
exports.getNotifications = async (req, res) => {
    try {
        // Get upcoming deadlines (next 7 days)
        const upcomingTenders = await Tender.find({
            bidSubmissionDeadline: { 
                $gte: new Date(), 
                $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
            },
            eligibilityScore: { $gte: 60 }
        })
        .sort({ bidSubmissionDeadline: 1 })
        .limit(5)
        .select('title bidSubmissionDeadline eligibilityScore');
        
        res.json({
            success: true,
            data: {
                upcomingDeadlines: upcomingTenders,
                notifications: []
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};