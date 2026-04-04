import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Auth Modules
import Login from './pages/auth_modules/Login';
import Register from './pages/auth_modules/Register';

// Admin Modules
import AdminLayout from './pages/admin_modules/Admin_Layout';
import Overview from './pages/admin_modules/overview/Overview';
import Portfolio from './pages/admin_modules/portfolio/Portfolio';
import Bookings from './pages/admin_modules/bookings/Bookings';
import Profile from './pages/admin_modules/profile/Profile';
import ServicesList from './pages/admin_modules/services/ServicesList';
import AddService from './pages/admin_modules/services/AddService';
import ServiceDetail from './pages/admin_modules/services/ServiceDetail';

// Client Modules
import ClientLayout from './pages/client_modules/Client_Layout'; // Added this import
import ClientHome from './pages/client_modules/home/Home';
import ExploreArtists from './pages/client_modules/explore/ExploreArtists';
import ClientServices from './pages/client_modules/services/ClientServices';
import MyBookings from './pages/client_modules/bookings/MyBookings';
import ArtistPortfolioView from './pages/client_modules/explore/ArtistPortfolioView';
import BookingForm from './pages/client_modules/bookings/BookingForm';
import BookingDetails from './pages/client_modules/bookings/BookingDetails';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="profile" element={<Profile />} />
          <Route path="services" element={<ServicesList />} />
          <Route path="services/new" element={<AddService />} />
          <Route path="services/:id" element={<ServiceDetail />} />
        </Route>

        {/* ── CLIENT ROUTES ── */}
        <Route path="/client" element={<ClientLayout />}>
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<ClientHome />} />
          <Route path="explore" element={<ExploreArtists />} />
          <Route path="services" element={<ClientServices />} />
          <Route path="book/:serviceId" element={<BookingForm />} />
          <Route path="my-bookings" element={<MyBookings />} />
          <Route path="bookings/:id" element={<BookingDetails />} />
          <Route path="artist/:id" element={<ArtistPortfolioView />} />
          
        </Route>

        {/* Utility Redirects */}
        <Route path="/dashboard" element={<Navigate to="/admin/overview" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;