// src/routes/payments.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Payment = require('../models/Payment');
const axios = require('axios');

// Payment callback (Telebirr webhook)
router.post('/callback', async (req, res) => {
    const { transactionId, status } = req.body;

    try {
        const payment = await Payment.findOne({ telebirrTransactionId: transactionId });
        if (!payment) return res.status(404).json({ message: 'Payment not found' });

        payment.status = status === 'SUCCESS' ? 'completed' : 'failed';
        await payment.save();

        if (status === 'SUCCESS') {
            const campaign = await Campaign.findById(payment.campaign);
            campaign.status = 'active';
            await campaign.save();
        }

        res.json({ message: 'Payment status updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;