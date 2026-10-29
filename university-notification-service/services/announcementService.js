const { pool } = require('../config/db');

async function getAnnouncementsForUser(userRole, deptId = null) {
  let query = `
    SELECT a.*, u.username as author_name
    FROM announcements a
    LEFT JOIN users u ON a.created_by = u.id
    WHERE (a.target_role = 'ALL' OR a.target_role = ?)
      AND (a.dept_id IS NULL OR a.dept_id = ?)
      AND (a.expires_at IS NULL OR a.expires_at >= NOW())
    ORDER BY
      CASE a.priority
        WHEN 'URGENT' THEN 1
        WHEN 'HIGH' THEN 2
        WHEN 'MEDIUM' THEN 3
        ELSE 4
      END,
      a.published_at DESC
  `;

  const [rows] = await pool.query(query, [userRole, deptId]);
  return rows;
}

async function getAllAnnouncements() {
  const query = `
    SELECT a.*, u.username as author_name
    FROM announcements a
    LEFT JOIN users u ON a.created_by = u.id
    ORDER BY a.published_at DESC
  `;
  const [rows] = await pool.query(query);
  return rows;
}

async function createAnnouncement({ title, message, targetRole = 'ALL', deptId = null, priority = 'MEDIUM', expiresAt = null }, createdBy) {
  const [result] = await pool.query(
    `INSERT INTO announcements (created_by, target_role, dept_id, title, message, priority, published_at, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)`,
    [createdBy, targetRole, deptId, title, message, priority, expiresAt]
  );

  const announcementId = result.insertId;

  // Broadcast to relevant users in notifications table
  try {
    let userQuery = 'SELECT id FROM users WHERE 1=1';
    const params = [];

    if (targetRole && targetRole !== 'ALL') {
      userQuery += ' AND role = ?';
      params.push(targetRole);
    }

    const [targetUsers] = await pool.query(userQuery, params);

    if (targetUsers.length > 0) {
      const values = targetUsers.map(u => [
        u.id,
        `Announcement: ${title}`,
        message,
        'GENERAL',
        false,
        new Date()
      ]);

      await pool.query(
        `INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
         VALUES ?`,
        [values]
      );
    }
  } catch (err) {
    console.error('[Announcement] Error broadcasting notifications:', err.message);
  }

  return {
    announcementId,
    title,
    message,
    targetRole,
    deptId,
    priority,
    expiresAt,
    createdBy
  };
}

async function deleteAnnouncement(announcementId) {
  const [result] = await pool.query(
    'DELETE FROM announcements WHERE announcement_id = ?',
    [announcementId]
  );
  return result.affectedRows > 0;
}

module.exports = {
  getAnnouncementsForUser,
  getAllAnnouncements,
  createAnnouncement,
  deleteAnnouncement
};
