import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import shared from '../../../styles/shared.module.css';
import styles from './Booking.module.css';

export default function BookingForm() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [details, setDetails] = useState('');
  const [references, setReferences] = useState('');
  const [refFile, setRefFile] = useState(null);

  useEffect(() => {
    // Fetch service details including artist payment info
    api.get(`/public/services/${serviceId}`)
      .then(res => setService(res.data))
      .catch(() => {
        setError("Service not found or unavailable.");
        setLoading(false);
      })
      .finally(() => setLoading(false));
  }, [serviceId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!details.trim()) {
      setError("Please provide instructions for the artist.");
      return;
    }

    setSubmitting(true);
    setError('');

    // Use FormData for Multipart Upload
    const formData = new FormData();
    formData.append('serviceId', serviceId);
    formData.append('details', `INSTRUCTIONS:\n${details}\n\nREFERENCES:\n${references || 'None provided'}`);
    
    if (refFile) {
      formData.append('file', refFile);
    }

    try {
      await api.post('/client/bookings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      navigate('/client/my-bookings', { 
        state: { toastMsg: "Commission requested successfully! The artist will review it soon." } 
      });

    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit booking. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading service details...</div>;
  if (!service) return <div className={styles.errorPage}>{error}</div>;

  return (
    <div className={`${shared.pageFade} ${styles.container}`}>
      <button className={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>
      
      <div className={styles.layout}>
        {/* ── LEFT SIDE: SUMMARY ── */}
        <aside className={styles.summarySidebar}>
          <h2 className={styles.summaryTitle}>Booking Summary</h2>
          
          <div className={styles.servicePreview}>
            {service.samples && service.samples.length > 0 ? (
              <img src={service.samples[0]} alt={service.name} className={styles.previewImg} />
            ) : (
              <div className={styles.noPreview}>No Image</div>
            )}
          </div>
          
          <h3 className={styles.serviceName}>{service.name}</h3>
          
          {/* Link to Artist Portfolio */}
          <p 
            className={styles.artistLink} 
            onClick={() => navigate(`/client/artist/${service.artistId}`)}
          >
            Artist: <span>{service.artistName}</span>
          </p>
          
          <div className={styles.detailsBox}>
            <div className={styles.detailRow}>
              <span>Base Price</span>
              <span className={styles.priceHighlight}>₱ {Number(service.price).toLocaleString()}</span>
            </div>
            {service.turnaround && (
              <div className={styles.detailRow}>
                <span>Estimated Delivery</span>
                <span>{service.turnaround}</span>
              </div>
            )}
          </div>

          {/* Payment Info Display */}
          {(service.gcashNumber || service.paymayaNumber) && (
            <div className={styles.paymentNotice}>
              <p className={styles.payNoticeTitle}>Payment Channels:</p>
              {service.gcashNumber && (
                <div className={styles.payMethod}>
                  <strong>GCash:</strong> {service.gcashNumber} <br/>
                  <small>{service.gcashName}</small>
                </div>
              )}
              {service.paymayaNumber && (
                <div className={styles.payMethod}>
                  <strong>Paymaya:</strong> {service.paymayaNumber} <br/>
                  <small>{service.paymayaName}</small>
                </div>
              )}
            </div>
          )}
          
          <p className={styles.disclaimer}>
            Payment is typically handled off-platform. Please coordinate with the artist once they accept your request.
          </p>
        </aside>

        {/* ── RIGHT SIDE: THE FORM ── */}
        <main className={styles.formMain}>
          <h1 className={styles.formTitle}>Commission Details</h1>
          <p className={styles.formSubtitle}>Provide clear instructions and references for the artist.</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Project Instructions <span className={styles.required}>*</span>
              </label>
              <textarea 
                className={styles.textarea} 
                placeholder="Describe poses, colors, character traits, etc."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={6}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Reference Links (Optional)</label>
              <textarea 
                className={styles.textarea} 
                placeholder="Pinterest, Drive, or social media links..."
                value={references}
                onChange={(e) => setReferences(e.target.value)}
                rows={2}
              />
            </div>

            {/* Image Reference Upload */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Upload Reference Image (Optional)</label>
              <div className={styles.fileUploadWrapper}>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setRefFile(e.target.files[0])}
                  className={styles.fileInput}
                />
              </div>
            </div>

            {error && <div className={styles.errorAlert}>{error}</div>}

            <div className={styles.formActions}>
              <button 
                type="submit" 
                className={styles.submitBtn} 
                disabled={submitting}
              >
                {submitting ? 'Sending Request...' : 'Send Commission Request'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}