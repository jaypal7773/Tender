const mongoose = require('mongoose');

async function seedData() {
    try {
        await mongoose.connect('mongodb://localhost:27017/smart_tender_platform');
        console.log('Connected to MongoDB');

        const companyProfileSchema = new mongoose.Schema({
            userId: mongoose.Schema.Types.ObjectId,
            companyName: String,
            createdAt: Date
        });
        const CompanyProfile = mongoose.model('CompanyProfile', companyProfileSchema);

        const tenderSchema = new mongoose.Schema({
            title: String,
            status: String,
            estimatedValue: Object,
            category: String,
            createdAt: Date
        });
        const Tender = mongoose.model('Tender', tenderSchema);

        const bidWorkflowSchema = new mongoose.Schema({
            tenderId: mongoose.Schema.Types.ObjectId,
            companyId: mongoose.Schema.Types.ObjectId,
            status: String,
            createdAt: Date
        });
        const BidWorkflow = mongoose.model('BidWorkflow', bidWorkflowSchema);

        await CompanyProfile.deleteMany({});
        await Tender.deleteMany({});
        await BidWorkflow.deleteMany({});
        console.log('Cleared existing data');

        const companies = await CompanyProfile.insertMany([
            { userId: new mongoose.Types.ObjectId(), companyName: 'Tech Solutions India Pvt Ltd', createdAt: new Date() },
            { userId: new mongoose.Types.ObjectId(), companyName: 'Infrastructure Builders Ltd', createdAt: new Date() },
            { userId: new mongoose.Types.ObjectId(), companyName: 'Cloud Experts Pvt Ltd', createdAt: new Date() }
        ]);
        console.log(`✅ ${companies.length} companies added`);

        const tenders = await Tender.insertMany([
            { title: 'IT Hardware Supply', status: 'active', estimatedValue: { amount: 25000000 }, category: 'IT Software', createdAt: new Date() },
            { title: 'Office Building Construction', status: 'active', estimatedValue: { amount: 150000000 }, category: 'Infrastructure', createdAt: new Date() },
            { title: 'Cloud Migration Services', status: 'active', estimatedValue: { amount: 30000000 }, category: 'IT Software', createdAt: new Date() },
            { title: 'Security Services', status: 'pending', estimatedValue: { amount: 8000000 }, category: 'Services', createdAt: new Date() },
            { title: 'E-Governance Portal', status: 'completed', estimatedValue: { amount: 50000000 }, category: 'IT Software', createdAt: new Date() }
        ]);
        console.log(`✅ ${tenders.length} tenders added`);

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
        console.error('Error:', error.message);
        process.exit(1);
    }
}

seedData();