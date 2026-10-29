const express = require('express');
const router = express.Router();
const preferenceController = require('../controllers/preferenceController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, preferenceController.getMyPreferences);
router.put('/', authenticateToken, preferenceController.updateMyPreferences);

module.exports = router;
