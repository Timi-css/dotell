const prisma = require('../lib/prisma');

const inMemoryCompanies = [];
let useInMemory = false;

const isPrismaAvailable = async () => {
        try {
                await prisma.$queryRaw`SELECT 1`;
                return true;
        } catch {
                return false;
        }
};

const CompanyModel = {
        create: async ({ name, industry, location }) => {
                if (useInMemory || !(await isPrismaAvailable())) {
                        useInMemory = true;
                        const existing = inMemoryCompanies.find(c => c.name === name);
                        if (existing) throw new Error('Company already exists');
                        const company = {
                                id: `company_${Date.now()}`,
                                name, industry, location,
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                                _count: { interviewReviews: 0, employeeReviews: 0 }
                        };
                        inMemoryCompanies.push(company);
                        return company;
                }
                const existing = await prisma.company.findUnique({ where: { name } });
                if (existing) throw new Error('Company already exists');
                return prisma.company.create({ data: { name, industry, location } });
        },

        findAll: async (search) => {
                if (useInMemory || !(await isPrismaAvailable())) {
                        useInMemory = true;
                        if (search) {
                                return inMemoryCompanies.filter(c =>
                                        c.name.toLowerCase().includes(search.toLowerCase())
                                );
                        }
                        return inMemoryCompanies;
                }
                return prisma.company.findMany({
                        where: search ? { name: { contains: search, mode: 'insensitive' } } : undefined,
                        orderBy: { name: 'asc' },
                        include: {
                                interviewReviews: {
                                        orderBy: { createdAt: 'desc' },
                                        take: 5,
                                        include: {
                                                user: { select: { id: true, displayName: true } }
                                        }
                                },
                                _count: {
                                        select: {
                                                interviewReviews: true,
                                                employeeReviews: true,
                                        }
                                }
                        }
                });
        },

        findById: async (id) => {
                if (useInMemory || !(await isPrismaAvailable())) {
                        useInMemory = true;
                        const company = inMemoryCompanies.find(c => c.id === id);
                        if (!company) return null;
                        return { ...company, interviewReviews: [], employeeReviews: [] };
                }
                return prisma.company.findUnique({
                        where: { id },
                        include: {
                                interviewReviews: {
                                        orderBy: { createdAt: 'desc' },
                                        include: { user: { select: { id: true, displayName: true } } }
                                },
                                employeeReviews: {
                                        orderBy: { createdAt: 'desc' },
                                        include: { user: { select: { id: true, displayName: true } } }
                                },
                                _count: { select: { interviewReviews: true, employeeReviews: true } }
                        }
                });
        },
};

module.exports = CompanyModel;