const crypto = require('crypto');
const Tender = require('../../models/Tender');

class DuplicateDetector {
    constructor() {
        this.similarityThreshold = 0.85;
    }

    generateHash(tender) {
        const normalizedTitle = this.normalizeText(tender.title);
        const normalizedValue = tender.estimatedValue?.amount || 0;
        const deadline = new Date(tender.bidSubmissionDeadline).toISOString().split('T')[0];
        const hashString = `${normalizedTitle}|${normalizedValue}|${deadline}`;
        return crypto.createHash('sha256').update(hashString).digest('hex');
    }

    async findDuplicate(hash, newTender) {
        // Exact hash match
        let existing = await Tender.findOne({ hash });
        if (existing) return existing;
        
        // Fuzzy title match within 7 days
        const deadlineDate = new Date(newTender.bidSubmissionDeadline);
        const deadlineStart = new Date(deadlineDate);
        deadlineStart.setDate(deadlineStart.getDate() - 7);
        const deadlineEnd = new Date(deadlineDate);
        deadlineEnd.setDate(deadlineEnd.getDate() + 7);
        
        const normalizedNewTitle = this.normalizeText(newTender.title);
        
        const candidates = await Tender.find({
            bidSubmissionDeadline: { $gte: deadlineStart, $lte: deadlineEnd }
        });
        
        for (const candidate of candidates) {
            const similarity = this.calculateSimilarity(
                normalizedNewTitle,
                this.normalizeText(candidate.title)
            );
            if (similarity >= this.similarityThreshold) {
                return candidate;
            }
        }
        
        return null;
    }

    normalizeText(text) {
        return text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .split(' ')
            .filter(word => word.length > 2)
            .join(' ');
    }

    calculateSimilarity(str1, str2) {
        const words1 = str1.split(' ');
        const words2 = str2.split(' ');
        
        const intersection = words1.filter(word => words2.includes(word)).length;
        const union = new Set([...words1, ...words2]).size;
        
        return intersection / union;
    }

    async findPotentialDuplicates(tenderId) {
        const tender = await Tender.findById(tenderId);
        if (!tender) return [];
        
        const deadlineDate = new Date(tender.bidSubmissionDeadline);
        const deadlineStart = new Date(deadlineDate);
        deadlineStart.setDate(deadlineStart.getDate() - 14);
        const deadlineEnd = new Date(deadlineDate);
        deadlineEnd.setDate(deadlineEnd.getDate() + 14);
        
        const candidates = await Tender.find({
            _id: { $ne: tenderId },
            bidSubmissionDeadline: { $gte: deadlineStart, $lte: deadlineEnd }
        });
        
        const normalizedTitle = this.normalizeText(tender.title);
        const duplicates = [];
        
        for (const candidate of candidates) {
            const similarity = this.calculateSimilarity(
                normalizedTitle,
                this.normalizeText(candidate.title)
            );
            if (similarity >= this.similarityThreshold) {
                duplicates.push({
                    tender: candidate,
                    similarity: similarity
                });
            }
        }
        
        return duplicates.sort((a, b) => b.similarity - a.similarity);
    }
}

module.exports = DuplicateDetector;