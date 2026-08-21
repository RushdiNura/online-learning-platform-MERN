const User = require('../models/User');
const Course = require('../models/Course');
const { asyncHandler } = require('../middleware/errorHandler');

// @route GET /api/users/:id
exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.status(200).json({ success: true, user });
});

// @route GET /api/users (admin)
exports.getUsers = asyncHandler(async (req, res) => {
  const { role, page = 1, limit = 20 } = req.query;
  const query = role ? { role } : {};
  const skip = (Number(page) - 1) * Number(limit);

  const [users, total] = await Promise.all([
    User.find(query).select('-password').skip(skip).limit(Number(limit)).sort('-createdAt'),
    User.countDocuments(query),
  ]);

  res.status(200).json({ success: true, count: users.length, total, users });
});

// @route POST /api/users/wishlist/:courseId
exports.toggleWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const courseId = req.params.courseId;

  const course = await Course.findById(courseId);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

  const idx = user.wishlist.findIndex((id) => id.toString() === courseId);
  let inWishlist;
  if (idx > -1) {
    user.wishlist.splice(idx, 1);
    inWishlist = false;
  } else {
    user.wishlist.push(courseId);
    inWishlist = true;
  }
  await user.save();

  res.status(200).json({ success: true, inWishlist, wishlist: user.wishlist });
});

// @route GET /api/users/wishlist
exports.getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist');
  res.status(200).json({ success: true, wishlist: user.wishlist });
});

// @route PUT /api/users/:id/deactivate (admin)
exports.deactivateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.status(200).json({ success: true, message: 'User deactivated' });
});
