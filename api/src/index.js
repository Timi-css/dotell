require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

app.get('/health', (_req, res) => {
        res.json({ status: 'ok', app: 'DoTell API' });
});

module.exports = app;

if (require.main === module) {
        app.listen(PORT, () => {
                console.log(`DoTell API running on port ${PORT}`);
        });
}