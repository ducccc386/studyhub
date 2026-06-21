import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../Navbar';
import SideNavBar from './SideNavBar';
const ParentLayout: React.FC = () => {
  const { role, isLoggedIn } = useAuth();
  const location = useLocation();

  if (!isLoggedIn || role !== 'parent') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="bg-surface-container-low text-on-surface min-h-screen flex flex-col">
      {/* Unified Navbar (same as all other pages) */}
      <Navbar />

      {/* Body: Sidebar + Content */}
      <div className="flex flex-1 pt-[72px]">
        <SideNavBar />

        {/* Main Content Area — offset by sidebar width */}
        <main className="flex-1 ml-[280px] p-8 min-h-[calc(100vh-72px)]">
          <div className="max-w-[1200px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ParentLayout;
