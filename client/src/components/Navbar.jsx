import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-sm">
      {/* Top Gradient Decorative Line (Groww Mint to Groww Blue) */}
      <div className="h-1 w-full bg-gradient-to-r from-[#00d09c] via-[#5367ff] to-[#00d09c]" />

      <nav className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex justify-between items-center">
        {/* Groww Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#00d09c] to-[#5367ff] p-0.5 shadow-md shadow-[#5367ff]/20 group-hover:scale-105 transition-transform flex-shrink-0">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-[#00d09c] text-xl font-black">
              🌱
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2 leading-none">
              <span className="text-xl font-black text-slate-900 tracking-tight">
                Groww
              </span>
              <span className="text-[#5367ff] text-[10px] px-2 py-0.5 rounded-full bg-[#5367ff]/10 border border-[#5367ff]/30 font-black tracking-wider uppercase">
                SMART
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mt-1 leading-none">
              Market Watchlist
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 text-sm font-bold">
          <Link
            to="/"
            className={`transition-all relative py-1 ${
              isActive('/') ? 'text-[#00d09c]' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Home
            {isActive('/') && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#00d09c] rounded-full" />
            )}
          </Link>
          <Link
            to="/market"
            className={`transition-all relative py-1 ${
              isActive('/market') ? 'text-[#5367ff]' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Explore Market
            {isActive('/market') && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#5367ff] rounded-full" />
            )}
          </Link>
          <Link
            to="/watchlist"
            className={`transition-all relative py-1 ${
              isActive('/watchlist') ? 'text-[#00d09c]' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Watchlist
            {isActive('/watchlist') && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#00d09c] rounded-full" />
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-3 ml-4">
              <span className="text-xs bg-blue-50 px-3.5 py-1.5 rounded-xl border border-blue-200 text-[#5367ff] font-extrabold flex items-center gap-1.5 shadow-sm">
                <span>👤</span> {user.name || user.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-xs bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-black px-4 py-2 rounded-xl transition-all"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 ml-4">
              <Link
                to="/login"
                className="btn-groww text-xs px-4 py-2"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="btn-groww-blue text-xs px-4 py-2"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-slate-700 p-2 text-2xl"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white border-b border-slate-200 p-5 flex flex-col gap-4 md:hidden shadow-xl">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-800 hover:text-[#00d09c] font-bold py-1"
            >
              Home
            </Link>
            <Link
              to="/market"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-800 hover:text-[#5367ff] font-bold py-1"
            >
              Explore Market
            </Link>
            <Link
              to="/watchlist"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-800 hover:text-[#00d09c] font-bold py-1"
            >
              My Watchlist
            </Link>
            {user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="text-red-500 font-black text-left py-1"
              >
                Logout ({user.name || user.email})
              </button>
            ) : (
              <div className="flex gap-3 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center btn-groww text-xs py-2.5"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center btn-groww-blue text-xs py-2.5"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
