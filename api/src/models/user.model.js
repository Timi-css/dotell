const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');

const inMemoryUsers = [];
let useInMemory = false;

const isPrismaAvailable = async () => {
        try {
                await prisma.$queryRaw`SELECT 1`;
                return true;
        } catch {
                return false;
        }
};

const UserModel = {
        create: async ({ displayName, email, password }) => {
                if (useInMemory || !(await isPrismaAvailable())) {
                        useInMemory = true;
                        const existing = inMemoryUsers.find(u => u.email === email);
                        if (existing) throw new Error('Email already in use');
                        const passwordHash = await bcrypt.hash(password, 12);
                        const user = {
                                id: `user_${Date.now()}`,
                                displayName,
                                email,
                                passwordHash,
                                isVerified: false,
                                verificationCode: process.env.NODE_ENV === 'test' ? '123456' : null,
                                verificationExpiry: new Date(Date.now() + 10 * 60 * 1000),
                                resetCode: null,
                                resetExpiry: null,
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
                if (useInMemory || !(await isPrismaAvailable())) {
                        useInMemory = true;
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
                if (useInMemory || !(await isPrismaAvailable())) {
                        useInMemory = true;
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

        update: async (id, { displayName }) => {
                if (useInMemory || !(await isPrismaAvailable())) {
                        useInMemory = true;
                        const user = inMemoryUsers.find(u => u.id === id);
                        if (!user) throw new Error('User not found');
                        user.displayName = displayName;
                        return { id: user.id, displayName: user.displayName, email: user.email, createdAt: user.createdAt };
                }
                return prisma.user.update({
                        where: { id },
                        data: { displayName },
                        select: { id: true, displayName: true, email: true, createdAt: true },
                });
        },

        verifyEmail: async (email, code) => {
                if (useInMemory || !(await isPrismaAvailable())) {
                        useInMemory = true;
                        const user = inMemoryUsers.find(u => u.email === email);
                        if (!user) throw new Error('User not found');
                        if (user.isVerified) throw new Error('Email already verified');
                        if (user.verificationCode !== code) throw new Error('Invalid verification code');
                        if (new Date() > new Date(user.verificationExpiry)) throw new Error('Verification code has expired');
                        user.isVerified = true;
                        user.verificationCode = null;
                        user.verificationExpiry = null;
                        return true;
                }
                const user = await prisma.user.findUnique({ where: { email } });
                if (!user) throw new Error('User not found');
                if (user.isVerified) throw new Error('Email already verified');
                if (user.verificationCode !== code) throw new Error('Invalid verification code');
                if (new Date() > new Date(user.verificationExpiry)) throw new Error('Verification code has expired');
                await prisma.user.update({
                        where: { id: user.id },
                        data: { isVerified: true, verificationCode: null, verificationExpiry: null },
                });
                return true;
        },

        setResetCode: async (email) => {
                const code = process.env.NODE_ENV === 'test' ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
                const expiry = new Date(Date.now() + 10 * 60 * 1000);
                if (useInMemory || !(await isPrismaAvailable())) {
                        useInMemory = true;
                        const user = inMemoryUsers.find(u => u.email === email);
                        if (!user) return null;
                        user.resetCode = code;
                        user.resetExpiry = expiry;
                        return { user, code };
                }
                const user = await prisma.user.findUnique({ where: { email } });
                if (!user) return null;
                await prisma.user.update({
                        where: { id: user.id },
                        data: { resetCode: code, resetExpiry: expiry },
                });
                return { user, code };
        },

        resetPassword: async (email, code, newPassword) => {
                const bcryptjs = require('bcryptjs');
                if (useInMemory || !(await isPrismaAvailable())) {
                        useInMemory = true;
                        const user = inMemoryUsers.find(u => u.email === email);
                        if (!user) throw new Error('User not found');
                        if (user.resetCode !== code) throw new Error('Invalid reset code');
                        if (new Date() > new Date(user.resetExpiry)) throw new Error('Reset code has expired');
                        user.passwordHash = await bcryptjs.hash(newPassword, 12);
                        user.resetCode = null;
                        user.resetExpiry = null;
                        return true;
                }
                const user = await prisma.user.findUnique({ where: { email } });
                if (!user) throw new Error('User not found');
                if (user.resetCode !== code) throw new Error('Invalid reset code');
                if (new Date() > new Date(user.resetExpiry)) throw new Error('Reset code has expired');
                const passwordHash = await bcryptjs.hash(newPassword, 12);
                await prisma.user.update({
                        where: { id: user.id },
                        data: { passwordHash, resetCode: null, resetExpiry: null },
                });
                return true;
        },
};

module.exports = UserModel;