import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { FiStar, FiClock, FiUsers, FiPlayCircle, FiCheck, FiChevronDown } from 'react-icons/fi';
import { getCourse, getCourseReviews, addReview, toggleWishlist } from '../services/courseService';
import { enrollInCourse, getUserEnrollments } from '../services/enrollmentService';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';

const formatDuration = (seconds = 0) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [course, setCourse] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [openSection, setOpenSection] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [courseData, reviewData] = await Promise.all([getCourse(id), getCourseReviews(id)]);
        setCourse(courseData);
        setReviews(reviewData);

        if (isAuthenticated && user) {
          const enrollments = await getUserEnrollments(user._id);
          setIsEnrolled(enrollments.some((e) => e.courseId?._id === id));
        }
      } catch (err) {
        toast.error('Could not load this course');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isAuthenticated, user]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/courses/${id}` } } });
      return;
    }
    setEnrolling(true);
    try {
      await enrollInCourse(id);
      setIsEnrolled(true);
      toast.success('Enrolled! Let\'s start learning.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not enroll');
    } finally {
      setEnrolling(false);
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) return navigate('/login');
    try {
      const { inWishlist } = await toggleWishlist(id);
      toast.success(inWishlist ? 'Added to wishlist' : 'Removed from wishlist');
    } catch {
      toast.error('Something went wrong');
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      const review = await addReview({ courseId: id, ...reviewForm });
      setReviews((prev) => [{ ...review, userId: user }, ...prev]);
      toast.success('Review posted');
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not post review');
    }
  };

  if (loading) return <Spinner className="py-32" />;
  if (!course) return <div className="py-32 text-center text-gray-500">Course not found.</div>;

  return (
    <div>
      <div className="bg-gray-900 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div className="lg:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-primary-300">{course.category}</span>
            <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">{course.title}</h1>
            <p className="mt-3 max-w-2xl text-gray-300">{course.shortDescription || course.description}</p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-300">
              {course.rating?.count > 0 && (
                <span className="flex items-center gap-1 font-medium text-amber-400">
                  <FiStar className="fill-current" /> {course.rating.average.toFixed(1)} ({course.rating.count} ratings)
                </span>
              )}
              <span className="flex items-center gap-1"><FiUsers /> {course.studentsCount} students</span>
              <span className="flex items-center gap-1"><FiClock /> {formatDuration(course.totalDuration)}</span>
              <span>Level: {course.level}</span>
            </div>

            <p className="mt-3 text-sm text-gray-400">
              Created by <span className="font-medium text-white">{course.instructor?.name}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="space-y-10 lg:col-span-2">
          {course.whatYouWillLearn?.length > 0 && (
            <section className="rounded-xl border border-gray-200 p-6">
              <h2 className="font-display text-xl font-semibold text-gray-900">What you'll learn</h2>
              <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {course.whatYouWillLearn.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <FiCheck className="mt-0.5 shrink-0 text-emerald-600" /> {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2 className="font-display text-xl font-semibold text-gray-900">Course content</h2>
            <p className="mt-1 text-sm text-gray-500">
              {course.sections?.length} sections • {course.totalLectures} lectures • {formatDuration(course.totalDuration)} total
            </p>
            <div className="mt-4 divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200">
              {course.sections?.map((section, idx) => (
                <div key={section._id}>
                  <button
                    onClick={() => setOpenSection(openSection === idx ? -1 : idx)}
                    className="flex w-full items-center justify-between bg-gray-50 px-4 py-3 text-left"
                  >
                    <span className="text-sm font-semibold text-gray-900">{section.title}</span>
                    <FiChevronDown className={`transition-transform ${openSection === idx ? 'rotate-180' : ''}`} />
                  </button>
                  {openSection === idx && (
                    <ul className="divide-y divide-gray-100">
                      {section.lectures.map((lecture) => (
                        <li key={lecture._id} className="flex items-center justify-between px-4 py-3 text-sm text-gray-600">
                          <span className="flex items-center gap-2">
                            <FiPlayCircle className="text-gray-400" /> {lecture.title}
                            {lecture.preview && (
                              <span className="rounded bg-primary-50 px-1.5 py-0.5 text-xs font-medium text-primary-700">Preview</span>
                            )}
                          </span>
                          <span className="text-xs text-gray-400">{formatDuration(lecture.duration)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>

          {course.requirements?.length > 0 && (
            <section>
              <h2 className="font-display text-xl font-semibold text-gray-900">Requirements</h2>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-700">
                {course.requirements.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </section>
          )}

          <section>
            <h2 className="font-display text-xl font-semibold text-gray-900">Description</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-700">{course.description}</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-gray-900">Student reviews</h2>

            {isEnrolled && (
              <form onSubmit={submitReview} className="mt-4 rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewForm((f) => ({ ...f, rating: star }))}
                      aria-label={`Rate ${star} stars`}
                    >
                      <FiStar className={star <= reviewForm.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                  placeholder="Share your experience with this course..."
                  className="mt-3 w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
                  rows={3}
                />
                <Button type="submit" size="sm" className="mt-2">Post review</Button>
              </form>
            )}

            <div className="mt-6 space-y-6">
              {reviews.length === 0 && <p className="text-sm text-gray-500">No reviews yet.</p>}
              {reviews.map((r) => (
                <div key={r._id} className="border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                      {r.userId?.name?.[0]?.toUpperCase() || '?'}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{r.userId?.name}</p>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <FiStar key={s} size={12} className={s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />
                        ))}
                      </div>
                    </div>
                  </div>
                  {r.comment && <p className="mt-2 text-sm text-gray-600">{r.comment}</p>}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div>
          <div className="sticky top-24 rounded-xl border border-gray-200 p-6 shadow-sm">
            <img src={course.thumbnail} alt={course.title} className="mb-4 aspect-video w-full rounded-lg object-cover" />
            <div className="flex items-baseline gap-2">
              {course.price > 0 ? (
                <>
                  <span className="text-3xl font-bold text-gray-900">${course.price}</span>
                  {course.originalPrice > course.price && (
                    <span className="text-gray-400 line-through">${course.originalPrice}</span>
                  )}
                </>
              ) : (
                <span className="text-3xl font-bold text-emerald-600">Free</span>
              )}
            </div>

            {isEnrolled ? (
              <Button className="mt-5 w-full" onClick={() => navigate(`/learn/${course._id}`)}>
                Go to course
              </Button>
            ) : (
              <Button className="mt-5 w-full" loading={enrolling} onClick={handleEnroll}>
                Enroll now
              </Button>
            )}
            <Button variant="secondary" className="mt-3 w-full" onClick={handleWishlist}>
              Add to wishlist
            </Button>

            <ul className="mt-6 space-y-2 text-sm text-gray-600">
              <li>• Full lifetime access</li>
              <li>• Certificate of completion</li>
              <li>• {course.totalLectures} on-demand lectures</li>
              <li>• Access on mobile and desktop</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
