const Quiz = require('../models/Quiz');
const Progress = require('../models/Progress');
const { asyncHandler } = require('../middleware/errorHandler');

// @route GET /api/quizzes/course/:courseId
exports.getCourseQuizzes = asyncHandler(async (req, res) => {
  // Strip correct answers/explanations unless the requester is the instructor/admin
  const quizzes = await Quiz.find({ courseId: req.params.courseId });
  const sanitized = quizzes.map((q) => {
    const obj = q.toObject();
    obj.questions = obj.questions.map(({ correctAnswer, explanation, ...rest }) => rest);
    delete obj.attempts;
    return obj;
  });
  res.status(200).json({ success: true, count: sanitized.length, quizzes: sanitized });
});

// @route POST /api/quizzes (instructor)
exports.createQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.create(req.body);
  res.status(201).json({ success: true, quiz });
});

// @route POST /api/quizzes/:id/submit
exports.submitQuiz = asyncHandler(async (req, res) => {
  const { answers } = req.body; // array of selected option indices
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

  let earnedMarks = 0;
  let totalMarks = 0;
  const review = quiz.questions.map((q, i) => {
    totalMarks += q.marks;
    const correct = answers[i] === q.correctAnswer;
    if (correct) earnedMarks += q.marks;
    return {
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      yourAnswer: answers[i],
      correct,
      explanation: q.explanation,
    };
  });

  const score = totalMarks > 0 ? Math.round((earnedMarks / totalMarks) * 100) : 0;
  const passed = score >= quiz.passingScore;

  quiz.attempts.push({ userId: req.user._id, answers, score, passed });
  await quiz.save();

  // Record quiz score against course progress
  let progress = await Progress.findOne({ userId: req.user._id, courseId: quiz.courseId });
  if (!progress) {
    progress = await Progress.create({ userId: req.user._id, courseId: quiz.courseId });
  }
  const existingIdx = progress.quizScores.findIndex((qs) => qs.quizId.toString() === quiz._id.toString());
  if (existingIdx > -1) {
    progress.quizScores[existingIdx] = { quizId: quiz._id, score, passed };
  } else {
    progress.quizScores.push({ quizId: quiz._id, score, passed });
  }
  await progress.save();

  res.status(200).json({ success: true, score, passed, passingScore: quiz.passingScore, review });
});

// @route GET /api/quizzes/:id/results
exports.getQuizResults = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

  const myAttempts = quiz.attempts.filter((a) => a.userId.toString() === req.user._id.toString());
  res.status(200).json({ success: true, attempts: myAttempts });
});
