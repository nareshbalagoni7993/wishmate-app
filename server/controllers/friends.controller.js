/**
 * WHY: Full CRUD for friends — the primary resource of WishMate.
 * WHAT: List (with search/filter/sort/pagination), Get, Create, Update,
 *       Soft Delete, Restore, Hard Delete, Toggle Favorite/Archive.
 * HOW: All queries are scoped to req.user._id — users can only see their own data.
 *      Soft delete pattern: isDeleted=true goes to recycle bin (30-day auto purge possible).
 * PERFORMANCE: Pagination uses skip/limit. For > 100k records, use cursor-based pagination.
 * INTERVIEW Q: Why soft delete instead of hard delete?
 *   Allows user undo, audit trail, data recovery. Hard delete is irreversible.
 */

const Friend = require('../models/Friend.model');
const { sendSuccess, sendError, sendCreated } = require('../utils/response.utils');
const { PAGINATION } = require('../config/constants');

// ── Helper: build sort object ────────────────────────────────────────────────
const buildSort = (sortParam = 'name', orderParam = 'asc') => {
  const allowedSortFields = ['name', 'createdAt', 'dateOfBirth', 'city', 'relationship'];
  const field = allowedSortFields.includes(sortParam) ? sortParam : 'name';
  return { [field]: orderParam === 'desc' ? -1 : 1 };
};

// ── Helper: build filter object ──────────────────────────────────────────────
const buildFilter = (userId, query) => {
  const filter = { userId, isDeleted: false };

  if (query.search) {
    filter.$text = { $search: query.search };
  }
  if (query.gender) filter.gender = query.gender;
  if (query.relationship) filter.relationship = query.relationship;
  if (query.bloodGroup) filter.bloodGroup = query.bloodGroup;
  if (query.city) filter.city = new RegExp(query.city, 'i');
  if (query.country) filter.country = new RegExp(query.country, 'i');
  if (query.isFavorite === 'true') filter.isFavorite = true;
  if (query.isArchived === 'true') {
    filter.isArchived = true;
  } else {
    filter.isArchived = false;
  }

  return filter;
};

// GET /api/friends — list with search, filter, sort, pagination
const getFriends = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE);
    const limit = Math.min(
      parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT,
      PAGINATION.MAX_LIMIT
    );
    const skip = (page - 1) * limit;

    const filter = buildFilter(req.user._id, req.query);
    const sort = buildSort(req.query.sortBy, req.query.order);

    const [friends, total] = await Promise.all([
      Friend.find(filter).sort(sort).skip(skip).limit(limit).lean({ virtuals: true }),
      Friend.countDocuments(filter),
    ]);

    return sendSuccess(res, { friends }, 'Friends fetched', 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/friends/:id
const getFriendById = async (req, res, next) => {
  try {
    const friend = await Friend.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).lean({ virtuals: true });

    if (!friend) return sendError(res, 'Friend not found', 404);

    return sendSuccess(res, { friend }, 'Friend fetched');
  } catch (error) {
    next(error);
  }
};

// POST /api/friends
const createFriend = async (req, res, next) => {
  try {
    const friend = await Friend.create({ ...req.body, userId: req.user._id });
    return sendCreated(res, { friend }, 'Friend added successfully');
  } catch (error) {
    next(error);
  }
};

// PUT /api/friends/:id
const updateFriend = async (req, res, next) => {
  try {
    // Remove fields that shouldn't be patched via this route
    const { userId, isDeleted, deletedAt, ...updateData } = req.body;

    const friend = await Friend.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id, isDeleted: false },
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean({ virtuals: true });

    if (!friend) return sendError(res, 'Friend not found', 404);

    return sendSuccess(res, { friend }, 'Friend updated successfully');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/friends/:id  — soft delete (moves to recycle bin)
const deleteFriend = async (req, res, next) => {
  try {
    const friend = await Friend.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id, isDeleted: false },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    );

    if (!friend) return sendError(res, 'Friend not found', 404);

    return sendSuccess(res, {}, 'Friend moved to recycle bin');
  } catch (error) {
    next(error);
  }
};

// POST /api/friends/:id/restore — restore from recycle bin
const restoreFriend = async (req, res, next) => {
  try {
    const friend = await Friend.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id, isDeleted: true },
      { $set: { isDeleted: false, deletedAt: null } },
      { new: true }
    );

    if (!friend) return sendError(res, 'Friend not found in recycle bin', 404);

    return sendSuccess(res, { friend }, 'Friend restored successfully');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/friends/:id/permanent — hard delete (no recovery)
const permanentDelete = async (req, res, next) => {
  try {
    const friend = await Friend.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
      isDeleted: true,
    });

    if (!friend) return sendError(res, 'Friend not found in recycle bin', 404);

    return sendSuccess(res, {}, 'Friend permanently deleted');
  } catch (error) {
    next(error);
  }
};

// GET /api/friends/recycle-bin
const getRecycleBin = async (req, res, next) => {
  try {
    const friends = await Friend.find({
      userId: req.user._id,
      isDeleted: true,
    })
      .sort({ deletedAt: -1 })
      .lean({ virtuals: true });

    return sendSuccess(res, { friends }, 'Recycle bin fetched');
  } catch (error) {
    next(error);
  }
};

// PATCH /api/friends/:id/favorite
const toggleFavorite = async (req, res, next) => {
  try {
    const friend = await Friend.findOne({ _id: req.params.id, userId: req.user._id });
    if (!friend) return sendError(res, 'Friend not found', 404);

    friend.isFavorite = !friend.isFavorite;
    await friend.save();

    return sendSuccess(res, { isFavorite: friend.isFavorite }, 'Favorite toggled');
  } catch (error) {
    next(error);
  }
};

// PATCH /api/friends/:id/archive
const toggleArchive = async (req, res, next) => {
  try {
    const friend = await Friend.findOne({ _id: req.params.id, userId: req.user._id });
    if (!friend) return sendError(res, 'Friend not found', 404);

    friend.isArchived = !friend.isArchived;
    await friend.save();

    return sendSuccess(res, { isArchived: friend.isArchived }, 'Archive toggled');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFriends,
  getFriendById,
  createFriend,
  updateFriend,
  deleteFriend,
  restoreFriend,
  permanentDelete,
  getRecycleBin,
  toggleFavorite,
  toggleArchive,
};
