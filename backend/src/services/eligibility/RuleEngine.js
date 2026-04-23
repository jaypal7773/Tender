const EligibilityRule = require('../../models/EligibilityRule');

class RuleEngine {
    constructor() {
        this.ruleCache = null;
        this.lastCacheUpdate = null;
        this.CACHE_TTL = 300000; // 5 minutes
    }

    async evaluateRules(tender, company) {
        const rules = await this.getActiveRules();
        
        const result = {
            autoReject: false,
            autoAccept: false,
            scoreModifier: 0,
            reasons: []
        };

        const sortedRules = [...rules].sort((a, b) => b.priority - a.priority);

        for (const rule of sortedRules) {
            let evaluation = this.evaluateCondition(rule.condition, tender, company);
            
            // Check secondary condition if exists
            if (evaluation && rule.secondaryCondition && rule.secondaryCondition.field) {
                evaluation = this.evaluateCondition(rule.secondaryCondition, tender, company);
            }
            
            if (evaluation) {
                switch (rule.action) {
                    case 'auto_reject':
                        result.autoReject = true;
                        result.reasons.push(rule.message || `Auto-rejected: ${rule.name}`);
                        break;
                    case 'auto_accept':
                        result.autoAccept = true;
                        result.reasons.push(rule.message || `Auto-accepted: ${rule.name}`);
                        break;
                    case 'score_modifier':
                        result.scoreModifier += rule.scoreModifier;
                        result.reasons.push(rule.message || `Score modified by ${rule.scoreModifier}`);
                        break;
                    case 'require_review':
                        result.reasons.push(rule.message || `Requires review: ${rule.name}`);
                        break;
                }
            }
        }

        return result;
    }

    evaluateCondition(condition, tender, company) {
        const { field, operator, value, secondaryValue } = condition;
        
        let actualValue = this.getNestedValue(tender, field);
        if (actualValue === undefined) {
            actualValue = this.getNestedValue(company, field);
        }
        
        if (actualValue === undefined) return false;

        switch (operator) {
            case 'gt': return actualValue > value;
            case 'gte': return actualValue >= value;
            case 'lt': return actualValue < value;
            case 'lte': return actualValue <= value;
            case 'eq': return actualValue === value;
            case 'neq': return actualValue !== value;
            case 'in': return Array.isArray(value) && value.includes(actualValue);
            case 'nin': return !Array.isArray(value) || !value.includes(actualValue);
            case 'exists': return (actualValue !== undefined && actualValue !== null) === value;
            case 'between': return actualValue >= value && actualValue <= secondaryValue;
            default: return false;
        }
    }

    getNestedValue(obj, path) {
        if (!path || !obj) return undefined;
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    async getActiveRules() {
        const now = Date.now();
        
        if (this.ruleCache && (now - this.lastCacheUpdate) < this.CACHE_TTL) {
            return this.ruleCache;
        }

        this.ruleCache = await EligibilityRule.find({ isActive: true }).lean();
        this.lastCacheUpdate = now;
        
        return this.ruleCache;
    }

    invalidateCache() {
        this.ruleCache = null;
        this.lastCacheUpdate = null;
    }

    async createRule(ruleData) {
        const rule = new EligibilityRule(ruleData);
        await rule.save();
        this.invalidateCache();
        return rule;
    }

    async updateRule(ruleId, updates) {
        const rule = await EligibilityRule.findByIdAndUpdate(ruleId, updates, { new: true });
        this.invalidateCache();
        return rule;
    }

    async deleteRule(ruleId) {
        await EligibilityRule.findByIdAndDelete(ruleId);
        this.invalidateCache();
    }
}

module.exports = RuleEngine;