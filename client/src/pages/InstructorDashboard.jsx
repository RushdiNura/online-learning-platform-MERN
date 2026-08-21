import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiUsers, FiDollarSign, FiBookOpen } from 'react-icons/fi';
import { getInstructorCourses, createCourse, deleteCourse } from '../services/courseService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';

const emptyForm = { title: '', description: '', category: 'Web Development', level: 'Beginner', price: 0 };

const InstructorDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadCourses = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const data = await getInstructorCourses(user._id);
      setCourses(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createCourse({ ...form, price: Number(form.price) });
      toast.success('Course created as draft');
      setForm(emptyForm);
      setShowForm(false);
      loadCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create course');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course? This cannot be undone.')) return;
    try {
      await deleteCourse(id);
      toast.success('Course deleted');
      setCourses((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete course');
    }
  };

  const totalStudents = courses.reduce((s, c) => s + c.studentsCount, 0);
  const totalRevenue = courses.reduce((s, c) => s + c.studentsCount * c.price, 0);

  if (loading) return <Spinner className="py-32" />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-gray-900">Instructor dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your courses and track performance.</p>
        </div>
        <Button onClick={() => setShowForm((s) => !s)}>
          <FiPlus /> New course
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl border border-gray-200 p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700"><FiBookOpen /></span>
          <div><p className="text-2xl font-bold text-gray-900">{courses.length}</p><p className="text-sm text-gray-500">Courses</p></div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-gray-200 p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><FiUsers /></span>
          <div><p className="text-2xl font-bold text-gray-900">{totalStudents}</p><p className="text-sm text-gray-500">Total students</p></div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-gray-200 p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700"><FiDollarSign /></span>
          <div><p className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p><p className="text-sm text-gray-500">Estimated revenue</p></div>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mt-8 space-y-4 rounded-xl border border-gray-200 p-6">
          <h3 className="font-display text-lg font-semibold text-gray-900">Create a new course</h3>
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Description</span>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
          </label>
          <div className="grid grid-cols-3 gap-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">Category</span>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
              >
                {['Web Development', 'Data Science', 'Design', 'Business', 'Marketing', 'Mobile Development'].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">Level</span>
              <select
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
              >
                {['Beginner', 'Intermediate', 'Advanced'].map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </label>
            <Input
              label="Price (USD)"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <div className="flex gap-3">
            <Button type="submit" loading={saving}>Create course</Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold text-gray-900">Your courses</h2>
        {courses.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-gray-300 py-10 text-center text-gray-500">
            You haven't created any courses yet.
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Students</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {courses.map((c) => (
                  <tr key={c._id}>
                    <td className="max-w-xs truncate px-4 py-3 font-medium text-gray-900">
                      <Link to={`/courses/${c._id}`} className="hover:text-primary-700">{c.title}</Link>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          c.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{c.studentsCount}</td>
                    <td className="px-4 py-3">{c.rating?.average?.toFixed(1) || '—'}</td>
                    <td className="px-4 py-3">{c.price > 0 ? `$${c.price}` : 'Free'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button className="text-gray-400 hover:text-primary-600" aria-label="Edit"><FiEdit2 /></button>
                        <button onClick={() => handleDelete(c._id)} className="text-gray-400 hover:text-red-600" aria-label="Delete">
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default InstructorDashboard;
