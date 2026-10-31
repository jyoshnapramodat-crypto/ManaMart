import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'localloop_jwt_secret_dev_2026';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'localloop_refresh_secret_dev_2026';

export function signAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function signRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '30d' });
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, REFRESH_SECRET);
  } catch (err) {
    return null;
  }
}
