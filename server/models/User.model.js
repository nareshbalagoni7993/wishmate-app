/**
 * WHY: Users own their friends list. Each user has their own private data.
 * WHAT: Mongoose schema for authentication with role-based access.
 * HOW: bcryptjs hashes password before save via pre-save hook.
 *      comparePassword() method for clean login validation.
 * PRODUCTION STANDARD: Never store plain-text passwords. Refresh token stored
 *      hashed to prevent token theft from DB dump.
 * PERFORMANCE: Index on email for O(log n) login lookup.
 * INTERVIEW Q: Why bcrypt over SHA256? bcrypt is intentionally slow + salted,
 *              making rainbow table attacks impractical.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Never return password in queries by default
    },
    role: {
      type: String,
      enum: ['admin', 'user', 'guest'],
      default: 'user',
    },
    avatar: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    lastLogin: {
      type: Date,
    },
    preferences: {
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
      language: { type: String, default: 'en' },
      emailReminders: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
      reminderDaysBefore: { type: Number, default: 3 },
    },
  },
  {
    timestamps: true, // Adds createdAt, updatedAt automatically
  }
);

// NOTE: email index is already created by unique:true in schema field above.
// Adding it again with userSchema.index() causes the Mongoose duplicate index warning.
// Only add the role index here (not declared unique in schema, so safe to add).
userSchema.index({ role: 1 });

// Hash password before every save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12); // 12 rounds = ~250ms, good balance
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method: compare password at login
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method: sanitize user for API response (remove sensitive fields)
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
