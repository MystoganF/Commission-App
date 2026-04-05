import { Navigate, Outlet } from 'react-router-dom';

export default function PublicRoute() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // If already logged in, redirect away from auth pages
  if (token) {
    if (role === 'CLIENT') {
      return <Navigate to="/client/home" replace />;
    }
    if (role === 'ADMIN' || role === 'ARTIST') {
      return <Navigate to="/admin/overview" replace />;
    }
  }

  // If not logged in, allow them to see login/register
  return <Outlet />;
}