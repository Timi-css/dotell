const express = require('express');
const router = express.Router();
const {
        getAllCompanies,
        createCompany,
        getCompanyById,
        createInterviewReview,
        createEmployeeReview,
} = require('../controllers/companies.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/', getAllCompanies);
router.post('/', authenticate, createCompany);
router.get('/:id', getCompanyById);
router.post('/:id/interview-reviews', authenticate, createInterviewReview);
router.post('/:id/employee-reviews', authenticate, createEmployeeReview);

module.exports = router;