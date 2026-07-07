import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StudyHubLogo from './StudyHubLogo';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, role, name, email, avatar, logout } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    // Fix bug where '/tutors' matches startsWith('/tutor')
    if (['/tutor', '/parent', '/admin'].includes(path)) {
      return location.pathname === path || location.pathname.startsWith(`${path}/`);
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Trang chủ', icon: 'home' },
    { to: '/classes', label: 'Lớp học', icon: 'school' },
    { to: '/tutors', label: 'Gia sư', icon: 'person_search' },
    { to: '/documents', label: 'Tài liệu', icon: 'folder_open' },
  ];

  if (role === 'tutor') {
    navLinks.push({ to: '/tutor/search-classes', label: 'Tìm lớp', icon: 'search' });
  }

  if (role === 'parent') {
    navLinks.push({ to: '/parent/posts', label: 'Bài đăng của tôi', icon: 'article' });
  }

  const userAvatar = avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=random`;

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,61,155,0.08)] border-b border-white/60'
          : 'bg-white/70 backdrop-blur-xl border-b border-white/30'
      }`}
      style={{ height: '68px' }}
    >
      <div className="max-w-[1440px] mx-auto h-full px-6 md:px-8 flex items-center justify-between gap-8">

        {/* ── Left: Logo + Nav links ── */}
        <div className="flex items-center gap-10">
          <StudyHubLogo iconSize={34} textSize="text-xl" />

          {/* Desktop Nav Links — pill style */}
          <nav className="hidden md:flex items-center gap-1 bg-surface-container-low/60 rounded-full px-2 py-1.5">
            {navLinks.map(({ to, label, icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive(to)
                    ? 'bg-primary text-white shadow-md shadow-primary/30'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-white/70'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: isActive(to) ? "'FILL' 1" : "'FILL' 0" }}>{icon}</span>
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* ── Right: Auth / User area ── */}
        <div className="flex items-center gap-2">

          {/* GUEST */}
          {!isLoggedIn && (
            <>
              <Link
                to="/login"
                className="hidden sm:block text-on-surface-variant hover:text-primary font-medium text-sm px-4 py-2 rounded-full hover:bg-primary/5 transition-all"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="bg-primary text-white px-5 py-2 rounded-full font-semibold text-sm hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all active:scale-95 shadow-md shadow-primary/20"
              >
                Đăng ký
              </Link>
            </>
          )}

          {/* LOGGED IN */}
          {isLoggedIn && (
            <>
              {/* Dashboard quick-access */}
              {role === 'parent' && (
                <Link
                  to="/parent/posts"
                  className={`hidden md:flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full transition-all ${
                    isActive('/parent')
                      ? 'bg-primary text-white shadow-md shadow-primary/25'
                      : 'text-primary border border-primary/30 hover:bg-primary/5 hover:border-primary/60'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">dashboard</span>
                  Quản lý
                </Link>
              )}
              {role === 'tutor' && (
                <Link
                  to="/tutor/dashboard"
                  className={`hidden md:flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full transition-all ${
                    isActive('/tutor')
                      ? 'bg-primary text-white shadow-md shadow-primary/25'
                      : 'text-primary border border-primary/30 hover:bg-primary/5 hover:border-primary/60'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">dashboard</span>
                  Quản lý
                </Link>
              )}
              {role === 'admin' && (
                <Link
                  to="/admin/dashboard"
                  className={`hidden md:flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full transition-all ${
                    isActive('/admin')
                      ? 'bg-primary text-white shadow-md shadow-primary/25'
                      : 'text-primary border border-primary/30 hover:bg-primary/5 hover:border-primary/60'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                  Quản trị
                </Link>
              )}

              {/* Notification Bell */}
              <button
                className="relative p-2 rounded-full hover:bg-surface-container-low transition-colors group"
                aria-label="Thông báo"
              >
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary text-[22px] transition-colors">notifications</span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
              </button>

              {/* Avatar Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`flex items-center gap-2 p-1.5 pr-3 rounded-full border transition-all duration-200 ${
                    isDropdownOpen
                      ? 'border-primary/40 bg-primary/5 shadow-md'
                      : 'border-outline-variant/50 hover:border-primary/30 hover:bg-surface-container-low'
                  }`}
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                >
                  {role === 'admin' ? (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
                    </div>
                  ) : (
                    <img
                      src={userAvatar}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-white"
                    />
                  )}
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-on-surface leading-tight">
                      {role === 'admin' ? 'Quản trị viên' : (name || 'Người dùng')}
                    </p>
                    <p className="text-[10px] text-on-surface-variant">
                      {role === 'admin' ? 'Admin' : role === 'parent' ? 'Phụ huynh' : 'Gia sư'}
                    </p>
                  </div>
                  <span className={`material-symbols-outlined text-on-surface-variant text-[18px] transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 top-[calc(100%+10px)] w-60 bg-white/95 backdrop-blur-2xl border border-white/60 rounded-2xl shadow-[0_20px_60px_-10px_rgba(0,61,155,0.2)] overflow-hidden z-50 animate-fade-in">
                    {/* User info banner */}
                    <div className="px-4 py-3 bg-gradient-to-r from-primary/8 to-transparent border-b border-outline-variant/40">
                      <div className="flex items-center gap-3">
                        {role === 'admin' ? (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-white text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
                          </div>
                        ) : (
                          <img src={userAvatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20 shrink-0" />
                        )}
                        <div className="overflow-hidden">
                          <p className="text-sm font-bold text-on-surface truncate">{role === 'admin' ? 'Quản trị viên' : (name || 'Người dùng')}</p>
                          <p className="text-xs text-on-surface-variant truncate">{role === 'admin' ? 'admin@studyhub.com' : email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-2 px-2">
                      {role === 'admin' ? (
                        <>
                          <MenuItem to="/admin/dashboard" icon="dashboard" label="Tổng quan Admin" onClick={() => setIsDropdownOpen(false)} />
                          <MenuItem to="/admin/users" icon="manage_accounts" label="Quản lý người dùng" onClick={() => setIsDropdownOpen(false)} />
                          <MenuItem to="/admin/content" icon="article" label="Duyệt nội dung" onClick={() => setIsDropdownOpen(false)} />
                        </>
                      ) : role === 'parent' ? (
                        <>
                          <MenuItem to="/parent/posts" icon="article" label="Bài đăng của tôi" onClick={() => setIsDropdownOpen(false)} />
                          <MenuItem to="/parent/settings" icon="settings" label="Cài đặt tài khoản" onClick={() => setIsDropdownOpen(false)} muted />
                        </>
                      ) : (
                        <>
                          <MenuItem to="/tutor/settings" icon="settings" label="Cài đặt tài khoản" onClick={() => setIsDropdownOpen(false)} muted />
                        </>
                      )}
                    </div>

                    {/* Logout */}
                    <div className="border-t border-outline-variant/40 p-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium"
                      >
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-surface-container-low transition-colors"
            aria-label="Menu"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-[22px]">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-2xl border-t border-white/40 shadow-xl animate-fade-in">
          <nav className="flex flex-col px-4 py-3 gap-1">
            {navLinks.map(({ to, label, icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive(to)
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-on-surface hover:bg-surface-container-low'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: isActive(to) ? "'FILL' 1" : "'FILL' 0" }}>{icon}</span>
                {label}
              </Link>
            ))}

            {isLoggedIn && (
              <>
                <div className="my-1 border-t border-outline-variant/40" />
                <Link
                  to={role === 'admin' ? "/admin/dashboard" : role === 'parent' ? "/parent/posts" : "/tutor/dashboard"}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-primary hover:bg-primary/10 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">dashboard</span>
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Đăng xuất
                </button>
              </>
            )}

            {!isLoggedIn && (
              <div className="flex gap-3 mt-2 pt-2 border-t border-outline-variant/40">
                <Link to="/login" className="flex-1 text-center py-2.5 border border-primary text-primary rounded-xl text-sm font-semibold hover:bg-primary/5 transition-colors">
                  Đăng nhập
                </Link>
                <Link to="/register" className="flex-1 text-center py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-md shadow-primary/25">
                  Đăng ký
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

// Sub-component for dropdown menu items
const MenuItem: React.FC<{ to: string; icon: string; label: string; onClick: () => void; muted?: boolean }> = ({ to, icon, label, onClick, muted }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all hover:bg-surface-container-low ${muted ? 'text-on-surface-variant' : 'text-on-surface font-medium'}`}
  >
    <span className={`material-symbols-outlined text-[18px] ${muted ? 'text-on-surface-variant' : 'text-primary'}`}>{icon}</span>
    {label}
  </Link>
);

export default Navbar;
