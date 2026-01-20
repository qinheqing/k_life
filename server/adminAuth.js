const jwt = require('jsonwebtoken');
const { getConfig } = require('./config');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function verifyAdmin(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function generateToken() {
  const config = getConfig();
  return jwt.sign(
    { role: 'admin', timestamp: Date.now() },
    JWT_SECRET,
    { expiresIn: config.admin.sessionTimeout + 's' }
  );
}

function verifyPassword(password) {
  const config = getConfig();
  return password === config.admin.password;
}

module.exports = { verifyAdmin, generateToken, verifyPassword };
