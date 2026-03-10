const express = require('express');
const router = express.Router();
const AccessRequest = require('../models/AccessRequest');
const { auth, authorize } = require('../middleware/auth');

router.get('/', auth, authorize('APPROVER'), async (req, res) => {
    try {
        // 1. Status Counts
        const statusCounts = await AccessRequest.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // 2. Daily Volume (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const dailyVolume = await AccessRequest.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // 3. Average Approval Time (in hours)
        const approvalStats = await AccessRequest.aggregate([
            { $match: { status: { $in: ['APPROVED', 'REJECTED'] } } },
            {
                $project: {
                    duration: { $subtract: ["$updatedAt", "$createdAt"] }
                }
            },
            {
                $group: {
                    _id: null,
                    avgTime: { $avg: "$duration" }
                }
            }
        ]);

        const avgHours = approvalStats.length > 0 ? (approvalStats[0].avgTime / (1000 * 60 * 60)).toFixed(2) : 0;

        res.json({
            statusCounts: statusCounts.reduce((acc, curr) => {
                acc[curr._id] = curr.count;
                return acc;
            }, { PENDING: 0, APPROVED: 0, REJECTED: 0 }),
            dailyVolume,
            avgHours
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
