import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import CourseCard from '../components/course/CourseCard';
import CourseFilters from '../components/course/CourseFilters';
import { CourseGridSkeleton } from '../components/course/CourseCardSkeleton';
import { getCourses } from '../services/courseService';

const CourseCatalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const filters = {
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    level: searchParams.get('level') || '',
    sort: searchParams.get('sort') || '-createdAt',
    page: Number(searchParams.get('page')) || 1,
  };

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const data = await getCourses({ ...params, limit: 9 });
      setCourses(data.courses);
      setTotal(data.total);
      setPages(data.pages);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(fetchCourses, filters.search ? 350 : 0); // debounce search
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchCourses]);

  const applyFilters = (next) => {
    const params = Object.fromEntries(Object.entries(next).filter(([, v]) => v));
    setSearchParams(params);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold text-gray-900">
        {filters.search ? `Results for "${filters.search}"` : 'All courses'}
      </h1>
      <p className="mt-1 text-sm text-gray-500">{total} course{total !== 1 ? 's' : ''} found</p>

      <div className="mt-8 flex flex-col gap-8 md:flex-row">
        <CourseFilters filters={filters} onChange={applyFilters} />

        <div className="flex-1">
          {loading ? (
            <CourseGridSkeleton count={9} />
          ) : courses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 py-20 text-center">
              <p className="text-lg font-medium text-gray-700">No courses match these filters</p>
              <p className="mt-1 text-sm text-gray-500">Try a broader search term or clear a filter to see more results.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {courses.map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>

              {pages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => applyFilters({ ...filters, page: p })}
                      className={`h-9 w-9 rounded-full text-sm font-medium ${
                        p === filters.page ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCatalog;
