const request = require('supertest');
const app = require('../index');

let token;
let companyId;

beforeAll(async () => {
        const res = await request(app)
                .post('/api/auth/register')
                .send({ displayName: 'Test User', email: 'companies_test@dotell.com', password: 'password123!' });
        token = res.body.token;
});

describe('POST /api/companies', () => {
        it('should create a company when authenticated', async () => {
                const res = await request(app)
                        .post('/api/companies')
                        .set('Authorization', `Bearer ${token}`)
                        .send({ name: 'TestCo', industry: 'Tech', location: 'Toronto, CA' });

                expect(res.statusCode).toBe(201);
                expect(res.body.company.name).toBe('TestCo');
                companyId = res.body.company.id;
        });

        it('should reject creation without auth', async () => {
                const res = await request(app)
                        .post('/api/companies')
                        .send({ name: 'AnotherCo' });

                expect(res.statusCode).toBe(401);
        });

        it('should reject creation without a name', async () => {
                const res = await request(app)
                        .post('/api/companies')
                        .set('Authorization', `Bearer ${token}`)
                        .send({ industry: 'Tech' });

                expect(res.statusCode).toBe(400);
                expect(res.body.error).toBe('Company name is required');
        });
});

describe('GET /api/companies', () => {
        it('should return list of companies', async () => {
                const res = await request(app).get('/api/companies');
                expect(res.statusCode).toBe(200);
                expect(Array.isArray(res.body.companies)).toBe(true);
        });

        it('should filter companies by search query', async () => {
                const res = await request(app).get('/api/companies?search=TestCo');
                expect(res.statusCode).toBe(200);
                expect(res.body.companies.length).toBeGreaterThan(0);
        });
});

describe('GET /api/companies/:id', () => {
        it('should return a company by id', async () => {
                const res = await request(app).get(`/api/companies/${companyId}`);
                expect(res.statusCode).toBe(200);
                expect(res.body.company.name).toBe('TestCo');
        });

        it('should return 404 for non-existent company', async () => {
                const res = await request(app).get('/api/companies/nonexistentid');
                expect(res.statusCode).toBe(404);
        });
});

describe('POST /api/companies/:id/interview-reviews', () => {
        it('should create an interview review', async () => {
                const res = await request(app)
                        .post(`/api/companies/${companyId}/interview-reviews`)
                        .set('Authorization', `Bearer ${token}`)
                        .send({
                                role: 'Software Engineer',
                                rating: 4,
                                difficulty: 3,
                                outcome: 'OFFER',
                                reviewText: 'Great process, very respectful team.',
                        });

                expect(res.statusCode).toBe(201);
                expect(res.body.review.outcome).toBe('OFFER');
        });

        it('should reject invalid outcome', async () => {
                const res = await request(app)
                        .post(`/api/companies/${companyId}/interview-reviews`)
                        .set('Authorization', `Bearer ${token}`)
                        .send({
                                role: 'Software Engineer',
                                rating: 4,
                                difficulty: 3,
                                outcome: 'INVALID',
                                reviewText: 'Great process.',
                        });

                expect(res.statusCode).toBe(400);
        });

        it('should reject rating out of range', async () => {
                const res = await request(app)
                        .post(`/api/companies/${companyId}/interview-reviews`)
                        .set('Authorization', `Bearer ${token}`)
                        .send({
                                role: 'Software Engineer',
                                rating: 10,
                                difficulty: 3,
                                outcome: 'OFFER',
                                reviewText: 'Great process.',
                        });

                expect(res.statusCode).toBe(400);
        });

        it('should reject without auth', async () => {
                const res = await request(app)
                        .post(`/api/companies/${companyId}/interview-reviews`)
                        .send({
                                role: 'Software Engineer',
                                rating: 4,
                                difficulty: 3,
                                outcome: 'OFFER',
                                reviewText: 'Great process.',
                        });

                expect(res.statusCode).toBe(401);
        });
});

describe('POST /api/companies/:id/employee-reviews', () => {
        it('should create an employee review', async () => {
                const res = await request(app)
                        .post(`/api/companies/${companyId}/employee-reviews`)
                        .set('Authorization', `Bearer ${token}`)
                        .send({
                                role: 'Senior Engineer',
                                tenure: '2 years',
                                isAnonymous: false,
                                cultureRating: 4,
                                managementRating: 3,
                                compensationRating: 5,
                                reviewText: 'Great culture, management could improve.',
                        });

                expect(res.statusCode).toBe(201);
                expect(res.body.review.cultureRating).toBe(4);
        });

        it('should hide user when anonymous', async () => {
                const res = await request(app)
                        .post(`/api/companies/${companyId}/employee-reviews`)
                        .set('Authorization', `Bearer ${token}`)
                        .send({
                                role: 'Senior Engineer',
                                tenure: '2 years',
                                isAnonymous: true,
                                cultureRating: 2,
                                managementRating: 1,
                                compensationRating: 3,
                                reviewText: 'Toxic management at the top.',
                        });

                expect(res.statusCode).toBe(201);
                expect(res.body.review.user).toBeNull();
        });
});