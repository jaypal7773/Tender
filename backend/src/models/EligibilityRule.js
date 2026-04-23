const mongoose = require('mongoose');

const eligibilityRuleSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: String,
    category: { type: String, enum: ['financial', 'technical', 'experience', 'compliance', 'location'], required: true },
    
    condition: {
        field: String,
        operator: { type: String, enum: ['gt', 'gte', 'lt', 'lte', 'eq', 'neq', 'in', 'nin', 'exists', 'between'] },
        value: mongoose.Schema.Types.Mixed,
        secondaryValue: mongoose.Schema.Types.Mixed
    },
    
    secondaryCondition: { field: String, operator: String, value: mongoose.Schema.Types.Mixed },
    
    action: { type: String, enum: ['auto_accept', 'auto_reject', 'score_modifier', 'require_review'], required: true },
    
    weight: { type: Number, min: 0, max: 100, default: 10 },
    scoreModifier: { type: Number, min: -100, max: 100, default: 0 },
    message: String,
    priority: { type: Number, default: 0 },
    
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('EligibilityRule', eligibilityRuleSchema);