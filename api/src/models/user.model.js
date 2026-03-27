const bcrypt = require('bcryptjs');

const users = [];

const UserModel = {
        create: async ({ displayName, email, password }) => {
                const existing = users.find(u => u.email === email);
                if (existing) throw new Error('Email already in use');

                const passwordHash = await bcrypt.hash(password, 12);
                const user = {
                        id: `user_${Date.now()}`,
                        displayName,
                        email,
                        passwordHash,
                        createdAt: new Date().toISOString(),
                        isVerified: false,
                };

                users.push(user);
                return { id: user.id, displayName: user.displayName, email: user.email, createdAt: user.createdAt };
        },

        findByEmail: async (email) => {
                return users.find(u => u.email === email) || null;
        },

        findById: async (id) => {
                const user = users.find(u => u.id === id);
                if (!user) return null;
                return { id: user.id, displayName: user.displayName, email: user.email, createdAt: user.createdAt };
        },
};

module.exports = UserModel;