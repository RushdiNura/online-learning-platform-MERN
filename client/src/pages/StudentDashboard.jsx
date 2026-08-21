import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiAward, FiBookOpen, FiTrendingUp } from 'react-icons/fi';
import { getUserEnrollments } from '../services/enrollmentService';
import { getAllProgress } from '../services/progressService';
import api from '../services/api';
import Spinner from '../components/ui/Spinner';

const StudentDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [enrollments, setEnrollments] = useState([]);
  const [progressList, setProgressList] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) return;
    (async () => {
      setLoading(true);
      try {
        const [enrollmentData, progressData, certData] = await Promise.all([
          getUserEnrollments(user._id),
          getAllProgress(user._id),
          api.get(`/certificates/user/${user._id}`).then((r) => r.data.certificates).catch(() => []),
        ]);
        setEnrollments(enrollmentData);
        setProgressList(progressData);
        setCertificates(certData);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (loading) return <Spinner className="py-32" />;

  const completedCount = enrollments.filter((e) => e.status === 'completed').length;
  const inProgress = enrollments.filter((e) => e.status !== 'completed');
  const completed = enrollments.filter((e) => e.status === 'completed');

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold text-gray-900">Welcome back, {user?.name?.split(' ')[0]}</h1>
      <p className="mt-1 text-sm text-gray-500">Here's where you left off.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl border border-gray-200 p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700">
            <FiBookOpen />
          </span>
          <div>
            <p className="text-2xl font-bold text-gray-900">{enrollments.length}</p>
            <p className="text-sm text-gray-500">Enrolled courses</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-gray-200 p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <FiAward />
          </span>
          <div>
            <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
            <p className="text-sm text-gray-500">Certificates earned</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-gray-200 p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <FiTrendingUp />
          </span>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {enrollments.length > 0 ? Math.round(enrollments.reduce((s, e) => s + e.progress, 0) / enrollments.length) : 0}%
            </p>
            <p className="text-sm text-gray-500">Average progress</p>
          </div>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold text-gray-900">Continue learning</h2>
        {inProgress.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-gray-300 py-10 text-center text-gray-500">
            You're not enrolled in any courses yet. <Link to="/courses" className="font-semibold text-primary-700">Browse courses</Link>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {inProgress.map((e) => (
              <Link
                key={e._id}
                to={`/learn/${e.courseId?._id}`}
                className="rounded-xl border border-gray-200 p-4 transition-shadow hover:shadow-md"
              >
                <img src={e.courseId?.thumbnail} alt={e.courseId?.title} className="aspect-video w-full rounded-lg object-cover" />
                <h3 className="mt-3 line-clamp-2 text-sm font-semibold text-gray-900">{e.courseId?.title}</h3>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-primary-600" style={{ width: `${e.progress}%` }} />
                </div>
                <p className="mt-1 text-xs text-gray-500">{e.progress}% complete</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {completed.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold text-gray-900">Completed courses</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {completed.map((e) => {
              const cert = certificates.find((c) => c.courseId?._id === e.courseId?._id);
              return (
                <div key={e._id} className="rounded-xl border border-gray-200 p-4">
                  <img src={e.courseId?.thumbnail} alt={e.courseId?.title} className="aspect-video w-full rounded-lg object-cover" />
                  <h3 className="mt-3 line-clamp-2 text-sm font-semibold text-gray-900">{e.courseId?.title}</h3>
                  {cert ? (
                    <Link
                      to={`/certificates/${cert.verificationCode}`}
                      className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                    >
                      <FiAward /> View certificate
                    </Link>
                  ) : (
                    <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                      <FiAward /> Certificate earned
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default StudentDashboard;
