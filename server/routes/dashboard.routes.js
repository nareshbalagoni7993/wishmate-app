const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { getStats } = require('../controllers/dashboard.controller');

router.use(protect);
router.get('/stats', getStats);

module.exports = router;
