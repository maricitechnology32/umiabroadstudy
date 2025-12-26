

import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, reset } from '../features/auth/authSlice';
import StudentProfile from './student/StudentProfile'; // Import this

// Import Sub-Dashboards
import ConsultancyDashboard from './dashboard/ConsultancyDashboard';
import SuperAdminDashboard from './dashboard/SuperAdminDashboard';

function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get current user from Redux state
  const { user } = useSelector((state) => state.auth);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/');
  };

  // Role-based Content Renderer
  const renderDashboardContent = () => {
    if (!user) return null;

    switch (user.role) {
      case 'super_admin':
        return <SuperAdminDashboard />;

      case 'consultancy_admin':
        return <ConsultancyDashboard />;

      // NEW: Handle Staff Roles (Receptionist / Document Officer)
      // They share the same dashboard UI but with restricted permissions inside
      case 'consultancy_staff':
        return <ConsultancyDashboard />;

      case 'student':
        return <StudentProfile />;

      default:
        return <div className="text-red-500">Error: Role not recognized ({user.role})</div>;
    }
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-secondary-900 dark:text-secondary-50 truncate">
          Welcome back, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-secondary-500 dark:text-secondary-400 text-sm sm:text-base line-clamp-2">
          Here is what's happening with your visa application.
        </p>
      </div>
      {renderDashboardContent()}
    </>
  );
}

export default Dashboard;