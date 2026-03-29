const xss = require('xss');

const sanitizeValue = (value) => {
        if (typeof value === 'string') return xss(value.trim());
        if (typeof value === 'object' && value !== null) {
                return Object.keys(value).reduce((acc, key) => {
                        acc[key] = sanitizeValue(value[key]);
                        return acc;
                }, {});
        }
        return value;
};

const sanitize = (req, _, next) => {
        if (req.body) req.body = sanitizeValue(req.body);
        if (req.query) req.query = sanitizeValue(req.query);
        next();
};

module.exports = { sanitize };