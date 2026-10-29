const announcementService = require('../services/announcementService');
const { pool } = require('../config/db');

async function getAnnouncements(req, res) {
  try {
    const userRole = req.user.role;
    let deptId = null;

    // Resolve student or faculty department if applicable
    if (userRole === 'STUDENT') {
      const [students] = await pool.query('SELECT dept_id FROM students WHERE user_id = ?', [req.user.userId]);
      if (students.length > 0) deptId = students[0].dept_id;
    } else if (userRole === 'FACULTY') {
      const [faculty] = await pool.query('SELECT dept_id FROM faculty WHERE user_id = ?', [req.user.userId]);
      if (faculty.length > 0) deptId = faculty[0].dept_id;
    }

    const announcements = await announcementService.getAnnouncementsForUser(userRole, deptId);
    res.json(announcements);
  } catch (err) {
    console.error('Error fetching announcements:', err);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
}

async function getAllAnnouncements(req, res) {
  try {
    const list = await announcementService.getAllAnnouncements();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch all announcements' });
  }
}

async function createAnnouncement(req, res) {
  try {
    const { title, message, targetRole = 'ALL', deptId = null, priority = 'MEDIUM', expiresAt = null } = req.body;

    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }

    const created = await announcementService.createAnnouncement(
      { title, message, targetRole, deptId, priority, expiresAt },
      req.user.userId
    );

    res.status(201).json(created);
  } catch (err) {
    console.error('Error creating announcement:', err);
    res.status(500).json({ error: 'Failed to create announcement' });
  }
}

async function deleteAnnouncement(req, res) {
  try {
    const { id } = req.params;
    const success = await announcementService.deleteAnnouncement(id);

    if (!success) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    res.json({ message: 'Announcement deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
}

module.exports = {
  getAnnouncements,
  getAllAnnouncements,
  createAnnouncement,
  deleteAnnouncement
};
