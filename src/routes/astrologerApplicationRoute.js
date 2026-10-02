const express = require('express');
const { authenticate, requireRole } = require('../middleware/authMiddleware');
const {
    listPendingApplications,
    reviewApplication
} = require('../controllers/astrologerApplicationController');

const router = express.Router();
router.use(authenticate, requireRole('ADMIN'));
router.get('/', listPendingApplications);
router.patch('/:userId', reviewApplication);

module.exports = router;