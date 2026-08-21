import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import api from '../services/api';
import { submitQuiz } from '../services/progressService';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';

const QuizPage = () => {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/quizzes/course/${courseId}`);
        const found = data.quizzes.find((q) => q._id === quizId);
        if (!found) throw new Error('Quiz not found');
        setQuiz(found);
        setTimeLeft(found.timeLimit);
      } catch {
        toast.error('Could not load quiz');
        navigate(`/learn/${courseId}`);
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId, quizId, navigate]);

  const handleSubmit = useCallback(async () => {
    if (!quiz || submitting || result) return;
    setSubmitting(true);
    try {
      const answerArray = quiz.questions.map((_, i) => (answers[i] !== undefined ? answers[i] : -1));
      const data = await submitQuiz(quizId, answerArray);
      setResult(data);
    } catch {
      toast.error('Could not submit quiz');
    } finally {
      setSubmitting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz, answers, quizId, submitting, result]);

  useEffect(() => {
    if (!quiz || result) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [quiz, timeLeft, result, handleSubmit]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (loading) return <Spinner className="py-32" />;
  if (!quiz) return null;

  if (result) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className={`rounded-2xl border p-8 text-center ${result.passed ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
          {result.passed ? (
            <FiCheckCircle className="mx-auto text-4xl text-emerald-600" />
          ) : (
            <FiXCircle className="mx-auto text-4xl text-red-600" />
          )}
          <h1 className="mt-4 font-display text-2xl font-semibold text-gray-900">
            {result.passed ? 'You passed!' : 'Not quite there yet'}
          </h1>
          <p className="mt-2 text-gray-600">
            You scored <strong>{result.score}%</strong> (passing score: {result.passingScore}%)
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button onClick={() => navigate(`/learn/${courseId}`)}>Back to course</Button>
            {!result.passed && (
              <Button variant="secondary" onClick={() => window.location.reload()}>
                Retry quiz
              </Button>
            )}
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <h2 className="font-display text-lg font-semibold text-gray-900">Review answers</h2>
          {result.review.map((r, i) => (
            <div key={i} className={`rounded-xl border p-4 ${r.correct ? 'border-emerald-200' : 'border-red-200'}`}>
              <p className="text-sm font-medium text-gray-900">{i + 1}. {r.question}</p>
              <p className="mt-2 text-sm text-gray-600">
                Your answer: <span className={r.correct ? 'font-medium text-emerald-700' : 'font-medium text-red-700'}>
                  {r.yourAnswer >= 0 ? r.options[r.yourAnswer] : 'Not answered'}
                </span>
              </p>
              {!r.correct && (
                <p className="text-sm text-gray-600">Correct answer: <span className="font-medium text-emerald-700">{r.options[r.correctAnswer]}</span></p>
              )}
              {r.explanation && <p className="mt-1 text-xs text-gray-500">{r.explanation}</p>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-semibold text-gray-900">{quiz.title}</h1>
        <span className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
          <FiClock /> {formatTime(timeLeft)}
        </span>
      </div>

      <div className="mt-2 flex gap-1.5">
        {quiz.questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentQ(i)}
            className={`h-2 flex-1 rounded-full ${
              i === currentQ ? 'bg-primary-600' : answers[i] !== undefined ? 'bg-primary-300' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-gray-200 p-6">
        <p className="text-xs font-medium text-gray-500">Question {currentQ + 1} of {quiz.questions.length}</p>
        <h2 className="mt-2 text-lg font-medium text-gray-900">{question.question}</h2>

        <div className="mt-5 space-y-3">
          {question.options.map((opt, i) => (
            <label
              key={i}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm ${
                answers[currentQ] === i ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name={`q-${currentQ}`}
                checked={answers[currentQ] === i}
                onChange={() => setAnswers((prev) => ({ ...prev, [currentQ]: i }))}
              />
              {opt}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <Button variant="secondary" disabled={currentQ === 0} onClick={() => setCurrentQ((q) => q - 1)}>
          Previous
        </Button>
        {currentQ < quiz.questions.length - 1 ? (
          <Button onClick={() => setCurrentQ((q) => q + 1)}>Next</Button>
        ) : (
          <Button loading={submitting} onClick={handleSubmit}>Submit quiz</Button>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
