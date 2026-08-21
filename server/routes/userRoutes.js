const express = require('express');
const router = express.Router();
const user = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.get('/wishlist', protect, user.getWishlist);
router.post('/wishlist/:courseId', protect, user.toggleWishlist);

router.get('/', protect, authorize('admin'), user.getUsers);
router.get('/:id', protect, user.getUser);
router.put('/:id/deactivate', protect, authorize('admin'), user.deactivateUser);

module.exports = router;
