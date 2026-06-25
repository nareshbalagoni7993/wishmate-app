const mongoose = require('mongoose');

// ── Patch mongodb-memory-server before use ────────────────────────────────────
// WHY: MongoDB 8.x sometimes sends multiple log lines in one stdout chunk.
//      MongoInstance.checkErrorInLine calls JSON.parse(line) when it spots
//      "DBException in initAndListen" — if two JSON objects are buffered on
//      one chunk, JSON.parse throws "Unexpected non-whitespace character after
//      JSON at position N". Monkey-patch wraps that call in a try-catch so
//      the false-positive parse error doesn't crash the process.
const patchMongoInstance = () => {
  try {
    const mi = require('mongodb-memory-server-core/lib/util/MongoInstance');
    const Cls = mi.MongoInstance;
    if (Cls && Cls.prototype.checkErrorInLine) {
      const orig = Cls.prototype.checkErrorInLine;
      Cls.prototype.checkErrorInLine = function (line) {
        try {
          orig.call(this, line);
        } catch (e) {
          if (e instanceof SyntaxError) return; // suppress buffered-chunk parse error
          throw e;
        }
      };
    }
  } catch (_) {
    // mongodb-memory-server not installed — skip patch
  }
};

const connectWithEmbedded = async () => {
  try {
    patchMongoInstance(); // must run before create()

    const { MongoMemoryServer } = require('mongodb-memory-server');

    console.log('\n⏳ Starting embedded in-memory MongoDB...');
    console.log('   (Using cached binary — starting in seconds)\n');

    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    global.__MONGOD__ = mongod;

    console.log('✅ Embedded MongoDB started!');
    console.log(`   URI: ${uri}`);
    console.log('\n⚠️  WARNING: Data is TEMPORARY — lost when server restarts!');
    console.log('   For permanent data → use FREE MongoDB Atlas:');
    console.log('   ➡  https://cloud.mongodb.com  (free M0 tier)');
    console.log('   ➡  Copy connection string → paste in server/.env as MONGO_URI\n');

    mongoose.connection.on('error', (err) => console.error('❌ MongoDB error:', err.message));

  } catch (embeddedError) {
    console.error('\n❌ Embedded MongoDB failed:', embeddedError.message);
    printAtlasInstructions();
    process.exit(1);
  }
};

const printAtlasInstructions = () => {
  console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('   SOLUTION — Use FREE MongoDB Atlas (5 minutes):');
  console.error('');
  console.error('   1. Open: https://cloud.mongodb.com');
  console.error('   2. Sign up free → Build Cluster → Choose M0 FREE');
  console.error('   3. Create DB user  (e.g. wishmate / wish1234)');
  console.error('   4. Network Access → Add IP → 0.0.0.0/0');
  console.error('   5. Connect → Drivers → copy the connection string');
  console.error('   6. Open server/.env, set:');
  console.error('      MONGO_URI=mongodb+srv://wishmate:wish1234@cluster0.xxx.mongodb.net/wishmate');
  console.error('   7. Save .env and restart: npm run dev');
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
};

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  const isDev = process.env.NODE_ENV !== 'production';

  // ── Tier 1: Configured MONGO_URI (real MongoDB / Atlas) ──────────────────
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
      socketTimeoutMS: 45000,
    });

    console.log(`\n✅ MongoDB Connected: ${mongoose.connection.host}`);
    console.log(`   📦 Database: ${mongoose.connection.name}\n`);

    mongoose.connection.on('error', (err) => console.error('❌ MongoDB error:', err.message));
    mongoose.connection.on('disconnected', () => console.warn('⚠️  MongoDB disconnected'));

    return;

  } catch (err) {

    // ── Tier 2: Embedded in-memory MongoDB (dev only) ────────────────────────
    if (isDev) {
      console.warn(`\n⚠️  MongoDB not available at: ${uri}`);
      console.warn(`   Reason: ${err.message}`);
      console.warn('   → Falling back to embedded in-memory MongoDB...');
      await connectWithEmbedded();
    } else {
      // ── Tier 3: Production — crash with clear instructions ─────────────────
      console.error(`\n❌ MongoDB connection FAILED`);
      console.error(`   URI: ${uri}\n   Error: ${err.message}`);
      printAtlasInstructions();
      process.exit(1);
    }
  }
};

module.exports = connectDB;
