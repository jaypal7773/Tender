const mongoose = require('mongoose');
require('dotenv').config();
const CompanyProfile = require('../models/CompanyProfile');

async function seedCompany() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        const company = await CompanyProfile.findOneAndUpdate(
            { userId: new mongoose.Types.ObjectId() },
            {
                companyName: "Tech Solutions India Pvt Ltd",
                registrationNumber: "U72900MH2020PTC123456",
                gstin: "27AAACT1234F1Z",
                pan: "AAACT1234F",
                financials: {
                    annualTurnover: { current: 25000000, previous: 18000000, lastUpdated: new Date() },
                    netWorth: 5000000,
                    profitAfterTax: 1500000
                },
                certifications: [
                    { name: "ISO 9001:2015", certificateNumber: "ISO/9001/2024/001", issuingAuthority: "BSI", validUntil: new Date("2026-12-31"), isActive: true },
                    { name: "MSME Registration", certificateNumber: "MSME/2024/12345", issuingAuthority: "MSME", validUntil: new Date("2029-12-31"), isActive: true }
                ],
                pastProjects: [
                    { projectName: "E-Procurement Portal", projectValue: 5000000, completionDate: new Date("2023-06-30"), clientName: "State Government", isSuccessful: true },
                    { projectName: "Tender Management System", projectValue: 3000000, completionDate: new Date("2024-01-15"), clientName: "Municipal Corporation", isSuccessful: true }
                ],
                operationalLocations: [
                    { state: "Maharashtra", city: "Mumbai", hasOffice: true, pincode: "400001" },
                    { state: "Karnataka", city: "Bangalore", hasOffice: true, pincode: "560001" }
                ],
                categories: [{ type: "msme", certificateNumber: "MSME/2024/12345", validUntil: new Date("2029-12-31"), registrationDate: new Date("2024-01-01") }],
                preferredCategories: ["IT Software", "Consulting", "Services"],
                minTenderValue: 100000,
                maxTenderValue: 50000000,
                teamCapabilities: { totalEmployees: 150, technicalStaff: 85, projectManagers: 12 }
            },
            { upsert: true, new: true }
        );
        
        console.log('✅ Company profile seeded successfully');
        console.log('Company ID:', company._id);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding company:', error);
        process.exit(1);
    }
}

seedCompany();