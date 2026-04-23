const mongoose = require('mongoose');
require('dotenv').config();
const EligibilityRule = require('../models/EligibilityRule');

const defaultRules = [
    { name: "High Value Auto-Reject", category: "financial", condition: { field: "estimatedValue.amount", operator: "gt", value: 10000000 }, action: "auto_reject", message: "Tender value exceeds ₹1 Crore", priority: 100, isActive: true },
    { name: "MSME Bonus", category: "compliance", condition: { field: "categories.type", operator: "in", value: ["msme"] }, action: "score_modifier", scoreModifier: 10, message: "MSME registration provides 10% boost", priority: 50, isActive: true },
    { name: "Location Constraint", category: "location", condition: { field: "eligibilityCriteria.locationConstraints", operator: "exists", value: true }, action: "auto_reject", message: "No office in required location", priority: 90, isActive: true },
    { name: "Past Experience Required", category: "experience", condition: { field: "eligibilityCriteria.experienceYears", operator: "gt", value: 3 }, secondaryCondition: { field: "pastProjects.length", operator: "lt", value: 2 }, action: "auto_reject", message: "Insufficient past experience", priority: 80, isActive: true }
];

async function seedRules() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        await EligibilityRule.deleteMany({});
        await EligibilityRule.insertMany(defaultRules);
        console.log('✅ Eligibility rules seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding rules:', error);
        process.exit(1);
    }
}

seedRules();