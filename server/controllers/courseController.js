const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { asyncHandler } = require('../middleware/errorHandler');

// @route GET /api/courses
// Supports: search, category, level, minPrice, maxPrice, rating, sort, page, limit
exports.getCourses = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    level,
    minPrice,
    maxPrice,
    rating,
    sort = '-createdAt',
    page = 1,
    limit = 12,
    status = 'published',
  } = req.query;

  const query = {};
  if (status) query.status = status;
  if (category) query.category = category;
  if (level) query.level = level;
  if (rating) query['rating.average'] = { $gte: Number(rating) };
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  if (search) {
    query.$text = { $search: search };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [courses, total] = await Promise.all([
    Course.find(query)
      .populate('instructor', 'name avatar headline')
      .select('-sections')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit)),
    Course.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: courses.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    courses,
  });
});

// @route GET /api/courses/:id
exports.getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate('instructor', 'name avatar bio headline')
    .populate({ path: 'reviews', populate: { path: 'userId', select: 'name avatar' } });

  if (!course) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }

  res.status(200).json({ success: true, course });
});

// @route POST /api/courses (instructor/admin)
exports.createCourse = asyncHandler(async (req, res) => {
  const course = await Course.create({ ...req.body, instructor: req.user._id });
  res.status(201).json({ success: true, course });
});

// @route PUT /api/courses/:id
exports.updateCourse = asyncHandler(async (req, res) => {
  let course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

  if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to edit this course' });
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.status(200).json({ success: true, course });
});

// @route DELETE /api/courses/:id
exports.deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

  if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to delete this course' });
  }

  await course.deleteOne();
  res.status(200).json({ success: true, message: 'Course deleted' });
});

// @route POST /api/courses/:id/lessons  (adds a section, or a lecture to a section via body.sectionId)
exports.addLesson = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

  const { sectionId, sectionTitle, lecture } = req.body;

  if (sectionId) {
    const section = course.sections.id(sectionId);
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });
    section.lectures.push(lecture);
  } else {
    course.sections.push({ title: sectionTitle, lectures: lecture ? [lecture] : [] });
  }

  await course.save();
  res.status(201).json({ success: true, course });
});

// @route PUT /api/courses/:id/lessons/:lessonId
exports.updateLesson = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

  let updated = false;
  for (const section of course.sections) {
    const lecture = section.lectures.id(req.params.lessonId);
    if (lecture) {
      Object.assign(lecture, req.body);
      updated = true;
      break;
    }
  }
  if (!updated) return res.status(404).json({ success: false, message: 'Lesson not found' });

  await course.save();
  res.status(200).json({ success: true, course });
});

// @route DELETE /api/courses/:id/lessons/:lessonId
exports.deleteLesson = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

  let removed = false;
  for (const section of course.sections) {
    const lecture = section.lectures.id(req.params.lessonId);
    if (lecture) {
      lecture.deleteOne();
      removed = true;
      break;
    }
  }
  if (!removed) return res.status(404).json({ success: false, message: 'Lesson not found' });

  await course.save();
  res.status(200).json({ success: true, course });
});

// @route GET /api/courses/instructor/:id
exports.getInstructorCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ instructor: req.params.id }).sort('-createdAt');
  res.status(200).json({ success: true, count: courses.length, courses });
});
