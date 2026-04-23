// backend/test-token.js
const jwt = require('jsonwebtoken');

const token = jwt.sign(
    { id: 'test123', email: 'test@example.com', role: 'admin' },
    'your-secret-key',
    { expiresIn: '1h' }
);

console.log('Test Token:', token);

// Verify token
try {
    const decoded = jwt.verify(token, 'your-secret-key');
    console.log('Token verified:', decoded);
} catch (error) {
    console.log('Token verification failed:', error.message);
}