const CourseCardSkeleton = () => (
  <div className="animate-pulse overflow-hidden rounded-xl border border-gray-200 bg-white">
    <div className="aspect-video w-full bg-gray-200" />
    <div className="space-y-3 p-4">
      <div className="h-3 w-1/3 rounded bg-gray-200" />
      <div className="h-4 w-full rounded bg-gray-200" />
      <div className="h-4 w-2/3 rounded bg-gray-200" />
      <div className="h-3 w-1/2 rounded bg-gray-200" />
      <div className="h-5 w-1/4 rounded bg-gray-200" />
    </div>
  </div>
);

export const CourseGridSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: count }).map((_, i) => (
      <CourseCardSkeleton key={i} />
    ))}
  </div>
);

export default CourseCardSkeleton;
