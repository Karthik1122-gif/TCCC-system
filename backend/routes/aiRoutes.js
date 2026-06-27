const express = require('express');
const router = express.Router();
const { rankHospitals, generateReport } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/hospital-rank', protect, rankHospitals);
router.post('/incident-report', protect, generateReport);

module.exports = router;
