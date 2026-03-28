require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
        origin: ['http://localhost:8081', 'http://localhost:19006'],
        credentials: true,
}));

app.use(express.json());

const authRoutes = require('./routes/auth');
const companiesRoutes = require('./routes/companies');

app.use('/api/auth', authRoutes);
app.use('/api/companies', companiesRoutes);

app.get('/health', (_, res) => {
        res.json({ status: 'ok', app: 'DoTell API' });
});

module.exports = app;

if (require.main === module) {
        app.listen(PORT, () => {
                console.log(`DoTell API running on port ${PORT}`);
        });
}