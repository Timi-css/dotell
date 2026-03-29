const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');
const prisma = require('../lib/prisma');

const generateToken = (userId) => {
        return jwt.sign(
                { userId },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
        );
};

const register = async (req, res) => {
        try {
                const { displayName, email, password } = req.body;

                if (!displayName || !email || !password) {
                        return res.status(400).json({ error: 'All fields are required' });
                }

                if (password.length < 8) {
                        return res.status(400).json({ error: 'Password must be at least 8 characters' });
                }

                const user = await UserModel.create({ displayName, email, password });
                const token = generateToken(user.id);

                return res.status(201).json({ user, token });
        } catch (error) {
                if (error.message === 'Email already in use') {
                        return res.status(409).json({ error: error.message });
                }
                return res.status(500).json({ error: 'Something went wrong' });
        }
};

const login = async (req, res) => {
        try {
                const { email, password } = req.body;

                if (!email || !password) {
                        return res.status(400).json({ error: 'Email and password are required' });
                }

                const user = await UserModel.findByEmail(email);
                if (!user) {
                        return res.status(401).json({ error: 'Invalid credentials' });
                }

                const isValid = await bcrypt.compare(password, user.passwordHash);
                if (!isValid) {
                        return res.status(401).json({ error: 'Invalid credentials' });
                }

                const token = generateToken(user.id);
                return res.json({
                        user: { id: user.id, displayName: user.displayName, email: user.email },
                        token,
                });
        } catch {
                return res.status(500).json({ error: 'Something went wrong' });
        }
};

const updateProfile = async (req, res) => {
        try {
                const { displayName } = req.body;
                if (!displayName) {
                        return res.status(400).json({ error: 'Display name is required' });
                }
                const user = await prisma.user.update({
                        where: { id: req.userId },
                        data: { displayName },
                        select: { id: true, displayName: true, email: true, createdAt: true },
                });
                return res.json({ user });
        } catch {
                return res.status(500).json({ error: 'Something went wrong' });
        }
};


const me = async (req, res) => {
        try {
                const user = await UserModel.findById(req.userId);
                if (!user) return res.status(404).json({ error: 'User not found' });
                return res.json({ user });
        } catch {
                return res.status(500).json({ error: 'Something went wrong' });
        }
};

module.exports = { register, login, me, updateProfile };