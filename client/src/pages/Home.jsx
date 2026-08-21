import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiSearch } from 'react-icons/fi';
import { getCourses } from '../services/courseService';
import CourseCard from '../components/course/CourseCard';
import { CourseGridSkeleton } from '../components/course/CourseCardSkeleton';

const CATEGORIES = [
  { name: 'Web Development', emoji: '💻' },
  { name: 'Data Science', emoji: '📊' },
  { name: 'Design', emoji: '🎨' },
  { name: 'Business', emoji: '📈' },
  { name: 'Marketing', emoji: '📣' },
  { name: 'Mobile Development', emoji: '📱' },
];

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getCourses({ sort: '-studentsCount', limit: 8 })
      .then((data) => setFeatured(data.courses))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/courses?search=${encodeURIComponent(search)}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.35),transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl font-display text-4xl font-semibold leading-tight text-white sm:text-5xl"
          >
            Skills that move you forward, taught by people who use them daily.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-5 max-w-xl text-lg text-gray-300"
          >
            Project-based courses in development, design, data, and business. Learn at your pace, track real progress, earn a certificate.
          </motion.p>

          <motion.form
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onSubmit={handleSearch}
            className="relative mt-8 max-w-lg"
          >
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="What do you want to learn today?"
              className="w-full rounded-full border-0 bg-white/95 py-3.5 pl-11 pr-32 text-sm text-gray-900 shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
            >
              Search
            </button>
          </motion.form>

          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-2 text-sm text-gray-400">
            <span><strong className="text-white">12+</strong> courses</span>
            <span><strong className="text-white">25+</strong> instructors</span>
            <span><strong className="text-white">1,000+</strong> lessons completed</span>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl font-semibold text-gray-900">Browse by category</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {CATEGORIES.map((c) => (
            <Link
              key={c.name}
              to={`/courses?category=${encodeURIComponent(c.name)}`}
              className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-5 text-center transition-colors hover:border-primary-300 hover:bg-primary-50"
            >
              <span className="text-2xl">{c.emoji}</span>
              <span className="text-sm font-medium text-gray-700">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured courses */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold text-gray-900">Popular right now</h2>
          <Link to="/courses" className="flex items-center gap-1 text-sm font-semibold text-primary-700 hover:underline">
            View all <FiArrowRight />
          </Link>
        </div>

        {loading ? (
          <div className="mt-6"><CourseGridSkeleton count={4} /></div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-display text-2xl font-semibold text-gray-900">What learners are saying</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              {
                quote: 'The project-based structure meant I had a real portfolio piece by the end of week two, not just notes.',
                name: 'Amara T.',
                role: 'Frontend Developer',
              },
              {
                quote: "I've tried three other platforms. This is the first one where the progress tracking actually kept me accountable.",
                name: 'Daniel K.',
                role: 'Data Analyst',
              },
              {
                quote: 'As someone managing a small team, the instructor dashboard made it easy to see who was actually finishing courses.',
                name: 'Priya S.',
                role: 'Engineering Manager',
              },
            ].map((t) => (
              <figure key={t.name} className="rounded-xl border border-gray-200 bg-white p-6">
                <blockquote className="text-sm leading-relaxed text-gray-700">"{t.quote}"</blockquote>
                <figcaption className="mt-4 text-sm">
                  <span className="font-semibold text-gray-900">{t.name}</span>
                  <span className="text-gray-500"> · {t.role}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Instructor CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start gap-6 rounded-2xl bg-primary-700 p-10 text-white sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-display text-2xl font-semibold">Become an instructor</h3>
            <p className="mt-2 max-w-md text-primary-100">
              Share what you know. Build a course, reach students worldwide, and earn on your terms.
            </p>
          </div>
          <Link
            to="/register"
            className="shrink-0 rounded-full bg-white px-6 py-3 text-sm font-semibold text-primary-700 hover:bg-primary-50"
          >
            Start teaching today
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
