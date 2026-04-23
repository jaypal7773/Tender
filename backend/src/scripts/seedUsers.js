const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('../models/User');
const CompanyProfile = require('../models/CompanyProfile');

async function seedUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        const company = await CompanyProfile.findOne();
        if (!company) {
            console.error('❌ No company found. Run seedCompany first.');
            process.exit(1);
        }
        
        const users = [
            { email: "admin@techsolutions.com", password: "Admin@123", name: "Admin User", mobileNumber: "9876543210", role: "admin", companyId: company._id, status: "active", isEmailVerified: true },
            { email: "procurement@techsolutions.com", password: "Procurement@123", name: "Procurement Manager", mobileNumber: "9876543211", role: "procurement_manager", companyId: company._id, status: "active", isEmailVerified: true },
            { email: "analyst@techsolutions.com", password: "Analyst@123", name: "Tender Analyst", mobileNumber: "9876543212", role: "analyst", companyId: company._id, status: "active", isEmailVerified: true }
        ];
        
        for (const userData of users) {
            const existing = await User.findOne({ email: userData.email });
            if (!existing) {
                const salt = await bcrypt.genSalt(12);
                const hashedPassword = await bcrypt.hash(userData.password, salt);
                await User.create({ ...userData, password: hashedPassword });
                console.log(`✅ Created user: ${userData.email}`);
            }
        }
        
        console.log('✅ Users seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding users:', error);
        process.exit(1);
    }
}

seedUsers();