import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="flex min-h-[calc(100vh-140px)] flex-col items-center justify-center px-4 text-center">
    <span className="font-display text-6xl font-semibold text-primary-600">404</span>
    <h1 className="mt-4 text-xl font-semibold text-gray-900">Page not found</h1>
    <p className="mt-2 text-gray-500">The page you're looking for doesn't exist or has moved.</p>
    <Link to="/" className="mt-6 rounded-full bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">
      Back to home
    </Link>
  </div>
);

export default NotFound;
