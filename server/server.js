/**
 * WHY: Entry point — connects DB, starts HTTP server, handles shutdown.
 * FIX: Added targeted uncaughtException handler for mongodb-memory-server's
 *      JSON parse bug (MongoDB 7.x outputs mixed JSON/text in stdout, causing
 *      MongoInstance.stdoutHandler to throw SyntaxError).
 *      We suppress ONLY that specific error; all other uncaught exceptions crash normally.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// ── Exception Handlers ────────────────────────────────────────────────────────

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  // TARGETED FIX: mongodb-memory-server v11 has a bug where MongoDB 7.x
  // stdout output (mixed JSON + non-JSON lines) causes JSON.parse to throw.
  // We've configured version 6.0.19 in package.json to avoid this, but as
  // a safety net we suppress this specific error if MongoDB is already connected.
  const isMongoStdoutBug = (
    error instanceof SyntaxError &&
    error.message.includes('JSON') &&
    error.stack &&
    error.stack.includes('MongoInstance')
  );

  if (isMongoStdoutBug) {
    const state = mongoose.connection.readyState;
    if (state === 1) {
      // MongoDB IS connected — the JSON parse was on a log line, not a real error
      console.warn('⚠️  [mongodb-memory-server] Suppressed stdout JSON parse warning (MongoDB is running fine)');
      return; // Do NOT crash — server is working
    }
    // MongoDB not connected yet — wait and retry
    console.warn('⚠️  [mongodb-memory-server] Stdout JSON parse issue detected. Retrying connection...');
    setTimeout(async () => {
      if (mongoose.connection.readyState !== 1) {
        console.error('❌ MongoDB never connected after stdout error. Please use MongoDB Atlas.');
        process.exit(1);
      }
    }, 15000);
    return;
  }

  // All other uncaught exceptions → crash as normal
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// ── Graceful Shutdown ─────────────────────────────────────────────────────────
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down...`);
  try {
    await mongoose.connection.close();
    if (global.__MONGOD__) {
      await global.__MONGOD__.stop();
      console.log('🛑 Embedded MongoDB stopped');
    }
  } catch (_) {}
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ── Start ─────────────────────────────────────────────────────────────────────
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 WishMate Server  → http://localhost:${PORT}`);
    console.log(`🏥 Health check     → http://localhost:${PORT}/health`);
    console.log(`🌍 Environment      → ${process.env.NODE_ENV}\n`);
  });
};

startServer();
