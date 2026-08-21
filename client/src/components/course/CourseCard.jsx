import { Link } from 'react-router-dom';
import { FiStar, FiClock, FiUsers } from 'react-icons/fi';

const formatDuration = (seconds = 0) => {
  const hours = Math.floor(seconds / 3600);
  return hours > 0 ? `${hours}h` : `${Math.round(seconds / 60)}m`;
};

const CourseCard = ({ course }) => {
  const instructorName = course.instructor?.name || 'Instructor';

  return (
    <Link
      to={`/courses/${course._id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-lg"
    >
      <div className="aspect-video w-full overflow-hidden bg-gray-100">
        <img
          src={course.thumbnail || 'https://placehold.co/640x360?text=Course'}
          alt={course.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-primary-600">{course.category}</span>
        <h3 className="mt-1 line-clamp-2 font-display text-base font-semibold text-gray-900">{course.title}</h3>
        <p className="mt-1 text-sm text-gray-500">{instructorName}</p>

        <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
          {course.rating?.count > 0 && (
            <span className="flex items-center gap-1 font-medium text-amber-600">
              <FiStar className="fill-current" /> {course.rating.average.toFixed(1)} ({course.rating.count})
            </span>
          )}
          {course.totalDuration > 0 && (
            <span className="flex items-center gap-1">
              <FiClock /> {formatDuration(course.totalDuration)}
            </span>
          )}
          {course.studentsCount > 0 && (
            <span className="flex items-center gap-1">
              <FiUsers /> {course.studentsCount}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center gap-2 pt-3">
          {course.price > 0 ? (
            <>
              <span className="text-lg font-bold text-gray-900">${course.price}</span>
              {course.originalPrice > course.price && (
                <span className="text-sm text-gray-400 line-through">${course.originalPrice}</span>
              )}
            </>
          ) : (
            <span className="text-lg font-bold text-emerald-600">Free</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
