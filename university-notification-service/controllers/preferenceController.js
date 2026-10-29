const preferenceService = require('../services/preferenceService');

async function getMyPreferences(req, res) {
  try {
    const userId = req.user.userId;
    const prefs = await preferenceService.getUserPreferences(userId);
    res.json(prefs);
  } catch (err) {
    console.error('Error fetching preferences:', err);
    res.status(500).json({ error: 'Failed to retrieve notification preferences' });
  }
}

async function updateMyPreferences(req, res) {
  try {
    const userId = req.user.userId;
    const { emailEnabled, inAppEnabled, smsEnabled, attendanceThreshold } = req.body;

    const updated = await preferenceService.updateUserPreferences(userId, {
      emailEnabled,
      inAppEnabled,
      smsEnabled,
      attendanceThreshold
    });

    res.json(updated);
  } catch (err) {
    console.error('Error updating preferences:', err);
    res.status(500).json({ error: 'Failed to update notification preferences' });
  }
}

module.exports = {
  getMyPreferences,
  updateMyPreferences
};
