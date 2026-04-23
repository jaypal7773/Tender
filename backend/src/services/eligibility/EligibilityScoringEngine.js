const Tender = require('../../models/Tender');
const CompanyProfile = require('../../models/CompanyProfile');
const EligibilityRule = require('../../models/EligibilityRule');

class EligibilityScoringEngine {
    constructor() {
        this.weights = { financial: 0.35, technical: 0.25, experience: 0.25, compliance: 0.15 };
    }

    async calculateScore(tenderId, companyId) {
        const [tender, company] = await Promise.all([
            Tender.findById(tenderId),
            CompanyProfile.findOne({ userId: companyId })
        ]);

        if (!tender || !company) throw new Error('Tender or company profile not found');

        const scores = {
            financial: this.scoreFinancial(tender, company),
            technical: this.scoreTechnical(tender, company),
            experience: this.scoreExperience(tender, company),
            compliance: this.scoreCompliance(tender, company)
        };

        const rules = await EligibilityRule.find({ isActive: true });
        let autoReject = false;
        let scoreModifier = 0;
        const reasons = [];

        for (const rule of rules) {
            const evaluation = this.evaluateRule(rule, tender, company);
            if (evaluation) {
                if (rule.action === 'auto_reject') autoReject = true;
                if (rule.action === 'score_modifier') scoreModifier += rule.scoreModifier;
                if (rule.message) reasons.push(rule.message);
            }
        }

        if (autoReject) {
            return { score: 0, isEligible: false, reasons, scoreBreakdown: scores, autoRejected: true };
        }

        let totalScore = Object.entries(scores).reduce((sum, [cat, score]) => sum + score * this.weights[cat], 0);
        totalScore += scoreModifier;
        totalScore = Math.min(100, Math.max(0, totalScore));

        await Tender.findByIdAndUpdate(tenderId, {
            eligibilityScore: totalScore,
            scoreBreakdown: scores,
            scoreReasons: reasons,
            status: 'analyzed'
        });

        return { score: totalScore, isEligible: totalScore >= 60, reasons, scoreBreakdown: scores, autoRejected: false };
    }

    scoreFinancial(tender, company) {
        let score = 0;
        const tenderValue = tender.estimatedValue.amount;
        const turnover = company.financials?.annualTurnover?.current || 0;
        const ratio = turnover / tenderValue;
        if (ratio >= 3) score += 40;
        else if (ratio >= 2) score += 30;
        else if (ratio >= 1) score += 20;
        else if (ratio >= 0.5) score += 10;
        
        const emdRatio = (company.financials?.netWorth || 0) / (tender.emdAmount || 1);
        if (emdRatio >= 1) score += 30;
        else if (emdRatio >= 0.5) score += 15;
        
        if ((company.financials?.profitAfterTax || 0) > 0) score += 30;
        else score += 10;
        return score;
    }

    scoreTechnical(tender, company) {
        let score = 50;
        const requiredCerts = tender.eligibilityCriteria?.requiredCertifications || [];
        const companyCerts = (company.certifications || []).filter(c => c.isActive);
        
        if (requiredCerts.length > 0) {
            const matching = requiredCerts.filter(req => companyCerts.some(c => c.name.toLowerCase().includes(req.toLowerCase())));
            score = (matching.length / requiredCerts.length) * 50;
        }
        
        const hasMSME = company.categories.some(c => c.type === 'msme');
        const hasStartup = company.categories.some(c => c.type === 'startup');
        if ((hasMSME && tender.eligibilityCriteria?.msmeBenefits) || (hasStartup && tender.eligibilityCriteria?.startupBenefits)) score += 30;
        else score += 15;
        
        const techRatio = (company.teamCapabilities?.technicalStaff || 0) / (company.teamCapabilities?.totalEmployees || 1);
        score += techRatio * 20;
        return Math.min(100, score);
    }

    scoreExperience(tender, company) {
        let score = 20;
        const requiredYears = tender.eligibilityCriteria?.experienceYears || 0;
        const completed = (company.pastProjects || []).filter(p => p.completionDate);
        if (completed.length === 0) return score;
        
        const oldest = Math.min(...completed.map(p => (new Date() - new Date(p.completionDate)) / (1000 * 60 * 60 * 24 * 365)));
        if (oldest >= requiredYears) score += 40;
        else if (oldest >= requiredYears * 0.7) score += 25;
        else score += 10;
        
        const similar = completed.filter(p => p.projectValue >= (tender.estimatedValue?.amount || 0) * 0.7);
        score += Math.min(30, similar.length * 10);
        
        const successRate = completed.filter(p => p.isSuccessful).length / completed.length;
        score += successRate * 30;
        return Math.min(100, score);
    }

    scoreCompliance(tender, company) {
        let score = 100;
        const requiredLocations = tender.eligibilityCriteria?.locationConstraints || [];
        if (requiredLocations.length > 0) {
            const hasOffice = requiredLocations.some(loc => (company.operationalLocations || []).some(op => op.state === loc && op.hasOffice));
            if (!hasOffice) score -= 50;
        }
        const requiredDocs = tender.documents?.filter(d => d.required) || [];
        if (requiredDocs.length > 0) score -= requiredDocs.length * 10;
        return Math.max(0, score);
    }

    evaluateRule(rule, tender, company) {
        const getValue = (obj, path) => path.split('.').reduce((c, k) => c?.[k], obj);
        const actual = getValue(tender, rule.condition.field) ?? getValue(company, rule.condition.field);
        if (actual === undefined) return false;
        
        const { operator, value, secondaryValue } = rule.condition;
        switch (operator) {
            case 'gt': return actual > value;
            case 'gte': return actual >= value;
            case 'lt': return actual < value;
            case 'lte': return actual <= value;
            case 'eq': return actual === value;
            case 'neq': return actual !== value;
            case 'in': return Array.isArray(value) && value.includes(actual);
            case 'nin': return !Array.isArray(value) || !value.includes(actual);
            case 'between': return actual >= value && actual <= secondaryValue;
            default: return false;
        }
    }
}

module.exports = EligibilityScoringEngine;