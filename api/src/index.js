require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = require('./config/cors');
const { generalLimiter } = require('./config/rateLimiter');
const { sanitize } = require('./middleware/sanitize.middleware');

const authRoutes = require('./routes/auth');
const companiesRoutes = require('./routes/companies');

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(sanitize);
app.use(generalLimiter);

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