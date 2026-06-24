import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../Navbar';
import TutorSideNavBar from './TutorSideNavBar';


const TutorLayout: React.FC = () => {
  const { role, isLoggedIn } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (role !== 'tutor') {
    return <Navigate to="/" replace />;
  }

  const hideSidebar = location.pathname.includes('/tutor/search-classes');

  return (
    <div className="bg-surface-container-low text-on-surface min-h-screen flex flex-col">
      {/* Unified Navbar (same as all other pages) */}
      <Navbar />

      {/* Body: Sidebar + Content */}
      <div className="flex flex-1 pt-[72px]">
        {!hideSidebar && <TutorSideNavBar />}

        {/* Main Content Area — offset by sidebar width */}
        <main className={`flex-1 p-8 min-h-[calc(100vh-72px)] ${!hideSidebar ? 'ml-[280px]' : ''}`}>
          <div className="max-w-[1200px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default TutorLayout;
