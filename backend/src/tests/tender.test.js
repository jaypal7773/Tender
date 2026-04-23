const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Tender = require('../src/models/Tender');

describe('Tender API Tests', () => {
    let accessToken;
    let testTenderId;
    
    beforeAll(async () => {
        // Create test user and get token
        const user = await User.findOne({ email: 'test@example.com' });
        if (user) {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'NewTest@123456'
                });
            accessToken = res.body.data.accessToken;
        }
        
        // Create test tender
        const tender = await Tender.create({
            sourceId: 'TEST/2024/001',
            source: 'manual',
            title: 'Test Tender for API Testing',
            description: 'This is a test tender for API testing purposes',
            estimatedValue: { amount: 1000000, currency: 'INR' },
            bidSubmissionDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            category: 'IT Software',
            status: 'discovered'
        });
        testTenderId = tender._id;
    });
    
    afterAll(async () => {
        await Tender.deleteMany({ sourceId: 'TEST/2024/001' });
        await mongoose.disconnect();
    });
    
    describe('GET /api/tenders', () => {
        it('should get all tenders with pagination', async () => {
            const res = await request(app)
                .get('/api/tenders?page=1&limit=10')
                .set('Authorization', `Bearer ${accessToken}`);
            
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeInstanceOf(Array);
            expect(res.body.pagination).toBeDefined();
        });
        
        it('should filter tenders by category', async () => {
            const res = await request(app)
                .get('/api/tenders?category=IT Software')
                .set('Authorization', `Bearer ${accessToken}`);
            
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });
        
        it('should filter tenders by min score', async () => {
            const res = await request(app)
                .get('/api/tenders?minScore=60')
                .set('Authorization', `Bearer ${accessToken}`);
            
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });
        
        it('should sort tenders', async () => {
            const res = await request(app)
                .get('/api/tenders?sortBy=bidSubmissionDeadline&sortOrder=asc')
                .set('Authorization', `Bearer ${accessToken}`);
            
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });
    
    describe('GET /api/tenders/:id', () => {
        it('should get tender by ID', async () => {
            const res = await request(app)
                .get(`/api/tenders/${testTenderId}`)
                .set('Authorization', `Bearer ${accessToken}`);
            
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('_id', testTenderId.toString());
        });
        
        it('should return 404 for non-existent tender', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .get(`/api/tenders/${fakeId}`)
                .set('Authorization', `Bearer ${accessToken}`);
            
            expect(res.statusCode).toBe(404);
        });
    });
    
    describe('POST /api/tenders/:tenderId/analyze', () => {
        it('should analyze tender eligibility', async () => {
            const res = await request(app)
                .post(`/api/tenders/${testTenderId}/analyze`)
                .set('Authorization', `Bearer ${accessToken}`);
            
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('score');
            expect(res.body.data).toHaveProperty('isEligible');
            expect(res.body.data).toHaveProperty('scoreBreakdown');
        });
    });
    
    describe('GET /api/tenders/eligible', () => {
        it('should get eligible tenders', async () => {
            const res = await request(app)
                .get('/api/tenders/eligible')
                .set('Authorization', `Bearer ${accessToken}`);
            
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeInstanceOf(Array);
        });
    });
});