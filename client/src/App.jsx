import { useSelector } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import StudentProfile from './pages/student/StudentProfile';
import InquiryForm from './pages/public/InquiryForm';
import LandingPage from './pages/LandingPage';
import AboutUs from './pages/public/AboutUs';
import AboutUsManager from './pages/admin/AboutUsManager';
import DashboardAboutUs from './pages/dashboard/DashboardAboutUs';
import BlogList from './pages/public/BlogList';
import BlogDetail from './pages/public/BlogDetail';
import BlogManager from './pages/admin/BlogManager';
import ContactManager from './pages/admin/ContactManager';
import DashboardBlogList from './pages/dashboard/DashboardBlogList';
import DashboardBlogDetail from './pages/dashboard/DashboardBlogDetail';
import DashboardContact from './pages/dashboard/DashboardContact';
import DashboardCareers from './pages/dashboard/DashboardCareers';
import DashboardCareerDetail from './pages/dashboard/DashboardCareerDetail';
import MyApplications from './pages/dashboard/MyApplications';
import Careers from './pages/public/Careers';
import CareerDetail from './pages/public/CareerDetail';
import Contact from './pages/public/Contact';
import CareersManager from './pages/admin/CareersManager';
import WebsiteManager from './pages/admin/WebsiteManager';
import UniversityManager from './pages/dashboard/UniversityManager';
import HelpSupport from './pages/HelpSupport';
import TermsConditions from './pages/TermsConditions';
import ActiveSessions from './components/security/ActiveSessions'; // Phase 2: Session Management

import Layout from './components/layout/Layout';
import SmartRoute from './components/layout/SmartRoute';
import ScrollToTop from './components/common/ScrollToTop';

const PrivateRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  return user ? <Layout>{children}</Layout> : <Navigate to="/" replace />;
};



function App() {
  return (
    <HelmetProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:resettoken" element={<ResetPassword />} />
          <Route path="/inquiry/:consultancyId" element={<InquiryForm />} />

          {/* Smart Routes - Shows in dashboard for logged-in users, public otherwise */}
          <Route path="/about" element={<SmartRoute><AboutUs /></SmartRoute>} />
          <Route path="/blog" element={<SmartRoute><BlogList /></SmartRoute>} />
          <Route path="/blog/:slug" element={<SmartRoute><BlogDetail /></SmartRoute>} />
          <Route path="/careers" element={<SmartRoute><Careers /></SmartRoute>} />
          <Route path="/careers/:slug" element={<SmartRoute><CareerDetail /></SmartRoute>} />
          <Route path="/contact" element={<SmartRoute dashboardComponent={DashboardContact}><Contact /></SmartRoute>} />
          <Route path="/terms" element={<SmartRoute><TermsConditions /></SmartRoute>} />
          <Route path="/help" element={<SmartRoute><HelpSupport /></SmartRoute>} />

          {/* Main Dashboard */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />



          {/* Admin View of Specific Student Profile */}
          <Route
            path="/dashboard/student/:studentId"
            element={
              <PrivateRoute>
                <StudentProfile />
              </PrivateRoute>
            }
          />






          <Route
            path="/dashboard/my-applications"
            element={
              <PrivateRoute>
                <MyApplications />
              </PrivateRoute>
            }
          />



          {/* About Us Admin Route */}
          <Route
            path="/admin/about-us"
            element={
              <PrivateRoute>
                <AboutUsManager />
              </PrivateRoute>
            }
          />

          {/* Blog Admin Route */}
          <Route
            path="/admin/blog"
            element={
              <PrivateRoute>
                <BlogManager />
              </PrivateRoute>
            }
          />

          {/* Contact Admin Route */}
          <Route
            path="/admin/contact"
            element={
              <PrivateRoute>
                <ContactManager />
              </PrivateRoute>
            }
          />

          {/* Careers Admin Route */}
          <Route
            path="/admin/careers"
            element={
              <PrivateRoute>
                <CareersManager />
              </PrivateRoute>
            }
          />

          {/* University Manager Route */}
          <Route
            path="/admin/universities"
            element={
              <PrivateRoute>
                <UniversityManager />
              </PrivateRoute>
            }
          />

          {/* Website Content Manager */}
          <Route
            path="/admin/website"
            element={
              <PrivateRoute>
                <WebsiteManager />
              </PrivateRoute>
            }
          />

          {/* Phase 2: Active Sessions Management */}
          <Route
            path="/settings/sessions"
            element={
              <PrivateRoute>
                <ActiveSessions />
              </PrivateRoute>
            }
          />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} />
    </HelmetProvider>
  );
}

export default App;