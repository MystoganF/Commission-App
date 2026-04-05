import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import shared from '../../../styles/shared.module.css';
import styles from './Bookings.module.css';

// ── CHANGED: Replaced 'DECLINED' with 'CANCELLED' ──
const STATUS_FILTERS = ['ALL', 'PENDING', 'IN_PROGRESS', 'ALMOST_FINISHED', 'COMPLETED', 'CANCELLED'];

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [toast, setToast] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      const res = await api.get('/admin/bookings');
      setBookings(res.data);
    } catch (err) {
      showToast('Failed to sync with server.');
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  // Filter Logic
  const visibleBookings = filter === 'ALL' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  if (loading) return <div className={styles.loading}>Synchronizing...</div>;

  return (
    <div className={`${shared.pageFade} ${styles.page}`}>
      <header className={styles.header}>
        <div className={styles.headerTitleGroup}>
          <span className={styles.label}>Management</span>
          <h1 className={styles.title}>Commission Requests</h1>
        </div>
        <p className={styles.subtitle}>
          Review instructions, verify payments, and update project progress.
        </p>
      </header>

      {/* ── Status Tabs ── */}
      <div className={styles.filterTabs}>
        {STATUS_FILTERS.map(f => (
          <button
            key={f}
            className={`${styles.tabBtn} ${filter === f ? styles.tabActive : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.replace('_', ' ').charAt(0) + f.replace('_', ' ').slice(1).toLowerCase()}
            {f !== 'ALL' && (
              <span className={styles.tabCount}>
                {bookings.filter(b => b.status === f).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Bookings Table ── */}
      {visibleBookings.length === 0 ? (
        <div className={shared.empty}>
          <div className={shared.emptyIcon}>✦</div>
          <p className={shared.emptyText}>No requests found in this category.</p>
        </div>
      ) : (
        <div className={`${shared.card} ${styles.tableWrap}`}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Client</th>
                <th>Service Type</th>
                <th>Payment</th>
                <th>Submission Date</th>
                <th>Progress</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visibleBookings.map((b) => (
                <tr 
                  key={b.id} 
                  className={styles.row} 
                  onClick={() => navigate(`/admin/bookings/${b.id}`)}
                >
                  <td>
                    <div className={styles.clientName}>{b.clientName}</div>
                    <div className={styles.clientEmail}>{b.clientEmail}</div>
                  </td>
                  <td className={styles.serviceCell}>{b.serviceName}</td>
                  <td>
                    <span className={`${styles.paymentBadge} ${styles[b.paymentStatus?.toLowerCase() || 'unpaid']}`}>
                      {(b.paymentStatus || 'UNPAID').replace('_', ' ')}
                    </span>
                  </td>
                  <td className={styles.dateCell}>{formatDate(b.createdAt)}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[b.status?.toLowerCase()]}`}>
                      {b.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className={styles.actionCell}>
                    <span className={styles.viewBtn}>Manage →</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {toast && <div className={shared.toast}>✦ &nbsp;{toast}</div>}
    </div>
  );
}

// ── Helpers ──

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}