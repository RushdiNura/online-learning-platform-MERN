const Enrollment = require('../models/Enrollment');
const Progress = require('../models/Progress');
const Course = require('../models/Course');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { sendEnrollmentEmail } = require('../utils/emailService');

// @route POST /api/enrollments
exports.enrollInCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.body;

  const course = await Course.findById(courseId);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

  const existing = await Enrollment.findOne({ userId: req.user._id, courseId });
  if (existing) {
    return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
  }

  const enrollment = await Enrollment.create({
    userId: req.user._id,
    courseId,
    paymentStatus: course.price > 0 ? 'paid' : 'free',
    amountPaid: course.price,
  });

  await Progress.create({ userId: req.user._id, courseId });

  course.studentsCount += 1;
  await course.save();

  await User.findByIdAndUpdate(req.user._id, {
    $push: { enrolledCourses: { courseId, enrolledAt: new Date(), progress: 0 } },
  });

  sendEnrollmentEmail(req.user, course);

  res.status(201).json({ success: true, enrollment });
});

// @route GET /api/enrollments/user/:userId
exports.getUserEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ userId: req.params.userId })
    .populate({ path: 'courseId', select: 'title thumbnail instructor totalDuration totalLectures rating' })
    .sort('-createdAt');

  res.status(200).json({ success: true, count: enrollments.length, enrollments });
});

// @route GET /api/enrollments/course/:courseId (instructor)
exports.getCourseEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ courseId: req.params.courseId })
    .populate('userId', 'name email avatar')
    .sort('-createdAt');

  res.status(200).json({ success: true, count: enrollments.length, enrollments });
});

// @route PUT /api/enrollments/:id/progress
exports.updateEnrollmentProgress = asyncHandler(async (req, res) => {
  const { progress } = req.body;
  const enrollment = await Enrollment.findById(req.params.id);
  if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found' });

  enrollment.progress = progress;
  if (progress >= 100) {
    enrollment.status = 'completed';
    enrollment.completedAt = new Date();
  }
  await enrollment.save();

  res.status(200).json({ success: true, enrollment });
});

// @route DELETE /api/enrollments/:id
exports.unenroll = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findById(req.params.id);
  if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found' });

  if (enrollment.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  await enrollment.deleteOne();
  await Progress.findOneAndDelete({ userId: enrollment.userId, courseId: enrollment.courseId });
  await User.findByIdAndUpdate(enrollment.userId, { $pull: { enrolledCourses: { courseId: enrollment.courseId } } });

  res.status(200).json({ success: true, message: 'Unenrolled successfully' });
});
