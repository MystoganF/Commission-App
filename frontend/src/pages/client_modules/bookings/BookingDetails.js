import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import shared from '../../../styles/shared.module.css';
import styles from './BookingDetails.module.css';
import Modal from '../../../components/ui/Modal';

export default function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for the Image Zoom Lightbox
  const [showFullImage, setShowFullImage] = useState(false);

  useEffect(() => {
    // Fetch bookings and find the specific one matching the ID in the URL
    api.get('/client/bookings')
      .then(res => {
        const found = res.data.find(b => b.id.toString() === id);
        if (found) {
          setBooking(found);
        } else {
          setError("Booking request not found.");
        }
      })
      .catch(() => setError("Failed to load request details."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className={styles.loading}>Loading Request Details...</div>;
  if (error || !booking) return <div className={styles.errorPage}>{error}</div>;

  return (
    <div className={`${shared.pageFade} ${styles.container}`}>
      <button className={styles.backBtn} onClick={() => navigate('/client/my-bookings')}>
        ← Back to My Bookings
      </button>
      
      <div className={styles.layout}>
        {/* ── LEFT SIDE: SUMMARY SIDEBAR ── */}
        <aside className={styles.summarySidebar}>
          <h2 className={styles.summaryTitle}>Booking Summary</h2>
          
          <div className={styles.servicePreview}>
            {booking.serviceSample ? (
              <img src={booking.serviceSample} alt={booking.serviceName} className={styles.previewImg} />
            ) : (
              <div className={styles.noPreview}>No Service Image</div>
            )}
          </div>
          
          <h3 className={styles.serviceName}>{booking.serviceName}</h3>
          
          <p className={styles.artistLink} onClick={() => navigate(`/client/artist/${booking.artistId}`)}>
            Artist: <span>{booking.artistName}</span>
          </p>
          
          <div className={styles.detailsBox}>
            <div className={styles.detailRow}>
              <span>Status</span>
              <span className={`${styles.statusText} ${styles[booking.status.toLowerCase()]}`}>
                {booking.status}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span>Price</span>
              <span className={styles.priceHighlight}>₱ {Number(booking.price).toLocaleString()}</span>
            </div>
            <div className={styles.detailRow}>
              <span>Date</span>
              <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Payment Channels Section */}
          {(booking.gcashNumber || booking.paymayaNumber) && (
            <div className={styles.paymentNotice}>
              <p className={styles.payNoticeTitle}>Artist Payment Channels:</p>
              {booking.gcashNumber && (
                <div className={styles.payMethod}>
                  <strong>GCash:</strong> {booking.gcashNumber} <br/>
                  <small>({booking.gcashName})</small>
                </div>
              )}
              {booking.paymayaNumber && (
                <div className={styles.payMethod}>
                  <strong>Paymaya:</strong> {booking.paymayaNumber} <br/>
                  <small>({booking.paymayaName})</small>
                </div>
              )}
            </div>
          )}
          
          <p className={styles.disclaimer}>
            If accepted, use the channels above to settle payment with the artist.
          </p>
        </aside>

        {/* ── RIGHT SIDE: COMMISSION DETAILS ── */}
        <main className={styles.formMain}>
          <h1 className={styles.formTitle}>Commission Details</h1>
          <p className={styles.formSubtitle}>This is the information you provided in your request.</p>

          <div className={styles.displayForm}>
            <div className={styles.displayGroup}>
              <label className={styles.label}>Project Instructions</label>
              <div className={styles.readOnlyContent}>
                {booking.details}
              </div>
            </div>

            {/* Visual Reference Thumbnail */}
            {booking.referenceImageUrl && (
              <div className={styles.displayGroup}>
                <label className={styles.label}>Visual Reference Provided</label>
                <div 
                  className={styles.referenceImageContainer}
                  onClick={() => setShowFullImage(true)}
                >
                  <img 
                    src={booking.referenceImageUrl} 
                    className={styles.referenceImg} 
                    alt="Reference Submission" 
                  />
                  <div className={styles.imageOverlay}>Click to view full size</div>
                </div>
              </div>
            )}

            <div className={styles.formActions}>
              <button 
                className={styles.backButtonLarge} 
                onClick={() => navigate('/client/my-bookings')}
              >
                Return to My Bookings
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* ── LIGHTBOX MODAL ── */}
      <Modal 
        isOpen={showFullImage} 
        onClose={() => setShowFullImage(false)} 
        title="Visual Reference"
      >
        <div className={styles.fullImageWrapper}>
          <img 
            src={booking.referenceImageUrl} 
            className={styles.fullImage} 
            alt="Reference Full View" 
          />
        </div>
      </Modal>
    </div>
  );
}