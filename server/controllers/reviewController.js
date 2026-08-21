const Review = require('../models/Review');
const Course = require('../models/Course');
const { asyncHandler } = require('../middleware/errorHandler');

const recalcCourseRating = async (courseId) => {
  const reviews = await Review.find({ courseId });
  const count = reviews.length;
  const average = count > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;
  await Course.findByIdAndUpdate(courseId, { 'rating.average': Math.round(average * 10) / 10, 'rating.count': count });
};

// @route POST /api/reviews
exports.addReview = asyncHandler(async (req, res) => {
  const { courseId, rating, comment } = req.body;

  const existing = await Review.findOne({ userId: req.user._id, courseId });
  if (existing) {
    return res.status(400).json({ success: false, message: 'You already reviewed this course' });
  }

  const review = await Review.create({ userId: req.user._id, courseId, rating, comment });
  await Course.findByIdAndUpdate(courseId, { $push: { reviews: review._id } });
  await recalcCourseRating(courseId);

  res.status(201).json({ success: true, review });
});

// @route GET /api/reviews/course/:courseId
exports.getCourseReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ courseId: req.params.courseId })
    .populate('userId', 'name avatar')
    .sort('-createdAt');
  res.status(200).json({ success: true, count: reviews.length, reviews });
});

// @route PUT /api/reviews/:id
exports.updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
  if (review.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  review.rating = req.body.rating ?? review.rating;
  review.comment = req.body.comment ?? review.comment;
  await review.save();
  await recalcCourseRating(review.courseId);

  res.status(200).json({ success: true, review });
});

// @route DELETE /api/reviews/:id
exports.deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
  if (review.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  const courseId = review.courseId;
  await review.deleteOne();
  await Course.findByIdAndUpdate(courseId, { $pull: { reviews: review._id } });
  await recalcCourseRating(courseId);

  res.status(200).json({ success: true, message: 'Review deleted' });
});
