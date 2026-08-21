const Progress = require('../models/Progress');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Certificate = require('../models/Certificate');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { sendCertificateEmail } = require('../utils/emailService');

const recalcAndIssueCertificateIfDone = async (progressDoc, course) => {
  const totalLectures = course.totalLectures || 0;
  const completedCount = progressDoc.completedLectures.length;
  const pct = totalLectures > 0 ? Math.round((completedCount / totalLectures) * 100) : 0;

  progressDoc.overallProgress = Math.min(pct, 100);
  progressDoc.completed = pct >= 100;
  progressDoc.lastAccessed = new Date();

  await progressDoc.save();

  // Sync enrollment progress
  await Enrollment.findOneAndUpdate(
    { userId: progressDoc.userId, courseId: progressDoc.courseId },
    { progress: progressDoc.overallProgress, ...(progressDoc.completed ? { status: 'completed', completedAt: new Date() } : {}) }
  );
  await User.findOneAndUpdate(
    { _id: progressDoc.userId, 'enrolledCourses.courseId': progressDoc.courseId },
    { $set: { 'enrolledCourses.$.progress': progressDoc.overallProgress } }
  );

  if (progressDoc.completed && !progressDoc.certificateIssued) {
    const user = await User.findById(progressDoc.userId);
    const cert = await Certificate.create({ userId: progressDoc.userId, courseId: progressDoc.courseId });
    progressDoc.certificateIssued = true;
    await progressDoc.save();
    await User.findByIdAndUpdate(progressDoc.userId, { $push: { certificates: cert._id } });
    sendCertificateEmail(user, course, cert.verificationCode);
  }

  return progressDoc;
};

// @route GET /api/progress/:userId/:courseId
exports.getProgress = asyncHandler(async (req, res) => {
  const progress = await Progress.findOne({ userId: req.params.userId, courseId: req.params.courseId });
  if (!progress) return res.status(404).json({ success: false, message: 'Progress record not found' });
  res.status(200).json({ success: true, progress });
});

// @route GET /api/progress/:userId
exports.getAllProgressForUser = asyncHandler(async (req, res) => {
  const progress = await Progress.find({ userId: req.params.userId }).populate('courseId', 'title thumbnail');
  res.status(200).json({ success: true, count: progress.length, progress });
});

// @route PUT /api/progress/:userId/:courseId
exports.updateProgress = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

  let progress = await Progress.findOne({ userId: req.params.userId, courseId: req.params.courseId });
  if (!progress) {
    progress = await Progress.create({ userId: req.params.userId, courseId: req.params.courseId });
  }

  if (req.body.lastLectureId) progress.lastLectureId = req.body.lastLectureId;
  progress.lastAccessed = new Date();
  await progress.save();

  await recalcAndIssueCertificateIfDone(progress, course);

  res.status(200).json({ success: true, progress });
});

// @route POST /api/progress/complete-lecture
exports.completeLecture = asyncHandler(async (req, res) => {
  const { courseId, lectureId } = req.body;

  const course = await Course.findById(courseId);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

  let progress = await Progress.findOne({ userId: req.user._id, courseId });
  if (!progress) {
    progress = await Progress.create({ userId: req.user._id, courseId });
  }

  if (!progress.completedLectures.some((id) => id.toString() === lectureId)) {
    progress.completedLectures.push(lectureId);
  }
  progress.lastLectureId = lectureId;

  await recalcAndIssueCertificateIfDone(progress, course);

  res.status(200).json({ success: true, progress });
});
