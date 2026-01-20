const express = require('express');
const { db } = require('../database');
const router = express.Router();

router.post('/verify-code', (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ valid: false, message: 'Code is required' });
  }

  db.get('SELECT * FROM access_codes WHERE code = ?', [code], (err, row) => {
    if (err) {
      return res.status(500).json({ valid: false, message: 'Database error' });
    }

    if (!row) {
      return res.json({ valid: false, used: false, message: 'Invalid access code' });
    }

    if (row.is_used) {
      return res.json({ valid: false, used: true, message: 'Code has been used' });
    }

    res.json({ valid: true, used: false, message: 'Code is valid' });
  });
});

router.post('/use-code', (req, res) => {
  const { code, userName, userIp } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, message: 'Code is required' });
  }

  db.run(
    'UPDATE access_codes SET is_used = 1, used_at = CURRENT_TIMESTAMP, user_name = ?, user_ip = ? WHERE code = ? AND is_used = 0',
    [userName, userIp, code],
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      if (this.changes === 0) {
        return res.json({ success: false, message: 'Code not found or already used' });
      }

      res.json({ success: true, message: 'Code used successfully' });
    }
  );
});

module.exports = router;
