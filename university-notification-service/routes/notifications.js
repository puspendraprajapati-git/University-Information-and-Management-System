const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken, requireRoles } = require('../middleware/auth');

// Public/Health
router.get('/health', (req, res) => {
  res.json({ service: 'university-notification-service', status: 'UP' });
});

// User Notifications
router.get('/', authenticateToken, notificationController.getMyNotifications);
router.get('/unread-count', authenticateToken, notificationController.getUnreadBadgeCount);
router.patch('/:id/read', authenticateToken, notificationController.markNotificationRead);
router.patch('/mark-all-read', authenticateToken, notificationController.markAllNotificationsRead);

// Send Direct Alert (Admin or Faculty or internal services)
router.post('/send', authenticateToken, notificationController.sendNotification);

// Manual Triggers for Testing and Automated Workflows
router.post('/trigger/attendance-check', authenticateToken, notificationController.runAttendanceCheckTrigger);
router.post('/trigger/assignment-reminders', authenticateToken, notificationController.runAssignmentReminderTrigger);
router.post('/trigger/fee-reminders', authenticateToken, notificationController.runFeeReminderTrigger);

module.exports = router;
