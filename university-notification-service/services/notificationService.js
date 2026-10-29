const { pool } = require('../config/db');

async function createNotification(userId, title, message, type = 'GENERAL') {
  // Check user preferences
  const [prefRows] = await pool.query(
    'SELECT * FROM notification_preferences WHERE user_id = ?',
    [userId]
  );

  let inAppEnabled = true;
  let emailEnabled = true;

  if (prefRows.length > 0) {
    inAppEnabled = prefRows[0].in_app_enabled !== 0;
    emailEnabled = prefRows[0].email_enabled !== 0;
  }

  let notificationId = null;

  if (inAppEnabled) {
    const [result] = await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
       VALUES (?, ?, ?, ?, FALSE, NOW())`,
      [userId, title, message, type]
    );
    notificationId = result.insertId;

    // Log in-app delivery
    await pool.query(
      `INSERT INTO notification_delivery_logs (notification_id, channel, status, sent_at)
       VALUES (?, 'IN_APP', 'DELIVERED', NOW())`,
      [notificationId]
    );
  }

  if (emailEnabled && notificationId) {
    // Log email delivery
    await pool.query(
      `INSERT INTO notification_delivery_logs (notification_id, channel, status, sent_at)
       VALUES (?, 'EMAIL', 'DELIVERED', NOW())`,
      [notificationId]
    );
  }

  return { notificationId, userId, title, message, type };
}

async function getUserNotifications(userId, limit = 20, offset = 0, unreadOnly = false) {
  let query = 'SELECT * FROM notifications WHERE user_id = ?';
  const params = [userId];

  if (unreadOnly) {
    query += ' AND is_read = FALSE';
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));

  const [rows] = await pool.query(query, params);
  return rows;
}

async function getUnreadCount(userId) {
  const [rows] = await pool.query(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
    [userId]
  );
  return rows[0].count;
}

async function markAsRead(notificationId, userId) {
  const [result] = await pool.query(
    'UPDATE notifications SET is_read = TRUE WHERE notification_id = ? AND user_id = ?',
    [notificationId, userId]
  );
  return result.affectedRows > 0;
}

async function markAllAsRead(userId) {
  const [result] = await pool.query(
    'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE',
    [userId]
  );
  return result.affectedRows;
}

async function deleteNotification(notificationId, userId) {
  const [result] = await pool.query(
    'DELETE FROM notifications WHERE notification_id = ? AND user_id = ?',
    [notificationId, userId]
  );
  return result.affectedRows > 0;
}

module.exports = {
  createNotification,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
