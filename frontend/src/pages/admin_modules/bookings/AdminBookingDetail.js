import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import shared from '../../../styles/shared.module.css';
import styles from './AdminBookingDetail.module.css';
import Modal from '../../../components/ui/Modal';

const BOOKING_STATUSES = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'Work in Progress' },
  { value: 'ALMOST_FINISHED', label: 'Almost Finished' },
  { value: 'COMPLETED', label: 'Finished' },
  { value: 'CANCELLED', label: 'Cancelled' },
 
];

const PAYMENT_STATUSES = [
  { value: 'UNPAID', label: 'Not Paid Yet' },
  { value: 'PARTIALLY_PAID', label: 'Partially Paid' },
  { value: 'FULLY_PAID', label: 'Fully Paid' },
   { value: 'REFUNDED', label: 'Refunded' }
];

export default function AdminBookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  
  // ── ADDED: Toast state ──
  const [toast, setToast] = useState('');

  useEffect(() => { fetchBooking(); }, [id]);

  async function fetchBooking() {
    try {
      const res = await api.get(`/admin/bookings/${id}`);
      setBooking(res.data);
    } catch { 
      navigate('/admin/bookings'); 
    } finally { 
      setLoading(false); 
    }
  }

  // ── ADDED: Toast helper function ──
  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  async function handleUpdate(field, value) {
    setUpdating(true);
    try {
      const endpoint = field === 'status' ? 'status' : 'payment-status';
      const res = await api.patch(`/admin/bookings/${id}/${endpoint}`, { [field]: value });
      setBooking(res.data);
      
      // ── ADDED: Success Toast ──
      showToast('Update saved successfully.');
    } catch {
      // ── REPLACED: Alert with Error Toast ──
      showToast("Failed to update status.");
    } finally { 
      setUpdating(false); 
    }
  }

  if (loading) return <div className={styles.loading}>Fetching Details...</div>;

  return (
    <div className={`${shared.pageFade} ${styles.page}`}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/admin/bookings')}>← All Bookings</button>
        <h1 className={styles.title}>Manage Request <span>#{booking.id}</span></h1>
      </header>

      <div className={styles.layout}>
        {/* ── LEFT: CLIENT & STATUS CONTROLS ── */}
        <aside className={styles.controlsSidebar}>
          <section className={styles.controlGroup}>
            <label className={styles.controlLabel}>Booking Progress</label>
            <select 
              className={styles.select}
              value={booking.status}
              onChange={(e) => handleUpdate('status', e.target.value)}
              disabled={updating}
            >
              {BOOKING_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </section>

          <section className={styles.controlGroup}>
            <label className={styles.controlLabel}>Payment Verification</label>
            <select 
              className={styles.select}
              value={booking.paymentStatus}
              onChange={(e) => handleUpdate('paymentStatus', e.target.value)}
              disabled={updating}
            >
              {PAYMENT_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </section>

          <div className={styles.clientBox}>
            <label className={styles.controlLabel}>Client Information</label>
            <p className={styles.clientName}>{booking.clientName}</p>
            <p className={styles.clientEmail}>{booking.clientEmail}</p>
          </div>
        </aside>

        {/* ── RIGHT: COMMISSION CONTENT ── */}
        <main className={styles.contentMain}>
          <div className={styles.card}>
            <h2 className={styles.sectionTitle}>Commission Instructions</h2>
            <div className={styles.instructionsBox}>{booking.details}</div>
            
            {booking.referenceImageUrl && (
              <div className={styles.referenceGroup}>
                <label className={styles.labelSmall}>Visual Reference</label>
                <div className={styles.thumb} onClick={() => setLightbox(booking.referenceImageUrl)}>
                  <img src={booking.referenceImageUrl} alt="Reference" />
                  <div className={styles.thumbOverlay}>View Full</div>
                </div>
              </div>
            )}
          </div>

          <div className={styles.card}>
            <h2 className={styles.sectionTitle}>Payment Proof History</h2>
            {booking.paymentHistory?.length > 0 ? (
              <div className={styles.paymentGrid}>
                {booking.paymentHistory.map((p, i) => (
                  <div key={i} className={styles.paymentItem}>
                    <img 
                      src={p.proofImageUrl} 
                      className={styles.proofImg} 
                      onClick={() => setLightbox(p.proofImageUrl)} 
                      alt="Proof"
                    />
                    <div className={styles.paymentMeta}>
                      <p><strong>Ref:</strong> {p.referenceId}</p>
                      <small>{new Date(p.submittedAt).toLocaleDateString()}</small>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className={styles.emptyMsg}>No proofs uploaded yet.</p>}
          </div>
        </main>
      </div>

      <Modal isOpen={!!lightbox} onClose={() => setLightbox(null)} title="Image Preview">
        <div className={styles.lightbox}><img src={lightbox} alt="Full view" /></div>
      </Modal>

      {/* ── ADDED: Toast Notification UI ── */}
      {toast && <div className={shared.toast}>✦ &nbsp;{toast}</div>}
    </div>
  );
}