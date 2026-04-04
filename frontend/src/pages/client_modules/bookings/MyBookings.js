import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import shared from '../../../styles/shared.module.css';
import styles from './MyBookings.module.css';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.toastMsg) {
      showToast(location.state.toastMsg);
    }
    fetchBookings();
  }, [location]);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/client/bookings');
      setBookings(res.data);
    } catch (err) {
      console.error("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  if (loading) return <div className={styles.loading}>Loading your requests...</div>;

  return (
    <div className={`${shared.pageFade} ${styles.container}`}>
      <header className={styles.header}>
        <h1 className={styles.title}>My Commission Requests</h1>
        <p className={styles.subtitle}>Track your bookings and view progress.</p>
      </header>

      {bookings.length === 0 ? (
        <div className={styles.emptyState}>
          <p>You haven't requested any commissions yet.</p>
          <button className={shared.btnPrimary} onClick={() => navigate('/client/explore')}>Explore Artists</button>
        </div>
      ) : (
        <div className={styles.bookingList}>
          {bookings.map((b) => (
            <div key={b.id} className={styles.bookingCard}>
              <div className={styles.cardMain}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.serviceName}>{b.serviceName}</h3>
                  <span className={`${styles.statusBadge} ${styles[b.status.toLowerCase()]}`}>
                    {b.status}
                  </span>
                </div>
                <p className={styles.artistNameSmall}>Artist: {b.artistName}</p>
              </div>
              <button 
                className={`${shared.btn} ${shared.btnGhost}`}
                onClick={() => navigate(`/client/bookings/${b.id}`)}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}

      {toast && <div className={shared.toast}>✦ &nbsp;{toast}</div>}
    </div>
  );
}