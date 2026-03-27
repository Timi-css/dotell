const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');

const UserModel = {
        create: async ({ displayName, email, password }) => {
                const existing = await prisma.user.findUnique({ where: { email } });
                if (existing) throw new Error('Email already in use');

                const passwordHash = await bcrypt.hash(password, 12);
                const user = await prisma.user.create({
                        data: { displayName, email, passwordHash },
                        select: { id: true, displayName: true, email: true, createdAt: true }
                });

                return user;
        },

        findByEmail: async (email) => {
                return prisma.user.findUnique({ where: { email } });
        },

        findById: async (id) => {
                return prisma.user.findUnique({
                        where: { id },
                        select: { id: true, displayName: true, email: true, createdAt: true }
                });
        },
};

module.exports = UserModel;