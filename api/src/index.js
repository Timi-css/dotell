const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (req, res) => {
        res.json({ status: 'ok', app: 'DoTell API' });
});

module.exports = app;

if (require.main === module) {
        app.listen(PORT, () => {
                console.log(`DoTell API running on port ${PORT}`);
        });
}