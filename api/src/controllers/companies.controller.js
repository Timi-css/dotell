const CompanyModel = require('../models/company.model');
const ReviewModel = require('../models/review.model');

const getAllCompanies = async (req, res) => {
        try {
                const { search } = req.query;
                const companies = await CompanyModel.findAll(search);
                return res.json({ companies });
        } catch {
                return res.status(500).json({ error: 'Something went wrong' });
        }
};

const createCompany = async (req, res) => {
        try {
                const { name, industry, location } = req.body;
                if (!name) return res.status(400).json({ error: 'Company name is required' });

                const company = await CompanyModel.create({ name, industry, location });
                return res.status(201).json({ company });
        } catch (err) {
                if (err.message === 'Company already exists') {
                        return res.status(409).json({ error: err.message });
                }
                return res.status(500).json({ error: 'Something went wrong' });
        }
};

const getCompanyById = async (req, res) => {
        try {
                const company = await CompanyModel.findById(req.params.id);
                if (!company) return res.status(404).json({ error: 'Company not found' });
                return res.json({ company });
        } catch {
                return res.status(500).json({ error: 'Something went wrong' });
        }
};

const createInterviewReview = async (req, res) => {
        try {
                const { role, rating, difficulty, outcome, reviewText } = req.body;

                if (!role || !rating || !difficulty || !outcome || !reviewText) {
                        return res.status(400).json({ error: 'All fields are required' });
                }

                if (rating < 1 || rating > 5) {
                        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
                }

                if (difficulty < 1 || difficulty > 5) {
                        return res.status(400).json({ error: 'Difficulty must be between 1 and 5' });
                }

                const validOutcomes = ['OFFER', 'REJECTED', 'GHOSTED', 'WITHDREW'];
                if (!validOutcomes.includes(outcome)) {
                        return res.status(400).json({ error: `Outcome must be one of: ${validOutcomes.join(', ')}` });
                }

                const company = await CompanyModel.findById(req.params.id);
                if (!company) return res.status(404).json({ error: 'Company not found' });

                const review = await ReviewModel.createInterviewReview({
                        userId: req.userId,
                        companyId: req.params.id,
                        role, rating, difficulty, outcome, reviewText,
                });

                return res.status(201).json({ review });
        } catch {
                return res.status(500).json({ error: 'Something went wrong' });
        }
};

const createEmployeeReview = async (req, res) => {
        try {
                const { role, tenure, isAnonymous, cultureRating, managementRating, compensationRating, reviewText } = req.body;

                if (!role || !cultureRating || !managementRating || !compensationRating || !reviewText) {
                        return res.status(400).json({ error: 'All fields are required' });
                }

                const ratings = [cultureRating, managementRating, compensationRating];
                if (ratings.some(r => r < 1 || r > 5)) {
                        return res.status(400).json({ error: 'All ratings must be between 1 and 5' });
                }

                const company = await CompanyModel.findById(req.params.id);
                if (!company) return res.status(404).json({ error: 'Company not found' });

                const review = await ReviewModel.createEmployeeReview({
                        userId: req.userId,
                        companyId: req.params.id,
                        role, tenure,
                        isAnonymous: isAnonymous || false,
                        cultureRating, managementRating, compensationRating, reviewText,
                });

                if (review.isAnonymous) {
                        review.user = null;
                }

                return res.status(201).json({ review });
        } catch {
                return res.status(500).json({ error: 'Something went wrong' });
        }
};

module.exports = {
        getAllCompanies,
        createCompany,
        getCompanyById,
        createInterviewReview,
        createEmployeeReview,
};