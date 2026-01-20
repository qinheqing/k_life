const express = require('express');
const { verifyAdmin, generateToken, verifyPassword } = require('../adminAuth');
const { db, logAction } = require('../database');
const router = express.Router();

router.post('/login', (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  if (verifyPassword(password)) {
    const token = generateToken();
    logAction('LOGIN', 'Admin logged in');
    res.json({ success: true, token });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

router.get('/stats', verifyAdmin, (req, res) => {
  db.get('SELECT COUNT(*) as total, SUM(CASE WHEN is_used = 1 THEN 1 ELSE 0 END) as used FROM access_codes', (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    const unused = row.total - row.used;
    const usageRate = row.total > 0 ? ((row.used / row.total) * 100).toFixed(2) : 0;
    res.json({
      total: row.total,
      used: row.used,
      unused,
      usageRate
    });
  });
});

router.get('/codes', verifyAdmin, (req, res) => {
  const { page = 1, limit = 20, status = 'all', search = '' } = req.query;
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM access_codes WHERE 1=1';
  const params = [];

  if (status !== 'all') {
    query += ' AND is_used = ?';
    params.push(status === 'used' ? 1 : 0);
  }

  if (search) {
    query += ' AND code LIKE ?';
    params.push(`%${search}%`);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    let countQuery = 'SELECT COUNT(*) as total FROM access_codes WHERE 1=1';
    const countParams = [];

    if (status !== 'all') {
      countQuery += ' AND is_used = ?';
      countParams.push(status === 'used' ? 1 : 0);
    }

    if (search) {
      countQuery += ' AND code LIKE ?';
      countParams.push(`%${search}%`);
    }

    db.get(countQuery, countParams, (err, countRow) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({
        codes: rows,
        total: countRow.total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(countRow.total / limit)
      });
    });
  });
});

router.post('/codes/generate', verifyAdmin, (req, res) => {
  const { count = 10, length = 12 } = req.body;

  if (count < 1 || count > 1000) {
    return res.status(400).json({ error: 'Count must be between 1 and 1000' });
  }

  if (length < 6 || length > 32) {
    return res.status(400).json({ error: 'Length must be between 6 and 32' });
  }

  const codes = [];
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let successCount = 0;

  const generateSingleCode = (index, attempts = 0) => {
    if (index >= count) {
      logAction('GENERATE_CODES', `Generated ${successCount} codes`);
      res.json({ success: true, count: successCount, codes });
      return;
    }

    if (attempts >= 100) {
      generateSingleCode(index + 1);
      return;
    }

    let code = '';
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    db.get('SELECT id FROM access_codes WHERE code = ?', [code], (err, row) => {
      if (err) {
        console.error('Database error:', err);
        generateSingleCode(index, attempts + 1);
        return;
      }

      if (!row) {
        db.run('INSERT INTO access_codes (code) VALUES (?)', [code], (err) => {
          if (err) {
            console.error('Insert error:', err);
            generateSingleCode(index, attempts + 1);
            return;
          }

          successCount++;
          codes.push(code);
          generateSingleCode(index + 1);
        });
      } else {
        generateSingleCode(index, attempts + 1);
      }
    });
  };

  generateSingleCode(0);
});

router.put('/codes/:id/reset', verifyAdmin, (req, res) => {
  const { id } = req.params;

  db.run(
    'UPDATE access_codes SET is_used = 0, used_at = NULL, user_name = NULL, user_ip = NULL WHERE id = ?',
    [id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Code not found' });
      }

      logAction('RESET_CODE', `Reset code ID: ${id}`);
      res.json({ success: true, message: 'Code reset successfully' });
    }
  );
});

router.delete('/codes/:id', verifyAdmin, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM access_codes WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Code not found' });
    }

    logAction('DELETE_CODE', `Deleted code ID: ${id}`);
    res.json({ success: true, message: 'Code deleted successfully' });
  });
});

router.get('/logs', verifyAdmin, (req, res) => {
  const { limit = 50 } = req.query;

  db.all(
    'SELECT * FROM admin_logs ORDER BY created_at DESC LIMIT ?',
    [parseInt(limit)],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({ logs: rows });
    }
  );
});

module.exports = router;
