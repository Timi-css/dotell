const request = require('supertest');
const app = require('../index');

describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
                const res = await request(app)
                        .post('/api/auth/register')
                        .send({ displayName: 'Test User', email: 'test@dotell.com', password: 'password123' });

                expect(res.statusCode).toBe(201);
                expect(res.body.user.email).toBe('test@dotell.com');
                expect(res.body.user.displayName).toBe('Test User');
                expect(res.body.token).toBeDefined();
                expect(res.body.user.passwordHash).toBeUndefined();
        });

        it('should reject registration with missing fields', async () => {
                const res = await request(app)
                        .post('/api/auth/register')
                        .send({ email: 'test@dotell.com' });

                expect(res.statusCode).toBe(400);
                expect(res.body.error).toBe('All fields are required');
        });

        it('should reject registration with short password', async () => {
                const res = await request(app)
                        .post('/api/auth/register')
                        .send({ displayName: 'Test', email: 'short@dotell.com', password: '123' });

                expect(res.statusCode).toBe(400);
                expect(res.body.error).toBe('Password must be at least 8 characters');
        });

        it('should reject duplicate email', async () => {
                await request(app)
                        .post('/api/auth/register')
                        .send({ displayName: 'First', email: 'duplicate@dotell.com', password: 'password123' });

                const res = await request(app)
                        .post('/api/auth/register')
                        .send({ displayName: 'Second', email: 'duplicate@dotell.com', password: 'password123' });

                expect(res.statusCode).toBe(409);
                expect(res.body.error).toBe('Email already in use');
        });
});

describe('POST /api/auth/login', () => {
        beforeAll(async () => {
                await request(app)
                        .post('/api/auth/register')
                        .send({ displayName: 'Login User', email: 'login@dotell.com', password: 'password123' });
        });

        it('should login successfully with correct credentials', async () => {
                const res = await request(app)
                        .post('/api/auth/login')
                        .send({ email: 'login@dotell.com', password: 'password123' });

                expect(res.statusCode).toBe(200);
                expect(res.body.token).toBeDefined();
                expect(res.body.user.email).toBe('login@dotell.com');
        });

        it('should reject login with wrong password', async () => {
                const res = await request(app)
                        .post('/api/auth/login')
                        .send({ email: 'login@dotell.com', password: 'wrongpassword' });

                expect(res.statusCode).toBe(401);
                expect(res.body.error).toBe('Invalid credentials');
        });

        it('should reject login with non-existent email', async () => {
                const res = await request(app)
                        .post('/api/auth/login')
                        .send({ email: 'ghost@dotell.com', password: 'password123' });

                expect(res.statusCode).toBe(401);
                expect(res.body.error).toBe('Invalid credentials');
        });

        it('should reject login with missing fields', async () => {
                const res = await request(app)
                        .post('/api/auth/login')
                        .send({ email: 'login@dotell.com' });

                expect(res.statusCode).toBe(400);
                expect(res.body.error).toBe('Email and password are required');
        });
});

describe('GET /api/auth/me', () => {
        let token;

        beforeAll(async () => {
                const res = await request(app)
                        .post('/api/auth/register')
                        .send({ displayName: 'Me User', email: 'me@dotell.com', password: 'password123' });
                token = res.body.token;
        });

        it('should return current user with valid token', async () => {
                const res = await request(app)
                        .get('/api/auth/me')
                        .set('Authorization', `Bearer ${token}`);

                expect(res.statusCode).toBe(200);
                expect(res.body.user.email).toBe('me@dotell.com');
        });

        it('should reject request with no token', async () => {
                const res = await request(app).get('/api/auth/me');
                expect(res.statusCode).toBe(401);
                expect(res.body.error).toBe('No token provided');
        });

        it('should reject request with invalid token', async () => {
                const res = await request(app)
                        .get('/api/auth/me')
                        .set('Authorization', 'Bearer invalidtoken');

                expect(res.statusCode).toBe(401);
                expect(res.body.error).toBe('Invalid or expired token');
        });
});