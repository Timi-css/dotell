process.env.JWT_SECRET = 'test-secret-for-jest';
process.env.JWT_EXPIRES_IN = '7d';
process.env.PORT = '3001';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5433/test';