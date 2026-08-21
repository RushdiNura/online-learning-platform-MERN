const CATEGORIES = ['Web Development', 'Data Science', 'Design', 'Business', 'Marketing', 'Mobile Development'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const CourseFilters = ({ filters, onChange }) => {
  const update = (key, value) => onChange({ ...filters, [key]: value, page: 1 });

  return (
    <aside className="w-full shrink-0 space-y-6 md:w-64">
      <div>
        <h4 className="mb-3 text-sm font-semibold text-gray-900">Category</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="radio" name="category" checked={!filters.category} onChange={() => update('category', '')} />
            All categories
          </label>
          {CATEGORIES.map((cat) => (
            <label key={cat} className="flex items-center gap-2 text-sm text-gray-600">
              <input type="radio" name="category" checked={filters.category === cat} onChange={() => update('category', cat)} />
              {cat}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-semibold text-gray-900">Level</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="radio" name="level" checked={!filters.level} onChange={() => update('level', '')} />
            All levels
          </label>
          {LEVELS.map((lvl) => (
            <label key={lvl} className="flex items-center gap-2 text-sm text-gray-600">
              <input type="radio" name="level" checked={filters.level === lvl} onChange={() => update('level', lvl)} />
              {lvl}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-semibold text-gray-900">Sort by</h4>
        <select
          value={filters.sort}
          onChange={(e) => update('sort', e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
        >
          <option value="-createdAt">Newest</option>
          <option value="-rating.average">Highest rated</option>
          <option value="-studentsCount">Most popular</option>
          <option value="price">Price: low to high</option>
          <option value="-price">Price: high to low</option>
        </select>
      </div>
    </aside>
  );
};

export default CourseFilters;
