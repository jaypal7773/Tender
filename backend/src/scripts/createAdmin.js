const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const createAdmin = async () => {
    try {
        console.log('Connecting to MongoDB...');
        
        // Connect to MongoDB
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_tender_platform';
        await mongoose.connect(mongoURI);
        console.log('✅ Connected to MongoDB');

        // Define User Schema
        const userSchema = new mongoose.Schema({
            name: String,
            email: String,
            password: String,
            mobileNumber: String,
            companyId: mongoose.Schema.Types.ObjectId,
            role: String,
            isAdmin: Boolean,
            status: String,
            isEmailVerified: Boolean,
            createdAt: Date,
            updatedAt: Date
        });

        const User = mongoose.model('User', userSchema);

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@smarttender.com' });
        
        if (existingAdmin) {
            console.log('✅ Admin already exists!');
            console.log('📧 Email: admin@smarttender.com');
            console.log('🔑 Password: Admin@123456');
            await mongoose.disconnect();
            process.exit(0);
        }

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash('Admin@123456', salt);

        // Create admin user
        const admin = new User({
            name: 'Super Admin',
            email: 'admin@smarttender.com',
            password: hashedPassword,
            mobileNumber: '9999999999',
            companyId: new mongoose.Types.ObjectId(),
            role: 'super_admin',
            isAdmin: true,
            status: 'active',
            isEmailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await admin.save();
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Admin created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email: admin@smarttender.com');
        console.log('🔑 Password: Admin@123456');
        console.log('👑 Role: Super Admin');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error.message);
        process.exit(1);
    }
};

createAdmin();