const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';

const extractToken = (req) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  if (req.query && typeof req.query.token === 'string') {
    return req.query.token;
  }

  return null;
};

const authenticateJWT = (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.auth = {
      userId: payload.userId,
      role: payload.role,
      email: payload.email,
      name: payload.name,
    };
    return next();
  } catch (_error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

const authorizeRoles = (allowedRoles) => (req, res, next) => {
  if (!req.auth) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  if (!allowedRoles.includes(req.auth.role)) {
    return res.status(403).json({ message: 'Forbidden: insufficient permissions.' });
  }

  return next();
};

module.exports = {
  authenticateJWT,
  authorizeRoles,
  JWT_SECRET,
};
