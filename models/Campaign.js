// src/models/Campaign.js
const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    industry: { type: String, required: true },
    budget: { type: Number, required: true },
    tiktokUrl: { type: String, required: true },
    performanceModel: { type: String, enum: ['cpa', 'cpc', 'cpe', 'fixed'], required: true },
    deadline: { type: Date, required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: ['pending', 'active', 'completed'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Campaign', campaignSchema);