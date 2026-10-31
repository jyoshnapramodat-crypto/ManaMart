import { verifyAccessToken } from '../config/jwt.js';
import { mockDb } from '../utils/mockDbStore.js';

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyAccessToken(token);

  if (!decoded) {
    return res.status(401).json({ success: false, message: 'Session expired or invalid token.' });
  }

  // Find user from memory or DB
  const user = mockDb.users.find((u) => u.id === decoded.id || u.phone === decoded.phone || u.email === decoded.email);
  if (!user) {
    req.user = decoded;
  } else {
    req.user = user;
  }

  next();
}

export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${allowedRoles.join(', ')}] role(s).`,
      });
    }
    next();
  };
}

