const mongoose = require('mongoose');

const bidWorkflowSchema = new mongoose.Schema({
    tenderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tender', required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'CompanyProfile', required: true },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 

    status: { 
        type: String, 
        enum: ['not_started', 'in_progress', 'submitted', 'awarded', 'lost'], 
        default: 'not_started' 
    },
    currentStep: { type: String, default: 'discovery' },

    steps: [{
        name: String,
        status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
        startedAt: Date,
        completedAt: Date
    }],
    
    team: [
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: String
  }
],

}, { timestamps: true });

module.exports = mongoose.model('BidWorkflow', bidWorkflowSchema);