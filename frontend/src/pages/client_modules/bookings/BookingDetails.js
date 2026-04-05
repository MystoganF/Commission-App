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
  
  // Lightbox State (Zoomed image URL)
  const [lightbox, setLightbox] = useState(null); 

  // Further Payment Form State
  const [newPayRef, setNewPayRef] = useState('');
  const [newPayFile, setNewPayFile] = useState(null);
  const [submittingPay, setSubmittingPay] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    try {
      const res = await api.get('/client/bookings');
      const found = res.data.find((b) => b.id.toString() === id);
      if (found) setBooking(found);
      else setError("Booking request not found.");
    } catch {
      setError("Failed to load details. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  const handleFurtherPayment = async (e) => {
    e.preventDefault();
    if (!newPayFile) return alert("Please select a proof image first.");

    setSubmittingPay(true);
    const formData = new FormData();
    formData.append('referenceId', newPayRef);
    formData.append('file', newPayFile);

    try {
      await api.post(`/client/bookings/${id}/payments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Clear form and refresh data
      setNewPayRef('');
      setNewPayFile(null);
      loadData(); 
    } catch {
      alert("Error uploading payment proof. Check your connection.");
    } finally {
      setSubmittingPay(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading Details...</div>;
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
              <div className={styles.noPreview}>No Image</div>
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
              <span>Payment</span>
              <span className={`${styles.statusText} ${styles[booking.paymentStatus?.toLowerCase() || 'unpaid']}`}>
                {booking.paymentStatus || 'UNPAID'}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span>Total Price</span>
              <span className={styles.priceHighlight}>₱ {Number(booking.price).toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Channels Display */}
          {(booking.gcashNumber || booking.paymayaNumber) && (
            <div className={styles.paymentNotice}>
              <p className={styles.payNoticeTitle}>Artist Payment Channels:</p>
              {booking.gcashNumber && (
                <div className={styles.payMethod}>
                  <strong>GCash:</strong> {booking.gcashNumber} <br />
                  <small>({booking.gcashName})</small>
                </div>
              )}
              {booking.paymayaNumber && (
                <div className={styles.payMethod}>
                  <strong>Paymaya:</strong> {booking.paymayaNumber} <br />
                  <small>({booking.paymayaName})</small>
                </div>
              )}
            </div>
          )}
          
          <p className={styles.disclaimer}>
            Status updates will reflect once the artist verifies your proofs.
          </p>
        </aside>

        {/* ── RIGHT SIDE: MAIN CONTENT ── */}
        <main className={styles.formMain}>
          <h1 className={styles.formTitle}>Instructions & Progress</h1>

          {/* Instructions Box */}
          <div className={styles.displayGroup}>
            <label className={styles.label}>Instructions Sent</label>
            <div className={styles.readOnlyContent}>{booking.details}</div>
          </div>

          {/* Clickable Reference Thumbnail */}
          {booking.referenceImageUrl && (
            <div className={styles.displayGroup} style={{ marginTop: '30px' }}>
              <label className={styles.label}>Visual Reference</label>
              <div className={styles.thumbContainer} onClick={() => setLightbox(booking.referenceImageUrl)}>
                <img src={booking.referenceImageUrl} className={styles.thumbImg} alt="Ref" />
                <div className={styles.thumbOverlay}>Click to view full</div>
              </div>
            </div>
          )}

          {/* Payment History Grid */}
          <section className={styles.historySection}>
            <h2 className={styles.subTitle}>Payment Proof History</h2>
            {booking.paymentHistory?.length > 0 ? (
              <div className={styles.historyGrid}>
                {booking.paymentHistory.map((p, i) => (
                  <div key={i} className={styles.historyCard}>
                    <img
                      src={p.proofImageUrl}
                      className={styles.smallThumb}
                      onClick={() => setLightbox(p.proofImageUrl)}
                      alt="Proof"
                    />
                    <div className={styles.historyInfo}>
                      <p>Ref: {p.referenceId || 'N/A'}</p>
                      <small>{new Date(p.submittedAt).toLocaleDateString()}</small>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#555', fontStyle: 'italic', fontSize: '14px' }}>No payments recorded.</p>
            )}
          </section>

          {/* ── REDESIGNED ROBB APP STYLE PAYMENT FORM ── */}
          {booking.paymentStatus !== 'FULLY_PAID' && (
            <div className={styles.furtherPaymentBox}>
              <div className={styles.formHeader}>
                <span className={styles.formLabel}>Payments</span>
                <h2 className={styles.formTitle} style={{ fontSize: '32px' }}>Submit Further Payment</h2>
              </div>

              <form onSubmit={handleFurtherPayment} className={styles.furtherForm}>
                {/* Text Input - Specifically Styled to match the Login and File Wrapper design */}
                <div className={styles.field}>
                  <label className={styles.label}>Reference ID</label>
                  <input
                    className={styles.input}
                    placeholder="Enter GCash or Paymaya Ref #"
                    value={newPayRef}
                    onChange={(e) => setNewPayRef(e.target.value)}
                    required
                  />
                </div>

                {/* Masked File Input */}
                <div className={styles.field}>
                  <label className={styles.label}>Proof of Payment</label>
                  <div className={styles.fileUploadWrapper}>
                    <div className={styles.filePlaceholder}>
                      {newPayFile ? newPayFile.name : "Select proof image..."}
                      <span>Browse</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setNewPayFile(e.target.files[0])}
                      required
                      className={styles.fileInput}
                    />
                  </div>
                </div>

                <button className={styles.btn} disabled={submittingPay}>
                  {submittingPay ? <span className={styles.spinner} /> : 'Upload Proof →'}
                </button>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* Lightbox Modal */}
      <Modal isOpen={!!lightbox} onClose={() => setLightbox(null)} title="Image Preview">
        <div className={styles.lightboxWrapper}>
          <img src={lightbox} className={styles.lightboxImg} alt="Preview" />
        </div>
      </Modal>
    </div>
  );
}