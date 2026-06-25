/**
 * WHY: The core entity — stores a complete person record including personal info,
 *      family details (spouse, children, parents), and metadata.
 * WHAT: Rich Mongoose schema with embedded sub-documents for family data.
 * HOW: Embedded documents (spouse, children[], parents) avoid extra DB roundtrips.
 *      Virtual fields compute age, daysUntilBirthday without storing them.
 * PRODUCTION STANDARD: Embedding family data is correct here since family data
 *      is always fetched with the friend (1:1 access pattern).
 * ALTERNATIVE: For very large apps, normalize into separate Family collection.
 * PERFORMANCE: Compound index on (userId, isDeleted) for all list queries.
 *              Index on birthday fields for reminder aggregation queries.
 * INTERVIEW Q: When to embed vs reference in MongoDB?
 *   Embed when: data is always accessed together, bounded size (<16MB).
 *   Reference when: data grows unboundedly or is shared across documents.
 */

const mongoose = require('mongoose');

// ── Sub-schemas ──────────────────────────────────────────────────────────────

const childSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  birthday: { type: Date },
  school: { type: String, trim: true },
  photo: { type: String, default: '' },
});

const spouseSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  photo: { type: String, default: '' },
  birthday: { type: Date },
  weddingAnniversary: { type: Date },
  occupation: { type: String, trim: true },
  mobile: { type: String, trim: true },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid spouse email'],
  },
});

const parentsSchema = new mongoose.Schema({
  fatherName: { type: String, trim: true },
  fatherBirthday: { type: Date },
  fatherPhoto: { type: String, default: '' },
  motherName: { type: String, trim: true },
  motherBirthday: { type: Date },
  motherPhoto: { type: String, default: '' },
  parentsAnniversary: { type: Date },
});

// ── Main Friend Schema ────────────────────────────────────────────────────────

const friendSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // ── Personal Info ──────────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, 'Friend name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    photo: { type: String, default: '' },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
      default: 'prefer_not_to_say',
    },
    dateOfBirth: { type: Date },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
      default: '',
    },
    mobile: { type: String, trim: true, default: '' },
    whatsapp: { type: String, trim: true, default: '' },

    // ── Address ────────────────────────────────────────────────────────────
    address: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    country: { type: String, trim: true, default: 'India' },
    pincode: { type: String, trim: true, default: '' },

    // ── Professional Info ──────────────────────────────────────────────────
    occupation: { type: String, trim: true, default: '' },
    company: { type: String, trim: true, default: '' },

    // ── Personal Details ───────────────────────────────────────────────────
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''],
      default: '',
    },
    relationship: {
      type: String,
      enum: [
        'friend', 'best friend', 'colleague', 'family', 'cousin',
        'neighbor', 'classmate', 'mentor', 'relative', 'other',
      ],
      default: 'friend',
    },
    favoriteColor: { type: String, trim: true, default: '' },
    notes: { type: String, trim: true, maxlength: [2000, 'Notes too long'], default: '' },

    // ── Family ─────────────────────────────────────────────────────────────
    spouse: { type: spouseSchema, default: null },
    children: { type: [childSchema], default: [] },
    parents: { type: parentsSchema, default: null },

    // ── App Metadata ───────────────────────────────────────────────────────
    isFavorite: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },

    tags: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
friendSchema.index({ userId: 1, isDeleted: 1 });
friendSchema.index({ userId: 1, isFavorite: 1 });
friendSchema.index({ userId: 1, isArchived: 1 });
friendSchema.index({ dateOfBirth: 1 });
friendSchema.index({ 'spouse.weddingAnniversary': 1 });
friendSchema.index({ name: 'text', city: 'text', occupation: 'text' }); // Full-text search

// ── Virtual Fields ────────────────────────────────────────────────────────────

// Computed age (not stored, always fresh)
friendSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const dob = new Date(this.dateOfBirth);
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
  return age;
});

// Days until next birthday
friendSchema.virtual('daysUntilBirthday').get(function () {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const dob = new Date(this.dateOfBirth);
  const nextBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
  if (nextBirthday < today) nextBirthday.setFullYear(today.getFullYear() + 1);
  return Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));
});

// Days until next anniversary
friendSchema.virtual('daysUntilAnniversary').get(function () {
  if (!this.spouse?.weddingAnniversary) return null;
  const today = new Date();
  const ann = new Date(this.spouse.weddingAnniversary);
  const nextAnn = new Date(today.getFullYear(), ann.getMonth(), ann.getDate());
  if (nextAnn < today) nextAnn.setFullYear(today.getFullYear() + 1);
  return Math.ceil((nextAnn - today) / (1000 * 60 * 60 * 24));
});

// ── Soft Delete Hook ──────────────────────────────────────────────────────────
// Automatically set deletedAt when isDeleted is set to true
friendSchema.pre('save', function (next) {
  if (this.isModified('isDeleted') && this.isDeleted && !this.deletedAt) {
    this.deletedAt = new Date();
  }
  if (this.isModified('isDeleted') && !this.isDeleted) {
    this.deletedAt = null;
  }
  next();
});

module.exports = mongoose.model('Friend', friendSchema);
