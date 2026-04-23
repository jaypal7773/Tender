const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function createSuperAdmin() {
    try {
        await mongoose.connect('mongodb://localhost:27017/smart_tender_platform');
        console.log('Connected to MongoDB');

        const userSchema = new mongoose.Schema({
            name: String, email: String, password: String, mobileNumber: String,
            companyId: mongoose.Schema.Types.ObjectId, role: String, isAdmin: Boolean,
            status: String, isEmailVerified: Boolean
        });
        const User = mongoose.model('User', userSchema);

        // Delete existing super admin
        await User.deleteMany({ role: 'super_admin' });
        console.log('Deleted existing super admin');

        // Hash password
        const hashedPassword = await bcrypt.hash('SuperAdmin@123', 12);

        // Create super admin
        const superAdmin = new User({
            name: 'Super Admin',
            email: 'superadmin@example.com',
            password: hashedPassword,
            mobileNumber: '9999999999',
            companyId: new mongoose.Types.ObjectId(),
            role: 'super_admin',
            isAdmin: true,
            status: 'active',
            isEmailVerified: true
        });

        await superAdmin.save();
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ SUPER ADMIN CREATED!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Email: superadmin@example.com');
        console.log('Password: SuperAdmin@123');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

createSuperAdmin();