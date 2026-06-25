/**
 * WHY: RESTful routes for friends resource.
 *      All routes protected — require valid JWT.
 * HOW: Uses protect middleware on router level instead of per-route.
 *      Special routes (recycle-bin, restore, permanent) before /:id to avoid conflicts.
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  getFriends, getFriendById, createFriend, updateFriend,
  deleteFriend, restoreFriend, permanentDelete, getRecycleBin,
  toggleFavorite, toggleArchive,
} = require('../controllers/friends.controller');

// All friends routes require authentication
router.use(protect);

router.get('/recycle-bin', getRecycleBin);
router.get('/', getFriends);
router.post('/', createFriend);
router.get('/:id', getFriendById);
router.put('/:id', updateFriend);
router.delete('/:id', deleteFriend);
router.post('/:id/restore', restoreFriend);
router.delete('/:id/permanent', permanentDelete);
router.patch('/:id/favorite', toggleFavorite);
router.patch('/:id/archive', toggleArchive);

module.exports = router;
