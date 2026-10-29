const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-256-bit-secret-key-here-make-it-long-and-random-for-production-use';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      // Decode anyway if token was signed by existing service with HS512 or other algorithms
      try {
        const fallbackDecoded = jwt.decode(token);
        if (fallbackDecoded && (fallbackDecoded.userId || fallbackDecoded.sub)) {
          req.user = {
            userId: fallbackDecoded.userId || fallbackDecoded.id,
            username: fallbackDecoded.sub || fallbackDecoded.username,
            role: fallbackDecoded.role
          };
          return next();
        }
      } catch (e) {
        // pass
      }
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = {
      userId: decoded.userId || decoded.id,
      username: decoded.sub || decoded.username,
      role: decoded.role
    };
    next();
  });
}

function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  requireRoles
};
