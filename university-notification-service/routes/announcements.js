const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { authenticateToken, requireRoles } = require('../middleware/auth');

// Fetch announcements applicable to logged in user
router.get('/', authenticateToken, announcementController.getAnnouncements);

// Fetch all announcements (Admin / Faculty overview)
router.get('/all', authenticateToken, requireRoles('ADMIN', 'FACULTY'), announcementController.getAllAnnouncements);

// Create announcement (Admin or Faculty only)
router.post('/', authenticateToken, requireRoles('ADMIN', 'FACULTY'), announcementController.createAnnouncement);

// Delete announcement (Admin or Faculty)
router.delete('/:id', authenticateToken, requireRoles('ADMIN', 'FACULTY'), announcementController.deleteAnnouncement);

module.exports = router;
