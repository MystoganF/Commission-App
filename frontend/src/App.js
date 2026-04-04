import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Auth Modules
import Login from './pages/auth_modules/Login';
import Register from './pages/auth_modules/Register';

// Admin Modules (Adjust the import paths if your folder structure is slightly different)
import AdminLayout from './pages/admin_modules/Admin_Layout';
import Overview from './pages/admin_modules/overview/Overview';
import Portfolio from './pages/admin_modules/portfolio/Portfolio';
import Services from './pages/admin_modules/services/Services';
import Bookings from './pages/admin_modules/bookings/Bookings';
import Profile from './pages/admin_modules/profile/Profile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          {/* Automatically redirect /admin to /admin/overview */}
          <Route index element={<Navigate to="overview" replace />} />
          
          {/* Nested Dashboard Pages */}
          <Route path="overview" element={<Overview />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="services" element={<Services />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Future Client View (Referenced in Login.js) */}
        <Route path="/client" element={<div style={{ padding: '2rem', textAlign: 'center' }}>Client View (Coming Soon)</div>} />

        {/* Fallback routing for the /dashboard redirect in Register.js */}
        <Route path="/dashboard" element={<Navigate to="/admin/overview" replace />} />

        {/* Catch-all: Redirect any unknown routes back to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;