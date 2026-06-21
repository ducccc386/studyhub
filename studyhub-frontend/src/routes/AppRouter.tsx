import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Layout from '../components/Layout';
import ParentLayout from '../components/Parent/ParentLayout';
import TutorLayout from '../components/Tutor/TutorLayout';
import AdminLayout from '../components/Admin/AdminLayout';

const Homepage = lazy(() => import('../pages/Homepage'));
const ClassList = lazy(() => import('../pages/Classes/ClassList'));
const ClassDetail = lazy(() => import('../pages/Classes/ClassDetail'));
const TutorList = lazy(() => import('../pages/Tutor/TutorList'));
const TutorDetail = lazy(() => import('../pages/Tutor/TutorDetail'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const TestPayment = lazy(() => import('../pages/TestPayment'));
const PublicDocumentList = lazy(() => import('../pages/Documents/PublicDocumentList'));
const AboutUs = lazy(() => import('../pages/Shared/AboutUs'));


const PostManagement = lazy(() => import('../pages/Parent/PostManagement'));
const CreatePost = lazy(() => import('../pages/Parent/CreatePost'));
const ApplicantReview = lazy(() => import('../pages/Parent/ApplicantReview'));
const ClassManagement = lazy(() => import('../pages/Parent/ClassManagement'));
const FeedbackList = lazy(() => import('../pages/Parent/FeedbackList'));
const CreateFeedback = lazy(() => import('../pages/Parent/CreateFeedback'));
const Settings = lazy(() => import('../pages/Parent/Settings'));

const TutorDashboard = lazy(() => import('../pages/TutorPortal/TutorDashboard'));
const TutorSearchClasses = lazy(() => import('../pages/TutorPortal/TutorSearchClasses'));
const TutorApplyClass = lazy(() => import('../pages/TutorPortal/TutorApplyClass'));
const TutorOffers = lazy(() => import('../pages/TutorPortal/TutorOffers'));
const TutorBilling = lazy(() => import('../pages/TutorPortal/TutorBilling'));
const Messages = lazy(() => import('../pages/Shared/Messages'));
const TutorCreatePost = lazy(() => import('../pages/TutorPortal/TutorCreatePost'));
const TutorClasses = lazy(() => import('../pages/TutorPortal/TutorClasses'));
const TutorApplications = lazy(() => import('../pages/TutorPortal/TutorApplications'));
const TutorSchedule = lazy(() => import('../pages/TutorPortal/TutorSchedule'));
const TutorBookings = lazy(() => import('../pages/TutorPortal/TutorBookings'));
const TutorReviews = lazy(() => import('../pages/TutorPortal/TutorReviews'));
const TutorSettings = lazy(() => import('../pages/TutorPortal/TutorSettings'));

const ClassWorkspace = lazy(() => import('../pages/Shared/ClassWorkspace'));

const AdminClasses = lazy(() => import('../pages/AdminPortal/AdminClasses'));
const AdminDashboard = lazy(() => import('../pages/AdminPortal/AdminDashboard'));
const AdminUsers = lazy(() => import('../pages/AdminPortal/AdminUsers'));
const AdminContent = lazy(() => import('../pages/AdminPortal/AdminContent'));
const AdminReports = lazy(() => import('../pages/AdminPortal/AdminReports'));
const AdminPayouts = lazy(() => import('../pages/AdminPortal/AdminPayouts'));
const DocumentManagement = lazy(() => import('../pages/Admin/DocumentManagement'));

const SuspenseFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const AppRouter: React.FC = () => {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <Routes>
      {/* ── Public Routes (shared Navbar + Footer via Layout) ── */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Homepage />} />
        <Route path="classes" element={<ClassList />} />
        <Route path="classes/:id" element={<ClassDetail />} />
        <Route path="tutors" element={<TutorList />} />
        <Route path="tutors/:id" element={<TutorDetail />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="test-payment" element={<TestPayment />} />
        <Route path="documents" element={<PublicDocumentList />} />
        <Route path="about-us" element={<AboutUs />} />
      </Route>

      {/* ── Parent Dashboard Routes (shared Navbar + SideNavBar + Footer via ParentLayout) ── */}
      <Route path="/parent" element={<ParentLayout />}>
        {/* Index → Redirect to Posts */}
        <Route index element={<Navigate to="/parent/posts" replace />} />
        <Route path="post-management" element={<PostManagement />} />
        <Route path="posts" element={<PostManagement />} />
        <Route path="posts/:postId/applicants" element={<ApplicantReview />} />
        <Route path="posts/create" element={<CreatePost />} />
        <Route path="classes" element={<ClassManagement />} />
        <Route path="classes/:id/workspace" element={<ClassWorkspace />} />
        <Route path="feedback" element={<FeedbackList />} />
        <Route path="feedback/create" element={<CreateFeedback />} />
        <Route path="settings" element={<Settings />} />
        <Route path="messages" element={<Messages />} />
        {/* Catch-all redirect within /parent */}
        <Route path="*" element={<Navigate to="/parent" replace />} />
      </Route>

      {/* ── Tutor Dashboard Routes (shared Navbar + SideNavBar + Footer via TutorLayout) ── */}
      <Route path="/tutor" element={<TutorLayout />}>
        {/* Index → Redirect to Dashboard */}
        <Route index element={<Navigate to="/tutor/dashboard" replace />} />
        <Route path="dashboard" element={<TutorDashboard />} />
        <Route path="search-classes" element={<TutorSearchClasses />} />
        <Route path="apply-class/:postId" element={<TutorApplyClass />} />
        <Route path="create-post" element={<TutorCreatePost />} />
        <Route path="classes" element={<TutorClasses />} />
        <Route path="classes/:id/workspace" element={<ClassWorkspace />} />
        <Route path="applications" element={<TutorApplications />} />
        <Route path="bookings" element={<TutorBookings />} />
        <Route path="schedule" element={<TutorSchedule />} />
        <Route path="reviews" element={<TutorReviews />} />
        <Route path="offers" element={<TutorOffers />} />
        <Route path="billing" element={<TutorBilling />} />
        <Route path="messages" element={<Messages />} />
        <Route path="settings" element={<TutorSettings />} />
        {/* Catch-all redirect within /tutor */}
        <Route path="*" element={<Navigate to="/tutor" replace />} />
      </Route>

      {/* ── Admin Dashboard Routes (standalone AdminLayout) ── */}
      <Route path="/admin" element={<AdminLayout />}>
        {/* Index → Redirect to Dashboard */}
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="content" element={<AdminContent />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="payouts" element={<AdminPayouts />} />
        <Route path="documents" element={<DocumentManagement />} />
        <Route path="classes" element={<AdminClasses />} />
        <Route path="classes/:id/workspace" element={<ClassWorkspace />} />
        {/* Catch-all redirect within /admin */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>

      {/* ── Global catch-all ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  );
};

export default AppRouter;
