import { verifyAccessToken } from '../config/jwt.js';
import { User } from '../models/User.js';
import { isConnectedToMongo } from '../config/db.js';
import { mockDb } from '../utils/mockDbStore.js';

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    if (!decoded || !decoded.id) {
      return res.status(401).json({ success: false, message: 'Session expired or invalid token. Please log in again.' });
    }

    let user = null;

    // 1. Check MongoDB if connected
    if (isConnectedToMongo) {
      try {
        user = await User.findById(decoded.id).select('-password');
        if (!user && decoded.id.startsWith('user-')) {
          user = await User.findOne({ $or: [{ phone: decoded.phone }, { email: decoded.email }] }).select('-password');
        }
      } catch (err) {
        try {
          user = await User.findOne({ $or: [{ phone: decoded.phone }, { email: decoded.email }] }).select('-password');
        } catch (_) {}
      }
    }

    // 2. Fallback to in-memory store in dev
    if (!user) {
      const memoryUser = mockDb.users.find(
        (u) => u.id === decoded.id || u._id === decoded.id || u.phone === decoded.phone || (decoded.email && u.email === decoded.email)
      );
      if (memoryUser) {
        const { password: _, ...safeMemoryUser } = memoryUser;
        user = safeMemoryUser;
      }
    }

    // 3. Fallback to decoded token payload
    if (!user) {
      user = decoded;
    }

    // Normalize user role to uppercase
    if (user.role) {
      user.role = user.role.toUpperCase();
    }

    // Enforce account suspension check
    const statusUpper = (user.status || '').toUpperCase();
    if (statusUpper === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        isSuspended: true,
        message: 'Your ManaMart account has been suspended by platform administration. Please contact support.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Authentication error: ' + error.message });
  }
}

export function authorizeRoles(...allowedRoles) {
  const normalizedAllowed = allowedRoles.map((r) => r.toUpperCase());
  return (req, res, next) => {
    const userRole = (req.user?.role || '').toUpperCase();
    if (!req.user || !normalizedAllowed.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${allowedRoles.join(', ')}] role(s). Current role: ${userRole}`,
      });
    }
    next();
  };
}

// Strict verification guard for merchants
export function requireVerifiedMerchant(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  const role = (req.user.role || '').toUpperCase();
  if (role === 'ADMIN') {
    return next(); // Admins have root platform oversight
  }

  if (role !== 'MERCHANT') {
    return res.status(403).json({ success: false, message: 'Access restricted to merchants only.' });
  }

  const merchantStatus = (req.user.merchant_profile?.status || req.user.status || '').toUpperCase();
  if (merchantStatus !== 'ACTIVE' && merchantStatus !== 'APPROVED') {
    return res.status(403).json({
      success: false,
      isPendingVerification: true,
      verificationStatus: merchantStatus,
      message: 'Access restricted: Your merchant store is pending administrator verification. Please complete document onboarding.',
    });
  }

  next();
}

// Strict verification guard for delivery partners (riders)
export function requireVerifiedRider(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  const role = (req.user.role || '').toUpperCase();
  if (role === 'ADMIN') {
    return next(); // Admins have root platform oversight
  }

  if (role !== 'RIDER') {
    return res.status(403).json({ success: false, message: 'Access restricted to delivery partners only.' });
  }

  const riderStatus = (req.user.rider_profile?.status || req.user.status || '').toUpperCase();
  if (riderStatus !== 'ACTIVE' && riderStatus !== 'APPROVED') {
    return res.status(403).json({
      success: false,
      isPendingVerification: true,
      verificationStatus: riderStatus,
      message: 'Access restricted: Your driving credentials are under compliance audit. Please await administrative approval.',
    });
  }

  next();
}
