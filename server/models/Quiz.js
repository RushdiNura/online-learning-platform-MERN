const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true }, // index into options
  explanation: { type: String, default: '' },
  marks: { type: Number, default: 1 },
});

const attemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [{ type: Number }],
  score: { type: Number, required: true },
  passed: { type: Boolean, required: true },
  completedAt: { type: Date, default: Date.now },
});

const quizSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    sectionId: { type: mongoose.Schema.Types.ObjectId },
    title: { type: String, required: true },
    questions: [questionSchema],
    passingScore: { type: Number, default: 70 }, // percentage
    timeLimit: { type: Number, default: 600 }, // seconds
    attempts: [attemptSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quiz', quizSchema);
