module.exports = {
    // User Roles
    USER_ROLES: {
        SUPER_ADMIN: 'super_admin',
        ADMIN: 'admin',
        PROCUREMENT_MANAGER: 'procurement_manager',
        BID_MANAGER: 'bid_manager',
        ANALYST: 'analyst',
        VIEWER: 'viewer'
    },
    
    // Tender Status
    TENDER_STATUS: {
        DISCOVERED: 'discovered',
        ANALYZED: 'analyzed',
        IN_PROGRESS: 'in_progress',
        SUBMITTED: 'submitted',
        AWARDED: 'awarded',
        REJECTED: 'rejected',
        EXPIRED: 'expired'
    },
    
    // Workflow Steps
    WORKFLOW_STEPS: {
        DISCOVERY: 'discovery',
        ELIGIBILITY_CHECK: 'eligibility_check',
        DOCUMENT_PREPARATION: 'document_preparation',
        REVIEW: 'review',
        SUBMISSION: 'submission',
        POST_SUBMISSION: 'post_submission'
    },
    
    // Tender Sources
    TENDER_SOURCES: {
        GEM: 'gem',
        EPROC: 'eproc',
        MANUAL: 'manual',
        API: 'api'
    },
    
    // Deadline Priorities
    DEADLINE_PRIORITY: {
        CRITICAL: 'critical',
        HIGH: 'high',
        MEDIUM: 'medium',
        LOW: 'low'
    },
    
    // Scoring Weights
    SCORING_WEIGHTS: {
        FINANCIAL: 0.35,
        TECHNICAL: 0.25,
        EXPERIENCE: 0.25,
        COMPLIANCE: 0.15
    },
    
    // Cache TTLs
    CACHE_TTL: {
        TENDERS: 300, // 5 minutes
        RULES: 300, // 5 minutes
        DASHBOARD: 600 // 10 minutes
    },
    
    // Pagination Defaults
    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 20,
        MAX_LIMIT: 100
    },
    
    // Rate Limits
    RATE_LIMITS: {
        AUTH: { windowMs: 15 * 60 * 1000, max: 5 },
        API: { windowMs: 15 * 60 * 1000, max: 100 },
        UPLOAD: { windowMs: 60 * 60 * 1000, max: 50 }
    }
};