import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="mt-20 border-t border-gray-200 bg-white">
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
        <div className="col-span-2">
          <span className="font-display text-xl font-semibold text-primary-700">
            Lumen<span className="text-gray-900">learn</span>
          </span>
          <p className="mt-3 max-w-xs text-sm text-gray-500">
            Practical, project-based courses taught by working practitioners. Learn at your own pace, prove it with a certificate.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-900">Learn</h4>
          <ul className="mt-3 space-y-2 text-sm text-gray-500">
            <li><Link to="/courses" className="hover:text-primary-700">All courses</Link></li>
            <li><Link to="/courses?category=Web Development" className="hover:text-primary-700">Web Development</Link></li>
            <li><Link to="/courses?category=Data Science" className="hover:text-primary-700">Data Science</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-900">Teach</h4>
          <ul className="mt-3 space-y-2 text-sm text-gray-500">
            <li><Link to="/instructor/dashboard" className="hover:text-primary-700">Instructor dashboard</Link></li>
            <li><Link to="/register" className="hover:text-primary-700">Become an instructor</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-900">Company</h4>
          <ul className="mt-3 space-y-2 text-sm text-gray-500">
            <li><a href="#" className="hover:text-primary-700">About</a></li>
            <li><a href="#" className="hover:text-primary-700">Careers</a></li>
            <li><a href="#" className="hover:text-primary-700">Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="mt-10 border-t border-gray-100 pt-6 text-xs text-gray-400">
        © {new Date().getFullYear()} Lumenlearn. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
