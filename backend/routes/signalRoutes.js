const express = require('express');
const router = express.Router();
const { getSignals, overrideSignal } = require('../controllers/signalController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(getSignals);
router.route('/:id').put(protect, overrideSignal);

module.exports = router;
