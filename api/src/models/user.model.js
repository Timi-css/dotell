const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');

const inMemoryUsers = [];
let useInMemory = false;

const UserModel = {
        create: async ({ displayName, email, password }) => {
                if (useInMemory) {
                        const existing = inMemoryUsers.find(u => u.email === email);
                        if (existing) throw new Error('Email already in use');
                        const passwordHash = await bcrypt.hash(password, 12);
                        const user = {
                                id: `user_${Date.now()}`,
                                displayName,
                                email,
                                passwordHash,
                                createdAt: new Date().toISOString(),
                        };
                        inMemoryUsers.push(user);
                        return { id: user.id, displayName: user.displayName, email: user.email, createdAt: user.createdAt };
                }

                try {
                        const existing = await prisma.user.findUnique({ where: { email } });
                        if (existing) throw new Error('Email already in use');
                        const passwordHash = await bcrypt.hash(password, 12);
                        const user = await prisma.user.create({
                                data: { displayName, email, passwordHash },
                                select: { id: true, displayName: true, email: true, createdAt: true }
                        });
                        return user;
                } catch (err) {
                        if (err.message === 'Email already in use') throw err;
                        useInMemory = true;
                        return UserModel.create({ displayName, email, password });
                }
        },

        findByEmail: async (email) => {
                if (useInMemory) {
                        return inMemoryUsers.find(u => u.email === email) || null;
                }
                try {
                        return await prisma.user.findUnique({ where: { email } });
                } catch {
                        useInMemory = true;
                        return UserModel.findByEmail(email);
                }
        },

        findById: async (id) => {
                if (useInMemory) {
                        const user = inMemoryUsers.find(u => u.id === id);
                        if (!user) return null;
                        return { id: user.id, displayName: user.displayName, email: user.email, createdAt: user.createdAt };
                }
                try {
                        return await prisma.user.findUnique({
                                where: { id },
                                select: { id: true, displayName: true, email: true, createdAt: true }
                        });
                } catch {
                        useInMemory = true;
                        return UserModel.findById(id);
                }
        },
};

module.exports = UserModel;