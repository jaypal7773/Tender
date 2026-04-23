const mongoose = require('mongoose');

const tenderSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,

    estimatedValue: {
        amount: { type: Number, default: 0 },
        currency: { type: String, default: 'INR' }
    },

    category: String,
    bidSubmissionDeadline: Date,

    emdAmount: Number,
    tenderFee: Number,

    status: {
        type: String,
        enum: ['active', 'expired', 'draft'],
        default: 'active'
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }

}, { timestamps: true });

module.exports = mongoose.model('Tender', tenderSchema);