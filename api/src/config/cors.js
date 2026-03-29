const corsOptions = {
        origin: [
                'http://localhost:8081',
                'http://localhost:19006',
                'https://dotell-production.up.railway.app',
        ],
        credentials: true,
};

module.exports = corsOptions;