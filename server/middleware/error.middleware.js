/**
 * WHY: Centralized error handling prevents stack traces leaking to clients in production.
 *      One place to handle Mongoose CastErrors, validation errors, duplicates.
 * HOW: Express recognizes a 4-argument function as error middleware.
 *      All controllers call next(error) to route here.
 * PRODUCTION STANDARD: In production, send generic messages. In development, send stack traces.
 */

const { sendError } = require('../utils/response.utils');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose bad ObjectId (e.g., /api/friends/notanid)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongoose duplicate key (unique index violation)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    statusCode = 409;
    message = `${field} already exists`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 422;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  // JWT errors (shouldn't normally reach here, auth middleware handles them)
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', err);
  }

  return sendError(res, message, statusCode);
};

// Catch 404s for undefined routes
const notFound = (req, res, next) => {
  return sendError(res, `Route ${req.originalUrl} not found`, 404);
};

module.exports = { errorHandler, notFound };
