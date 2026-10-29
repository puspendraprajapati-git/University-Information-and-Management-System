const cron = require('node-cron');
const { pool } = require('../config/db');
const { createNotification } = require('../services/notificationService');

/**
 * 1. Low Attendance Check
 * Compares student attendance in each subject against their configured threshold.
 */
async function checkLowAttendance() {
  console.log('[Scheduler] Running Low Attendance Check...');
  try {
    const query = `
      SELECT 
        a.student_id,
        s.user_id,
        s.full_name as student_name,
        sub.id as subject_id,
        sub.subject_name,
        sub.subject_code,
        COUNT(*) as total_classes,
        SUM(CASE WHEN a.status = 'PRESENT' THEN 1 ELSE 0 END) as attended_classes,
        ROUND((SUM(CASE WHEN a.status = 'PRESENT' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 1) as attendance_pct,
        COALESCE(np.attendance_threshold, 75) as required_threshold
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      JOIN subjects sub ON a.subject_id = sub.id
      LEFT JOIN notification_preferences np ON s.user_id = np.user_id
      GROUP BY a.student_id, s.user_id, s.full_name, sub.id, sub.subject_name, sub.subject_code, np.attendance_threshold
      HAVING total_classes >= 2 AND attendance_pct < required_threshold
    `;

    const [records] = await pool.query(query);
    let alertsCreated = 0;

    for (const rec of records) {
      if (!rec.user_id) continue;

      // Avoid spamming: Check if notification was already sent in the last 24 hours
      const [existing] = await pool.query(
        `SELECT notification_id FROM notifications 
         WHERE user_id = ? AND type = 'ATTENDANCE_ALERT' AND title LIKE ? 
           AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)`,
        [rec.user_id, `%${rec.subject_name}%`]
      );

      if (existing.length === 0) {
        const title = `⚠️ Low Attendance Warning: ${rec.subject_name}`;
        const message = `Your attendance in ${rec.subject_name} (${rec.subject_code || 'Subject'}) is currently ${rec.attendance_pct}%, which is below the mandatory threshold of ${rec.required_threshold}%. Attending remaining sessions is required to be eligible for final examinations.`;

        await createNotification(rec.user_id, title, message, 'ATTENDANCE_ALERT');
        alertsCreated++;
      }
    }

    console.log(`[Scheduler] Low attendance check completed. ${alertsCreated} alerts sent.`);
    return { checked: records.length, alertsCreated };
  } catch (err) {
    console.error('[Scheduler] Error during low attendance check:', err.message);
    return { error: err.message };
  }
}

/**
 * 2. Assignment Deadline Reminders
 * Identifies assignments due within the next 48 hours and notifies students who haven't submitted.
 */
async function checkUpcomingAssignments() {
  console.log('[Scheduler] Running Assignment Deadline Reminder Check...');
  try {
    // Find assignments due within next 48 hours
    const [assignments] = await pool.query(`
      SELECT a.*, s.subject_name 
      FROM assignments a
      LEFT JOIN subjects s ON a.subject_id = s.id
      WHERE a.due_date >= NOW() AND a.due_date <= DATE_ADD(NOW(), INTERVAL 48 HOUR)
    `);

    let remindersSent = 0;

    for (const assign of assignments) {
      // Find students who have NOT submitted this assignment
      const [pendingStudents] = await pool.query(`
        SELECT st.id as student_id, st.user_id, st.full_name
        FROM students st
        WHERE st.user_id IS NOT NULL
          AND st.id NOT IN (
            SELECT student_id FROM assignment_submissions 
            WHERE assignment_id = ?
          )
      `, [assign.assignment_id]);

      for (const student of pendingStudents) {
        // Prevent duplicate alert within 24 hours for the same assignment
        const [existing] = await pool.query(`
          SELECT notification_id FROM notifications 
          WHERE user_id = ? AND type = 'ASSIGNMENT_DUE' AND title LIKE ? 
            AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        `, [student.user_id, `%${assign.title}%`]);

        if (existing.length === 0) {
          const dueDateFormatted = new Date(assign.due_date).toLocaleString();
          const title = `⏳ Assignment Reminder: ${assign.title}`;
          const message = `The assignment '${assign.title}' for ${assign.subject_name || 'your subject'} is due on ${dueDateFormatted}. Please make sure to submit your work before the deadline to avoid late penalties.`;

          await createNotification(student.user_id, title, message, 'ASSIGNMENT_DUE');
          remindersSent++;
        }
      }
    }

    console.log(`[Scheduler] Assignment reminders check completed. ${remindersSent} reminders sent.`);
    return { assignmentsFound: assignments.length, remindersSent };
  } catch (err) {
    console.error('[Scheduler] Error checking assignment deadlines:', err.message);
    return { error: err.message };
  }
}

/**
 * 3. Fee Due Date Reminders
 * Identifies unpaid invoices due within next 7 days.
 */
async function checkPendingFees() {
  console.log('[Scheduler] Running Fee Due Date Reminder Check...');
  try {
    const [invoices] = await pool.query(`
      SELECT inv.*, s.user_id, s.full_name
      FROM student_invoices inv
      JOIN students s ON inv.student_id = s.id
      WHERE inv.status != 'PAID'
        AND inv.due_date <= DATE_ADD(NOW(), INTERVAL 7 DAY)
        AND s.user_id IS NOT NULL
    `);

    let feeReminders = 0;

    for (const inv of invoices) {
      const [existing] = await pool.query(`
        SELECT notification_id FROM notifications 
        WHERE user_id = ? AND type = 'FEE_REMINDER' AND title LIKE ? 
          AND created_at >= DATE_SUB(NOW(), INTERVAL 48 HOUR)
      `, [inv.user_id, `%#INV-${inv.invoice_id}%`]);

      if (existing.length === 0) {
        const balance = Number(inv.outstanding_balance || (inv.total_amount - (inv.paid_amount || 0)));
        const title = `💳 Pending Fee Notice: Invoice #INV-${inv.invoice_id}`;
        const message = `You have an outstanding semester fee balance of ₹${balance.toLocaleString()} due on ${new Date(inv.due_date).toLocaleDateString()}. Please clear this fee online via the Fees & Payments portal to avoid late enrollment holds.`;

        await createNotification(inv.user_id, title, message, 'FEE_REMINDER');
        feeReminders++;
      }
    }

    return { invoicesChecked: invoices.length, feeReminders };
  } catch (err) {
    console.error('[Scheduler] Error checking pending fees:', err.message);
    return { error: err.message };
  }
}

function startSchedulers() {
  // Check attendance daily at 08:30 AM
  cron.schedule('30 8 * * *', () => {
    checkLowAttendance();
  });

  // Check assignments daily at 09:00 AM
  cron.schedule('0 9 * * *', () => {
    checkUpcomingAssignments();
  });

  // Check pending fees every Monday at 10:00 AM
  cron.schedule('0 10 * * 1', () => {
    checkPendingFees();
  });

  console.log('[Scheduler] Background automated cron jobs registered successfully.');
}

module.exports = {
  startSchedulers,
  checkLowAttendance,
  checkUpcomingAssignments,
  checkPendingFees
};
