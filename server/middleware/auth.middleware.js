/**
 * WHY: Protects private routes. Every request to /api/friends, /api/dashboard
 *      must have a valid JWT or it's rejected before reaching controllers.
 * HOW: Reads Authorization: Bearer <token> header, verifies the JWT,
 *      attaches decoded user to req.user for downstream use.
 * PRODUCTION STANDARD: Never trust client-sent user IDs. Always derive from JWT.
 * ALTERNATIVE: Cookie-based auth (httpOnly) is more secure against XSS.
 *   Token-in-header is simpler for mobile clients and our current use case.
 */

const { verifyAccessToken } = require('../utils/jwt.utils');
const { sendError } = require('../utils/response.utils');
const User = require('../models/User.model');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Access denied. No token provided.', 401);
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return sendError(res, 'Token expired. Please refresh.', 401);
      }
      return sendError(res, 'Invalid token.', 401);
    }

    // Verify user still exists and is active
    const user = await User.findById(decoded.id).select('-password -refreshToken');
    if (!user || !user.isActive) {
      return sendError(res, 'User not found or deactivated.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 'Authentication failed.', 500);
  }
};

// Role-based access control middleware factory
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        `Role '${req.user.role}' is not authorized to access this resource.`,
        403
      );
    }
    next();
  };
};

module.exports = { protect, authorize };
