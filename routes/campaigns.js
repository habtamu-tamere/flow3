// src/routes/campaigns.js
const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Campaign = require('../models/Campaign');
const Payment = require('../models/Payment');

router.post('/', auth, [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('industry').notEmpty().withMessage('Industry is required'),
    body('budget').isNumeric().withMessage('Budget must be a number'),
    body('tiktokUrl').isURL().withMessage('Valid TikTok URL is required'),
    body('performanceModel').isIn(['cpa', 'cpc', 'cpe', 'fixed']).withMessage('Invalid performance model'),
    body('deadline').isISO8601().toDate().withMessage('Valid deadline is required')
], async (req, res) => {
    console.log('POST /api/campaigns', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { title, description, industry, budget, tiktokUrl, performanceModel, deadline } = req.body;
    try {
        const campaign = new Campaign({
            title, description, industry, budget, tiktokUrl, performanceModel, deadline, creator: req.user.id
        });
        await campaign.save();
        const commission = budget * (process.env.ADMIN_COMMISSION_RATE || 0.1);
        const totalAmount = Number(budget) + commission;
        const payment = new Payment({
            campaign: campaign._id, user: req.user.id, amount: totalAmount, commission, telebirrTransactionId: 'mock123'
        });
        await payment.save();
        res.json({ paymentUrl: 'https://mock.telebirr.com/pay' });
    } catch (error) {
        console.error('Campaign creation error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


// Update the GET route in src/routes/campaigns.js
router.get('/', async (req, res) => {
    console.log('GET /api/campaigns', req.query);
    const { industry, budget, performance, page = 1, limit = 10 } = req.query;
    const query = {};
    if (industry) query.industry = industry;
    if (performance) query.performanceModel = performance;
    if (budget) {
        if (budget === 'micro') query.budget = { $lte: 15000 };
        if (budget === 'small') query.budget = { $gte: 15000, $lte: 100000 };
        if (budget === 'medium') query.budget = { $gte: 100000, $lte: 300000 };
        if (budget === 'large') query.budget = { $gte: 300000 };
    }
    try {
        const campaigns = await Campaign.find(query)
            .populate('creator', 'name tiktokUrl')
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .lean()
            .exec();
        const plainCampaigns = campaigns.map(campaign => ({
            ...campaign,
            _id: campaign._id.toString(),
            budget: Number(campaign.budget),
            deadline: campaign.deadline ? new Date(campaign.deadline).toISOString() : null,
            createdAt: campaign.createdAt ? new Date(campaign.createdAt).toISOString() : null,
            creator: campaign.creator ? {
                _id: campaign.creator._id.toString(),
                name: campaign.creator.name,
                tiktokUrl: campaign.creator.tiktokUrl
            } : null
        }));
        const total = await Campaign.countDocuments(query);
        const response = {
            campaigns: plainCampaigns,
            total: total || 0,
            page: Number(page),
            pages: Math.ceil(total / limit) || 1
        };
        console.log('GET /api/campaigns response:', JSON.stringify(response, null, 2));
        res.json(response);
    } catch (error) {
        console.error('Get campaigns error:', error);
        res.status(500).json({
            campaigns: [],
            total: 0,
            page: Number(page),
            pages: 1,
            error: error.message
        });
    }
});

module.exports = router;