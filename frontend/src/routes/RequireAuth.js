import { Navigate, Outlet } from 'react-router-dom';

export default function RequireAuth({ allowedRoles }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role'); // Ensure your login/register saves this!

  // If not logged in, send to login page
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // If logged in but wrong role, send them to their respective home
  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === 'CLIENT') {
      return <Navigate to="/client/home" replace />;
    }
    if (role === 'ADMIN' || role === 'ARTIST') {
      return <Navigate to="/admin/overview" replace />;
    }
    // Fallback
    return <Navigate to="/" replace />;
  }

  // If authorized, render the child routes
  return <Outlet />;
}