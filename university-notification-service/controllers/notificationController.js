const notificationService = require('../services/notificationService');
const { checkLowAttendance, checkUpcomingAssignments, checkPendingFees } = require('../schedulers/cronJobs');

async function getMyNotifications(req, res) {
  try {
    const userId = req.user.userId;
    const { limit = 20, offset = 0, unreadOnly = 'false' } = req.query;

    const notifications = await notificationService.getUserNotifications(
      userId,
      parseInt(limit),
      parseInt(offset),
      unreadOnly === 'true'
    );

    const unreadCount = await notificationService.getUnreadCount(userId);

    res.json({
      notifications,
      unreadCount
    });
  } catch (err) {
    console.error('Error in getMyNotifications:', err);
    res.status(500).json({ error: 'Failed to retrieve notifications' });
  }
}

async function getUnreadBadgeCount(req, res) {
  try {
    const userId = req.user.userId;
    const count = await notificationService.getUnreadCount(userId);
    res.json({ unreadCount: count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve unread count' });
  }
}

async function markNotificationRead(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const success = await notificationService.markAsRead(id, userId);

    if (!success) {
      return res.status(404).json({ error: 'Notification not found or already read' });
    }

    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
}

async function markAllNotificationsRead(req, res) {
  try {
    const userId = req.user.userId;
    const updatedCount = await notificationService.markAllAsRead(userId);
    res.json({ message: 'All notifications marked as read', updatedCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
}

async function sendNotification(req, res) {
  try {
    const { userId, title, message, type = 'GENERAL' } = req.body;

    if (!userId || !title || !message) {
      return res.status(400).json({ error: 'userId, title and message are required' });
    }

    const created = await notificationService.createNotification(userId, title, message, type);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send notification' });
  }
}

// Manual trigger endpoints for testing and automated events
async function runAttendanceCheckTrigger(req, res) {
  try {
    const result = await checkLowAttendance();
    res.json({ message: 'Attendance threshold check executed', result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function runAssignmentReminderTrigger(req, res) {
  try {
    const result = await checkUpcomingAssignments();
    res.json({ message: 'Assignment reminder check executed', result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function runFeeReminderTrigger(req, res) {
  try {
    const result = await checkPendingFees();
    res.json({ message: 'Fee reminder check executed', result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getMyNotifications,
  getUnreadBadgeCount,
  markNotificationRead,
  markAllNotificationsRead,
  sendNotification,
  runAttendanceCheckTrigger,
  runAssignmentReminderTrigger,
  runFeeReminderTrigger
};
