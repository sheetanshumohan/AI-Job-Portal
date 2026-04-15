import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import RecruiterDashboard from './pages/recruiter/Dashboard';
import ManageJobs from './pages/recruiter/ManageJobs';
import JobApplicants from './pages/recruiter/JobApplicants';
import PostJob from './pages/recruiter/PostJob';
import RecruiterProfile from './pages/recruiter/Profile';
import RecruiterAnalytics from './pages/recruiter/Analytics';
import RecruiterNotifications from './pages/recruiter/Notifications';
import StudentDashboard from './pages/student/Dashboard';
import StudentProfile from './pages/student/Profile';
import BrowseJobs from './pages/student/BrowseJobs';
import JobDetails from './pages/student/JobDetails';
import ApplyJob from './pages/student/ApplyJob';
import AppliedJobs from './pages/student/AppliedJobs';
import SavedJobs from './pages/student/SavedJobs';
import Notifications from './pages/student/Notifications';
import Interviews from './pages/student/Interviews';
import MockInterview from './pages/student/MockInterview';
import useAuthStore from './store/authStore';

// === Route Guards ===

// PublicRoute: Pages only unauthenticated users should see (Login, Register)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated) {
    // If logged in, redirect away from login/register to their dashboard
    return <Navigate to={user?.role === 'recruiter' ? '/recruiter/dashboard' : '/student/dashboard'} replace />;
  }
  return children;
};

// ProtectedRoute: Pages only authenticated users should see (Dashboards)
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) {
    // If not logged in, force them to login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // If they are logged in but wrong role (e.g. student trying to access recruiter dashboard)
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  const { checkAuth, isLoading } = useAuthStore();
  const location = useLocation();
  const shouldHideNavbar = location.pathname.startsWith('/student') || location.pathname.startsWith('/recruiter');

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-slate-200">
      {!shouldHideNavbar && <Navbar />}
      <main className="flex-1 w-full relative">
        <Routes>
          {/* Public / Landing Pages */}
          <Route path="/" element={<Home />} />

          {/* Auth Pages (Protected from logged-in users) */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          <Route path="/forgot-password" element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          } />

          {/* Dashboard Pages (Protected from logged-out users & strictly role-based) */}
          <Route path="/recruiter/dashboard" element={
            <ProtectedRoute allowedRoles={['recruiter']}>
              <RecruiterDashboard />
            </ProtectedRoute>
          } />

          <Route path="/recruiter/profile" element={
            <ProtectedRoute allowedRoles={['recruiter']}>
              <RecruiterProfile />
            </ProtectedRoute>
          } />

          <Route path="/recruiter/jobs" element={
            <ProtectedRoute allowedRoles={['recruiter']}>
              <ManageJobs />
            </ProtectedRoute>
          } />

          <Route path="/recruiter/jobs/:id/applicants" element={
            <ProtectedRoute allowedRoles={['recruiter']}>
              <JobApplicants />
            </ProtectedRoute>
          } />

          <Route path="/recruiter/jobs/create" element={
            <ProtectedRoute allowedRoles={['recruiter']}>
              <PostJob />
            </ProtectedRoute>
          } />

          <Route path="/recruiter/jobs/edit/:id" element={
            <ProtectedRoute allowedRoles={['recruiter']}>
              <PostJob />
            </ProtectedRoute>
          } />


          <Route path="/recruiter/analytics" element={
            <ProtectedRoute allowedRoles={['recruiter']}>
              <RecruiterAnalytics />
            </ProtectedRoute>
          } />

          <Route path="/recruiter/notifications" element={
            <ProtectedRoute allowedRoles={['recruiter']}>
              <RecruiterNotifications />
            </ProtectedRoute>
          } />

          <Route path="/student/dashboard" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />

          <Route path="/student/profile" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentProfile />
            </ProtectedRoute>
          } />

          <Route path="/student/jobs" element={
            <ProtectedRoute allowedRoles={['student']}>
              <BrowseJobs />
            </ProtectedRoute>
          } />

          <Route path="/student/jobs/:id" element={
            <ProtectedRoute allowedRoles={['student']}>
              <JobDetails />
            </ProtectedRoute>
          } />

          <Route path="/student/apply/:id" element={
            <ProtectedRoute allowedRoles={['student']}>
              <ApplyJob />
            </ProtectedRoute>
          } />

          <Route path="/student/applications" element={
            <ProtectedRoute allowedRoles={['student']}>
              <AppliedJobs />
            </ProtectedRoute>
          } />

          <Route path="/student/saved" element={
            <ProtectedRoute allowedRoles={['student']}>
              <SavedJobs />
            </ProtectedRoute>
          } />

          <Route path="/student/notifications" element={
            <ProtectedRoute allowedRoles={['student']}>
              <Notifications />
            </ProtectedRoute>
          } />

          <Route path="/student/interview/:jobId" element={
            <ProtectedRoute allowedRoles={['student']}>
              <MockInterview />
            </ProtectedRoute>
          } />

          <Route path="/student/interviews" element={
            <ProtectedRoute allowedRoles={['student']}>
              <Interviews />
            </ProtectedRoute>
          } />

        </Routes>
      </main>
    </div>
  );
}

export default App;
