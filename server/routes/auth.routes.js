/**
 * WHY: Separates routing from logic (MVC).
 * WHAT: Auth endpoints — register, login, refresh, logout, profile.
 * HOW: express-validator checks inputs BEFORE controllers run.
 *      validationResult() reads errors and returns 422 with clear messages.
 * FIX: Added validationResult check — previously validation ran but errors
 *      were never read, so invalid data reached the controller silently.
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth.middleware');
const {
  register, login, refreshToken, logout, getMe, updateProfile,
} = require('../controllers/auth.controller');

// Middleware: reads validation results and returns 422 if any errors
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: errors.array()[0].msg, // Return first error message
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),
  body('email')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  checkValidation,
];

const validateLogin = [
  body('email')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  checkValidation,
];

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/refresh', refreshToken);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
