// backend/src/routes/companyRoutes.js
const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

const {
    createCompany,
    getAllCompanies,
    getCompanyById,
    updateCompany,
    deleteCompany
} = require('../controllers/companyController');

router.use(protect);

router.get('/all', authorize('admin', 'super_admin'), getAllCompanies);
router.get('/:id', authorize('admin', 'super_admin'), getCompanyById);
router.post('/', authorize('admin', 'super_admin'), createCompany);
router.put('/:id', authorize('admin', 'super_admin'), updateCompany);
router.delete('/:id', authorize('admin', 'super_admin'), deleteCompany);

module.exports = router;