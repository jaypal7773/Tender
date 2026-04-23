// backend/seed-atlas.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define User Schema
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    mobileNumber: String,
    role: String,
    isAdmin: Boolean,
    status: String,
    isEmailVerified: Boolean,
    companyId: mongoose.Schema.Types.ObjectId,
    createdAt: Date,
    updatedAt: Date
});

const User = mongoose.model('User', userSchema);

// Define Company Schema
const companySchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    companyName: String,
    registrationNumber: String,
    gstin: String,
    pan: String,
    financials: Object,
    createdAt: Date
});

const Company = mongoose.model('Company', companySchema);

// Define Tender Schema
const tenderSchema = new mongoose.Schema({
    title: String,
    description: String,
    estimatedValue: Object,
    category: String,
    bidSubmissionDeadline: Date,
    status: String,
    eligibilityScore: Number,
    createdAt: Date
});

const Tender = mongoose.model('Tender', tenderSchema);

async function seedDatabase() {
    try {
        console.log('🌱 Seeding database...');
        
        // Clear existing data
        await User.deleteMany({});
        await Company.deleteMany({});
        await Tender.deleteMany({});
        console.log('🗑️ Cleared existing data');

        // Hash password
        const hashedPassword = await bcrypt.hash('Admin@123', 12);
        
        // Create Super Admin
        const superAdmin = await User.create({
            name: 'Super Admin',
            email: 'superadmin@example.com',
            password: hashedPassword,
            mobileNumber: '9999999999',
            role: 'super_admin',
            isAdmin: true,
            status: 'active',
            isEmailVerified: true,
            companyId: new mongoose.Types.ObjectId(),
            createdAt: new Date(),
            updatedAt: new Date()
        });
        console.log('✅ Super Admin created');

        // Create Admin
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: hashedPassword,
            mobileNumber: '9999999998',
            role: 'admin',
            isAdmin: true,
            status: 'active',
            isEmailVerified: true,
            companyId: new mongoose.Types.ObjectId(),
            createdAt: new Date(),
            updatedAt: new Date()
        });
        console.log('✅ Admin User created');

        // Create Regular User
        const regularUser = await User.create({
            name: 'Regular User',
            email: 'user@example.com',
            password: hashedPassword,
            mobileNumber: '9999999997',
            role: 'analyst',
            isAdmin: false,
            status: 'active',
            isEmailVerified: true,
            companyId: new mongoose.Types.ObjectId(),
            createdAt: new Date(),
            updatedAt: new Date()
        });
        console.log('✅ Regular User created');

        // Create Companies
        await Company.create([
            {
                userId: superAdmin._id,
                companyName: 'Tech Solutions India Pvt Ltd',
                registrationNumber: 'U72900MH2020PTC123456',
                gstin: '27AAACT1234F1Z',
                pan: 'AAACT1234F',
                financials: {
                    annualTurnover: { current: 25000000, previous: 18000000 },
                    netWorth: 5000000,
                    profitAfterTax: 1500000
                },
                createdAt: new Date()
            },
            {
                userId: admin._id,
                companyName: 'Infrastructure Builders Ltd',
                registrationNumber: 'U45200MH2019PTC123457',
                gstin: '27AAACT1234F2Z',
                pan: 'AAACT1235F',
                financials: {
                    annualTurnover: { current: 150000000, previous: 120000000 },
                    netWorth: 25000000,
                    profitAfterTax: 8000000
                },
                createdAt: new Date()
            }
        ]);
        console.log('✅ Companies created');

        // Create Tenders
        await Tender.create([
            {
                title: 'IT Hardware Supply',
                description: 'Supply of 500 desktop computers, 100 laptops, and 50 printers',
                estimatedValue: { amount: 25000000, currency: 'INR' },
                category: 'IT Software',
                bidSubmissionDeadline: new Date('2024-03-15'),
                status: 'active',
                eligibilityScore: 85,
                createdAt: new Date()
            },
            {
                title: 'Cloud Migration Services',
                description: 'Migration of data center to cloud infrastructure',
                estimatedValue: { amount: 30000000, currency: 'INR' },
                category: 'IT Software',
                bidSubmissionDeadline: new Date('2024-03-10'),
                status: 'active',
                eligibilityScore: 92,
                createdAt: new Date()
            },
            {
                title: 'Office Building Construction',
                description: 'Construction of a 5-story office building',
                estimatedValue: { amount: 150000000, currency: 'INR' },
                category: 'Infrastructure',
                bidSubmissionDeadline: new Date('2024-03-20'),
                status: 'active',
                eligibilityScore: 45,
                createdAt: new Date()
            },
            {
                title: 'Security Services',
                description: 'Comprehensive security services including CCTV and guards',
                estimatedValue: { amount: 8000000, currency: 'INR' },
                category: 'Services',
                bidSubmissionDeadline: new Date('2024-03-25'),
                status: 'pending',
                eligibilityScore: 70,
                createdAt: new Date()
            },
            {
                title: 'E-Governance Portal',
                description: 'Development of citizen services portal',
                estimatedValue: { amount: 50000000, currency: 'INR' },
                category: 'IT Software',
                bidSubmissionDeadline: new Date('2024-03-18'),
                status: 'completed',
                eligibilityScore: 78,
                createdAt: new Date()
            }
        ]);
        console.log('✅ Tenders created');

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ DATABASE SEEDED SUCCESSFULLY!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n👥 USERS:');
        console.log('  🔑 Super Admin: superadmin@example.com / Admin@123');
        console.log('  🔑 Admin: admin@example.com / Admin@123');
        console.log('  🔑 User: user@example.com / User@123');
        console.log('\n🏢 COMPANIES: 2');
        console.log('📋 TENDERS: 5');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error.message);
        process.exit(1);
    }
}

seedDatabase();