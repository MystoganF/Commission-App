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
  const [lightbox, setLightbox] = useState(null);

  const [newPayRef, setNewPayRef] = useState('');
  const [newPayFile, setNewPayFile] = useState(null);
  const [submittingPay, setSubmittingPay] = useState(false);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => { loadData(); }, [id]);

  async function loadData() {
    try {
      const res = await api.get(`/client/bookings/${id}`);
      setBooking(res.data);
    } catch {
      setError("Failed to load booking details.");
    } finally {
      setLoading(false);
    }
  }

  const handleFurtherPayment = async (e) => {
    e.preventDefault();
    if (!newPayFile) return showToast("Please select a proof image.");
    setSubmittingPay(true);
    const formData = new FormData();
    formData.append('referenceId', newPayRef);
    formData.append('file', newPayFile);
    try {
      await api.post(`/client/bookings/${id}/payments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setNewPayRef('');
      setNewPayFile(null);
      loadData();
      showToast("Payment proof uploaded.");
    } catch {
      showToast("Upload failed.");
    } finally {
      setSubmittingPay(false);
    }
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return showToast("Select a star rating.");
    setSubmittingRating(true);
    try {
      await api.post(`/client/bookings/${id}/rate`, { rating, comment });
      showToast("Review submitted!");
      loadData();
    } catch {
      showToast("Rating submission failed.");
    } finally {
      setSubmittingRating(false);
    }
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  if (loading) return <div className={styles.loading}>Synchronizing Details…</div>;
  if (error || !booking) return <div className={styles.errorPage}>{error}</div>;

  const isCompleted = booking.status === 'COMPLETED';

  return (
    <div className={`${shared.pageFade} ${styles.container}`}>

      <button className={styles.backBtn} onClick={() => navigate('/client/my-bookings')}>
        ← Back to My Bookings
      </button>

      <div className={styles.layout}>

        {/* ── Sidebar ── */}
        <aside className={styles.summarySidebar}>
          <h2 className={styles.summaryTitle}>Booking Summary</h2>

          <div className={styles.servicePreview}>
            {booking.serviceSample
              ? <img src={booking.serviceSample} alt="" className={styles.previewImg} />
              : <div className={styles.noPreview}>◻</div>
            }
          </div>

          <div className={styles.serviceName}>{booking.serviceName}</div>
          <div
            className={styles.artistLink}
            onClick={() => navigate(`/client/artist/${booking.artistId}`)}
          >
            by <span>{booking.artistName}</span>
          </div>

          <div className={styles.detailsBox}>
            <div className={styles.detailRow}>
              <span>Status</span>
              <span className={`${styles.statusBadge} ${styles[booking.status.toLowerCase()]}`}>
                {booking.status.replace('_', ' ')}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span>Payment</span>
              <span className={`${styles.statusBadge} ${styles[booking.paymentStatus?.toLowerCase() || 'unpaid']}`}>
                {booking.paymentStatus?.replace('_', ' ') || 'UNPAID'}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span>Total Price</span>
              <span className={styles.priceHighlight}>
                ₱ {Number(booking.price).toLocaleString()}
              </span>
            </div>
          </div>

          {(booking.gcashNumber || booking.paymayaNumber) && (
            <div className={styles.paymentNotice}>
              <p className={styles.payNoticeTitle}>Payment Channels</p>
              {booking.gcashNumber && (
                <div className={styles.payMethod}>
                  <strong>GCash</strong> · {booking.gcashNumber}<br />
                  <small>{booking.gcashName}</small>
                </div>
              )}
              {booking.paymayaNumber && (
                <div className={styles.payMethod}>
                  <strong>Paymaya</strong> · {booking.paymayaNumber}<br />
                  <small>{booking.paymayaName}</small>
                </div>
              )}
            </div>
          )}
        </aside>

        {/* ── Main Content ── */}
        <main className={styles.formMain}>

          {/* Instructions */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h1 className={styles.formTitle}>Instructions & Progress</h1>
            </div>
            <div className={styles.cardBody}>
              <div>
                <div className={styles.label} style={{ marginBottom: 8 }}>Instructions Sent</div>
                <div className={styles.readOnlyContent}>{booking.details}</div>
              </div>

              {booking.referenceImageUrl && (
                <div>
                  <div className={styles.label} style={{ marginBottom: 8 }}>Visual Reference</div>
                  <div className={styles.thumbContainer} onClick={() => setLightbox(booking.referenceImageUrl)}>
                    <img src={booking.referenceImageUrl} className={styles.thumbImg} alt="Ref" />
                    <div className={styles.thumbOverlay}>View Full</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment History */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.subTitle}>Payment Proof History</h2>
            </div>
            <div className={styles.cardBody}>
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
                <p className={styles.emptyMsg}>No payments recorded yet.</p>
              )}

              {booking.paymentStatus !== 'FULLY_PAID' && (
                <div className={styles.innerFormBox}>
                  <div className={styles.formLabel}>Submit Further Payment</div>
                  <form onSubmit={handleFurtherPayment} className={styles.furtherForm}>
                    <div className={styles.field}>
                      <label className={styles.label}>Reference ID</label>
                      <input
                        className={styles.input}
                        placeholder="Ref #"
                        value={newPayRef}
                        onChange={e => setNewPayRef(e.target.value)}
                        required
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Proof Image</label>
                      <div className={styles.fileUploadWrapper}>
                        <div className={styles.filePlaceholder}>
                          {newPayFile ? newPayFile.name : "Select image…"}
                          <span>Browse</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => setNewPayFile(e.target.files[0])}
                          required
                          className={styles.fileInput}
                        />
                      </div>
                    </div>
                    <button className={styles.btn} disabled={submittingPay}>
                      {submittingPay ? 'Processing…' : 'Upload Proof →'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Rating */}
          <div className={`${styles.card} ${!isCompleted ? styles.lockedSection : ''}`}>
            <div className={styles.cardHeader}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.subTitle}>Rate this Commission</h2>
                {!isCompleted && (
                  <span className={styles.lockedBadge}>Unlocked after completion</span>
                )}
              </div>
            </div>

            {booking.rated ? (
              <div className={styles.reviewDisplay}>
                <div className={styles.reviewHeader}>
                  <div className={styles.starRatingDisplay}>
                    {[1,2,3,4,5].map(star => (
                      <span key={star} className={star <= booking.userRating ? styles.starActive : styles.starInactive}>★</span>
                    ))}
                  </div>
                  <span className={styles.reviewDate}>{new Date(booking.reviewDate).toLocaleDateString()}</span>
                </div>
                <p className={styles.savedComment}>"{booking.userComment}"</p>
                <div className={styles.successBadge}>✦ Feedback Submitted</div>
              </div>
            ) : (
              <form onSubmit={handleRatingSubmit} className={styles.ratingForm}>
                <div className={styles.starRating}>
                  {[1,2,3,4,5].map(star => (
                    <span
                      key={star}
                      className={star <= rating ? styles.starActive : styles.starInactive}
                      onClick={() => isCompleted && setRating(star)}
                    >★</span>
                  ))}
                </div>
                <textarea
                  className={styles.textarea}
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  disabled={!isCompleted}
                  placeholder={isCompleted
                    ? "Describe your experience working with this artist…"
                    : "Finish commission to unlock feedback."
                  }
                  required
                />
                <button className={styles.btn} disabled={!isCompleted || rating === 0}>
                  {submittingRating ? 'Submitting…' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>

        </main>
      </div>

      <Modal isOpen={!!lightbox} onClose={() => setLightbox(null)} title="Image Preview">
        <div className={styles.lightboxWrapper}>
          <img src={lightbox} className={styles.lightboxImg} alt="Preview" />
        </div>
      </Modal>

      {toast && <div className={shared.toast}>✦ &nbsp;{toast}</div>}
    </div>
  );
}