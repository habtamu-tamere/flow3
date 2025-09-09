// src/routes/campaigns.js
const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Campaign = require('../models/Campaign');
const Payment = require('../models/Payment');
const axios = require('axios');

// Create campaign
router.post('/', auth, [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('industry').notEmpty().withMessage('Industry is required'),
    body('budget').isNumeric().withMessage('Budget must be a number'),
    body('tiktokUrl').isURL().withMessage('Valid TikTok URL is required'),
    body('performanceModel').isIn(['cpa', 'cpc', 'cpe', 'fixed']).withMessage('Invalid performance model'),
    body('deadline').isISO8601().toDate().withMessage('Valid deadline is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, industry, budget, tiktokUrl, performanceModel, deadline } = req.body;

    try {
        const campaign = new Campaign({
            title,
            description,
            industry,
            budget,
            tiktokUrl,
            performanceModel,
            deadline,
            creator: req.user.id
        });
        await campaign.save();

        // Calculate commission
        const commission = budget * process.env.ADMIN_COMMISSION_RATE;
        const totalAmount = budget + commission;

        // Initiate Telebirr payment
        const paymentResponse = await axios.post(
            `${process.env.TELEBIRR_API_URL}/payment`,
            {
                amount: totalAmount,
                currency: 'ETB',
                description: `Campaign: ${title}`,
                userId: req.user.id
            },
            { headers: { 'Authorization': `Bearer ${process.env.TELEBIRR_API_KEY}` } }
        );

        const payment = new Payment({
            campaign: campaign._id,
            user: req.user.id,
            amount: totalAmount,
            commission,
            telebirrTransactionId: paymentResponse.data.transactionId
        });
        await payment.save();

        res.json({ paymentUrl: paymentResponse.data.paymentUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get campaigns with filters
router.get('/', async (req, res) => {
    const { industry, budget, performance } = req.query;
    const query = {};

    if (industry) query.industry = industry;
    if (performance) query.performanceModel = performance;
    if (budget) {
        if (budget === 'micro') query.budget = { $lte: 100 };
        if (budget === 'small') query.budget = { $gte: 100, $lte: 500 };
        if (budget === 'medium') query.budget = { $gte: 500, $lte: 2000 };
        if (budget === 'large') query.budget = { $gte: 2000 };
    }

    try {
        const campaigns = await Campaign.find(query).populate('creator', 'name tiktokUrl');
        res.json(campaigns);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;