import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiSearch, FiMenu, FiX, FiUser, FiLogOut, FiGrid } from 'react-icons/fi';
import { logoutUser } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/courses?search=${encodeURIComponent(search)}`);
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success('Signed out');
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="shrink-0 font-display text-2xl font-semibold tracking-tight text-primary-700">
          Lumen<span className="text-gray-900">learn</span>
        </Link>

        <form onSubmit={handleSearch} className="relative hidden flex-1 max-w-md md:block">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for anything"
            className="w-full rounded-full border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
        </form>

        <nav className="ml-auto hidden items-center gap-6 md:flex">
          <Link to="/courses" className="text-sm font-medium text-gray-700 hover:text-primary-700">
            Explore
          </Link>
          {isAuthenticated ? (
            <>
              {user?.role === 'instructor' && (
                <Link to="/instructor/dashboard" className="text-sm font-medium text-gray-700 hover:text-primary-700">
                  Teach
                </Link>
              )}
              <Link to="/dashboard" className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-primary-700">
                <FiGrid /> Dashboard
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-red-600">
                <FiLogOut /> Sign out
              </button>
              <Link to="/dashboard" className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white">
                {user?.name?.[0]?.toUpperCase() || <FiUser />}
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-primary-700">
                Sign in
              </Link>
              <Link to="/register" className="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700">
                Get started
              </Link>
            </>
          )}
        </nav>

        <button className="ml-auto md:hidden" onClick={() => setMenuOpen((o) => !o)} aria-label="Toggle menu">
          {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-gray-200 px-4 py-4 md:hidden">
          <form onSubmit={handleSearch} className="mb-4">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for anything"
              className="w-full rounded-full border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:outline-none"
            />
          </form>
          <div className="flex flex-col gap-3">
            <Link to="/courses" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-700">
              Explore
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-700">
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="text-left text-sm font-medium text-red-600">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-700">
                  Sign in
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="text-sm font-semibold text-primary-700">
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
