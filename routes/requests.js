const express = require('express');
const AccessRequest = require('../models/AccessRequest');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// Submit request (Requester only)
router.post('/', auth, authorize('REQUESTER'), async (req, res) => {
    try {
        // Business Rule: Check for existing PENDING request
        const pendingRequest = await AccessRequest.findOne({ requester: req.user.id, status: 'PENDING' });
        if (pendingRequest) {
            return res.status(400).send({ error: 'You already have a pending request.' });
        }

        const request = new AccessRequest({
            requester: req.user.id,
            reason: req.body.reason,
            history: [{
                action: 'SUBMITTED',
                performedBy: req.user.id,
                details: 'Request created'
            }]
        });
        await request.save();
        res.status(201).send(request);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// View own requests (Requester only)
router.get('/my', auth, authorize('REQUESTER'), async (req, res) => {
    try {
        const requests = await AccessRequest.find({ requester: req.user.id }).sort({ createdAt: -1 });
        res.send(requests);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// View all requests (Approver only)
router.get('/all', auth, authorize('APPROVER'), async (req, res) => {
    try {
        const requests = await AccessRequest.find().populate('requester', 'username').sort({ createdAt: -1 });
        res.send(requests);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Approve/Reject (Approver only)
router.put('/:id', auth, authorize('APPROVER'), async (req, res) => {
    try {
        const { status, comments } = req.body;
        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return res.status(400).send({ error: 'Invalid status' });
        }

        const request = await AccessRequest.findById(req.params.id);
        if (!request) return res.status(404).send({ error: 'Request not found' });

        request.status = status;
        request.comments = comments;
        request.reviewedBy = req.user.id;

        request.history.push({
            action: status,
            performedBy: req.user.id,
            details: comments || `Request ${status.toLowerCase()}`
        });

        await request.save();
        res.send(request);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

module.exports = router;
