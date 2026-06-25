/**
 * WHY: Centralizes all magic strings and configuration constants.
 *      Prevents typos and makes changes in one place.
 * PRODUCTION STANDARD: Never scatter literal strings through business logic.
 */

module.exports = {
  ROLES: {
    ADMIN: 'admin',
    USER: 'user',
    GUEST: 'guest',
  },

  GENDER: {
    MALE: 'male',
    FEMALE: 'female',
    OTHER: 'other',
    PREFER_NOT: 'prefer_not_to_say',
  },

  BLOOD_GROUPS: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],

  RELATIONSHIPS: [
    'friend',
    'best friend',
    'colleague',
    'family',
    'cousin',
    'neighbor',
    'classmate',
    'mentor',
    'relative',
    'other',
  ],

  REMINDER_TYPES: {
    BIRTHDAY: 'birthday',
    ANNIVERSARY: 'anniversary',
    PARENTS_ANNIVERSARY: 'parents_anniversary',
    CHILD_BIRTHDAY: 'child_birthday',
    CUSTOM: 'custom',
  },

  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 12,
    MAX_LIMIT: 100,
  },
};
