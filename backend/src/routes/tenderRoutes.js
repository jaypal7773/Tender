const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Tender = require('../models/Tender');

const {
    getTenders,
    createTender,
    updateTender,
    deleteTender,
    updateTenderStatus,
    importTenders
} = require('../controllers/tenderController');


router.get('/', getTenders);
router.post('/', createTender);
router.put('/:id', protect, updateTender);
router.delete('/:id', deleteTender);
router.put('/:id/status', updateTenderStatus);
router.post('/import', importTenders);
router.get('/stats', async (req, res) => {
    try {
        const total = await Tender.countDocuments();
        const active = await Tender.countDocuments({ status: 'active' });
        const expired = await Tender.countDocuments({ status: 'expired' });

        const highValue = await Tender.countDocuments({
            "estimatedValue.amount": { $gte: 50000000 } // 5 Cr+
        });

        res.json({
            success: true,
            data: {
                total,
                active,
                expired,
                highValue
            }
        });

    } catch (error) {
        console.log("STATS ERROR:", error.message);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});



module.exports = router;