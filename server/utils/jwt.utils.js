/**
 * WHY: JWT utilities are extracted so they can be unit-tested and reused.
 * WHAT: Signs access tokens (short-lived) and refresh tokens (long-lived).
 * HOW: Access tokens expire in 15min — short window limits damage if stolen.
 *      Refresh tokens (7 days) allow silent re-auth without re-login.
 * PRODUCTION STANDARD: Never put sensitive payload in JWT — it's base64, not encrypted.
 *      Only store userId and role.
 * INTERVIEW Q: Access vs Refresh token pattern?
 *   Access = short-lived, sent with every request.
 *   Refresh = long-lived, stored in httpOnly cookie, used only to get new access token.
 */

const jwt = require('jsonwebtoken');

const signAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '15m',
  });
};

const signRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
  });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
