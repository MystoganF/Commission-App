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

  if (loading) return <div className={styles.loading}>Synchronizing...</div>;

  return (
    <div className={`${shared.pageFade} ${styles.container}`}>
      <header className={styles.header}>
        <h1 className={styles.title}>My Commissions</h1>
        <p className={styles.subtitle}>Track your requested art pieces and progress.</p>
      </header>

      {bookings.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No active commission requests found.</p>
          <button className={shared.btnPrimary} onClick={() => navigate('/client/explore')}>
            Discover Artists
          </button>
        </div>
      ) : (
        <div className={styles.bookingList}>
          {bookings.map((b) => (
            <div key={b.id} className={styles.bookingCard}>
              
              <div className={styles.serviceImageContainer}>
                {b.serviceSample ? (
                  <img src={b.serviceSample} alt="" className={styles.serviceImage} />
                ) : (
                  <div className={styles.noImagePlaceholder}>No Preview</div>
                )}
              </div>

              <div className={styles.cardMain}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.serviceName}>{b.serviceName}</h3>
                  <span className={`${styles.statusBadge} ${styles[b.status.toLowerCase()]}`}>
                    {b.status.replace('_', ' ')}
                  </span>
                </div>
                
                <div className={styles.cardBody}>
                  <div className={styles.infoGroup}>
                    <label>Artist</label>
                    <span>{b.artistName}</span>
                  </div>
                  <div className={styles.infoGroup}>
                    <label>Price</label>
                    <span className={styles.priceHighlight}>₱ {Number(b.price).toLocaleString()}</span>
                  </div>
                  <div className={styles.infoGroup}>
                    <label>Requested On</label>
                    <span>{new Date(b.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className={styles.cardActions}>
                <button 
                  className={`${shared.btn} ${shared.btnGhost}`}
                  onClick={() => navigate(`/client/bookings/${b.id}`)}
                >
                  Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && <div className={shared.toast}>✦ &nbsp;{toast}</div>}
    </div>
  );
}