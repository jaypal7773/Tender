const mongoose = require('mongoose');
require('dotenv').config();

const sampleTenders = [
    {
        title: "IT Hardware Supply",
        description: "Supply of 500 desktop computers, 100 laptops, and 50 printers",
        estimatedValue: { amount: 25000000, currency: "INR" },
        category: "IT Software",
        bidSubmissionDeadline: new Date("2024-03-15"),
        status: "active",
        eligibilityScore: 85
    },
    {
        title: "Office Building Construction",
        description: "Construction of a 5-story office building with modern amenities",
        estimatedValue: { amount: 150000000, currency: "INR" },
        category: "Infrastructure",
        bidSubmissionDeadline: new Date("2024-03-20"),
        status: "active",
        eligibilityScore: 45
    },
    {
        title: "Cloud Migration Services",
        description: "Migration of data center to cloud infrastructure",
        estimatedValue: { amount: 30000000, currency: "INR" },
        category: "IT Software",
        bidSubmissionDeadline: new Date("2024-03-10"),
        status: "expired",
        eligibilityScore: 92
    },
    {
        title: "Security Services",
        description: "Comprehensive security services including CCTV and security guards",
        estimatedValue: { amount: 8000000, currency: "INR" },
        category: "Services",
        bidSubmissionDeadline: new Date("2024-03-25"),
        status: "active",
        eligibilityScore: 70
    },
    {
        title: "E-Governance Portal",
        description: "Development of citizen services portal",
        estimatedValue: { amount: 50000000, currency: "INR" },
        category: "IT Software",
        bidSubmissionDeadline: new Date("2024-03-18"),
        status: "active",
        eligibilityScore: 78
    },
    {
        title: "Network Infrastructure",
        description: "Installation of network equipment across 10 locations",
        estimatedValue: { amount: 12000000, currency: "INR" },
        category: "IT Software",
        bidSubmissionDeadline: new Date("2024-03-28"),
        status: "active",
        eligibilityScore: 88
    },
    {
        title: "Consulting Services",
        description: "IT consulting for digital transformation",
        estimatedValue: { amount: 5000000, currency: "INR" },
        category: "Consulting",
        bidSubmissionDeadline: new Date("2024-03-05"),
        status: "expired",
        eligibilityScore: 65
    }
];

async function seedTenders() {
    try {
        // Connect to MongoDB
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_tender_platform';
        await mongoose.connect(mongoURI);
        console.log('✅ Connected to MongoDB');

        // Define schema
        const tenderSchema = new mongoose.Schema({
            title: String,
            description: String,
            estimatedValue: Object,
            category: String,
            bidSubmissionDeadline: Date,
            status: String,
            eligibilityScore: Number,
            source: { type: String, default: 'manual' }
        });
        
        const Tender = mongoose.model('Tender', tenderSchema);

        // Clear existing tenders
        const deleted = await Tender.deleteMany({});
        console.log(`🗑️ Cleared ${deleted.deletedCount} existing tenders`);

        // Insert sample tenders
        const inserted = await Tender.insertMany(sampleTenders);
        console.log(`✅ ${inserted.length} tenders added successfully!`);
        
        console.log('\n📋 Tenders List:');
        console.log('━'.repeat(50));
        inserted.forEach((tender, index) => {
            console.log(`${index + 1}. ${tender.title} - ₹${(tender.estimatedValue.amount / 10000000).toFixed(1)}Cr (${tender.status})`);
        });
        console.log('━'.repeat(50));

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

seedTenders();