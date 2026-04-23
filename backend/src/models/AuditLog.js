const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userEmail: String,
    userName: String,
    userRole: String,
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'CompanyProfile' },
    
    action: { type: String, required: true },
    resource: { type: String, required: true },
    resourceId: String,
    resourceName: String,
    
    changes: { before: mongoose.Schema.Types.Mixed, after: mongoose.Schema.Types.Mixed, fields: [String] },
    
    ipAddress: String,
    userAgent: String,
    sessionId: String,
    
    status: { type: String, enum: ['SUCCESS', 'FAILURE', 'PENDING'], default: 'SUCCESS' },
    errorMessage: String,
    
    metadata: mongoose.Schema.Types.Mixed,
    duration: Number
}, { timestamps: true });

auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ companyId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, resource: 1 });
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

auditLogSchema.statics.log = async function(data) {
    return await this.create(data);
};

module.exports = mongoose.model('AuditLog', auditLogSchema);