import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ReactPlayer from 'react-player';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiCircle, FiChevronLeft, FiChevronRight, FiFileText } from 'react-icons/fi';
import { getCourse } from '../services/courseService';
import { getProgress, completeLecture } from '../services/progressService';
import { getCourseQuizzes } from '../services/progressService';
import Spinner from '../components/ui/Spinner';

const LessonPlayer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [activeLectureId, setActiveLectureId] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  const allLectures = useMemo(() => {
    if (!course) return [];
    return course.sections.flatMap((s) => s.lectures.map((l) => ({ ...l, sectionTitle: s.title })));
  }, [course]);

  const activeLecture = allLectures.find((l) => l._id === activeLectureId);
  const activeIndex = allLectures.findIndex((l) => l._id === activeLectureId);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [courseData, progressData, quizData] = await Promise.all([
          getCourse(courseId),
          getProgress(user._id, courseId).catch(() => null),
          getCourseQuizzes(courseId).catch(() => []),
        ]);
        setCourse(courseData);
        setProgress(progressData);
        setQuizzes(quizData);

        const firstLectureId =
          progressData?.lastLectureId || courseData.sections?.[0]?.lectures?.[0]?._id;
        setActiveLectureId(firstLectureId);
      } catch {
        toast.error('Could not load this course');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const isCompleted = (lectureId) => progress?.completedLectures?.some((id) => id === lectureId || id?.toString?.() === lectureId);

  const markComplete = async () => {
    try {
      const updated = await completeLecture(courseId, activeLectureId);
      setProgress(updated);
      toast.success('Marked as complete');
    } catch {
      toast.error('Could not update progress');
    }
  };

  const goToLecture = (id) => setActiveLectureId(id);
  const goNext = () => {
    if (activeIndex < allLectures.length - 1) setActiveLectureId(allLectures[activeIndex + 1]._id);
  };
  const goPrev = () => {
    if (activeIndex > 0) setActiveLectureId(allLectures[activeIndex - 1]._id);
  };

  if (loading) return <Spinner className="py-32" />;
  if (!course) return <div className="py-32 text-center text-gray-500">Course not found.</div>;

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col lg:flex-row">
      {/* Main content */}
      <div className="flex-1 bg-black">
        <div className="aspect-video w-full bg-black">
          {activeLecture?.videoUrl ? (
            <ReactPlayer url={activeLecture.videoUrl} width="100%" height="100%" controls onEnded={markComplete} />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">No video available for this lecture</div>
          )}
        </div>

        <div className="bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-primary-600">{activeLecture?.sectionTitle}</p>
              <h1 className="font-display text-xl font-semibold text-gray-900">{activeLecture?.title}</h1>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={goPrev} disabled={activeIndex <= 0} className="rounded-full border border-gray-300 p-2 disabled:opacity-40">
                <FiChevronLeft />
              </button>
              <button
                onClick={goNext}
                disabled={activeIndex >= allLectures.length - 1}
                className="rounded-full border border-gray-300 p-2 disabled:opacity-40"
              >
                <FiChevronRight />
              </button>
              <button
                onClick={markComplete}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                  isCompleted(activeLectureId) ? 'bg-emerald-100 text-emerald-700' : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                <FiCheckCircle /> {isCompleted(activeLectureId) ? 'Completed' : 'Mark complete'}
              </button>
            </div>
          </div>

          {quizzes.length > 0 && (
            <div className="mt-6 rounded-xl border border-primary-200 bg-primary-50 p-4">
              <p className="text-sm font-medium text-primary-800">Test your knowledge</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {quizzes.map((q) => (
                  <Link
                    key={q._id}
                    to={`/learn/${courseId}/quiz/${q._id}`}
                    className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-primary-700 shadow-sm hover:shadow"
                  >
                    {q.title}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <FiFileText /> Notes
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Jot down notes for this lecture (saved locally in your browser for this session)"
              rows={4}
              className="mt-2 w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
          </div>

          {activeLecture?.resources?.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-900">Resources</h3>
              <ul className="mt-2 space-y-1">
                {activeLecture.resources.map((r, i) => (
                  <li key={i}>
                    <a href={r.url || r} target="_blank" rel="noreferrer" className="text-sm text-primary-700 hover:underline">
                      {r.name || `Resource ${i + 1}`}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar: course content */}
      <aside className="w-full shrink-0 overflow-y-auto border-t border-gray-200 bg-white lg:w-96 lg:border-l lg:border-t-0">
        <div className="border-b border-gray-200 p-4">
          <h2 className="line-clamp-2 font-display text-base font-semibold text-gray-900">{course.title}</h2>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-primary-600" style={{ width: `${progress?.overallProgress || 0}%` }} />
          </div>
          <p className="mt-1 text-xs text-gray-500">{progress?.overallProgress || 0}% complete</p>
        </div>

        {course.sections.map((section) => (
          <div key={section._id} className="border-b border-gray-100">
            <p className="bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{section.title}</p>
            <ul>
              {section.lectures.map((lecture) => (
                <li key={lecture._id}>
                  <button
                    onClick={() => goToLecture(lecture._id)}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm ${
                      activeLectureId === lecture._id ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {isCompleted(lecture._id) ? (
                      <FiCheckCircle className="shrink-0 text-emerald-600" />
                    ) : (
                      <FiCircle className="shrink-0 text-gray-300" />
                    )}
                    <span className="line-clamp-2">{lecture.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </aside>
    </div>
  );
};

export default LessonPlayer;
