import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminSideNavBar from './AdminSideNavBar';

const AdminLayout: React.FC = () => {
  const { role, isLoggedIn } = useAuth();
  const location = useLocation();

  if (!isLoggedIn || role !== 'admin') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Admin Top Header */}
      <header className="fixed top-0 left-0 w-full z-40 h-[72px] bg-primary-fixed border-b border-primary-fixed-dim shadow-sm flex items-center px-6">
        <Link to="/admin/dashboard" className="flex items-center gap-3">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBleFcGALxq9pNYKNMz5XTpFora2DXBV6ivifWStVIZ8XBfWbZeDK6H59NRyplgNKkhblKgKyycUGwrbcn7su58vwAB0GJz6LVHts5bw6eddUeHG5vXnrmUIaXKlK7zq-6Xv3Yknk5zEzNDEPEZoV_0KVlVeirFJkwHl2uiAWp8VK2CWH9xiqF9XRGf5vXbW_SEgl_7nedG3uoBoRxIYlHVeAcngh-w2r-lG4M41pYMxD8JtaOlrVpBMdZqMeFAs7SlwlZA0Pr2ArmU"
            alt="StudyHub Admin"
            className="w-8 h-8 rounded object-contain"
          />
          <span className="font-headline-sm text-headline-sm text-on-primary-fixed font-bold tracking-tight">StudyHub Admin</span>
        </Link>
        {/* Home button */}
        <Link
          to="/"
          className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-on-primary-fixed text-sm font-semibold transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">home</span>
          Về trang chủ
        </Link>
      </header>

      {/* Admin Body */}
      <div className="flex flex-1 pt-[72px]">
        {/* Left Navigation */}
        <AdminSideNavBar />

        {/* Main Content */}
        <main className="flex-1 ml-[280px] p-6 md:p-8 bg-surface overflow-x-hidden min-h-[calc(100vh-72px)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
