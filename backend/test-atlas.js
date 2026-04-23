// backend/test-atlas.js
require('dotenv').config();
const mongoose = require('mongoose');

async function testAtlasConnection() {
    try {
        console.log('📡 Testing MongoDB Atlas Connection...');
        console.log('📍 URI:', process.env.MONGODB_URI);
        
        await mongoose.connect(process.env.MONGODB_URI);
        
        console.log('✅ Connected successfully!');
        console.log('📚 Database Name:', mongoose.connection.name);
        console.log('🌐 Host:', mongoose.connection.host);
        
        // Test creating a collection
        const testSchema = new mongoose.Schema({ test: String });
        const Test = mongoose.model('Test', testSchema);
        
        await Test.create({ test: 'Connection test' });
        console.log('✅ Write test successful!');
        
        await Test.deleteMany({});
        console.log('✅ Delete test successful!');
        
        await mongoose.disconnect();
        console.log('🔌 Disconnected');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        console.log('\n💡 Troubleshooting Tips:');
        console.log('1. Check your password - special characters may need encoding');
        console.log('2. Verify IP whitelist in Atlas (Network Access → Add 0.0.0.0/0)');
        console.log('3. Ensure cluster is active (not paused)');
        console.log('4. Check if username/password is correct');
        process.exit(1);
    }
}

testAtlasConnection();