const express = require('express');
const { db } = require('../database');
const router = express.Router();

router.post('/verify-code', (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ valid: false, message: 'Code is required' });
  }

  try {
    const stmt = db.prepare('SELECT * FROM access_codes WHERE code = ?');
    const row = stmt.get([code]);

    if (!row) {
      return res.json({ valid: false, used: false, message: 'Invalid access code' });
    }

    if (row.is_used) {
      return res.json({ valid: false, used: true, message: 'Code has been used' });
    }

    res.json({ valid: true, used: false, message: 'Code is valid' });
  } catch (err) {
    return res.status(500).json({ valid: false, message: 'Database error' });
  }
});

router.post('/use-code', (req, res) => {
  const { code, userName, userIp } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, message: 'Code is required' });
  }

  try {
    const stmt = db.prepare(
      'UPDATE access_codes SET is_used = 1, used_at = CURRENT_TIMESTAMP, user_name = ?, user_ip = ? WHERE code = ? AND is_used = 0'
    );
    const result = stmt.run([userName, userIp, code]);

    if (result.changes === 0) {
      return res.json({ success: false, message: 'Code not found or already used' });
    }

    res.json({ success: true, message: 'Code used successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error' });
  }
});

module.exports = router;
