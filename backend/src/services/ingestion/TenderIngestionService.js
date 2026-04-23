const crypto = require('crypto');
const Tender = require('../../models/Tender');
const logger = require('../../utils/logger');

class TenderIngestionService {
    constructor() {
        this.sources = new Map();
        this.stopWords = ['tender', 'for', 'of', 'and', 'the', 'to', 'in', 'a', 'is', 'on', 'at', 'by'];
    }

    registerSource(sourceName, fetcher) {
        this.sources.set(sourceName, fetcher);
        logger.info(`Registered source: ${sourceName}`);
    }

    async ingestFromAllSources() {
        const results = { fetched: 0, new: 0, duplicates: 0, errors: [] };
        
        for (const [sourceName, fetcher] of this.sources) {
            try {
                logger.info(`Fetching tenders from ${sourceName}`);
                const rawTenders = await fetcher.fetch();
                
                for (const rawTender of rawTenders) {
                    const result = await this.processTender(rawTender, sourceName);
                    results.fetched++;
                    if (result.isNew) results.new++;
                    if (result.isDuplicate) results.duplicates++;
                }
            } catch (error) {
                logger.error(`Error fetching from ${sourceName}:`, error);
                results.errors.push({ source: sourceName, error: error.message });
            }
        }
        
        logger.info(`Ingestion completed: ${JSON.stringify(results)}`);
        return results;
    }

    async processTender(rawTender, source) {
        const normalized = this.normalizeTenderData(rawTender, source);
        const hash = this.generateHash(normalized);
        normalized.hash = hash;
        
        const existing = await this.findDuplicate(hash, normalized);
        
        if (existing) {
            if (existing.version < (normalized.version || 1)) {
                normalized.version = existing.version + 1;
                normalized.isDuplicateOf = existing._id;
                await Tender.findByIdAndUpdate(existing._id, { $set: normalized });
                logger.debug(`Updated existing tender: ${normalized.title}`);
                return { isNew: false, isDuplicate: true, updated: true };
            }
            return { isNew: false, isDuplicate: true, updated: false };
        }
        
        normalized.category = this.categorizeTender(normalized.title, normalized.description);
        normalized.keywords = this.extractKeywords(normalized.title, normalized.description);
        normalized.deadlinePriority = this.calculateDeadlinePriority(normalized.bidSubmissionDeadline);
        
        const tender = new Tender(normalized);
        await tender.save();
        logger.info(`New tender saved: ${normalized.title}`);
        
        return { isNew: true, isDuplicate: false, tender };
    }

    generateHash(tender) {
        const normalizedTitle = this.normalizeText(tender.title);
        const normalizedValue = tender.estimatedValue?.amount || 0;
        const deadline = new Date(tender.bidSubmissionDeadline).toISOString().split('T')[0];
        const hashString = `${normalizedTitle}|${normalizedValue}|${deadline}`;
        return crypto.createHash('sha256').update(hashString).digest('hex');
    }

    async findDuplicate(hash, newTender) {
        let existing = await Tender.findOne({ hash });
        if (existing) return existing;
        
        const deadlineDate = new Date(newTender.bidSubmissionDeadline);
        const deadlineStart = new Date(deadlineDate);
        deadlineStart.setDate(deadlineStart.getDate() - 7);
        const deadlineEnd = new Date(deadlineDate);
        deadlineEnd.setDate(deadlineEnd.getDate() + 7);
        
        const normalizedNewTitle = this.normalizeText(newTender.title);
        
        existing = await Tender.findOne({
            bidSubmissionDeadline: { $gte: deadlineStart, $lte: deadlineEnd },
            title: { $regex: this.createFuzzyRegex(normalizedNewTitle), $options: 'i' }
        });
        
        return existing;
    }

    normalizeText(text) {
        return text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .split(' ')
            .filter(word => !this.stopWords.includes(word))
            .join(' ');
    }

    createFuzzyRegex(text) {
        const words = text.split(' ');
        return words.map(word => `(?=.*${word})`).join('');
    }

    categorizeTender(title, description) {
        const categories = {
            'IT Software': ['software', 'it', 'digital', 'application', 'system', 'database', 'erp'],
            'Infrastructure': ['construction', 'building', 'road', 'bridge', 'infrastructure', 'civil'],
            'Consulting': ['consult', 'advisory', 'study', 'assessment', 'audit', 'consultancy'],
            'Goods Supply': ['supply', 'goods', 'equipment', 'machinery', 'material', 'hardware'],
            'Services': ['service', 'maintenance', 'support', 'operation', 'management', 'outsourcing']
        };
        
        const text = `${title} ${description || ''}`.toLowerCase();
        
        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => text.includes(keyword))) {
                return category;
            }
        }
        
        return 'Other';
    }

    extractKeywords(title, description) {
        const text = `${title} ${description || ''}`.toLowerCase();
        const words = text.split(/\s+/);
        const frequency = {};
        
        words.forEach(word => {
            if (word.length > 3 && !this.stopWords.includes(word)) {
                frequency[word] = (frequency[word] || 0) + 1;
            }
        });
        
        return Object.entries(frequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([word]) => word);
    }

    calculateDeadlinePriority(deadline) {
        const now = new Date();
        const daysUntil = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
        
        if (daysUntil <= 3) return 'critical';
        if (daysUntil <= 7) return 'high';
        if (daysUntil <= 15) return 'medium';
        return 'low';
    }

    normalizeTenderData(raw, source) {
        const normalizers = {
            gem: this.normalizeGeM,
            eproc: this.normalizeEProc,
            manual: (r) => r,
            api: (r) => r
        };
        
        const normalizer = normalizers[source] || ((r) => r);
        return normalizer.call(this, raw);
    }

    normalizeGeM(raw) {
        return {
            sourceId: raw.tender_id || raw.id,
            source: 'gem',
            title: raw.tender_title || raw.title,
            description: raw.description,
            estimatedValue: { amount: raw.estimated_cost || raw.value || 0, currency: 'INR' },
            emdAmount: raw.emd_amount,
            tenderFee: raw.tender_fee,
            publishedDate: new Date(raw.published_date),
            bidSubmissionDeadline: new Date(raw.bid_end_date || raw.deadline),
            eligibilityCriteria: {
                minTurnover: raw.min_turnover,
                requiredCertifications: raw.required_certs || [],
                experienceYears: raw.min_experience,
                locationConstraints: raw.locations || [],
                msmeBenefits: raw.msme_benefits || false,
                startupBenefits: raw.startup_benefits || false
            }
        };
    }

    normalizeEProc(raw) {
        return {
            sourceId: raw.notice_id || raw.id,
            source: 'eproc',
            title: raw.notice_title || raw.title,
            description: raw.description,
            estimatedValue: { amount: raw.tender_value || 0, currency: 'INR' },
            bidSubmissionDeadline: new Date(raw.submission_deadline),
            eligibilityCriteria: {
                minTurnover: raw.turnover_required,
                requiredCertifications: raw.certifications || [],
                experienceYears: raw.experience_required
            }
        };
    }
}

module.exports = TenderIngestionService;