const jwt = require('jsonwebtoken');

const generateToken = (id, role, expiresIn = '7d') => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn }
  );
};

module.exports = generateToken;
