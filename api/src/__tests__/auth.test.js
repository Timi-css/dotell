const request = require('supertest');
const app = require('../index');

describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
                const res = await request(app)
                        .post('/api/auth/register')
                        .send({ displayName: 'Test User', email: 'test@dotell.com', password: 'Password1!' });

                expect(res.statusCode).toBe(201);
                expect(res.body.user.email).toBe('test@dotell.com');
                expect(res.body.token).toBeDefined();
                expect(res.body.user.passwordHash).toBeUndefined();
        });

        it('should reject weak password', async () => {
                const res = await request(app)
                        .post('/api/auth/register')
                        .send({ displayName: 'Test', email: 'weak@dotell.com', password: 'password' });

                expect(res.statusCode).toBe(400);
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
        });

        it('should reject duplicate email', async () => {
                await request(app)
                        .post('/api/auth/register')
                        .send({ displayName: 'First', email: 'duplicate@dotell.com', password: 'Password1!' });

                const res = await request(app)
                        .post('/api/auth/register')
                        .send({ displayName: 'Second', email: 'duplicate@dotell.com', password: 'Password1!' });

                expect(res.statusCode).toBe(409);
                expect(res.body.error).toBe('Email already in use');
        });
});

describe('POST /api/auth/login', () => {
        beforeAll(async () => {
                await request(app)
                        .post('/api/auth/register')
                        .send({ displayName: 'Login User', email: 'login@dotell.com', password: 'Password1!' });
        });

        it('should login successfully with correct credentials', async () => {
                const res = await request(app)
                        .post('/api/auth/login')
                        .send({ email: 'login@dotell.com', password: 'Password1!' });

                expect(res.statusCode).toBe(200);
                expect(res.body.token).toBeDefined();
        });
        // ... rest stays the same
});

describe('GET /api/auth/me', () => {
        let token;

        beforeAll(async () => {
                const res = await request(app)
                        .post('/api/auth/register')
                        .send({ displayName: 'Me User', email: 'me@dotell.com', password: 'Password1!' });
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

describe('GET /api/auth/me', () => {
        let token;

        beforeAll(async () => {
                const res = await request(app)
                        .post('/api/auth/register')
                        .send({ displayName: 'Me User', email: 'me_unique@dotell.com', password: 'password123!' });
                token = res.body.token;
        });

        it('should return current user with valid token', async () => {
                const res = await request(app)
                        .get('/api/auth/me')
                        .set('Authorization', `Bearer ${token}`);

                expect(res.statusCode).toBe(200);
                expect(res.body.user.email).toBe('me_unique@dotell.com');
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

describe('POST /api/auth/verify-email', () => {
        it('should verify email with correct code', async () => {
                await request(app)
                        .post('/api/auth/register')
                        .send({ displayName: 'Verify User', email: 'verify@dotell.com', password: 'Password1!' });

                const res = await request(app)
                        .post('/api/auth/verify-email')
                        .send({ email: 'verify@dotell.com', code: '123456' });

                expect(res.statusCode).toBe(200);
                expect(res.body.message).toBe('Email verified successfully');
        });

        it('should reject invalid verification code', async () => {
                await request(app)
                        .post('/api/auth/register')
                        .send({ displayName: 'Verify User 2', email: 'verify2@dotell.com', password: 'Password1!' });

                const res = await request(app)
                        .post('/api/auth/verify-email')
                        .send({ email: 'verify2@dotell.com', code: '000000' });

                expect(res.statusCode).toBe(400);
                expect(res.body.error).toBe('Invalid verification code');
        });

        it('should reject missing fields', async () => {
                const res = await request(app)
                        .post('/api/auth/verify-email')
                        .send({ email: 'verify@dotell.com' });

                expect(res.statusCode).toBe(400);
        });
});

describe('POST /api/auth/forgot-password', () => {
        it('should return success even for non-existent email', async () => {
                const res = await request(app)
                        .post('/api/auth/forgot-password')
                        .send({ email: 'nonexistent@dotell.com' });

                expect(res.statusCode).toBe(200);
                expect(res.body.message).toBeDefined();
        });

        it('should reject missing email', async () => {
                const res = await request(app)
                        .post('/api/auth/forgot-password')
                        .send({});

                expect(res.statusCode).toBe(400);
        });
});

describe('POST /api/auth/reset-password', () => {
        it('should reset password with valid code', async () => {
                await request(app)
                        .post('/api/auth/register')
                        .send({ displayName: 'Reset User', email: 'reset@dotell.com', password: 'Password1!' });

                await request(app)
                        .post('/api/auth/forgot-password')
                        .send({ email: 'reset@dotell.com' });

                const res = await request(app)
                        .post('/api/auth/reset-password')
                        .send({ email: 'reset@dotell.com', code: '123456', newPassword: 'NewPassword1!' });

                expect(res.statusCode).toBe(200);
                expect(res.body.message).toBe('Password reset successfully');
        });

        it('should reject invalid reset code', async () => {
                const res = await request(app)
                        .post('/api/auth/reset-password')
                        .send({ email: 'reset@dotell.com', code: '000000', newPassword: 'NewPassword1!' });

                expect(res.statusCode).toBe(400);
                expect(res.body.error).toBe('Invalid reset code');
        });

        it('should reject weak new password', async () => {
                const res = await request(app)
                        .post('/api/auth/reset-password')
                        .send({ email: 'reset@dotell.com', code: '123456', newPassword: 'weak' });

                expect(res.statusCode).toBe(400);
        });

        it('should reject missing fields', async () => {
                const res = await request(app)
                        .post('/api/auth/reset-password')
                        .send({ email: 'reset@dotell.com' });

                expect(res.statusCode).toBe(400);
        });
});