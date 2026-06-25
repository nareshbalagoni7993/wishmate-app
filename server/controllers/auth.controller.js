/**
 * WHY: Separates auth logic from route definitions (MVC pattern).
 * WHAT: Register, Login, Refresh Token, Logout, Get Profile.
 * HOW: Issues short-lived access token + long-lived refresh token.
 *      Refresh token is saved hashed in DB to detect token reuse attacks.
 * FIXES APPLIED:
 *   - email is lowercased manually before DB query (defense in depth)
 *   - better error messages that don't leak whether email exists
 *   - validationResult errors caught in routes before reaching here
 */

const User = require('../models/User.model');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt.utils');
const { sendSuccess, sendError, sendCreated } = require('../utils/response.utils');
const bcrypt = require('bcryptjs');

// ── POST /api/auth/register ───────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Normalize email to lowercase manually (schema also does this, belt+suspenders)
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return sendError(res, 'This email is already registered. Please login.', 409);
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

    const accessToken = signAccessToken({ id: user._id, role: user.role });
    const refreshToken = signRefreshToken({ id: user._id });

    // Store hashed refresh token in DB
    const salt = await bcrypt.genSalt(10);
    user.refreshToken = await bcrypt.hash(refreshToken, salt);
    user.lastLogin = new Date();
    await user.save({ validateModifiedOnly: true });

    return sendCreated(
      res,
      { user: user.toSafeObject(), accessToken, refreshToken },
      'Account created successfully! Welcome to WishMate 🎉'
    );
  } catch (error) {
    next(error);
  }
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Must explicitly select password (select: false in schema)
    const user = await User.findOne({ email: normalizedEmail }).select('+password +refreshToken');

    // Generic message prevents email enumeration attacks
    if (!user || !user.isActive) {
      return sendError(res, 'Invalid email or password', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password', 401);
    }

    const accessToken = signAccessToken({ id: user._id, role: user.role });
    const refreshToken = signRefreshToken({ id: user._id });

    const salt = await bcrypt.genSalt(10);
    user.refreshToken = await bcrypt.hash(refreshToken, salt);
    user.lastLogin = new Date();
    await user.save({ validateModifiedOnly: true });

    return sendSuccess(
      res,
      { user: user.toSafeObject(), accessToken, refreshToken },
      'Login successful! Welcome back 👋'
    );
  } catch (error) {
    next(error);
  }
};

// ── POST /api/auth/refresh ────────────────────────────────────────────────────
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return sendError(res, 'Refresh token is required', 400);

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch (err) {
      const msg = err.name === 'TokenExpiredError'
        ? 'Session expired. Please login again.'
        : 'Invalid refresh token.';
      return sendError(res, msg, 401);
    }

    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || !user.refreshToken) {
      return sendError(res, 'Session not found. Please login again.', 401);
    }

    const isValid = await bcrypt.compare(token, user.refreshToken);
    if (!isValid) return sendError(res, 'Token mismatch. Please login again.', 401);

    // Rotate: issue new pair (old token invalidated)
    const newAccessToken = signAccessToken({ id: user._id, role: user.role });
    const newRefreshToken = signRefreshToken({ id: user._id });

    const salt = await bcrypt.genSalt(10);
    user.refreshToken = await bcrypt.hash(newRefreshToken, salt);
    await user.save({ validateModifiedOnly: true });

    return sendSuccess(
      res,
      { accessToken: newAccessToken, refreshToken: newRefreshToken },
      'Token refreshed'
    );
  } catch (error) {
    next(error);
  }
};

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
const logout = async (req, res, next) => {
  try {
    // Invalidate refresh token in DB so it cannot be reused
    await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });
    return sendSuccess(res, {}, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    return sendSuccess(res, { user: req.user }, 'Profile fetched');
  } catch (error) {
    next(error);
  }
};

// ── PUT /api/auth/profile ─────────────────────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar, preferences } = req.body;
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (avatar !== undefined) updateData.avatar = avatar;
    if (preferences) updateData.preferences = preferences;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    return sendSuccess(res, { user }, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, refreshToken, logout, getMe, updateProfile };
