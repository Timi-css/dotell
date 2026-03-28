const prisma = require('../lib/prisma');

const inMemoryInterviewReviews = [];
const inMemoryEmployeeReviews = [];
let useInMemory = false;

const isPrismaAvailable = async () => {
        try {
                await prisma.$queryRaw`SELECT 1`;
                return true;
        } catch {
                return false;
        }
};

const ReviewModel = {
        createInterviewReview: async ({ userId, companyId, role, rating, difficulty, outcome, reviewText }) => {
                if (useInMemory || !(await isPrismaAvailable())) {
                        useInMemory = true;
                        const review = {
                                id: `ir_${Date.now()}`,
                                userId, companyId, role, rating, difficulty, outcome, reviewText,
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                                user: { id: userId, displayName: 'Test User' },
                                company: { id: companyId, name: 'TestCo' },
                        };
                        inMemoryInterviewReviews.push(review);
                        return review;
                }
                return prisma.interviewReview.create({
                        data: { userId, companyId, role, rating, difficulty, outcome, reviewText },
                        include: {
                                user: { select: { id: true, displayName: true } },
                                company: { select: { id: true, name: true } },
                        }
                });
        },

        createEmployeeReview: async ({ userId, companyId, role, tenure, isAnonymous, cultureRating, managementRating, compensationRating, reviewText }) => {
                if (useInMemory || !(await isPrismaAvailable())) {
                        useInMemory = true;
                        const review = {
                                id: `er_${Date.now()}`,
                                userId, companyId, role, tenure, isAnonymous,
                                cultureRating, managementRating, compensationRating, reviewText,
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                                user: isAnonymous ? null : { id: userId, displayName: 'Test User' },
                                company: { id: companyId, name: 'TestCo' },
                        };
                        inMemoryEmployeeReviews.push(review);
                        return review;
                }
                return prisma.employeeReview.create({
                        data: { userId, companyId, role, tenure, isAnonymous, cultureRating, managementRating, compensationRating, reviewText },
                        include: {
                                user: { select: { id: true, displayName: true } },
                                company: { select: { id: true, name: true } },
                        }
                });
        },
};

module.exports = ReviewModel;