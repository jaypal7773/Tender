// backend/src/models/CompanyProfile.js
const mongoose = require('mongoose');

const companyProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    companyName: {
        type: String,
        required: true
    },
    registrationNumber: String,
    gstin: String,
    pan: String,

    financials: {
        annualTurnover: {
            current: { type: Number, default: 0 },
            previous: { type: Number, default: 0 }
        },
        netWorth: { type: Number, default: 0 },
        profitAfterTax: { type: Number, default: 0 }
    },

    teamCapabilities: {
        totalEmployees: { type: Number, default: 0 },
        technicalStaff: { type: Number, default: 0 },
        projectManagers: { type: Number, default: 0 }
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }

}, { timestamps: true });

module.exports = mongoose.model('CompanyProfile', companyProfileSchema);