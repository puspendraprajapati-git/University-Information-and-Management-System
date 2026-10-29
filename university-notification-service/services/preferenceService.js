const { pool } = require('../config/db');

async function getUserPreferences(userId) {
  const [rows] = await pool.query(
    'SELECT * FROM notification_preferences WHERE user_id = ?',
    [userId]
  );

  if (rows.length > 0) {
    return {
      preferenceId: rows[0].preference_id,
      userId: rows[0].user_id,
      emailEnabled: Boolean(rows[0].email_enabled),
      inAppEnabled: Boolean(rows[0].in_app_enabled),
      smsEnabled: Boolean(rows[0].sms_enabled),
      attendanceThreshold: rows[0].attendance_threshold,
      updatedAt: rows[0].updated_at
    };
  }

  // Insert default preferences if not yet created
  const [result] = await pool.query(
    `INSERT INTO notification_preferences (user_id, email_enabled, in_app_enabled, sms_enabled, attendance_threshold, updated_at)
     VALUES (?, TRUE, TRUE, FALSE, 75, NOW())`,
    [userId]
  );

  return {
    preferenceId: result.insertId,
    userId,
    emailEnabled: true,
    inAppEnabled: true,
    smsEnabled: false,
    attendanceThreshold: 75,
    updatedAt: new Date()
  };
}

async function updateUserPreferences(userId, { emailEnabled, inAppEnabled, smsEnabled, attendanceThreshold }) {
  await pool.query(
    `INSERT INTO notification_preferences (user_id, email_enabled, in_app_enabled, sms_enabled, attendance_threshold, updated_at)
     VALUES (?, ?, ?, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE
       email_enabled = COALESCE(?, email_enabled),
       in_app_enabled = COALESCE(?, in_app_enabled),
       sms_enabled = COALESCE(?, sms_enabled),
       attendance_threshold = COALESCE(?, attendance_threshold),
       updated_at = NOW()`,
    [
      userId,
      emailEnabled ?? true,
      inAppEnabled ?? true,
      smsEnabled ?? false,
      attendanceThreshold ?? 75,
      emailEnabled,
      inAppEnabled,
      smsEnabled,
      attendanceThreshold
    ]
  );

  return getUserPreferences(userId);
}

module.exports = {
  getUserPreferences,
  updateUserPreferences
};
