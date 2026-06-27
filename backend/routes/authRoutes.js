const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { authUser, registerUser, getOfficerContactsForRoute } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

router.post('/login', apiLimiter, authUser);
router.post('/register', apiLimiter, registerUser);
router.post('/officers-for-route', apiLimiter, protect, getOfficerContactsForRoute);

module.exports = router;
