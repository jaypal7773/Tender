// backend/test-api.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function test() {
    try {
        await mongoose.connect('mongodb://localhost:27017/tender_db');
        console.log('Connected to DB');
        
        // Check collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));
        
        // Check companyprofiles
        const companySchema = new mongoose.Schema({}, { strict: false });
        const Company = mongoose.model('CompanyProfile', companySchema, 'companyprofiles');
        const companies = await Company.find({});
        console.log('Companies found:', companies.length);
        
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

test();