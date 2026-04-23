const mongoose = require('mongoose');
const CompanyProfile = require('../src/models/CompanyProfile');
const Tender = require('../src/models/Tender');
const BidWorkflow = require('../src/models/BidWorkflow');

async function seedData() {
    try {
        await mongoose.connect('mongodb://localhost:27017/smart_tender_platform');
        console.log('Connected to MongoDB');

        // Clear existing data
        await CompanyProfile.deleteMany({});
        await Tender.deleteMany({});
        await BidWorkflow.deleteMany({});
        console.log('Cleared existing data');

        // Create sample companies
        const companies = await CompanyProfile.insertMany([
            { userId: new mongoose.Types.ObjectId(), companyName: 'Tech Solutions India Pvt Ltd', createdAt: new Date() },
            { userId: new mongoose.Types.ObjectId(), companyName: 'Infrastructure Builders Ltd', createdAt: new Date() },
            { userId: new mongoose.Types.ObjectId(), companyName: 'Cloud Experts Pvt Ltd', createdAt: new Date() }
        ]);
        console.log(`✅ ${companies.length} companies added`);

        // Create sample tenders
        const tenders = await Tender.insertMany([
            { title: 'IT Hardware Supply', status: 'active', estimatedValue: { amount: 25000000 }, category: 'IT Software', createdAt: new Date() },
            { title: 'Office Building Construction', status: 'active', estimatedValue: { amount: 150000000 }, category: 'Infrastructure', createdAt: new Date() },
            { title: 'Cloud Migration Services', status: 'active', estimatedValue: { amount: 30000000 }, category: 'IT Software', createdAt: new Date() },
            { title: 'Security Services', status: 'pending', estimatedValue: { amount: 8000000 }, category: 'Services', createdAt: new Date() },
            { title: 'E-Governance Portal', status: 'completed', estimatedValue: { amount: 50000000 }, category: 'IT Software', createdAt: new Date() }
        ]);
        console.log(`✅ ${tenders.length} tenders added`);

        // Create sample workflows
        const workflows = await BidWorkflow.insertMany([
            { tenderId: tenders[0]._id, companyId: companies[0]._id, status: 'in_progress', createdAt: new Date() },
            { tenderId: tenders[1]._id, companyId: companies[1]._id, status: 'submitted', createdAt: new Date() },
            { tenderId: tenders[2]._id, companyId: companies[0]._id, status: 'in_progress', createdAt: new Date() }
        ]);
        console.log(`✅ ${workflows.length} workflows added`);

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ DATA SEEDED SUCCESSFULLY!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Companies: ${companies.length}`);
        console.log(`Tenders: ${tenders.length}`);
        console.log(`Workflows: ${workflows.length}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
}

seedData();