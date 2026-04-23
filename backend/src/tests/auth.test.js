const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');

describe('Authentication API Tests', () => {
    let accessToken;
    let refreshToken;
    let testUserId;
    
    beforeAll(async () => {
        // Clear test database
        await User.deleteMany({ email: /test@example.com/ });
    });
    
    afterAll(async () => {
        await mongoose.disconnect();
    });
    
    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test@example.com',
                    password: 'Test@123456',
                    name: 'Test User',
                    mobileNumber: '9876543210',
                    companyId: new mongoose.Types.ObjectId()
                });
            
            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.user).toHaveProperty('email', 'test@example.com');
            expect(res.body.data.user).toHaveProperty('name', 'Test User');
        });
        
        it('should not register with existing email', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test@example.com',
                    password: 'Test@123456',
                    name: 'Test User 2',
                    mobileNumber: '9876543211',
                    companyId: new mongoose.Types.ObjectId()
                });
            
            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });
        
        it('should validate required fields', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'invalid-email',
                    password: 'short',
                    name: '',
                    mobileNumber: '123'
                });
            
            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.errors).toBeDefined();
        });
    });
    
    describe('POST /api/auth/login', () => {
        it('should login with correct credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'Test@123456'
                });
            
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('accessToken');
            expect(res.body.data).toHaveProperty('refreshToken');
            expect(res.body.data.user).toHaveProperty('email', 'test@example.com');
            
            accessToken = res.body.data.accessToken;
            refreshToken = res.body.data.refreshToken;
        });
        
        it('should not login with wrong password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'WrongPassword123'
                });
            
            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
        });
        
        it('should not login with non-existent email', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'Test@123456'
                });
            
            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
        });
        
        it('should validate login fields', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'invalid-email',
                    password: ''
                });
            
            expect(res.statusCode).toBe(400);
        });
    });
    
    describe('POST /api/auth/refresh-token', () => {
        it('should refresh access token', async () => {
            const res = await request(app)
                .post('/api/auth/refresh-token')
                .send({ refreshToken });
            
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('accessToken');
        });
        
        it('should not refresh with invalid token', async () => {
            const res = await request(app)
                .post('/api/auth/refresh-token')
                .send({ refreshToken: 'invalid-token' });
            
            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
        });
        
        it('should require refresh token', async () => {
            const res = await request(app)
                .post('/api/auth/refresh-token')
                .send({});
            
            expect(res.statusCode).toBe(400);
        });
    });
    
    describe('GET /api/auth/me', () => {
        it('should get current user profile', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${accessToken}`);
            
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.user).toHaveProperty('email', 'test@example.com');
        });
        
        it('should not access without token', async () => {
            const res = await request(app)
                .get('/api/auth/me');
            
            expect(res.statusCode).toBe(401);
        });
        
        it('should not access with invalid token', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid-token');
            
            expect(res.statusCode).toBe(401);
        });
    });
    
    describe('POST /api/auth/change-password', () => {
        it('should change password with correct current password', async () => {
            const res = await request(app)
                .put('/api/auth/change-password')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    currentPassword: 'Test@123456',
                    newPassword: 'NewTest@123456'
                });
            
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });
        
        it('should not change password with wrong current password', async () => {
            const res = await request(app)
                .put('/api/auth/change-password')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    currentPassword: 'WrongPassword',
                    newPassword: 'NewTest@123456'
                });
            
            expect(res.statusCode).toBe(401);
        });
        
        it('should validate new password strength', async () => {
            const res = await request(app)
                .put('/api/auth/change-password')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    currentPassword: 'NewTest@123456',
                    newPassword: 'weak'
                });
            
            expect(res.statusCode).toBe(400);
        });
    });
    
    describe('POST /api/auth/logout', () => {
        it('should logout successfully', async () => {
            const res = await request(app)
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${accessToken}`);
            
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });
        
        it('should not access protected route after logout', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${accessToken}`);
            
            expect(res.statusCode).toBe(401);
        });
    });
});