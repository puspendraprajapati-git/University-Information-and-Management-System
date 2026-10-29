const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root@123',
  database: process.env.DB_NAME || 'university_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function initDatabase() {
  try {
    const connection = await pool.getConnection();

    // 1. notifications table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        notification_id BIGINT PRIMARY KEY AUTO_INCREMENT,
        user_id BIGINT NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'GENERAL',
        is_read BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_read (user_id, is_read),
        INDEX idx_created (created_at)
      ) ENGINE=InnoDB;
    `);

    // 2. notification_preferences table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS notification_preferences (
        preference_id BIGINT PRIMARY KEY AUTO_INCREMENT,
        user_id BIGINT NOT NULL UNIQUE,
        email_enabled BOOLEAN DEFAULT TRUE,
        in_app_enabled BOOLEAN DEFAULT TRUE,
        sms_enabled BOOLEAN DEFAULT FALSE,
        attendance_threshold INT DEFAULT 75,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_pref (user_id)
      ) ENGINE=InnoDB;
    `);

    // 3. notification_delivery_logs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS notification_delivery_logs (
        delivery_id BIGINT PRIMARY KEY AUTO_INCREMENT,
        notification_id BIGINT NOT NULL,
        channel VARCHAR(30) NOT NULL,
        status VARCHAR(30) DEFAULT 'DELIVERED',
        error_message TEXT NULL,
        sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_notif_log (notification_id)
      ) ENGINE=InnoDB;
    `);

    // 4. announcements table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        announcement_id BIGINT PRIMARY KEY AUTO_INCREMENT,
        created_by BIGINT NOT NULL,
        target_role VARCHAR(30) DEFAULT 'ALL',
        dept_id BIGINT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        priority VARCHAR(20) DEFAULT 'MEDIUM',
        published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NULL,
        INDEX idx_target (target_role, dept_id),
        INDEX idx_pub (published_at)
      ) ENGINE=InnoDB;
    `);

    connection.release();
    console.log('[Notification Service] MySQL tables verified and initialized successfully.');
  } catch (error) {
    console.error('[Notification Service] Database initialization error:', error.message);
  }
}

module.exports = {
  pool,
  initDatabase
};
